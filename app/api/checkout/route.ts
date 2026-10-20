import { NextResponse } from "next/server";
import { shippingQuote } from "@/lib/catalog";
import { updateDb } from "@/lib/db";
import { roundMoney } from "@/lib/format";
import { accessKey, orderNumber } from "@/lib/ids";
import { assertCoin, InvoiceError, issueInvoice } from "@/lib/invoice";
import { currentCustomer } from "@/lib/session";
import { trybitConfigured } from "@/lib/trybit";
import type { Order } from "@/lib/types";
import { parseShipTo, validEmail } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!trybitConfigured()) {
    return NextResponse.json({ error: "Crypto payments are not connected yet. Please try again later." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const productId = String(body?.productId || "");
  const email = String(body?.email || "").trim().toLowerCase();
  const qty = Number(body?.qty || 1);
  const coin = String(body?.coin || "");
  const shippingId = String(body?.shipping || "");

  if (!validEmail(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
    return NextResponse.json({ error: "Quantity must be from 1 to 10." }, { status: 400 });
  }
  const address = parseShipTo(body?.shipTo);
  if ("error" in address) return NextResponse.json({ error: address.error }, { status: 400 });
  const customer = await currentCustomer();

  try {
    assertCoin(coin);
    const order = updateDb((db) => {
      const product = db.products.find((item) => item.id === productId && item.active);
      if (!product) throw new InvoiceError("That card is no longer available.");
      if (product.stock < qty) throw new InvoiceError(`Only ${product.stock} left in stock.`);
      const subtotal = roundMoney(product.price * qty);
      const shipping = shippingQuote(shippingId, subtotal);
      if (!shipping) throw new InvoiceError("Choose a shipping method.");

      const created: Order = {
        id: orderNumber(),
        key: accessKey(),
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        region: product.region,
        qty,
        unitPrice: product.price,
        subtotal,
        shippingMethod: shipping.id,
        shippingName: shipping.name,
        shippingPrice: shipping.price,
        total: roundMoney(subtotal + shipping.price),
        email,
        customerId: customer?.sub,
        shipTo: address.shipTo,
        status: "awaiting_payment",
        stockHeld: true,
        payment: null,
        carrier: "",
        tracking: "",
        createdAt: new Date().toISOString(),
        paidAt: null,
        shippedAt: null,
        deliveredAt: null,
      };
      product.stock -= qty;
      db.orders.unshift(created);
      return created;
    });

    await issueInvoice(order.id, coin);
    return NextResponse.json({ orderId: order.id, key: order.key });
  } catch (error) {
    const status = error instanceof InvoiceError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status });
  }
}
