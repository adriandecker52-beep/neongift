import Link from "next/link";
import { redirect } from "next/navigation";
import { readDb } from "@/lib/db";
import { money } from "@/lib/format";
import { currentCustomer } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountPage() {
  const customer = await currentCustomer();
  if (!customer) redirect("/login?next=/account");

  const orders = readDb()
    .orders.filter(
      (order) => order.customerId === customer.sub || (customer.emailVerified && order.email.toLowerCase() === customer.email),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="wrap section stack">
      <div className="panel row account-head">
        <div className="row" style={{ justifyContent: "flex-start", gap: 14 }}>
          {customer.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="avatar avatar-lg" src={customer.picture} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="avatar avatar-lg">{customer.name.slice(0, 1).toUpperCase()}</span>
          )}
          <div>
            <h1 className="title" style={{ fontSize: 24 }}>{customer.name}</h1>
            <p className="muted small" style={{ margin: 0 }}>{customer.email}</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="btn btn-ghost btn-sm" type="submit">Sign out</button>
        </form>
      </div>

      <section className="panel stack">
        <div className="row">
          <h2>My orders</h2>
          <Link className="link small" href="/shop">Shop cards →</Link>
        </div>
        {orders.length === 0 ? (
          <p className="muted small" style={{ margin: 0 }}>
            {customer.emailVerified
              ? `No orders for ${customer.email} yet. Orders placed with this email address, including guest orders, show up here.`
              : "No orders yet. Orders you place while signed in show up here. For a guest order, use Track order with its order number."}
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Order</th><th>Card</th><th>Date</th><th>Total</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><b>{order.id}</b></td>
                  <td>{order.productName} × {order.qty}</td>
                  <td className="muted">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>{money(order.total)}</td>
                  <td><span className={`status ${order.status}`}>{order.status.replace("_", " ")}</span></td>
                  <td><Link className="link" href={`/order/${order.id}?k=${order.key}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
