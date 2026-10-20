"use client";

import { FormEvent, useState } from "react";
import { GiftCard } from "@/components/gift-card";
import { money, roundMoney } from "@/lib/format";

type Coin = { code: string; name: string; network: string };
type Method = { id: string; name: string; eta: string; price: number };

export function CoinPicker({ coins, value, onChange }: { coins: Coin[]; value: string; onChange: (code: string) => void }) {
  return (
    <div className="coins" role="radiogroup" aria-label="Payment coin">
      {coins.map((coin) => (
        <button
          key={coin.code}
          type="button"
          role="radio"
          aria-checked={value === coin.code}
          className={`coin ${value === coin.code ? "on" : ""}`}
          onClick={() => onChange(coin.code)}
        >
          <b>{coin.name}</b>
          <span>{coin.network}</span>
        </button>
      ))}
    </div>
  );
}

export function CheckoutForm({
  product,
  coins,
  shipping,
  freeOver,
  ready,
  customer,
}: {
  product: { id: string; name: string; brand: string; faceValue: number; region: string; price: number; stock: number };
  coins: Coin[];
  shipping: Method[];
  freeOver: number;
  ready: boolean;
  customer: { email: string; name: string } | null;
}) {
  const [qty, setQty] = useState(1);
  const [method, setMethod] = useState(shipping[0]?.id ?? "standard");
  const [coin, setCoin] = useState(coins[0]?.code ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = roundMoney(product.price * qty);
  const chosen = shipping.find((entry) => entry.id === method) ?? shipping[0];
  const shipPrice = chosen.id === "standard" && subtotal >= freeOver ? 0 : chosen.price;
  const total = roundMoney(subtotal + shipPrice);
  const maxQty = Math.min(10, product.stock);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!coin) return setError("Choose a coin.");
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) || "");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        qty,
        email: get("email"),
        shipping: method,
        coin,
        shipTo: {
          name: get("name"),
          line1: get("line1"),
          line2: get("line2"),
          city: get("city"),
          region: get("region"),
          postal: get("postal"),
          country: get("country"),
          phone: get("phone"),
        },
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; orderId?: string; key?: string };
    if (!response.ok || !data.orderId || !data.key) {
      setLoading(false);
      setError(data.error || "Checkout failed. Please try again.");
      return;
    }
    window.location.href = `/order/${data.orderId}?k=${data.key}`;
  }

  if (product.stock < 1) return <div className="warn">This card is sold out.</div>;

  return (
    <form className="split" onSubmit={onSubmit}>
      <div className="stack">
        <section className="panel stack">
          <h2>Contact</h2>
          <label className="field">
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" defaultValue={customer?.email} />
          </label>
          <p className="tiny dim" style={{ margin: 0 }}>
            {customer ? (
              "You're signed in, so this order will appear in your account."
            ) : (
              <>We use this to find your order. <a className="link" href={`/login?next=/checkout/${product.id}`}>Sign in or create an account</a> to keep all your orders in one place.</>
            )}
          </p>
        </section>

        <section className="panel stack">
          <h2>Shipping address</h2>
          <label className="field"><span>Full name</span><input name="name" required autoComplete="name" defaultValue={customer?.name} /></label>
          <label className="field"><span>Street address</span><input name="line1" required autoComplete="address-line1" /></label>
          <label className="field"><span>Apartment, suite (optional)</span><input name="line2" autoComplete="address-line2" /></label>
          <div className="grid-3">
            <label className="field"><span>City</span><input name="city" required autoComplete="address-level2" /></label>
            <label className="field"><span>State / region</span><input name="region" autoComplete="address-level1" /></label>
            <label className="field"><span>Postal code</span><input name="postal" required autoComplete="postal-code" /></label>
          </div>
          <div className="grid-2">
            <label className="field"><span>Country</span><input name="country" required autoComplete="country-name" defaultValue="United States" /></label>
            <label className="field"><span>Phone (for the courier)</span><input name="phone" type="tel" autoComplete="tel" /></label>
          </div>
        </section>

        <section className="panel stack">
          <h2>Delivery</h2>
          <div className="options">
            {shipping.map((entry) => {
              const price = entry.id === "standard" && subtotal >= freeOver ? 0 : entry.price;
              return (
                <label key={entry.id} className={`option ${method === entry.id ? "on" : ""}`}>
                  <input type="radio" name="shipping" checked={method === entry.id} onChange={() => setMethod(entry.id)} />
                  <span className="grow"><b>{entry.name}</b><br /><span className="tiny muted">{entry.eta}</span></span>
                  <b>{price === 0 ? "Free" : money(price)}</b>
                </label>
              );
            })}
          </div>
        </section>

        <section className="panel stack">
          <div className="row">
            <h2>Pay with crypto</h2>
            <span className="secured"><i />Trybit</span>
          </div>
          <CoinPicker coins={coins} value={coin} onChange={setCoin} />
          <p className="tiny dim" style={{ margin: 0 }}>
            Next you will see a wallet address and the exact amount to send in this coin. Use the same network shown here.
          </p>
        </section>
      </div>

      <aside className="panel stack sticky">
        <div style={{ width: 200 }}>
          <GiftCard brand={product.brand} value={product.faceValue} region={product.region} />
        </div>
        <h2 style={{ fontSize: 18 }}>{product.name}</h2>
        <label className="field">
          <span>Quantity</span>
          <select value={qty} onChange={(event) => setQty(Number(event.target.value))}>
            {Array.from({ length: maxQty }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <dl className="kv">
          <dt>Subtotal</dt><dd>{money(subtotal)}</dd>
          <dt>Shipping</dt><dd>{shipPrice === 0 ? "Free" : money(shipPrice)}</dd>
        </dl>
        <hr className="hr" />
        <div className="row"><b>Total</b><span className="price">{money(total)}</span></div>
        {!ready ? (
          <p className="warn">Crypto payments are not connected yet, so orders cannot be placed right now.</p>
        ) : null}
        {error ? <p className="error">{error}</p> : null}
        <button className="btn btn-neon" type="submit" disabled={loading || !ready}>
          {loading ? "Creating your invoice…" : `Pay ${money(total)} in crypto`}
        </button>
        <p className="tiny dim" style={{ margin: 0 }}>The card is held for you for 1 hour while you pay.</p>
      </aside>
    </form>
  );
}
