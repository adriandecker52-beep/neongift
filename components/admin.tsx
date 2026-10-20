"use client";

import { FormEvent, useState } from "react";
import { BRANDS } from "@/lib/catalog";
import { money } from "@/lib/format";
import type { Order, Product } from "@/lib/types";

async function send(url: string, method: string, body: unknown) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || "Request failed.");
}

export function AdminLogin() {
  const [error, setError] = useState("");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await send("/api/admin/login", "POST", { email: form.get("email"), password: form.get("password") });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    }
  }
  return (
    <form className="panel stack" style={{ maxWidth: 420, margin: "0 auto" }} onSubmit={onSubmit}>
      <p className="eyebrow">Owner</p>
      <h1 className="title" style={{ fontSize: 26 }}>Store admin</h1>
      <label className="field"><span>Email</span><input name="email" type="email" required autoComplete="username" /></label>
      <label className="field"><span>Password</span><input name="password" type="password" required autoComplete="current-password" /></label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-neon" type="submit">Sign in</button>
    </form>
  );
}

function ShipForm({ order }: { order: Order }) {
  const [carrier, setCarrier] = useState(order.carrier || "");
  const [tracking, setTracking] = useState(order.tracking || "");
  const [error, setError] = useState("");
  async function act(action: string) {
    setError("");
    try {
      await send(`/api/admin/orders/${order.id}`, "PATCH", { action, carrier, tracking });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    }
  }
  return (
    <div className="stack" style={{ gap: 6, minWidth: 220 }}>
      {order.status === "paid" || order.status === "shipped" ? (
        <>
          <input className="input" placeholder="Carrier (USPS, DHL…)" value={carrier} onChange={(e) => setCarrier(e.target.value)} />
          <input className="input" placeholder="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          <div className="row" style={{ justifyContent: "flex-start" }}>
            <button className="btn btn-cyan btn-sm" type="button" onClick={() => act("ship")}>
              {order.status === "shipped" ? "Update tracking" : "Mark shipped"}
            </button>
            {order.status === "shipped" ? (
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => act("deliver")}>Mark delivered</button>
            ) : null}
          </div>
        </>
      ) : null}
      {["awaiting_payment", "partial", "expired", "failed"].includes(order.status) ? (
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => act("cancel")}>Cancel order</button>
      ) : null}
      {error ? <span className="error tiny">{error}</span> : null}
    </div>
  );
}

export function AdminOrders({ orders }: { orders: Order[] }) {
  if (!orders.length) return <p className="muted">No orders yet.</p>;
  return (
    <table className="table">
      <thead>
        <tr><th>Order</th><th>Card</th><th>Ship to</th><th>Payment</th><th>Status</th><th>Action</th></tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td><b>{order.id}</b><br /><span className="tiny dim">{new Date(order.createdAt).toLocaleString()}</span><br /><span className="tiny muted">{order.email}</span></td>
            <td>{order.productName} × {order.qty}<br /><b>{money(order.total)}</b><br /><span className="tiny dim">{order.shippingName}</span></td>
            <td className="small">
              {order.shipTo.name}<br />{order.shipTo.line1}{order.shipTo.line2 ? `, ${order.shipTo.line2}` : ""}<br />
              {order.shipTo.city}{order.shipTo.region ? `, ${order.shipTo.region}` : ""} {order.shipTo.postal}<br />{order.shipTo.country}
              {order.shipTo.phone ? <><br /><span className="dim">{order.shipTo.phone}</span></> : null}
            </td>
            <td className="small">
              {order.payment ? (
                <>
                  {order.payment.amount} {order.payment.coinName}<br />
                  <span className="dim tiny">{order.payment.network}</span><br />
                  <span className="dim tiny">{order.payment.invoice} · {order.payment.status}</span>
                </>
              ) : <span className="dim">—</span>}
            </td>
            <td><span className={`status ${order.status}`}>{order.status.replace("_", " ")}</span></td>
            <td><ShipForm order={order} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProductRow({ product }: { product: Product }) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock));
  const [msg, setMsg] = useState("");
  async function save(extra: Record<string, unknown> = {}) {
    setMsg("");
    try {
      await send(`/api/admin/products/${product.id}`, "PATCH", { price: Number(price), stock: Number(stock), ...extra });
      if (Object.keys(extra).length) window.location.reload();
      else setMsg("Saved");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    }
  }
  return (
    <tr>
      <td><b>{product.name}</b><br /><span className="tiny dim">{product.region} · sold {product.sold}</span></td>
      <td><input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" /></td>
      <td><input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" /></td>
      <td>
        <div className="row" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
          <button className="btn btn-cyan btn-sm" type="button" onClick={() => save()}>Save</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => save({ featured: !product.featured })}>
            {product.featured ? "Unfeature" : "Feature"}
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => save({ active: !product.active })}>
            {product.active ? "Hide" : "Show"}
          </button>
          {msg ? <span className="tiny muted">{msg}</span> : null}
        </div>
      </td>
    </tr>
  );
}

export function AdminProducts({ products }: { products: Product[] }) {
  const [error, setError] = useState("");
  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await send("/api/admin/products", "POST", {
        brand: form.get("brand"),
        name: form.get("name"),
        region: form.get("region"),
        faceValue: Number(form.get("faceValue")),
        price: Number(form.get("price")),
        stock: Number(form.get("stock")),
      });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    }
  }
  return (
    <div className="stack">
      <table className="table">
        <thead><tr><th>Card</th><th>Price</th><th>Stock</th><th /></tr></thead>
        <tbody>{products.map((product) => <ProductRow key={product.id} product={product} />)}</tbody>
      </table>
      <form className="stack" onSubmit={onCreate}>
        <h3 style={{ margin: "10px 0 0" }}>Add a card</h3>
        <div className="grid-3">
          <label className="field"><span>Brand</span>
            <select name="brand">{BRANDS.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}</select>
          </label>
          <label className="field"><span>Name</span><input name="name" required placeholder="Steam Wallet $100" /></label>
          <label className="field"><span>Region</span><input name="region" defaultValue="US" /></label>
          <label className="field"><span>Face value</span><input name="faceValue" type="number" step="0.01" required /></label>
          <label className="field"><span>Price (USD)</span><input name="price" type="number" step="0.01" required /></label>
          <label className="field"><span>Stock</span><input name="stock" type="number" required defaultValue={0} /></label>
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn btn-neon" type="submit" style={{ justifySelf: "start" }}>Add card</button>
      </form>
    </div>
  );
}
