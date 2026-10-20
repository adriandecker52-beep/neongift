import { TrackForm } from "@/components/track-form";

export const metadata = { title: "Track order" };

export default function TrackPage() {
  return (
    <div className="wrap section">
      <div className="panel stack" style={{ maxWidth: 480, margin: "0 auto" }}>
        <p className="eyebrow">Orders</p>
        <h1 className="title" style={{ fontSize: 28 }}>Track your card</h1>
        <p className="muted small" style={{ margin: 0 }}>See payment status, shipping, and tracking.</p>
        <TrackForm />
      </div>
    </div>
  );
}
