import { NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { findOrder, isOpen, releaseStock } from "@/lib/orders";
import { isAdmin } from "@/lib/session";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in as the store owner." }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    carrier?: string;
    tracking?: string;
  } | null;
  const action = String(body?.action || "");

  try {
    await updateDb((db) => {
      const order = findOrder(db, id);
      if (!order) throw new Error("Order not found.");
      if (action === "ship") {
        if (order.status !== "paid" && order.status !== "shipped") throw new Error("Only paid orders can be shipped.");
        const carrier = String(body?.carrier || "").trim().slice(0, 40);
        const tracking = String(body?.tracking || "").trim().slice(0, 80);
        if (!carrier) throw new Error("Enter the carrier.");
        order.carrier = carrier;
        order.tracking = tracking;
        order.status = "shipped";
        order.shippedAt = order.shippedAt ?? new Date().toISOString();
        return;
      }
      if (action === "deliver") {
        if (order.status !== "shipped") throw new Error("Mark the order shipped first.");
        order.status = "delivered";
        order.deliveredAt = new Date().toISOString();
        return;
      }
      if (action === "cancel") {
        if (!isOpen(order) && order.status !== "expired" && order.status !== "failed") {
          throw new Error("Paid orders must be refunded from Trybit before canceling.");
        }
        releaseStock(db, order);
        order.status = "canceled";
        return;
      }
      throw new Error("Unknown action.");
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed." }, { status: 400 });
  }
}
