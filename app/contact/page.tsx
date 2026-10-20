import Link from "next/link";
import { socialLinks, supportEmail } from "@/lib/site";

export const metadata = { title: "Contact us" };

export default function ContactPage() {
  const email = supportEmail();
  const socials = socialLinks().filter((item) => item.external);
  return (
    <div className="wrap section stack prose">
      <div>
        <p className="eyebrow">Support</p>
        <h1 className="title">Contact us</h1>
        <p className="muted">We usually reply within one business day.</p>
      </div>

      <section className="panel stack">
        <h2>Email</h2>
        <p style={{ margin: 0 }}>
          <a className="link" href={`mailto:${email}`}>{email}</a>
        </p>
        <p className="small" style={{ margin: 0 }}>
          For an existing order, include your order number (for example NV-1A2B3C4D). If it is about a payment, also include
          the coin, the network, and the transaction ID.
        </p>
      </section>

      {socials.length > 0 && (
        <section className="panel stack">
          <h2>Community</h2>
          <div className="row" style={{ justifyContent: "flex-start", gap: 16 }}>
            {socials.map((item) => (
              <a key={item.id} className="link" href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
            ))}
          </div>
        </section>
      )}

      <section className="panel stack">
        <h2>Before you write</h2>
        <ul>
          <li><Link className="link" href="/track">Track your order</Link> to see its payment and shipping status.</li>
          <li>Read <Link className="link" href="/how-to-pay">how to pay with crypto</Link> for network and fee tips.</li>
          <li>See <Link className="link" href="/shipping">shipping &amp; returns</Link> for delivery times and the returns policy.</li>
        </ul>
      </section>
    </div>
  );
}
