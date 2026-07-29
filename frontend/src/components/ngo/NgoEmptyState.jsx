import { ArrowLeft, Sparkles } from "lucide-react";

export function NgoEmptyState({
  title,
  description,
  actionLabel = "Back to Overview",
  onAction,
  icon: Icon = Sparkles
}) {
  return (
    <section className="grid min-h-[22rem] place-items-center rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-center shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
      <div className="max-w-xl">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-2xl font-black text-slate-950">{title}</h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{description}</p>
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {actionLabel}
        </button>
      </div>
    </section>
  );
}
