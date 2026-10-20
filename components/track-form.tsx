"use client";

import { FormEvent, useState } from "react";

export function TrackForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: form.get("order"), email: form.get("email") }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; url?: string };
    if (!response.ok || !data.url) {
      setLoading(false);
      setError(data.error || "Order not found.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <label className="field"><span>Order number</span><input name="order" required placeholder="NV-1A2B3C4D" /></label>
      <label className="field"><span>Email used at checkout</span><input name="email" type="email" required /></label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-neon" type="submit" disabled={loading}>{loading ? "Looking…" : "Find my order"}</button>
    </form>
  );
}
