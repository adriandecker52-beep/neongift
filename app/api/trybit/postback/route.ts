import { NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { asNumber } from "@/lib/format";
import { applyInvoiceInfo, applyKind, findByInvoice, findOrder } from "@/lib/orders";
import { kindFromStatus, verifyTrybitToken, type TrybitInvoice } from "@/lib/trybit";

export const runtime = "nodejs";

type Postback = {
  status?: unknown;
  invoice_id?: unknown;
  order_id?: unknown;
  token?: unknown;
  amount_crypto?: unknown;
  invoice_info?: TrybitInvoice;
};

function parseBody(raw: string, contentType: string): Postback | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.startsWith("{") || contentType.includes("json")) return JSON.parse(trimmed) as Postback;
    return Object.fromEntries(new URLSearchParams(trimmed).entries());
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const secret = process.env.TRYBIT_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "TRYBIT_SECRET_KEY is not set." }, { status: 503 });
  }

  const data = parseBody(await request.text(), request.headers.get("content-type") || "");
  if (!data) return NextResponse.json({ error: "Invalid postback body." }, { status: 400 });

  const token = typeof data.token === "string" ? data.token : "";
  if (!token || !verifyTrybitToken(token, secret)) {
    return NextResponse.json({ error: "Invalid token." }, { status: 401 });
  }

  const invoiceId = typeof data.invoice_id === "string" ? data.invoice_id : "";
  const orderId = typeof data.order_id === "string" ? data.order_id : "";

  updateDb((db) => {
    const order = (invoiceId && findByInvoice(db, invoiceId)) || (orderId && findOrder(db, orderId)) || null;
    if (!order) return;
    const info = data.invoice_info && typeof data.invoice_info === "object" ? data.invoice_info : null;
    if (info) {
      applyInvoiceInfo(db, order, info);
      if (kindFromStatus(info.status, info.invoice_status) !== "pending") return;
    }
    const top = String(data.status || "").toLowerCase();
    applyKind(db, order, top === "success" ? "paid" : kindFromStatus(top), asNumber(info?.amount_in_fiat ?? info?.amount_usd));
  });

  return NextResponse.json({ message: "Postback received" });
}
