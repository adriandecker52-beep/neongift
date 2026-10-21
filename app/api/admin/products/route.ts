import { NextResponse } from "next/server";
import { isBrand } from "@/lib/catalog";
import { updateDb } from "@/lib/db";
import { roundMoney } from "@/lib/format";
import { nid } from "@/lib/ids";
import { isAdmin } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in as the store owner." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const brand = String(body?.brand || "");
  const name = String(body?.name || "").trim();
  const region = String(body?.region || "US").trim().slice(0, 20) || "US";
  const faceValue = Number(body?.faceValue);
  const price = Number(body?.price);
  const stock = Number(body?.stock);

  if (!isBrand(brand)) return NextResponse.json({ error: "Choose a brand." }, { status: 400 });
  if (name.length < 3 || name.length > 80) return NextResponse.json({ error: "Name should be 3–80 characters." }, { status: 400 });
  if (!(faceValue > 0 && faceValue <= 2000)) return NextResponse.json({ error: "Face value looks wrong." }, { status: 400 });
  if (!(price >= 1 && price <= 5000)) return NextResponse.json({ error: "Price must be between $1 and $5,000." }, { status: 400 });
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) return NextResponse.json({ error: "Stock must be a whole number." }, { status: 400 });

  const id = await updateDb((db) => {
    const created = {
      id: nid("card"),
      brand,
      name,
      faceValue: roundMoney(faceValue),
      price: roundMoney(price),
      region,
      description: `Physical ${name} card, shipped sealed in its retail packaging. The code is on the back under a scratch-off strip.`,
      stock,
      sold: 0,
      featured: false,
      active: true,
      createdAt: new Date().toISOString(),
    };
    db.products.unshift(created);
    return created.id;
  });
  return NextResponse.json({ id });
}
