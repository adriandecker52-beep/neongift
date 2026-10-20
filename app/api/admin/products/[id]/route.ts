import { NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { roundMoney } from "@/lib/format";
import { isAdmin } from "@/lib/session";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in as the store owner." }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as {
    price?: number;
    stock?: number;
    active?: boolean;
    featured?: boolean;
  } | null;

  try {
    updateDb((db) => {
      const product = db.products.find((item) => item.id === id);
      if (!product) throw new Error("Card not found.");
      if (body?.price !== undefined) {
        const price = Number(body.price);
        if (!(price >= 1 && price <= 5000)) throw new Error("Price must be between $1 and $5,000.");
        product.price = roundMoney(price);
      }
      if (body?.stock !== undefined) {
        const stock = Number(body.stock);
        if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a whole number.");
        product.stock = stock;
      }
      if (typeof body?.active === "boolean") product.active = body.active;
      if (typeof body?.featured === "boolean") product.featured = body.featured;
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update failed." }, { status: 400 });
  }
}
