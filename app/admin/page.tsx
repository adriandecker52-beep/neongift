import { AdminLogin, AdminOrders, AdminProducts } from "@/components/admin";
import { enabledCoins } from "@/lib/coins";
import { readDb } from "@/lib/db";
import { money } from "@/lib/format";
import { adminPasswordIsDefault, isAdmin } from "@/lib/session";
import { appUrl, trybitConfigured, trybitSecretConfigured } from "@/lib/trybit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  if (!(await isAdmin())) {
    return (
      <div className="wrap section">
        <AdminLogin />
      </div>
    );
  }

  const { show } = await searchParams;
  const db = readDb();
  const toShip = db.orders.filter((order) => order.status === "paid");
  const visible = show === "all" ? db.orders : db.orders.filter((order) => !["expired", "canceled", "failed"].includes(order.status));
  const revenue = db.orders
    .filter((order) => ["paid", "shipped", "delivered"].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0);
  const origin = appUrl();
  const live = trybitConfigured();
  const secret = trybitSecretConfigured();

  return (
    <div className="wrap section stack">
      <div className="row">
        <div>
          <p className="eyebrow">Owner</p>
          <h1 className="title">Store admin</h1>
        </div>
        <form action="/api/admin/logout" method="post"><button className="btn btn-ghost btn-sm">Sign out</button></form>
      </div>

      {adminPasswordIsDefault() ? (
        <p className="warn">ADMIN_PASSWORD is not set, so the default password is in use. Set it in .env.local before going live.</p>
      ) : null}

      <div className="stat-row">
        <div className="stat"><b>{toShip.length}</b><span className="muted small">Paid, waiting to ship</span></div>
        <div className="stat"><b>{money(revenue)}</b><span className="muted small">Paid orders total</span></div>
        <div className="stat"><b>{db.orders.length}</b><span className="muted small">All orders</span></div>
        <div className="stat"><b>{db.products.reduce((sum, p) => sum + p.stock, 0)}</b><span className="muted small">Cards in stock</span></div>
      </div>

      <section className="panel stack">
        <div className="row">
          <h2>Trybit connection</h2>
          <span className={`status ${live && secret ? "delivered" : "partial"}`}>{live && secret ? "Connected" : "Setup needed"}</span>
        </div>
        <dl className="kv">
          <dt>API key + shop id</dt><dd>{live ? "Set" : "Missing — checkout is disabled"}</dd>
          <dt>Secret key (POSTBACK signature)</dt><dd>{secret ? "Set" : "Missing — webhooks are rejected"}</dd>
          <dt>Notification URL</dt><dd><code>{origin}/api/trybit/postback</code></dd>
          <dt>Coins offered at checkout</dt><dd>{enabledCoins().map((c) => c.code).join(", ")}</dd>
        </dl>
        <p className="tiny dim" style={{ margin: 0 }}>
          Each coin must also be enabled under Project currencies in Trybit. While the project is in test mode,
          open the invoice in Trybit under Payments → Test and click “Confirm invoice without payment” to test an order.
        </p>
      </section>

      <section className="panel stack">
        <div className="row">
          <h2>Orders</h2>
          <a className="link small" href={show === "all" ? "/admin" : "/admin?show=all"}>
            {show === "all" ? "Hide expired and canceled" : "Show all"}
          </a>
        </div>
        <AdminOrders orders={visible} />
      </section>

      <section className="panel stack">
        <h2>Inventory</h2>
        <AdminProducts products={db.products} />
      </section>
    </div>
  );
}
