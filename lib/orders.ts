import { asNumber } from "./format";
import type { DB, Order } from "./types";
import { bareInvoice, kindFromStatus, paymentFromInvoice, type PaymentKind, type TrybitInvoice } from "./trybit";

export type PublicOrder = Omit<Order, "key" | "stockHeld" | "customerId">;

export function toPublicOrder(order: Order): PublicOrder {
  const { key: _key, stockHeld: _held, customerId: _customer, ...rest } = order;
  return rest;
}

export function findOrder(db: DB, id: string) {
  return db.orders.find((order) => order.id === id) ?? null;
}

export function findByInvoice(db: DB, invoice: string) {
  const bare = bareInvoice(invoice);
  if (!bare) return null;
  return db.orders.find((order) => bareInvoice(order.payment?.invoice) === bare) ?? null;
}

export function isOpen(order: Order) {
  return order.status === "awaiting_payment" || order.status === "partial";
}

export function holdStock(db: DB, order: Order) {
  if (order.stockHeld) return true;
  const product = db.products.find((item) => item.id === order.productId);
  if (!product || product.stock < order.qty) return false;
  product.stock -= order.qty;
  order.stockHeld = true;
  return true;
}

export function releaseStock(db: DB, order: Order) {
  if (!order.stockHeld) return;
  const product = db.products.find((item) => item.id === order.productId);
  if (product) product.stock += order.qty;
  order.stockHeld = false;
}

function markPaid(db: DB, order: Order) {
  if (!isOpen(order) && order.status !== "expired") return;
  if (!order.stockHeld) holdStock(db, order);
  const product = db.products.find((item) => item.id === order.productId);
  if (product) product.sold += order.qty;
  order.status = "paid";
  order.paidAt = new Date().toISOString();
}

export function applyKind(db: DB, order: Order, kind: PaymentKind, fiatPaid: number | null) {
  if (kind === "pending") return;
  if (kind === "paid") {
    if (fiatPaid != null && fiatPaid + 0.05 < order.total) {
      if (order.status === "awaiting_payment") order.status = "partial";
      return;
    }
    markPaid(db, order);
    return;
  }
  if (kind === "partial") {
    if (order.status === "awaiting_payment") order.status = "partial";
    return;
  }
  if (isOpen(order)) {
    releaseStock(db, order);
    order.status = "expired";
  }
}

export function applyInvoiceInfo(db: DB, order: Order, info: TrybitInvoice) {
  if (order.payment) {
    const next = paymentFromInvoice(info, order.payment.coin);
    order.payment = {
      ...order.payment,
      status: next.status,
      address: next.address || order.payment.address,
      amount: next.amount ?? order.payment.amount,
      memo: next.memo || order.payment.memo,
      expiresAt: next.expiresAt || order.payment.expiresAt,
      receivedUsd: next.receivedUsd,
      remaining: next.remaining,
    };
  }
  const fiat = asNumber(info.amount_in_fiat ?? info.amount_usd);
  applyKind(db, order, kindFromStatus(info.status, info.invoice_status), fiat);
}

export function expireIfPastDue(db: DB, order: Order) {
  if (order.status !== "awaiting_payment") return;
  const due = order.payment?.expiresAt ? Date.parse(order.payment.expiresAt) : NaN;
  if (Number.isFinite(due) && Date.now() > due + 15 * 60 * 1000) {
    releaseStock(db, order);
    order.status = "expired";
  }
}
