import { enabledCoins } from "./coins";
import { readDb, updateDb } from "./db";
import { findOrder, holdStock, isOpen, releaseStock } from "./orders";
import { createH2HInvoice, trybitConfigured } from "./trybit";

export class InvoiceError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function assertCoin(coin: string) {
  if (!enabledCoins().some((entry) => entry.code === coin)) {
    throw new InvoiceError("Choose one of the listed coins.");
  }
}

export async function issueInvoice(orderId: string, coin: string) {
  if (!trybitConfigured()) {
    throw new InvoiceError("Crypto payments are not connected yet. Please try again later.", 503);
  }
  assertCoin(coin);

  const order = findOrder(await readDb(), orderId);
  if (!order) throw new InvoiceError("Order not found.", 404);

  try {
    const payment = await createH2HInvoice({
      amount: order.total,
      orderId: order.id,
      email: order.email,
      coin,
    });
    await updateDb((db) => {
      const current = findOrder(db, orderId);
      if (!current) return;
      current.payment = payment;
      if (current.status === "expired" || current.status === "failed") current.status = "awaiting_payment";
    });
  } catch (error) {
    await updateDb((db) => {
      const current = findOrder(db, orderId);
      if (current && (isOpen(current) || current.status === "failed") && !current.payment) {
        releaseStock(db, current);
        current.status = "failed";
      }
    });
    const message = error instanceof Error ? error.message : "Trybit could not create the invoice.";
    throw new InvoiceError(message, 502);
  }
}

export async function reopenForNewInvoice(orderId: string) {
  return updateDb((db) => {
    const order = findOrder(db, orderId);
    if (!order) throw new InvoiceError("Order not found.", 404);
    if (order.status !== "expired" && order.status !== "failed") {
      throw new InvoiceError("This order already has an active invoice.");
    }
    if (!holdStock(db, order)) {
      throw new InvoiceError("That card sold out while the invoice was expired.");
    }
    order.payment = null;
    order.status = "awaiting_payment";
  });
}
