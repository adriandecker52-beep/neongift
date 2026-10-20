export function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function discount(faceValue: number, price: number) {
  if (!faceValue || faceValue <= price) return 0;
  return Math.round((1 - price / faceValue) * 100);
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
