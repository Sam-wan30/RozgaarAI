import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Copy,
  Eye,
  FilePenLine,
  Filter,
  Globe2,
  HandHeart,
  HeartHandshake,
  IndianRupee,
  Info,
  LayoutGrid,
  Link2,
  List,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquarePlus,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Upload,
  UserPlus,
  Users,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import addWorkerHeroReference from "../../assets/ngo-add-worker-hero-reference.png";
import { cities, demoProfiles } from "../../data/mockData";
import { database } from "../../lib/database";

const ownershipCopy = "Worker identities remain owned by workers. Your organization can assist, verify and support workers only with their permission.";

const associationLabels = {
  invited: "Invitation Sent",
  pending: "Consent Pending",
  linked: "Linked",
  limited: "Limited Access",
  revoked: "Access Revoked",
  former: "Former Association"
};

const consentLabels = {
  not_requested: "Not Requested",
  pending: "Pending",
  granted: "Granted",
  declined: "Declined",
  revoked: "Revoked"
};

const accessLevelLabels = {
  basic_support: "Basic support",
  profile_assistance: "Profile assistance",
  training_and_placement: "Training and placement"
};

const badgeTone = {
  linked: "border-green-100 bg-green-50 text-green-700",
  granted: "border-green-100 bg-green-50 text-green-700",
  invited: "border-blue-100 bg-blue-50 text-blue-700",
  pending: "border-amber-100 bg-amber-50 text-amber-700",
  limited: "border-sky-100 bg-sky-50 text-sky-700",
  declined: "border-rose-100 bg-rose-50 text-rose-700",
  revoked: "border-rose-100 bg-rose-50 text-rose-700",
  former: "border-slate-200 bg-slate-50 text-slate-600",
  available: "border-green-100 bg-green-50 text-green-700",
  employed: "border-violet-100 bg-violet-50 text-violet-700",
  not_employed: "border-slate-200 bg-white text-slate-600"
};

const supportStatusOptions = [
  "new",
  "profile_assistance_needed",
  "training_support",
  "job_search_support",
  "interview_support",
  "placed",
  "follow_up_needed",
  "inactive"
];

function titleCase(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "No activity yet";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function StatusBadge({ value, label }) {
  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-black ${badgeTone[value] || "border-slate-200 bg-white text-slate-600"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label || associationLabels[value] || consentLabels[value] || titleCase(value)}
    </span>
  );
}

function WorkerAvatar({ worker, size = "h-11 w-11" }) {
  return (
    <span className={`${size} grid shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-blue-50 text-sm font-black text-blue-700 shadow-sm`}>
      {worker?.photoUrl ? <img src={worker.photoUrl} alt="" className="h-full w-full object-cover" /> : worker?.avatar || "WK"}
    </span>
  );
}

function CardShell({ children, className = "" }) {
  return <section className={`rounded-[18px] border border-slate-200 bg-white shadow-[0_18px_54px_rgba(15,23,42,0.055)] ${className}`}>{children}</section>;
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return <input {...props} className={`min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 ${props.className || ""}`} />;
}

function Select(props) {
  return <select {...props} className={`min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 ${props.className || ""}`} />;
}

function Textarea(props) {
  return <textarea {...props} className={`min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 ${props.className || ""}`} />;
}

function NgoWorkerPrivacyNotice() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="flex min-h-10 items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/85 px-4 py-2 text-sm font-bold text-blue-800 shadow-sm">
      <div className="flex min-w-0 items-center gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        <p className="min-w-0 truncate">
          <span className="font-black">Worker identities remain owned by workers.</span>
          <span className="ml-1 text-blue-700">Your organization only accesses shared information.</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button type="button" className="text-xs font-black text-blue-700 underline-offset-4 hover:underline">Learn More</button>
        <button type="button" onClick={() => setDismissed(true)} className="grid h-7 w-7 place-items-center rounded-lg text-blue-700 hover:bg-blue-100" aria-label="Dismiss worker privacy notice">
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="min-h-[66px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
      <div className="flex h-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${tone}`}>
            <Icon className="h-4 w-4" />
          </span>
          <p className="min-w-0 truncate text-sm font-black text-slate-700">{label}</p>
        </div>
        <p className="shrink-0 text-[30px] font-black leading-none text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function SelectControl({ value, onChange, children, className = "", label }) {
  return (
    <label className={`relative block ${className}`}>
      {label && <span className="sr-only">{label}</span>}
      <select value={value} onChange={onChange} className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-3 pr-8 text-sm font-black text-slate-800 outline-none transition hover:border-blue-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

function AddWorkerMenu({ open, onToggle, navigateTo, setStatusMessage }) {
  const items = [
    ["Invite Existing Worker", UserPlus, () => navigateTo("/ngo/workers/invite")],
    ["Register New Worker", Plus, () => navigateTo("/ngo/workers/add")],
    ["Bulk Import Workers", Upload, () => setStatusMessage?.("Bulk import workflow is not available in this demo yet.")]
  ];
  return (
    <div className="relative">
      <button type="button" onClick={onToggle} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 text-sm font-black text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(37,99,235,0.32)]">
        <Plus className="h-4 w-4" /> Add Worker <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          {items.map(([label, Icon, action]) => (
            <button key={label} type="button" onClick={action} className="flex min-h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700">
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkerFiltersDrawer({ open, onClose, filters, setFilters, skills, locations }) {
  if (!open) return null;
  const resetFilters = () => setFilters({ associationStatus: "", consentStatus: "", primarySkill: "", location: "", profileCompletion: "", availability: "", employmentStatus: "", dateRange: "" });
  return (
    <div className="fixed inset-0 z-40">
      <button type="button" className="absolute inset-0 bg-slate-950/25" onClick={onClose} aria-label="Close filters" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex min-h-16 items-center justify-between border-b border-slate-100 px-5">
          <div>
            <h3 className="text-lg font-black text-slate-950">Filters</h3>
            <p className="text-xs font-bold text-slate-500">Refine workers without changing table data.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Close filter drawer">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <section>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Worker</p>
            <SelectControl label="Location" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
              <option value="">Any location</option>{locations.map((city) => <option key={city} value={city}>{city}</option>)}
            </SelectControl>
          </section>
          <section>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Skills</p>
            <SelectControl label="Skill" value={filters.primarySkill} onChange={(e) => setFilters({ ...filters, primarySkill: e.target.value })}>
              <option value="">Any skill</option>{skills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
            </SelectControl>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Consent</p>
              <SelectControl label="Consent" value={filters.consentStatus} onChange={(e) => setFilters({ ...filters, consentStatus: e.target.value })}>
                <option value="">Any consent</option>{Object.entries(consentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </SelectControl>
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Association</p>
              <SelectControl label="Association" value={filters.associationStatus} onChange={(e) => setFilters({ ...filters, associationStatus: e.target.value })}>
                <option value="">Any status</option>{Object.entries(associationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </SelectControl>
            </div>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Employment</p>
              <SelectControl label="Employment" value={filters.employmentStatus} onChange={(e) => setFilters({ ...filters, employmentStatus: e.target.value })}>
                <option value="">Any employment</option><option value="not_employed">Not employed</option><option value="employed">Employed</option>
              </SelectControl>
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Availability</p>
              <SelectControl label="Availability" value={filters.availability} onChange={(e) => setFilters({ ...filters, availability: e.target.value })}>
                <option value="">Any availability</option><option value="Available">Available</option><option value="Not set">Not set</option>
              </SelectControl>
            </div>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Profile</p>
              <SelectControl label="Profile" value={filters.profileCompletion} onChange={(e) => setFilters({ ...filters, profileCompletion: e.target.value })}>
                <option value="">Any profile</option><option value="needs_help">Needs review</option><option value="complete">Mostly complete</option>
              </SelectControl>
            </div>
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Date</p>
              <SelectControl label="Date" value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}>
                <option value="">Any activity date</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="older">Older than 30 days</option>
              </SelectControl>
            </div>
          </section>
        </div>
        <div className="grid gap-3 border-t border-slate-100 p-5 sm:grid-cols-2">
          <button type="button" onClick={resetFilters} className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700 hover:bg-slate-50">Reset</button>
          <button type="button" onClick={onClose} className="h-11 rounded-xl bg-blue-600 text-sm font-black text-white hover:bg-blue-700">Apply Filters</button>
        </div>
      </aside>
    </div>
  );
}

function filterWorkers(workers, filters, search) {
  const query = search.trim().toLowerCase();
  const now = Date.now();
  return workers.filter((worker) => {
    const searchable = [
      worker.name,
      worker.workerId,
      worker.canViewPrivate ? worker.phone : "",
      worker.canViewPrivate ? worker.email : "",
      worker.primarySkill,
      worker.city
    ].join(" ").toLowerCase();
    const lastActivityAgeDays = worker.lastActivity ? (now - new Date(worker.lastActivity).getTime()) / 86400000 : Infinity;
    return (!query || searchable.includes(query))
      && (!filters.associationStatus || worker.associationStatus === filters.associationStatus)
      && (!filters.consentStatus || worker.consentStatus === filters.consentStatus)
      && (!filters.primarySkill || worker.primarySkill === filters.primarySkill)
      && (!filters.location || worker.city === filters.location)
      && (!filters.availability || worker.availability === filters.availability)
      && (!filters.employmentStatus || worker.employmentStatus === filters.employmentStatus)
      && (!filters.profileCompletion || (filters.profileCompletion === "needs_help" ? worker.profileCompletion < 75 : worker.profileCompletion >= 75))
      && (!filters.dateRange || (filters.dateRange === "7d" ? lastActivityAgeDays <= 7 : filters.dateRange === "30d" ? lastActivityAgeDays <= 30 : lastActivityAgeDays > 30));
  });
}

function sortWorkers(workers, sortBy) {
  const rows = [...workers];
  if (sortBy === "name") return rows.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "completion") return rows.sort((a, b) => b.profileCompletion - a.profileCompletion);
  if (sortBy === "consent_pending") return rows.sort((a, b) => Number(b.consentStatus === "pending") - Number(a.consentStatus === "pending"));
  if (sortBy === "available") return rows.sort((a, b) => Number(/available/i.test(b.availability)) - Number(/available/i.test(a.availability)));
  return rows.sort((a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0));
}

function WorkerActions({ worker, navigateTo, onRefresh, account }) {
  const [open, setOpen] = useState(false);
  const canAssist = worker.canViewPrivate && worker.consentStatus === "granted";
  const canResend = ["invited", "pending"].includes(worker.associationStatus) && worker.consentStatus === "pending";

  async function run(action) {
    setOpen(false);
    if (action === "resend") await database.resendWorkerInvitation(worker.association.id, account);
    if (action === "available") await database.updateOrganizationSupportStatus({ organizationId: worker.association.organizationId, associationId: worker.association.id, account, availabilityOverride: "Available" });
    if (action === "revoke" && window.confirm("Revoke organization access? The worker account and historical activity will remain.")) await database.revokeWorkerOrganizationAccess(worker.association.id, account);
    if (action === "former" && window.confirm("Mark this relationship as former? This will not delete the worker account.")) await database.endWorkerOrganizationAssociation(worker.association.id, account);
    await onRefresh?.();
  }

  const actions = [
    ["View Profile", Eye, () => navigateTo(`/ngo/workers/${encodeURIComponent(worker.workerProfileId)}`), true],
    ["View Consent Status", LockKeyhole, () => navigateTo(`/ngo/workers/${encodeURIComponent(worker.workerProfileId)}/activity`), true],
    ["Resend Invitation", Bell, () => run("resend"), canResend],
    ["Copy Invitation Link", Copy, () => navigator.clipboard?.writeText(`${window.location.origin}/dashboard/organizations`), canResend],
    ["Assist Profile Completion", FilePenLine, () => navigateTo(`/ngo/workers/${encodeURIComponent(worker.workerProfileId)}/edit-assistance`), canAssist],
    ["Add Follow-Up Note", MessageSquarePlus, () => navigateTo(`/ngo/workers/${encodeURIComponent(worker.workerProfileId)}`), canAssist],
    ["Mark Available", CheckCircle2, () => run("available"), canAssist],
    ["View Activity", ClipboardList, () => navigateTo(`/ngo/workers/${encodeURIComponent(worker.workerProfileId)}/activity`), true],
    ["Revoke Access", XCircle, () => run("revoke"), canAssist],
    ["Remove Former Association", XCircle, () => run("former"), worker.associationStatus === "former"]
  ].filter((item) => item[3]);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label={`Open actions for ${worker.name}`}>
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
          {actions.map(([label, Icon, action]) => (
            <button key={label} type="button" onClick={action} className="flex min-h-9 w-full items-center gap-2 rounded-xl px-3 text-left text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700">
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function createDemoManagedWorkers(organization) {
  const statuses = [
    ["linked", "granted", "job_search_support", "not_employed"],
    ["linked", "granted", "training_support", "not_employed"],
    ["linked", "granted", "placed", "employed"],
    ["invited", "pending", "profile_assistance_needed", "not_employed"],
    ["limited", "granted", "follow_up_needed", "not_employed"]
  ];
  return demoProfiles.map((profile, index) => {
    const [associationStatus, consentStatus, supportStatus, employmentStatus] = statuses[index] || statuses[0];
    const now = new Date(Date.now() - index * 86400000).toISOString();
    return {
      association: {
        id: `demo-association-${profile.workerId}`,
        organizationId: organization?.id || "demo-ngo",
        workerProfileId: profile.workerId,
        associationStatus,
        consentStatus,
        accessLevel: index === 1 ? "training_and_placement" : "profile_assistance",
        supportStatus,
        employmentStatus,
        isCurrent: true,
        linkedAt: now,
        consentGrantedAt: consentStatus === "granted" ? now : "",
        updatedAt: now
      },
      canViewPrivate: consentStatus === "granted",
      workerId: profile.workerId,
      workerProfileId: profile.workerId,
      name: profile.name,
      fullName: profile.name,
      phone: consentStatus === "granted" ? profile.phone : "Private contact hidden",
      email: "",
      photoUrl: profile.photoUrl,
      avatar: profile.avatar,
      primarySkill: profile.skill,
      secondarySkills: profile.badges?.slice(2, 5) || [],
      city: profile.city,
      experience: profile.experience,
      languages: profile.languages,
      availability: profile.availability,
      expectedWage: profile.expectedWage,
      employmentStatus,
      profileCompletion: 92 + index,
      notes: profile.notes,
      lastActivity: now,
      associationStatus,
      consentStatus,
      supportStatus,
      accessLevel: index === 1 ? "training_and_placement" : "profile_assistance",
      profileAssistanceNeeded: associationStatus !== "linked"
    };
  });
}

export function NgoWorkers({ organization, account, navigateTo, setStatusMessage, isDemoMode = false }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [filters, setFilters] = useState({ associationStatus: "", consentStatus: "", primarySkill: "", location: "", profileCompletion: "", availability: "", employmentStatus: "", dateRange: "" });

  async function loadWorkers() {
    if (!organization?.id) return;
    setLoading(true);
    if (isDemoMode) {
      setWorkers(createDemoManagedWorkers(organization));
      setLoading(false);
      return;
    }
    const rows = await database.getOrganizationWorkers(organization.id);
    setWorkers(rows);
    setLoading(false);
  }

  useEffect(() => { loadWorkers(); }, [organization?.id, isDemoMode]);

  const skills = [...new Set(workers.map((worker) => worker.primarySkill).filter(Boolean))];
  const locations = [...new Set(workers.map((worker) => worker.city).filter(Boolean))];
  const visibleWorkers = sortWorkers(filterWorkers(workers, filters, search), sortBy);
  const activeFilters = Object.entries(filters).filter(([, value]) => value);
  const summary = {
    linked: workers.filter((worker) => worker.associationStatus === "linked").length,
    pending: workers.filter((worker) => worker.consentStatus === "pending").length,
    assistance: workers.filter((worker) => worker.profileAssistanceNeeded).length,
    available: workers.filter((worker) => /available/i.test(worker.availability)).length,
    employed: workers.filter((worker) => worker.employmentStatus === "employed" || worker.supportStatus === "placed").length
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[36px] font-black leading-none tracking-[-0.02em] text-slate-950">Workers</h2>
          <p className="mt-2 text-base font-semibold text-slate-600">Manage linked workers and worker permissions.</p>
        </div>
        <AddWorkerMenu open={addMenuOpen} onToggle={() => setAddMenuOpen((value) => !value)} navigateTo={navigateTo} setStatusMessage={setStatusMessage} />
      </div>

      <NgoWorkerPrivacyNotice />

      <div className="grid gap-3 md:grid-cols-5">
        <SummaryCard icon={Users} label="Linked Workers" value={summary.linked} tone="border-blue-100 bg-blue-50 text-blue-700" />
        <SummaryCard icon={Clock3} label="Consent Pending" value={summary.pending} tone="border-amber-100 bg-amber-50 text-amber-700" />
        <SummaryCard icon={FilePenLine} label="Need Assistance" value={summary.assistance} tone="border-violet-100 bg-violet-50 text-violet-700" />
        <SummaryCard icon={BadgeCheck} label="Available" value={summary.available} tone="border-green-100 bg-green-50 text-green-700" />
        <SummaryCard icon={BriefcaseBusiness} label="Employed" value={summary.employed} tone="border-slate-200 bg-slate-50 text-slate-700" />
      </div>

      <CardShell className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 p-3 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[260px] flex-[1_1_420px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workers by name, ID, skill, location or contact..." className="h-11 pl-9" />
            </div>
            <SelectControl value={filters.associationStatus} onChange={(e) => setFilters({ ...filters, associationStatus: e.target.value })} className="w-[150px]" label="Status">
              <option value="">Status</option>{Object.entries(associationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </SelectControl>
            <SelectControl value={filters.primarySkill} onChange={(e) => setFilters({ ...filters, primarySkill: e.target.value })} className="w-[142px]" label="Skill">
              <option value="">Skill</option>{skills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
            </SelectControl>
            <SelectControl value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} className="w-[150px]" label="Location">
              <option value="">Location</option>{locations.map((city) => <option key={city} value={city}>{city}</option>)}
            </SelectControl>
            <button type="button" onClick={() => setFiltersOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilters.length > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-[11px] text-white">{activeFilters.length}</span>}
            </button>
            <SelectControl value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-[172px]" label="Sort">
              <option value="updated">Sort: Last updated</option>
              <option value="name">Name A-Z</option>
              <option value="completion">Profile completion</option>
              <option value="consent_pending">Consent pending first</option>
              <option value="available">Available first</option>
            </SelectControl>
            <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-white p-1">
              <button type="button" onClick={() => setViewMode("table")} className={`grid h-8 w-8 place-items-center rounded-lg ${viewMode === "table" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`} aria-label="Table view">
                <List className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setViewMode("grid")} className={`grid h-8 w-8 place-items-center rounded-lg ${viewMode === "grid" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`} aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-2 text-xs font-black text-slate-500">
          <span>{loading ? "Loading workers..." : `Showing ${visibleWorkers.length} of ${workers.length} workers`}</span>
          {activeFilters.map(([key, value]) => (
            <button key={key} type="button" onClick={() => setFilters({ ...filters, [key]: "" })} className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700">
              {titleCase(key)}: {titleCase(value)}
            </button>
          ))}
          {activeFilters.length > 0 && <button type="button" onClick={() => setFilters({ associationStatus: "", consentStatus: "", primarySkill: "", location: "", profileCompletion: "", availability: "", employmentStatus: "", dateRange: "" })} className="text-blue-700">Clear all</button>}
        </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="min-w-[1120px] w-full text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[13px] font-black uppercase tracking-[0.06em] text-slate-500">
              <tr>
                {["Worker", "Worker ID", "Primary skill", "Location", "Association", "Consent", "Profile", "Availability", "Employment", "Last activity", "Actions"].map((label) => <th key={label} className="px-4 py-2.5">{label}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && visibleWorkers.map((worker) => (
                <tr key={worker.association.id} className="transition hover:bg-blue-50/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <WorkerAvatar worker={worker} size="h-10 w-10" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950">{worker.name}</p>
                        <p className="truncate text-xs font-bold text-slate-500">{worker.canViewPrivate ? worker.phone || worker.email || "Contact not added" : "Private contact hidden"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[116px] break-all px-4 py-2.5 text-xs font-black text-slate-700">{worker.workerId}</td>
                  <td className="px-4 py-2.5 text-sm font-bold text-slate-700">{worker.primarySkill}</td>
                  <td className="px-4 py-2.5 text-sm font-bold text-slate-700">{worker.city}</td>
                  <td className="px-4 py-2.5"><StatusBadge value={worker.associationStatus} /></td>
                  <td className="px-4 py-2.5"><StatusBadge value={worker.consentStatus} /></td>
                  <td className="px-4 py-2.5">
                    <div className="w-24">
                      <div className="flex justify-between text-xs font-black"><span>{worker.profileCompletion}%</span></div>
                      <div className="mt-1 h-1 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${worker.profileCompletion}%` }} /></div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5"><StatusBadge value={/available/i.test(worker.availability) ? "available" : "not_employed"} label={worker.availability} /></td>
                  <td className="px-4 py-2.5"><StatusBadge value={worker.employmentStatus} label={titleCase(worker.employmentStatus)} /></td>
                  <td className="px-4 py-2.5 text-xs font-bold text-slate-500">{formatDate(worker.lastActivity)}</td>
                  <td className="px-4 py-2.5"><WorkerActions worker={worker} navigateTo={navigateTo} onRefresh={loadWorkers} account={account} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && visibleWorkers.length === 0 && (
            <div className="grid min-h-[260px] place-items-center p-8 text-center">
              <div>
                <Users className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-3 text-lg font-black text-slate-950">No workers found</h3>
                <p className="mt-2 max-w-md text-sm font-semibold text-slate-600">Invite an existing RozgaarAI worker or assist a new worker in creating their digital identity.</p>
              </div>
            </div>
          )}
        </div>
      </CardShell>
      <WorkerFiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} filters={filters} setFilters={setFilters} skills={skills} locations={locations} />
    </div>
  );
}

export function NgoInviteWorker({ organization, account, navigateTo, setStatusMessage, isDemoMode = false }) {
  const [identifier, setIdentifier] = useState("");
  const [match, setMatch] = useState(null);
  const [form, setForm] = useState({ organizationWorkerReference: "", reason: "", intendedSupportType: "profile_support", programmeName: "", invitationMessage: "", accessLevel: "basic_support" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchWorker(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedIdentifier = identifier.trim().toLowerCase();
      const result = isDemoMode
        ? (() => {
            const profile = demoProfiles.find((item) => [item.workerId, item.phone, item.name, item.skill, item.city].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalizedIdentifier)));
            return profile ? {
              workerProfileId: profile.workerId,
              workerId: profile.workerId,
              name: profile.name,
              primarySkill: profile.skill,
              city: profile.city,
              photoUrl: profile.photoUrl,
              privateFieldsHidden: true
            } : null;
          })()
        : await database.searchWorkerForOrganizationInvite(identifier, organization.id);
      setMatch(result);
      if (!result) setError("No matching worker could be confirmed. For privacy, private account details are not shown.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitInvite(event) {
    event.preventDefault();
    if (!match?.workerProfileId) return;
    setLoading(true);
    setError("");
    try {
      if (isDemoMode) {
        setStatusMessage?.("Demo invitation simulated. No real worker request was sent.");
        navigateTo("/ngo/workers");
        return;
      }
      await database.inviteWorkerToOrganization({ organizationId: organization.id, workerProfileId: match.workerProfileId, account, ...form });
      setStatusMessage?.("Worker consent request sent.");
      navigateTo("/ngo/workers");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid h-full max-w-5xl content-start gap-4">
      <button type="button" onClick={() => navigateTo("/ngo/workers")} className="inline-flex w-fit items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to Workers</button>
      <CardShell className="p-6">
        <h2 className="text-2xl font-black text-slate-950">Invite Existing Worker</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">Find a worker by exact Worker ID, phone, email, QR value or public profile link. Private details stay hidden until consent is granted.</p>
        <div className="mt-5"><NgoWorkerPrivacyNotice /></div>
        <form onSubmit={searchWorker} className="mt-5 flex gap-3">
          <Input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="RZG-DEL-DOM-3210, phone, email, or profile link" />
          <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
            <Search className="h-4 w-4" /> Search
          </button>
        </form>
        {error && <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}
        {match && (
          <form onSubmit={submitInvite} className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <WorkerAvatar worker={match} size="h-14 w-14" />
                <div>
                  <p className="text-lg font-black text-slate-950">{match.name}</p>
                  <p className="text-sm font-bold text-slate-600">{match.primarySkill} • {match.city}</p>
                  <p className="mt-1 text-xs font-black text-slate-500">{match.workerId}</p>
                </div>
              </div>
              <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">Only public identity-confirmation details are visible. Phone, email, documents, income history and private employment history are hidden until the worker accepts.</p>
              {match.existingAssociation && <StatusBadge value={match.existingAssociation.associationStatus} />}
            </div>
            <div className="grid gap-4">
              <Field label="Organization worker reference"><Input value={form.organizationWorkerReference} onChange={(e) => setForm({ ...form, organizationWorkerReference: e.target.value })} placeholder="Optional internal ID" /></Field>
              <Field label="Reason for invitation"><Input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Profile support, placement readiness, training..." /></Field>
              <Field label="Intended support type"><Select value={form.intendedSupportType} onChange={(e) => setForm({ ...form, intendedSupportType: e.target.value })}><option value="profile_support">Profile support</option><option value="training">Training programme</option><option value="placement">Employment placement</option><option value="follow_up">Follow-up support</option></Select></Field>
              <Field label="Programme name"><Input value={form.programmeName} onChange={(e) => setForm({ ...form, programmeName: e.target.value })} placeholder="Optional programme" /></Field>
              <Field label="Access level requested"><Select value={form.accessLevel} onChange={(e) => setForm({ ...form, accessLevel: e.target.value })}>{Object.entries(accessLevelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>
              <Field label="Message to worker"><Textarea value={form.invitationMessage} onChange={(e) => setForm({ ...form, invitationMessage: e.target.value })} placeholder="Explain how your organization will support them." /></Field>
              <button type="submit" disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60">
                <Link2 className="h-4 w-4" /> Send Consent Request
              </button>
            </div>
          </form>
        )}
      </CardShell>
    </div>
  );
}

export function NgoAssistedOnboarding({ organization, account, navigateTo, jobRoles, setStatusMessage, isDemoMode = false }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("present");
  const [form, setForm] = useState({
    workerName: "",
    contactMethod: "phone",
    contactValue: "",
    preferredLanguage: "en",
    secondaryLanguage: "",
    city: "",
    primarySkill: "",
    additionalSkills: [],
    experience: "",
    skillLevel: "Intermediate",
    certifications: [],
    certificateName: "",
    trainingInterest: "",
    employmentPreference: "Full-time",
    availability: "Available Now",
    expectedWage: "",
    preferredWorkLocation: "",
    willingToRelocate: "No",
    preferredShift: "Flexible",
    consentConfirmed: false,
    workerPresentConfirmed: false,
    contactConsentConfirmed: false
  });
  const [error, setError] = useState("");
  const headerPhoto = addWorkerHeroReference;
  const progress = step * 25;
  const stepItems = [
    ["Basic Details", "Personal information"],
    ["Skills", "Work expertise"],
    ["Work Preferences", "Availability & wages"],
    ["Consent", "Worker agreement"]
  ];
  const certificationOptions = ["Aadhaar verified", "Skill certificate", "Training certificate", "Reference letter"];
  const languageOptions = [["en", "English"], ["hi", "Hindi"], ["mr", "Marathi"], ["bn", "Bengali"], ["ta", "Tamil"], ["te", "Telugu"]];
  const wageRange = useMemo(() => {
    const baseBySkill = {
      "Domestic Worker": 16000,
      Electrician: 24000,
      Plumber: 23000,
      Driver: 22000,
      Tailor: 17000,
      Cook: 18000,
      "Construction Worker": 21000,
      "Security Guard": 19000
    };
    const cityFactor = /delhi|mumbai|bengaluru|hyderabad|pune/i.test(form.city) ? 1.16 : /lucknow|bhopal|nagpur|raipur/i.test(form.city) ? 1 : 0.94;
    const expFactor = form.experience === "10+" ? 1.28 : form.experience === "5-10" ? 1.18 : form.experience === "3-5" ? 1.1 : form.experience === "1-3" ? 1.04 : 0.96;
    const base = (baseBySkill[form.primarySkill] || 18000) * cityFactor * expFactor;
    const min = Math.round((base * 0.9) / 500) * 500;
    const max = Math.round((base * 1.12) / 500) * 500;
    return { min, max };
  }, [form.city, form.primarySkill, form.experience]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleList(field, value) {
    setForm((current) => {
      const list = current[field] || [];
      return { ...current, [field]: list.includes(value) ? list.filter((item) => item !== value) : [...list, value] };
    });
  }

  function validateStep(targetStep = step) {
    const phone = String(form.contactValue || "").replace(/\D/g, "");
    if (targetStep === 1) {
      if (!form.workerName.trim()) return "Enter the worker's full name.";
      if (form.contactMethod !== "email" && phone.length !== 10) return "Enter a valid 10-digit Indian mobile number.";
      if (form.contactMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactValue)) return "Enter a valid email address.";
      if (!form.city.trim()) return "Select or enter the worker's city.";
    }
    if (targetStep === 2) {
      if (!form.primarySkill) return "Select a primary skill.";
      if (!form.experience) return "Select years of experience.";
    }
    if (targetStep === 3) {
      if (!form.employmentPreference) return "Select an employment preference.";
      if (!form.availability) return "Select availability.";
      if (!Number(form.expectedWage) || Number(form.expectedWage) <= 0) return "Enter a sensible expected monthly wage.";
    }
    if (targetStep === 4) {
      if (!form.consentConfirmed || !form.workerPresentConfirmed || !form.contactConsentConfirmed) return "All worker consent confirmations are required.";
    }
    return "";
  }

  function goNext() {
    const message = validateStep(step);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setStep((value) => Math.min(4, value + 1));
  }

  function goBack() {
    setError("");
    setStep((value) => Math.max(1, value - 1));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    const message = validateStep(4);
    if (message) {
      setError(message);
      return;
    }
    try {
      if (isDemoMode) {
        setStatusMessage?.("Demo assisted draft simulated. No real worker account or draft was created.");
        navigateTo("/ngo/workers");
        return;
      }
      await database.createAssistedWorkerDraft({ ...form, organizationId: organization.id, draftMode: mode }, account);
      setStatusMessage?.("Assisted worker draft created. Worker verification is still required.");
      navigateTo("/ngo/workers");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto grid h-full max-w-[1440px] grid-rows-[minmax(0,1fr)] overflow-y-auto xl:overflow-hidden">
      <section className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-h-0 overflow-hidden">
          <div className="relative min-h-[235px] overflow-hidden rounded-[22px] bg-gradient-to-r from-white via-white to-blue-50/35 lg:px-0">
            <div className="relative z-10 max-w-[640px]">
              <button type="button" onClick={() => navigateTo("/ngo/workers")} className="inline-flex w-fit items-center gap-2 text-xs font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to Workers</button>
              <div className="mt-6 flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <Users className="h-7 w-7" />
                </span>
                <div>
                  <h2 className="text-[32px] font-black leading-tight text-slate-950">Assist a Worker</h2>
                  <p className="mt-2 text-sm font-semibold text-slate-600">Help someone create their RozgaarAI profile in under 2 minutes.</p>
                </div>
              </div>
              <div className="mt-5 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-3">
                {[
                  [ShieldCheck, "Worker Ownership", "Worker keeps complete ownership of their profile."],
                  [HeartHandshake, "NGO Assistance Only", "You are only assisting in onboarding and verification."],
                  [LockKeyhole, "Privacy Protected", "Private information remains secure and confidential."]
                ].map(([Icon, title, copy], index) => (
                  <div key={title} className={`flex min-h-[86px] items-start gap-3 p-3 ${index ? "border-t border-slate-100 md:border-l md:border-t-0" : ""}`}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-green-50 text-green-700"><Icon className="h-5 w-5" /></span>
                    <div>
                      <p className="text-xs font-black text-blue-700">{title}</p>
                      <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-600">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 right-0 top-0 hidden w-[430px] lg:block">
              <img src={headerPhoto} alt="" className="h-full w-full object-cover object-center" loading="lazy" />
              <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white via-white/90 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white via-white/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/55 to-transparent" />
              <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white/70 to-transparent" />
            </div>
          </div>

          <CardShell className="mt-4 flex max-h-[calc(100dvh-20.5rem)] min-h-0 flex-col overflow-hidden p-4">
            <div className="grid shrink-0 items-center gap-3 lg:grid-cols-[1fr_auto]">
              <div className="grid gap-2 md:grid-cols-4">
                {stepItems.map(([label, description], index) => {
                  const number = index + 1;
                  const complete = step > number;
                  const active = step === number;
                  return (
                    <button key={label} type="button" onClick={() => number < step && setStep(number)} className="flex items-center gap-3 text-left">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-black ${complete ? "border-blue-600 bg-blue-600 text-white" : active ? "border-blue-600 bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)]" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                        {complete ? <CheckCircle2 className="h-4 w-4" /> : number}
                      </span>
                      <span>
                        <span className={`block text-xs font-black ${active ? "text-blue-700" : "text-slate-800"}`}>{label}</span>
                        <span className="block text-[11px] font-semibold text-slate-500">{description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="grid place-items-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-[conic-gradient(#2563eb_var(--progress),#e2e8f0_0)]" style={{ "--progress": `${progress}%` }}>
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-white text-center">
                    <span className="text-xs font-black text-blue-700">{progress}%</span>
                  </div>
                </div>
                <span className="mt-0.5 text-[11px] font-black text-green-700">Complete</span>
              </div>
            </div>
            <div className="mt-3 h-1.5 shrink-0 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>

            <form onSubmit={submit} className="mt-4 min-h-0 overflow-y-auto rounded-[18px] border border-slate-200 p-4">
              {step === 1 && (
                <div>
                  <div className="flex items-start gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><Users className="h-5 w-5" /></span>
                    <div><p className="text-xs font-bold text-slate-500">Step 1 of 4</p><h3 className="text-lg font-black text-slate-950">Basic Details</h3><p className="mt-1 text-xs font-semibold text-slate-600">Let's start with the worker's basic information.</p></div>
                  </div>
                  <div className="mt-4 grid gap-x-5 gap-y-3 md:grid-cols-2">
                    <Field label="Full Name"><Input value={form.workerName} onChange={(e) => updateField("workerName", e.target.value)} placeholder="Enter worker's full name" /></Field>
                    <Field label="Contact Method"><Select value={form.contactMethod} onChange={(e) => updateField("contactMethod", e.target.value)}><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option></Select><p className="mt-2 text-xs font-semibold text-slate-500">We'll use this to reach the worker</p></Field>
                    <Field label={form.contactMethod === "email" ? "Email Address" : "Phone Number"}>
                      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                        {form.contactMethod !== "email" && <span className="grid min-h-10 place-items-center border-r border-slate-200 px-4 text-sm font-black text-slate-700">+91</span>}
                        <input value={form.contactValue} onChange={(e) => updateField("contactValue", form.contactMethod === "email" ? e.target.value : e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder={form.contactMethod === "email" ? "worker@example.com" : "Enter 10 digit mobile number"} className="min-h-10 flex-1 px-3 text-sm font-bold outline-none" />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-slate-500">{form.contactMethod === "email" ? "Worker will verify this address later" : "OTP verification will be required"}</p>
                    </Field>
                    <Field label="Preferred Language"><Select value={form.preferredLanguage} onChange={(e) => updateField("preferredLanguage", e.target.value)}>{languageOptions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</Select><p className="mt-2 text-xs font-semibold text-slate-500">Language for communication</p></Field>
                    <Field label="City"><Input list="ngo-city-suggestions" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Search city..." /><datalist id="ngo-city-suggestions">{cities.map((city) => <option key={city} value={city} />)}</datalist><p className="mt-2 text-xs font-semibold text-slate-500">Start typing to search your city</p></Field>
                    <Field label="Secondary Language (Optional)"><Select value={form.secondaryLanguage} onChange={(e) => updateField("secondaryLanguage", e.target.value)}><option value="">Select language</option>{languageOptions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</Select><p className="mt-2 text-xs font-semibold text-slate-500">Helps in better communication</p></Field>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><BriefcaseBusiness className="h-5 w-5" /></span><div><p className="text-sm font-bold text-slate-500">Step 2 of 4</p><h3 className="text-xl font-black text-slate-950">Skills</h3><p className="mt-1 text-sm font-semibold text-slate-600">Capture work expertise without claiming verification.</p></div></div>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <Field label="Primary Skill"><Select value={form.primarySkill} onChange={(e) => updateField("primarySkill", e.target.value)}><option value="">Select primary skill</option>{jobRoles.map((role) => <option key={role} value={role}>{role}</option>)}</Select></Field>
                    <Field label="Skill Level"><Select value={form.skillLevel} onChange={(e) => updateField("skillLevel", e.target.value)}>{["Beginner", "Intermediate", "Experienced", "Expert"].map((item) => <option key={item}>{item}</option>)}</Select></Field>
                    <div className="md:col-span-2"><p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Years of Experience</p><div className="flex flex-wrap gap-2">{["0-1", "1-3", "3-5", "5-10", "10+"].map((item) => <button key={item} type="button" onClick={() => updateField("experience", item)} className={`rounded-xl border px-4 py-2 text-sm font-black ${form.experience === item ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}>{item}</button>)}</div></div>
                    <div className="md:col-span-2"><p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Additional Skills</p><div className="flex flex-wrap gap-2">{jobRoles.slice(0, 12).filter((role) => role !== form.primarySkill).map((role) => <button key={role} type="button" onClick={() => toggleList("additionalSkills", role)} className={`rounded-xl border px-3 py-2 text-xs font-black ${form.additionalSkills.includes(role) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}>{role}</button>)}</div></div>
                    <div className="md:col-span-2"><p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Existing Certifications</p><div className="flex flex-wrap gap-2">{certificationOptions.map((item) => <button key={item} type="button" onClick={() => toggleList("certifications", item)} className={`rounded-xl border px-3 py-2 text-xs font-black ${form.certifications.includes(item) ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-white text-slate-700"}`}>{item}</button>)}</div></div>
                    <Field label="Certificate Name"><Input value={form.certificateName} onChange={(e) => updateField("certificateName", e.target.value)} placeholder="Optional certificate name" /></Field>
                    <Field label="Certificate Proof"><div className="flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-sm font-bold text-slate-500"><Upload className="h-4 w-4" /> Optional local-only proof placeholder</div></Field>
                    <Field label="Training Interest"><Input value={form.trainingInterest} onChange={(e) => updateField("trainingInterest", e.target.value)} placeholder="Optional training interest" /></Field>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><CalendarClock className="h-5 w-5" /></span><div><p className="text-sm font-bold text-slate-500">Step 3 of 4</p><h3 className="text-xl font-black text-slate-950">Work Preferences</h3><p className="mt-1 text-sm font-semibold text-slate-600">Set availability, wage expectations and preferred work style.</p></div></div>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <Field label="Employment Preference"><Select value={form.employmentPreference} onChange={(e) => updateField("employmentPreference", e.target.value)}>{["Full-time", "Part-time", "Contract", "Daily wage"].map((item) => <option key={item}>{item}</option>)}</Select></Field>
                    <Field label="Preferred Work Location"><Input value={form.preferredWorkLocation} onChange={(e) => updateField("preferredWorkLocation", e.target.value)} placeholder="City or locality" /></Field>
                    <div className="md:col-span-2"><p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Availability</p><div className="grid gap-2 sm:grid-cols-3">{["Available Now", "Within 1 Week", "Within 1 Month"].map((item) => <button key={item} type="button" onClick={() => updateField("availability", item)} className={`rounded-2xl border p-4 text-left text-sm font-black ${form.availability === item ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}>{item}</button>)}</div></div>
                    <Field label="Expected Monthly Wage"><div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100"><span className="grid min-h-11 place-items-center border-r border-slate-200 px-4 font-black text-slate-700">₹</span><input value={form.expectedWage} onChange={(e) => updateField("expectedWage", e.target.value.replace(/\D/g, ""))} placeholder="16000" className="min-h-11 flex-1 px-3 text-sm font-bold outline-none" /><span className="grid min-h-11 place-items-center px-4 text-xs font-black text-slate-500">/month</span></div></Field>
                    <Field label="Willing to Relocate"><Select value={form.willingToRelocate} onChange={(e) => updateField("willingToRelocate", e.target.value)}><option>No</option><option>Yes</option><option>Nearby only</option></Select></Field>
                    <div className="md:col-span-2"><p className="mb-2 text-xs font-black uppercase tracking-[0.08em] text-slate-500">Preferred Work Shift</p><div className="flex flex-wrap gap-2">{["Morning", "Day", "Evening", "Flexible"].map((item) => <button key={item} type="button" onClick={() => updateField("preferredShift", item)} className={`rounded-xl border px-4 py-2 text-sm font-black ${form.preferredShift === item ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"}`}>{item}</button>)}</div></div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><ShieldCheck className="h-5 w-5" /></span><div><p className="text-sm font-bold text-slate-500">Step 4 of 4</p><h3 className="text-xl font-black text-slate-950">Worker Consent and Ownership</h3><p className="mt-1 text-sm font-semibold text-slate-600">Confirm consent before creating the assisted draft.</p></div></div>
                  <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    {["The NGO is only assisting with profile creation.", "The worker owns the account and profile.", "No password or login credential is created until worker verification.", "The NGO cannot use or share private worker information without permission.", "The worker can review and correct the information before activation."].map((item) => <p key={item} className="mt-2 flex gap-2 text-sm font-bold text-blue-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> {item}</p>)}
                  </div>
                  <div className="mt-5 grid gap-3">
                    {[["consentConfirmed", "I confirm that the worker understands this assisted onboarding process."], ["workerPresentConfirmed", "I confirm that the information was provided by or in the presence of the worker."], ["contactConsentConfirmed", "I confirm that the worker has consented to being contacted for verification."]].map(([field, label]) => (
                      <label key={field} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-800"><input type="checkbox" checked={form[field]} onChange={(e) => updateField(field, e.target.checked)} className="mt-1 h-4 w-4" /> {label}</label>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="mt-5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}
              <div className="mt-4 flex justify-end gap-3">
                {step > 1 && <button type="button" onClick={goBack} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-black text-slate-700">Back</button>}
                {step < 4 ? (
                  <button type="button" onClick={goNext} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700">Continue <ChevronDown className="h-4 w-4 -rotate-90" /></button>
                ) : (
                  <button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Create Assisted Draft</button>
                )}
              </div>
            </form>
          </CardShell>
        </div>

        <aside className="grid max-h-full content-start gap-3 overflow-hidden xl:sticky xl:top-4">
          <CardShell className="p-4">
            <div className="flex items-center justify-between"><h3 className="text-base font-black text-slate-950">Worker Preview</h3><StatusBadge value="available" label="Live" /></div>
            <div className="mt-4 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-blue-700"><Users className="h-8 w-8" /></span>
              {form.workerName ? (
                <div className="mt-3"><p className="text-base font-black text-slate-950">{form.workerName}</p><p className="mt-1 text-xs font-bold text-slate-600">{form.primarySkill || "Skill pending"} • {form.city || "City pending"}</p><p className="mt-1 text-xs font-semibold text-slate-500">{form.experience || "Experience pending"} yrs • {form.employmentPreference}</p>{form.expectedWage && <p className="mt-1 text-xs font-black text-green-700">₹{Number(form.expectedWage).toLocaleString("en-IN")} /month</p>}</div>
              ) : (
                <div className="mt-3"><p className="text-sm font-black text-slate-800">Profile will appear here</p><p className="mt-2 text-xs font-semibold leading-5 text-slate-500">Complete the form to see live preview</p><div className="mx-auto mt-4 h-2.5 w-32 rounded-full bg-slate-100" /><div className="mx-auto mt-2 h-2.5 w-20 rounded-full bg-slate-100" /></div>
              )}
            </div>
          </CardShell>
          <CardShell className="p-4 text-center">
            <div className="flex items-center gap-2 text-left"><Sparkles className="h-5 w-5 text-blue-600" /><h3 className="text-base font-black text-slate-950">AI Wage Suggestion</h3></div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-600">Based on location & skill</p><p className="mt-3 text-xl font-black text-green-700">₹{wageRange.min.toLocaleString("en-IN")} - ₹{wageRange.max.toLocaleString("en-IN")}</p><p className="mt-1 text-xs font-black text-slate-800">/month</p><p className="mt-4 text-xs font-black text-slate-700">High Demand in your area</p><div className="mt-2 flex justify-center gap-1 text-amber-400">{[0, 1, 2, 3].map((item) => <Star key={item} className="h-4 w-4 fill-current" />)}<Star className="h-4 w-4 text-slate-300" /></div></div>
            <button type="button" className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-xs font-black text-blue-700"><Info className="h-4 w-4" /> How is this calculated?</button>
          </CardShell>
          <CardShell className="p-4">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-600" /><h3 className="text-base font-black">Profile Completeness</h3></div>
            <div className="mt-4 flex items-center gap-3"><div className="grid h-16 w-16 place-items-center rounded-full bg-[conic-gradient(#2563eb_var(--progress),#e2e8f0_0)]" style={{ "--progress": `${progress}%` }}><div className="grid h-12 w-12 place-items-center rounded-full bg-white text-base font-black text-green-700">{progress}%</div></div><div><p className="text-sm font-black text-slate-950">{progress === 100 ? "Ready to submit!" : "Keep going!"}</p><p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Complete all steps to create the profile.</p></div></div>
          </CardShell>
          <CardShell className="p-4 text-center">
            <Clock3 className="mx-auto h-5 w-5 text-slate-600" /><p className="mt-2 text-sm font-black text-slate-700">Estimated Time</p><p className="mt-2 text-base font-black text-green-700">{step === 4 ? "20 seconds" : step === 3 ? "45 seconds" : "1 minute 42 seconds"}</p><p className="text-xs font-semibold text-slate-500">to complete this profile</p>
          </CardShell>
        </aside>
      </section>
    </div>
  );
}

export function NgoWorkerDetail({ organization, account, workerProfileId, navigateTo, setStatusMessage, isDemoMode = false }) {
  const [worker, setWorker] = useState(null);
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [statusForm, setStatusForm] = useState({ supportStatus: "", availabilityOverride: "", employmentStatus: "" });

  async function load() {
    const nextWorker = isDemoMode
      ? createDemoManagedWorkers(organization).find((item) => item.workerProfileId === workerProfileId)
      : await database.getOrganizationWorkerById(organization.id, workerProfileId);
    setWorker(nextWorker);
    if (nextWorker) {
      setNotes(isDemoMode ? [] : await database.getOrganizationWorkerNotes({ organizationId: organization.id, workerProfileId: nextWorker.workerProfileId }));
      setStatusForm({ supportStatus: nextWorker.supportStatus, availabilityOverride: nextWorker.availability, employmentStatus: nextWorker.employmentStatus });
    }
  }
  useEffect(() => { load(); }, [organization?.id, workerProfileId]);

  async function addNote(event) {
    event.preventDefault();
    if (!note.trim()) return;
    if (!isDemoMode) await database.createOrganizationWorkerNote({ organizationId: organization.id, workerProfileId: worker.workerProfileId, associationId: worker.association.id, account, content: note });
    setNote("");
    await load();
    setStatusMessage?.("Follow-up note added.");
  }

  async function updateStatus(event) {
    event.preventDefault();
    if (!isDemoMode) await database.updateOrganizationSupportStatus({ organizationId: organization.id, associationId: worker.association.id, account, ...statusForm });
    await load();
    setStatusMessage?.("Worker support status updated.");
  }

  if (!worker) return <CardShell className="p-8 text-center"><AlertCircle className="mx-auto h-10 w-10 text-slate-300" /><h2 className="mt-3 text-xl font-black">Worker not found</h2><p className="mt-2 text-sm font-semibold text-slate-600">This worker is not available to your organization.</p></CardShell>;

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1fr_360px]">
      <div className="min-h-0 overflow-y-auto pr-1">
        <button type="button" onClick={() => navigateTo("/ngo/workers")} className="mb-4 inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to Workers</button>
        <CardShell className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <WorkerAvatar worker={worker} size="h-20 w-20" />
              <div>
                <h2 className="text-2xl font-black text-slate-950">{worker.name}</h2>
                <p className="mt-1 text-sm font-bold text-slate-600">{worker.workerId} • {worker.primarySkill} • {worker.city}</p>
                <div className="mt-3 flex flex-wrap gap-2"><StatusBadge value={worker.associationStatus} /><StatusBadge value={worker.consentStatus} /></div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => navigateTo(`/ngo/workers/${worker.workerProfileId}/edit-assistance`)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white">Assist Profile</button>
              <button type="button" onClick={() => navigateTo(`/ngo/workers/${worker.workerProfileId}/activity`)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700">View Activity</button>
            </div>
          </div>
        </CardShell>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CardShell className="p-5">
            <h3 className="text-lg font-black">Profile Summary</h3>
            {!worker.canViewPrivate && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">Waiting for worker consent. You can view only limited public information.</p>}
            <dl className="mt-4 grid gap-3 text-sm font-bold">
              {[["Primary skill", worker.primarySkill], ["Experience", worker.experience ? `${worker.experience} years` : "Not visible"], ["Languages", worker.languages || "Not visible"], ["Expected wage", worker.expectedWage ? `₹${Number(worker.expectedWage).toLocaleString("en-IN")}` : "Not visible"], ["Availability", worker.availability]].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-slate-500">{label}</dt><dd className="text-right text-slate-950">{value}</dd></div>)}
            </dl>
          </CardShell>
          <CardShell className="p-5">
            <h3 className="text-lg font-black">Organization Relationship</h3>
            <dl className="mt-4 grid gap-3 text-sm font-bold">
              {[["Access level", accessLevelLabels[worker.accessLevel] || titleCase(worker.accessLevel)], ["Linked date", formatDate(worker.association.linkedAt)], ["Consent date", formatDate(worker.association.consentGrantedAt)], ["Reference", worker.association.organizationWorkerReference || "Not added"], ["Support status", titleCase(worker.supportStatus)]].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt className="text-slate-500">{label}</dt><dd className="text-right text-slate-950">{value}</dd></div>)}
            </dl>
          </CardShell>
        </div>
        <CardShell className="mt-4 p-5">
          <h3 className="text-lg font-black">Profile Notes</h3>
          <p className="mt-2 text-sm font-semibold text-slate-600">{worker.notes || "No private summary is visible yet."}</p>
        </CardShell>
      </div>
      <aside className="min-h-0 space-y-4 overflow-y-auto">
        <CardShell className="p-5">
          <h3 className="text-lg font-black">Support Status</h3>
          <form onSubmit={updateStatus} className="mt-4 grid gap-3">
            <Field label="Support status"><Select value={statusForm.supportStatus} onChange={(e) => setStatusForm({ ...statusForm, supportStatus: e.target.value })}>{supportStatusOptions.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}</Select></Field>
            <Field label="Availability"><Input value={statusForm.availabilityOverride} onChange={(e) => setStatusForm({ ...statusForm, availabilityOverride: e.target.value })} /></Field>
            <Field label="Employment status"><Select value={statusForm.employmentStatus} onChange={(e) => setStatusForm({ ...statusForm, employmentStatus: e.target.value })}><option value="not_employed">Not employed</option><option value="employed">Employed</option></Select></Field>
            <button className="min-h-11 rounded-xl bg-blue-600 text-sm font-black text-white">Update Status</button>
          </form>
        </CardShell>
        <CardShell className="p-5">
          <h3 className="text-lg font-black">Follow-Up Notes</h3>
          <form onSubmit={addNote} className="mt-4 grid gap-3">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add an organization-only note..." />
            <button className="min-h-11 rounded-xl border border-blue-200 text-sm font-black text-blue-700">Add Note</button>
          </form>
          <div className="mt-4 space-y-2">
            {notes.map((item) => <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-sm font-bold text-slate-800">{item.content}</p><p className="mt-1 text-xs font-bold text-slate-500">{formatDate(item.createdAt)} • {titleCase(item.visibility)}</p></div>)}
          </div>
        </CardShell>
      </aside>
    </div>
  );
}

export function NgoWorkerActivity({ organization, workerProfileId, navigateTo, isDemoMode = false }) {
  const [activity, setActivity] = useState([]);
  useEffect(() => {
    if (isDemoMode) {
      setActivity([
        { id: "demo-activity-1", description: "Demo consent granted for NGO support.", activityType: "consent_granted", createdAt: new Date().toISOString() },
        { id: "demo-activity-2", description: "Demo worker readiness reviewed by NGO coordinator.", activityType: "profile_assistance", createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
      return;
    }
    database.getOrganizationWorkerActivity({ organizationId: organization.id, workerProfileId }).then(setActivity);
  }, [organization?.id, workerProfileId, isDemoMode]);
  return (
    <div className="mx-auto h-full max-w-4xl">
      <button type="button" onClick={() => navigateTo(`/ngo/workers/${workerProfileId}`)} className="mb-4 inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to Worker</button>
      <CardShell className="p-6">
        <h2 className="text-2xl font-black">Worker Activity</h2>
        <div className="mt-6 space-y-3">
          {activity.map((item) => (
            <div key={item.id} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-slate-100 bg-white p-4">
              <span className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
              <div>
                <p className="text-sm font-black text-slate-950">{item.description}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{formatDate(item.createdAt)} • {titleCase(item.activityType)}</p>
              </div>
            </div>
          ))}
          {!activity.length && <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm font-semibold text-slate-600">No activity has been recorded for this worker yet.</p>}
        </div>
      </CardShell>
    </div>
  );
}

export function NgoWorkerProfileAssistance({ organization, account, workerProfileId, navigateTo, setStatusMessage, isDemoMode = false }) {
  const [worker, setWorker] = useState(null);
  const [form, setForm] = useState({ city: "", primarySkill: "", availability: "", reason: "" });
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.resolve(isDemoMode ? createDemoManagedWorkers(organization).find((item) => item.workerProfileId === workerProfileId) : database.getOrganizationWorkerById(organization.id, workerProfileId)).then((nextWorker) => {
      setWorker(nextWorker);
      if (nextWorker) setForm({ city: nextWorker.city, primarySkill: nextWorker.primarySkill, availability: nextWorker.availability, reason: "" });
    });
  }, [organization?.id, workerProfileId]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      if (isDemoMode) {
        setStatusMessage?.("Demo profile assistance simulated. No real worker profile was changed.");
        navigateTo(`/ngo/workers/${workerProfileId}`);
        return;
      }
      await database.updateWorkerWithOrganizationAssistance({ organizationId: organization.id, workerProfileId, account, changes: form, reason: form.reason });
      setStatusMessage?.("Profile assistance recorded for worker review.");
      navigateTo(`/ngo/workers/${workerProfileId}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={() => navigateTo(`/ngo/workers/${workerProfileId}`)} className="mb-4 inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to Worker</button>
      <CardShell className="p-6">
        <h2 className="text-2xl font-black">Assist Profile Completion</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">Changes made with NGO assistance are recorded in profile activity history and require the worker’s consent.</p>
        {!worker?.canViewPrivate && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">Granted consent is required before profile assistance.</p>}
        <form onSubmit={submit} className="mt-5 grid gap-4">
          <Field label="City"><Input disabled={!worker?.canViewPrivate} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="Primary skill"><Input disabled={!worker?.canViewPrivate} value={form.primarySkill} onChange={(e) => setForm({ ...form, primarySkill: e.target.value })} /></Field>
          <Field label="Availability"><Input disabled={!worker?.canViewPrivate} value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} /></Field>
          <Field label="Assistance reason"><Textarea disabled={!worker?.canViewPrivate} required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
          {error && <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{error}</p>}
          <button disabled={!worker?.canViewPrivate} className="min-h-12 rounded-xl bg-blue-600 text-sm font-black text-white disabled:opacity-50">Submit for Worker Review</button>
        </form>
      </CardShell>
    </div>
  );
}

export function WorkerOrganizationRequests({ account, navigateTo, setStatusMessage }) {
  const [requests, setRequests] = useState([]);
  async function load() {
    setRequests(await database.getWorkerOrganizationRequests(account));
  }
  useEffect(() => { load(); }, [account?.id, account?.uid]);

  async function respond(requestId, status) {
    await database.respondToOrganizationInvitation(requestId, status, account);
    await load();
    setStatusMessage?.(status === "accepted" ? "Organization access granted." : "Organization request declined.");
  }

  return (
    <section className="min-h-dvh bg-slate-50 p-6 text-slate-950">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigateTo("/dashboard")} className="mb-4 inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</button>
        <CardShell className="p-6">
          <h1 className="text-3xl font-black">Organization Requests</h1>
          <p className="mt-2 text-sm font-semibold text-slate-600">Accepting a request allows the organization to support your profile, training and employment journey. Your RozgaarAI account remains yours, and you can revoke access later.</p>
          <div className="mt-6 grid gap-3">
            {requests.map((request) => (
              <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">{request.organization?.name || "Organization"}</h2>
                    <p className="mt-1 text-sm font-bold text-slate-600">{request.organization?.organizationType || "NGO/Foundation"} • {request.organization?.verificationStatus || "Unverified"}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-700">{request.message}</p>
                  </div>
                  <StatusBadge value={request.status === "pending" ? "pending" : request.status === "accepted" ? "granted" : "declined"} label={titleCase(request.status)} />
                </div>
                <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700 md:grid-cols-2">
                  {["View basic profile", "View skills and employment preferences", "Assist with profile completion", "Add organization notes", "Recommend profile only with required sharing permission"].map((permission) => <div key={permission} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> {permission}</div>)}
                  {["Authentication credentials", "Password", "Government identity numbers", "Private income history without permission"].map((item) => <div key={item} className="flex items-center gap-2"><XCircle className="h-4 w-4 text-rose-600" /> {item}</div>)}
                </div>
                {request.status === "pending" && (
                  <div className="mt-5 flex gap-2">
                    <button type="button" onClick={() => respond(request.id, "accepted")} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white">Accept</button>
                    <button type="button" onClick={() => respond(request.id, "declined")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700">Decline</button>
                  </div>
                )}
              </article>
            ))}
            {!requests.length && <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm font-semibold text-slate-600">No organization requests yet.</p>}
          </div>
        </CardShell>
      </div>
    </section>
  );
}
