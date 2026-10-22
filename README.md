# Neon Gift

Dark, game-themed store for **physical** gaming gift cards. Payment is crypto only, through [Trybit](https://trybit.com/about) White Label (Host2Host): the buyer picks a coin, then pays to an address, QR code, and exact amount shown on your own order page, with no redirect.

## Run it

The store needs a MySQL 8+ database. Set `DATABASE_URL` (or Railway's `MYSQL_URL`), e.g. `mysql://user:pass@localhost:3306/neongift`.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The owner dashboard is at http://localhost:3000/admin.

Until Trybit keys are set, the shop is browsable but checkout is disabled.

## Connect Trybit

1. Copy `.env.example` to `.env.local`.
2. From your Trybit project (**Integration & API**), set `TRYBIT_API_KEY`, `TRYBIT_SHOP_ID`, and `TRYBIT_SECRET_KEY`.
3. Set `APP_URL` to your public HTTPS address, plus `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET`.
4. In the Trybit project:
   - Notification URL: `https://YOUR_DOMAIN/api/trybit/postback` (JSON format)
   - Under **Project currencies**, enable every coin listed in `TRYBIT_CURRENCIES`.
5. Restart the server.

### Test before going live

New Trybit projects start in test mode ([docs](https://docs.trybit.com/start/test-integration)):

1. Place an order on the site the way a customer would.
2. In Trybit, open **Payments → Test**, open the invoice, and click **Confirm invoice without payment**.
3. The order page switches to **Paid**, and the order appears in `/admin` ready to ship.

Trybit only delivers notifications to ports 80/443, so localhost needs a public tunnel for step 3. Without one, the order page still updates by checking the invoice status with Trybit every few seconds.

## How an order works

1. The buyer enters a shipping address and picks a shipping method and coin.
2. The store holds the stock and creates a Trybit invoice with `add_fields.cryptocurrency` ([H2H docs](https://docs.trybit.com/api-reference-v2/h2h)).
3. The order page shows the address, QR code, exact amount, memo (TON), and a 1-hour countdown.
4. A signed POSTBACK (HS256 JWT checked with your secret key) or an invoice status check marks the order **Paid**.
5. In `/admin`, you enter the carrier and tracking number, then mark it **Delivered**.

Partial payments keep the order on hold. Expired invoices put the stock back, and the buyer can request a new address. Buyers find orders again at `/track` with their order number and email.

## Data

Products, orders, and customers (email and Google sign-ins) live in MySQL, in the `products`, `orders`, and `customers` tables. The app creates the tables on first start. If the database is empty, it imports `data/store.json` when present, otherwise the default card list.

The app keeps a copy of the data in memory and writes every change to MySQL in a transaction before responding. Run a single app instance, and restart it after editing rows directly in MySQL.
