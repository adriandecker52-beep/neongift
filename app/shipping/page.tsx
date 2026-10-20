import Link from "next/link";
import { FREE_STANDARD_OVER, SHIPPING } from "@/lib/catalog";
import { money } from "@/lib/format";
import { supportEmail } from "@/lib/site";

export const metadata = { title: "Shipping & returns" };

export default function ShippingPage() {
  const email = supportEmail();
  return (
    <div className="wrap section stack prose">
      <div>
        <p className="eyebrow">Policies</p>
        <h1 className="title">Shipping &amp; returns</h1>
      </div>

      <section className="panel stack">
        <h2>Shipping options</h2>
        <div className="stack small" style={{ gap: 8 }}>
          {SHIPPING.map((method) => (
            <div className="row" key={method.id}>
              <span>{method.name} <span className="dim">· {method.eta}</span></span>
              <b>{money(method.price)}</b>
            </div>
          ))}
        </div>
        <p className="small" style={{ margin: 0 }}>
          Standard shipping is free on orders over {money(FREE_STANDARD_OVER)}. Orders ship after the crypto payment is
          confirmed, and the carrier and tracking number appear on your <Link className="link" href="/track">order page</Link>.
        </p>
      </section>

      <section className="panel stack">
        <h2>Packaging</h2>
        <p style={{ margin: 0 }}>
          Every card is a physical retail card shipped sealed in its original packaging. The code is on the back under a
          scratch-off strip. Do not accept a package if the card&apos;s packaging has been opened.
        </p>
      </section>

      <section id="returns" className="panel stack">
        <h2>Returns</h2>
        <ul>
          <li>Unopened cards in their original packaging can be returned within 14 days of delivery.</li>
          <li>Cards with a scratched-off strip or opened packaging cannot be returned, because the code may have been used.</li>
          <li>If a card arrives damaged or the wrong card arrives, contact us within 7 days with your order number and a photo.</li>
          <li>Refunds are sent in crypto to a wallet address you provide, for the USD value of the order at the time of payment.</li>
        </ul>
      </section>

      <p className="small muted">
        Questions? Email <a className="link" href={`mailto:${email}`}>{email}</a> with your order number.
      </p>
    </div>
  );
}
