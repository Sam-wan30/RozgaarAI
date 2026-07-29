import {
  Bell,
  Bookmark,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Compass,
  Gauge,
  MoreVertical,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { useState } from "react";

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-[16px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${className}`}>
      {children}
    </section>
  );
}

function Chip({ children, active, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-7 rounded-lg border px-2.5 text-[11px] font-extrabold transition hover:border-blue-200 hover:bg-blue-50 ${
        active ? "border-blue-300 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-700"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, value, label, tone }) {
  return (
    <div className="flex min-h-[90px] items-center gap-4 border-slate-100 px-5 lg:border-r lg:last:border-r-0">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[28px] font-black leading-none text-slate-950">{value}</p>
        <p className="mt-1 truncate text-[13px] font-bold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function StatsCards({ workers }) {
  return (
    <Card className="grid shrink-0 overflow-hidden lg:grid-cols-4">
      <StatCard icon={Users} value="158" label="Matched Workers" tone="bg-blue-50 text-blue-700" />
      <StatCard icon={TrendingUp} value="95%" label="Average Match" tone="bg-emerald-50 text-emerald-600" />
      <StatCard icon={ClipboardCheck} value="143" label="Verified Workers" tone="bg-green-50 text-green-700" />
      <StatCard icon={ShieldCheck} value="48" label="Ready to Join Today" tone="bg-amber-50 text-amber-600" />
    </Card>
  );
}

function AIRecruiter({ onClick }) {
  return (
    <Card className="hidden min-h-[90px] items-center justify-between gap-4 bg-gradient-to-r from-white to-violet-50/80 p-5 xl:flex">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700 shadow-[0_10px_24px_rgba(124,58,237,0.16)]">
          <Bot className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-black text-violet-700">AI Recruiter</h3>
          <p className="mt-1 truncate text-xs font-bold text-slate-600">Get AI recommendations for your job</p>
        </div>
      </div>
      <button type="button" onClick={onClick} className="min-h-9 shrink-0 rounded-lg bg-violet-600 px-4 text-xs font-black text-white shadow-[0_10px_18px_rgba(109,40,217,0.18)] transition hover:bg-violet-700">
        Get Suggestions
      </button>
    </Card>
  );
}

function FilterGroup({ title, children, open = false }) {
  return (
    <details className="group" open={open}>
      <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-black text-slate-950">
        {title}
        <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
      </summary>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </details>
  );
}

function FilterPanel({
  filters,
  workerFilters,
  smartFilters,
  setFilters,
  setWorkerFilters,
  setSmartFilters,
  clearFilters,
  roleLabel,
  cityLabel,
  cities,
  jobRoles
}) {
  const toggleSmart = (key) => setSmartFilters((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);

  return (
    <Card className="hidden h-full min-h-0 flex-col overflow-hidden lg:flex">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
        <h2 className="text-lg font-black text-slate-950">Filters</h2>
        <button type="button" onClick={clearFilters} className="text-xs font-black text-blue-700 hover:text-blue-800">Clear All</button>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <FilterGroup title="Location" open>
          {cities.slice(0, 5).map((city) => (
            <Chip key={city} active={filters.city === city} onClick={() => setFilters({ ...filters, city: filters.city === city ? "" : city })}>{cityLabel(city)}</Chip>
          ))}
          <Chip className="border-transparent px-1 text-blue-700" onClick={() => {}}>+ More</Chip>
        </FilterGroup>

        <FilterGroup title="Primary Skill" open>
          <label className="relative block w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.skill}
              onChange={(event) => setFilters({ ...filters, skill: event.target.value })}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-2 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">Search skills</option>
              {jobRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
            </select>
          </label>
          {jobRoles.slice(0, 6).map((role) => (
            <Chip key={role} active={filters.skill === role} onClick={() => setFilters({ ...filters, skill: filters.skill === role ? "" : role })}>{roleLabel(role)}</Chip>
          ))}
        </FilterGroup>

        <FilterGroup title="Experience" open>
          {[["", "0 - 2 years"], ["3", "3 - 5 years"], ["5", "5+ years"]].map(([value, label]) => (
            <Chip key={label} active={workerFilters.experience === value} onClick={() => setWorkerFilters({ ...workerFilters, experience: value })}>{label}</Chip>
          ))}
        </FilterGroup>

        <FilterGroup title="Max Wage (₹/month)">
          {[["", "Any"], ["15000", "< 15k"], ["25000", "15k - 25k"], ["40000", "25k - 40k"]].map(([value, label]) => (
            <Chip key={label} active={workerFilters.wageMax === value} onClick={() => setWorkerFilters({ ...workerFilters, wageMax: value })}>{label}</Chip>
          ))}
        </FilterGroup>

        <FilterGroup title="Readiness">
          {[["", "Any"], ["90", "Available Now"], ["80", "Within 7 Days"]].map(([value, label]) => (
            <Chip key={label} active={workerFilters.readiness === value} onClick={() => setWorkerFilters({ ...workerFilters, readiness: value })}>{label}</Chip>
          ))}
        </FilterGroup>

        <FilterGroup title="Languages">
          {["Hindi", "English", "Bengali", "Tamil"].map((language) => (
            <Chip key={language} active={workerFilters.language === language} onClick={() => setWorkerFilters({ ...workerFilters, language: workerFilters.language === language ? "" : language })}>{language}</Chip>
          ))}
        </FilterGroup>

        <details className="group rounded-lg border border-slate-100 bg-white p-2.5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-black text-slate-950">
            Verification
            <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
          </summary>
          <label className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm font-black text-slate-800">Verified Only</span>
            <button
              type="button"
              onClick={() => toggleSmart("Verified Only")}
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${smartFilters.includes("Verified Only") ? "bg-blue-600" : "bg-slate-200"}`}
              aria-pressed={smartFilters.includes("Verified Only")}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${smartFilters.includes("Verified Only") ? "left-6" : "left-1"}`} />
            </button>
          </label>
        </details>
      </div>
    </Card>
  );
}

function MatchScore({ value }) {
  const score = Number(value || 0);
  return (
    <div className="flex flex-col items-center">
      <div className="grid h-[86px] w-[86px] place-items-center rounded-full p-[5px]" style={{ background: `conic-gradient(#16a34a ${score * 3.6}deg, #e2e8f0 0deg)` }}>
        <div className="grid h-full w-full place-items-center rounded-full bg-white">
          <div>
            <p className="text-[24px] font-black leading-none text-slate-950">{score}%</p>
            <p className="mt-1 text-xs font-black text-green-700">Match</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs font-black text-green-700">Excellent Match</p>
    </div>
  );
}

function AIRecommendation({ worker }) {
  const role = worker.skill || "role";
  return (
    <div className="rounded-lg border border-violet-100 bg-violet-50/75 px-3 py-2.5">
      <p className="flex items-center gap-2 text-xs font-black text-violet-700"><Sparkles className="h-4 w-4" /> AI Recommendation</p>
      <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-slate-700">
        {worker.name.split(" ")[0]} has {worker.experience}+ years of similar {role.toLowerCase()} work, strong verification, and wage expectations aligned with this role.
      </p>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <span className="block h-full rounded-full bg-green-600" style={{ width: `${value}%` }} />
    </div>
  );
}

function WorkerPhoto({ worker }) {
  const initials = worker.avatar || worker.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("");
  return (
    <div className="relative h-[100px] w-[88px] shrink-0 rounded-[14px] bg-gradient-to-br from-blue-600 to-emerald-500 p-0.5 shadow-[0_14px_30px_rgba(37,99,235,0.18)]">
      {worker.photoUrl ? (
        <img src={worker.photoUrl} alt="" className="h-full w-full rounded-[12px] object-cover" />
      ) : (
        <span className={`grid h-full w-full place-items-center rounded-[12px] bg-gradient-to-br ${worker.gradient || "from-blue-600 to-emerald-500"} text-lg font-black text-white`}>{initials}</span>
      )}
      <span className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-sm" />
      <span className="absolute -bottom-2 left-2 inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-black text-green-700 shadow-sm">
        <CheckCircle2 className="h-3 w-3" /> Verified
      </span>
    </div>
  );
}

function WorkerCard({
  worker,
  roleLabel,
  cityLabel,
  onViewProfile,
  onShortlist,
  onInterview,
  onMessage,
  onCompare,
  isMenuOpen = false,
  onToggleMenu
}) {
  const skills = [worker.skill, "Fitting", "Repair", "Maintenance"].filter(Boolean).slice(0, 4);
  const score = Number(worker.jobMatch || 90);
  const readiness = Number(worker.readiness || 88);
  const reliability = ((Number(worker.interviewScore || readiness) / 20) || 4.6).toFixed(1);

  return (
    <article className="group rounded-[16px] border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.045)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_104px_154px]">
        <div className="flex min-w-0 gap-3">
          <WorkerPhoto worker={worker} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[17px] font-black leading-5 text-slate-950">{worker.name}</h3>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-black text-green-700">Verified Worker</span>
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-slate-600">
              <span>{roleLabel(worker.skill)}</span>
              <span className="text-slate-300">•</span>
              <span>{cityLabel(worker.city)}</span>
              <span className="text-slate-300">•</span>
              <span>{worker.experience} years exp</span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-black">
              <span className="text-slate-800">₹{Number(worker.expectedWage || 0).toLocaleString("en-IN")}/mo</span>
              <span className="text-slate-300">•</span>
              <span className={/available|immediate|now/i.test(worker.availability || "") ? "text-green-700" : "text-amber-600"}>{/available/i.test(worker.availability || "") ? "Available Now" : worker.availability}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {["Aadhaar Verified", "eShram Linked", "Police Verified"].slice(0, 3).map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-black text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> {badge}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-black text-slate-950">Skills:</span>
              {skills.slice(0, 4).map((skill) => (
                <span key={skill} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-black text-slate-600">{roleLabel(skill)}</span>
              ))}
              <span className="text-[11px] font-black text-slate-500">+2</span>
            </div>
            <div className="mt-2 max-w-[420px]">
              <AIRecommendation worker={worker} />
            </div>
          </div>
        </div>

        <MatchScore value={score} />

        <div className="relative flex flex-col justify-between gap-2">
          <div className="flex items-center gap-2">
            <button type="button" onClick={onViewProfile} className="min-h-9 flex-1 rounded-lg bg-blue-600 px-3 text-xs font-black text-white shadow-[0_8px_16px_rgba(37,99,235,0.2)] transition hover:bg-blue-700">View Profile</button>
            <button
              type="button"
              aria-label={`Open actions for ${worker.name}`}
              aria-expanded={isMenuOpen}
              title="More actions"
              onClick={onToggleMenu}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          {isMenuOpen && (
            <div className="absolute right-2 top-11 z-10 w-[136px] rounded-lg border border-slate-200 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
              {[
                [ShieldCheck, "Shortlist", onShortlist],
                [CalendarDays, "Invite to Interview", onInterview],
                [Bot, "Message", onMessage],
                [Users, "Compare", onCompare],
                [ShieldCheck, "Not Interested", () => {}]
              ].map(([Icon, label, action]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    action();
                    onToggleMenu();
                  }}
                  className="flex min-h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[11px] font-black text-slate-600 hover:bg-slate-50"
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          )}
          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
            <p className="text-xs font-black text-slate-600">Readiness</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-black text-slate-950">{readiness}%</span>
              <div className="flex-1"><ProgressBar value={readiness} /></div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-600">Reliability</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-slate-700"><span className="text-amber-400">★</span> {reliability}/5</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MapCard({ workers }) {
  const pins = workers.slice(0, 5);
  return (
    <Card className="overflow-hidden p-4">
      <h2 className="text-base font-black text-slate-950">Map View</h2>
      <p className="mt-1 text-xs font-bold text-slate-500">See workers near you</p>
      <div className="relative mt-3 h-[206px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <div className="absolute inset-0 bg-[linear-gradient(35deg,rgba(148,163,184,0.22)_1px,transparent_1px),linear-gradient(125deg,rgba(148,163,184,0.22)_1px,transparent_1px)] bg-[length:36px_36px]" />
        <div className="absolute left-[-10%] top-[42%] h-5 w-[125%] rotate-[-12deg] rounded-full bg-white/80" />
        <div className="absolute left-[18%] top-[-20%] h-[145%] w-4 rotate-[30deg] rounded-full bg-white/75" />
        <div className="absolute bottom-7 right-[-8%] h-5 w-[80%] rotate-[21deg] rounded-full bg-white/80" />
        {pins.map((worker, index) => (
          <span
            key={worker.workerId || worker.name}
            className="absolute grid h-9 w-9 place-items-center rounded-full bg-blue-600 p-0.5 text-xs font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.32)]"
            style={{ left: `${18 + (index * 17) % 62}%`, top: `${22 + (index * 23) % 50}%` }}
          >
            {worker.photoUrl ? <img src={worker.photoUrl} alt="" className="h-full w-full rounded-full object-cover" /> : index + 1}
          </span>
        ))}
        <button type="button" aria-label="Recenter map" className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm">
          <Compass className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function AIHiringAssistant({ workers, onClick }) {
  const top = workers[0];
  const averageSalary = workers.length
    ? Math.round(workers.reduce((total, worker) => total + Number(worker.expectedWage || 0), 0) / workers.length)
    : 0;

  return (
    <Card className="bg-violet-50/55 p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-100 text-violet-700"><Bot className="h-5 w-5" /></span>
        <h2 className="text-base font-black text-slate-950">AI Hiring Assistant</h2>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700">BETA</span>
      </div>
      <p className="mt-3 text-sm font-black text-slate-900">AI recommendations</p>
      <p className="mt-1 text-xs font-bold leading-5 text-slate-600">{workers.length} candidates match your requirements.</p>
      <div className="mt-3 divide-y divide-violet-100 rounded-xl bg-white/55">
        {[
          [Gauge, "Average Salary", averageSalary ? `₹${averageSalary.toLocaleString("en-IN")}` : "₹0"],
          [Bell, "Shortest Availability", "Within 2 days"],
          [Users, "Top Match", top ? `${top.name} (${top.jobMatch || 90}%)` : "No match yet"]
        ].map(([Icon, label, value]) => (
          <div key={label} className="flex items-center gap-3 px-1 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon className="h-4 w-4" /></span>
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-500">{label}</p>
              <p className="truncate text-sm font-black text-slate-950">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={onClick} className="mt-3 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-violet-300 bg-white text-xs font-black text-violet-700 transition hover:bg-violet-50">
        <Sparkles className="h-4 w-4" /> View AI Recommendations
      </button>
    </Card>
  );
}

function CompareWorkersCard({ workers, selectedIds, onCompare }) {
  const selected = workers.filter((worker) => selectedIds.includes(worker.workerId)).slice(0, 3);
  if (!selectedIds.length) {
    return (
      <Card className="p-4">
        <h2 className="text-base font-black text-slate-950">Compare Workers</h2>
        <p className="mt-1 text-xs font-bold leading-5 text-slate-600">Select workers to compare side by side.</p>
        <button type="button" className="mt-3 min-h-9 w-full rounded-lg border border-blue-200 bg-white text-xs font-black text-blue-700">Compare Now (2)</button>
      </Card>
    );
  }
  return (
    <Card className="p-4">
      <h2 className="text-base font-black text-slate-950">Compare Workers</h2>
      <button type="button" onClick={onCompare} className="mt-3 flex min-h-10 w-full items-center justify-center gap-3 rounded-lg border border-blue-300 bg-white px-3 text-sm font-black text-blue-700 transition hover:bg-blue-50">
        <span className="flex -space-x-2">
          {selected.map((worker) => (
            <span key={worker.workerId || worker.name} className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-emerald-500 text-[10px] text-white">
              {worker.photoUrl ? <img src={worker.photoUrl} alt="" className="h-full w-full rounded-full object-cover" /> : worker.avatar}
            </span>
          ))}
        </span>
        Compare Now ({selected.length})
      </button>
    </Card>
  );
}

export function EmployerFindWorkersPage({
  workers,
  allWorkers,
  selectedCompareWorkers,
  employerSearch,
  setEmployerSearch,
  employerSort,
  setEmployerSort,
  employerFilters,
  setEmployerFilters,
  employerWorkerFilters,
  setEmployerWorkerFilters,
  employerSmartFilters,
  setEmployerSmartFilters,
  clearFilters,
  roleLabel,
  cityLabel,
  cities,
  jobRoles,
  navigateTo,
  shortlistWorker,
  sendEmployerMessage,
  updateDemoWorkerStage,
  toggleCompareWorker,
  isEmployerDemoMode
}) {
  const searchChips = ["electrician in Bhopal", "driver under ₹25k", "female cook", "hindi speaking"];
  const [openActionWorkerId, setOpenActionWorkerId] = useState("");

  return (
    <section className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="flex shrink-0 flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          {searchChips.map((chip) => (
            <button key={chip} type="button" onClick={() => setEmployerSearch(chip)} className="min-h-7 rounded-full border border-blue-200 bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100">
              {chip}
            </button>
          ))}
        </div>
        <button type="button" className="inline-flex min-h-8 w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-50">
          <Bookmark className="h-4 w-4" /> Saved Searches
        </button>
      </div>

      <div className="grid shrink-0 gap-3 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <StatsCards workers={allWorkers} />
        <AIRecruiter onClick={() => setEmployerSmartFilters((current) => current.includes("Highest Match") ? current : [...current, "Highest Match"])} />
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[214px_minmax(0,1fr)] xl:grid-cols-[214px_minmax(0,1fr)_300px] 2xl:grid-cols-[220px_minmax(0,1fr)_310px]">
        <FilterPanel
          filters={employerFilters}
          workerFilters={employerWorkerFilters}
          smartFilters={employerSmartFilters}
          setFilters={setEmployerFilters}
          setWorkerFilters={setEmployerWorkerFilters}
          setSmartFilters={setEmployerSmartFilters}
          clearFilters={clearFilters}
          roleLabel={roleLabel}
          cityLabel={cityLabel}
          cities={cities}
          jobRoles={jobRoles}
        />

        <div className="flex min-h-0 min-w-0 flex-col gap-3">
          <Card className="sticky top-0 z-10 shrink-0 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm font-bold text-slate-600">Showing {workers.length} of 158 workers</p>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 lg:hidden">Filters</button>
                <button type="button" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 2xl:hidden">Insights</button>
                <span className="text-sm font-black text-slate-600">Sort by</span>
                <select value={employerSort} onChange={(event) => setEmployerSort(event.target.value)} className="h-9 w-44 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
                  <option value="match">Best Match</option>
                  <option value="readiness">Readiness</option>
                  <option value="experience">Experience</option>
                  <option value="wage">Lowest Wage</option>
                </select>
              </div>
            </div>
            <label className="relative mt-3 block xl:hidden">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={employerSearch} onChange={(event) => setEmployerSearch(event.target.value)} placeholder="Search workers by skill, job, location, language..." className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm font-bold outline-none" />
            </label>
          </Card>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {workers.length ? workers.map((worker) => {
              const workerId = worker.workerId || worker.name;
              return (
                <WorkerCard
                  key={workerId}
                  worker={worker}
                  roleLabel={roleLabel}
                  cityLabel={cityLabel}
                  onViewProfile={() => navigateTo(`/employer/workers/${workerId}`)}
                  onShortlist={() => shortlistWorker(workerId)}
                  onInterview={() => isEmployerDemoMode ? updateDemoWorkerStage(workerId, "Interview Scheduled") : navigateTo("/employer/applicants")}
                  onMessage={() => sendEmployerMessage(workerId)}
                  onCompare={() => toggleCompareWorker(workerId)}
                  isMenuOpen={openActionWorkerId === workerId}
                  onToggleMenu={() => setOpenActionWorkerId((current) => current === workerId ? "" : workerId)}
                />
              );
            }) : (
              <Card className="p-8 text-center text-sm font-bold text-slate-600">No search results. Try broadening city, skill, or wage filters.</Card>
            )}
          </div>
        </div>

        <aside className="hidden min-h-0 space-y-3 overflow-y-auto xl:block">
          <MapCard workers={allWorkers} />
          <AIHiringAssistant workers={workers} onClick={() => setEmployerSmartFilters((current) => current.includes("Highest Match") ? current : [...current, "Highest Match"])} />
          <CompareWorkersCard workers={allWorkers} selectedIds={selectedCompareWorkers} onCompare={() => {}} />
        </aside>
      </div>
    </section>
  );
}
