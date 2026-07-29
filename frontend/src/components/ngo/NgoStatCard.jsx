export function NgoStatCard({ icon: Icon, label, value, detail, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100"
  };

  return (
    <section className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-[0_14px_42px_rgba(15,23,42,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.075)]">
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border ${tones[tone] || tones.blue}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-black leading-none text-slate-950">{value}</p>
          <h3 className="mt-2 text-[11px] font-black uppercase tracking-[0.08em] text-slate-600">{label}</h3>
          {detail && <p className="mt-2 text-xs font-bold leading-5 text-slate-600">{detail}</p>}
        </div>
      </div>
    </section>
  );
}
