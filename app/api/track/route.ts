import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { order?: string; email?: string } | null;
  const id = String(body?.order || "").trim().toUpperCase();
  const email = String(body?.email || "").trim().toLowerCase();
  const order = readDb().orders.find((entry) => entry.id === id && entry.email === email);
  if (!order) {
    return NextResponse.json({ error: "No order matches that number and email." }, { status: 404 });
  }
  return NextResponse.json({ url: `/order/${order.id}?k=${order.key}` });
}
