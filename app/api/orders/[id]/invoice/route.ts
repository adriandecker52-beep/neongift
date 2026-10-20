import { NextResponse } from "next/server";
import { canView } from "@/lib/access";
import { readDb } from "@/lib/db";
import { assertCoin, InvoiceError, issueInvoice, reopenForNewInvoice } from "@/lib/invoice";
import { findOrder } from "@/lib/orders";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { k?: string; coin?: string } | null;
  const order = findOrder(readDb(), id);
  if (!canView(order, body?.k)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  try {
    const coin = String(body?.coin || "");
    assertCoin(coin);
    reopenForNewInvoice(id);
    await issueInvoice(id, coin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = error instanceof InvoiceError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Could not create a new invoice.";
    return NextResponse.json({ error: message }, { status });
  }
}
