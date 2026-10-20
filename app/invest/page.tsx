import Link from "next/link";
import { STORE_NAME, supportEmail } from "@/lib/site";

export const metadata = { title: `Invest in ${STORE_NAME}` };

export default function InvestPage() {
  const email = supportEmail();
  const subject = encodeURIComponent(`Investment inquiry: ${STORE_NAME}`);
  return (
    <div className="wrap section stack prose">
      <div>
        <p className="eyebrow">Investors</p>
        <h1 className="title">Invest in {STORE_NAME}</h1>
        <p className="muted">
          {STORE_NAME} sells sealed physical gaming gift cards worldwide, paid entirely in crypto. We are open to
          conversations with investors and partners who want to help us grow.
        </p>
      </div>

      <section className="panel stack">
        <h2>What we do</h2>
        <ul>
          <li>Physical retail cards from PlayStation, Xbox, Nintendo, Steam, Roblox, Apple, and Google Play.</li>
          <li>Crypto-only checkout through Trybit, with on-chain confirmation and no card chargebacks.</li>
          <li>Sealed packaging and tracked shipping to customers worldwide.</li>
        </ul>
      </section>

      <section className="panel stack">
        <h2>Get in touch</h2>
        <p style={{ margin: 0 }}>
          Email us with a short introduction, the kind of partnership or investment you have in mind, and how to reach you.
        </p>
        <a className="btn btn-neon" href={`mailto:${email}?subject=${subject}`} style={{ justifySelf: "start" }}>
          Email {email}
        </a>
        <p className="tiny dim" style={{ margin: 0 }}>
          This page is not an offer to sell securities. Any investment is subject to separate written agreements.
        </p>
      </section>

      <Link className="link small" href="/shop">Browse the store →</Link>
    </div>
  );
}
