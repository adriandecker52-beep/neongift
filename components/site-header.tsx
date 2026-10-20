import Link from "next/link";
import { Logo } from "@/components/logo";
import { currentCustomer } from "@/lib/session";

export async function SiteHeader() {
  const customer = await currentCustomer();
  return (
    <>
      <div className="ticker">
        <div className="wrap">
          <span>Physical gift cards, shipped sealed</span>
          <span>Pay with <b>USDT · BTC · ETH</b> and more through Trybit</span>
          <span>Free standard shipping over $100</span>
        </div>
      </div>
      <header className="header">
        <div className="wrap">
          <Link href="/" className="brand">
            <Logo />
          </Link>
          <nav className="nav">
            <Link href="/shop">Shop</Link>
            <Link href="/shop?brand=playstation">PlayStation</Link>
            <Link href="/shop?brand=xbox">Xbox</Link>
            <Link href="/shop?brand=nintendo">Nintendo</Link>
            <Link href="/shop?brand=steam">Steam</Link>
            <Link href="/how-to-pay">How to pay</Link>
          </nav>
          <form className="header-search" action="/shop">
            <input name="q" placeholder="Search cards" aria-label="Search cards" />
            <button type="submit" aria-label="Search">⌕</button>
          </form>
          <Link className="btn btn-ghost btn-sm header-track" href="/track">Track order</Link>
          {customer ? (
            <Link className="account-chip" href="/account" title={customer.email}>
              {customer.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="avatar" src={customer.picture} alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className="avatar">{customer.name.slice(0, 1).toUpperCase()}</span>
              )}
              <span className="account-name">{customer.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link className="btn btn-neon btn-sm" href="/login">Sign in</Link>
          )}
        </div>
      </header>
    </>
  );
}
