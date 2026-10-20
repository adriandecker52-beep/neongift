import crypto from "crypto";
import { readDb, updateDb } from "@/lib/db";
import { nid } from "@/lib/ids";
import type { CustomerAccount } from "@/lib/types";
import { validEmail } from "@/lib/validate";

const KEY_LENGTH = 64;
const MIN_PASSWORD = 8;
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;
const DUMMY_HASH = hashPassword("not-a-real-password");

const failures = new Map<string, { count: number; first: number; until: number }>();

export class AccountError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = crypto.scryptSync(password, Buffer.from(salt, "base64url"), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

function checkLock(key: string) {
  const entry = failures.get(key);
  if (entry && entry.until > Date.now()) {
    const minutes = Math.ceil((entry.until - Date.now()) / 60000);
    throw new AccountError(`Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`, 429);
  }
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = failures.get(key);
  const fresh = !entry || now - entry.first > LOCK_MS;
  const count = fresh ? 1 : entry.count + 1;
  failures.set(key, { count, first: fresh ? now : entry.first, until: count >= MAX_FAILURES ? now + LOCK_MS : 0 });
}

export function registerCustomer(input: { name: string; email: string; password: string }): CustomerAccount {
  const name = input.name.replace(/\s+/g, " ").trim().slice(0, 80);
  const email = input.email.trim().toLowerCase();
  if (name.length < 2) throw new AccountError("Enter your name.");
  if (!validEmail(email)) throw new AccountError("Enter a valid email.");
  if (input.password.length < MIN_PASSWORD) throw new AccountError(`Use at least ${MIN_PASSWORD} characters for your password.`);
  if (input.password.length > 200) throw new AccountError("That password is too long.");

  const passwordHash = hashPassword(input.password);
  return updateDb((db) => {
    if (db.customers.some((account) => account.email === email)) {
      throw new AccountError("An account with this email already exists. Sign in instead.", 409);
    }
    const account: CustomerAccount = { id: nid("cus"), email, name, passwordHash, createdAt: new Date().toISOString() };
    db.customers.push(account);
    return account;
  });
}

export function loginCustomer(emailInput: string, password: string): CustomerAccount {
  const email = emailInput.trim().toLowerCase();
  const key = `login:${email}`;
  checkLock(key);
  const account = readDb().customers.find((entry) => entry.email === email);
  const ok = verifyPassword(password, account?.passwordHash ?? DUMMY_HASH) && Boolean(account);
  if (!ok || !account) {
    recordFailure(key);
    throw new AccountError("Wrong email or password.", 401);
  }
  failures.delete(key);
  return account;
}
