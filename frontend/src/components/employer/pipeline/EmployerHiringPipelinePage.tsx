import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Search,
  Sparkles,
  UserCheck,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";

const pipelineStages = [
  { key: "Recommended", title: "Recommended", count: 4, subtitle: "AI recommended best matches", color: "blue" },
  { key: "Shortlisted", title: "Shortlisted", count: 3, subtitle: "Candidates you've shortlisted", color: "blue" },
  { key: "Interview Scheduled", title: "Interview Scheduled", count: 2, subtitle: "Interviews in progress", color: "purple" },
  { key: "Selected", title: "Selected", count: 1, subtitle: "Selected candidates", color: "green" }
];

const extraCandidates = [
  { id: "ref-asha", name: "Asha Kumari", role: "Residential Electrician", stage: "Recommended", match: 98, experience: 4, city: "Delhi" },
  { id: "extra-vikram", name: "Vikram Singh", role: "AC Technician", stage: "Recommended", match: 97, experience: 5, city: "Bhopal" },
  { id: "extra-neha", name: "Neha Sharma", role: "Solar Installer", stage: "Recommended", match: 95, experience: 3, city: "Indore" },
  { id: "extra-ramesh-yadav", name: "Ramesh Yadav", role: "Facility Technician", stage: "Recommended", match: 93, experience: 6, city: "Jaipur" },
  { id: "ref-ramesh-patel", name: "Ramesh Patel", role: "Verified Domestic Worker", stage: "Shortlisted", match: 96, experience: 6, city: "Bhopal" },
  { id: "ref-rekha", name: "Rekha Devi", role: "Home Maintenance Plumber", stage: "Shortlisted", match: 94, experience: 5, city: "Raipur" },
  { id: "extra-pooja", name: "Pooja Verma", role: "Housekeeping Staff", stage: "Shortlisted", match: 92, experience: 4, city: "Lucknow" },
  { id: "ref-imran", name: "Imran Khan", role: "Boutique Tailor", stage: "Interview Scheduled", match: 97, experience: 5, city: "Lucknow", schedule: "May 20, 2025 • 11:00 AM" },
  { id: "extra-sunita", name: "Sunita Kumari", role: "Caregiver", stage: "Interview Scheduled", match: 90, experience: 5, city: "Delhi", schedule: "May 21, 2025 • 02:00 PM" }
  ,
  { id: "ref-sanjay", name: "Sanjay Verma", role: "Family Driver", stage: "Selected", match: 95, experience: 7, city: "Nagpur" }
];

const stageStyles = {
  blue: {
    top: "border-t-blue-600",
    badge: "bg-blue-50 text-blue-700",
    active: "bg-blue-600 text-white",
    ring: "border-blue-100"
  },
  purple: {
    top: "border-t-violet-600",
    badge: "bg-violet-50 text-violet-700",
    active: "bg-violet-600 text-white",
    ring: "border-violet-100"
  },
  green: {
    top: "border-t-green-600",
    badge: "bg-green-50 text-green-700",
    active: "bg-green-600 text-white",
    ring: "border-green-100"
  }
};

function initials(name) {
  return String(name || "RA").split(/\s+/).map((part) => part[0]).slice(0, 2).join("");
}

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-[14px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.045)] ${className}`}>
      {children}
    </section>
  );
}

function StatCard({ icon: Icon, label, value, trend, tone }) {
  return (
    <Card className={`flex h-[104px] items-center gap-4 bg-gradient-to-br ${tone.bg} px-4`}>
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${tone.icon}`}>
        <Icon className="h-7 w-7" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-600">{label}</p>
        <p className="mt-1 text-[28px] font-black leading-none text-slate-950">{value}</p>
        <p className="mt-2 text-xs font-black text-green-600">{trend}</p>
      </div>
    </Card>
  );
}

function AIHiringBanner({ onClick }) {
  return (
    <section className="relative h-[132px] overflow-hidden rounded-[14px] bg-gradient-to-br from-blue-600 via-blue-600 to-blue-500 p-4 text-white shadow-[0_16px_36px_rgba(37,99,235,0.25)]">
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute right-3 top-8 h-20 w-14 -rotate-8 rounded-xl bg-white/85 p-2 shadow-lg">
        <div className="h-5 w-5 rounded-full bg-blue-200" />
        <div className="mt-2 h-2 w-9 rounded-full bg-blue-200" />
        <div className="mt-2 h-2 w-8 rounded-full bg-blue-100" />
      </div>
      <Sparkles className="absolute left-4 top-4 h-5 w-5 text-blue-100" />
      <div className="relative ml-8 max-w-[210px] pr-8">
        <h3 className="text-base font-black">AI-Powered Hiring</h3>
        <p className="mt-1.5 text-xs font-bold leading-5 text-blue-50">Our AI helps you identify the best candidates faster.</p>
        <button type="button" onClick={onClick} className="mt-2 inline-flex h-8 max-w-full items-center gap-1.5 rounded-full bg-white px-3 text-[11px] font-black text-blue-700 transition hover:bg-blue-50">
          Explore AI Insights <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}

function CandidateAvatar({ candidate }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 p-0.5 text-xs font-black text-white">
      {candidate.photoUrl ? (
        <img src={candidate.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center rounded-full bg-blue-600">{initials(candidate.name)}</span>
      )}
    </span>
  );
}

function MatchCircle({ value }) {
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-green-500 bg-white text-xs font-black text-green-700">
      {value}%
    </span>
  );
}

function MoveSelect({ value, stages, onMove }) {
  return (
    <span className="relative block">
      <select
        value=""
        onChange={(event) => {
          if (!event.target.value) return;
          onMove(event.target.value);
        }}
        className="h-8 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs font-black text-blue-700 outline-none transition hover:border-blue-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      >
        <option value="">Move Stage</option>
        {stages
          .filter((stage) => stage !== value)
          .map((stage) => <option key={stage} value={stage}>{stage}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
    </span>
  );
}

function CandidateCard({ candidate, stages, onMove, onViewProfile, draggable, onDragStart, onDragEnd }) {
  const isSelected = candidate.stage === "Selected";
  const isInterview = candidate.stage === "Interview Scheduled";

  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group rounded-[12px] border border-slate-200 bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(37,99,235,0.12)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <CandidateAvatar candidate={candidate} />
          <div className="min-w-0">
            <h4 className="truncate text-sm font-black text-slate-950">{candidate.name}</h4>
            <p className="mt-0.5 truncate text-[11px] font-bold text-slate-500">{candidate.role}</p>
          </div>
        </div>
        <MatchCircle value={candidate.match} />
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] font-bold text-slate-600">
        {isInterview ? (
          <span className="inline-flex min-w-0 items-center gap-1 truncate"><CalendarDays className="h-3.5 w-3.5" /> {candidate.schedule || "May 20, 2025 • 11:00 AM"}</span>
        ) : isSelected ? (
          <span className="inline-flex min-w-0 items-center gap-1 truncate"><CheckCircle2 className="h-3.5 w-3.5" /> Selected on May 18, 2025</span>
        ) : (
          <>
            <span>{candidate.experience} yrs exp</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {candidate.city}</span>
          </>
        )}
      </div>

      {isSelected ? (
        <div className="mt-3 flex h-8 items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 text-xs font-black text-green-700">
          <CheckCircle2 className="h-4 w-4" /> Hired
        </div>
      ) : candidate.stage === "Recommended" ? (
        <button type="button" onClick={onViewProfile} className="mt-3 h-8 w-full rounded-lg border border-slate-200 bg-white text-xs font-black text-blue-700 transition hover:bg-blue-50">
          View Profile
        </button>
      ) : (
        <div className="mt-3">
          <MoveSelect value={candidate.stage} stages={stages} onMove={onMove} />
        </div>
      )}
    </article>
  );
}

function PipelineColumn({ stage, candidates, stages, onMove, onViewProfile, onDrop, onDragOver, onDragStart, onDragEnd }) {
  const style = stageStyles[stage.color];
  return (
    <section
      onDrop={() => onDrop(stage.key)}
      onDragOver={onDragOver}
      className={`flex min-h-0 min-w-[214px] flex-col rounded-[14px] border border-slate-200 border-t-[3px] ${style.top} bg-white p-3 shadow-[0_10px_26px_rgba(15,23,42,0.04)]`}
    >
      <header className="shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-black text-slate-950">{stage.title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-black ${style.badge}`}>{stage.count}</span>
        </div>
        <p className="mt-2 text-xs font-bold leading-5 text-slate-500">{stage.subtitle}</p>
      </header>

      <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            stages={stages}
            onMove={(nextStage) => onMove(candidate, nextStage)}
            onViewProfile={() => onViewProfile(candidate.workerId)}
            draggable
            onDragStart={() => onDragStart(candidate)}
            onDragEnd={onDragEnd}
          />
        ))}
        {!candidates.length && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs font-bold text-slate-500">Drop candidates here</div>
        )}
      </div>

      <button type="button" className="mt-3 h-9 shrink-0 rounded-lg border border-slate-200 bg-white text-xs font-black text-blue-700 transition hover:bg-blue-50">
        View all {stage.title.toLowerCase()} <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
      </button>
    </section>
  );
}

function MiniChart() {
  return (
    <svg viewBox="0 0 96 36" className="h-10 w-24 text-blue-600" fill="none" aria-hidden="true">
      <path d="M3 27 L19 18 L34 22 L48 8 L63 24 L78 10 L93 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="48" cy="8" r="2.5" fill="currentColor" />
      <circle cx="78" cy="10" r="2.5" fill="currentColor" />
    </svg>
  );
}

function PipelineInsights({ isDemoMode, applications }) {
  const hasActivity = isDemoMode || applications.length > 0;

  return (
    <aside className="hidden min-h-0 space-y-4 overflow-y-auto xl:block">
      <Card className="p-4">
        <h3 className="flex items-center gap-2 text-base font-black text-slate-950"><BarChart3 className="h-5 w-5 text-blue-600" /> Pipeline Insights</h3>
        <div className="mt-4 space-y-3">
          {[
            ["Conversion Rate", "18.8%", "↑ 6.4% vs last week"],
            ["Avg. Time to Hire", "12 days", "↓ 2 days vs last week"]
          ].map(([label, value, trend]) => (
            <div key={label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
              <div>
                <p className="text-xs font-bold text-slate-500">{label}</p>
                <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-black text-green-600">{trend}</p>
              </div>
              <MiniChart />
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
            <div>
              <p className="text-xs font-bold text-slate-500">Top Source</p>
              <p className="mt-2 text-lg font-black text-slate-950">Job Postings</p>
              <p className="mt-1 text-xs font-bold text-slate-500">68% of total hires</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-base font-black text-slate-950">Recent Activity</h3>
        {hasActivity ? (
          <>
            <div className="mt-4 space-y-4">
              {(isDemoMode ? [
                ["Imran Khan", "interview scheduled", "2m ago", CalendarDays, "bg-violet-50 text-violet-700"],
                ["Ramesh Patel", "moved to Shortlisted", "15m ago", CheckCircle2, "bg-blue-50 text-blue-700"],
                ["Asha Kumari", "recommended", "1h ago", Users, "bg-green-50 text-green-700"]
              ] : applications.slice(0, 3).map((item) => [
                item.worker?.name || "Candidate",
                `moved to ${item.status}`,
                "recently",
                CheckCircle2,
                "bg-blue-50 text-blue-700"
              ])).map(([name, copy, time, Icon, tone]) => (
                <div key={`${name}-${copy}`} className="flex items-start gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${tone}`}><Icon className="h-4 w-4" /></span>
                  <p className="min-w-0 flex-1 text-xs font-bold leading-5 text-slate-600"><span className="font-black text-slate-950">{name}</span> {copy}</p>
                  <span className="text-[11px] font-bold text-slate-400">{time}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-4 h-8 w-full border-t border-slate-100 pt-3 text-xs font-black text-blue-700">View all activity <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button>
          </>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs font-bold leading-5 text-slate-500">No real pipeline activity yet. Candidate movement will appear here once applicants enter your hiring flow.</p>
        )}
      </Card>
    </aside>
  );
}

function HiringCTA({ onFindWorkers }) {
  return (
    <Card className="flex h-[76px] items-center justify-between overflow-hidden px-5">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-28 shrink-0">
          <span className="absolute bottom-1 left-2 h-12 w-12 rounded-full bg-blue-100" />
          <span className="absolute bottom-1 left-14 h-12 w-12 rounded-full bg-green-100" />
          <span className="absolute bottom-3 left-8 grid h-10 w-10 place-items-center rounded-full bg-blue-600 text-xs font-black text-white">AI</span>
        </div>
        <div>
          <h3 className="text-base font-black text-blue-700">Find the right talent, faster.</h3>
          <p className="mt-1 text-xs font-bold text-slate-600">Use AI insights, smart filters, and personalized recommendations to build your perfect team.</p>
        </div>
      </div>
      <button type="button" onClick={onFindWorkers} className="hidden h-10 items-center gap-2 rounded-lg bg-blue-600 px-8 text-sm font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 md:inline-flex">
        Find Workers <ArrowRight className="h-4 w-4" />
      </button>
    </Card>
  );
}

export function EmployerHiringPipelinePage({
  applications,
  workers,
  stages,
  roleLabel,
  cityLabel,
  navigateTo,
  updateApplicationStage,
  isEmployerDemoMode = false
}) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("Best Match");
  const [stageOverrides, setStageOverrides] = useState({});
  const [draggedCandidate, setDraggedCandidate] = useState(null);
  const displayStages = ["Recommended", "Shortlisted", "Interview Scheduled", "Selected"];
  const stageOptions = stages?.length ? stages.filter((stage) => displayStages.includes(stage)) : displayStages;

  const baseCandidates = useMemo(() => {
    const fromApps = applications.map((item, index) => ({
      id: item.id,
      applicationId: item.id,
      workerId: item.workerId,
      name: item.worker?.name,
      role: item.job?.title || roleLabel(item.worker?.skill),
      originalStage: item.status,
      stage: stageOverrides[item.id] || item.status,
      match: item.matchScore || item.worker?.jobMatch || 95,
      experience: item.worker?.experience || 4,
      city: cityLabel(item.worker?.city),
      photoUrl: item.worker?.photoUrl,
      synthetic: false,
      schedule: index === 3 ? "May 20, 2025 • 11:00 AM" : ""
    }));
    const existingNames = new Set(fromApps.map((candidate) => candidate.name));
    const extras = isEmployerDemoMode ? extraCandidates
      .filter((candidate) => !existingNames.has(candidate.name))
      .map((candidate, index) => ({
        ...candidate,
        stage: stageOverrides[candidate.id] || candidate.stage,
        originalStage: candidate.stage,
        workerId: workers.find((worker) => worker.name === candidate.name)?.workerId || workers[index % Math.max(1, workers.length)]?.workerId || candidate.id,
        photoUrl: workers.find((worker) => worker.name === candidate.name)?.photoUrl || workers[index % Math.max(1, workers.length)]?.photoUrl,
        synthetic: true
      })) : [];
    return [...fromApps, ...extras];
  }, [applications, cityLabel, isEmployerDemoMode, roleLabel, stageOverrides, workers]);

  const filteredCandidates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? baseCandidates.filter((candidate) => [candidate.name, candidate.role, candidate.city, String(candidate.match)].join(" ").toLowerCase().includes(normalized))
      : baseCandidates;
    return [...filtered].sort((a, b) => {
      if (sortBy === "Name") return String(a.name).localeCompare(String(b.name));
      if (sortBy === "Experience") return Number(b.experience) - Number(a.experience);
      return Number(b.match) - Number(a.match);
    });
  }, [baseCandidates, query, sortBy]);

  function moveCandidate(candidate, nextStage) {
    setStageOverrides((current) => ({ ...current, [candidate.id]: nextStage }));
    if (!candidate.synthetic && candidate.applicationId) updateApplicationStage(candidate.applicationId, nextStage);
  }

  const actualPipelineCount = baseCandidates.filter((candidate) => displayStages.includes(candidate.stage)).length;
  const interviewCount = baseCandidates.filter((candidate) => candidate.stage === "Interview Scheduled").length;
  const selectedCount = baseCandidates.filter((candidate) => candidate.stage === "Selected").length;
  const averageMatch = baseCandidates.length
    ? Math.round(baseCandidates.reduce((total, candidate) => total + Number(candidate.match || 0), 0) / baseCandidates.length)
    : 0;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/80 px-2 py-1 lg:px-3">
      <div className="shrink-0">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17.5rem]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total Candidates" value={isEmployerDemoMode ? "128" : baseCandidates.length} trend={isEmployerDemoMode ? "↑ 18% this week" : `${averageMatch}% avg AI match`} tone={{ bg: "from-blue-50 to-white", icon: "bg-blue-100 text-blue-700" }} />
            <StatCard icon={CheckCircle2} label="In Pipeline" value={isEmployerDemoMode ? "32" : actualPipelineCount} trend={isEmployerDemoMode ? "↑ 12% this week" : "Live workspace data"} tone={{ bg: "from-green-50 to-white", icon: "bg-green-100 text-green-700" }} />
            <StatCard icon={CalendarDays} label="Interviews Scheduled" value={isEmployerDemoMode ? "14" : interviewCount} trend={isEmployerDemoMode ? "↑ 8% this week" : "From current applicants"} tone={{ bg: "from-violet-50 to-white", icon: "bg-violet-100 text-violet-700" }} />
            <StatCard icon={UserCheck} label="Selected" value={isEmployerDemoMode ? "6" : selectedCount} trend={isEmployerDemoMode ? "↑ 20% this week" : "Real selections only"} tone={{ bg: "from-orange-50 to-white", icon: "bg-orange-100 text-orange-600" }} />
          </div>
          <AIHiringBanner onClick={() => navigateTo("/employer/analytics")} />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">Hiring Pipeline</h2>
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search candidates, roles, city..." className="h-9 w-64 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
            </label>
            <label className="relative">
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-9 appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs font-black text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
                <option>Best Match</option>
                <option>Name</option>
                <option>Experience</option>
                <option>Recently Added</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </label>
            <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-600"><Filter className="h-4 w-4" /> Filter</button>
            <span className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
              <button type="button" className="grid h-9 w-9 place-items-center bg-blue-600 text-white"><Grid3X3 className="h-4 w-4" /></button>
              <button type="button" className="grid h-9 w-9 place-items-center text-slate-500"><List className="h-4 w-4" /></button>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="flex min-h-0 flex-col gap-4">
          <div className="grid min-h-0 flex-1 gap-4 overflow-x-auto pb-1 lg:grid-cols-4">
            {pipelineStages.map((stage) => (
              <PipelineColumn
                key={stage.key}
                stage={stage}
                candidates={filteredCandidates.filter((candidate) => candidate.stage === stage.key)}
                stages={stageOptions}
                onMove={moveCandidate}
                onViewProfile={(workerId) => navigateTo(`/employer/workers/${workerId}`)}
                onDragStart={(candidate) => setDraggedCandidate(candidate)}
                onDragEnd={() => setDraggedCandidate(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(nextStage) => {
                  if (draggedCandidate) moveCandidate(draggedCandidate, nextStage);
                  setDraggedCandidate(null);
                }}
              />
            ))}
          </div>
          <HiringCTA onFindWorkers={() => navigateTo("/employer/workers")} />
        </div>
        <PipelineInsights isDemoMode={isEmployerDemoMode} applications={applications} />
      </div>
    </section>
  );
}
