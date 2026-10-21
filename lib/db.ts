import fs from "fs";
import path from "path";
import mysql, { type Pool, type PoolConnection, type RowDataPacket } from "mysql2/promise";
import { brandOf, type BrandSlug, type ShippingId } from "./catalog";
import type { CustomerAccount, DB, Order, OrderStatus, Product } from "./types";

const LEGACY_FILE = path.join(process.cwd(), "data", "store.json");

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

const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    seq BIGINT NOT NULL AUTO_INCREMENT UNIQUE,
    brand VARCHAR(32) NOT NULL,
    name VARCHAR(200) NOT NULL,
    face_value DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    region VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    stock INT NOT NULL,
    sold INT NOT NULL,
    featured BOOLEAN NOT NULL,
    active BOOLEAN NOT NULL,
    created_at DATETIME(3) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(40) NOT NULL PRIMARY KEY,
    seq BIGINT NOT NULL AUTO_INCREMENT UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    google_id VARCHAR(64) NOT NULL DEFAULT '',
    created_at DATETIME(3) NOT NULL,
    last_login_at DATETIME(3) NULL,
    KEY idx_customers_google (google_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(40) NOT NULL PRIMARY KEY,
    seq BIGINT NOT NULL AUTO_INCREMENT UNIQUE,
    access_key VARCHAR(100) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    brand VARCHAR(32) NOT NULL,
    region VARCHAR(20) NOT NULL,
    qty INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_method VARCHAR(32) NOT NULL,
    shipping_name VARCHAR(100) NOT NULL,
    shipping_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    email VARCHAR(254) NOT NULL,
    customer_id VARCHAR(100) NULL,
    ship_to JSON NOT NULL,
    status VARCHAR(24) NOT NULL,
    stock_held BOOLEAN NOT NULL,
    payment JSON NULL,
    carrier VARCHAR(40) NOT NULL DEFAULT '',
    tracking VARCHAR(80) NOT NULL DEFAULT '',
    created_at DATETIME(3) NOT NULL,
    paid_at DATETIME(3) NULL,
    shipped_at DATETIME(3) NULL,
    delivered_at DATETIME(3) NULL,
    KEY idx_orders_email (email),
    KEY idx_orders_customer (customer_id),
    KEY idx_orders_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

function toSqlDate(iso: string | null | undefined) {
  return iso ? new Date(iso).toISOString().slice(0, 23).replace("T", " ") : null;
}

function fromSqlDate(value: string | null) {
  return value ? `${value.replace(" ", "T")}Z` : null;
}

function fromJson<T>(value: unknown): T | null {
  if (value == null) return null;
  return (typeof value === "string" ? JSON.parse(value) : value) as T;
}

type Table<T extends { id: string }> = {
  name: string;
  columns: string[];
  order: string;
  toRow: (item: T) => unknown[];
  fromRow: (row: RowDataPacket) => T;
};

const products: Table<Product> = {
  name: "products",
  columns: ["id", "brand", "name", "face_value", "price", "region", "description", "stock", "sold", "featured", "active", "created_at"],
  order: "created_at DESC, seq ASC",
  toRow: (p) => [p.id, p.brand, p.name, p.faceValue, p.price, p.region, p.description, p.stock, p.sold, p.featured, p.active, toSqlDate(p.createdAt)],
  fromRow: (r) => ({
    id: r.id,
    brand: r.brand as BrandSlug,
    name: r.name,
    faceValue: Number(r.face_value),
    price: Number(r.price),
    region: r.region,
    description: r.description,
    stock: Number(r.stock),
    sold: Number(r.sold),
    featured: Boolean(r.featured),
    active: Boolean(r.active),
    createdAt: fromSqlDate(r.created_at) as string,
  }),
};

const customers: Table<CustomerAccount> = {
  name: "customers",
  columns: ["id", "email", "name", "password_hash", "google_id", "created_at", "last_login_at"],
  order: "seq ASC",
  toRow: (c) => [c.id, c.email, c.name, c.passwordHash, c.googleId, toSqlDate(c.createdAt), toSqlDate(c.lastLoginAt)],
  fromRow: (r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    passwordHash: r.password_hash,
    googleId: r.google_id,
    createdAt: fromSqlDate(r.created_at) as string,
    lastLoginAt: fromSqlDate(r.last_login_at),
  }),
};

const orders: Table<Order> = {
  name: "orders",
  columns: [
    "id", "access_key", "product_id", "product_name", "brand", "region", "qty", "unit_price", "subtotal",
    "shipping_method", "shipping_name", "shipping_price", "total", "email", "customer_id", "ship_to", "status",
    "stock_held", "payment", "carrier", "tracking", "created_at", "paid_at", "shipped_at", "delivered_at",
  ],
  order: "created_at DESC, seq DESC",
  toRow: (o) => [
    o.id, o.key, o.productId, o.productName, o.brand, o.region, o.qty, o.unitPrice, o.subtotal,
    o.shippingMethod, o.shippingName, o.shippingPrice, o.total, o.email, o.customerId ?? null,
    JSON.stringify(o.shipTo), o.status, o.stockHeld, o.payment ? JSON.stringify(o.payment) : null,
    o.carrier, o.tracking, toSqlDate(o.createdAt), toSqlDate(o.paidAt), toSqlDate(o.shippedAt), toSqlDate(o.deliveredAt),
  ],
  fromRow: (r) => ({
    id: r.id,
    key: r.access_key,
    productId: r.product_id,
    productName: r.product_name,
    brand: r.brand as BrandSlug,
    region: r.region,
    qty: Number(r.qty),
    unitPrice: Number(r.unit_price),
    subtotal: Number(r.subtotal),
    shippingMethod: r.shipping_method as ShippingId,
    shippingName: r.shipping_name,
    shippingPrice: Number(r.shipping_price),
    total: Number(r.total),
    email: r.email,
    customerId: r.customer_id ?? undefined,
    shipTo: fromJson<Order["shipTo"]>(r.ship_to) as Order["shipTo"],
    status: r.status as OrderStatus,
    stockHeld: Boolean(r.stock_held),
    payment: fromJson<NonNullable<Order["payment"]>>(r.payment),
    carrier: r.carrier,
    tracking: r.tracking,
    createdAt: fromSqlDate(r.created_at) as string,
    paidAt: fromSqlDate(r.paid_at),
    shippedAt: fromSqlDate(r.shipped_at),
    deliveredAt: fromSqlDate(r.delivered_at),
  }),
};

const TABLES = { products, orders, customers } as const;
type Key = keyof typeof TABLES;
const KEYS = Object.keys(TABLES) as Key[];

function tableFor(key: Key) {
  return TABLES[key] as unknown as Table<{ id: string }>;
}

async function saveChanges<T extends { id: string }>(conn: PoolConnection, table: Table<T>, before: T[], after: T[]) {
  const previous = new Map(before.map((item) => [item.id, JSON.stringify(item)]));
  const kept = new Set(after.map((item) => item.id));
  const cols = table.columns;
  const upsert =
    `INSERT INTO ${table.name} (${cols.join(", ")}) VALUES (${cols.map(() => "?").join(", ")}) ` +
    `ON DUPLICATE KEY UPDATE ${cols.slice(1).map((col) => `${col} = VALUES(${col})`).join(", ")}`;

  for (const item of after) {
    if (previous.get(item.id) !== JSON.stringify(item)) await conn.query(upsert, table.toRow(item));
  }
  const removed = before.filter((item) => !kept.has(item.id)).map((item) => item.id);
  if (removed.length) await conn.query(`DELETE FROM ${table.name} WHERE id IN (?)`, [removed]);
}

async function inTransaction(pool: Pool, work: (conn: PoolConnection) => Promise<void>) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await work(conn);
    await conn.commit();
  } catch (error) {
    await conn.rollback().catch(() => {});
    throw error;
  } finally {
    conn.release();
  }
}

type LegacyStore = { schema?: number; products?: Product[]; orders?: Order[]; customers?: Partial<CustomerAccount>[] };

function migrateFrom2(items: Product[]): Product[] {
  const fresh = new Map(seedProducts().map((item) => [item.id, item]));
  const updated = items.map((item) => {
    const next = fresh.get(item.id);
    fresh.delete(item.id);
    const untouched = item.description.endsWith("The code is on the back under a scratch-off strip.");
    return next && untouched ? { ...item, name: next.name, description: next.description } : item;
  });
  return [...updated, ...fresh.values()];
}

function readLegacyStore(): DB | null {
  if (!fs.existsSync(LEGACY_FILE)) return null;
  const parsed = JSON.parse(fs.readFileSync(LEGACY_FILE, "utf8")) as LegacyStore;
  if (!Array.isArray(parsed?.products)) return null;
  return {
    products: parsed.schema === 2 ? migrateFrom2(parsed.products) : parsed.products,
    orders: parsed.orders ?? [],
    customers: (parsed.customers ?? []).map((account) => ({
      passwordHash: "",
      googleId: "",
      lastLoginAt: null,
      ...account,
    })) as CustomerAccount[],
  };
}

async function fillEmptyDatabase(pool: Pool) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT (SELECT COUNT(*) FROM products) + (SELECT COUNT(*) FROM orders) + (SELECT COUNT(*) FROM customers) AS n",
  );
  if (Number(rows[0]?.n) > 0) return;
  const start = readLegacyStore() ?? { products: seedProducts(), orders: [], customers: [] };
  await inTransaction(pool, async (conn) => {
    for (const key of KEYS) await saveChanges(conn, tableFor(key), [], start[key]);
  });
}

async function fetchAll(pool: Pool): Promise<DB> {
  const db = {} as DB;
  for (const key of KEYS) {
    const table = tableFor(key);
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM ${table.name} ORDER BY ${table.order}`);
    (db as Record<Key, unknown[]>)[key] = rows.map(table.fromRow);
  }
  return db;
}

function databaseUrl() {
  const url = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Point it at your MySQL database, e.g. mysql://user:pass@host:3306/neongift");
  return url;
}

type State = { pool: Pool; db: DB };
const globalStore = globalThis as typeof globalThis & { neonState?: Promise<State>; neonQueue?: Promise<unknown> };

async function open(): Promise<State> {
  const pool = mysql.createPool({
    uri: databaseUrl(),
    connectionLimit: 5,
    decimalNumbers: true,
    dateStrings: true,
    timezone: "Z",
  });
  for (const sql of SCHEMA_SQL) await pool.query(sql);
  await fillEmptyDatabase(pool);
  return { pool, db: await fetchAll(pool) };
}

function state() {
  globalStore.neonState ??= open().catch((error) => {
    globalStore.neonState = undefined;
    throw error;
  });
  return globalStore.neonState;
}

/** Snapshot of the store. Treat it as read-only; change data through updateDb. */
export async function readDb(): Promise<DB> {
  return (await state()).db;
}

/**
 * Runs `fn` on a copy of the store, then saves every changed row to MySQL in one transaction.
 * Updates run one at a time, so this assumes a single app instance.
 */
export function updateDb<T>(fn: (db: DB) => T): Promise<T> {
  const run = async () => {
    const current = await state();
    const draft = structuredClone(current.db);
    const result = fn(draft);
    await inTransaction(current.pool, async (conn) => {
      for (const key of KEYS) {
        await saveChanges(conn, tableFor(key), current.db[key], draft[key]);
      }
    });
    current.db = draft;
    return result;
  };
  const next = (globalStore.neonQueue ?? Promise.resolve()).then(run, run);
  globalStore.neonQueue = next.catch(() => {});
  return next;
}
