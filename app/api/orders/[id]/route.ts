import { NextResponse } from "next/server";
import { canView } from "@/lib/access";
import { readDb, updateDb } from "@/lib/db";
import { applyInvoiceInfo, expireIfPastDue, findOrder, isOpen, toPublicOrder } from "@/lib/orders";
import { fetchTrybitInvoice, trybitConfigured } from "@/lib/trybit";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Context) {
  const { id } = await context.params;
  const key = new URL(request.url).searchParams.get("k");
  const existing = findOrder(readDb(), id);
  if (!canView(existing, key)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  if (trybitConfigured() && isOpen(existing) && existing.payment?.invoice) {
    try {
      const info = await fetchTrybitInvoice(existing.payment.invoice);
      updateDb((db) => {
        const order = findOrder(db, id);
        if (!order) return;
        if (info) applyInvoiceInfo(db, order, info);
        expireIfPastDue(db, order);
      });
    } catch (error) {
      console.error("Trybit status check failed:", error instanceof Error ? error.message : error);
    }
  }

  const order = findOrder(readDb(), id);
  return NextResponse.json(order ? toPublicOrder(order) : null);
}
