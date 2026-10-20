import crypto from "crypto";
import { coinLabel } from "./coins";
import { asNumber } from "./format";

export type TrybitInvoice = {
  uuid?: string;
  status?: string;
  invoice_status?: string;
  address?: string;
  amount?: unknown;
  amount_usd?: unknown;
  amount_in_fiat?: unknown;
  amount_paid_usd?: unknown;
  received_usd?: unknown;
  to_surcharge?: unknown;
  expiry_date?: string;
  currency?: { code?: string; name?: string; network?: { code?: string; fullname?: string } } | string;
  [key: string]: unknown;
};

function apiBase() {
  return (process.env.TRYBIT_API_URL || "https://api.trybit.com/v2").replace(/\/$/, "");
}

export function trybitConfigured() {
  return Boolean(process.env.TRYBIT_API_KEY && process.env.TRYBIT_SHOP_ID);
}

export function trybitSecretConfigured() {
  return Boolean(process.env.TRYBIT_SECRET_KEY);
}

export function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function errorMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;
  const record = data as Record<string, unknown>;
  for (const key of ["message", "error", "detail", "result"]) {
    const value = record[key];
    if (typeof value === "string" && value) return value;
    if (value && typeof value === "object") {
      const nested = Object.values(value as Record<string, unknown>).flat().find((entry) => typeof entry === "string");
      if (typeof nested === "string") return nested;
    }
  }
  return fallback;
}

async function post(path: string, body: unknown) {
  const response = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.TRYBIT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await response.json().catch(() => null)) as { status?: string; result?: unknown } | null;
  return { response, data };
}

export function parseTrybitDate(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const iso = value.includes("T") ? value : value.replace(" ", "T");
  const withZone = /[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso.slice(0, 23)}Z`;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function findMemo(result: Record<string, unknown>) {
  for (const key of ["memo", "comment", "destination_tag", "tag", "payment_comment"]) {
    const value = result[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

export function paymentFromInvoice(result: TrybitInvoice, requestedCoin: string) {
  const currency = typeof result.currency === "object" && result.currency ? result.currency : null;
  const label = coinLabel(requestedCoin);
  return {
    invoice: result.uuid || "",
    status: result.status || "created",
    coin: requestedCoin,
    coinName: label.name,
    network: currency?.network?.fullname || label.network,
    address: result.address || "",
    amount: asNumber(result.amount),
    memo: findMemo(result),
    expiresAt: parseTrybitDate(result.expiry_date),
    receivedUsd: asNumber(result.received_usd ?? result.amount_paid_usd),
    remaining: asNumber(result.to_surcharge),
  };
}

export async function createH2HInvoice(input: {
  amount: number;
  orderId: string;
  email: string;
  coin: string;
}) {
  const { response, data } = await post("/invoice/create", {
    shop_id: process.env.TRYBIT_SHOP_ID,
    amount: input.amount,
    currency: "USD",
    order_id: input.orderId,
    email: input.email,
    add_fields: {
      cryptocurrency: input.coin,
      time_to_pay: { hours: 1, minutes: 0 },
    },
  });

  if (!response.ok || data?.status !== "success" || !data.result || typeof data.result !== "object") {
    throw new Error(errorMessage(data, `Trybit could not create the invoice (HTTP ${response.status}).`));
  }

  const payment = paymentFromInvoice(data.result as TrybitInvoice, input.coin);
  if (!payment.invoice || !payment.address || payment.amount == null) {
    throw new Error(`Trybit did not return a ${input.coin} address. Check that this coin is enabled in your Trybit project currencies.`);
  }
  return payment;
}

export async function fetchTrybitInvoice(uuid: string): Promise<TrybitInvoice | null> {
  const { response, data } = await post("/invoice/merchant/info", { uuids: [uuid] });
  if (!response.ok || data?.status !== "success") return null;
  return pickInvoice(data.result, uuid);
}

export function pickInvoice(result: unknown, uuid: string): TrybitInvoice | null {
  if (!result) return null;
  if (Array.isArray(result)) {
    const found = result.find((entry) => invoiceMatches(entry, uuid));
    return (found as TrybitInvoice) ?? null;
  }
  if (typeof result !== "object") return null;
  const record = result as Record<string, unknown>;
  if (typeof record.uuid === "string") return invoiceMatches(record, uuid) ? (record as TrybitInvoice) : null;
  for (const value of Object.values(record)) {
    const nested = pickInvoice(value, uuid);
    if (nested) return nested;
  }
  return null;
}

export function bareInvoice(id: string | null | undefined) {
  return String(id || "").replace(/^INV-/i, "").toUpperCase();
}

function invoiceMatches(entry: unknown, uuid: string) {
  if (!entry || typeof entry !== "object") return false;
  return bareInvoice((entry as { uuid?: string }).uuid) === bareInvoice(uuid);
}

export type PaymentKind = "paid" | "partial" | "canceled" | "pending";

export function kindFromStatus(status: unknown, invoiceStatus?: unknown): PaymentKind {
  const value = String(status || "").toLowerCase();
  if (value === "paid" || value === "overpaid") return "paid";
  if (value === "partial") return "partial";
  if (value === "canceled" || value === "cancelled") return "canceled";
  if (String(invoiceStatus || "").toLowerCase() === "success" && value && value !== "created") return "paid";
  return "pending";
}

export function verifyTrybitToken(token: string, secretKey: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [headerPart, payloadPart, signaturePart] = parts;
  try {
    const header = JSON.parse(Buffer.from(headerPart, "base64url").toString()) as { alg?: string };
    if (header.alg !== "HS256") return false;
    const expected = crypto.createHmac("sha256", secretKey).update(`${headerPart}.${payloadPart}`).digest();
    const actual = Buffer.from(signaturePart, "base64url");
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return false;
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString()) as { exp?: number };
    if (typeof payload.exp === "number" && Math.floor(Date.now() / 1000) > payload.exp + 60) return false;
    return true;
  } catch {
    return false;
  }
}
