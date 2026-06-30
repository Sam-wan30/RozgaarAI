export function MetricCard({ label, value, detail }) {
  return (
    <div className="gradient-card-surface rounded-lg border border-slate-200 p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      {detail && <p className="mt-2 text-sm text-slate-600">{detail}</p>}
    </div>
  );
}
