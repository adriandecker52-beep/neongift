import Link from "next/link";
import { notFound } from "next/navigation";
import { GiftCard } from "@/components/gift-card";
import { StockPill } from "@/components/product-tile";
import { brandOf, FREE_STANDARD_OVER, SHIPPING } from "@/lib/catalog";
import { readDb } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: readDb().products.find((item) => item.id === id)?.name ?? "Card" };
}

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = readDb().products.find((entry) => entry.id === id && entry.active);
  if (!item) notFound();
  const brand = brandOf(item.brand);

  return (
    <div className="wrap section">
      <p className="small muted" style={{ margin: "0 0 16px" }}>
        <Link className="link" href="/shop">Shop</Link> / <Link className="link" href={`/shop?brand=${item.brand}`}>{brand.name}</Link>
      </p>
      <div className="split">
        <div className="stack">
          <div className="panel" style={{ display: "grid", placeItems: "center", padding: "48px 24px" }}>
            <div style={{ width: "min(440px, 100%)" }}>
              <GiftCard brand={item.brand} value={item.faceValue} region={item.region} />
            </div>
          </div>
          <div className="panel stack">
            <h2>About this card</h2>
            <p className="muted" style={{ margin: 0, lineHeight: 1.6 }}>{item.description}</p>
            <dl className="kv">
              <dt>Format</dt><dd>Physical retail card</dd>
              <dt>Region</dt><dd>{item.region}</dd>
              <dt>Face value</dt><dd>{money(item.faceValue)}</dd>
              <dt>Sold</dt><dd>{item.sold}</dd>
            </dl>
          </div>
        </div>
        <aside className="panel stack sticky">
          <p className="eyebrow">{brand.name}</p>
          <h1 className="title" style={{ fontSize: 28 }}>{item.name}</h1>
          <div className="row">
            <span className="price" style={{ fontSize: 34 }}>{money(item.price)}</span>
            <StockPill stock={item.stock} />
          </div>
          <hr className="hr" />
          <div className="stack small" style={{ gap: 6 }}>
            {SHIPPING.map((method) => (
              <div className="row" key={method.id}>
                <span>{method.name} <span className="dim">· {method.eta}</span></span>
                <span>{money(method.price)}</span>
              </div>
            ))}
            <span className="dim tiny">Standard shipping is free on orders over {money(FREE_STANDARD_OVER)}.</span>
          </div>
          {item.stock > 0 ? (
            <Link className="btn btn-neon" href={`/checkout/${item.id}`}>Buy with crypto</Link>
          ) : (
            <button className="btn btn-ghost" disabled>Sold out</button>
          )}
          <p className="note">Payment is crypto only, processed by Trybit. You pay on this site and do not need a Trybit account.</p>
        </aside>
      </div>
    </div>
  );
}
