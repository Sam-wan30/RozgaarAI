import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, ClipboardList, Database, RefreshCw, ShieldCheck } from "lucide-react";
import { runFrontendHealthCheck } from "../../lib/diagnostics";

function StatusPill({ status }) {
  const styles = {
    pass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-700",
    fail: "border-red-200 bg-red-50 text-red-700"
  };
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-black uppercase ${styles[status] || styles.warn}`}>{status}</span>;
}

function DiagnosticsCard({ icon: Icon, title, value, detail }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{title}</p>
          <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">{detail}</p>
    </article>
  );
}

export function AdminDiagnostics({ account, onBack }) {
  const [result, setResult] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const refresh = async () => {
    setIsChecking(true);
    const nextResult = await runFrontendHealthCheck();
    setResult(nextResult);
    setIsChecking(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const summary = useMemo(() => {
    const checks = result?.checks || [];
    return {
      pass: checks.filter((item) => item.status === "pass").length,
      warn: checks.filter((item) => item.status === "warn").length,
      fail: checks.filter((item) => item.status === "fail").length
    };
  }, [result]);

  const diagnostics = result?.diagnostics;

  return (
    <main className="min-h-dvh bg-slate-50 px-6 py-8 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Admin Workspace</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Production Diagnostics</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              Safe runtime checks for deployment readiness, environment configuration, browser storage and backend health. Secret values are never displayed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onBack} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50">
              Back to App
            </button>
            <button type="button" onClick={refresh} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700">
              <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
              Run Checks
            </button>
          </div>
        </header>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DiagnosticsCard icon={CheckCircle2} title="Passing" value={summary.pass} detail="Checks confirmed for this browser session." />
          <DiagnosticsCard icon={AlertTriangle} title="Warnings" value={summary.warn} detail="Non-blocking items to configure before launch." />
          <DiagnosticsCard icon={ShieldCheck} title="Failures" value={summary.fail} detail="Items that need attention before production release." />
          <DiagnosticsCard icon={Activity} title="Operator" value={account?.name || "Admin"} detail={account?.email || "Signed in with admin access."} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700"><ClipboardList className="h-5 w-5" /></span>
              <h2 className="text-xl font-black text-slate-950">Release Checks</h2>
            </div>
            <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {(result?.checks || []).map((check) => (
                <div key={check.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-950">{check.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{check.detail}</p>
                  </div>
                  <StatusPill status={check.status} />
                </div>
              ))}
              {!result?.checks?.length && <p className="p-5 text-sm font-semibold text-slate-500">Running diagnostics...</p>}
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><Database className="h-5 w-5" /></span>
              <h2 className="text-xl font-black text-slate-950">Configuration</h2>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-black text-slate-500">Version</dt>
                <dd className="mt-1 font-semibold text-slate-950">{diagnostics?.app.version || "Checking..."}</dd>
              </div>
              <div>
                <dt className="font-black text-slate-500">Build</dt>
                <dd className="mt-1 font-semibold text-slate-950">{diagnostics?.app.buildTimestamp || "Checking..."}</dd>
              </div>
              <div>
                <dt className="font-black text-slate-500">Backend</dt>
                <dd className="mt-1 font-semibold text-slate-950">{diagnostics?.integrations.api.origin || "Not configured"}</dd>
              </div>
              <div>
                <dt className="font-black text-slate-500">Persistence</dt>
                <dd className="mt-1 font-semibold text-slate-950">{diagnostics?.integrations.supabase.configured ? "Supabase configured" : "Local/demo fallback"}</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Recent Client Events</p>
              <div className="mt-3 space-y-2">
                {(diagnostics?.recentEvents || []).slice(0, 4).map((event) => (
                  <div key={event.id} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600">
                    <span className="font-black text-slate-950">{event.eventName}</span> · {event.createdAt}
                  </div>
                ))}
                {!diagnostics?.recentEvents?.length && <p className="text-sm font-semibold text-slate-500">No client events recorded.</p>}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
