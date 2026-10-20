import Link from "next/link";
import { ProductTile } from "@/components/product-tile";
import { BRANDS, brandOf, isBrand } from "@/lib/catalog";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const needle = q.toLowerCase();
  const brand = params.brand && isBrand(params.brand) ? params.brand : "";
  const sort = params.sort === "low" || params.sort === "high" ? params.sort : "popular";

  const items = readDb().products.filter((item) => {
    if (!item.active) return false;
    if (brand && item.brand !== brand) return false;
    if (!needle) return true;
    return `${item.name} ${brandOf(item.brand).name}`.toLowerCase().includes(needle);
  });
  items.sort((a, b) => {
    if ((a.stock > 0) !== (b.stock > 0)) return a.stock > 0 ? -1 : 1;
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    return b.sold - a.sold;
  });

  function href(next: { brand?: string; sort?: string }) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    const b = next.brand ?? brand;
    const s = next.sort ?? sort;
    if (b) search.set("brand", b);
    if (s !== "popular") search.set("sort", s);
    const query = search.toString();
    return query ? `/shop?${query}` : "/shop";
  }

  return (
    <div className="wrap section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Physical cards</p>
          <h1 className="title">{brand ? `${brandOf(brand).name} cards` : q ? `Results for “${q}”` : "All gift cards"}</h1>
        </div>
        <span className="muted">{items.length} cards</span>
      </div>
      <div className="chips">
        <Link className={`chip ${brand ? "" : "active"}`} href={href({ brand: "" })}>All</Link>
        {BRANDS.map((entry) => (
          <Link key={entry.slug} className={`chip ${brand === entry.slug ? "active" : ""}`} href={href({ brand: entry.slug })}>
            {entry.name}
          </Link>
        ))}
      </div>
      <div className="chips">
        <Link className={`chip ${sort === "popular" ? "active" : ""}`} href={href({ sort: "popular" })}>Popular</Link>
        <Link className={`chip ${sort === "low" ? "active" : ""}`} href={href({ sort: "low" })}>Price: low to high</Link>
        <Link className={`chip ${sort === "high" ? "active" : ""}`} href={href({ sort: "high" })}>Price: high to low</Link>
      </div>
      {items.length ? (
        <div className="grid-6">{items.map((item) => <ProductTile key={item.id} item={item} />)}</div>
      ) : (
        <div className="panel">No cards match that search. Try a brand name, or clear the filters.</div>
      )}
    </div>
  );
}
