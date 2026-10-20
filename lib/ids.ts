import crypto from "crypto";

export function nid(prefix: string) {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

export function orderNumber() {
  return `NV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export function accessKey() {
  return crypto.randomBytes(18).toString("base64url");
}

export function sameKey(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
