"use client";

import { FormEvent, useState } from "react";

export function EmailAuthForm({ next, initialMode = "signin" }: { next: string; initialMode?: "signin" | "signup" }) {
  const [mode, setMode] = useState(initialMode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signup = mode === "signup";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch(signup ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setLoading(false);
      setError(data.error || "Something went wrong. Please try again.");
      return;
    }
    window.location.href = next;
  }

  function switchTo(value: "signin" | "signup") {
    setMode(value);
    setError("");
  }

  return (
    <div className="stack" style={{ gap: 14 }}>
      <div className="auth-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={!signup} className={!signup ? "on" : ""} onClick={() => switchTo("signin")}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={signup} className={signup ? "on" : ""} onClick={() => switchTo("signup")}>
          Create account
        </button>
      </div>
      <form className="stack" style={{ gap: 12 }} onSubmit={onSubmit}>
        {signup ? (
          <label className="field"><span>Name</span><input name="name" required autoComplete="name" maxLength={80} /></label>
        ) : null}
        <label className="field"><span>Email</span><input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={signup ? 8 : undefined}
            autoComplete={signup ? "new-password" : "current-password"}
            placeholder={signup ? "At least 8 characters" : ""}
          />
        </label>
        {error ? <p className="error" style={{ margin: 0 }}>{error}</p> : null}
        <button className="btn btn-neon" type="submit" disabled={loading}>
          {loading ? "Please wait…" : signup ? "Create account" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
