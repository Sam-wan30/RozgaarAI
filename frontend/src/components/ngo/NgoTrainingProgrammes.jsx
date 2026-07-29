import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileBadge,
  FileCheck2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Wrench,
  Zap
} from "lucide-react";
import { useEffect, useState } from "react";
import ngoTrainingHero from "../../assets/ngo-demo-hero-workers.jpg";
import { demoProfiles } from "../../data/mockData";
import { database } from "../../lib/database";
import { hasNgoPermission, NGO_PERMISSIONS } from "../../lib/roles";

const demoProgrammes = [
  {
    id: "demo-training-housekeeping",
    organizationId: "demo-ngo",
    title: "Workplace Readiness and Housekeeping",
    programmeCode: "DEMO-HOUSE-01",
    primarySkill: "Housekeeping",
    skillSector: "Home Services",
    deliveryMode: "in_person",
    city: "Bhopal",
    state: "Madhya Pradesh",
    locationName: "Community Skills Centre",
    startDate: "2026-07-15",
    endDate: "2026-08-20",
    capacity: 30,
    trainerName: "Meera Joshi",
    status: "active",
    durationHours: 48,
    minimumAttendancePercentage: 75,
    assessmentRequired: true,
    certificateEnabled: true,
    enrolledCount: 24,
    completionRate: 58,
    jobReadyCount: 8,
    certificateCount: 6
  },
  {
    id: "demo-training-electrical",
    organizationId: "demo-ngo",
    title: "Basic Electrical Safety",
    programmeCode: "DEMO-ELEC-02",
    primarySkill: "Electrical Work",
    skillSector: "Maintenance",
    deliveryMode: "hybrid",
    city: "Lucknow",
    state: "Uttar Pradesh",
    locationName: "RozgaarAI Partner Lab",
    startDate: "2026-06-10",
    endDate: "2026-07-18",
    capacity: 20,
    trainerName: "Arvind Singh",
    status: "completed",
    durationHours: 36,
    minimumAttendancePercentage: 80,
    assessmentRequired: true,
    certificateEnabled: true,
    enrolledCount: 18,
    completionRate: 100,
    jobReadyCount: 15,
    certificateCount: 15
  },
  {
    id: "demo-training-plumbing",
    organizationId: "demo-ngo",
    title: "Plumbing Skills Advancement",
    programmeCode: "DEMO-PLUMB-03",
    primarySkill: "Plumbing",
    skillSector: "Maintenance",
    deliveryMode: "in_person",
    city: "Bhopal",
    state: "Madhya Pradesh",
    locationName: "Field Practice Hub",
    startDate: "2026-08-05",
    endDate: "2026-09-05",
    capacity: 20,
    trainerName: "Ravi Deshmukh",
    status: "upcoming",
    durationHours: 42,
    minimumAttendancePercentage: 75,
    assessmentRequired: true,
    certificateEnabled: true,
    enrolledCount: 0,
    completionRate: 0,
    jobReadyCount: 0,
    certificateCount: 0
  }
];

const demoEnrollments = demoProfiles.slice(0, 5).map((worker, index) => ({
  id: `demo-enrollment-${index}`,
  programmeId: index === 2 ? "demo-training-plumbing" : index === 1 ? "demo-training-electrical" : "demo-training-housekeeping",
  organizationId: "demo-ngo",
  workerProfileId: worker.workerId,
  enrollmentStatus: index < 2 ? "completed" : "in_progress",
  completionStatus: index < 2 ? "completed" : "in_progress",
  completionPercentage: index < 2 ? 100 : 55 + index * 8,
  attendancePercentage: 86 + index * 2,
  jobReadinessStatus: index < 2 ? "job_ready" : index === 3 ? "developing" : "needs_support",
  enrolledAt: "2026-07-15T09:00:00.000Z",
  worker
}));

const statusTone = {
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  upcoming: "border-blue-100 bg-blue-50 text-blue-700",
  active: "border-green-100 bg-green-50 text-green-700",
  completed: "border-violet-100 bg-violet-50 text-violet-700",
  archived: "border-slate-200 bg-white text-slate-500",
  cancelled: "border-rose-100 bg-rose-50 text-rose-700",
  issued: "border-blue-100 bg-blue-50 text-blue-700",
  pending_verification: "border-amber-100 bg-amber-50 text-amber-700",
  verified: "border-green-100 bg-green-50 text-green-700",
  rejected: "border-rose-100 bg-rose-50 text-rose-700",
  revoked: "border-rose-100 bg-rose-50 text-rose-700"
};

function titleCase(value = "") {
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function Card({ children, className = "" }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.045)] ${className}`}>{children}</section>;
}

function Badge({ value, label }) {
  return <span className={`inline-flex min-h-5 shrink-0 items-center rounded-full border px-2 text-[10px] font-black ${statusTone[value] || "border-slate-200 bg-white text-slate-600"}`}>{label || titleCase(value)}</span>;
}

function Metric({ icon: Icon, label, value, tone = "blue" }) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    green: "border-green-100 bg-green-50 text-green-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700"
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl border ${tones[tone]}`}><Icon className="h-5 w-5" /></span>
        <div>
          <p className="text-2xl font-black text-slate-950">{value}</p>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</span>{children}</label>;
}

const inputClass = "min-h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

const trainingKpis = [
  { label: "Workers Training", value: 24, icon: Users, tone: "blue" },
  { label: "Active Programmes", value: 3, icon: BookOpenCheck, tone: "green" },
  { label: "Certified", value: 15, icon: ShieldCheck, tone: "violet" },
  { label: "Avg Progress", value: "85%", icon: TrendingUp, tone: "amber" },
  { label: "Attendance", value: "92%", icon: CheckCircle2, tone: "green" }
];

const programmeMeta = {
  "demo-training-housekeeping": {
    title: "Workplace Readiness & Housekeeping",
    statusLabel: "Active",
    progress: 58,
    enrolled: 24,
    certified: 15,
    employerReady: 8,
    aiScore: 4,
    aiLabel: "High placement potential"
  },
  "demo-training-electrical": {
    title: "Basic Electrical Safety",
    statusLabel: "Completed",
    progress: 100,
    enrolled: 18,
    certified: 18,
    employerReady: 15,
    aiScore: 5,
    aiLabel: "Very high placement potential"
  },
  "demo-training-plumbing": {
    title: "Plumbing Skills Advancement",
    statusLabel: "Upcoming",
    progress: 0,
    enrolled: 0,
    certified: 0,
    employerReady: 0,
    aiScore: 3,
    aiLabel: "Moderate potential"
  }
};

const trainingInsights = [
  { title: "Plumbing demand is rising in Bhopal", copy: "Consider launching an additional batch.", icon: Wrench, tone: "green", path: "/ngo/jobs" },
  { title: "3 workers may drop out", copy: "Low attendance detected. Take action.", icon: AlertTriangle, tone: "orange", path: "/ngo/training/demo-training-housekeeping/attendance" },
  { title: "8 certified workers", copy: "Ready for employer matching.", icon: Users, tone: "purple", path: "/ngo/recommendations" },
  { title: "2 consent requests pending", copy: "Follow up to complete profile access.", icon: ShieldCheck, tone: "blue", path: "/ngo/requests" }
];

const topPerformers = [
  { name: "Asha Kumari", role: "Housekeeping", progress: 92, status: "Certified", activity: "Today", photoName: "Asha Kumari" },
  { name: "Imran Khan", role: "Electrician", progress: 74, status: "Assessment", activity: "Yesterday", photoName: "Imran Khan" },
  { name: "Rekha Devi", role: "Tailor", progress: 61, status: "In Training", activity: "2 days ago", photoName: "Rekha Devi" }
];

const recentCertificates = [
  { title: "Plumbing Skills Advancement", worker: "Ramesh Patel", issued: "Issued on 18 Jul 2026", tone: "amber" },
  { title: "Basic Electrical Safety", worker: "Imran Khan", issued: "Issued on 17 Jul 2026", tone: "blue" },
  { title: "Workplace Readiness & Housekeeping", worker: "Asha Kumari", issued: "Issued on 16 Jul 2026", tone: "green" }
];

const skillDemand = [
  { label: "Electricians", value: 92, icon: Zap, color: "bg-green-500" },
  { label: "Plumbers", value: 88, icon: Wrench, color: "bg-blue-500" },
  { label: "Housekeeping", value: 76, icon: Sparkles, color: "bg-violet-500" },
  { label: "Tailors", value: 70, icon: Award, color: "bg-orange-500" }
];

const toneClasses = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  green: "border-green-100 bg-green-50 text-green-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
  purple: "border-violet-100 bg-violet-50 text-violet-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  orange: "border-orange-100 bg-orange-50 text-orange-700"
};

function workerPhotoByName(name) {
  return demoProfiles.find((worker) => worker.name === name)?.photoUrl || demoProfiles[0]?.photoUrl;
}

function MetricChip({ icon: Icon, label, value, tone = "blue" }) {
  return (
    <div className="flex h-[58px] min-w-[96px] items-center gap-2 rounded-xl border border-slate-200 bg-white/92 px-2.5 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.045)]">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border ${toneClasses[tone] || toneClasses.blue}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-black leading-none text-slate-950">{value}</p>
        <p className="mt-1 whitespace-normal text-[10px] font-black leading-[1.15] text-slate-600">{label}</p>
      </div>
    </div>
  );
}

function CircularProgress({ value, size = 96, stroke = 7 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, Number(value))) / 100) * circumference;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#22c55e" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-black text-slate-950">{value}%</p>
        <p className="text-[10px] font-black text-slate-500">Complete</p>
      </div>
    </div>
  );
}

function ProgrammeCard({ programme, navigateTo }) {
  const meta = programmeMeta[programme.id] || {};
  const displayed = {
    ...programme,
    title: meta.title || programme.title,
    statusLabel: meta.statusLabel || titleCase(programme.status),
    progress: meta.progress ?? programme.completionRate ?? 0,
    enrolled: meta.enrolled ?? programme.enrolledCount ?? 0,
    certified: meta.certified ?? programme.certificateCount ?? 0,
    employerReady: meta.employerReady ?? programme.jobReadyCount ?? 0,
    aiScore: meta.aiScore ?? Math.max(1, Math.min(5, Math.round(Number(programme.completionRate || 0) / 20))),
    aiLabel: meta.aiLabel || "Placement potential"
  };
  return (
    <article className="grid h-full min-h-0 min-w-0 grid-rows-[82px_44px_38px_32px] gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_10px_28px_rgba(15,23,42,0.045)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.075)]">
      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_72px] gap-2">
        <div className="min-w-0">
          <div className="grid min-h-[36px] content-start gap-1">
            <h3 className="line-clamp-2 text-[13.5px] font-black leading-tight text-slate-950">{displayed.title}</h3>
            <Badge value={programme.status} label={displayed.statusLabel} />
          </div>
          <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.06em] text-slate-500">{programme.programmeCode}</p>
        </div>
        <CircularProgress value={displayed.progress} size={72} stroke={6} />
      </div>

      <div className="space-y-1 text-[10px] font-bold text-slate-600">
        <p className="flex items-center gap-1.5 truncate"><MapPin className="h-3 w-3 shrink-0 text-slate-400" /> {programme.locationName}</p>
        <p className="flex items-center gap-1.5 truncate"><Users className="h-3 w-3 shrink-0 text-slate-400" /> Trainer: {programme.trainerName}</p>
        <p className="flex items-center gap-1.5 truncate"><CalendarDays className="h-3 w-3 shrink-0 text-slate-400" /> {formatDate(programme.startDate)} → {formatDate(programme.endDate)}</p>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {[
          ["Enrolled", displayed.enrolled, Users],
          ["Certified", displayed.certified, ShieldCheck],
          ["Employer Ready", displayed.employerReady, Users]
        ].map(([label, value, Icon]) => (
          <div key={label} className="rounded-lg bg-slate-50 px-1.5 py-1 text-center">
            <Icon className="mx-auto h-3.5 w-3.5 text-blue-600" />
            <p className="mt-0.5 text-xs font-black text-slate-950">{value}</p>
            <p className="truncate text-[9px] font-black text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex h-[38px] items-center justify-between gap-2 rounded-xl bg-green-50 px-2 text-[10px]">
        <span className="font-black text-green-800">AI Score</span>
        <span className="flex items-center gap-1 text-green-700">
          {Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-3 w-3 ${index < displayed.aiScore ? "fill-current" : ""}`} />)}
        </span>
        <span className="truncate font-bold text-green-700">{displayed.aiLabel}</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 self-end">
        <button type="button" onClick={() => navigateTo(`/ngo/training/${programme.id}`)} className="min-h-8 rounded-lg border border-blue-200 bg-white text-[11px] font-black text-blue-700 hover:bg-blue-50">View</button>
        <button type="button" onClick={() => navigateTo(`/ngo/training/${programme.id}/edit`)} className="min-h-8 rounded-lg border border-blue-200 bg-white text-[11px] font-black text-blue-700 hover:bg-blue-50">Manage</button>
        <button type="button" onClick={() => navigateTo(`/ngo/training/${programme.id}/certificates`)} className="inline-flex min-h-8 items-center justify-center gap-1 rounded-lg bg-blue-600 px-1.5 text-[10px] font-black text-white hover:bg-blue-700"><FileBadge className="h-3 w-3" /> Certificates</button>
      </div>
    </article>
  );
}

function InsightCard({ insight, navigateTo }) {
  const Icon = insight.icon;
  return (
    <button type="button" onClick={() => navigateTo(insight.path)} className={`group flex h-[58px] w-full items-center gap-2.5 rounded-xl border px-3 text-left transition duration-200 hover:-translate-y-0.5 ${toneClasses[insight.tone] || toneClasses.blue}`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/70">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-black">{insight.title}</span>
        <span className="mt-0.5 block truncate text-[11px] font-semibold opacity-80">{insight.copy}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
    </button>
  );
}

function WorkerProgressRow({ worker, navigateTo }) {
  const statusToneClass = worker.status === "Certified" ? toneClasses.green : worker.status === "Assessment" ? toneClasses.blue : toneClasses.amber;
  return (
    <button type="button" onClick={() => navigateTo(`/ngo/workers/${encodeURIComponent(demoProfiles.find((item) => item.name === worker.name)?.workerId || "")}`)} className="grid h-12 w-full grid-cols-[1fr_76px_82px_58px] items-center gap-2 rounded-xl px-1.5 text-left transition hover:bg-slate-50">
      <span className="flex min-w-0 items-center gap-2">
        <img src={workerPhotoByName(worker.photoName)} alt={`${worker.name} profile`} className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-100" />
        <span className="min-w-0">
          <span className="block truncate text-xs font-black text-slate-950">{worker.name}</span>
          <span className="block truncate text-[11px] font-bold text-slate-500">{worker.role}</span>
        </span>
      </span>
      <span>
        <span className="text-[9px] font-black text-slate-500">Progress</span>
        <span className="mt-1 flex items-center gap-2">
          <span className="text-xs font-black text-slate-950">{worker.progress}%</span>
          <span className="h-1.5 w-10 rounded-full bg-slate-100"><span className="block h-full rounded-full bg-green-500" style={{ width: `${worker.progress}%` }} /></span>
        </span>
      </span>
      <span className={`w-fit rounded-full border px-2 py-0.5 text-[10px] font-black ${statusToneClass}`}>{worker.status}</span>
      <span className="text-[10px] font-bold text-slate-500">{worker.activity}</span>
    </button>
  );
}

function CertificatePreview({ certificate }) {
  const styles = {
    blue: "from-blue-50 to-white text-blue-700",
    green: "from-green-50 to-white text-green-700",
    amber: "from-amber-50 to-white text-amber-700"
  };
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className={`relative grid h-[92px] place-items-center overflow-hidden rounded-lg bg-gradient-to-br ${styles[certificate.tone] || styles.blue}`}>
        <div className="absolute inset-2 rounded-lg border border-current/20" />
        <FileCheck2 className="absolute right-1.5 top-1.5 h-4 w-4 rounded-full bg-green-500 p-0.5 text-white" />
        <div className="px-2 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.1em] opacity-70">Certificate</p>
          <p className="mt-1.5 h-6 line-clamp-2 text-[10px] font-black leading-tight text-slate-900">{certificate.title}</p>
          <Award className="mx-auto mt-1.5 h-5 w-5 text-amber-500" />
        </div>
      </div>
      <p className="mt-1.5 truncate text-[11px] font-black text-slate-950">{certificate.worker}</p>
      <p className="truncate text-[10px] font-semibold text-slate-500">{certificate.issued}</p>
    </article>
  );
}

function SkillDemandRow({ demand }) {
  const Icon = demand.icon;
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-black text-slate-950"><Icon className="h-3.5 w-3.5 text-blue-600" /> {demand.label}</p>
        <div className="mt-1.5 h-2 rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${demand.color}`} style={{ width: `${demand.value}%` }} />
        </div>
      </div>
      <p className="text-xs font-black text-slate-950">{demand.value}%</p>
    </div>
  );
}

function TrainingTimeline() {
  const steps = ["Orientation", "Enrollment", "Training", "Assessment", "Certification", "Employer Intro"];
  return (
    <Card className="h-full p-2.5">
      <div className="grid h-full gap-3 lg:grid-cols-[1fr_300px] lg:items-start">
        <div>
          <h3 className="text-[13px] font-black text-slate-950">Training Journey Overview</h3>
          <div className="mt-2.5 grid grid-cols-6 items-start gap-2">
            {steps.map((step, index) => {
              const complete = index < 2;
              const current = index === 2;
              return (
                <div key={step} className="relative text-center">
                  {index < steps.length - 1 && <span className="absolute left-1/2 top-2.5 h-px w-full border-t border-dashed border-blue-300" />}
                  <span className={`relative mx-auto grid h-6 w-6 place-items-center rounded-full border text-[10px] font-black ${complete ? "border-green-500 bg-green-500 text-white" : current ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-500"}`}>{index + 1}</span>
                  <p className={`mt-1.5 truncate text-[10px] font-black ${current ? "text-slate-950" : "text-slate-600"}`}>{step}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 pt-3 lg:-mt-0.5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <Users className="h-5 w-5" />
          </span>
          <p className="text-[11px] font-semibold leading-4 text-slate-600">
            <span className="block font-black text-slate-950">Workers are currently in the training phase.</span>
            <span className="font-black text-blue-700">Keep the momentum going!</span>
          </p>
        </div>
      </div>
    </Card>
  );
}

function OwnershipNotice() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold leading-6 text-blue-800">
      Training and certification records are added by the organization, while the worker continues to own and control their RozgaarAI profile.
    </div>
  );
}

async function loadProgrammeBundle(organizationId, programmeId, isDemoMode) {
  if (isDemoMode) {
    const programme = demoProgrammes.find((item) => item.id === programmeId) || demoProgrammes[0];
    return {
      programme,
      enrollments: demoEnrollments.filter((item) => item.programmeId === programme.id),
      sessions: [
        { id: "demo-session-1", title: "Orientation and safety", sessionDate: "2026-07-18", sessionType: "orientation", status: "completed" },
        { id: "demo-session-2", title: "Practical demonstration", sessionDate: "2026-07-24", sessionType: "practical", status: "completed" },
        { id: "demo-session-3", title: "Final assessment", sessionDate: "2026-08-12", sessionType: "assessment", status: "scheduled" }
      ],
      assessments: [],
      certificates: [],
      activity: []
    };
  }
  const programme = await database.getTrainingProgrammeById(programmeId, organizationId);
  if (!programme) return { programme: null, enrollments: [], sessions: [], assessments: [], certificates: [], activity: [] };
  const [enrollments, sessions, assessments, certificates, activity, workers] = await Promise.all([
    database.getProgrammeEnrollments(programme.id, organizationId),
    database.getTrainingSessions(programme.id, organizationId),
    database.getProgrammeAssessments(programme.id, organizationId),
    database.getOrganizationCertificates(organizationId),
    database.getTrainingActivity({ organizationId, programmeId: programme.id }),
    database.getOrganizationWorkers(organizationId)
  ]);
  const workerById = new Map(workers.map((worker) => [worker.workerProfileId, worker]));
  return {
    programme,
    enrollments: enrollments.map((enrollment) => ({ ...enrollment, worker: workerById.get(enrollment.workerProfileId) })),
    sessions,
    assessments,
    certificates: certificates.filter((certificate) => certificate.programmeId === programme.id),
    activity
  };
}

export function NgoTrainingProgrammes({ organization, membership, navigateTo, setStatusMessage, isDemoMode = false }) {
  const [programmes, setProgrammes] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const canCreate = isDemoMode || hasNgoPermission(membership, NGO_PERMISSIONS.createProgramme);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (isDemoMode) {
        if (!alive) return;
        setProgrammes(demoProgrammes);
        setStats({ totalProgrammes: 3, activeProgrammes: 2, workersInTraining: 24, trainingCompleted: 18, completionRate: 72, jobReadyWorkers: 23, certificatesIssued: 21, certificatesPendingVerification: 4 });
        return;
      }
      const [nextProgrammes, nextStats] = await Promise.all([
        database.getOrganizationTrainingProgrammes(organization.id),
        database.getTrainingDashboardStats(organization.id)
      ]);
      if (!alive) return;
      setProgrammes(nextProgrammes);
      setStats(nextStats);
    }
    load().catch((error) => setStatusMessage?.(error.message));
    return () => { alive = false; };
  }, [organization?.id, isDemoMode, setStatusMessage]);

  const filtered = programmes.filter((programme) => {
    const matchesQuery = !query || [programme.title, programme.programmeCode, programme.primarySkill, programme.city, programme.trainerName].some((value) => String(value || "").toLowerCase().includes(query.toLowerCase()));
    const matchesStatus = status === "all" || programme.status === status;
    return matchesQuery && matchesStatus;
  });
  const dashboardKpis = isDemoMode ? trainingKpis : [
    { label: "Workers Training", value: stats?.workersInTraining || 0, icon: Users, tone: "blue" },
    { label: "Active Programmes", value: stats?.activeProgrammes || 0, icon: BookOpenCheck, tone: "green" },
    { label: "Certified", value: stats?.certificatesIssued || stats?.trainingCompleted || 0, icon: ShieldCheck, tone: "violet" },
    { label: "Avg Progress", value: `${stats?.completionRate || 0}%`, icon: TrendingUp, tone: "amber" },
    { label: "Attendance", value: `${stats?.attendanceRate || 0}%`, icon: CheckCircle2, tone: "green" }
  ];
  const displayInsights = isDemoMode ? trainingInsights : [];
  const displayTopPerformers = isDemoMode ? topPerformers : [];
  const displayCertificates = isDemoMode ? recentCertificates : [];
  const displayDemand = isDemoMode ? skillDemand : [];

  return (
    <div className="mx-auto grid h-full max-w-[1440px] grid-rows-[184px_minmax(0,1.38fr)_minmax(0,0.9fr)_72px] gap-2.5 overflow-hidden pb-2.5 text-slate-950 max-xl:h-auto max-xl:grid-rows-none max-xl:overflow-y-auto">
      <section className="relative min-h-0 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-green-50 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.045)]">
        <div className="absolute bottom-0 right-0 top-0 w-[64%] overflow-hidden">
          <img src={ngoTrainingHero} alt="Indian workers learning vocational skills together" className="h-full w-full object-cover [object-position:center_38%]" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.97) 30%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0.05) 70%)"
            }}
          />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="max-w-[780px]">
              <h2 className="text-[30px] font-black leading-tight tracking-tight text-slate-950">Training & Certifications</h2>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold leading-6 text-slate-700">
                  Upskill workers. Track learning. Verify skills.<br />
                  Connect certified workers directly with employers.
                </p>
                <div className="relative z-20 flex shrink-0 gap-2">
                  <button type="button" onClick={() => navigateTo("/ngo/certificates")} className="inline-flex min-h-[34px] items-center gap-2 rounded-xl border border-blue-200 bg-white/95 px-3 text-xs font-black text-blue-700 shadow-sm hover:bg-blue-50"><FileBadge className="h-3.5 w-3.5" /> Certificate Registry</button>
                  {canCreate && <button type="button" onClick={() => navigateTo("/ngo/training/new")} className="inline-flex min-h-[34px] items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-black text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] hover:bg-blue-700"><Plus className="h-3.5 w-3.5" /> Launch New Training Programme</button>}
                </div>
              </div>
            </div>
          </div>
          <div className="flex max-w-[590px] flex-nowrap gap-2">
            {dashboardKpis.map((kpi) => <MetricChip key={kpi.label} {...kpi} />)}
          </div>
        </div>
      </section>

      <section className="grid min-h-0 gap-2 xl:grid-cols-[minmax(0,72fr)_minmax(300px,28fr)]">
        <Card className="h-full min-h-0 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-950">Active Programmes</h3>
              <p className="mt-0.5 text-[11px] font-bold text-slate-500">{filtered.length} programmes matching current filters</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-8 w-48 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-bold outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="Search programmes..." />
              </label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
                <option value="all">All Status</option>
                {["upcoming", "active", "completed"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}
              </select>
              <button type="button" onClick={() => navigateTo("/ngo/training")} className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">View all</button>
            </div>
          </div>
          {filtered.length ? (
            <div className="grid h-[calc(100%-40px)] min-h-0 grid-cols-3 gap-2">
              {filtered.slice(0, 3).map((programme) => <ProgrammeCard key={programme.id} programme={programme} navigateTo={navigateTo} />)}
            </div>
          ) : (
            <EmptyCopy title={isDemoMode ? "No demo programmes match this search" : "No training programmes yet"} copy={isDemoMode ? "Clear filters to see demo training activity." : "Create your first programme to enrol workers, track attendance and issue credentials."} />
          )}
        </Card>

        <Card className="h-full min-h-0 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-black text-slate-950">AI Insights & Recommendations</h3>
            <button type="button" onClick={() => navigateTo("/ngo/reports")} className="text-xs font-black text-blue-700">View all</button>
          </div>
          {displayInsights.length ? <div className="space-y-2">
            {displayInsights.map((insight) => <InsightCard key={insight.title} insight={insight} navigateTo={navigateTo} />)}
          </div> : <EmptyCopy title="No AI insights yet" copy="Insights will appear after real training, attendance and certification data is recorded." />}
        </Card>
      </section>

      <section className="grid min-h-0 gap-2 xl:grid-cols-[34fr_35fr_31fr]">
        <Card className="h-full min-h-0 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <h3 className="text-base font-black text-slate-950">Top Performing Workers</h3>
            <button type="button" onClick={() => navigateTo("/ngo/workers")} className="text-xs font-black text-blue-700">View all</button>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_76px_82px_58px] gap-2 px-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-400">
              <span>Worker</span><span>Progress</span><span>Status</span><span>Last Activity</span>
            </div>
            {displayTopPerformers.length ? displayTopPerformers.map((worker) => <WorkerProgressRow key={worker.name} worker={worker} navigateTo={navigateTo} />) : <EmptyCopy title="No worker progress yet" copy="Enrolled worker progress will appear here after training begins." />}
          </div>
        </Card>

        <Card className="h-full min-h-0 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-black text-slate-950">Recent Certificates</h3>
            <button type="button" onClick={() => navigateTo("/ngo/certificates")} className="text-xs font-black text-blue-700">View all</button>
          </div>
          {displayCertificates.length ? <div className="grid grid-cols-3 gap-2">
            {displayCertificates.map((certificate) => <CertificatePreview key={`${certificate.title}-${certificate.worker}`} certificate={certificate} />)}
          </div> : <EmptyCopy title="No certificates issued" copy="Verified certificates will appear after workers complete real programmes." />}
        </Card>

        <Card className="h-full min-h-0 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-black text-slate-950">Employer Skill Demand</h3>
            <button type="button" onClick={() => navigateTo("/ngo/reports/placements")} className="text-xs font-black text-blue-700">View report</button>
          </div>
          {displayDemand.length ? <>
            <div className="space-y-2.5">
              {displayDemand.map((demand) => <SkillDemandRow key={demand.label} demand={demand} />)}
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-blue-50 px-2.5 py-1.5">
              <p className="truncate text-[11px] font-semibold text-blue-800"><span className="font-black text-green-700">AI Suggestion:</span> Create another Electrical Safety batch.</p>
              <button type="button" onClick={() => navigateTo("/ngo/training/new?template=electrical-safety")} className="min-h-7 shrink-0 rounded-lg bg-blue-600 px-3 text-[11px] font-black text-white">Create Now</button>
            </div>
          </> : <EmptyCopy title="No employer demand yet" copy="Skill demand will appear after employer opportunities are connected." />}
        </Card>
      </section>

      <section className="min-h-0 overflow-hidden">
        <TrainingTimeline />
      </section>
    </div>
  );
}

export function NgoTrainingProgrammeForm({ organization, account, membership, navigateTo, setStatusMessage, routeInfo, isDemoMode = false }) {
  const editing = Boolean(routeInfo?.programmeId);
  const canManage = isDemoMode || hasNgoPermission(membership, editing ? NGO_PERMISSIONS.manageProgramme : NGO_PERMISSIONS.createProgramme);
  const [form, setForm] = useState({
    title: "",
    programmeCode: "",
    description: "",
    skillSector: "",
    primarySkill: "",
    deliveryMode: "in_person",
    locationName: "",
    city: "",
    state: "",
    startDate: "",
    endDate: "",
    enrolmentStartDate: "",
    enrolmentEndDate: "",
    capacity: "",
    trainerName: "",
    status: "draft",
    durationHours: "",
    minimumAttendancePercentage: 75,
    assessmentRequired: true,
    certificateEnabled: true
  });

  useEffect(() => {
    if (!editing) return;
    database.getTrainingProgrammeById(routeInfo.programmeId, organization.id)
      .then((programme) => programme && setForm((current) => ({ ...current, ...programme })))
      .catch((error) => setStatusMessage?.(error.message));
  }, [editing, routeInfo?.programmeId, organization?.id, setStatusMessage]);

  async function save(event) {
    event.preventDefault();
    if (!canManage) return setStatusMessage?.("You do not have permission to manage training programmes.");
    try {
      if (isDemoMode) {
        setStatusMessage?.("Demo programme save simulated. No real programme was created.");
        navigateTo("/ngo/training");
        return;
      }
      const payload = { ...form, organizationId: organization.id };
      const programme = editing
        ? await database.updateTrainingProgramme(routeInfo.programmeId, payload, account)
        : await database.createTrainingProgramme(payload, account);
      setStatusMessage?.(editing ? "Programme changes saved." : "Training programme created.");
      navigateTo(`/ngo/training/${programme.id}`);
    } catch (error) {
      setStatusMessage?.(error.message);
    }
  }

  return (
    <div className="mx-auto grid h-full max-w-[1120px] content-start gap-4 overflow-y-auto pr-1">
      <button type="button" onClick={() => navigateTo(editing ? `/ngo/training/${routeInfo.programmeId}` : "/ngo/training")} className="inline-flex w-fit items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to Training</button>
      <div>
        <h2 className="text-3xl font-black text-slate-950">{editing ? "Edit Training Programme" : "Create Training Programme"}</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">Programme records stay scoped to your organization and never overwrite worker-owned identity information.</p>
      </div>
      <form onSubmit={save} className="grid gap-4">
        <Card className="p-5">
          <h3 className="text-lg font-black text-slate-950">Programme Basics</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Programme Title"><input required className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field>
            <Field label="Programme Code"><input required className={inputClass} value={form.programmeCode} onChange={(event) => setForm({ ...form, programmeCode: event.target.value.toUpperCase() })} /></Field>
            <Field label="Primary Skill"><input required className={inputClass} value={form.primarySkill} onChange={(event) => setForm({ ...form, primarySkill: event.target.value })} /></Field>
            <Field label="Skill Sector"><input className={inputClass} value={form.skillSector} onChange={(event) => setForm({ ...form, skillSector: event.target.value })} /></Field>
            <div className="md:col-span-2"><Field label="Description"><textarea className={`${inputClass} min-h-24 py-3`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field></div>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-lg font-black text-slate-950">Schedule and Settings</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Delivery Mode"><select className={inputClass} value={form.deliveryMode} onChange={(event) => setForm({ ...form, deliveryMode: event.target.value })}>{["in_person", "online", "hybrid", "on_the_job"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></Field>
            <Field label="Start Date"><input required type="date" className={inputClass} value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} /></Field>
            <Field label="End Date"><input required type="date" className={inputClass} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} /></Field>
            <Field label="Location"><input className={inputClass} value={form.locationName} onChange={(event) => setForm({ ...form, locationName: event.target.value })} /></Field>
            <Field label="City"><input className={inputClass} value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></Field>
            <Field label="State"><input className={inputClass} value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} /></Field>
            <Field label="Capacity"><input type="number" min="1" className={inputClass} value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} /></Field>
            <Field label="Trainer"><input className={inputClass} value={form.trainerName} onChange={(event) => setForm({ ...form, trainerName: event.target.value })} /></Field>
            <Field label="Duration Hours"><input type="number" min="0" className={inputClass} value={form.durationHours} onChange={(event) => setForm({ ...form, durationHours: event.target.value })} /></Field>
            <Field label="Minimum Attendance %"><input type="number" min="0" max="100" className={inputClass} value={form.minimumAttendancePercentage} onChange={(event) => setForm({ ...form, minimumAttendancePercentage: event.target.value })} /></Field>
            <Field label="Status"><select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{["draft", "upcoming", "active", "completed", "archived", "cancelled"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></Field>
            <div className="grid gap-2">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700"><input type="checkbox" checked={form.assessmentRequired} onChange={(event) => setForm({ ...form, assessmentRequired: event.target.checked })} /> Assessment required</label>
              <label className="flex items-center gap-2 text-sm font-black text-slate-700"><input type="checkbox" checked={form.certificateEnabled} onChange={(event) => setForm({ ...form, certificateEnabled: event.target.checked })} /> Certificate enabled</label>
            </div>
          </div>
        </Card>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigateTo("/ngo/training")} className="min-h-10 rounded-xl border border-slate-200 px-4 text-sm font-black text-slate-700">Cancel</button>
          <button type="submit" className="min-h-10 rounded-xl bg-blue-600 px-5 text-sm font-black text-white">{editing ? "Save Changes" : form.status === "draft" ? "Save Draft" : "Publish Programme"}</button>
        </div>
      </form>
    </div>
  );
}

export function NgoTrainingProgrammeDetail({ organization, navigateTo, routeInfo, setStatusMessage, isDemoMode = false }) {
  const [bundle, setBundle] = useState({ programme: null, enrollments: [], sessions: [], assessments: [], certificates: [], activity: [] });
  const programmeId = routeInfo?.programmeId || "demo-training-housekeeping";

  useEffect(() => {
    loadProgrammeBundle(organization.id, programmeId, isDemoMode).then(setBundle).catch((error) => setStatusMessage?.(error.message));
  }, [organization?.id, programmeId, isDemoMode, setStatusMessage]);

  const { programme, enrollments, sessions, assessments, certificates, activity } = bundle;
  if (!programme) return <Card className="p-8"><h2 className="text-xl font-black">Programme not found</h2><button type="button" onClick={() => navigateTo("/ngo/training")} className="mt-4 text-sm font-black text-blue-700">Back to training</button></Card>;
  const completed = enrollments.filter((item) => item.completionStatus === "completed").length;
  const passed = assessments.filter((item) => item.resultStatus === "passed").length;

  return (
    <div className="mx-auto grid h-full max-w-[1440px] content-start gap-4 overflow-y-auto pr-1">
      <button type="button" onClick={() => navigateTo("/ngo/training")} className="inline-flex w-fit items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Training Programmes</button>
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2"><h2 className="text-3xl font-black text-slate-950">{programme.title}</h2><Badge value={programme.status} /></div>
            <p className="mt-2 text-sm font-bold text-slate-500">{programme.programmeCode} • {programme.primarySkill} • {formatDate(programme.startDate)} to {formatDate(programme.endDate)}</p>
            <p className="mt-2 text-sm font-semibold text-slate-600">{programme.description || "No description added."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigateTo(`/ngo/training/${programme.id}/edit`)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-blue-700">Edit</button>
            <button type="button" onClick={() => navigateTo(`/ngo/training/${programme.id}/enrol`)} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white">Enrol Workers</button>
            <button type="button" onClick={() => navigateTo(`/ngo/training/${programme.id}/attendance`)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-blue-700">Attendance</button>
            <button type="button" onClick={() => navigateTo(`/ngo/training/${programme.id}/assessments`)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-blue-700">Assessments</button>
            <button type="button" onClick={() => navigateTo(`/ngo/training/${programme.id}/certificates`)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-blue-700">Certificates</button>
          </div>
        </div>
      </Card>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Users} label="Enrolled Workers" value={enrollments.length} />
        <Metric icon={CheckCircle2} label="Completed" value={completed} tone="green" />
        <Metric icon={ClipboardCheck} label="Assessment Passes" value={passed} tone="violet" />
        <Metric icon={FileBadge} label="Certificates Issued" value={certificates.length} tone="amber" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-5">
          <h3 className="text-lg font-black text-slate-950">Enrolled Workers</h3>
          <div className="mt-4 divide-y divide-slate-100">
            {enrollments.length ? enrollments.map((enrollment) => <EnrollmentRow key={enrollment.id} enrollment={enrollment} />) : <EmptyCopy title="No workers enrolled" copy="Select eligible workers linked to your organization and add them to this programme." />}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-lg font-black text-slate-950">Recent Training Activity</h3>
          <div className="mt-4 space-y-3">
            {(activity.length ? activity : [{ id: "empty", description: "No training activity yet.", createdAt: "" }]).slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-sm font-bold text-slate-700">{item.description}</p>
                {item.createdAt && <p className="mt-1 text-xs font-bold text-slate-500">{formatDate(item.createdAt)}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <MiniList title="Sessions" items={sessions.map((item) => `${item.title} • ${formatDate(item.sessionDate)}`)} empty="No sessions scheduled" />
        <MiniList title="Assessments" items={assessments.map((item) => `${item.assessmentTitle} • ${item.percentage}%`)} empty="No assessments recorded" />
        <MiniList title="Certificates" items={certificates.map((item) => `${item.certificateTitle} • ${titleCase(item.verificationStatus)}`)} empty="No certificates issued" />
      </div>
    </div>
  );
}

function EnrollmentRow({ enrollment }) {
  const worker = enrollment.worker || {};
  return (
    <div className="grid gap-3 py-3 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div>
        <p className="font-black text-slate-950">{worker.name || enrollment.workerProfileId}</p>
        <p className="mt-1 text-xs font-bold text-slate-500">{worker.primarySkill || "Skill pending"} • {worker.city || "City pending"}</p>
      </div>
      <Badge value={enrollment.enrollmentStatus} />
      <div className="min-w-40">
        <p className="text-xs font-black text-slate-500">{enrollment.completionPercentage}% complete</p>
        <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${enrollment.completionPercentage}%` }} /></div>
      </div>
    </div>
  );
}

function MiniList({ title, items, empty }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <div className="mt-4 space-y-2">
        {items.length ? items.slice(0, 5).map((item) => <p key={item} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-bold text-slate-700">{item}</p>) : <p className="text-sm font-semibold text-slate-500">{empty}</p>}
      </div>
    </Card>
  );
}

function EmptyCopy({ title, copy }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 p-6"><h3 className="font-black text-slate-950">{title}</h3><p className="mt-2 text-sm font-semibold text-slate-600">{copy}</p></div>;
}

export function NgoEnrolWorkers({ organization, account, navigateTo, routeInfo, setStatusMessage, isDemoMode = false }) {
  const [programme, setProgramme] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selected, setSelected] = useState([]);
  const programmeId = routeInfo?.programmeId || "demo-training-housekeeping";

  useEffect(() => {
    async function load() {
      if (isDemoMode) {
        setProgramme(demoProgrammes.find((item) => item.id === programmeId) || demoProgrammes[0]);
        setWorkers(demoProfiles.map((worker) => ({ ...worker, workerProfileId: worker.workerId, name: worker.name, primarySkill: worker.skill, city: worker.city, profileCompletion: 92, eligible: true, eligibilityReason: "Eligible for demo enrolment" })));
        return;
      }
      const [nextProgramme, nextWorkers] = await Promise.all([
        database.getTrainingProgrammeById(programmeId, organization.id),
        database.getEligibleWorkersForProgramme({ organizationId: organization.id, programmeId })
      ]);
      setProgramme(nextProgramme);
      setWorkers(nextWorkers);
    }
    load().catch((error) => setStatusMessage?.(error.message));
  }, [organization?.id, programmeId, isDemoMode, setStatusMessage]);

  async function enrol() {
    try {
      if (isDemoMode) {
        setStatusMessage?.(`${selected.length} demo worker enrolment simulated.`);
        navigateTo(`/ngo/training/${programmeId}`);
        return;
      }
      await database.enrolWorkersInProgramme({ organizationId: organization.id, programmeId, workerProfileIds: selected, account });
      setStatusMessage?.("Selected workers enrolled.");
      navigateTo(`/ngo/training/${programmeId}`);
    } catch (error) {
      setStatusMessage?.(error.message);
    }
  }

  return (
    <div className="mx-auto grid h-full max-w-[1120px] content-start gap-4 overflow-y-auto pr-1">
      <button type="button" onClick={() => navigateTo(`/ngo/training/${programmeId}`)} className="inline-flex w-fit items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Programme</button>
      <div><h2 className="text-3xl font-black text-slate-950">Enrol Workers</h2><p className="mt-2 text-sm font-semibold text-slate-600">{programme?.title}</p></div>
      <OwnershipNotice />
      <Card className="p-5">
        <div className="divide-y divide-slate-100">
          {workers.length ? workers.map((worker) => (
            <label key={worker.workerProfileId} className="grid cursor-pointer gap-3 py-3 md:grid-cols-[auto_1fr_auto] md:items-center">
              <input type="checkbox" disabled={!worker.eligible} checked={selected.includes(worker.workerProfileId)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, worker.workerProfileId] : current.filter((id) => id !== worker.workerProfileId))} />
              <div>
                <p className="font-black text-slate-950">{worker.name}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{worker.primarySkill || worker.skill} • {worker.city} • {worker.profileCompletion || 0}% profile</p>
              </div>
              <span className={`text-xs font-black ${worker.eligible ? "text-green-700" : "text-slate-500"}`}>{worker.eligibilityReason}</span>
            </label>
          )) : <EmptyCopy title="No eligible workers" copy="Workers need active organization linkage and granted consent before enrolment." />}
        </div>
      </Card>
      <div className="flex justify-end"><button type="button" disabled={!selected.length} onClick={enrol} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white disabled:opacity-40"><UserPlus className="h-4 w-4" /> Enrol {selected.length || ""} Workers</button></div>
    </div>
  );
}

export function NgoTrainingAttendance({ organization, account, routeInfo, navigateTo, setStatusMessage, isDemoMode = false }) {
  const [bundle, setBundle] = useState({ programme: null, enrollments: [], sessions: [] });
  const [sessionId, setSessionId] = useState("");
  const [records, setRecords] = useState({});
  const programmeId = routeInfo?.programmeId || "demo-training-housekeeping";

  useEffect(() => {
    loadProgrammeBundle(organization.id, programmeId, isDemoMode).then((next) => {
      setBundle(next);
      setSessionId(next.sessions[0]?.id || "");
    }).catch((error) => setStatusMessage?.(error.message));
  }, [organization?.id, programmeId, isDemoMode, setStatusMessage]);

  async function save() {
    try {
      if (isDemoMode) return setStatusMessage?.("Demo attendance save simulated.");
      const payload = bundle.enrollments.map((enrollment) => ({ enrollmentId: enrollment.id, workerProfileId: enrollment.workerProfileId, attendanceStatus: records[enrollment.id] || "not_marked" }));
      await database.saveAttendanceRecords({ organizationId: organization.id, programmeId, sessionId, records: payload, account });
      setStatusMessage?.("Attendance saved.");
    } catch (error) {
      setStatusMessage?.(error.message);
    }
  }

  return <WorkflowPage title="Attendance" back={() => navigateTo(`/ngo/training/${programmeId}`)} action={<button onClick={save} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Attendance</button>}>
    <Field label="Session"><select className={inputClass} value={sessionId} onChange={(event) => setSessionId(event.target.value)}>{bundle.sessions.map((session) => <option key={session.id} value={session.id}>{session.title} • {formatDate(session.sessionDate)}</option>)}</select></Field>
    <Card className="mt-4 p-5"><div className="divide-y divide-slate-100">{bundle.enrollments.map((enrollment) => <div key={enrollment.id} className="grid gap-3 py-3 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-black">{enrollment.worker?.name || enrollment.workerProfileId}</p><p className="text-xs font-bold text-slate-500">{enrollment.attendancePercentage}% attendance</p></div><select className={inputClass} value={records[enrollment.id] || "not_marked"} onChange={(event) => setRecords({ ...records, [enrollment.id]: event.target.value })}>{["not_marked", "present", "absent", "late", "excused"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></div>)}</div></Card>
  </WorkflowPage>;
}

export function NgoTrainingAssessments({ organization, account, routeInfo, navigateTo, setStatusMessage, isDemoMode = false }) {
  const [bundle, setBundle] = useState({ programme: null, enrollments: [], assessments: [] });
  const [form, setForm] = useState({ enrollmentId: "", assessmentTitle: "Final practical assessment", assessmentType: "practical", score: "", maximumScore: "100", feedback: "" });
  const programmeId = routeInfo?.programmeId || "demo-training-housekeeping";

  useEffect(() => {
    loadProgrammeBundle(organization.id, programmeId, isDemoMode).then((next) => {
      setBundle(next);
      setForm((current) => ({ ...current, enrollmentId: next.enrollments[0]?.id || "" }));
    }).catch((error) => setStatusMessage?.(error.message));
  }, [organization?.id, programmeId, isDemoMode, setStatusMessage]);

  async function save(event) {
    event.preventDefault();
    try {
      if (isDemoMode) return setStatusMessage?.("Demo assessment save simulated.");
      const enrollment = bundle.enrollments.find((item) => item.id === form.enrollmentId);
      await database.createSkillAssessment({ ...form, organizationId: organization.id, programmeId, workerProfileId: enrollment.workerProfileId, skillName: bundle.programme.primarySkill, assessorName: account?.name || "NGO Trainer" }, account);
      setStatusMessage?.("Assessment recorded.");
      const next = await loadProgrammeBundle(organization.id, programmeId, false);
      setBundle(next);
    } catch (error) {
      setStatusMessage?.(error.message);
    }
  }

  return <WorkflowPage title="Assessments" back={() => navigateTo(`/ngo/training/${programmeId}`)}>
    <Card className="p-5"><form onSubmit={save} className="grid gap-4 md:grid-cols-2"><Field label="Worker"><select className={inputClass} value={form.enrollmentId} onChange={(event) => setForm({ ...form, enrollmentId: event.target.value })}>{bundle.enrollments.map((item) => <option key={item.id} value={item.id}>{item.worker?.name || item.workerProfileId}</option>)}</select></Field><Field label="Assessment Title"><input className={inputClass} value={form.assessmentTitle} onChange={(event) => setForm({ ...form, assessmentTitle: event.target.value })} /></Field><Field label="Type"><select className={inputClass} value={form.assessmentType} onChange={(event) => setForm({ ...form, assessmentType: event.target.value })}>{["theory", "practical", "oral", "project", "observation", "final", "other"].map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select></Field><Field label="Score"><input required type="number" className={inputClass} value={form.score} onChange={(event) => setForm({ ...form, score: event.target.value })} /></Field><Field label="Maximum Score"><input required type="number" className={inputClass} value={form.maximumScore} onChange={(event) => setForm({ ...form, maximumScore: event.target.value })} /></Field><Field label="Feedback"><input className={inputClass} value={form.feedback} onChange={(event) => setForm({ ...form, feedback: event.target.value })} /></Field><div className="md:col-span-2 flex justify-end"><button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white">Save Assessment</button></div></form></Card>
    <MiniList title="Recorded Assessments" items={bundle.assessments.map((item) => `${item.assessmentTitle} • ${item.percentage}% • ${titleCase(item.resultStatus)}`)} empty="No assessments recorded" />
  </WorkflowPage>;
}

export function NgoCertificates({ organization, account, routeInfo, navigateTo, setStatusMessage, isDemoMode = false }) {
  const programmeId = routeInfo?.programmeId || "";
  const [certificates, setCertificates] = useState([]);
  const [bundle, setBundle] = useState({ programme: null, enrollments: [] });
  const [form, setForm] = useState({ enrollmentId: "", certificateTitle: "", certificateNumber: "", skillName: "", issueDate: new Date().toISOString().slice(0, 10), verificationStatus: "issued" });

  useEffect(() => {
    async function load() {
      if (isDemoMode) {
        setCertificates([{ id: "demo-cert-1", certificateTitle: "Basic Electrical Safety", certificateNumber: "DEMO-CERT-001", workerProfileId: demoProfiles[1]?.workerId, skillName: "Electrical Work", issueDate: "2026-07-18", verificationStatus: "verified" }]);
        return;
      }
      const nextCertificates = await database.getOrganizationCertificates(organization.id);
      setCertificates(programmeId ? nextCertificates.filter((item) => item.programmeId === programmeId) : nextCertificates);
      if (programmeId) {
        const nextBundle = await loadProgrammeBundle(organization.id, programmeId, false);
        setBundle(nextBundle);
        setForm((current) => ({ ...current, enrollmentId: nextBundle.enrollments[0]?.id || "", skillName: nextBundle.programme?.primarySkill || "", certificateTitle: nextBundle.programme ? `${nextBundle.programme.primarySkill} Completion Certificate` : "" }));
      }
    }
    load().catch((error) => setStatusMessage?.(error.message));
  }, [organization?.id, programmeId, isDemoMode, setStatusMessage]);

  async function issue(event) {
    event.preventDefault();
    try {
      if (isDemoMode) return setStatusMessage?.("Demo certificate issue simulated.");
      const enrollment = bundle.enrollments.find((item) => item.id === form.enrollmentId);
      await database.issueWorkerCertificate({ ...form, organizationId: organization.id, programmeId, workerProfileId: enrollment.workerProfileId }, account);
      setStatusMessage?.("Certificate issued.");
      setCertificates(await database.getOrganizationCertificates(organization.id));
    } catch (error) {
      setStatusMessage?.(error.message);
    }
  }

  return <WorkflowPage title={programmeId ? "Programme Certificates" : "Certificate Registry"} back={() => navigateTo(programmeId ? `/ngo/training/${programmeId}` : "/ngo/training")}>
    {programmeId && <Card className="p-5"><form onSubmit={issue} className="grid gap-4 md:grid-cols-2"><Field label="Worker"><select className={inputClass} value={form.enrollmentId} onChange={(event) => setForm({ ...form, enrollmentId: event.target.value })}>{bundle.enrollments.map((item) => <option key={item.id} value={item.id}>{item.worker?.name || item.workerProfileId}</option>)}</select></Field><Field label="Certificate Title"><input required className={inputClass} value={form.certificateTitle} onChange={(event) => setForm({ ...form, certificateTitle: event.target.value })} /></Field><Field label="Certificate Number"><input required className={inputClass} value={form.certificateNumber} onChange={(event) => setForm({ ...form, certificateNumber: event.target.value })} /></Field><Field label="Skill"><input className={inputClass} value={form.skillName} onChange={(event) => setForm({ ...form, skillName: event.target.value })} /></Field><div className="md:col-span-2 flex justify-end"><button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white">Issue Certificate</button></div></form></Card>}
    <Card className="overflow-hidden"><div className="divide-y divide-slate-100">{certificates.length ? certificates.map((certificate) => <article key={certificate.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center"><div><p className="font-black text-slate-950">{certificate.certificateTitle}</p><p className="text-xs font-bold text-slate-500">{certificate.certificateNumber} • {certificate.skillName} • {formatDate(certificate.issueDate)}</p></div><Badge value={certificate.verificationStatus} /><button type="button" onClick={() => navigateTo(`/ngo/certificates/${certificate.id}`)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-blue-700">Open</button></article>) : <div className="p-6"><EmptyCopy title="No certificates issued" copy="Certificates issued after training completion will appear here." /></div>}</div></Card>
  </WorkflowPage>;
}

export function NgoCertificateDetail({ organization, account, routeInfo, navigateTo, setStatusMessage }) {
  const [certificate, setCertificate] = useState(null);
  useEffect(() => {
    database.getCertificateById(routeInfo.certificateId, organization.id).then(setCertificate).catch((error) => setStatusMessage?.(error.message));
  }, [routeInfo?.certificateId, organization?.id, setStatusMessage]);
  async function verify() {
    try {
      const next = await database.verifyWorkerCertificate(certificate.id, account);
      setCertificate(next);
      setStatusMessage?.("Certificate verified.");
    } catch (error) {
      setStatusMessage?.(error.message);
    }
  }
  async function revoke() {
    try {
      const next = await database.revokeWorkerCertificate(certificate.id, "Revoked from organization certificate detail.", account);
      setCertificate(next);
      setStatusMessage?.("Certificate revoked.");
    } catch (error) {
      setStatusMessage?.(error.message);
    }
  }
  if (!certificate) return <Card className="p-8"><h2 className="text-xl font-black">Certificate not found</h2></Card>;
  return <WorkflowPage title="Certificate Detail" back={() => navigateTo("/ngo/certificates")}><Card className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-black text-slate-950">{certificate.certificateTitle}</h2><p className="mt-2 text-sm font-bold text-slate-500">{certificate.certificateNumber} • {certificate.skillName}</p><p className="mt-2 text-sm font-semibold text-slate-600">Issued on {formatDate(certificate.issueDate)}</p></div><Badge value={certificate.verificationStatus} /></div><div className="mt-6 flex flex-wrap gap-2"><button onClick={verify} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-black text-white">Verify Certificate</button><button onClick={revoke} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700">Revoke</button></div></Card></WorkflowPage>;
}

function WorkflowPage({ title, back, action, children }) {
  return <div className="mx-auto grid h-full max-w-[1120px] content-start gap-4 overflow-y-auto pr-1"><div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={back} className="inline-flex w-fit items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back</button>{action}</div><h2 className="text-3xl font-black text-slate-950">{title}</h2><OwnershipNotice />{children}</div>;
}
