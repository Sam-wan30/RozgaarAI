import {
  BriefcaseBusiness,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  DraftingCompass,
  Filter,
  Home,
  MoreVertical,
  Pause,
  Plus,
  Scissors,
  Trash2,
  Users,
  Wrench,
  Zap
} from "lucide-react";
import { useMemo, useState } from "react";

const referenceDates = ["20 May, 2025", "19 May, 2025", "18 May, 2025", "17 May, 2025", "16 May, 2025"];

const referenceJobs = [
  { id: "reference-residential-electrician", title: "Residential Electrician", category: "Electrician", city: "Delhi", wageMin: 28000, wageMax: 36000, status: "Active", postedAt: "2025-05-20" },
  { id: "reference-domestic-worker", title: "Verified Domestic Worker", category: "Domestic Worker", city: "Delhi", wageMin: 18000, wageMax: 24000, status: "Active", postedAt: "2025-05-19" },
  { id: "reference-maintenance-plumber", title: "Home Maintenance Plumber", category: "Plumber", city: "Bhopal", wageMin: 25000, wageMax: 32000, status: "Active", postedAt: "2025-05-18" },
  { id: "reference-boutique-tailor", title: "Boutique Tailor", category: "Tailor", city: "Raipur", wageMin: 16000, wageMax: 22000, status: "Active", postedAt: "2025-05-17" },
  { id: "reference-family-driver", title: "Family Driver", category: "Driver", city: "Nagpur", wageMin: 24000, wageMax: 30000, status: "Active", postedAt: "2025-05-16" }
];

const categoryVisuals = {
  Electrician: { icon: Zap, wrap: "bg-blue-50 text-blue-700", block: "from-blue-50 to-blue-100" },
  "Domestic Worker": { icon: Home, wrap: "bg-green-50 text-green-700", block: "from-green-50 to-green-100" },
  Plumber: { icon: Wrench, wrap: "bg-violet-50 text-violet-700", block: "from-violet-50 to-violet-100" },
  Tailor: { icon: Scissors, wrap: "bg-pink-50 text-pink-600", block: "from-pink-50 to-pink-100" },
  Driver: { icon: Car, wrap: "bg-orange-50 text-orange-600", block: "from-orange-50 to-orange-100" }
};

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-[16px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.045)] ${className}`}>
      {children}
    </section>
  );
}

function StatusBadge({ status }) {
  const active = String(status || "").toLowerCase() === "active";
  return (
    <span className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 text-xs font-black ${active ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
      <span className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-slate-400"}`} />
      {status || "Draft"}
    </span>
  );
}

function StatCard({ icon: Icon, value, label, tone }) {
  return (
    <Card className="flex h-[74px] min-w-[170px] items-center gap-4 px-4">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-black leading-none text-slate-950">{value}</p>
        <p className="mt-1 text-sm font-bold text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="relative block">
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-black text-slate-700 outline-none transition hover:border-blue-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
        {children}
      </select>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-700">{label && value === "__label" ? label : ""}</span>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </label>
  );
}

function JobsIllustration() {
  return (
    <div className="relative hidden h-[96px] w-[304px] overflow-hidden rounded-[24px] lg:block">
      <div className="absolute bottom-1 right-4 h-20 w-20 rounded-full bg-blue-100/70" />
      <div className="absolute bottom-0 left-12 h-24 w-24 -rotate-12 rounded-[28px] bg-blue-100/70" />
      <div className="absolute bottom-3 right-16 h-20 w-24 rounded-[22px] border border-blue-100 bg-white/75 shadow-sm">
        <div className="mx-auto mt-5 h-3 w-12 rounded-full bg-blue-100" />
        <div className="mx-auto mt-3 h-2 w-14 rounded-full bg-blue-100" />
        <div className="mx-auto mt-3 h-2 w-10 rounded-full bg-blue-100" />
      </div>
      <div className="absolute bottom-3 left-[112px] grid h-[64px] w-[98px] place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_18px_38px_rgba(37,99,235,0.22)]">
        <BriefcaseBusiness className="h-10 w-10" />
      </div>
      <div className="absolute left-[135px] top-2 h-7 w-12 rounded-t-xl border-[6px] border-blue-400/80 border-b-0" />
      <CheckCircle2 className="absolute right-20 top-3 h-4 w-4 text-blue-300" />
    </div>
  );
}

function JobPostCard({ job, index, applications, roleLabel, cityLabel, onViewApplicants, onToggleStatus, onDuplicate, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const visual = categoryVisuals[job.category] || { icon: BriefcaseBusiness, wrap: "bg-blue-50 text-blue-700", block: "from-blue-50 to-blue-100" };
  const Icon = visual.icon;
  const applicantCount = applications.filter((item) => item.jobId === job.id).length || 1;
  const postedDate = referenceDates[index] || (job.postedAt ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(job.postedAt)) : "Not posted");

  return (
    <article className="relative grid h-[98px] grid-cols-[minmax(0,1fr)_112px_146px_190px_162px_44px] items-center gap-0 rounded-[16px] border border-slate-200 bg-white px-4 shadow-[0_10px_26px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.075)]">
      <div className="flex min-w-0 items-center gap-5">
        <span className={`grid h-[60px] w-[60px] shrink-0 place-items-center rounded-[14px] bg-gradient-to-br ${visual.block}`}>
          <Icon className={`h-7 w-7 ${visual.wrap.replace("bg-", "text-").split(" ")[1] || "text-blue-700"}`} />
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-[17px] font-black text-slate-950">{job.title}</h3>
            <CheckCircle2 className="h-4 w-4 shrink-0 fill-green-600 text-green-600" />
          </div>
          <p className="mt-1.5 truncate text-sm font-bold text-slate-500">{roleLabel(job.category)} <span className="px-1 text-slate-300">•</span> {cityLabel(job.city)}</p>
          <p className="mt-1.5 truncate text-[15px] font-black text-blue-700">₹{Number(job.wageMin || 0).toLocaleString("en-IN")} – ₹{Number(job.wageMax || 0).toLocaleString("en-IN")} / month</p>
        </div>
      </div>

      <div className="flex justify-center">
        <StatusBadge status={job.status} />
      </div>

      <div className="flex h-[58px] items-center justify-center gap-3 border-l border-slate-200">
        <Users className="h-5 w-5 text-slate-500" />
        <div>
          <p className="text-sm font-black text-slate-950">{applicantCount}</p>
          <p className="text-sm font-bold text-slate-500">Applicant</p>
        </div>
      </div>

      <div className="flex h-[58px] items-center justify-center gap-3 border-l border-slate-200">
        <CalendarDays className="h-5 w-5 text-slate-500" />
        <div>
          <p className="text-xs font-bold text-slate-500">Posted on</p>
          <p className="text-sm font-bold text-slate-600">{postedDate}</p>
        </div>
      </div>

      <button type="button" onClick={onViewApplicants} className="h-10 rounded-lg border border-blue-500 bg-white px-4 text-sm font-black text-blue-700 transition hover:bg-blue-50">
        View Applicants
      </button>

      <div className="flex justify-end">
        <button type="button" aria-label={`Open actions for ${job.title}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute right-4 top-16 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
          {[
            [job.status === "Paused" ? Plus : Pause, job.status === "Paused" ? "Mark Active" : "Pause Job", onToggleStatus],
            [Copy, "Duplicate", onDuplicate],
            [Trash2, "Delete", onDelete]
          ].map(([ActionIcon, label, action]) => (
            <button key={label} type="button" onClick={() => { action(); setMenuOpen(false); }} className="flex min-h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-xs font-black text-slate-600 hover:bg-slate-50">
              <ActionIcon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

function Pagination() {
  return (
    <div className="flex h-10 items-center justify-between">
      <div />
      <div className="flex items-center gap-2">
        <button type="button" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" className="h-8 min-w-8 rounded-lg bg-blue-600 px-3 text-sm font-black text-white shadow-[0_8px_16px_rgba(37,99,235,0.2)]">1</button>
        <button type="button" className="h-8 min-w-8 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700">2</button>
        <button type="button" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500"><ChevronRight className="h-4 w-4" /></button>
      </div>
      <p className="text-sm font-bold text-slate-500">Showing 1 to 5 of 15 jobs</p>
    </div>
  );
}

function EmptyJobsState({ onPostJob }) {
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-white px-6 text-center shadow-[0_10px_28px_rgba(15,23,42,0.035)]">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
        <BriefcaseBusiness className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-xl font-black text-slate-950">No job posts yet</h3>
      <p className="mt-2 max-w-md text-sm font-bold leading-6 text-slate-500">
        Real job posts will appear here after you create them. Demo job listings are only shown in Employer Demo mode.
      </p>
      <button type="button" onClick={onPostJob} className="mt-5 h-10 rounded-lg bg-blue-600 px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.22)] transition hover:bg-blue-700">
        Post a Job
      </button>
    </div>
  );
}

export function EmployerJobPostsPage({
  jobs,
  applications,
  roleLabel,
  cityLabel,
  navigateTo,
  updateJobStatus,
  duplicateJob,
  deleteJob,
  isEmployerDemoMode = false
}) {
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Newest");
  const sourceJobs = isEmployerDemoMode ? (jobs.length ? jobs : referenceJobs) : jobs;
  const activeJobCount = sourceJobs.filter((job) => job.status === "Active").length;
  const draftJobCount = sourceJobs.filter((job) => job.status === "Draft").length;
  const totalJobCount = sourceJobs.length;
  const visibleJobs = useMemo(() => {
    const filtered = statusFilter === "All Status" ? sourceJobs : sourceJobs.filter((job) => job.status === statusFilter);
    return (sortBy === "Oldest" ? [...filtered].reverse() : filtered).slice(0, 5);
  }, [sortBy, sourceJobs, statusFilter]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/80 px-2 py-1 lg:px-3">
      <div className="flex shrink-0 items-start justify-between gap-6">
        <div className="pt-1">
          <h2 className="text-[28px] font-black leading-tight text-slate-950">Job Posts</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">Manage and track all your job listings</p>
        </div>
        <JobsIllustration />
      </div>

      <div className="mt-4 flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <StatCard icon={BriefcaseBusiness} value={activeJobCount} label="Active Jobs" tone="bg-blue-50 text-blue-700" />
          <StatCard icon={Clock3} value={draftJobCount} label="Draft Jobs" tone="bg-green-50 text-green-700" />
          <StatCard icon={DraftingCompass} value={totalJobCount} label="Total Jobs" tone="bg-violet-50 text-violet-700" />
        </div>

        <div className="flex items-center gap-3">
          <FilterSelect value={statusFilter} onChange={setStatusFilter}>
            <option>All Status</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Paused</option>
          </FilterSelect>
          <FilterSelect value={sortBy} onChange={setSortBy}>
            <option value="Newest">Sort by: Newest</option>
            <option value="Oldest">Sort by: Oldest</option>
          </FilterSelect>
          <button type="button" aria-label="Open filters" className="grid h-10 w-12 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {visibleJobs.length ? visibleJobs.map((job, index) => (
          <JobPostCard
            key={job.id}
            job={job}
            index={index}
            applications={applications}
            roleLabel={roleLabel}
            cityLabel={cityLabel}
            onViewApplicants={() => navigateTo("/employer/applicants")}
            onToggleStatus={() => updateJobStatus(job.id, job.status === "Paused" ? "Active" : "Paused")}
            onDuplicate={() => duplicateJob(job)}
            onDelete={() => deleteJob(job.id)}
          />
        )) : <EmptyJobsState onPostJob={() => navigateTo("/employer/jobs/new")} />}
      </div>

      {visibleJobs.length > 0 && <div className="shrink-0 pt-3">
        <Pagination />
      </div>}
    </section>
  );
}
