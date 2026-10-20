"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { CoinPicker } from "@/components/checkout-form";
import { money } from "@/lib/format";
import type { PublicOrder } from "@/lib/orders";

type Coin = { code: string; name: string; network: string };

const STEPS = ["Payment", "Confirmed", "Shipped", "Delivered"];

function progress(status: PublicOrder["status"]) {
  if (status === "delivered") return 4;
  if (status === "shipped") return 2;
  if (status === "paid") return 1;
  return 0;
}

function CopyRow({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="field">
      <span>{label}</span>
      <div className="copy-row">
        <code>{value}</code>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setDone(true);
            window.setTimeout(() => setDone(false), 1200);
          }}
        >
          {done ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function Countdown({ until }: { until: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!until) return null;
  const left = Math.max(0, Date.parse(until) - now);
  const minutes = Math.floor(left / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return (
    <div className="row">
      <span className="muted small">Time left to pay</span>
      <span className={`timer ${left < 5 * 60000 ? "late" : ""}`}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function PaymentBox({ order }: { order: PublicOrder }) {
  const payment = order.payment!;
  const [qr, setQr] = useState("");
  useEffect(() => {
    QRCode.toDataURL(payment.address, { margin: 1, width: 360 }).then(setQr).catch(() => setQr(""));
  }, [payment.address]);

  return (
    <section className="panel stack">
      <div className="row">
        <h2>Send {payment.coinName}</h2>
        <span className="secured"><i />Trybit</span>
      </div>
      {order.status === "partial" ? (
        <p className="warn">
          Trybit received part of the payment.
          {payment.remaining ? ` Send the remaining ${payment.remaining} ${payment.coinName} to the same address.` : " Send the rest to the same address."}
        </p>
      ) : null}
      <div className="pay-grid">
        <div className="qr">{qr ? <img src={qr} alt={`QR code for the ${payment.coinName} address`} /> : null}</div>
        <div className="stack">
          <div>
            <span className="muted small">Exact amount</span>
            <div className="amount-big">{payment.amount} {payment.coinName}</div>
            <span className="tiny dim">≈ {money(order.total)} · Network: {payment.network}</span>
          </div>
          <CopyRow label="Amount" value={String(payment.amount ?? "")} />
        </div>
      </div>
      <CopyRow label={`${payment.coinName} address (${payment.network})`} value={payment.address} />
      {payment.memo ? <CopyRow label="Memo / comment (required)" value={payment.memo} /> : null}
      <Countdown until={payment.expiresAt} />
      <p className="warn tiny" style={{ margin: 0 }}>
        Send only {payment.coinName} on {payment.network}. Wallet, exchange, and network fees are paid on top of this amount.
        If less arrives, the order stays on hold as partially paid.
      </p>
      <p className="tiny dim" style={{ margin: 0 }}>
        This page checks the payment every few seconds. Invoice {payment.invoice}.
      </p>
    </section>
  );
}

function NewInvoice({ order, coins, accessKey }: { order: PublicOrder; coins: Coin[]; accessKey: string }) {
  const [coin, setCoin] = useState(order.payment?.coin || coins[0]?.code || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function renew() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/orders/${order.id}/invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ k: accessKey, coin }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setLoading(false);
      setError(data.error || "Could not create a new invoice.");
      return;
    }
    window.location.reload();
  }

  return (
    <section className="panel stack">
      <h2>{order.status === "failed" ? "Payment could not start" : "This invoice expired"}</h2>
      <p className="muted small" style={{ margin: 0 }}>
        If you already sent crypto to the old address, do not pay again. Contact us with order {order.id} and your transaction ID.
        Otherwise, pick a coin to get a new address.
      </p>
      <CoinPicker coins={coins} value={coin} onChange={setCoin} />
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-neon" type="button" onClick={renew} disabled={loading}>
        {loading ? "Creating invoice…" : "Get a new payment address"}
      </button>
    </section>
  );
}

export function OrderView({ initial, accessKey, coins }: { initial: PublicOrder; accessKey: string; coins: Coin[] }) {
  const [order, setOrder] = useState(initial);
  const open = order.status === "awaiting_payment" || order.status === "partial";
  const step = progress(order.status);

  useEffect(() => {
    if (!open) return;
    let stop = false;
    async function pull() {
      const response = await fetch(`/api/orders/${order.id}?k=${encodeURIComponent(accessKey)}`, { cache: "no-store" });
      if (!response.ok || stop) return;
      const next = (await response.json()) as PublicOrder | null;
      if (next && !stop) setOrder(next);
    }
    const timer = window.setInterval(() => void pull(), 5000);
    void pull();
    return () => {
      stop = true;
      window.clearInterval(timer);
    };
  }, [open, order.id, accessKey]);

  const ship = order.shipTo;
  return (
    <div className="split">
      <div className="stack">
        <section className="panel stack">
          <div className="row">
            <div>
              <p className="eyebrow">Order {order.id}</p>
              <h1 className="title" style={{ fontSize: 28 }}>{order.productName} × {order.qty}</h1>
            </div>
            <span className={`status ${order.status}`}>{order.status.replace("_", " ")}</span>
          </div>
          {order.status !== "canceled" && order.status !== "expired" && order.status !== "failed" ? (
            <div className="timeline">
              {STEPS.map((label, index) => (
                <div key={label} className={index < step ? "done" : index === step ? "now" : ""}>{label}</div>
              ))}
            </div>
          ) : null}
          {order.status === "paid" ? <p className="ok-box">Payment confirmed. We are packing your card and will add tracking here when it ships.</p> : null}
          {order.status === "shipped" ? (
            <p className="ok-box">
              Shipped with {order.carrier}{order.tracking ? <> · tracking <b>{order.tracking}</b></> : null}.
            </p>
          ) : null}
          {order.status === "delivered" ? <p className="ok-box">Delivered. Enjoy the game.</p> : null}
          {order.status === "canceled" ? <p className="error">This order was canceled.</p> : null}
          <p className="tiny dim" style={{ margin: 0 }}>Bookmark this page. It is the only link to your order besides the tracking form.</p>
        </section>

        {open && order.payment ? <PaymentBox order={order} /> : null}
        {(order.status === "expired" || order.status === "failed") ? (
          <NewInvoice order={order} coins={coins} accessKey={accessKey} />
        ) : null}
      </div>

      <aside className="panel stack sticky">
        <h2 style={{ fontSize: 18 }}>Summary</h2>
        <dl className="kv">
          <dt>{order.productName} × {order.qty}</dt><dd>{money(order.subtotal)}</dd>
          <dt>{order.shippingName}</dt><dd>{order.shippingPrice ? money(order.shippingPrice) : "Free"}</dd>
        </dl>
        <hr className="hr" />
        <div className="row"><b>Total</b><span className="price">{money(order.total)}</span></div>
        {order.payment ? (
          <p className="tiny dim" style={{ margin: 0 }}>Paying with {order.payment.coinName} on {order.payment.network}</p>
        ) : null}
        <hr className="hr" />
        <h2 style={{ fontSize: 16 }}>Ship to</h2>
        <p className="small muted" style={{ margin: 0 }}>
          {ship.name}<br />
          {ship.line1}{ship.line2 ? <>, {ship.line2}</> : null}<br />
          {ship.city}{ship.region ? `, ${ship.region}` : ""} {ship.postal}<br />
          {ship.country}
        </p>
        <p className="tiny dim" style={{ margin: 0 }}>{order.email}</p>
      </aside>
    </div>
  );
}
