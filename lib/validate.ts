import type { ShipTo } from "./types";

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 120;
}

function clean(value: unknown, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export function parseShipTo(input: unknown): { shipTo: ShipTo } | { error: string } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const shipTo: ShipTo = {
    name: clean(raw.name, 80),
    line1: clean(raw.line1, 120),
    line2: clean(raw.line2, 120),
    city: clean(raw.city, 80),
    region: clean(raw.region, 80),
    postal: clean(raw.postal, 20),
    country: clean(raw.country, 60),
    phone: clean(raw.phone, 30),
  };
  if (shipTo.name.length < 2) return { error: "Enter the recipient's full name." };
  if (shipTo.line1.length < 3) return { error: "Enter a street address." };
  if (shipTo.city.length < 2) return { error: "Enter a city." };
  if (shipTo.postal.length < 2) return { error: "Enter a postal code." };
  if (shipTo.country.length < 2) return { error: "Enter a country." };
  return { shipTo };
}
