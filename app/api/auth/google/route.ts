import crypto from "crypto";
import { NextResponse } from "next/server";
import { googleAuthUrl, googleConfigured, newPkce, safeNext } from "@/lib/google";
import { sealToken } from "@/lib/session";
import { appUrl } from "@/lib/trybit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  if (!googleConfigured()) {
    return NextResponse.redirect(new URL(`/login?error=not_configured&next=${encodeURIComponent(next)}`, appUrl()));
  }
  const state = crypto.randomBytes(16).toString("base64url");
  const { verifier, challenge } = newPkce();
  const response = NextResponse.redirect(googleAuthUrl(state, challenge));
  response.cookies.set("nx_oauth", sealToken({ state, verifier, next }, 600), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return response;
}
