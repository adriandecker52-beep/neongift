import type { CSSProperties } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { GiftCard } from "@/components/gift-card";
import { ProductTile } from "@/components/product-tile";
import { BRANDS, FREE_STANDARD_OVER } from "@/lib/catalog";
import { readDb } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

function RailHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="rail-head">
      <h2>{title}</h2>
      <Link href={href} aria-label={`See all: ${title}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}

export default function HomePage() {
  const products = readDb().products.filter((item) => item.active);
  const brandRows = BRANDS.map((brand) => {
    const prices = products.filter((item) => item.brand === brand.slug && item.stock > 0).map((item) => item.price);
    return { brand, from: prices.length ? Math.min(...prices) : 0 };
  }).filter((row) => row.from > 0);
  const justForYou = [...products]
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || Number(b.featured) - Number(a.featured) || b.sold - a.sold)
    .slice(0, 12);

  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <div className="wrap">
          <div>
            <span className="kicker">Real cards · Crypto checkout</span>
            <h1 className="display">
              Level up with <span className="grad">physical</span> gaming gift cards.
            </h1>
            <p className="lede">
              Sealed retail cards for PlayStation, Xbox, Nintendo, Steam, and more, shipped to your door.
              Pay with USDT, BTC, ETH, or another coin right on this page.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-neon" href="/shop">Shop cards</Link>
              <Link className="btn btn-ghost" href="/how-to-pay">How crypto checkout works</Link>
            </div>
            <div className="hero-proof">
              <div><b>Sealed</b><span>Retail packaging</span></div>
              <div><b>40+</b><span>Coins and networks via Trybit</span></div>
              <div><b>${FREE_STANDARD_OVER}+</b><span>Free standard shipping</span></div>
            </div>
          </div>
          <div className="hero-stack" aria-hidden="true">
            <GiftCard brand="xbox" value={50} region="US" />
            <GiftCard brand="playstation" value={100} region="US" />
            <GiftCard brand="nintendo" value={35} region="US" />
          </div>
        </div>
      </section>

      <section className="section wrap">
        <RailHead title="Popular gift cards" href="/shop" />
        <div className={`vtiles ${brandRows.length % 3 === 0 ? "is-3" : ""}`}>
          {brandRows.map(({ brand, from }) => (
            <Link key={brand.slug} href={`/shop?brand=${brand.slug}`} className="vtile">
              <span className="vtile-label">{brand.name}</span>
              <div className="vtile-art">
                <span className="vtile-badge">From {money(from)}</span>
                <GiftCard brand={brand.slug} />
              </div>
            </Link>
          ))}
        </div>
        <div className="rail-more"><Link href="/shop">View more ›</Link></div>
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }}>
        <RailHead title="Find your platform" href="/shop" />
        <div className="vtiles">
          {BRANDS.filter((brand) => brand.platform).map((brand) => (
            <Link key={brand.slug} href={`/shop?brand=${brand.slug}`} className="vtile">
              <span className="vtile-label">{brand.name}</span>
              <div className="vtile-art">
                <span
                  className={`platform-tile ${brand.slug === "nintendo" ? "is-wide" : ""}`}
                  style={{ "--from": brand.from, "--to": brand.to } as CSSProperties}
                >
                  <BrandLogo brand={brand.slug} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section wrap" style={{ paddingTop: 0 }}>
        <RailHead title="Just for you" href="/shop" />
        <div className="grid-6">
          {justForYou.map((item) => <ProductTile key={item.id} item={item} />)}
        </div>
        <div className="rail-more"><Link href="/shop">View all {products.length} cards ›</Link></div>
      </section>

      <section id="how-it-works" className="section wrap" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Four steps</p>
            <h2>From checkout to your mailbox</h2>
          </div>
        </div>
        <div className="steps">
          <article className="step"><span className="step-n">01</span><h3>Choose a card</h3><p className="small muted">Pick a brand, value, and quantity, then enter your shipping address.</p></article>
          <article className="step"><span className="step-n">02</span><h3>Pick a coin</h3><p className="small muted">USDT, USDC, BTC, ETH, LTC, TON, SOL, and more. You stay on this site.</p></article>
          <article className="step"><span className="step-n">03</span><h3>Send the exact amount</h3><p className="small muted">Scan the QR code or copy the address. Trybit confirms the payment on-chain.</p></article>
          <article className="step"><span className="step-n">04</span><h3>We ship it</h3><p className="small muted">Your card ships sealed. Tracking appears on your order page.</p></article>
        </div>
      </section>

      <section id="faq" className="section wrap faq" style={{ paddingTop: 0 }}>
        <div className="section-head"><h2>Questions</h2></div>
        <details id="faq-physical" open>
          <summary>Are these digital codes?</summary>
          <p>No. Every card is a physical retail card shipped in its original packaging. The code is on the back under a scratch-off strip.</p>
        </details>
        <details id="faq-pay">
          <summary>How do I pay?</summary>
          <p>Only with crypto, processed by Trybit. At checkout you pick a coin and network, then send the exact amount to the address shown. Payment usually confirms within a few minutes. Bitcoin can take longer.</p>
        </details>
        <details id="faq-short">
          <summary>What if I send too little?</summary>
          <p>Network and exchange fees come out of what you send. If the store receives less than the invoice amount, the order stays on hold as partially paid. Send from a wallet that lets you cover the fee.</p>
        </details>
        <details id="faq-ship">
          <summary>When does my order ship?</summary>
          <p>After the payment is confirmed. You will see the carrier and tracking number on your order page as soon as the card is on its way.</p>
        </details>
      </section>
    </>
  );
}
