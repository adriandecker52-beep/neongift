import crypto from "crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "nx_admin";
const CUSTOMER_COOKIE = "nx_user";
const ADMIN_TTL = 12 * 60 * 60;
const CUSTOMER_TTL = 30 * 24 * 60 * 60;

function secret() {
  return process.env.SESSION_SECRET || "neonvault-dev-only-session-secret";
}

export function adminEmail() {
  return (process.env.ADMIN_EMAIL || "owner@neonvault.local").toLowerCase();
}

export function adminPasswordIsDefault() {
  return !process.env.ADMIN_PASSWORD;
}

export function checkAdminLogin(email: string, password: string) {
  const expected = process.env.ADMIN_PASSWORD || "change-me-now";
  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return email.trim().toLowerCase() === adminEmail() && crypto.timingSafeEqual(a, b);
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function sealToken(data: Record<string, unknown>, ttlSeconds: number) {
  const payload = Buffer.from(JSON.stringify({ ...data, exp: Date.now() + ttlSeconds * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function openToken<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as T & { exp?: number };
    return typeof data.exp === "number" && Date.now() < data.exp ? data : null;
  } catch {
    return null;
  }
}

function cookieOptions(maxAge: number) {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge };
}

export async function isAdmin() {
  const jar = await cookies();
  return openToken<{ role?: string }>(jar.get(ADMIN_COOKIE)?.value)?.role === "admin";
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sealToken({ role: "admin" }, ADMIN_TTL), cookieOptions(ADMIN_TTL));
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export type Customer = {
  sub: string;
  email: string;
  name: string;
  picture: string;
  provider: "google" | "password";
  emailVerified: boolean;
};

export async function currentCustomer(): Promise<Customer | null> {
  const jar = await cookies();
  const data = openToken<Customer & { role?: string }>(jar.get(CUSTOMER_COOKIE)?.value);
  if (!data || data.role !== "customer" || !data.email) return null;
  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture || "",
    provider: data.provider === "password" ? "password" : "google",
    emailVerified: data.emailVerified === true,
  };
}

export async function setCustomerCookie(customer: Customer) {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, sealToken({ role: "customer", ...customer }, CUSTOMER_TTL), cookieOptions(CUSTOMER_TTL));
}

export async function clearCustomerCookie() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}
