import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap section">
      <div className="panel stack" style={{ maxWidth: 520 }}>
        <p className="eyebrow">404</p>
        <h1 className="title" style={{ fontSize: 28 }}>Nothing here</h1>
        <Link className="btn btn-neon" href="/shop" style={{ justifySelf: "start" }}>Shop cards</Link>
      </div>
    </div>
  );
}
