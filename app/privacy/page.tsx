import { STORE_NAME, supportEmail } from "@/lib/site";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  const email = supportEmail();
  return (
    <div className="wrap section stack prose">
      <div>
        <p className="eyebrow">Policies</p>
        <h1 className="title">Privacy policy</h1>
      </div>
      <section className="panel stack">
        <h2>What we collect</h2>
        <ul>
          <li>Your email address, to send order updates and to let you look up your order.</li>
          <li>Your shipping name, address, and phone number, to deliver the card.</li>
          <li>Payment details from Trybit: the coin, network, deposit address, and amount received. We never see your wallet keys.</li>
        </ul>
      </section>
      <section className="panel stack">
        <h2>How we use it</h2>
        <p style={{ margin: 0 }}>
          {STORE_NAME} uses this information only to process, ship, and support your order. We share your shipping details
          with the carrier and your order amount and email with Trybit to create the payment invoice. We do not sell your data.
        </p>
      </section>
      <section className="panel stack">
        <h2>Cookies</h2>
        <p style={{ margin: 0 }}>The store does not use tracking cookies. A session cookie is used only for the store owner&apos;s admin login.</p>
      </section>
      <section className="panel stack">
        <h2>Your choices</h2>
        <p style={{ margin: 0 }}>
          To access or delete your order data, email <a className="link" href={`mailto:${email}`}>{email}</a> with your order number.
        </p>
      </section>
    </div>
  );
}
