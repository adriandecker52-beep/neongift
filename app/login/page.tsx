import { redirect } from "next/navigation";
import { EmailAuthForm } from "@/components/email-auth-form";
import { LogoMark } from "@/components/logo";
import { googleConfigured, safeNext } from "@/lib/google";
import { currentCustomer } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  not_configured: "Google sign-in is not set up yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the server settings.",
  denied: "Google sign-in was canceled.",
  expired: "The sign-in attempt expired. Please try again.",
  unverified: "Your Google email address is not verified.",
  failed: "Google sign-in failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const { next, error, mode } = await searchParams;
  const target = safeNext(next);
  if (await currentCustomer()) redirect(target);
  const ready = googleConfigured();
  const message = error ? ERRORS[error] ?? ERRORS.failed : "";

  return (
    <div className="wrap section">
      <div className="panel stack login-card">
        <LogoMark size={64} className="logo-spin" />
        <div style={{ textAlign: "center" }}>
          <h1 className="title" style={{ fontSize: 28 }}>Sign in to Neon Gift</h1>
          <p className="muted small" style={{ margin: "6px 0 0" }}>See all your orders in one place and check out faster.</p>
        </div>
        {message ? <p className="error" style={{ margin: 0 }}>{message}</p> : null}
        <EmailAuthForm next={target} initialMode={mode === "signup" ? "signup" : "signin"} />
        <div className="auth-or"><span>or</span></div>
        <a
          title={ready ? undefined : "Google sign-in is not set up yet"}
          className={`btn btn-google ${ready ? "" : "is-disabled"}`}
          href={ready ? `/api/auth/google?next=${encodeURIComponent(target)}` : undefined}
          aria-disabled={!ready}
        >
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Continue with Google
        </a>
        {!ready ? (
          <p className="tiny dim" style={{ margin: 0, textAlign: "center" }}>
            Google sign-in turns on once GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
          </p>
        ) : null}
        <p className="tiny dim" style={{ margin: 0, textAlign: "center" }}>
          No account needed to buy. You can still check out as a guest and track orders by email.
        </p>
      </div>
    </div>
  );
}
