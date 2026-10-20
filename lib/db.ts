import fs from "fs";
import path from "path";
import { brandOf, type BrandSlug } from "./catalog";
import type { DB, Product } from "./types";

const FILE = path.join(process.cwd(), "data", "store.json");
const SCHEMA = 3;

let cache: DB | null = null;

function product(
  id: string,
  brand: BrandSlug,
  name: string,
  faceValue: number,
  price: number,
  stock: number,
  extra: Partial<Product> = {},
): Product {
  return {
    id,
    brand,
    name,
    faceValue,
    price,
    region: "US",
    description: `Physical ${name}, shipped sealed in its retail packaging. ${brandOf(brand).redeem} The code is on the back under a scratch-off strip.`,
    stock,
    sold: 0,
    featured: false,
    active: true,
    createdAt: "2026-10-01T15:00:00.000Z",
    ...extra,
  };
}

function seedProducts(): Product[] {
  return [
    product("psn-10", "playstation", "PlayStation Store Gift Card $10", 10, 10.99, 40, { sold: 88 }),
    product("psn-25", "playstation", "PlayStation Store Gift Card $25", 25, 26.99, 35, { featured: true, sold: 120 }),
    product("psn-50", "playstation", "PlayStation Store Gift Card $50", 50, 52.99, 24, { featured: true, sold: 138 }),
    product("psn-75", "playstation", "PlayStation Store Gift Card $75", 75, 78.99, 10, { sold: 33 }),
    product("psn-100", "playstation", "PlayStation Store Gift Card $100", 100, 104.99, 12, { featured: true, sold: 71 }),
    product("xbox-15", "xbox", "Xbox Gift Card $15", 15, 16.49, 30, { sold: 40 }),
    product("xbox-25", "xbox", "Xbox Gift Card $25", 25, 27.49, 30, { featured: true, sold: 54 }),
    product("xbox-50", "xbox", "Xbox Gift Card $50", 50, 52.99, 18, { featured: true, sold: 96 }),
    product("xbox-100", "xbox", "Xbox Gift Card $100", 100, 104.99, 8, { sold: 29 }),
    product("nintendo-20", "nintendo", "Nintendo eShop Card $20", 20, 21.99, 25, { sold: 51 }),
    product("nintendo-35", "nintendo", "Nintendo eShop Card $35", 35, 37.49, 15, { featured: true, sold: 47 }),
    product("nintendo-50", "nintendo", "Nintendo eShop Card $50", 50, 52.99, 9, { sold: 22 }),
    product("steam-20", "steam", "Steam Wallet Card $20", 20, 21.99, 40, { featured: true, sold: 162 }),
    product("steam-50", "steam", "Steam Wallet Card $50", 50, 52.99, 14, { featured: true, sold: 80 }),
    product("steam-100", "steam", "Steam Wallet Card $100", 100, 104.99, 6, { sold: 31 }),
    product("roblox-10", "roblox", "Roblox Gift Card $10", 10, 10.99, 50, { sold: 144 }),
    product("roblox-25", "roblox", "Roblox Gift Card $25", 25, 27.49, 26, { featured: true, sold: 119 }),
    product("roblox-50", "roblox", "Roblox Gift Card $50", 50, 52.99, 0, { sold: 64 }),
    product("fortnite-25", "fortnite", "Fortnite V-Bucks Card $25", 25, 27.49, 20, { featured: true, sold: 73 }),
    product("fortnite-50", "fortnite", "Fortnite V-Bucks Card $50", 50, 52.99, 10, { sold: 38 }),
    product("valorant-25", "valorant", "VALORANT Gift Card $25", 25, 27.49, 18, { sold: 44 }),
    product("valorant-50", "valorant", "VALORANT Gift Card $50", 50, 52.99, 8, { sold: 17 }),
    product("apple-25", "apple", "Apple Gift Card $25", 25, 27.49, 20, { featured: true, sold: 58 }),
    product("apple-50", "apple", "Apple Gift Card $50", 50, 52.99, 12, { sold: 27 }),
    product("apple-100", "apple", "Apple Gift Card $100", 100, 104.99, 5, { sold: 12 }),
    product("google-25", "google-play", "Google Play Gift Card $25", 25, 27.49, 22, { featured: true, sold: 41 }),
    product("google-50", "google-play", "Google Play Gift Card $50", 50, 52.99, 10, { sold: 19 }),
    product("google-100", "google-play", "Google Play Gift Card $100", 100, 104.99, 4, { sold: 9 }),
  ];
}

function seed(): DB {
  return { schema: SCHEMA, products: seedProducts(), orders: [], customers: [] };
}

function migrateFrom2(db: DB): DB {
  const fresh = new Map(seedProducts().map((item) => [item.id, item]));
  const products = db.products.map((item) => {
    const next = fresh.get(item.id);
    fresh.delete(item.id);
    const untouched = item.description.endsWith("The code is on the back under a scratch-off strip.");
    return next && untouched ? { ...item, name: next.name, description: next.description } : item;
  });
  return { ...db, schema: SCHEMA, products: [...products, ...fresh.values()] };
}

function persist(db: DB) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, FILE);
}

export function readDb(): DB {
  if (cache) return cache;
  if (!fs.existsSync(FILE)) {
    cache = seed();
    persist(cache);
    return cache;
  }
  let parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
  if (parsed?.schema === 2 && Array.isArray(parsed.products)) {
    parsed = migrateFrom2(parsed);
    persist(parsed);
  }
  if (!parsed || parsed.schema !== SCHEMA || !Array.isArray(parsed.products)) {
    throw new Error("Store data is from an older version. Delete data/store.json and restart.");
  }
  if (!Array.isArray(parsed.customers)) parsed.customers = [];
  cache = parsed;
  return cache;
}

export function updateDb<T>(fn: (db: DB) => T): T {
  const db = readDb();
  const result = fn(db);
  cache = db;
  persist(db);
  return result;
}
