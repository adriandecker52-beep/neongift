import type { CSSProperties } from "react";
import Link from "next/link";
import { GiftCard } from "@/components/gift-card";
import { brandOf } from "@/lib/catalog";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

export function StockPill({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="pill out">Sold out</span>;
  if (stock <= 5) return <span className="pill low">{stock} left</span>;
  return <span className="pill ok">In stock</span>;
}

export function ProductTile({ item }: { item: Product }) {
  const brand = brandOf(item.brand);
  return (
    <Link href={`/card/${item.id}`} className={`ptile ${item.stock > 0 ? "" : "is-out"}`}>
      <div className="ptile-art" style={{ "--from": brand.from, "--to": brand.to } as CSSProperties}>
        <span className="ptile-strip">{brand.name}</span>
        <GiftCard brand={item.brand} value={item.faceValue} region={item.region} />
      </div>
      <div className="ptile-body">
        <h3>{item.name}</h3>
        <div className="ptile-price">
          <b>{money(item.price)}</b>
          <span>USD</span>
        </div>
        <div className="ptile-meta">
          <span className="tiny dim">{item.sold.toLocaleString("en-US")} sold</span>
          <StockPill stock={item.stock} />
        </div>
      </div>
    </Link>
  );
}
