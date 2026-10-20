import Link from "next/link";
import { enabledCoins } from "@/lib/coins";

export const dynamic = "force-dynamic";
export const metadata = { title: "How to pay with crypto" };

export default function HowToPayPage() {
  const coins = enabledCoins();
  return (
    <div className="wrap section stack">
      <div>
        <p className="eyebrow">Payments</p>
        <h1 className="title">Paying with crypto</h1>
        <p className="muted" style={{ maxWidth: 680, lineHeight: 1.6 }}>
          Neon Gift accepts crypto only. Payments are processed by{" "}
          <a className="link" href="https://trybit.com/about" target="_blank" rel="noreferrer">Trybit</a>,
          a crypto payment provider that screens incoming transactions and confirms payments on-chain.
          You pay on our checkout page and do not need a Trybit account.
        </p>
      </div>

      <div className="steps">
        <article className="step"><span className="step-n">01</span><h3>Pick a coin and network</h3><p className="small muted">Choose the coin you hold. USDT on Tron is usually the cheapest to send.</p></article>
        <article className="step"><span className="step-n">02</span><h3>Scan or copy</h3><p className="small muted">Scan the QR code with your wallet, or copy the address and the exact amount.</p></article>
        <article className="step"><span className="step-n">03</span><h3>Send within 1 hour</h3><p className="small muted">The address is unique to your order and expires after the countdown.</p></article>
        <article className="step"><span className="step-n">04</span><h3>Wait for confirmation</h3><p className="small muted">Most networks confirm in under 5 minutes. Litecoin takes 2–10 minutes, and Bitcoin can take longer.</p></article>
      </div>

      <section className="panel stack">
        <h2>Accepted coins</h2>
        <div className="coins">
          {coins.map((coin) => (
            <div key={coin.code} className="coin"><b>{coin.name}</b><span>{coin.network}</span></div>
          ))}
        </div>
      </section>

      <section className="panel stack">
        <h2>Avoid common mistakes</h2>
        <ul className="muted" style={{ lineHeight: 1.8, margin: 0 }}>
          <li>Send on the same network shown at checkout. Sending USDT on Ethereum to a Tron address can lose the funds.</li>
          <li>Wallet and exchange fees come on top of the amount. If less arrives, the order is held as partially paid until you send the rest.</li>
          <li>For TON payments, include the memo or comment if one is shown.</li>
          <li>If the timer ran out after you paid, do not pay again. Contact us with your order number and transaction ID.</li>
        </ul>
      </section>
      <Link className="btn btn-neon" href="/shop" style={{ justifySelf: "start" }}>Shop cards</Link>
    </div>
  );
}
