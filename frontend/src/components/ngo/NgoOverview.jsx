import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  HandHeart,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Wrench,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import ashaKumariPhoto from "../../assets/workers/asha-kumari-domestic-worker.jpg";
import imranKhanPhoto from "../../assets/workers/imran-khan-electrician.jpg";
import ngoDemoHeroWorkers from "../../assets/ngo-demo-hero-workers.jpg";
import rameshPatelPhoto from "../../assets/workers/ramesh-patel-plumber.jpg";
import rekhaDeviPhoto from "../../assets/workers/rekha-devi-tailor.jpg";
import sanjayVermaPhoto from "../../assets/workers/sanjay-verma-driver.jpg";
import { NgoStatCard } from "./NgoStatCard";

function ProgressStage({ label, value, max }) {
  const percent = max ? Math.round((Number(value || 0) / max) * 100) : 0;
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-black text-slate-700">{label}</span>
        <span className="text-xs font-black text-slate-950">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

const demoSupportedWorkers = [
  ["Asha Kumari", "Domestic Worker", "Delhi", "Consent granted", "Job-ready", ashaKumariPhoto],
  ["Imran Khan", "Electrician", "Lucknow", "Training completed", "Employer matched", imranKhanPhoto],
  ["Ramesh Patel", "Plumber", "Bhopal", "Certified", "Shortlisted", rameshPatelPhoto],
  ["Rekha Devi", "Tailor", "Raipur", "In training", "Portfolio review", rekhaDeviPhoto],
  ["Sanjay Verma", "Driver", "Nagpur", "Placed", "Follow-up due", sanjayVermaPhoto]
];

const demoNgoInsights = [
  [Users, "3 workers are ready for immediate employer introductions.", "violet"],
  [Wrench, "Plumbing and electrician roles have the strongest placement demand.", "blue"],
  [FileText, "2 consent requests need follow-up before full profile access.", "green"],
  [GraduationCap, "9 workers are actively progressing in training programmes.", "orange"]
];

const demoToneClasses = {
  green: "bg-green-50 text-green-700 border-green-100",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  violet: "bg-violet-50 text-violet-700 border-violet-100"
};

function DemoHeroPhoto() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-[47%] hidden w-[40rem] -translate-x-1/2 overflow-hidden lg:block" aria-hidden="true">
      <img
        src={ngoDemoHeroWorkers}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover object-center opacity-95"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-white/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/75" />
      <div className="absolute inset-0 bg-gradient-to-l from-white/60 via-transparent to-transparent" />
    </div>
  );
}

function DemoNgoOverview({ organization, stats, navigateTo }) {
  const cards = [
    [Users, "Total Workers Linked", stats.totalWorkersLinked, "Demo workers granted access.", "blue"],
    [GraduationCap, "Workers in Training", stats.workersInTraining, "Enrolled in demo training.", "green"],
    [ShieldCheck, "Training Completed", stats.trainingCompleted, "Completed demo certifications.", "purple"],
    [BriefcaseBusiness, "Available for Employment", stats.availableForEmployment, "Job-ready by consented records.", "orange"],
    [HandHeart, "Workers Placed", stats.workersPlaced, "Placements tracked here.", "pink"],
    [BarChart3, "Placement Rate", `${stats.placementRate}%`, "Based on demo activity.", "blue"],
    [Building2, "Active Employers", stats.activeEmployers, "Verified demo partners.", "teal"],
    [BriefcaseBusiness, "Open Opportunities", stats.openOpportunities, "Roles matching workers.", "pink"]
  ];

  return (
    <motion.div
      className="grid h-full grid-rows-[auto_auto_minmax(0,1fr)] gap-4"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <section className="relative overflow-hidden rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-green-50 shadow-[0_18px_54px_rgba(15,23,42,0.05)]">
        <DemoHeroPhoto />
        <div className="relative z-10 flex min-h-[196px] items-center justify-between gap-6 px-7 py-5">
          <div className="min-w-0 max-w-[32rem]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">NGO / Foundation Workspace</p>
            <h2 className="mt-5 text-[28px] font-black leading-tight text-slate-950">{organization?.name || "Rozgaar India Demo NGO"}</h2>
            <p className="mt-4 max-w-[44rem] text-sm font-semibold leading-6 text-slate-600">
              Demo Mode shows sample consent, training, placement and employer activity.
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              It does not write anything to the real NGO workspace.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-3">
            <button type="button" onClick={() => navigateTo("/ngo/add-worker")} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-blue-600 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
              <UserPlus className="h-4 w-4" />
              Invite Worker
            </button>
            <button type="button" onClick={() => navigateTo("/ngo/profile")} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-blue-200 bg-white px-5 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100">
              <Building2 className="h-4 w-4" />
              Complete Organization Profile
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, label, value, detail, tone], index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * index }}>
            <NgoStatCard icon={Icon} label={label} value={value} detail={detail} tone={tone} />
          </motion.div>
        ))}
      </div>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[1.14fr_0.86fr]">
        <section className="flex min-h-0 flex-col rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_18px_54px_rgba(15,23,42,0.055)]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-950">Supported Demo Workers</h3>
            <button type="button" onClick={() => navigateTo("/ngo/workers")} className="text-sm font-black text-blue-700 hover:text-blue-800">View all</button>
          </div>
          <div className="mt-5 grid min-h-0 gap-2 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
            {demoSupportedWorkers.map(([name, role, city, consent, stage, photoUrl]) => (
              <article key={name} className="grid min-h-[58px] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[14px] border border-slate-100 bg-white px-2 py-2 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm">
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm">
                  <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-950">{name}</p>
                  <p className="mt-1 truncate text-xs font-bold text-slate-500">{role} <span className="px-1 text-slate-300">•</span> {city}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className={`rounded-xl border px-3 py-1.5 text-xs font-black ${demoToneClasses[consent === "In training" ? "orange" : "green"]}`}>{consent}</span>
                  <span className={`rounded-xl border px-3 py-1.5 text-xs font-black ${demoToneClasses[stage === "Follow-up due" ? "orange" : stage === "Shortlisted" ? "violet" : "blue"]}`}>{stage}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_18px_54px_rgba(15,23,42,0.055)]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h3 className="text-lg font-black text-slate-950">AI Impact Insights</h3>
          </div>
          <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
            {demoNgoInsights.map(([Icon, insight, tone]) => (
              <button key={insight} type="button" className="grid min-h-[64px] w-full grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[14px] border border-slate-100 bg-white px-4 text-left transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm">
                <span className={`grid h-11 w-11 place-items-center rounded-full border ${demoToneClasses[tone]}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold leading-5 text-slate-700">{insight}</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </button>
            ))}
          </div>
          <button type="button" onClick={() => navigateTo("/ngo/reports")} className="mt-4 inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-[14px] border border-blue-200 bg-white px-4 text-sm font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100">
            View Full Analytics
            <ChevronRight className="h-4 w-4" />
          </button>
        </aside>
      </div>
    </motion.div>
  );
}

export function NgoOverview({ organization, stats, activityLogs, navigateTo, isDemoMode = false }) {
  if (isDemoMode) {
    return <DemoNgoOverview organization={organization} stats={stats} navigateTo={navigateTo} />;
  }

  const cards = [
    [Users, "Total Workers Linked", stats.totalWorkersLinked, isDemoMode ? "Demo workers who granted access." : "Workers who granted organization access.", "blue"],
    [GraduationCap, "Workers in Training", stats.workersInTraining, isDemoMode ? "Workers enrolled in demo training." : "Training module opens in Phase 5.", "green"],
    [CheckCircle2, "Training Completed", stats.trainingCompleted, isDemoMode ? "Completed demo certifications." : "Completion records will appear after programmes launch.", "green"],
    [ShieldCheck, "Available for Employment", stats.availableForEmployment, "Workers marked job-ready by consented records.", "blue"],
    [HandHeart, "Workers Placed", stats.workersPlaced, "Placement outcomes will be tracked here.", "violet"],
    [BarChart3, "Placement Rate", `${stats.placementRate}%`, isDemoMode ? "Based on demo placement activity." : "Calculated only from real linked workers.", "violet"],
    [Building2, "Active Employers", stats.activeEmployers, isDemoMode ? "Verified demo employer partners." : "Employer relationships are added later.", "amber"],
    [BriefcaseBusiness, "Open Opportunities", stats.openOpportunities, isDemoMode ? "Demo roles matching supported workers." : "Relevant jobs will appear after matching is wired.", "amber"]
  ];
  const maxProgress = Math.max(1, ...Object.values(stats.placementStages || {}).map(Number));
  const hasWorkers = Number(stats.totalWorkersLinked || 0) > 0;
  const activities = activityLogs.length ? activityLogs : [{
    id: "workspace-created",
    description: "Your organization workspace has been created. Worker onboarding and placement activities will appear here.",
    activityType: "workspace_created",
    createdAt: organization?.createdAt || new Date().toISOString()
  }];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-green-50 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.045)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">NGO/Foundation Workspace</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{organization?.name || "Organization Workspace"}</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              {isDemoMode
                ? "Demo Mode shows sample consent, training, placement and employer activity. It does not write anything to the real NGO workspace."
                : "Worker identities remain owned by workers. Your organization can assist, verify and support workers only with their permission."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigateTo("/ngo/add-worker")} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
              <UserPlus className="h-4 w-4" />
              Invite Worker
            </button>
            <button type="button" onClick={() => navigateTo("/ngo/profile")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-black text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100">
              Complete Organization Profile
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, label, value, detail, tone]) => (
          <NgoStatCard key={label} icon={Icon} label={label} value={value} detail={detail} tone={tone} />
        ))}
      </div>

      {!hasWorkers && (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <h3 className="text-lg font-black text-slate-950">No workers linked yet</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            Invite or assist your first worker to begin tracking training and placement outcomes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => navigateTo("/ngo/add-worker")} className="min-h-10 rounded-xl bg-blue-600 px-4 text-sm font-black text-white hover:bg-blue-700">Invite Worker</button>
            <button type="button" onClick={() => navigateTo("/ngo/workers")} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:bg-slate-50">View Workers</button>
          </div>
        </section>
      )}

      {isDemoMode && (
        <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-950">Supported Demo Workers</h3>
              <button type="button" onClick={() => navigateTo("/ngo/workers")} className="text-sm font-black text-blue-700 hover:text-blue-800">View all</button>
            </div>
            <div className="mt-4 grid gap-2">
              {demoSupportedWorkers.map(([name, role, city, consent, stage]) => (
                <article key={name} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{name}</p>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">{role} • {city}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-black text-green-700">{consent}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{stage}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
            <h3 className="text-lg font-black text-slate-950">AI Impact Insights</h3>
            <div className="mt-4 space-y-3">
              {demoNgoInsights.map((insight) => (
                <p key={insight} className="rounded-xl border border-white/80 bg-white px-3 py-3 text-sm font-bold leading-6 text-slate-700">
                  {insight}
                </p>
              ))}
            </div>
          </aside>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <h3 className="text-lg font-black text-slate-950">Placement Progress</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Linked Workers", stats.placementStages.linkedWorkers],
              ["In Training", stats.placementStages.inTraining],
              ["Certified", stats.placementStages.certified],
              ["Available", stats.placementStages.available],
              ["Shortlisted", stats.placementStages.shortlisted],
              ["Placed", stats.placementStages.placed]
            ].map(([label, value]) => <ProgressStage key={label} label={label} value={value} max={maxProgress} />)}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <h3 className="text-lg font-black text-slate-950">Worker Status Summary</h3>
          <div className="mt-4 grid gap-2">
            {[
              ["Consent pending", stats.workerStatus.consentPending, "bg-amber-50 text-amber-700"],
              ["Linked", stats.workerStatus.linked, "bg-green-50 text-green-700"],
              ["Access limited", stats.workerStatus.accessLimited, "bg-blue-50 text-blue-700"],
              ["Access revoked", stats.workerStatus.accessRevoked, "bg-slate-100 text-slate-700"]
            ].map(([label, value, tone]) => (
              <div key={label} className="flex min-h-11 items-center justify-between rounded-xl border border-slate-100 px-3">
                <span className="text-sm font-black text-slate-700">{label}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <h3 className="text-lg font-black text-slate-950">Recent Activity</h3>
          <div className="mt-4 space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <article key={activity.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <Clock3 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-black text-slate-800">{activity.description}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{new Date(activity.createdAt).toLocaleString("en-IN")}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <h3 className="text-lg font-black text-slate-950">Action Panel</h3>
          <div className="mt-4 grid gap-2">
            {[
              ["Invite Worker", "/ngo/add-worker"],
              ["Link Existing Worker", "/ngo/add-worker"],
              ["Complete Organization Profile", "/ngo/profile"],
              ["View Workers", "/ngo/workers"]
            ].map(([label, href]) => (
              <button key={label} type="button" onClick={() => navigateTo(href)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-black text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100">
                {label}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
