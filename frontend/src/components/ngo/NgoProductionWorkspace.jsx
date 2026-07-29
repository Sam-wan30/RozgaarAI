import {
  Activity,
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Edit3,
  Eye,
  Download,
  ExternalLink,
  FilterX,
  FileText,
  GraduationCap,
  IdCard,
  LockKeyhole,
  MapPin,
  MoreVertical,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  SlidersHorizontal,
  Trophy,
  UserCog,
  UserPlus,
  Users,
  Wifi,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { database } from "../../lib/database";
import { NGO_PERMISSION_LABELS, NGO_ROLE_LABELS, getNgoPermissionMatrix } from "../../lib/permissions";
import { hasNgoPermission, NGO_PERMISSIONS } from "../../lib/roles";
import {
  ngoPendingInvitations,
  ngoPerformanceMetrics,
  ngoPermissionGroups,
  ngoRecentActivity,
  ngoRoleDistribution,
  ngoTeamMembers
} from "../../data/ngoTeamData";
import { demoNgoAuditEvents } from "../../data/demoNgoAuditEvents";
import {
  demoChecklistSummary,
  demoLastReview,
  demoPermissionMatrix,
  demoPermissionSummary,
  demoProductionChecklist
} from "../../data/demoNgoSettings";
import ngoTeamHeroAsset from "../../assets/ngo-team-workspace-hero.png";
import ashaWorkerPhoto from "../../assets/workers/asha-kumari-domestic-worker.jpg";
import imranWorkerPhoto from "../../assets/workers/imran-khan-electrician.jpg";
import rameshWorkerPhoto from "../../assets/workers/ramesh-patel-plumber.jpg";
import rekhaWorkerPhoto from "../../assets/workers/rekha-devi-tailor.jpg";
import sanjayWorkerPhoto from "../../assets/workers/sanjay-verma-driver.jpg";

const reportsHeroAsset = "/assets/ngo-reports-analytics-hero.webp";
const indiaDistributionMapAsset = "/assets/india-worker-distribution-map.webp";
const reportsImpactPhotos = [ashaWorkerPhoto, imranWorkerPhoto, rameshWorkerPhoto, rekhaWorkerPhoto, sanjayWorkerPhoto];

function Card({ children, className = "" }) {
  return <section className={`min-w-0 rounded-2xl border border-[#e7ecf4] bg-white shadow-[0_14px_42px_rgba(15,23,42,0.045)] ${className}`}>{children}</section>;
}

function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Production Workspace</p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

function exportCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function EmptyState({ icon: Icon = AlertCircle, title, description }) {
  return (
    <Card className="p-8 text-center">
      <Icon className="mx-auto h-10 w-10 text-blue-600" />
      <h3 className="mt-3 text-xl font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600">{description}</p>
    </Card>
  );
}

const ngoDemoAnalytics = {
  summary: {
    workersOnboarded: 248,
    profileCompletion: 88,
    certificationsIssued: 112,
    activePlacements: 76
  },
  comparison: {
    workersOnboardedChange: 18,
    profileCompletionChange: 12,
    certificationsIssuedChange: 21,
    activePlacementsChange: 15
  },
  impact: {
    workersTrained: 186,
    workersTrainedTarget: 200,
    workersEmployed: 76,
    workersEmployedTarget: 100,
    activeCities: 12,
    activeStates: 3,
    incomeImprovement: 234500,
    averageIncomeIncreasePerWorker: 3085
  },
  retention: {
    joinedPlacements: 76,
    stillActive: 54,
    droppedOff: 22,
    retentionRate: 71
  },
  programmePerformance: [
    { name: "Digital Literacy", workers: 45, completion: 90, tone: "blue" },
    { name: "Tailoring Basics", workers: 38, completion: 84, tone: "rose" },
    { name: "Electrical Safety", workers: 29, completion: 78, tone: "orange" },
    { name: "Plumbing Essentials", workers: 22, completion: 92, tone: "amber" }
  ],
  geographicDistribution: [
    { state: "Madhya Pradesh", workers: 98, percentage: 39, color: "#22c55e" },
    { state: "Maharashtra", workers: 76, percentage: 31, color: "#2563eb" },
    { state: "Chhattisgarh", workers: 74, percentage: 30, color: "#8b5cf6" }
  ],
  monthlyOnboardingTrend: {
    thisMonth: [
      ["May 1", 5], ["May 5", 12], ["May 8", 21], ["May 11", 18], ["May 14", 43], ["May 17", 41], ["May 20", 58], ["May 23", 52], ["May 26", 76], ["May 28", 79], ["May 29", 96]
    ],
    last3: [
      ["Mar", 96], ["Apr", 168], ["May", 248]
    ],
    last6: [
      ["Dec", 28], ["Jan", 46], ["Feb", 81], ["Mar", 96], ["Apr", 168], ["May", 248]
    ]
  }
};

const analyticsTone = {
  blue: { icon: "bg-blue-50 text-blue-700", line: "#2563eb", fill: "#dbeafe", border: "border-blue-100" },
  green: { icon: "bg-green-50 text-green-700", line: "#16a34a", fill: "#dcfce7", border: "border-green-100" },
  purple: { icon: "bg-violet-50 text-violet-700", line: "#8b5cf6", fill: "#ede9fe", border: "border-violet-100" },
  orange: { icon: "bg-orange-50 text-orange-700", line: "#f97316", fill: "#ffedd5", border: "border-orange-100" },
  rose: { icon: "bg-rose-50 text-rose-700", line: "#f43f5e", fill: "#ffe4e6", border: "border-rose-100" },
  amber: { icon: "bg-amber-50 text-amber-700", line: "#f59e0b", fill: "#fef3c7", border: "border-amber-100" }
};

function formatInr(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function Sparkline({ values, color = "#2563eb", fill = "#dbeafe", className = "" }) {
  const points = values.map((value, index) => {
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const x = 6 + (index * 148) / Math.max(1, values.length - 1);
    const y = 48 - ((value - min) * 34) / Math.max(1, max - min);
    return [x, y];
  });
  const linePath = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L154 54 L6 54 Z`;
  return (
    <svg className={className} viewBox="0 0 160 60" role="img" aria-label="Metric trend sparkline">
      <path d={areaPath} fill={fill} opacity="0.6" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnalyticsMetricCard({ icon: Icon, label, value, change, tone, values }) {
  const config = analyticsTone[tone];
  return (
    <Card className={`relative h-full min-h-0 overflow-hidden p-3.5 ${config.border}`}>
      <div className="relative z-10 flex items-start justify-between gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${config.icon}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="relative z-10 mt-2">
        <p className="text-[23px] font-black leading-none text-slate-950">{value}</p>
        <p className="mt-1 text-[13px] font-semibold text-slate-600">{label}</p>
        <p className="mt-1.5 text-[11px] font-black text-emerald-600">↑ {change}% from last month</p>
      </div>
      <Sparkline values={values} color={config.line} fill={config.fill} className="absolute bottom-2 right-3 h-10 w-32" />
    </Card>
  );
}

function ProgressRow({ icon: Icon, label, value, detail, percent, tone }) {
  const config = analyticsTone[tone];
  return (
    <div className="grid grid-cols-[32px_minmax(112px,140px)_minmax(82px,1fr)_40px] items-center gap-3">
      <span className={`grid h-8 w-8 place-items-center rounded-xl ${config.icon}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-black leading-tight text-slate-700">{label}</p>
        <p className="whitespace-nowrap text-base font-black leading-none text-slate-950">{value}</p>
        <p className="mt-0.5 text-[10px] font-semibold leading-tight text-slate-500">{detail}</p>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: config.line }} />
      </div>
      <p className="text-right text-xs font-black text-slate-700">{percent}%</p>
    </div>
  );
}

function OnboardingTrendChart({ points }) {
  const values = points.map((point) => point[1]);
  const max = Math.max(...values, 100);
  const coords = points.map((point, index) => {
    const x = 32 + (index * 376) / Math.max(1, points.length - 1);
    const y = 184 - (point[1] * 150) / max;
    return [x, y];
  });
  const linePath = coords.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L408 194 L32 194 Z`;
  const last = coords[coords.length - 1] || [0, 0];
  return (
    <svg viewBox="0 0 440 220" className="h-full w-full overflow-visible" role="img" aria-label="Worker onboarding trend chart">
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = 184 - (tick * 150) / 100;
        return <g key={tick}><line x1="32" x2="408" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" /><text x="8" y={y + 4} className="fill-slate-400 text-[10px] font-bold">{tick}</text></g>;
      })}
      <path d={areaPath} fill="url(#onboardingFill)" />
      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="7" fill="#2563eb" stroke="white" strokeWidth="4" />
      {points.filter((_, index) => index % Math.ceil(points.length / 4) === 0 || index === points.length - 1).map(([label], index, filtered) => {
        const originalIndex = points.findIndex((point) => point[0] === label);
        const x = 32 + (originalIndex * 376) / Math.max(1, points.length - 1);
        return <text key={`${label}-${index}`} x={index === filtered.length - 1 ? x - 24 : x - 12} y="214" className="fill-slate-500 text-[11px] font-bold">{label}</text>;
      })}
      <defs>
        <linearGradient id="onboardingFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.03" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function RetentionChart({ data }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const activeDash = (data.retentionRate / 100) * circumference;
  return (
    <div className="flex h-full items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 xl:h-24 xl:w-24">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#dcfce7" strokeWidth="14" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#22c55e" strokeWidth="14" strokeDasharray={`${activeDash} ${circumference - activeDash}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-lg font-black text-slate-950 xl:text-xl">{data.retentionRate}%</p>
            <p className="text-[10px] font-bold text-slate-500">Retention Rate</p>
          </div>
        </div>
      </div>
      <div className="w-full space-y-2.5">
        {[
          ["Joined Placements", data.joinedPlacements, "#22c55e"],
          ["Still Active", data.stillActive, "#2563eb"],
          ["Dropped Off", data.droppedOff, "#f43f5e"]
        ].map(([label, value, color]) => (
          <div key={label} className="flex items-center justify-between gap-3 text-xs font-black">
            <span className="inline-flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</span>
            <span className="text-slate-950">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgrammePerformanceRow({ item }) {
  const config = analyticsTone[item.tone] || analyticsTone.blue;
  return (
    <div className="flex min-h-[46px] items-center justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${config.icon}`}>
          <GraduationCap className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-slate-950">{item.name}</p>
          <p className="text-[11px] font-semibold text-slate-500">{item.workers} workers trained</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[13px] font-black text-slate-950">{item.completion}%</p>
        <p className="text-[10px] font-semibold text-slate-500">Completion</p>
      </div>
    </div>
  );
}

function ReportsHeroImage() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute left-[42%] top-3 h-24 w-48 rounded-full bg-blue-100/45 blur-2xl" />
      <span className="absolute bottom-1 right-24 h-20 w-40 rounded-full bg-emerald-100/40 blur-2xl" />
      <img
        src={reportsHeroAsset}
        alt="NGO professionals reviewing social impact analytics"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
      />
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 8%, rgba(255,255,255,0.2) 14%, rgba(255,255,255,0) 20%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.2) 86%, rgba(255,255,255,0.7) 92%, rgba(255,255,255,1) 100%)"
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white via-white/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/90 to-transparent" />
    </div>
  );
}

function GeographicDistribution({ regions }) {
  return (
    <div className="grid h-full grid-cols-[minmax(0,45%)_minmax(152px,1fr)] items-center gap-5 overflow-hidden">
      <div className="grid h-full min-h-0 min-w-0 place-items-center rounded-2xl bg-slate-50/60 p-2">
        <img
          src={indiaDistributionMapAsset}
          alt="Worker distribution across India"
          className="h-auto max-h-[120px] w-full max-w-[190px] object-contain"
          loading="lazy"
        />
      </div>
      <div className="min-w-0 space-y-2">
        {regions.map((region) => (
          <div key={region.state} className="grid grid-cols-[minmax(0,1fr)_36px] items-start gap-3">
            <div className="flex min-w-0 gap-2">
              <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: region.color }} />
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-slate-950">{region.state}</p>
                <p className="text-[11px] font-semibold text-slate-500">{region.workers} workers</p>
              </div>
            </div>
            <p className="text-right text-xs font-black text-slate-950">{region.percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NgoAdvancedReports({ organization, membership, isDemoMode = false }) {
  const [data, setData] = useState({ orgStats: null, training: null, placement: null, workers: [], employers: [], loading: true });
  const [period, setPeriod] = useState("thisMonth");
  const canExport = isDemoMode || hasNgoPermission(membership, NGO_PERMISSIONS.exportData);

  useEffect(() => {
    async function load() {
      const [orgStats, training, placement, workers, employers] = await Promise.all([
        database.getOrganizationDashboardStats(organization.id),
        database.getTrainingDashboardStats(organization.id),
        database.getPlacementAnalytics(organization.id),
        database.getOrganizationWorkers(organization.id),
        database.getOrganizationEmployers(organization.id)
      ]);
      setData({ orgStats, training, placement, workers, employers, loading: false });
    }
    load();
  }, [organization?.id]);

  const hasData = isDemoMode || data.workers.length || data.training?.totalProgrammes || data.placement?.recommendationsSent;
  const averageCompletion = Math.round(data.workers.reduce((sum, worker) => sum + Number(worker.profileCompletion || 0), 0) / Math.max(1, data.workers.length));
  const activeCities = new Set(data.workers.map((worker) => worker.city).filter(Boolean)).size;
  const analytics = isDemoMode
    ? ngoDemoAnalytics
    : {
      summary: {
        workersOnboarded: data.orgStats?.totalWorkersLinked || 0,
        profileCompletion: averageCompletion,
        certificationsIssued: data.training?.certificatesIssued || 0,
        activePlacements: data.placement?.workersJoined || 0
      },
      comparison: {
        workersOnboardedChange: 0,
        profileCompletionChange: 0,
        certificationsIssuedChange: 0,
        activePlacementsChange: 0
      },
      impact: {
        workersTrained: data.training?.trainingCompleted || 0,
        workersTrainedTarget: Math.max(1, data.training?.workersTraining || 0),
        workersEmployed: data.placement?.workersJoined || 0,
        workersEmployedTarget: Math.max(1, data.placement?.recommendationsSent || 0),
        activeCities,
        activeStates: 0,
        incomeImprovement: 0,
        averageIncomeIncreasePerWorker: 0
      },
      retention: {
        joinedPlacements: data.placement?.workersJoined || 0,
        stillActive: data.placement?.workersJoined || 0,
        droppedOff: 0,
        retentionRate: data.placement?.workersJoined ? 100 : 0
      },
      programmePerformance: [],
      geographicDistribution: [],
      monthlyOnboardingTrend: {
        thisMonth: [["Now", data.orgStats?.totalWorkersLinked || 0]],
        last3: [["Now", data.orgStats?.totalWorkersLinked || 0]],
        last6: [["Now", data.orgStats?.totalWorkersLinked || 0]]
      }
    };
  const trendPoints = analytics.monthlyOnboardingTrend[period] || analytics.monthlyOnboardingTrend.thisMonth;
  const demoMetricTrends = {
    workersOnboarded: [5, 9, 18, 28, 19, 35, 41, 40, 52, 48, 66],
    profileCompletion: [38, 44, 58, 49, 42, 57, 58, 55, 59, 57, 72],
    certificationsIssued: [22, 32, 48, 38, 26, 55, 62, 50, 58, 66, 42],
    activePlacements: [10, 12, 31, 16, 20, 21, 22, 23, 18, 28, 44]
  };
  const liveMetricTrend = (value) => [0, Number(value || 0)];
  const summaryCards = [
    { icon: Users, label: "Workers Onboarded", value: analytics.summary.workersOnboarded, change: analytics.comparison.workersOnboardedChange, tone: "blue", values: isDemoMode ? demoMetricTrends.workersOnboarded : liveMetricTrend(analytics.summary.workersOnboarded) },
    { icon: CheckCircle2, label: "Profile Completion", value: `${analytics.summary.profileCompletion}%`, change: analytics.comparison.profileCompletionChange, tone: "green", values: isDemoMode ? demoMetricTrends.profileCompletion : liveMetricTrend(analytics.summary.profileCompletion) },
    { icon: ShieldCheck, label: "Certifications Issued", value: analytics.summary.certificationsIssued, change: analytics.comparison.certificationsIssuedChange, tone: "purple", values: isDemoMode ? demoMetricTrends.certificationsIssued : liveMetricTrend(analytics.summary.certificationsIssued) },
    { icon: Trophy, label: "Active Placements", value: analytics.summary.activePlacements, change: analytics.comparison.activePlacementsChange, tone: "orange", values: isDemoMode ? demoMetricTrends.activePlacements : liveMetricTrend(analytics.summary.activePlacements) }
  ];
  const exportRows = [
    { metric: "Workers Onboarded", value: analytics.summary.workersOnboarded },
    { metric: "Profile Completion", value: `${analytics.summary.profileCompletion}%` },
    { metric: "Certifications Issued", value: analytics.summary.certificationsIssued },
    { metric: "Active Placements", value: analytics.summary.activePlacements },
    { metric: "Workers Trained", value: analytics.impact.workersTrained },
    { metric: "Workers Employed", value: analytics.impact.workersEmployed },
    { metric: "Retention Rate", value: `${analytics.retention.retentionRate}%` }
  ];

  return (
    <div className="reports-page mx-auto grid h-full min-h-0 w-full max-w-none grid-rows-[auto_auto_minmax(0,1fr)_minmax(0,0.65fr)] gap-3 overflow-hidden bg-[#f8fbff] px-6 py-3.5 text-[#172033] max-[900px]:h-auto max-[900px]:overflow-y-auto max-[900px]:p-4">
      <section className="relative grid h-[146px] min-h-0 shrink-0 grid-cols-1 items-center gap-4 overflow-hidden rounded-2xl border border-[#e7ecf4] bg-white px-4 py-4 shadow-[0_14px_42px_rgba(15,23,42,0.04)] lg:grid-cols-[minmax(360px,1fr)_auto] max-[850px]:h-[128px]">
        <ReportsHeroImage />
        <div className="relative z-10 min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Production Workspace</p>
          <h2 className="mt-2 text-[28px] font-black leading-tight text-[#172033]">Reports & Analytics</h2>
          <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#667085]">Track your impact, evaluate programmes, and make data-driven decisions to empower more workers.</p>
        </div>
        {canExport && (
          <button type="button" onClick={() => exportCsv("rozgaarai-ngo-report.csv", exportRows)} className="relative z-10 inline-flex min-h-10 shrink-0 items-center justify-center gap-2 justify-self-start rounded-[14px] bg-blue-600 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 lg:justify-self-end">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        )}
      </section>
      {!hasData ? (
        <EmptyState title="Analytics will appear as real activity grows" description="Invite workers, run training programmes, issue certificates and record placements to unlock production analytics." />
      ) : (
      <>
        <div className="grid h-[132px] shrink-0 gap-3 md:grid-cols-2 xl:grid-cols-4 max-[850px]:h-[124px]">
          {summaryCards.map((card) => <AnalyticsMetricCard key={card.label} {...card} />)}
        </div>

        <div className="grid min-h-0 items-stretch gap-3 xl:grid-cols-[0.95fr_1.08fr_1.15fr]">
          <Card className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-3.5">
            <h3 className="text-[16px] font-black text-[#172033]">Impact Overview</h3>
            <p className="mt-1 text-xs font-semibold text-[#667085]">Key indicators of your organisation&apos;s impact</p>
            <div className="mt-3 flex min-h-0 flex-1 flex-col justify-evenly gap-2">
              <ProgressRow icon={GraduationCap} label="Workers Trained" value={analytics.impact.workersTrained} detail={`Monthly Target: ${analytics.impact.workersTrainedTarget}`} percent={Math.min(100, Math.round((analytics.impact.workersTrained / Math.max(1, analytics.impact.workersTrainedTarget)) * 100))} tone="blue" />
              <ProgressRow icon={UserCog} label="Workers Employed" value={analytics.impact.workersEmployed} detail={`Monthly Target: ${analytics.impact.workersEmployedTarget}`} percent={Math.min(100, Math.round((analytics.impact.workersEmployed / Math.max(1, analytics.impact.workersEmployedTarget)) * 100))} tone="green" />
              <ProgressRow icon={MapPin} label="Active Cities" value={analytics.impact.activeCities} detail={`Across ${analytics.impact.activeStates} States`} percent={80} tone="purple" />
              <ProgressRow icon={Activity} label="Income Improvement" value={analytics.impact.incomeImprovement ? formatInr(analytics.impact.incomeImprovement) : "Unavailable"} detail={analytics.impact.averageIncomeIncreasePerWorker ? `${formatInr(analytics.impact.averageIncomeIncreasePerWorker)} avg. increase` : "Joined wage history needed"} percent={analytics.impact.incomeImprovement ? 85 : 0} tone="orange" />
            </div>
            <button type="button" className="mt-5 shrink-0 border-t border-slate-100 pt-2.5 text-left text-xs font-black text-blue-700 transition hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100">View detailed impact report →</button>
          </Card>

          <Card className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-black text-[#172033]">Worker Onboarding Trend</h3>
                <p className="mt-2.5 text-[28px] font-black leading-none text-[#172033]">{analytics.summary.workersOnboarded}</p>
                <p className="text-xs font-black text-[#667085]">Total Onboarded</p>
                <p className="mt-2 text-[11px] font-black text-emerald-600">↑ {analytics.comparison.workersOnboardedChange}% from last month</p>
              </div>
              <select value={period} onChange={(event) => setPeriod(event.target.value)} className="min-h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-100">
                <option value="thisMonth">This Month</option>
                <option value="last3">Last 3 Months</option>
                <option value="last6">Last 6 Months</option>
              </select>
            </div>
            <div className="mt-1 min-h-0 flex-1 overflow-hidden">
              <OnboardingTrendChart points={trendPoints} />
            </div>
          </Card>

          <Card className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-3.5">
            <h3 className="text-[16px] font-black text-[#172033]">Programme Performance</h3>
            <p className="mt-1 text-xs font-semibold text-[#667085]">Performance by training programmes</p>
            <div className="mt-3 flex min-h-0 flex-1 flex-col justify-evenly">
              {analytics.programmePerformance.length ? analytics.programmePerformance.map((item) => <ProgrammePerformanceRow key={item.name} item={item} />) : <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-500">Programme performance appears after training data is available.</p>}
            </div>
            <button type="button" onClick={() => { window.history.pushState({}, "", "/ngo/training"); window.dispatchEvent(new window.Event("popstate")); }} className="mt-5 shrink-0 border-t border-slate-100 pt-2.5 text-left text-xs font-black text-blue-700 transition hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100">View all programmes →</button>
          </Card>
        </div>

        <div className="grid min-h-0 items-stretch gap-3 xl:grid-cols-[0.95fr_1.2fr_0.85fr]">
          <Card className="h-full min-h-0 min-w-0 overflow-hidden p-3.5">
            <h3 className="text-[16px] font-black text-[#172033]">Retention Rate</h3>
            <p className="mt-0.5 text-xs font-semibold text-[#667085]">Worker retention after placement</p>
            <div className="mt-2 h-[calc(100%-2.4rem)] min-h-0"><RetentionChart data={analytics.retention} /></div>
          </Card>

          <Card className="h-full min-h-0 min-w-0 overflow-hidden p-3.5">
            <h3 className="text-[16px] font-black text-[#172033]">Geographic Distribution</h3>
            <p className="mt-0.5 text-xs font-semibold text-[#667085]">Workers across regions</p>
            <div className="mt-2 h-[calc(100%-2.4rem)] min-h-0 overflow-hidden">{analytics.geographicDistribution.length ? <GeographicDistribution regions={analytics.geographicDistribution} /> : <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-500">Regional distribution appears after linked worker locations are available.</p>}</div>
          </Card>

          <Card className="relative h-full min-h-0 min-w-0 overflow-hidden border-green-100 bg-gradient-to-br from-green-50 via-white to-blue-50 p-3.5">
            <h3 className="text-[16px] font-black text-green-800">Real People. Real Impact.</h3>
            <p className="mt-1.5 text-xs font-semibold leading-5 text-[#667085]">Every number represents a life we&apos;re helping transform.</p>
            <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-green-100 bg-white/85 p-2 shadow-sm">
              <div className="flex -space-x-3">
                {reportsImpactPhotos.map((photo) => <img key={photo} src={photo} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" loading="lazy" />)}
              </div>
              <div>
                <p className="text-base font-black text-teal-700">{analytics.summary.workersOnboarded}+</p>
                <p className="text-[10px] font-bold text-slate-500">Workers impacted</p>
              </div>
            </div>
            <div className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)]">
              <Activity className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-black text-white">1</span>
            </div>
          </Card>
        </div>
      </>
      )}
    </div>
  );
}

const teamStorageKey = "rozgaarai.ngo.team.workspace.v1";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const roleOptions = ["All Roles", "Programme Manager", "Trainer", "Coordinator", "Data Analyst", "HR Manager"];
const inviteRoles = ["Programme Manager", "Trainer", "Coordinator", "Data Analyst", "HR Manager"];
const departments = ["Training & Development", "Skill Development", "Community Outreach", "Reports & Analytics", "Human Resources"];
const accessOptions = ["Never", "7 days", "30 days", "90 days"];

const roleBadgeClass = {
  "Programme Manager": "bg-emerald-50 text-emerald-700 border-emerald-100",
  Trainer: "bg-blue-50 text-blue-700 border-blue-100",
  Coordinator: "bg-violet-50 text-violet-700 border-violet-100",
  "Data Analyst": "bg-orange-50 text-orange-700 border-orange-100",
  "HR Manager": "bg-pink-50 text-pink-700 border-pink-100"
};

const activityToneClass = {
  green: "bg-emerald-500 text-white",
  emerald: "bg-green-500 text-white",
  blue: "bg-blue-600 text-white",
  purple: "bg-violet-600 text-white",
  orange: "bg-orange-500 text-white"
};

function TeamHeroPhoto() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-[49%] hidden w-[41rem] -translate-x-1/2 overflow-hidden xl:block" aria-hidden="true">
      <img
        src={ngoTeamHeroAsset}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover object-center opacity-95"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f5fbff] via-[#f5fbff]/16 to-[#e9f3ff]/72" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f5fbff]/72 via-transparent to-[#eef6ff]/78" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#e9f3ff]/62 via-transparent to-transparent" />
    </div>
  );
}

function readTeamState() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(teamStorageKey) || "null");
  } catch {
    return null;
  }
}

function writeTeamState(state) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(teamStorageKey, JSON.stringify(state));
}

function TeamHero({ onInviteClick }) {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-blue-100 bg-gradient-to-r from-[#f5fbff] via-white to-[#edf7ff] shadow-[0_16px_42px_rgba(47,101,245,0.08)]">
      <TeamHeroPhoto />
      <div className="pointer-events-none absolute inset-y-0 right-0 block w-[58%] md:hidden" aria-hidden="true">
        <img src={ngoTeamHeroAsset} alt="" className="h-full w-full object-contain object-right opacity-95" />
        <div className="absolute inset-y-0 left-0 w-[56%] bg-gradient-to-r from-[#f5fbff] via-[#f5fbff]/88 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[24%] bg-gradient-to-l from-[#edf7ff] via-[#edf7ff]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#eef6ff]/75 to-transparent" />
      </div>
      <BotanicalMark className="left-[30%] top-9 rotate-[-18deg] text-emerald-400/35" />
      <BotanicalMark className="right-4 bottom-0 rotate-[18deg] text-emerald-400/35" />
      <div className="relative z-10 grid min-h-[176px] items-center gap-5 px-5 py-5 md:grid-cols-[minmax(290px,0.72fr)_minmax(260px,0.76fr)] md:pr-[285px] lg:px-6 lg:pr-[315px] xl:pr-[300px]">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </span>
            <h2 className="text-[26px] font-black leading-tight text-[#172033] xl:text-[30px]">Team Workspace</h2>
          </div>
          <p className="mt-3 max-w-[390px] text-sm font-semibold leading-6 text-[#52627a]">
            Manage your NGO staff, trainers, volunteers and coordinators.
          </p>
        </div>
        <div className="relative hidden min-h-[130px] overflow-hidden md:block xl:hidden" aria-hidden="true">
          <img src={ngoTeamHeroAsset} alt="" className="h-[130px] w-full object-contain object-center opacity-95" />
          <div className="absolute inset-y-0 left-0 w-[30%] bg-gradient-to-r from-[#eef6ff] via-[#eef6ff]/78 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-[#edf7ff] via-[#edf7ff]/78 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#f5fbff]/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#eef6ff]/85 to-transparent" />
        </div>
        <div className="ml-auto flex flex-col items-end gap-3 text-right md:absolute md:right-32 md:top-1/2 md:-translate-y-1/2 lg:right-40">
          <button type="button" onClick={onInviteClick} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[12px] bg-[#2f65f5] px-5 text-sm font-black text-white shadow-[0_16px_28px_rgba(47,101,245,0.24)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
            <Plus className="h-4 w-4" />
            Invite Member
          </button>
          <p className="max-w-[165px] text-sm font-semibold leading-6 text-[#52627a]">Add new team members to your organization</p>
        </div>
      </div>
    </section>
  );
}

function BotanicalMark({ className }) {
  return (
    <div className={`pointer-events-none absolute hidden h-24 w-24 md:block ${className}`} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((item) => (
        <span key={item} className="absolute left-10 top-11 h-8 w-3 rounded-[999px_999px_999px_2px] bg-current opacity-70" style={{ transform: `rotate(${item * 32 - 62}deg) translateY(-22px)` }} />
      ))}
    </div>
  );
}

function TeamStats() {
  const stats = [
    { icon: Users, label: "Total Members", value: "42", helper: "Across all departments", trend: "12%", tone: "bg-blue-50 text-blue-600" },
    { icon: UserCog, label: "Active Members", value: "37", helper: "Currently active", trend: "8%", tone: "bg-emerald-50 text-emerald-600" },
    { icon: Clock3, label: "Pending Invites", value: "3", helper: "Awaiting response", trend: "", tone: "bg-orange-50 text-orange-500" },
    { icon: Building2, label: "Departments", value: "7", helper: "Active departments", trend: "", tone: "bg-violet-50 text-violet-600" }
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ icon: Icon, label, value, helper, trend, tone }) => (
        <Card key={label} className="flex min-h-[96px] items-center gap-4 p-4">
          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${tone}`}>
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-[#172033]">{label}</p>
            <p className="mt-1 text-2xl font-black leading-none text-[#172033]">{value}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="truncate text-[11px] font-semibold text-[#667085]">{helper}</p>
              {trend && <p className="text-[11px] font-black text-emerald-600">↑ {trend}</p>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function InviteMemberCard({ formRef, inviteForm, setInviteForm, onSubmit }) {
  const isValid = emailPattern.test(inviteForm.email.trim());
  return (
    <Card className="flex min-h-0 flex-col bg-gradient-to-br from-[#f1f7ff] to-[#eef5ff] p-4">
      <h3 className="text-lg font-black text-[#172033]">Invite New Member</h3>
      <form ref={formRef} onSubmit={onSubmit} className="mt-5 grid gap-4">
        <TeamField label="Email Address">
          <input value={inviteForm.email} onChange={(event) => setInviteForm({ ...inviteForm, email: event.target.value })} className="h-11 w-full rounded-[10px] border border-blue-100 bg-white px-3 text-sm font-bold text-[#172033] outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder="name@rozgaarngo.org" type="email" />
        </TeamField>
        <TeamField label="Role">
          <select value={inviteForm.role} onChange={(event) => setInviteForm({ ...inviteForm, role: event.target.value })} className="h-11 w-full rounded-[10px] border border-blue-100 bg-white px-3 text-sm font-black text-[#172033] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
            {inviteRoles.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </TeamField>
        <TeamField label="Department">
          <select value={inviteForm.department} onChange={(event) => setInviteForm({ ...inviteForm, department: event.target.value })} className="h-11 w-full rounded-[10px] border border-blue-100 bg-white px-3 text-sm font-black text-[#172033] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
            {departments.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </TeamField>
        <TeamField label="Access Expires">
          <select value={inviteForm.accessExpires} onChange={(event) => setInviteForm({ ...inviteForm, accessExpires: event.target.value })} className="h-11 w-full rounded-[10px] border border-blue-100 bg-white px-3 text-sm font-black text-[#172033] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
            {accessOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </TeamField>
        <button type="submit" disabled={!isValid} className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#2f65f5] to-[#2356ea] text-sm font-black text-white shadow-[0_16px_28px_rgba(47,101,245,0.2)] transition hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none">
          <UserPlus className="h-4 w-4" />
          Send Invite
        </button>
      </form>
      <div className="mt-auto flex flex-col items-center pt-6 text-center">
        <div className="relative grid h-[94px] w-[94px] place-items-center rounded-full border border-white bg-white/65 shadow-inner">
          <Users className="h-12 w-12 text-slate-400" />
          <span className="absolute bottom-2 right-1 grid h-7 w-7 place-items-center rounded-full bg-[#2f65f5] text-white ring-4 ring-[#eef5ff]">
            <Plus className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-3 max-w-[130px] text-xs font-semibold leading-5 text-[#667085]">Add member to your team</p>
      </div>
    </Card>
  );
}

function TeamField({ label, children }) {
  return (
    <label className="grid gap-2 text-[12px] font-black text-[#172033]">
      {label}
      {children}
    </label>
  );
}

function TeamDirectory({ members, search, setSearch, roleFilter, setRoleFilter, onView, onEdit, onMore, openMenuId, onAction }) {
  return (
    <Card className="flex min-h-0 min-w-0 flex-col overflow-hidden p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-lg font-black text-[#172033]">Team Directory</h3>
        <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_130px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members..." className="h-10 w-full rounded-[10px] border border-slate-200 bg-white pl-10 pr-3 text-xs font-bold text-[#172033] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
          </label>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-10 rounded-[10px] border border-slate-200 bg-white px-3 text-xs font-black text-[#172033] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
            {roleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 grid min-h-0 gap-2.5 overflow-visible">
        {members.map((member) => (
          <TeamMemberRow key={member.id} member={member} onView={onView} onEdit={onEdit} onMore={onMore} menuOpen={openMenuId === member.id} onAction={onAction} />
        ))}
        {!members.length && <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-500">No team members match these filters.</p>}
      </div>
      <button type="button" onClick={() => onAction("all-members")} className="mx-auto mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-blue-100 bg-white px-5 text-xs font-black text-blue-700 shadow-sm hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100">
        <Users className="h-3.5 w-3.5" />
        View All Members
      </button>
    </Card>
  );
}

function TeamMemberRow({ member, onView, onEdit, onMore, menuOpen, onAction }) {
  return (
    <article className="relative grid min-h-[76px] min-w-0 items-center gap-2.5 rounded-2xl border border-slate-100 bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.025)] md:grid-cols-[minmax(176px,1fr)_76px_112px]">
      <div className="flex min-w-0 items-center gap-3">
        <img src={member.avatar} alt={`${member.name} profile`} className="h-[48px] w-[48px] shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-sm font-black text-[#172033]">{member.name}</h4>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${roleBadgeClass[member.role] || "border-slate-100 bg-slate-50 text-slate-600"}`}>{member.role}</span>
          </div>
          <p className="mt-1 truncate text-xs font-bold text-[#667085]">{member.department}</p>
          <p className="truncate text-xs font-semibold text-[#52627a]">{member.email}</p>
        </div>
      </div>
      <div className="grid gap-1 text-xs font-black">
        <span className={`inline-flex items-center gap-2 ${member.status === "Active" ? "text-emerald-700" : "text-orange-600"}`}>
          <span className={`h-2 w-2 rounded-full ${member.status === "Active" ? "bg-emerald-500" : "bg-orange-400"}`} />
          {member.status}
        </span>
        <span className="font-semibold text-[#52627a]">{member.lastActive}</span>
      </div>
      <div className="flex items-center justify-start gap-2 md:justify-end">
        <IconButton label={`View ${member.name}`} icon={Eye} onClick={() => onView(member)} />
        <IconButton label={`Edit ${member.name}`} icon={Edit3} onClick={() => onEdit(member)} />
        <div className="relative">
          <IconButton label={`More actions for ${member.name}`} icon={MoreVertical} onClick={() => onMore(member.id)} />
          {menuOpen && (
            <div className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_18px_42px_rgba(15,23,42,0.15)]">
              <button type="button" onClick={() => onAction("disable", member)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-black text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100">Disable Access</button>
              <button type="button" onClick={() => onAction("remove", member)} className="w-full rounded-lg px-3 py-2 text-left text-xs font-black text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100">Remove Member</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function IconButton({ label, icon: Icon, onClick }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="grid h-8 w-8 place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
      <Icon className="h-4 w-4" />
    </button>
  );
}

function RoleDistributionCard() {
  return (
    <Card className="p-3.5">
      <h3 className="text-sm font-black text-[#172033]">Role Distribution</h3>
      <div className="mt-2 grid min-h-[150px] grid-cols-[115px_minmax(0,1fr)] items-center gap-2">
        <ResponsiveContainer width="100%" height={132}>
          <PieChart>
            <Pie data={ngoRoleDistribution} dataKey="count" nameKey="name" innerRadius={36} outerRadius={58} paddingAngle={1} stroke="#ffffff" strokeWidth={2}>
              {ngoRoleDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1.5">
          {ngoRoleDistribution.map((item) => (
            <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_28px] items-center gap-1.5 text-[10px] font-black">
              <span className="flex min-w-0 items-center gap-1.5 text-[#52627a]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} /> <span className="truncate">{item.name} ({item.count})</span></span>
              <span className="text-right text-[#172033]">{item.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function RecentActivityCard({ onViewAll }) {
  return (
    <Card className="p-3.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-[#172033]">Recent Activity</h3>
        <button type="button" onClick={onViewAll} className="text-xs font-black text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100">View All</button>
      </div>
      <div className="mt-3 space-y-2.5">
        {ngoRecentActivity.map((item) => (
          <div key={item.id} className="flex gap-3 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${activityToneClass[item.tone] || activityToneClass.blue}`}>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-black leading-4 text-[#172033]"><span>{item.actor}</span> <span className="font-semibold text-[#52627a]">{item.action}</span></p>
              <p className="text-[10px] font-semibold text-[#667085]">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PendingInvitationsCard({ invitations, onResend, onViewAll }) {
  return (
    <Card className="p-3.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-[#172033]">Pending Invitations</h3>
        <button type="button" onClick={onViewAll} className="text-xs font-black text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100">View All</button>
      </div>
      <div className="mt-3 space-y-3">
        {invitations.slice(0, 3).map((invite) => (
          <div key={invite.id} className="grid grid-cols-[32px_minmax(0,1fr)_68px] items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500">
              <UserCog className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black text-[#172033]">{invite.email}</p>
              <p className="text-[10px] font-semibold text-[#52627a]">{invite.role}</p>
              <p className="text-[10px] font-semibold text-[#667085]">{invite.resentAt || invite.invitedAt}</p>
            </div>
            <button type="button" onClick={() => onResend(invite.id)} className="h-8 rounded-[8px] border border-blue-100 bg-white text-[10px] font-black text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100">Resend</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={onViewAll} className="mt-3 w-full border-t border-slate-100 pt-3 text-xs font-black text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100">View All Invitations</button>
    </Card>
  );
}

function PermissionSummaryCard({ permissions, onManage }) {
  return (
    <Card className="p-3.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-[#172033]">Permission Summary</h3>
        <button type="button" onClick={onManage} className="text-xs font-black text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-100">Manage</button>
      </div>
      <div className="mt-3 space-y-3">
        {permissions.map((group) => (
          <div key={group.title}>
            <p className="rounded-[8px] bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-800">{group.title}</p>
            <div className="divide-y divide-slate-100">
              {group.permissions.map((permission) => (
                <div key={permission.name} className="flex items-center justify-between gap-3 px-2 py-2 text-[11px] font-semibold text-[#52627a]">
                  <span>{permission.name}</span>
                  {permission.enabled ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> : <LockKeyhole className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TeamPerformanceCard({ period, setPeriod }) {
  return (
    <Card className="p-3.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-[#172033]">Team Performance</h3>
        <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-8 rounded-[9px] border border-slate-200 bg-white px-2 text-[10px] font-black text-[#172033] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
        </select>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {ngoPerformanceMetrics.map((metric) => <ProgressRing key={metric.label} {...metric} />)}
      </div>
    </Card>
  );
}

function ProgressRing({ value, label, color }) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="grid place-items-center text-center">
      <div className="relative h-[86px] w-[86px]">
        <svg viewBox="0 0 86 86" className="h-full w-full -rotate-90">
          <circle cx="43" cy="43" r={radius} fill="none" stroke="#e9eef5" strokeWidth="8" />
          <circle cx="43" cy="43" r={radius} fill="none" stroke={color} strokeLinecap="round" strokeWidth="8" strokeDasharray={`${(value / 100) * circumference} ${circumference}`} />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <p className="text-lg font-black text-blue-700">{value}%</p>
        </div>
      </div>
      <p className="mt-1 max-w-[94px] text-[10px] font-black leading-3 text-[#52627a]">{label}</p>
    </div>
  );
}

function MemberModal({ mode, member, onClose, onSave }) {
  const [form, setForm] = useState(member || {});
  useEffect(() => setForm(member || {}), [member]);
  if (!member) return null;
  const isEditing = mode === "edit";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4" role="dialog" aria-modal="true" aria-label={isEditing ? "Edit team member" : "Team member details"}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img src={member.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
            <div>
              <h3 className="text-xl font-black text-[#172033]">{isEditing ? "Edit Member" : member.name}</h3>
              <p className="text-sm font-semibold text-[#667085]">{member.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-black text-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100">Close</button>
        </div>
        <div className="mt-5 grid gap-3">
          {isEditing ? (
            <>
              <TeamField label="Name"><input value={form.name || ""} onChange={(event) => setForm({ ...form, name: event.target.value })} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100" /></TeamField>
              <TeamField label="Role"><select value={form.role || ""} onChange={(event) => setForm({ ...form, role: event.target.value })} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-black outline-none focus:ring-4 focus:ring-blue-100">{inviteRoles.map((item) => <option key={item}>{item}</option>)}</select></TeamField>
              <TeamField label="Department"><select value={form.department || ""} onChange={(event) => setForm({ ...form, department: event.target.value })} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-black outline-none focus:ring-4 focus:ring-blue-100">{departments.map((item) => <option key={item}>{item}</option>)}</select></TeamField>
              <TeamField label="Status"><select value={form.status || ""} onChange={(event) => setForm({ ...form, status: event.target.value })} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-black outline-none focus:ring-4 focus:ring-blue-100"><option>Active</option><option>Away</option><option>Disabled</option></select></TeamField>
              <button type="button" onClick={() => onSave(form)} className="mt-2 h-11 rounded-xl bg-[#2f65f5] text-sm font-black text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">Save Changes</button>
            </>
          ) : (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-[#52627a]">
              <p><span className="font-black text-[#172033]">Role:</span> {member.role}</p>
              <p><span className="font-black text-[#172033]">Department:</span> {member.department}</p>
              <p><span className="font-black text-[#172033]">Status:</span> {member.status}</p>
              <p><span className="font-black text-[#172033]">Last active:</span> {member.lastActive}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PermissionModal({ permissions, onClose, onSave }) {
  const [draft, setDraft] = useState(permissions);
  useEffect(() => setDraft(permissions), [permissions]);
  function toggle(groupTitle, permissionName) {
    setDraft((groups) => groups.map((group) => group.title === groupTitle ? { ...group, permissions: group.permissions.map((permission) => permission.name === permissionName ? { ...permission, enabled: !permission.enabled } : permission) } : group));
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-4" role="dialog" aria-modal="true" aria-label="Manage permissions">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-[#172033]">Manage Permissions</h3>
            <p className="mt-1 text-sm font-semibold text-[#667085]">Toggle visible permissions for this demo workspace.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-black text-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100">Close</button>
        </div>
        <div className="mt-5 max-h-[380px] space-y-4 overflow-y-auto pr-1">
          {draft.map((group) => (
            <fieldset key={group.title} className="rounded-2xl border border-slate-100 p-3">
              <legend className="px-1 text-sm font-black text-[#172033]">{group.title}</legend>
              <div className="mt-2 grid gap-2">
                {group.permissions.map((permission) => (
                  <label key={permission.name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-[#52627a]">
                    {permission.name}
                    <input type="checkbox" checked={permission.enabled} onChange={() => toggle(group.title, permission.name)} className="h-4 w-4 accent-blue-600" />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <button type="button" onClick={() => onSave(draft)} className="mt-5 h-11 w-full rounded-xl bg-[#2f65f5] text-sm font-black text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">Save Permissions</button>
      </div>
    </div>
  );
}

export function NgoTeamManagement({ organization, account, membership, setStatusMessage, isDemoMode = false }) {
  const [members, setMembers] = useState(ngoTeamMembers);
  const [invitations, setInvitations] = useState(ngoPendingInvitations);
  const [inviteForm, setInviteForm] = useState({ email: "", role: "Programme Manager", department: "Training & Development", accessExpires: "Never" });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [openMenuId, setOpenMenuId] = useState("");
  const [modal, setModal] = useState({ type: "", member: null });
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [performancePeriod, setPerformancePeriod] = useState("This Month");
  const [permissions, setPermissions] = useState(() => ngoPermissionGroups.map((group) => ({ ...group, permissions: group.permissions.map((name) => ({ name, enabled: true })) })));
  const canManageTeam = isDemoMode || hasNgoPermission(membership, NGO_PERMISSIONS.manageTeam);
  const inviteFormRef = useRef(null);

  useEffect(() => {
    const saved = readTeamState();
    if (saved) {
      if (saved.members) setMembers(saved.members);
      if (saved.invitations) setInvitations(saved.invitations);
      if (saved.permissions) setPermissions(saved.permissions);
    }
  }, []);

  useEffect(() => {
    writeTeamState({ members, invitations, permissions });
  }, [members, invitations, permissions]);

  useEffect(() => {
    async function refreshProductionMembers() {
      if (isDemoMode || !organization?.id) return;
      try {
        const productionMembers = await database.getOrganizationMembers(organization.id);
        if (productionMembers?.length) {
          setMembers(productionMembers.map((member, index) => ({
            id: member.id,
            name: member.accountId || `Team Member ${index + 1}`,
            role: NGO_ROLE_LABELS[member.role] || "Programme Manager",
            department: departments[index % departments.length],
            email: member.accountId || "member@rozgaarngo.org",
            status: member.status === "active" ? "Active" : "Disabled",
            lastActive: "Recently",
            avatar: ngoTeamMembers[index % ngoTeamMembers.length].avatar
          })));
        }
      } catch {
        setMembers(ngoTeamMembers);
      }
    }
    refreshProductionMembers();
  }, [isDemoMode, organization?.id]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((member) => {
      const matchesQuery = !query || [member.name, member.email, member.department, member.role].join(" ").toLowerCase().includes(query);
      const matchesRole = roleFilter === "All Roles" || member.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [members, roleFilter, search]);

  function scrollToInvite() {
    inviteFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => inviteFormRef.current?.querySelector("input")?.focus(), 250);
  }

  async function submitInvite(event) {
    event.preventDefault();
    const email = inviteForm.email.trim();
    if (!emailPattern.test(email)) {
      setStatusMessage?.("Enter a valid email address.");
      return;
    }
    const newInvite = { id: `invite-${Date.now()}`, email, role: inviteForm.role, invitedAt: "Invited just now", resentAt: "" };
    setInvitations((items) => [newInvite, ...items]);
    setInviteForm({ email: "", role: "Programme Manager", department: "Training & Development", accessExpires: "Never" });
    if (!isDemoMode && organization?.id && canManageTeam) {
      try {
        await database.inviteOrganizationTeamMember({ organizationId: organization.id, email, role: "programme_manager", invitedByAccountId: account?.id || account?.uid });
      } catch {
        // The local state above keeps the demo flow responsive when the backend is unavailable.
      }
    }
    setStatusMessage?.("Invitation sent successfully.");
  }

  function resendInvitation(inviteId) {
    setInvitations((items) => items.map((item) => item.id === inviteId ? { ...item, resentAt: "Resent just now" } : item));
    setStatusMessage?.("Invitation resent successfully.");
  }

  function saveMember(nextMember) {
    setMembers((items) => items.map((item) => item.id === nextMember.id ? nextMember : item));
    setModal({ type: "", member: null });
    setStatusMessage?.("Team member updated.");
  }

  function runMemberAction(action, member) {
    setOpenMenuId("");
    if (action === "all-members") {
      setSearch("");
      setRoleFilter("All Roles");
      setStatusMessage?.("Showing all team members.");
      return;
    }
    if (action === "disable" && window.confirm(`Disable access for ${member.name}?`)) {
      setMembers((items) => items.map((item) => item.id === member.id ? { ...item, status: "Disabled" } : item));
      setStatusMessage?.("Member access disabled.");
    }
    if (action === "remove" && window.confirm(`Remove ${member.name} from the team?`)) {
      setMembers((items) => items.filter((item) => item.id !== member.id));
      setStatusMessage?.("Team member removed.");
    }
  }

  function savePermissions(nextPermissions) {
    setPermissions(nextPermissions);
    setPermissionModalOpen(false);
    setStatusMessage?.("Permission summary updated.");
  }

  function viewAll(label) {
    setStatusMessage?.(`${label} list opened in demo mode.`);
  }

  return (
    <div className="ngo-team-page mx-auto min-h-full w-full max-w-[1540px] space-y-4 overflow-visible bg-[#f8fbff] pb-4 text-[#172033]">
      <TeamHero onInviteClick={scrollToInvite} />
      <TeamStats />
      <div className="grid gap-3 xl:grid-cols-[minmax(0,22%)_minmax(0,42%)_minmax(0,36%)]">
        <InviteMemberCard formRef={inviteFormRef} inviteForm={inviteForm} setInviteForm={setInviteForm} onSubmit={submitInvite} />
        <TeamDirectory members={filteredMembers} search={search} setSearch={setSearch} roleFilter={roleFilter} setRoleFilter={setRoleFilter} onView={(member) => setModal({ type: "view", member })} onEdit={(member) => setModal({ type: "edit", member })} onMore={(id) => setOpenMenuId((value) => value === id ? "" : id)} openMenuId={openMenuId} onAction={runMemberAction} />
        <div className="grid min-h-0 min-w-0 gap-3 min-[1500px]:grid-cols-2">
          <div className="grid min-h-0 gap-3">
            <RoleDistributionCard />
            <RecentActivityCard onViewAll={() => viewAll("Recent activity")} />
            <PendingInvitationsCard invitations={invitations} onResend={resendInvitation} onViewAll={() => viewAll("Pending invitations")} />
          </div>
          <div className="grid min-h-0 gap-3">
            <PermissionSummaryCard permissions={permissions} onManage={() => setPermissionModalOpen(true)} />
            <TeamPerformanceCard period={performancePeriod} setPeriod={setPerformancePeriod} />
          </div>
        </div>
      </div>
      {modal.type && <MemberModal mode={modal.type} member={modal.member} onClose={() => setModal({ type: "", member: null })} onSave={saveMember} />}
      {permissionModalOpen && <PermissionModal permissions={permissions} onClose={() => setPermissionModalOpen(false)} onSave={savePermissions} />}
    </div>
  );
}

const auditCategoryConfig = {
  Worker: { icon: UserPlus, badge: "bg-blue-50 text-blue-700", iconWrap: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
  Training: { icon: GraduationCap, badge: "bg-orange-50 text-orange-700", iconWrap: "bg-orange-50 text-orange-500", ring: "ring-orange-100" },
  Placement: { icon: ShieldCheck, badge: "bg-emerald-50 text-emerald-700", iconWrap: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
  Certificate: { icon: IdCard, badge: "bg-violet-50 text-violet-700", iconWrap: "bg-violet-50 text-violet-600", ring: "ring-violet-100" },
  AI: { icon: SparklesIcon, badge: "bg-sky-50 text-sky-700", iconWrap: "bg-sky-50 text-sky-600", ring: "ring-sky-100" },
  "Follow-up": { icon: Clock3, badge: "bg-amber-50 text-amber-700", iconWrap: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
  System: { icon: FileText, badge: "bg-cyan-50 text-cyan-700", iconWrap: "bg-cyan-50 text-cyan-700", ring: "ring-cyan-100" },
  Employer: { icon: BriefcaseBusiness, badge: "bg-indigo-50 text-indigo-700", iconWrap: "bg-indigo-50 text-indigo-600", ring: "ring-indigo-100" },
  Security: { icon: ShieldCheck, badge: "bg-red-50 text-red-700", iconWrap: "bg-red-50 text-red-600", ring: "ring-red-100" }
};

function SparklesIcon(props) {
  return <Activity {...props} />;
}

const auditStatusClass = {
  Success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Pending: "bg-yellow-50 text-yellow-700 ring-yellow-100",
  Warning: "bg-orange-50 text-orange-700 ring-orange-100",
  Failed: "bg-red-50 text-red-700 ring-red-100"
};

const auditFilterDefaults = {
  source: "",
  eventType: "",
  worker: "",
  program: "",
  status: "",
  dateRange: ""
};

function auditDateParts(timestamp) {
  const date = new Date(timestamp);
  return {
    date: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(date),
    time: new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(date)
  };
}

function normalizeAuditLog(log, index) {
  const title = String(log.activityType || log.title || "Audit Event").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  return {
    id: log.id || `live-audit-${index}`,
    title,
    description: log.description || "Workspace activity was recorded.",
    category: log.category || log.source || "System",
    actor: log.actor || { name: log.actorAccountId || "System", role: log.source || "Workspace" },
    worker: log.worker || { name: "Unassigned", occupation: log.entity || "Workspace Record", avatar: "" },
    program: log.program || log.programmeName || "Workspace Activity",
    timestamp: log.timestamp || log.createdAt || new Date().toISOString(),
    status: log.status || "Success",
    source: log.source || "System",
    ipAddress: log.ipAddress || "Internal",
    device: log.device || "Workspace",
    location: log.location || "Not recorded",
    referenceId: log.referenceId || `${log.source || "AUD"}-${log.id || index}`,
    additional: log.additional || { Method: "Workspace Record" },
    timeline: log.timeline || [["Audit Record Created", log.createdAt || new Date().toISOString()]]
  };
}

function AuditStatusBadge({ status }) {
  return <span className={`inline-flex min-h-6 items-center rounded-full px-3 text-[11px] font-black ring-1 ${auditStatusClass[status] || auditStatusClass.Success}`}>{status}</span>;
}

function AuditCategoryBadge({ category }) {
  const config = auditCategoryConfig[category] || auditCategoryConfig.System;
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-black ${config.badge}`}>{category}</span>;
}

function AuditKpiCard({ icon: Icon, value, label, helper, tone }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-500"
  }[tone] || "bg-blue-50 text-blue-600";
  return (
    <Card className="flex h-[98px] min-w-[150px] items-center gap-3 rounded-2xl p-4 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${toneClass}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="truncate text-2xl font-black leading-7 text-[#111a3b]">{value}</p>
        <p className="truncate text-[11px] font-black text-[#506079]">{label}</p>
        <p className={`mt-2 truncate text-[10px] font-black ${helper?.startsWith("↑") ? "text-emerald-600" : "text-[#506079]"}`}>{helper}</p>
      </div>
    </Card>
  );
}

function AuditSelect({ label, value, onChange, options, placeholder }) {
  return (
    <label className="min-w-[140px] flex-1">
      <span className="mb-1.5 block text-[11px] font-black text-[#62708a]">{label}</span>
      <span className="relative block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-[#dbe5f2] bg-white px-3 pr-8 text-xs font-black text-[#172033] outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
          <option value="">{placeholder}</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#587091]" />
      </span>
    </label>
  );
}

function AuditFilterBar({ filters, setFilters, options, onClear }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  return (
    <Card className="rounded-2xl p-3 shadow-[0_10px_30px_rgba(15,23,42,0.035)]">
      <div className="grid gap-3 md:grid-cols-2 xl:flex xl:items-end">
        <AuditSelect label="Source" value={filters.source} onChange={(value) => update("source", value)} options={options.sources} placeholder="All Sources" />
        <AuditSelect label="Event Type" value={filters.eventType} onChange={(value) => update("eventType", value)} options={options.eventTypes} placeholder="All Types" />
        <AuditSelect label="Worker" value={filters.worker} onChange={(value) => update("worker", value)} options={options.workers} placeholder="All Workers" />
        <AuditSelect label="Program" value={filters.program} onChange={(value) => update("program", value)} options={options.programs} placeholder="All Programs" />
        <AuditSelect label="Status" value={filters.status} onChange={(value) => update("status", value)} options={options.statuses} placeholder="All Status" />
        <label className="min-w-[180px] flex-[1.2]">
          <span className="mb-1.5 block text-[11px] font-black text-[#62708a]">Date range</span>
          <span className="relative block">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
            <input type="date" value={filters.dateRange} onChange={(event) => update("dateRange", event.target.value)} className="h-10 w-full rounded-xl border border-[#dbe5f2] bg-white pl-9 pr-3 text-xs font-black text-[#172033] outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
          </span>
        </label>
        <button type="button" onClick={onClear} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 text-xs font-black text-blue-700 transition hover:bg-blue-50">
          <FilterX className="h-4 w-4" />
          Clear Filters
        </button>
      </div>
    </Card>
  );
}

function AuditEventRow({ event, selected, onClick }) {
  const config = auditCategoryConfig[event.category] || auditCategoryConfig.System;
  const Icon = config.icon;
  const { date, time } = auditDateParts(event.timestamp);
  return (
    <button type="button" onClick={onClick} className={`grid w-full grid-cols-1 gap-3 border-b border-[#edf2f8] px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50/35 lg:grid-cols-[minmax(250px,1.25fr)_minmax(120px,0.55fr)_minmax(220px,0.95fr)_minmax(100px,0.48fr)_minmax(96px,0.42fr)_28px] lg:items-center ${selected ? "bg-blue-50/50" : "bg-white"}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${config.iconWrap} ring-1 ${config.ring}`}><Icon className="h-5 w-5" /></span>
        <div className="min-w-0">
          <p className="truncate text-xs font-black text-[#172033]">{event.title}</p>
          <p className="mt-1 truncate text-[11px] font-semibold text-[#506079]">{event.description}</p>
          <span className="mt-1.5 inline-flex"><AuditCategoryBadge category={event.category} /></span>
        </div>
      </div>
      <div className="min-w-0 pl-[52px] lg:pl-0">
        <p className="truncate text-xs font-black text-[#243756]">{event.actor.name}</p>
        <p className="mt-1 truncate text-[11px] font-semibold text-[#506079]">{event.actor.role}</p>
      </div>
      <div className="flex min-w-0 items-center gap-3 pl-[52px] lg:pl-0">
        {event.worker.avatar ? <img src={event.worker.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" /> : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-black text-slate-600">{event.worker.name.slice(0, 1)}</span>}
        <div className="min-w-0">
          <p className="truncate text-xs font-black text-[#172033]">{event.worker.name}</p>
          <p className="truncate text-[11px] font-semibold text-[#506079]">{event.worker.occupation}</p>
          <p className="truncate text-[11px] font-semibold text-[#2e4d7c]">{event.program}</p>
        </div>
      </div>
      <div className="pl-[52px] text-xs font-black text-[#314567] lg:pl-0">
        <p>{date}</p>
        <p className="mt-1">{time}</p>
      </div>
      <div className="pl-[52px] lg:pl-0"><AuditStatusBadge status={event.status} /></div>
      <MoreVertical className="hidden h-4 w-4 text-[#24476f] lg:block" />
    </button>
  );
}

function AuditEventTable({ events, selectedEvent, onSelect, page, setPage, pageSize, setPageSize, total }) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(total, page * pageSize);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
      <div className="hidden grid-cols-[minmax(250px,1.25fr)_minmax(120px,0.55fr)_minmax(220px,0.95fr)_minmax(100px,0.48fr)_minmax(96px,0.42fr)_28px] border-b border-[#edf2f8] bg-[#fbfdff] px-4 py-3 text-[11px] font-black uppercase tracking-[0.05em] text-[#587091] lg:grid">
        <span>Event</span><span>Actor</span><span>Worker / Program</span><span>Time</span><span>Status</span><span />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {events.map((event) => <AuditEventRow key={event.id} event={event} selected={selectedEvent?.id === event.id} onClick={() => onSelect(event)} />)}
        {!events.length && <div className="p-10 text-center text-sm font-bold text-slate-500">No audit events match these filters.</div>}
      </div>
      <div className="flex flex-col gap-3 border-t border-[#edf2f8] px-4 py-3 text-xs font-bold text-[#506079] md:flex-row md:items-center md:justify-between">
        <p>Showing {start} to {end} of {total} events</p>
        <div className="flex items-center justify-center gap-2">
          <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid h-8 w-8 place-items-center rounded-lg border border-[#dbe5f2] text-blue-700 disabled:text-slate-300"><ChevronLeft className="h-4 w-4" /></button>
          {[1, 2, 3].filter((item) => item <= pageCount).map((item) => (
            <button key={item} type="button" onClick={() => setPage(item)} className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-black ${page === item ? "border-blue-500 bg-blue-50 text-blue-700" : "border-[#dbe5f2] text-[#506079]"}`}>{item}</button>
          ))}
          {pageCount > 4 && <span className="px-1 font-black">...</span>}
          {pageCount > 3 && <button type="button" onClick={() => setPage(pageCount)} className={`h-8 min-w-8 rounded-lg border px-2 text-xs font-black ${page === pageCount ? "border-blue-500 bg-blue-50 text-blue-700" : "border-[#dbe5f2] text-[#506079]"}`}>{pageCount}</button>}
          <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="grid h-8 w-8 place-items-center rounded-lg border border-[#dbe5f2] text-blue-700 disabled:text-slate-300"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-9 rounded-xl border border-[#dbe5f2] bg-white px-3 text-xs font-black text-[#172033]">
          {[10, 20, 50].map((size) => <option key={size} value={size}>{size} / page</option>)}
        </select>
      </div>
    </Card>
  );
}

function AuditDetailsDrawer({ event, onClose }) {
  if (!event) return null;
  const config = auditCategoryConfig[event.category] || auditCategoryConfig.System;
  const Icon = config.icon;
  const { date, time } = auditDateParts(event.timestamp);
  const fields = [
    [Clock3, "Date & Time", `${date}, ${time}`],
    [UserCog, "Actor", `${event.actor.name} (${event.actor.role})`],
    [FileText, "Source", event.source],
    [Users, "Related Worker", `${event.worker.name}\n${event.worker.occupation}`],
    [GraduationCap, "Program", event.program],
    [Wifi, "IP Address", event.ipAddress],
    [Smartphone, "Device", event.device],
    [Navigation, "Location", event.location]
  ];
  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] flex-col border-l border-[#dbe5f2] bg-white shadow-[-18px_0_40px_rgba(15,23,42,0.14)] xl:static xl:z-0 xl:h-full xl:max-w-none xl:shadow-none">
      <div className="flex h-[54px] shrink-0 items-center justify-between border-b border-[#edf2f8] px-4">
        <h3 className="text-sm font-black text-[#172033]">Event Details</h3>
        <button type="button" onClick={onClose} aria-label="Close event details" className="grid h-8 w-8 place-items-center rounded-lg text-[#24476f] hover:bg-slate-50"><X className="h-4 w-4" /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="flex items-start gap-4">
          <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${config.iconWrap} ring-1 ${config.ring}`}><Icon className="h-7 w-7" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-base font-black text-[#172033]">{event.title}</h4>
              <AuditStatusBadge status={event.status} />
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#506079]">{event.description}</p>
            <span className="mt-2 inline-flex"><AuditCategoryBadge category={event.category} /></span>
          </div>
        </div>
        <div className="mt-7 grid gap-4">
          {fields.map(([FieldIcon, label, value]) => (
            <div key={label} className="grid grid-cols-[22px_104px_1fr] gap-3 text-xs">
              <FieldIcon className="mt-0.5 h-4 w-4 text-[#587091]" />
              <span className="font-black text-[#587091]">{label}</span>
              <span className="whitespace-pre-line font-semibold leading-5 text-[#243756]">{value}</span>
            </div>
          ))}
        </div>
        <h4 className="mt-7 text-sm font-black text-[#172033]">Additional Information</h4>
        <div className="mt-4 grid gap-3 text-xs">
          {Object.entries({ ...event.additional, "Reference ID": event.referenceId }).map(([label, value]) => (
            <div key={label} className="grid grid-cols-[120px_1fr] gap-3">
              <span className="font-black text-[#587091]">{label}</span>
              <span className="font-semibold text-[#243756]">{value}</span>
            </div>
          ))}
        </div>
        <h4 className="mt-7 text-sm font-black text-[#172033]">Timeline</h4>
        <div className="mt-4 grid gap-4">
          {event.timeline.map(([label, timestamp]) => {
            const part = auditDateParts(timestamp);
            return (
              <div key={`${label}-${timestamp}`} className="relative grid grid-cols-[22px_1fr] gap-3 text-xs">
                <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3" /></span>
                <div><p className="font-black text-[#243756]">{label}</p><p className="mt-1 font-semibold text-[#506079]">{part.date}, {part.time}</p></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t border-[#edf2f8] p-4">
        <button type="button" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,0.24)] hover:bg-blue-700">
          View Worker Profile
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

function exportAuditCsv(filename, events) {
  exportCsv(filename, events.map((event) => ({
    "Event title": event.title,
    Description: event.description,
    Category: event.category,
    Actor: event.actor.name,
    "Actor role": event.actor.role,
    Worker: event.worker.name,
    Program: event.program,
    Timestamp: event.timestamp,
    Status: event.status,
    Source: event.source,
    "Reference ID": event.referenceId
  })));
}

export function NgoAuditLog({ organization, membership, isDemoMode = false }) {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState(auditFilterDefaults);
  const [sortBy, setSortBy] = useState("Newest First");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const canView = isDemoMode || hasNgoPermission(membership, NGO_PERMISSIONS.viewAuditLog);

  useEffect(() => {
    if (!canView || isDemoMode || !organization?.id) return;
    database.getOrganizationAuditLog(organization.id).then((items) => setLogs(items.map(normalizeAuditLog)));
  }, [canView, isDemoMode, organization?.id]);

  const events = isDemoMode ? demoNgoAuditEvents : logs;
  const options = useMemo(() => ({
    sources: [...new Set(events.map((event) => event.source))],
    eventTypes: [...new Set(events.map((event) => event.category))],
    workers: [...new Set(events.map((event) => event.worker.name))],
    programs: [...new Set(events.map((event) => event.program))],
    statuses: [...new Set(events.map((event) => event.status))]
  }), [events]);

  const filtered = useMemo(() => {
    const next = events.filter((event) => {
      const matchesDate = !filters.dateRange || event.timestamp.slice(0, 10) === filters.dateRange;
      return (!filters.source || event.source === filters.source)
        && (!filters.eventType || event.category === filters.eventType)
        && (!filters.worker || event.worker.name === filters.worker)
        && (!filters.program || event.program === filters.program)
        && (!filters.status || event.status === filters.status)
        && matchesDate;
    });
    return [...next].sort((a, b) => {
      if (sortBy === "Oldest First") return Date.parse(a.timestamp) - Date.parse(b.timestamp);
      if (sortBy === "Event Type") return a.title.localeCompare(b.title);
      if (sortBy === "Status") return a.status.localeCompare(b.status);
      return Date.parse(b.timestamp) - Date.parse(a.timestamp);
    });
  }, [events, filters, sortBy]);

  useEffect(() => { setPage(1); }, [filters, sortBy]);
  useEffect(() => {
    if (!selectedEvent && filtered.length) setSelectedEvent(filtered[0]);
    if (selectedEvent && !filtered.some((event) => event.id === selectedEvent.id)) setSelectedEvent(filtered[0] || null);
  }, [filtered, selectedEvent]);

  const pageEvents = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = Object.values(filters).some(Boolean);
  const successCount = filtered.filter((event) => event.status === "Success").length;
  const kpiSource = hasFilters ? filtered : events;
  const kpis = [
    { icon: ClipboardList, value: kpiSource.length, label: "Total Events", helper: "↑ 18.6% vs last 45 days", tone: "blue" },
    { icon: CalendarDays, value: hasFilters ? kpiSource.filter((event) => event.timestamp.slice(0, 10) === "2026-07-29").length : 24, label: "Today's Events", helper: "↑ 20.0% vs yesterday", tone: "green" },
    { icon: Users, value: hasFilters ? kpiSource.filter((event) => event.category === "Worker").length : 186, label: "Worker Actions", helper: "43.5% of total", tone: "purple" },
    { icon: GraduationCap, value: hasFilters ? kpiSource.filter((event) => event.category === "Training").length : 112, label: "Training Events", helper: "26.2% of total", tone: "orange" },
    { icon: BriefcaseBusiness, value: hasFilters ? kpiSource.filter((event) => event.category === "Placement").length : 37, label: "Placements", helper: "↑ 15.6% vs last 45 days", tone: "blue" },
    { icon: ShieldCheck, value: hasFilters ? (filtered.length ? `${((successCount / filtered.length) * 100).toFixed(1)}%` : "0.0%") : "98.2%", label: "Success Rate", helper: "↑ 2.4% vs last 45 days", tone: "green" }
  ];

  if (!canView) return <EmptyState icon={LockKeyhole} title="Audit log access is restricted" description="Ask an organization admin for audit permissions." />;
  if (!isDemoMode && !logs.length) return <EmptyState icon={ClipboardList} title="No audit events yet" description="Workspace events will appear here once your team starts recording consent, training and placement activity." />;

  return (
    <div className={`mx-auto grid h-full min-h-0 w-full max-w-[1540px] gap-4 overflow-hidden ${drawerOpen && selectedEvent ? "xl:grid-cols-[minmax(0,1fr)_360px]" : ""}`}>
      <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
        <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Production Workspace</p>
            <div className="mt-2 flex items-center gap-3">
              <h2 className="text-[32px] font-black leading-tight text-[#111a3b]">Audit Log</h2>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600"><ShieldCheck className="h-5 w-5" /></span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[#506079]">Track all important actions and events across your workspace.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button type="button" onClick={() => setExportOpen((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dbe5f2] bg-white px-4 text-xs font-black text-[#243756] shadow-sm hover:bg-slate-50">
                <Download className="h-4 w-4 text-blue-600" /> Export <ChevronDown className="h-4 w-4" />
              </button>
              {exportOpen && (
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[#dbe5f2] bg-white p-1 text-xs font-black text-[#243756] shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
                  <button type="button" onClick={() => { exportAuditCsv("rozgaarai-audit-log.csv", events); setExportOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-blue-50">Export CSV</button>
                  <button type="button" onClick={() => { window.print(); setExportOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-blue-50">Export PDF</button>
                  <button type="button" onClick={() => { exportAuditCsv("rozgaarai-filtered-audit-log.csv", filtered); setExportOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-blue-50">Export filtered events</button>
                </div>
              )}
            </div>
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dbe5f2] bg-white px-4 text-xs font-black text-[#243756] shadow-sm">
              <CalendarDays className="h-4 w-4 text-blue-600" /> Last 45 Days <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid shrink-0 gap-3 overflow-x-auto pb-1 sm:grid-cols-2 lg:grid-cols-3 min-[1320px]:grid-cols-6">
          {kpis.map((kpi) => <AuditKpiCard key={kpi.label} {...kpi} />)}
        </div>
        <AuditFilterBar filters={filters} setFilters={setFilters} options={options} onClear={() => setFilters(auditFilterDefaults)} />
        <div className="flex shrink-0 items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.06em] text-[#466080]">Audit Events ({filtered.length})</p>
          <label className="relative">
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-9 appearance-none rounded-xl border border-[#dbe5f2] bg-white py-0 pl-3 pr-8 text-xs font-black text-[#243756]">
              {["Newest First", "Oldest First", "Event Type", "Status"].map((item) => <option key={item} value={item}>Sort by: {item}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#587091]" />
          </label>
        </div>
        <AuditEventTable events={pageEvents} selectedEvent={selectedEvent} onSelect={(event) => { setSelectedEvent(event); setDrawerOpen(true); }} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} total={filtered.length} />
      </div>
      {drawerOpen && selectedEvent && <AuditDetailsDrawer event={selectedEvent} onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}

function SettingsSecurityIllustration() {
  return (
    <div className="pointer-events-none relative hidden h-[150px] min-w-[430px] overflow-hidden lg:block" aria-hidden="true">
      <div className="absolute bottom-4 left-12 h-20 w-36 rounded-full bg-blue-100/55 blur-2xl" />
      <div className="absolute bottom-0 right-8 h-24 w-44 rounded-full bg-emerald-100/45 blur-2xl" />
      <div className="absolute left-24 top-7 grid gap-2">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex h-10 w-28 items-center gap-2 rounded-xl bg-blue-500/35 px-3 shadow-[0_10px_24px_rgba(37,99,235,0.14)]">
            <span className="h-2 w-2 rounded-full bg-white/90" />
            <span className="h-2 w-2 rounded-full bg-white/70" />
            <span className="ml-auto h-5 w-8 rounded-md bg-blue-200/60" />
          </div>
        ))}
      </div>
      <div className="absolute right-24 top-10 h-24 w-20 rounded-b-[30px] rounded-t-xl bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_18px_28px_rgba(16,185,129,0.22)] [clip-path:polygon(50%_0,100%_18%,92%_72%,50%_100%,8%_72%,0_18%)]">
        <CheckCircle2 className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 text-white" />
      </div>
      <div className="absolute right-6 top-12 h-14 w-14 rounded-full bg-blue-400/18" />
      <div className="absolute right-52 top-16 h-20 w-20 rounded-full bg-blue-400/10" />
      <SlidersHorizontal className="absolute right-12 top-20 h-8 w-8 rotate-12 text-blue-400/45" />
      <ShieldCheck className="absolute left-8 top-20 h-9 w-9 text-blue-300/45" />
    </div>
  );
}

function ChecklistSummaryCard({ icon: Icon, value, label, tone }) {
  const tones = {
    green: "text-emerald-700",
    orange: "text-orange-600",
    blue: "text-blue-700"
  };
  return (
    <div className="flex h-12 min-w-[90px] items-center gap-2 rounded-xl border border-[#e5ecf5] bg-white px-3 shadow-sm">
      <Icon className={`h-4 w-4 ${tones[tone] || tones.blue}`} />
      <div>
        <p className="text-base font-black leading-4 text-[#0f172a]">{value}</p>
        <p className="mt-1 whitespace-nowrap text-[10px] font-black text-[#52637a]">{label}</p>
      </div>
    </div>
  );
}

function ChecklistStatusBadge({ status }) {
  const complete = status === "Completed";
  return (
    <span className={`inline-flex h-7 items-center rounded-full px-3 text-[11px] font-black ${complete ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-orange-50 text-orange-700 ring-1 ring-orange-100"}`}>
      {status}
    </span>
  );
}

function ProductionChecklistItem({ item, expanded, onToggle }) {
  const complete = item.status === "Completed";
  const Icon = complete ? CheckCircle2 : AlertCircle;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e5ecf5] bg-white transition hover:border-blue-100 hover:shadow-[0_12px_26px_rgba(15,23,42,0.045)]">
      <button type="button" onClick={onToggle} className="grid w-full grid-cols-[44px_1fr_auto_24px] items-center gap-3 px-3 py-2.5 text-left">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${complete ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
          <Icon className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black leading-5 text-[#0f172a]">{item.title}</span>
          <span className="mt-0.5 block text-xs font-semibold leading-5 text-[#30466a]">{item.description}</span>
        </span>
        <ChecklistStatusBadge status={item.status} />
        <ChevronDown className={`h-4 w-4 text-[#24476f] transition ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="border-t border-[#edf2f8] bg-[#fbfdff] px-5 py-4">
          <div className="grid gap-3 text-xs md:grid-cols-2">
            {[
              ["What was checked", item.checked],
              ["Current result", item.result],
              ["Why it matters", item.why],
              ["Recommended next action", item.nextAction],
              ["Last checked", item.lastChecked],
              ["Responsible", item.owner],
              ["Related file/config", item.related],
              ...(item.riskLevel ? [["Risk level", item.riskLevel], ["Related areas", item.relatedAreas]] : [])
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#e5ecf5] bg-white p-3">
                <p className="font-black text-[#6a7892]">{label}</p>
                <p className="mt-1 font-bold leading-5 text-[#172033]">{value}</p>
              </div>
            ))}
          </div>
          {!complete && (
            <button type="button" className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-orange-500 px-4 text-xs font-black text-white transition hover:bg-orange-600">
              <ExternalLink className="h-3.5 w-3.5" />
              Review RLS setup
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsReviewPanel({ lastReview, running, onRun }) {
  return (
    <div className="mt-4 grid gap-3 rounded-2xl bg-white pt-1 md:grid-cols-[185px_minmax(220px,1fr)_155px] md:items-center">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600"><ShieldCheck className="h-7 w-7" /></span>
        <div>
          <p className="text-xs font-black text-[#52637a]">Last reviewed</p>
          <p className="mt-1 text-xs font-black text-[#172033]">{lastReview.reviewedAt}</p>
          <p className="mt-1 text-xs font-semibold text-[#52637a]">by {lastReview.reviewedBy}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-xl bg-blue-50/70 px-4 py-3 text-xs text-blue-700">
        <Activity className="h-5 w-5 shrink-0" />
        <div><p className="font-black">Keep your production workspace secure and up-to-date.</p><p className="mt-1 font-semibold">Re-run checklist after any major changes.</p></div>
      </div>
      <button type="button" onClick={onRun} disabled={running} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 disabled:opacity-70">
        <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
        {running ? "Running..." : "Re-run checklist"}
      </button>
    </div>
  );
}

const permissionIcons = [Plus, Edit3, UserPlus, CalendarDays, Users, ClipboardList, GraduationCap, FileText, ShieldCheck, Search, Trophy, Activity];

function PermissionRow({ item, index, onClick }) {
  const Icon = permissionIcons[index % permissionIcons.length];
  return (
    <button type="button" onClick={onClick} className="grid h-[46px] w-full grid-cols-[34px_minmax(0,1fr)_auto_16px_16px] items-center gap-2 rounded-xl border-b border-[#edf2f8] px-2 text-left transition last:border-b-0 hover:bg-blue-50/45">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 truncate text-xs font-black text-[#172033]">{item.label}</span>
      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-100">{item.status}</span>
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      <ChevronRight className="h-4 w-4 text-[#587091]" />
    </button>
  );
}

function PermissionDetailsDrawer({ permission, onClose }) {
  if (!permission) return null;
  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] flex-col border-l border-[#e5ecf5] bg-white shadow-[-18px_0_42px_rgba(15,23,42,0.14)]">
      <div className="flex h-14 items-center justify-between border-b border-[#edf2f8] px-5">
        <h3 className="text-sm font-black text-[#0f172a]">Permission details</h3>
        <button type="button" onClick={onClose} aria-label="Close permission details" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-50"><X className="h-4 w-4" /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-black text-green-700">Demo Mode</span>
        <h4 className="mt-4 text-xl font-black text-[#0f172a]">{permission.label}</h4>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#52637a]">{permission.description}</p>
        <div className="mt-5 grid gap-3 text-sm">
          {[
            ["Permission key", permission.key],
            ["Current status", permission.status],
            ["Roles with access", permission.roles],
            ["Security impact", permission.securityImpact],
            ["Last changed", permission.lastChanged],
            ["Changed by", permission.changedBy]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#e5ecf5] bg-[#fbfdff] p-3">
              <p className="text-xs font-black text-[#6a7892]">{label}</p>
              <p className="mt-1 font-bold leading-5 text-[#172033]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function FullPermissionModal({ permissions, onClose }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const roles = ["NGO Admin", "Programme Manager", "Trainer", "Placement Coordinator", "Viewer"];
  const filtered = permissions.filter((item) => (!query || item.label.toLowerCase().includes(query.toLowerCase())) && (!role || item.roles.includes(role)));
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[86dvh] w-full max-w-3xl flex-col rounded-2xl border border-[#e5ecf5] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between gap-4">
          <div><h3 className="text-lg font-black text-[#0f172a]">Complete permission matrix</h3><p className="mt-1 text-xs font-bold text-[#52637a]">Demo Mode permissions are read-only.</p></div>
          <button type="button" onClick={onClose} aria-label="Close permission matrix" className="grid h-9 w-9 place-items-center rounded-xl border border-[#e5ecf5]"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
          <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search permissions..." className="h-10 w-full rounded-xl border border-[#e5ecf5] pl-9 pr-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100" /></label>
          <select value={role} onChange={(event) => setRole(event.target.value)} className="h-10 rounded-xl border border-[#e5ecf5] px-3 text-sm font-black outline-none focus:ring-4 focus:ring-blue-100">
            <option value="">All roles</option>
            {roles.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="mt-4 min-h-0 overflow-y-auto rounded-2xl border border-[#edf2f8]">
          {filtered.map((item, index) => <PermissionRow key={item.key} item={item} index={index} onClick={() => {}} />)}
        </div>
      </div>
    </div>
  );
}

export function NgoProductionSettings() {
  const [expandedId, setExpandedId] = useState("");
  const [review, setReview] = useState(demoLastReview);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState("");
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [matrixOpen, setMatrixOpen] = useState(false);

  function runChecklist() {
    setRunning(true);
    window.setTimeout(() => {
      setRunning(false);
      setReview({ reviewedAt: "Just now", reviewedBy: "NGO Demo" });
      setToast("Production checklist completed in Demo Mode.");
      window.setTimeout(() => setToast(""), 2200);
    }, 800);
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1540px] flex-col overflow-hidden text-[#0f172a]">
      <div className="flex shrink-0 items-center justify-between gap-6 px-1 pb-3 pt-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Production Workspace</p>
          <div className="mt-3 flex items-center gap-3">
            <h2 className="text-[30px] font-black leading-tight">Production Settings</h2>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600"><ShieldCheck className="h-5 w-5" /></span>
          </div>
          <p className="mt-3 max-w-[560px] text-sm font-semibold leading-6 text-[#30466a]">Review security, accessibility, performance, permissions and deployment readiness for this NGO workspace.</p>
        </div>
        <SettingsSecurityIllustration />
      </div>
      <div className="grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card className="flex min-h-0 flex-col rounded-2xl p-5">
          <div className="flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-black">Production checklist</h3>
            <div className="flex flex-wrap gap-2">
              <ChecklistSummaryCard icon={CheckCircle2} value={demoChecklistSummary.completed} label="Completed" tone="green" />
              <ChecklistSummaryCard icon={AlertCircle} value={demoChecklistSummary.actionNeeded} label="Action needed" tone="orange" />
              <ChecklistSummaryCard icon={Clock3} value={demoChecklistSummary.pending} label="Pending" tone="blue" />
            </div>
          </div>
          <div className="mt-3 grid min-h-0 gap-2 overflow-y-auto pr-1">
            {demoProductionChecklist.map((item) => (
              <ProductionChecklistItem key={item.id} item={item} expanded={expandedId === item.id} onToggle={() => setExpandedId((current) => current === item.id ? "" : item.id)} />
            ))}
          </div>
          <SettingsReviewPanel lastReview={review} running={running} onRun={runChecklist} />
        </Card>

        <Card className="flex min-h-0 flex-col rounded-2xl p-5">
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600"><SlidersHorizontal className="h-5 w-5" /></span>
              <h3 className="text-lg font-black">Permission matrix</h3>
            </div>
            <button type="button" onClick={() => setMatrixOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e5ecf5] bg-white px-4 text-xs font-black text-[#243756] shadow-sm transition hover:bg-blue-50">
              View details <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[#edf2f8] px-2 py-1">
            {demoPermissionMatrix.map((item, index) => <PermissionRow key={item.key} item={item} index={index} onClick={() => setSelectedPermission(item)} />)}
          </div>
          <div className="mt-4 flex shrink-0 items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-emerald-600 ring-1 ring-emerald-100"><ShieldCheck className="h-7 w-7" /></span>
            <div>
              <p className="text-sm font-black">{demoPermissionSummary.enabled} of {demoPermissionSummary.total} permissions enabled</p>
              <p className="mt-1 text-xs font-semibold text-[#52637a]">{demoPermissionSummary.description}</p>
            </div>
          </div>
        </Card>
      </div>
      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl">{toast}</div>}
      <PermissionDetailsDrawer permission={selectedPermission} onClose={() => setSelectedPermission(null)} />
      {matrixOpen && <FullPermissionModal permissions={demoPermissionMatrix} onClose={() => setMatrixOpen(false)} />}
    </div>
  );
}
