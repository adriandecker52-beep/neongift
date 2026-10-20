import type { BrandSlug, ShippingId } from "./catalog";

export type Product = {
  id: string;
  brand: BrandSlug;
  name: string;
  faceValue: number;
  price: number;
  region: string;
  description: string;
  stock: number;
  sold: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
};

export type ShipTo = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  phone: string;
};

export type OrderStatus =
  | "awaiting_payment"
  | "partial"
  | "paid"
  | "shipped"
  | "delivered"
  | "expired"
  | "canceled"
  | "failed";

export type Payment = {
  invoice: string;
  status: string;
  coin: string;
  coinName: string;
  network: string;
  address: string;
  amount: number | null;
  memo: string;
  expiresAt: string | null;
  receivedUsd: number | null;
  remaining: number | null;
};

export type Order = {
  id: string;
  key: string;
  productId: string;
  productName: string;
  brand: BrandSlug;
  region: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
  shippingMethod: ShippingId;
  shippingName: string;
  shippingPrice: number;
  total: number;
  email: string;
  customerId?: string;
  shipTo: ShipTo;
  status: OrderStatus;
  stockHeld: boolean;
  payment: Payment | null;
  carrier: string;
  tracking: string;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};

export type CustomerAccount = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type DB = {
  schema: number;
  products: Product[];
  orders: Order[];
  customers: CustomerAccount[];
};
