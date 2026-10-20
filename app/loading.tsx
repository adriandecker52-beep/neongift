export default function Loading() {
  return (
    <div className="wrap section page-loading" aria-busy="true" aria-live="polite">
      <span className="spinner" />
      <span className="muted small">Loading…</span>
    </div>
  );
}
