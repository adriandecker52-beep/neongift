import crypto from "crypto";
import { cookies } from "next/headers";
import { exchangeGoogleCode } from "@/lib/google";
import { localRedirect } from "@/lib/redirect";
import { openToken, setCustomerCookie } from "@/lib/session";

export const runtime = "nodejs";

function sameValue(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const saved = openToken<{ state: string; verifier: string; next: string }>(jar.get("nx_oauth")?.value);
  jar.delete({ name: "nx_oauth", path: "/api/auth/google" });

  const fail = (reason: string) => localRedirect(`/login?error=${reason}`);
  if (url.searchParams.get("error")) return fail("denied");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!saved || !code || !state || !sameValue(state, saved.state)) return fail("expired");

  try {
    const profile = await exchangeGoogleCode(code, saved.verifier);
    await setCustomerCookie({ ...profile, sub: `google:${profile.sub}`, provider: "google", emailVerified: true });
  } catch (error) {
    return fail(error instanceof Error && error.message === "email_not_verified" ? "unverified" : "failed");
  }
  return localRedirect(saved.next);
}
