import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { BRANDS } from "@/lib/catalog";
import { enabledCoins } from "@/lib/coins";
import { socialLinks, STORE_NAME, type SocialId } from "@/lib/site";

const COIN_BADGES: Record<string, { symbol: string; bg: string }> = {
  USDT: { symbol: "₮", bg: "#26a17b" },
  USDC: { symbol: "$", bg: "#2775ca" },
  Bitcoin: { symbol: "₿", bg: "#f7931a" },
  Ethereum: { symbol: "Ξ", bg: "#627eea" },
  Litecoin: { symbol: "Ł", bg: "#345d9d" },
  Toncoin: { symbol: "◆", bg: "#0098ea" },
  Solana: { symbol: "◎", bg: "linear-gradient(135deg, #9945ff, #14f195)" },
  Tron: { symbol: "T", bg: "#eb0029" },
  BNB: { symbol: "B", bg: "#f3ba2f" },
};

const SOCIAL_ICONS: Record<SocialId, ReactNode> = {
  x: <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />,
  instagram: <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm5-9.2a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 2c-2.7 0-3 0-4.1.1-1 0-1.8.2-2.4.5-.7.3-1.2.6-1.8 1.2-.6.6-.9 1.1-1.2 1.8-.3.6-.4 1.4-.5 2.4C2 9 2 9.3 2 12s0 3 .1 4.1c0 1 .2 1.8.5 2.4.3.7.6 1.2 1.2 1.8.6.6 1.1.9 1.8 1.2.6.3 1.4.4 2.4.5 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c1 0 1.8-.2 2.4-.5.7-.3 1.2-.6 1.8-1.2.6-.6.9-1.1 1.2-1.8.3-.6.4-1.4.5-2.4.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c0-1-.2-1.8-.5-2.4-.3-.7-.6-1.2-1.2-1.8-.6-.6-1.1-.9-1.8-1.2-.6-.3-1.4-.4-2.4-.5C15 2 14.7 2 12 2Zm0 1.8c2.7 0 3 0 4 .1.9 0 1.5.2 1.8.3.5.2.8.4 1.1.7.4.4.6.7.7 1.1.1.3.3.9.3 1.8.1 1 .1 1.3.1 4s0 3-.1 4c0 .9-.2 1.5-.3 1.8-.2.5-.4.8-.7 1.1-.4.4-.7.6-1.1.7-.3.1-.9.3-1.8.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-.9 0-1.5-.2-1.8-.3-.5-.2-.8-.4-1.1-.7-.4-.4-.6-.7-.7-1.1-.1-.3-.3-.9-.3-1.8-.1-1-.1-1.3-.1-4s0-3 .1-4c0-.9.2-1.5.3-1.8.2-.5.4-.8.7-1.1.4-.4.7-.6 1.1-.7.3-.1.9-.3 1.8-.3 1-.1 1.3-.1 4-.1Z" />,
  discord: <path d="M19.5 5.3A17 17 0 0 0 15.3 4l-.5 1.1a15.7 15.7 0 0 0-5.6 0L8.7 4a17 17 0 0 0-4.2 1.3C1.8 9.3 1.1 13.2 1.4 17a17 17 0 0 0 5.2 2.6l1.1-1.8c-.6-.2-1.2-.5-1.7-.8l.4-.3a12.2 12.2 0 0 0 11.2 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.3-3.1-11.7ZM8.5 14.7c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1Zm7 0c-1 0-1.9-.9-1.9-2.1s.8-2.1 1.9-2.1 1.9.9 1.9 2.1-.8 2.1-1.9 2.1Z" />,
  telegram: <path d="M21.4 3.6 2.9 10.7c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.7c.3-1.3-.5-1.9-1.5-1.4ZM9.5 13.4l9-5.7c.4-.3.8-.1.5.2l-7.7 7-.3 3.2-1.5-4.7Z" />,
};

export function SiteFooter() {
  const coins = Array.from(new Set(enabledCoins().map((coin) => coin.name)));
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="wrap footer-top">
        <div className="footer-community">
          <h4>Join our community</h4>
          <div className="footer-social">
            {socialLinks().map((item) => {
              const icon = <svg viewBox="0 0 24 24" aria-hidden="true">{SOCIAL_ICONS[item.id]}</svg>;
              return item.external ? (
                <a key={item.id} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>{icon}</a>
              ) : (
                <Link key={item.id} href={item.href} aria-label={item.label}>{icon}</Link>
              );
            })}
          </div>
          <div className="footer-badges">
            <a className="footer-badge" href="https://trybit.com/about" target="_blank" rel="noreferrer">
              <i className="dot" />
              <span><small>Payments secured by</small>Trybit</span>
            </a>
            <Link className="footer-badge" href="/shipping">
              <i className="box" />
              <span><small>Sealed physical cards</small>Tracked shipping</span>
            </Link>
          </div>
        </div>

        <nav className="footer-col">
          <h4>Shop</h4>
          {BRANDS.map((brand) => (
            <Link key={brand.slug} href={`/shop?brand=${brand.slug}`}>{brand.name}</Link>
          ))}
        </nav>
        <nav className="footer-col">
          <h4>Buy</h4>
          <Link href="/#how-it-works">How to buy</Link>
          <Link href="/how-to-pay">Pay with crypto</Link>
          <Link href="/shop">All gift cards</Link>
          <Link href="/shipping">Shipping options</Link>
          <Link href="/track">Track an order</Link>
        </nav>
        <nav className="footer-col">
          <h4>FAQ</h4>
          <Link href="/#faq-physical">Are these digital codes?</Link>
          <Link href="/#faq-pay">How do I pay?</Link>
          <Link href="/#faq-short">What if I send too little?</Link>
          <Link href="/#faq-ship">When does my order ship?</Link>
        </nav>
        <nav className="footer-col">
          <h4>Resources</h4>
          <Link href="/how-to-pay">Help center</Link>
          <Link href="/shipping">Shipping &amp; returns</Link>
          <Link href="/shipping#returns">Return Policy</Link>
          <Link href="/contact">Contact us</Link>
          <Link href="/invest">Invest in Neon Gift</Link>
        </nav>
      </div>

      <div className="wrap footer-mid">
        <div className="footer-legal">
          <Link href="/" className="brand">
            <Logo size={34} />
          </Link>
          <div className="footer-legal-links">
            <Link href="/contact">Contact</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/shipping">Returns</Link>
          </div>
          <span className="tiny dim">Copyright © {year} {STORE_NAME}. All rights reserved.</span>
        </div>
        <div className="footer-pay">
          <span className="tiny dim">We accept</span>
          <div className="footer-coins">
            {coins.map((name) => {
              const badge = COIN_BADGES[name] ?? { symbol: name.slice(0, 1), bg: "#3a3f66" };
              return (
                <span key={name} className="footer-coin" title={name}>
                  <i style={{ background: badge.bg }}>{badge.symbol}</i>
                  {name}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="footer-disclaimer">
        <p className="wrap">
          All product names, logos, and brands are property of their respective owners. {STORE_NAME} is an independent
          retailer of physical gift cards and is not affiliated with or endorsed by any card issuer. Company, product, and
          service names are used for identification purposes only. Crypto payments are processed by Trybit.
        </p>
      </div>
    </footer>
  );
}
