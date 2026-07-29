import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  ChevronDown,
  Clock3,
  Info,
  Lightbulb,
  MapPin,
  Trophy,
  UserCheck,
  Users
} from "lucide-react";

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-[16px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.045)] ${className}`}>
      {children}
    </section>
  );
}

function Sparkline({ color, points }) {
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${index * 14} ${38 - point}`).join(" ");
  return (
    <svg viewBox="0 0 126 42" className="h-12 w-32" aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => <circle key={index} cx={index * 14} cy={38 - point} r="1.7" fill={color} />)}
    </svg>
  );
}

function KpiCard({ icon: Icon, value, label, change, tone, sparkline }) {
  return (
    <Card className={`relative min-h-[116px] overflow-hidden bg-gradient-to-br ${tone.bg} p-4`}>
      <div className="flex h-full items-center justify-between gap-3">
        <div className="min-w-0">
          <span className={`grid h-11 w-11 place-items-center rounded-full ${tone.icon}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="mt-3 flex items-end gap-3">
            <p className="text-[28px] font-black leading-none text-slate-950">{value}</p>
            <p className="pb-1 text-xs font-black uppercase tracking-[0.04em] text-slate-700">{label}</p>
          </div>
          {change ? (
            <p className="mt-4 flex items-center gap-1.5 text-xs font-black text-green-600">
              <span>↗</span> {change} <span className="font-bold text-slate-500">vs last 30 days</span>
            </p>
          ) : (
            <p className="mt-4 text-xs font-black text-slate-400">Updates after real hiring activity</p>
          )}
        </div>
        <div className="self-end pb-1 opacity-100">
          {sparkline ? <Sparkline color={tone.line} points={sparkline} /> : <div className="h-12 w-32 rounded-lg border border-dashed border-slate-200 bg-white/55" />}
        </div>
      </div>
    </Card>
  );
}

function EmptyPanel({ title, body }) {
  return (
    <div className="flex h-[168px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <p className="text-sm font-black text-slate-700">{title}</p>
      <p className="mt-2 max-w-sm text-xs font-bold leading-5 text-slate-500">{body}</p>
    </div>
  );
}

function HiresByCityCard({ rows }) {
  const maxValue = Math.max(1, ...rows.map(([, value]) => Number(value)));
  return (
    <Card className="h-[250px] p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-black text-slate-950"><MapPin className="h-4 w-4 text-blue-600" /> Hires by City</h3>
        <button type="button" className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">
          Last 30 days <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="relative mt-5 pl-[104px] pr-8">
        {rows.length === 0 ? (
          <EmptyPanel title="No city hiring data yet" body="City performance will appear after candidates are selected or hired in the real workspace." />
        ) : (
          <>
        <div className="absolute inset-y-0 left-[104px] right-8 grid grid-cols-5">
          {[0, 1, 2, 3, 4].map((item) => <span key={item} className="border-l border-slate-100" />)}
        </div>
        <div className="relative space-y-4">
          {rows.map(([city, value]) => (
            <div key={city} className="grid grid-cols-[88px_minmax(0,1fr)_18px] items-center gap-4">
              <span className="text-sm font-black text-slate-800">{city}</span>
              <span className="h-4 overflow-hidden rounded-full bg-blue-50">
                <span className="block h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${(Number(value) / maxValue) * 100}%` }} />
              </span>
              <span className="text-sm font-black text-slate-950">{value}</span>
            </div>
          ))}
        </div>
        <div className="ml-[104px] mt-4 grid grid-cols-6 text-xs font-bold text-slate-500">
          {[0, 1, 2, 3, 4, 5].map((tick) => <span key={tick}>{Math.round((maxValue / 5) * tick)}</span>)}
        </div>
          </>
        )}
      </div>
    </Card>
  );
}

function ApplicantFunnelCard({ rows, total }) {
  return (
    <Card className="h-[250px] p-4">
      <h3 className="flex items-center gap-2 text-base font-black text-slate-950"><span className="grid h-5 w-5 place-items-center rounded-full border border-blue-200 text-blue-600"><Users className="h-3.5 w-3.5" /></span> Applicant Funnel</h3>
      <div className="mt-4 grid grid-cols-[0.9fr_1.25fr] items-center gap-5">
        {total > 0 ? <svg viewBox="0 0 210 160" className="h-[146px] w-full" aria-label="Applicant funnel chart">
          <path d="M12 6h186l-19 50H31z" fill="#4f8df7" />
          <path d="M31 65h148l-18 48H49z" fill="#49c98f" />
          <path d="M49 121h112l-17 42H66z" fill="#f7c23f" />
          <path d="M67 171h76l-15 36H82z" fill="#7a63dd" transform="translate(0 -35)" />
        </svg> : <div className="grid h-[146px] place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-center text-xs font-bold text-slate-500">No applicant funnel yet</div>}
        <div className="min-w-0">
          <div className="grid grid-cols-[1fr_54px_74px] border-b border-slate-100 pb-2 text-[11px] font-black text-slate-500">
            <span>Stage</span><span>Count</span><span>Conversion</span>
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map(([stage, count, conversion, dot]) => (
              <div key={stage} className="grid grid-cols-[1fr_54px_74px] items-center py-3 text-sm font-black text-slate-800">
                <span className="flex min-w-0 items-center gap-3"><span className={`h-3 w-3 rounded-full ${dot}`} /> <span className="truncate">{stage}</span></span>
                <span>{count}</span>
                <span>{conversion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function DoughnutChart({ rows }) {
  let offset = 0;
  const colors = ["#2563eb", "#22c55e", "#f59e0b", "#7c3aed", "#e5e7eb"];
  const segments = rows.map((row, index) => {
    const segment = [colors[index] || "#94a3b8", Number.parseFloat(String(row[1])) || 0, offset];
    offset += segment[1];
    return segment;
  });
  return (
    <svg viewBox="0 0 140 140" className="h-[138px] w-[138px]" aria-label="Top job categories chart">
      <circle cx="70" cy="70" r="47" fill="transparent" stroke="#eef2f7" strokeWidth="31" />
      {segments.map(([color, value, offset]) => (
        <circle key={color} cx="70" cy="70" r="47" fill="transparent" stroke={color} strokeWidth="31" strokeDasharray={`${value} ${100 - Number(value)}`} strokeDashoffset={25 - Number(offset)} strokeLinecap="butt" pathLength="100" transform="rotate(-90 70 70)" />
      ))}
      <circle cx="70" cy="70" r="31" fill="white" />
    </svg>
  );
}

function TopCategoriesCard({ rows }) {
  return (
    <Card className="h-[218px] overflow-hidden p-4">
      <h3 className="text-base font-black text-slate-950">Top Job Categories</h3>
      {rows.length === 0 ? (
        <div className="mt-3"><EmptyPanel title="No job categories yet" body="Category analytics will populate when you post jobs in the real workspace." /></div>
      ) : (
      <>
      <div className="mt-3 grid grid-cols-[130px_minmax(0,1fr)] items-center gap-4">
        <DoughnutChart rows={rows} />
        <div className="space-y-3">
          {rows.map(([label, value, color]) => (
            <div key={label} className="grid grid-cols-[1fr_42px] items-center gap-2 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-3"><span className={`h-3 w-3 rounded ${color}`} /> {label}</span>
              <span className="font-black text-slate-950">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-800">View all categories <ArrowRight className="h-4 w-4" /></button>
      </>
      )}
    </Card>
  );
}

function TimeToHireCard({ hasData, isDemo }) {
  return (
    <Card className="h-[218px] overflow-hidden p-4">
      <h3 className="flex items-center gap-2 text-base font-black text-slate-950"><Clock3 className="h-4 w-4 text-blue-600" /> Time to Hire</h3>
      {!hasData ? (
        <div className="mt-3"><EmptyPanel title="No time-to-hire data yet" body="This chart will unlock after at least one candidate is hired from real applications." /></div>
      ) : (
      <>
      <div className="mt-3 grid grid-cols-[140px_minmax(0,1fr)] gap-3">
        <div>
          <p className="mt-6 text-[32px] font-black leading-none text-slate-950">18 <span className="text-sm">days</span></p>
          <p className="mt-2 text-xs font-bold text-slate-500">Average time to hire</p>
          {isDemo && <span className="mt-4 inline-flex rounded-lg bg-green-50 px-3 py-2 text-[11px] font-black text-green-700">↘ 15% faster vs last 30 days</span>}
        </div>
        <svg viewBox="0 0 260 135" className="h-[135px] w-full" aria-label="Time to hire trend">
          {[0, 1, 2, 3].map((item) => <line key={item} x1="20" x2="248" y1={18 + item * 34} y2={18 + item * 34} stroke="#eef2f7" />)}
          <path d="M22 42 C62 54 72 66 104 67 C144 70 153 85 188 83 C217 85 220 82 244 80" fill="none" stroke="#3b82f6" strokeWidth="2.5" />
          <path d="M22 42 C62 54 72 66 104 67 C144 70 153 85 188 83 C217 85 220 82 244 80 L244 126 L22 126Z" fill="url(#timeGradient)" />
          <defs>
            <linearGradient id="timeGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[["22", "42"], ["104", "67"], ["188", "83"], ["244", "80"]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />)}
          <text x="18" y="138" fontSize="11" fill="#64748b">May 1</text>
          <text x="102" y="138" fontSize="11" fill="#64748b">May 16</text>
          <text x="206" y="138" fontSize="11" fill="#64748b">May 31</text>
        </svg>
      </div>
      <button type="button" className="inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-800">View details <ArrowRight className="h-4 w-4" /></button>
      </>
      )}
    </Card>
  );
}

function InsightsCard({ rows }) {
  return (
    <Card className="h-[218px] overflow-hidden p-4">
      <h3 className="flex items-center gap-2 text-base font-black text-slate-950"><Lightbulb className="h-4 w-4 text-blue-600" /> Insights</h3>
      {rows.length === 0 ? (
        <div className="mt-3"><EmptyPanel title="No insights yet" body="AI insights will appear after you have real jobs, applicants, interviews, or hires." /></div>
      ) : (
      <>
      <div className="mt-4 space-y-4">
        {rows.map(([title, body, tone]) => (
          <div key={title} className="flex gap-4">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tone}`}><BarChart3 className="h-4 w-4" /></span>
            <div>
              <p className="text-sm font-black text-slate-950">{title}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">{body}</p>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="mt-3 inline-flex items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-800">View all insights <ArrowRight className="h-4 w-4" /></button>
      </>
      )}
    </Card>
  );
}

function percent(value, total) {
  if (!total) return "0%";
  return `${Math.round((Number(value || 0) / Number(total)) * 100)}%`;
}

function topCounts(items, labeler) {
  const counts = new Map();
  items.forEach((item) => {
    const label = labeler(item);
    if (!label) return;
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

export function EmployerAnalyticsPage({ analytics, applications = [], jobs = [], isEmployerDemoMode = false }) {
  const applicants = Math.max(1, Number(analytics?.applicants || 0));
  const shortlistRate = `${Math.round((Number(analytics?.shortlisted || 0) / applicants) * 100)}%`;
  const hireRate = `${Math.round((Number(analytics?.hires || 0) / applicants) * 100)}%`;
  const hasRealActivity = Boolean(
    Number(analytics?.activeJobs || 0) ||
    Number(analytics?.applicants || 0) ||
    Number(analytics?.shortlisted || 0) ||
    Number(analytics?.interviews || 0) ||
    Number(analytics?.hires || 0)
  );
  const hiredApplications = applications.filter((item) => ["Hired", "Selected"].includes(item.status));
  const cityRows = isEmployerDemoMode
    ? [["Delhi", 5], ["Mumbai", 4], ["Bengaluru", 3], ["Hyderabad", 2], ["Pune", 1]]
    : topCounts(hiredApplications, (item) => item.worker?.city);
  const screenedCount = applications.filter((item) => !["Applied", "Recommended"].includes(item.status)).length;
  const funnelRows = [
    ["Total Applicants", Number(analytics?.applicants || 0), percent(analytics?.applicants || 0, analytics?.applicants || 0), "bg-blue-500"],
    ["Screened", isEmployerDemoMode ? 3 : screenedCount, percent(isEmployerDemoMode ? 3 : screenedCount, analytics?.applicants || 0), "bg-emerald-500"],
    ["Shortlisted", Number(analytics?.shortlisted || 0), percent(analytics?.shortlisted || 0, analytics?.applicants || 0), "bg-amber-400"],
    ["Hired", Number(analytics?.hires || 0), percent(analytics?.hires || 0, analytics?.applicants || 0), "bg-violet-500"]
  ];
  const categoryColors = ["bg-blue-600", "bg-emerald-500", "bg-amber-400", "bg-violet-500", "bg-slate-200"];
  const categoryCounts = isEmployerDemoMode
    ? [["IT & Software", 40], ["Sales & Marketing", 25], ["Operations", 20], ["Customer Support", 10], ["Others", 5]]
    : topCounts(jobs, (job) => job.category || job.title);
  const categoryTotal = categoryCounts.reduce((sum, [, value]) => sum + Number(value), 0);
  const categoryRows = categoryCounts.map(([label, value], index) => [label, `${categoryTotal ? Math.round((Number(value) / categoryTotal) * 100) : 0}%`, categoryColors[index] || "bg-slate-200"]);
  const insightRows = isEmployerDemoMode
    ? [
        ["Shortlist rate improved by 10%", "Great job! Keep optimizing your job descriptions.", "bg-green-50 text-green-700"],
        ["Most hires from Delhi", "60% of your hires are from Delhi.", "bg-blue-50 text-blue-700"],
        ["High demand for IT & Software", "40% of applications are for IT & Software roles.", "bg-orange-50 text-orange-600"]
      ]
    : [
        Number(analytics?.activeJobs || 0) > 0 && ["Active jobs are live", `${analytics.activeJobs} job post${Number(analytics.activeJobs) === 1 ? " is" : "s are"} currently active.`, "bg-blue-50 text-blue-700"],
        Number(analytics?.applicants || 0) > 0 && ["Applicants are entering your funnel", `${analytics.applicants} real applicant${Number(analytics.applicants) === 1 ? "" : "s"} found across your job posts.`, "bg-green-50 text-green-700"],
        Number(analytics?.hires || 0) > 0 && ["Hiring outcomes available", `${analytics.hires} candidate${Number(analytics.hires) === 1 ? " has" : "s have"} reached a selected or hired stage.`, "bg-orange-50 text-orange-600"]
      ].filter(Boolean);

  const kpis = [
    { icon: BriefcaseBusiness, value: analytics?.activeJobs ?? 0, label: "ACTIVE JOB POSTS", change: isEmployerDemoMode ? "25%" : null, tone: { bg: "from-blue-50 to-white border-blue-200", icon: "bg-blue-100 text-blue-700", line: "#2563eb" }, sparkline: isEmployerDemoMode || hasRealActivity ? [5, 10, 7, 14, 11, 19, 17, 25, 20, 31] : null },
    { icon: Users, value: analytics?.applicants ?? 0, label: "TOTAL APPLICANTS", change: isEmployerDemoMode ? "40%" : null, tone: { bg: "from-green-50 to-white border-green-200", icon: "bg-green-100 text-green-700", line: "#16803d" }, sparkline: isEmployerDemoMode || hasRealActivity ? [4, 12, 9, 15, 13, 21, 18, 27, 22, 32] : null },
    { icon: UserCheck, value: shortlistRate, label: "SHORTLIST RATE", change: isEmployerDemoMode ? "10%" : null, tone: { bg: "from-violet-50 to-white border-violet-200", icon: "bg-violet-100 text-violet-700", line: "#8b5cf6" }, sparkline: isEmployerDemoMode || hasRealActivity ? [3, 9, 7, 14, 10, 20, 16, 29, 18, 33] : null },
    { icon: Trophy, value: hireRate, label: "HIRE RATE", change: isEmployerDemoMode ? "8%" : null, tone: { bg: "from-orange-50 to-white border-orange-200", icon: "bg-orange-100 text-orange-600", line: "#f97316" }, sparkline: isEmployerDemoMode || hasRealActivity ? [2, 8, 5, 12, 9, 15, 14, 22, 17, 30] : null }
  ];

  return (
    <section className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#f8fafd] px-2 py-3 xl:overflow-hidden lg:px-3">
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-sm"><BarChart3 className="h-5 w-5" /></span>
            <div>
              <h2 className="text-[28px] font-black leading-none text-slate-950">Analytics</h2>
              <p className="mt-2 text-sm font-bold text-slate-500">Track your hiring performance and workforce insights.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid shrink-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      <div className="mt-5 grid shrink-0 grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
        <HiresByCityCard rows={cityRows} />
        <ApplicantFunnelCard rows={funnelRows} total={Number(analytics?.applicants || 0)} />
      </div>

      <div className="mt-5 grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-3">
        <TopCategoriesCard rows={categoryRows} />
        <TimeToHireCard hasData={isEmployerDemoMode || Number(analytics?.hires || 0) > 0} isDemo={isEmployerDemoMode} />
        <InsightsCard rows={insightRows} />
      </div>

      <div className="mt-4 flex h-10 shrink-0 items-center gap-3 rounded-[12px] border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm">
        <Info className="h-4 w-4 text-blue-600" />
        {isEmployerDemoMode ? "Analytics are updated in real-time. Data shown is for demo purposes." : "Analytics are updated from your real jobs, applicants, interviews, and hires."}
      </div>
    </section>
  );
}
