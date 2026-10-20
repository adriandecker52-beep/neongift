import Link from "next/link";
import { STORE_NAME, supportEmail } from "@/lib/site";

export const metadata = { title: "Terms of use" };

export default function TermsPage() {
  const email = supportEmail();
  return (
    <div className="wrap section stack prose">
      <div>
        <p className="eyebrow">Policies</p>
        <h1 className="title">Terms of use</h1>
      </div>
      <section className="panel stack">
        <h2>The store</h2>
        <p style={{ margin: 0 }}>
          {STORE_NAME} sells physical gaming gift cards and ships them to the address you provide. We are an independent
          retailer and are not affiliated with any card issuer. Each card is subject to its issuer&apos;s own terms, including
          region locks.
        </p>
      </section>
      <section className="panel stack">
        <h2>Orders and payment</h2>
        <ul>
          <li>Prices are in US dollars. Payment is accepted in crypto only and is processed by Trybit.</li>
          <li>An order is confirmed only when the full invoice amount is received. Underpaid orders are held until the balance is paid.</li>
          <li>Invoices expire after the countdown shown at checkout. Do not send funds to an expired invoice.</li>
          <li>Sending the wrong coin, the wrong network, or omitting a required memo can result in lost funds that we cannot recover.</li>
        </ul>
      </section>
      <section className="panel stack">
        <h2>Shipping, returns, and cancellations</h2>
        <p style={{ margin: 0 }}>
          Delivery times, returns, and refunds are described on the <Link className="link" href="/shipping">shipping &amp; returns</Link> page.
          We may cancel an order that cannot be fulfilled and refund the amount received.
        </p>
      </section>
      <section className="panel stack">
        <h2>Contact</h2>
        <p style={{ margin: 0 }}>Questions about these terms: <a className="link" href={`mailto:${email}`}>{email}</a>.</p>
      </section>
    </div>
  );
}
