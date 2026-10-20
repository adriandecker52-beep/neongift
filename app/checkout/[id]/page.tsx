import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { SHIPPING, FREE_STANDARD_OVER } from "@/lib/catalog";
import { enabledCoins } from "@/lib/coins";
import { readDb } from "@/lib/db";
import { currentCustomer } from "@/lib/session";
import { trybitConfigured } from "@/lib/trybit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = readDb().products.find((entry) => entry.id === id && entry.active);
  if (!item) notFound();
  const customer = await currentCustomer();

  return (
    <div className="wrap section">
      <p className="eyebrow">Secure checkout</p>
      <h1 className="title" style={{ marginBottom: 22 }}>Ship it to me</h1>
      <CheckoutForm
        product={{ id: item.id, name: item.name, brand: item.brand, faceValue: item.faceValue, region: item.region, price: item.price, stock: item.stock }}
        coins={enabledCoins()}
        shipping={SHIPPING.map((method) => ({ ...method }))}
        freeOver={FREE_STANDARD_OVER}
        ready={trybitConfigured()}
        customer={customer ? { email: customer.email, name: customer.name } : null}
      />
    </div>
  );
}
