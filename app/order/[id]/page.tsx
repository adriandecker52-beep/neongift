import Link from "next/link";
import { OrderView } from "@/components/order-view";
import { canView } from "@/lib/access";
import { enabledCoins } from "@/lib/coins";
import { readDb } from "@/lib/db";
import { findOrder, toPublicOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { id } = await params;
  const { k } = await searchParams;
  const order = findOrder(readDb(), id);

  if (!canView(order, k)) {
    return (
      <div className="wrap section">
        <div className="panel stack" style={{ maxWidth: 520 }}>
          <h1 className="title" style={{ fontSize: 26 }}>Order not found</h1>
          <p className="muted">Open the link from checkout, or look the order up with its number and your email.</p>
          <Link className="btn btn-neon" href="/track">Track an order</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap section">
      <OrderView initial={toPublicOrder(order)} accessKey={k!} coins={enabledCoins()} />
    </div>
  );
}
