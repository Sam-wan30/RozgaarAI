import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  Filter,
  IndianRupee,
  LayoutGrid,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Scissors,
  Sparkles,
  Table2,
  Trophy,
  UserCheck,
  Users,
  Wrench,
  Zap,
  Package
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { demoProfiles } from "../../data/mockData";
import { database } from "../../lib/database";
import { hasNgoPermission, NGO_PERMISSIONS } from "../../lib/roles";

const stageLabels = {
  worker_consent_pending: "Consent Pending",
  submitted: "Recommended",
  employer_viewed: "Employer Viewed",
  shortlisted: "Shortlisted",
  interview_requested: "Interview Requested",
  interview_scheduled: "Interview Scheduled",
  selected: "Selected",
  offer_made: "Offer Made",
  offer_accepted: "Offer Accepted",
  joined: "Joined",
  employed: "Employed",
  follow_up: "Follow-Up",
  not_selected: "Not Selected",
  withdrawn: "Withdrawn",
  not_joined: "Not Joined",
  left_job: "Left Job",
  completed: "Completed"
};

const stageTone = {
  worker_consent_pending: "border-amber-100 bg-amber-50 text-amber-700",
  submitted: "border-blue-100 bg-blue-50 text-blue-700",
  employer_viewed: "border-sky-100 bg-sky-50 text-sky-700",
  shortlisted: "border-violet-100 bg-violet-50 text-violet-700",
  interview_requested: "border-indigo-100 bg-indigo-50 text-indigo-700",
  interview_scheduled: "border-indigo-100 bg-indigo-50 text-indigo-700",
  selected: "border-green-100 bg-green-50 text-green-700",
  offer_made: "border-teal-100 bg-teal-50 text-teal-700",
  offer_accepted: "border-teal-100 bg-teal-50 text-teal-700",
  joined: "border-emerald-100 bg-emerald-50 text-emerald-700",
  employed: "border-emerald-100 bg-emerald-50 text-emerald-700",
  follow_up: "border-orange-100 bg-orange-50 text-orange-700",
  not_selected: "border-rose-100 bg-rose-50 text-rose-700",
  withdrawn: "border-slate-200 bg-slate-50 text-slate-600"
};

const demoPlacementStages = ["submitted", "shortlisted", "interview_scheduled", "selected", "follow_up"];

function buildDemoPlacementRows() {
  return demoProfiles.map((profile, index) => {
    const stage = demoPlacementStages[index] || "submitted";
    const job = {
      id: `demo-job-${profile.workerId}`,
      title: profile.skill === "Domestic Worker" ? "Housekeeping Support" : profile.skill,
      employerName: ["CityCare Facilities", "Bhopal Homes Maintenance", "Raipur Boutique Studio", "Lucknow Facility Care", "Orange City Logistics"][index] || "Verified Employer",
      employerProfileId: `demo-employer-${index + 1}`,
      locationCity: profile.city,
      salaryMin: Math.max(12000, Number(profile.expectedWage || 18000) - 2000),
      salaryMax: Number(profile.expectedWage || 18000) + 3000,
      salaryPeriod: "month"
    };
    const worker = {
      workerProfileId: profile.workerId,
      workerId: profile.workerId,
      name: profile.name,
      primarySkill: profile.skill,
      city: profile.city,
      experience: `${profile.experience} yrs exp`,
      photoUrl: profile.photoUrl,
      avatar: profile.avatar
    };
    const recommendation = {
      id: `demo-rec-${profile.workerId}`,
      matchScore: profile.jobMatch,
      profileSnapshot: worker
    };
    const placement = {
      id: `demo-placement-${profile.workerId}`,
      organizationId: "demo-ngo",
      jobId: job.id,
      workerProfileId: worker.workerProfileId,
      recommendationId: recommendation.id,
      employerProfileId: job.employerProfileId,
      placementStatus: stage,
      updatedAt: new Date(Date.now() - index * 86400000).toISOString()
    };
    return { job, worker, recommendation, placement };
  });
}

function buildDemoJobOpportunities() {
  const demoJobSpecs = [
    {
      skill: "Domestic Worker",
      employerProfileId: "demo-employer-1",
      employerName: "CityCare Facilities",
      title: "Housekeeping Support",
      requiredSkills: ["Cleaning", "Cooking Support", "Elder Care"],
      locationCity: "Delhi",
      locationState: "Delhi",
      salaryMin: 18000,
      salaryMax: 23000,
      openPositions: 3,
      minimumExperienceYears: 2,
      applicationDeadline: "2026-08-07",
      iconKey: "building",
      visualTone: "from-blue-500 to-blue-700"
    },
    {
      skill: "Plumber",
      employerProfileId: "demo-employer-2",
      employerName: "Bhopal Homes Maintenance",
      title: "Home Maintenance Plumber",
      requiredSkills: ["Plumbing", "Repair", "Fitting"],
      locationCity: "Bhopal",
      locationState: "Madhya Pradesh",
      salaryMin: 26000,
      salaryMax: 31000,
      openPositions: 2,
      minimumExperienceYears: 4,
      applicationDeadline: "2026-08-10",
      iconKey: "wrench",
      visualTone: "from-emerald-500 to-green-700"
    },
    {
      skill: "Tailor",
      employerProfileId: "demo-employer-3",
      employerName: "Raipur Boutique Studio",
      title: "Boutique Tailor",
      requiredSkills: ["Tailoring", "Alteration", "Designer Wear"],
      locationCity: "Raipur",
      locationState: "Chhattisgarh",
      salaryMin: 16000,
      salaryMax: 21000,
      openPositions: 1,
      minimumExperienceYears: 3,
      applicationDeadline: "2026-08-12",
      iconKey: "tailor",
      visualTone: "from-violet-500 to-purple-700"
    },
    {
      skill: "Electrician",
      employerProfileId: "demo-employer-4",
      employerName: "PowerHouse Services",
      title: "Industrial Electrician",
      requiredSkills: ["Electrical", "Maintenance", "Industrial Wiring"],
      locationCity: "Lucknow",
      locationState: "Uttar Pradesh",
      salaryMin: 24000,
      salaryMax: 32000,
      openPositions: 4,
      minimumExperienceYears: 4,
      applicationDeadline: "2026-08-18",
      iconKey: "bolt",
      visualTone: "from-orange-400 to-orange-600"
    },
    {
      skill: "Driver",
      employerProfileId: "demo-employer-5",
      employerName: "GreenField Logistics",
      title: "Warehouse Associate",
      requiredSkills: ["Packing", "Scanning", "Inventory"],
      locationCity: "Indore",
      locationState: "Madhya Pradesh",
      salaryMin: 17000,
      salaryMax: 22000,
      openPositions: 3,
      minimumExperienceYears: 1,
      applicationDeadline: "2026-08-20",
      iconKey: "box",
      visualTone: "from-cyan-500 to-teal-700"
    }
  ];
  return demoJobSpecs.map((spec, index) => ({
    id: `demo-job-${index + 1}`,
    jobCode: `DEMO-${index + 1}`,
    description: `Demo opportunity matched for ${spec.skill.toLowerCase()} workers supported by the NGO workspace. This is sample placement data and is not saved to the real workspace.`,
    skillSector: spec.skill,
    preferredSkills: ["Verified documents", "Immediate availability"],
    employmentType: "full_time",
    shiftType: index === 0 ? "morning" : "day",
    maximumExperienceYears: spec.minimumExperienceYears + 4,
    salaryPeriod: "month",
    filledPositions: 0,
    joiningDate: "2026-08-25",
    accommodationAvailable: index === 3,
    mealsAvailable: index === 0,
    transportAvailable: index === 4,
    verificationStatus: "verified",
    status: "open",
    recommendationsSent: 1,
    isDemo: true,
    ...spec
  }));
}

const demoEmployerPartners = [
  {
    id: "demo-employer-1",
    employerProfileId: "demo-employer-1",
    employerName: "CityCare Facilities",
    industry: "Facility Management",
    industryLabel: "Facilities",
    locationCity: "Delhi",
    description: "Housekeeping and facility services",
    activeOpenings: 2,
    verificationStatus: "verified",
    connectionStatus: "active",
    workersHired: 3,
    workersPlaced: 3,
    recommendationsSent: 4,
    workersShortlisted: 2,
    lastActivity: "2 days ago",
    logo: "CC",
    logoTone: "from-blue-800 to-blue-950",
    industryTone: "bg-blue-50 text-blue-700"
  },
  {
    id: "demo-employer-2",
    employerProfileId: "demo-employer-2",
    employerName: "Bhopal Homes Maintenance",
    industry: "Home Services",
    industryLabel: "Home Services",
    locationCity: "Bhopal",
    description: "Plumbing and maintenance",
    activeOpenings: 1,
    verificationStatus: "verified",
    connectionStatus: "active",
    workersHired: 2,
    workersPlaced: 2,
    recommendationsSent: 3,
    workersShortlisted: 2,
    lastActivity: "1 day ago",
    logo: "BH",
    logoTone: "from-green-500 to-green-700",
    industryTone: "bg-green-50 text-green-700"
  },
  {
    id: "demo-employer-3",
    employerProfileId: "demo-employer-3",
    employerName: "Raipur Boutique Studio",
    industry: "Retail",
    industryLabel: "Retail",
    locationCity: "Raipur",
    description: "Tailoring and designer wear",
    activeOpenings: 1,
    verificationStatus: "verified",
    connectionStatus: "active",
    workersHired: 1,
    workersPlaced: 1,
    recommendationsSent: 2,
    workersShortlisted: 1,
    lastActivity: "3 days ago",
    logo: "RBS",
    logoTone: "from-violet-500 to-violet-800",
    industryTone: "bg-violet-50 text-violet-700"
  },
  {
    id: "demo-employer-4",
    employerProfileId: "demo-employer-4",
    employerName: "PowerHouse Services",
    industry: "Electrical Services",
    industryLabel: "Electrical",
    locationCity: "Lucknow",
    description: "Electrical maintenance",
    activeOpenings: 2,
    verificationStatus: "verified",
    connectionStatus: "active",
    workersHired: 4,
    workersPlaced: 4,
    recommendationsSent: 5,
    workersShortlisted: 3,
    lastActivity: "5 hours ago",
    logo: "PHS",
    logoTone: "from-orange-400 to-orange-600",
    industryTone: "bg-orange-50 text-orange-700"
  },
  {
    id: "demo-employer-5",
    employerProfileId: "demo-employer-5",
    employerName: "GreenField Logistics",
    industry: "Logistics",
    industryLabel: "Logistics",
    locationCity: "Indore",
    description: "Logistics and delivery services",
    activeOpenings: 1,
    verificationStatus: "verified",
    connectionStatus: "active",
    workersHired: 2,
    workersPlaced: 2,
    recommendationsSent: 3,
    workersShortlisted: 1,
    lastActivity: "4 days ago",
    logo: "GF",
    logoTone: "from-cyan-500 to-teal-700",
    industryTone: "bg-cyan-50 text-cyan-700"
  }
];

function formatCurrency(min, max, period = "month") {
  const formatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  const suffix = period === "day" ? "per day" : "per month";
  if (!min && !max) return "Salary not listed";
  if (!max || min === max) return `${formatter.format(min || max)} ${suffix}`;
  return `${formatter.format(min)}-${formatter.format(max)} ${suffix}`;
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function titleCase(value) {
  return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function Badge({ children, tone = "border-slate-200 bg-white text-slate-600", icon: Icon }) {
  return (
    <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-black ${tone}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return <section className={`rounded-[18px] border border-slate-200 bg-white shadow-[0_18px_54px_rgba(15,23,42,0.055)] ${className}`}>{children}</section>;
}

function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">{eyebrow || "NGO / Foundation Workspace"}</p>
        <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-11 w-full rounded-[14px] border border-slate-200 bg-white pl-10 pr-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "bg-blue-50 text-blue-700 border-blue-100" }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl border ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-black text-slate-950">{value}</p>
          <p className="truncate text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
          {detail && <p className="mt-1 text-xs font-bold text-slate-500">{detail}</p>}
        </div>
      </div>
    </Card>
  );
}

function EmployerMetricCard({ icon: Icon, value, label, trend, tone }) {
  return (
    <Card className={`border ${tone.border} bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.045)]`}>
      <div className="flex items-center gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone.iconBg} ${tone.iconText}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-3xl font-black leading-none text-slate-950">{value}</p>
          <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
          <p className="mt-2 text-xs font-black text-emerald-600">{trend}</p>
        </div>
      </div>
    </Card>
  );
}

function getEmployerKey(employer) {
  return employer?.employerProfileId || employer?.id;
}

function getEmployerOpenings(employer) {
  return Number(employer?.activeOpenings ?? employer?.openOpportunities ?? employer?.openJobs ?? 0);
}

function getEmployerPlacedCount(employer) {
  return Number(employer?.workersPlaced ?? employer?.workersHired ?? 0);
}

function EmployerLogo({ employer }) {
  const label = employer.logo || (employer.employerName || "EM").split(" ").map((word) => word[0]).join("").slice(0, 3).toUpperCase();
  return (
    <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${employer.logoTone || "from-blue-600 to-blue-900"} text-sm font-black text-white shadow-sm`}>
      {label}
    </span>
  );
}

function getJobVisual(job) {
  const visuals = {
    building: { icon: Building2, tone: "from-blue-500 to-blue-700" },
    wrench: { icon: Wrench, tone: "from-emerald-500 to-green-700" },
    tailor: { icon: Scissors, tone: "from-violet-500 to-purple-700" },
    bolt: { icon: Zap, tone: "from-orange-400 to-orange-600" },
    box: { icon: Package, tone: "from-cyan-500 to-teal-700" }
  };
  return visuals[job.iconKey] || { icon: BriefcaseBusiness, tone: job.visualTone || "from-blue-500 to-blue-700" };
}

function getDemoMatchesForJob(job) {
  if (!job) return [];
  const skill = String(job.skillSector || job.title || "").toLowerCase();
  const preferred = {
    "domestic worker": "Domestic Worker",
    housekeeping: "Domestic Worker",
    plumber: "Plumber",
    tailor: "Tailor",
    electrician: "Electrician",
    warehouse: "Driver",
    driver: "Driver"
  };
  const matchingSkill = Object.entries(preferred).find(([key]) => skill.includes(key))?.[1] || job.skillSector;
  return demoProfiles
    .filter((profile) => profile.skill === matchingSkill)
    .map((profile) => ({
      workerProfileId: profile.workerId,
      workerId: profile.workerId,
      name: profile.name,
      primarySkill: profile.skill,
      city: profile.city,
      experience: `${profile.experience} yrs exp`,
      photoUrl: profile.photoUrl,
      avatar: profile.avatar,
      eligible: true,
      eligibilityReason: "Consent ready",
      match: {
        score: profile.jobMatch,
        explanation: `${profile.name} matches ${job.title} through verified ${profile.skill.toLowerCase()} experience, consented profile access and immediate placement readiness.`
      }
    }));
}

const pipelineMetricCards = [
  {
    key: "activeRecommendations",
    label: "Active Recommendations",
    value: "activeRecommendations",
    detail: "↑ 12% from last month",
    icon: Users,
    accent: "border-violet-200 bg-violet-50/45 text-violet-700",
    iconTone: "bg-violet-100 text-violet-700",
    border: "border-l-violet-500"
  },
  {
    key: "interviewsScheduled",
    label: "Interviews",
    value: "interviewsScheduled",
    detail: "↑ 8% from last month",
    icon: CalendarClock,
    accent: "border-blue-200 bg-blue-50/45 text-blue-700",
    iconTone: "bg-blue-100 text-blue-700",
    border: "border-l-blue-500"
  },
  {
    key: "workersSelected",
    label: "Selected",
    value: "workersSelected",
    detail: "↑ 5% from last month",
    icon: UserCheck,
    accent: "border-green-200 bg-green-50/45 text-green-700",
    iconTone: "bg-green-100 text-green-700",
    border: "border-l-green-500"
  },
  {
    key: "workersJoined",
    label: "Joined",
    value: "workersJoined",
    detail: "↑ 10% from last month",
    icon: CheckCircle2,
    accent: "border-teal-200 bg-teal-50/45 text-teal-700",
    iconTone: "bg-teal-100 text-teal-700",
    border: "border-l-teal-500"
  },
  {
    key: "followUpsDue",
    label: "Follow-ups Due",
    value: "followUpsDue",
    detail: "Pending actions",
    icon: Clock3,
    accent: "border-orange-200 bg-orange-50/45 text-orange-700",
    iconTone: "bg-orange-100 text-orange-700",
    border: "border-l-orange-500"
  }
];

const pipelineStages = [
  {
    key: "worker_consent_pending",
    label: "Consent Pending",
    empty: "Workers appear here when consent is pending.",
    icon: ClipboardList,
    countTone: "text-orange-700 bg-white",
    shell: "border-amber-200 bg-gradient-to-b from-amber-50/80 to-white",
    head: "border-amber-200 bg-amber-50 text-amber-800",
    art: "from-amber-100 to-orange-50 text-orange-600"
  },
  {
    key: "submitted",
    label: "Recommended",
    empty: "AI-recommended candidates will appear here.",
    icon: Sparkles,
    countTone: "text-blue-700 bg-white",
    shell: "border-blue-200 bg-gradient-to-b from-blue-50/80 to-white",
    head: "border-blue-200 bg-blue-50 text-blue-800",
    art: "from-blue-100 to-sky-50 text-blue-600"
  },
  {
    key: "employer_viewed",
    label: "Employer Viewed",
    empty: "Employers will appear here after viewing profiles.",
    icon: Eye,
    countTone: "text-violet-700 bg-white",
    shell: "border-violet-200 bg-gradient-to-b from-violet-50/80 to-white",
    head: "border-violet-200 bg-violet-50 text-violet-800",
    art: "from-violet-100 to-purple-50 text-violet-600"
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    empty: "Shortlisted candidates will appear here.",
    icon: Trophy,
    countTone: "text-pink-700 bg-white",
    shell: "border-pink-200 bg-gradient-to-b from-pink-50/80 to-white",
    head: "border-pink-200 bg-pink-50 text-pink-800",
    art: "from-pink-100 to-rose-50 text-pink-600"
  },
  {
    key: "interview_requested",
    label: "Interview Requested",
    empty: "Interview requests will appear here.",
    icon: CalendarClock,
    countTone: "text-indigo-700 bg-white",
    shell: "border-indigo-200 bg-gradient-to-b from-indigo-50/80 to-white",
    head: "border-indigo-200 bg-indigo-50 text-indigo-800",
    art: "from-indigo-100 to-violet-50 text-indigo-600"
  },
  {
    key: "interview_scheduled",
    label: "Interview Scheduled",
    empty: "Scheduled interviews will appear here.",
    icon: CalendarDays,
    countTone: "text-green-700 bg-white",
    shell: "border-green-200 bg-gradient-to-b from-green-50/80 to-white",
    head: "border-green-200 bg-green-50 text-green-800",
    art: "from-green-100 to-emerald-50 text-green-600"
  },
  {
    key: "follow_up",
    label: "Follow-ups Due",
    empty: "Retention follow-ups will appear here.",
    icon: Clock3,
    countTone: "text-orange-700 bg-white",
    shell: "border-orange-200 bg-gradient-to-b from-orange-50/80 to-white",
    head: "border-orange-200 bg-orange-50 text-orange-800",
    art: "from-orange-100 to-amber-50 text-orange-600"
  }
];

function PipelineMetricCard({ config, value }) {
  const Icon = config.icon;
  return (
    <article className={`min-h-[92px] rounded-2xl border border-l-4 ${config.border} ${config.accent} p-4 shadow-[0_12px_34px_rgba(15,23,42,0.045)]`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${config.iconTone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-3xl font-black leading-none text-slate-950">{value || 0}</p>
          <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.08em] text-slate-700">{config.label}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{config.detail}</p>
        </div>
      </div>
    </article>
  );
}

function usePlacementData(organizationId) {
  const [data, setData] = useState({ jobs: [], recommendations: [], placements: [], interviews: [], followUps: [], employers: [], stats: null, loading: true });

  const refresh = useCallback(async () => {
    if (!organizationId) return;
    setData((current) => ({ ...current, loading: true }));
    const [jobs, recommendations, placements, interviews, followUps, employers, stats] = await Promise.all([
      database.getNgoJobOpportunities(organizationId),
      database.getOrganizationRecommendations(organizationId),
      database.getOrganizationPlacements(organizationId),
      database.getOrganizationInterviews(organizationId),
      database.getPlacementFollowUps(organizationId),
      database.getOrganizationEmployers(organizationId),
      database.getPlacementDashboardStats(organizationId)
    ]);
    setData({ jobs, recommendations, placements, interviews, followUps, employers, stats, loading: false });
  }, [organizationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...data, refresh };
}

function JobCard({ job, navigateTo }) {
  const visual = getJobVisual(job);
  const Icon = visual.icon;
  const openCount = Math.max(0, Number(job.openPositions || 0) - Number(job.filledPositions || 0));
  const handleDetails = () => {
    navigateTo(`/ngo/jobs/${encodeURIComponent(job.id)}`);
  };
  const handleRecommend = () => {
    navigateTo(`/ngo/jobs/${encodeURIComponent(job.id)}/recommend`);
  };
  return (
    <Card className="group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_22px_60px_rgba(37,99,235,0.11)]">
      <div className="grid gap-5 lg:grid-cols-[76px_minmax(0,1fr)_260px] lg:items-center">
        <span className={`grid h-[76px] w-[76px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${job.visualTone || visual.tone} text-white shadow-[0_16px_34px_rgba(37,99,235,0.20)]`}>
          <Icon className="h-9 w-9" />
        </span>
        <div className="min-w-0 pr-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black leading-tight text-slate-950">{job.title}</h3>
            <Badge tone={job.verificationStatus === "verified" ? "border-green-100 bg-green-50 text-green-700" : "border-amber-100 bg-amber-50 text-amber-700"} icon={BadgeCheck}>
              Verified employer
            </Badge>
            <Badge tone={job.status === "open" ? "border-green-100 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-600"}>{titleCase(job.status)}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" />{job.employerName}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{job.locationCity || "Location not set"}</span>
            <span className="inline-flex items-center gap-1.5"><IndianRupee className="h-4 w-4" />{formatCurrency(job.salaryMin, job.salaryMax, job.salaryPeriod)}</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{job.description || "Verified opportunity ready for matched worker recommendations."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[job.skillSector, ...job.requiredSkills.slice(0, 3)].filter(Boolean).map((skill) => <Badge key={skill}>{skill}</Badge>)}
            <Badge>{openCount} {openCount === 1 ? "open position" : "open positions"}</Badge>
            <Badge>{job.minimumExperienceYears || 0}+ yrs exp</Badge>
            <Badge>Deadline {formatDate(job.applicationDeadline)}</Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-3">
          <button type="button" aria-label={`Save ${job.title}`} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-blue-50 hover:text-blue-700">
            <Bookmark className="h-5 w-5" />
          </button>
          <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={handleDetails} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
            View details
          </button>
          <button type="button" onClick={handleRecommend} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-blue-700">
            <Send className="h-4 w-4" />
            Recommend workers
          </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function NgoJobOpportunities({ organization, membership, navigateTo, isDemoMode = false }) {
  const { jobs, stats, loading } = usePlacementData(organization?.id);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("open");
  const [skill, setSkill] = useState("all");
  const [employer, setEmployer] = useState("all");
  const [city, setCity] = useState("all");
  const [experience, setExperience] = useState("all");
  const [salaryRange, setSalaryRange] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const canManage = isDemoMode || hasNgoPermission(membership, NGO_PERMISSIONS.manageEmployerConnections);
  const demoJobs = useMemo(() => isDemoMode ? buildDemoJobOpportunities() : [], [isDemoMode]);
  const pageJobs = isDemoMode ? demoJobs : jobs;
  const pageStats = isDemoMode
    ? {
      openOpportunities: demoJobs.length,
      verifiedEmployers: new Set(demoJobs.map((job) => job.employerProfileId)).size,
      totalOpenPositions: demoJobs.reduce((sum, job) => sum + Math.max(0, job.openPositions - job.filledPositions), 0),
      recommendationsSent: demoJobs.length,
      interviewsScheduled: 1,
      workersJoined: 1
    }
    : stats;
  const skills = useMemo(() => Array.from(new Set(pageJobs.flatMap((job) => [job.skillSector, ...(job.requiredSkills || [])]).filter(Boolean))), [pageJobs]);
  const employers = useMemo(() => Array.from(new Set(pageJobs.map((job) => job.employerName).filter(Boolean))), [pageJobs]);
  const cities = useMemo(() => Array.from(new Set(pageJobs.map((job) => job.locationCity).filter(Boolean))), [pageJobs]);

  const filteredJobs = useMemo(() => pageJobs.filter((job) => {
    const searchable = [job.title, job.employerName, job.skillSector, job.locationCity, ...(job.requiredSkills || [])].join(" ").toLowerCase();
    const minExp = Number(job.minimumExperienceYears || 0);
    const salaryMax = Number(job.salaryMax || job.salaryMin || 0);
    const matchesExperience = experience === "all"
      || (experience === "0-2" && minExp <= 2)
      || (experience === "3-4" && minExp >= 3 && minExp <= 4)
      || (experience === "5+" && minExp >= 5);
    const matchesSalary = salaryRange === "all"
      || (salaryRange === "under-20" && salaryMax < 20000)
      || (salaryRange === "20-30" && salaryMax >= 20000 && salaryMax <= 30000)
      || (salaryRange === "30+" && salaryMax > 30000);
    return (!query || searchable.includes(query.toLowerCase()))
      && (!status || job.status === status)
      && (skill === "all" || searchable.includes(skill.toLowerCase()))
      && (employer === "all" || job.employerName === employer)
      && (city === "all" || job.locationCity === city)
      && matchesExperience
      && matchesSalary;
  }), [city, employer, experience, pageJobs, query, salaryRange, skill, status]);
  const metricCards = [
    { icon: BriefcaseBusiness, value: pageStats?.openOpportunities || 0, label: "Open Opportunities", trend: "↑ 25% from last month", tone: { border: "border-blue-200", iconBg: "bg-blue-50", iconText: "text-blue-700" } },
    { icon: ShieldCheck, value: pageStats?.verifiedEmployers || 0, label: "Verified Employers", trend: "↑ 33% from last month", tone: { border: "border-green-200", iconBg: "bg-green-50", iconText: "text-green-700" } },
    { icon: Users, value: pageStats?.totalOpenPositions || 0, label: "Open Positions", trend: "↑ 18% from last month", tone: { border: "border-violet-200", iconBg: "bg-violet-50", iconText: "text-violet-700" } },
    { icon: Sparkles, value: pageStats?.recommendationsSent || 0, label: "Recommendations", trend: "↑ 12% from last month", tone: { border: "border-cyan-200", iconBg: "bg-cyan-50", iconText: "text-cyan-700" } },
    { icon: CalendarClock, value: pageStats?.interviewsScheduled || 0, label: "Interviews", trend: "↑ 10% from last month", tone: { border: "border-indigo-200", iconBg: "bg-indigo-50", iconText: "text-indigo-700" } },
    { icon: UserCheck, value: pageStats?.workersJoined || 0, label: "Joined", trend: "↑ 20% from last month", tone: { border: "border-orange-200", iconBg: "bg-orange-50", iconText: "text-orange-700" } }
  ];
  const clearFilters = () => {
    setQuery("");
    setStatus("open");
    setSkill("all");
    setEmployer("all");
    setCity("all");
    setExperience("all");
    setSalaryRange("all");
  };

  return (
    <div className="mx-auto flex h-full max-w-[1500px] flex-col gap-5 overflow-hidden bg-[#f8fbff] text-slate-950">
      <PageHeader
        title="Job Opportunities"
        description="Discover verified employer openings, match linked workers, and recommend only with worker consent."
        action={canManage && (
          <button type="button" onClick={() => navigateTo("/ngo/jobs/new")} className="inline-flex min-h-12 items-center gap-2 rounded-[14px] bg-blue-600 px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)] transition hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Opportunity
          </button>
        )}
      />
      <div className="shrink-0 rounded-2xl border border-blue-100 bg-blue-50/80 px-5 py-4 text-sm font-black leading-6 text-blue-800">
        <ShieldCheck className="mr-2 inline h-4 w-4 align-[-3px]" />
        RozgaarAI helps organizations connect workers with employers while keeping worker consent, data ownership and verified credentials at the centre of every placement.
      </div>
      <div className="grid shrink-0 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metricCards.map((metric) => <EmployerMetricCard key={metric.label} {...metric} />)}
      </div>
      <Card className="shrink-0 p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_112px_150px_150px_130px_150px_auto] xl:items-center">
          <SearchBar value={query} onChange={setQuery} placeholder="Search jobs by skill, employer, location..." />
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-100">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="paused">Paused</option>
            <option value="filled">Filled</option>
            <option value="closed">Closed</option>
          </select>
          <select value={skill} onChange={(event) => setSkill(event.target.value)} className="min-h-11 rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-100">
            <option value="all">Skill filter</option>
            {skills.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={employer} onChange={(event) => setEmployer(event.target.value)} className="min-h-11 rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-100">
            <option value="all">Employer</option>
            {employers.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={city} onChange={(event) => setCity(event.target.value)} className="min-h-11 rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-100">
            <option value="all">City</option>
            {cities.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={experience} onChange={(event) => setExperience(event.target.value)} className="min-h-11 rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-100">
            <option value="all">Experience</option>
            <option value="0-2">0-2 years</option>
            <option value="3-4">3-4 years</option>
            <option value="5+">5+ years</option>
          </select>
          <div className="flex flex-col items-stretch justify-end gap-2 sm:flex-row sm:items-center">
          <select value={salaryRange} onChange={(event) => setSalaryRange(event.target.value)} className="min-h-11 w-full rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 sm:w-[142px]">
            <option value="all">Salary</option>
            <option value="under-20">Under ₹20k</option>
            <option value="20-30">₹20k-₹30k</option>
            <option value="30+">₹30k+</option>
          </select>
          <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            Clear
          </button>
          <div className="flex rounded-[14px] border border-slate-200 bg-white p-1">
            <button type="button" aria-label="Card view" onClick={() => setViewMode("cards")} className={`grid h-9 w-9 place-items-center rounded-lg ${viewMode === "cards" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}><LayoutGrid className="h-4 w-4" /></button>
            <button type="button" aria-label="Table view" onClick={() => setViewMode("table")} className={`grid h-9 w-9 place-items-center rounded-lg ${viewMode === "table" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}><Table2 className="h-4 w-4" /></button>
          </div>
          </div>
        </div>
      </Card>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {loading && !isDemoMode && <Card className="p-6 text-sm font-bold text-slate-500">Loading opportunities...</Card>}
        {(!loading || isDemoMode) && filteredJobs.length === 0 && (
          <Card className="p-8 text-center">
            <BriefcaseBusiness className="mx-auto h-10 w-10 text-blue-600" />
            <h3 className="mt-3 text-xl font-black text-slate-950">No job opportunities yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600">Add verified employer openings or wait for real employer jobs to be connected. No fake non-demo jobs are shown.</p>
          </Card>
        )}
        {viewMode === "cards" && filteredJobs.map((job) => <JobCard key={job.id} job={job} navigateTo={navigateTo} isDemoMode={isDemoMode} />)}
        {viewMode === "table" && Boolean(filteredJobs.length) && (
          <Card className="overflow-hidden">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Employer</th>
                  <th className="px-5 py-4">City</th>
                  <th className="px-5 py-4">Salary</th>
                  <th className="px-5 py-4">Openings</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="border-t border-slate-100 transition hover:bg-blue-50/40">
                    <td className="px-5 py-4 text-sm font-black text-slate-950">{job.title}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">{job.employerName}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">{job.locationCity || "Not set"}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-600">{formatCurrency(job.salaryMin, job.salaryMax, job.salaryPeriod)}</td>
                    <td className="px-5 py-4 text-sm font-black text-blue-700">{Math.max(0, Number(job.openPositions || 0) - Number(job.filledPositions || 0))}</td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" onClick={() => navigateTo(`/ngo/jobs/${encodeURIComponent(job.id)}`)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:text-blue-700">View details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}

export function NgoJobOpportunityForm({ organization, account, navigateTo, setStatusMessage }) {
  const [form, setForm] = useState({
    employerName: "",
    employerProfileId: "",
    title: "",
    description: "",
    skillSector: "",
    requiredSkills: "",
    locationCity: "",
    locationState: "",
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "month",
    openPositions: 1,
    minimumExperienceYears: 0,
    applicationDeadline: "",
    verificationStatus: "pending",
    status: "open"
  });

  async function save() {
    const employerProfileId = form.employerProfileId || form.employerName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await database.createNgoJobOpportunity({ ...form, organizationId: organization.id, employerProfileId }, account);
    setStatusMessage?.("Job opportunity saved.");
    navigateTo("/ngo/jobs");
  }

  const inputClass = "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

  return (
    <div className="mx-auto max-w-[960px] space-y-5">
      <button type="button" onClick={() => navigateTo("/ngo/jobs")} className="inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to jobs</button>
      <PageHeader title="Add Job Opportunity" description="Record a real employer opening that your organization is allowed to use for worker recommendations." />
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Employer name</span><input className={inputClass} value={form.employerName} onChange={(event) => setForm({ ...form, employerName: event.target.value })} /></label>
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Employer ID</span><input className={inputClass} value={form.employerProfileId} onChange={(event) => setForm({ ...form, employerProfileId: event.target.value })} placeholder="Optional internal reference" /></label>
          <label className="space-y-1.5 md:col-span-2"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Job title</span><input className={inputClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label className="space-y-1.5 md:col-span-2"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Description</span><textarea className={`${inputClass} min-h-28 py-3`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Skill sector</span><input className={inputClass} value={form.skillSector} onChange={(event) => setForm({ ...form, skillSector: event.target.value })} /></label>
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Required skills</span><input className={inputClass} value={form.requiredSkills} onChange={(event) => setForm({ ...form, requiredSkills: event.target.value })} placeholder="Comma separated" /></label>
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">City</span><input className={inputClass} value={form.locationCity} onChange={(event) => setForm({ ...form, locationCity: event.target.value })} /></label>
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">State</span><input className={inputClass} value={form.locationState} onChange={(event) => setForm({ ...form, locationState: event.target.value })} /></label>
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Salary min</span><input type="number" className={inputClass} value={form.salaryMin} onChange={(event) => setForm({ ...form, salaryMin: event.target.value })} /></label>
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Salary max</span><input type="number" className={inputClass} value={form.salaryMax} onChange={(event) => setForm({ ...form, salaryMax: event.target.value })} /></label>
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Open positions</span><input type="number" className={inputClass} value={form.openPositions} onChange={(event) => setForm({ ...form, openPositions: event.target.value })} /></label>
          <label className="space-y-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Deadline</span><input type="date" className={inputClass} value={form.applicationDeadline} onChange={(event) => setForm({ ...form, applicationDeadline: event.target.value })} /></label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => navigateTo("/ngo/jobs")} className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700">Cancel</button>
          <button type="button" onClick={save} className="min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-black text-white">Save Opportunity</button>
        </div>
      </Card>
    </div>
  );
}

export function NgoJobDetail({ organization, routeInfo, navigateTo, isDemoMode = false }) {
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    async function load() {
      const currentJob = isDemoMode ? buildDemoJobOpportunities().find((item) => item.id === routeInfo.jobId) : await database.getNgoJobById(routeInfo.jobId);
      setJob(currentJob);
      setMatches(isDemoMode ? getDemoMatchesForJob(currentJob) : await database.getMatchingWorkersForJob({ organizationId: organization.id, jobId: routeInfo.jobId }));
    }
    load();
  }, [isDemoMode, organization?.id, routeInfo.jobId]);

  if (!job) return <Card className="mx-auto max-w-[1440px] p-8 text-sm font-bold text-slate-500">Job not found.</Card>;

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <button type="button" onClick={() => navigateTo("/ngo/jobs")} className="inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to jobs</button>
      <PageHeader
        title={job.title}
        description={`${job.employerName} • ${job.locationCity || "Location not set"} • ${formatCurrency(job.salaryMin, job.salaryMax, job.salaryPeriod)}`}
        action={<button type="button" onClick={() => navigateTo(`/ngo/jobs/${encodeURIComponent(job.id)}/recommend`)} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-blue-600 px-5 text-sm font-black text-white"><Send className="h-4 w-4" />Recommend Workers</button>}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <div className="flex flex-wrap gap-2">
            <Badge tone="border-blue-100 bg-blue-50 text-blue-700">{titleCase(job.employmentType)}</Badge>
            <Badge>{titleCase(job.shiftType)} shift</Badge>
            <Badge>{job.openPositions - job.filledPositions} positions open</Badge>
            <Badge>Deadline {formatDate(job.applicationDeadline)}</Badge>
          </div>
          <h3 className="mt-6 text-lg font-black text-slate-950">Job description</h3>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">{job.description || "Employer has not added a detailed description yet."}</p>
          <h3 className="mt-6 text-lg font-black text-slate-950">Required skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">{job.requiredSkills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-black text-slate-950">Matching workers</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{matches.length} linked workers reviewed by transparent rules.</p>
          <div className="mt-4 space-y-3">
            {matches.slice(0, 5).map((worker) => (
              <div key={worker.workerProfileId} className="rounded-2xl border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{worker.name}</p>
                    <p className="truncate text-xs font-bold text-slate-500">{worker.primarySkill} • {worker.city}</p>
                  </div>
                  <Badge tone={worker.match.score >= 85 ? "border-green-100 bg-green-50 text-green-700" : "border-amber-100 bg-amber-50 text-amber-700"}>{worker.match.score}%</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">{worker.match.explanation}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function NgoRecommendWorkers({ organization, account, routeInfo, navigateTo, setStatusMessage, isDemoMode = false }) {
  const [workers, setWorkers] = useState([]);
  const [job, setJob] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    if (isDemoMode) {
      const currentJob = buildDemoJobOpportunities().find((item) => item.id === routeInfo.jobId);
      setJob(currentJob);
      setWorkers(getDemoMatchesForJob(currentJob));
      return;
    }
    const [currentJob, matches] = await Promise.all([
      database.getNgoJobById(routeInfo.jobId),
      database.getMatchingWorkersForJob({ organizationId: organization.id, jobId: routeInfo.jobId })
    ]);
    setJob(currentJob);
    setWorkers(matches);
  }, [isDemoMode, organization?.id, routeInfo.jobId]);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    if (!selected.size) {
      setStatusMessage?.("Select at least one eligible worker.");
      return;
    }
    if (isDemoMode) {
      setStatusMessage?.("Demo recommendation prepared. No data was written to the real NGO workspace.");
      navigateTo("/ngo/pipeline");
      return;
    }
    for (const workerProfileId of selected) {
      await database.createWorkerJobRecommendation({ organizationId: organization.id, jobId: routeInfo.jobId, workerProfileId, organizationNote: note, account });
    }
    setStatusMessage?.("Worker recommendation submitted with controlled profile sharing.");
    navigateTo("/ngo/pipeline");
  }

  if (!job) return <Card className="mx-auto max-w-[1440px] p-8 text-sm font-bold text-slate-500">Job not found.</Card>;

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <button type="button" onClick={() => navigateTo(`/ngo/jobs/${encodeURIComponent(routeInfo.jobId)}`)} className="inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to job</button>
      <PageHeader title="Recommend Workers" description={`Select consented linked workers for ${job.title}. Only controlled profile fields are shared with ${job.employerName}.`} />
      <Card className="p-4">
        <p className="text-sm font-black text-slate-950">Employer-visible recommendation note</p>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why are these workers suitable? Mention verified skills, training, availability and interview support needed." className="mt-2 min-h-24 w-full rounded-[14px] border border-slate-200 p-3 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-100" />
      </Card>
      <div className="grid gap-3">
        {workers.map((worker) => {
          const checked = selected.has(worker.workerProfileId);
          return (
            <Card key={worker.workerProfileId} className={`p-4 transition ${checked ? "border-blue-300 ring-4 ring-blue-100" : ""}`}>
              <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <label className="flex items-center gap-3">
                  <input disabled={!worker.eligible} checked={checked} onChange={(event) => {
                    const next = new Set(selected);
                    if (event.target.checked) next.add(worker.workerProfileId);
                    else next.delete(worker.workerProfileId);
                    setSelected(next);
                  }} type="checkbox" className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-100" />
                  <span className="h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-blue-50">
                    {worker.photoUrl ? <img src={worker.photoUrl} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-sm font-black text-blue-700">{worker.avatar}</span>}
                  </span>
                </label>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black text-slate-950">{worker.name}</h3>
                    <Badge tone={worker.eligible ? "border-green-100 bg-green-50 text-green-700" : "border-amber-100 bg-amber-50 text-amber-700"}>{worker.eligibilityReason}</Badge>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-500">{worker.workerId} • {worker.primarySkill} • {worker.city} • {worker.experience || "Experience not set"}</p>
                  <div className="mt-3 rounded-2xl border border-violet-100 bg-violet-50 p-3">
                    <p className="text-xs font-black text-violet-700">Recommendation aid</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{worker.match.explanation}</p>
                  </div>
                </div>
                <div className="grid h-20 w-20 place-items-center rounded-full border-[6px] border-green-500 bg-white text-center shadow-sm">
                  <span className="text-xl font-black text-slate-950">{worker.match.score}%</span>
                  <span className="-mt-5 text-[10px] font-black text-green-700">Match</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="sticky bottom-4 flex justify-end">
        <button type="button" onClick={submit} className="inline-flex min-h-12 items-center gap-2 rounded-[14px] bg-blue-600 px-6 text-sm font-black text-white shadow-[0_18px_42px_rgba(37,99,235,0.25)] transition hover:bg-blue-700">
          <Send className="h-4 w-4" />
          Submit Recommendations ({selected.size})
        </button>
      </div>
    </div>
  );
}

function PlacementCard({ placement, job, worker, recommendation, navigateTo, onMove, stageConfig }) {
  const matchScore = recommendation?.matchScore || 0;
  const stageLabel = stageLabels[placement.placementStatus] || titleCase(placement.placementStatus);
  const workerName = worker?.name || recommendation?.profileSnapshot?.name || "Worker";
  const skill = worker?.primarySkill || recommendation?.profileSnapshot?.primarySkill || "Worker";
  const city = worker?.city || recommendation?.profileSnapshot?.city || "City";
  const photoUrl = worker?.photoUrl || recommendation?.profileSnapshot?.photoUrl;
  const initials = workerName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const isFollowUp = placement.placementStatus === "follow_up";
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_14px_34px_rgba(15,23,42,0.075)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_20px_44px_rgba(15,23,42,0.12)]">
      <div className="flex items-start gap-3">
        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-blue-50">
          {photoUrl ? <img src={photoUrl} alt={`${workerName} profile`} className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-xs font-black text-blue-700">{initials}</span>}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">{workerName}</p>
              <p className="mt-0.5 truncate text-[11px] font-bold text-slate-500">{skill} • {city}</p>
            </div>
            <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-black text-green-700">{matchScore}%</span>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-[11px] font-bold leading-5 text-slate-600">
        <p className="line-clamp-2">{job?.title || "Job"} at {job?.employerName || "Employer"}</p>
        <p className="truncate">{job?.employerName || "Verified Employer"}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`rounded-lg border px-2.5 py-1 text-[11px] font-black ${stageTone[placement.placementStatus] || stageTone.submitted}`}>{stageLabel}</span>
        {isFollowUp && <span className="rounded-lg border border-orange-100 bg-orange-50 px-2.5 py-1 text-[11px] font-black text-orange-700">Due in 3 days</span>}
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-black text-slate-600">
          <span>Match Score</span>
          <span>{matchScore}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.max(0, Math.min(100, matchScore))}%` }} />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button type="button" onClick={() => navigateTo(`/ngo/placements/${encodeURIComponent(placement.id)}`)} className="min-h-9 rounded-xl border border-blue-200 bg-white px-3 text-xs font-black text-blue-700 transition hover:bg-blue-50">View Placement</button>
        <select value="" onChange={(event) => event.target.value && onMove(placement, event.target.value)} className="min-h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 outline-none transition hover:bg-slate-50 focus:border-blue-300 focus:ring-4 focus:ring-blue-100" aria-label={`Move ${workerName} from ${stageConfig?.label || stageLabel}`}>
          <option value="">Move stage</option>
          {Object.entries(stageLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
    </article>
  );
}

function EmptyStage({ stage }) {
  const Icon = stage.icon;
  return (
    <div className="grid h-full min-h-[260px] place-items-center rounded-2xl border border-dashed border-current/20 bg-white/55 p-4 text-center">
      <div>
        <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${stage.art}`}>
          <Icon className="h-7 w-7" />
        </span>
        <p className="mt-5 text-xs font-black text-slate-600">No candidates in this stage</p>
        <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{stage.empty}</p>
      </div>
    </div>
  );
}

export function NgoPlacementPipeline({ organization, account, navigateTo, setStatusMessage, isDemoMode = false }) {
  const { jobs, recommendations, placements, refresh, stats } = usePlacementData(organization?.id);
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    database.getOrganizationWorkers(organization.id).then(setWorkers);
  }, [organization?.id]);

  async function movePlacement(placement, nextStatus) {
    if (isDemoMode) {
      setStatusMessage?.("Demo placement movement is illustrative and does not write to the real NGO workspace.");
      return;
    }
    const reason = ["not_selected", "withdrawn", "not_joined", "left_job"].includes(nextStatus) ? window.prompt("Add a reason for this status change") : "";
    if (reason === null) return;
    try {
      await database.updatePlacementStatus({ placementId: placement.id, organizationId: organization.id, newStatus: nextStatus, reason, account });
      await refresh();
      setStatusMessage?.("Placement stage updated and logged.");
    } catch (error) {
      setStatusMessage?.(error.message);
    }
  }

  const jobsById = new Map(jobs.map((job) => [job.id, job]));
  const workersById = new Map(workers.map((worker) => [worker.workerProfileId, worker]));
  const recommendationsById = new Map(recommendations.map((recommendation) => [recommendation.id, recommendation]));
  const demoRows = useMemo(() => isDemoMode ? buildDemoPlacementRows() : [], [isDemoMode]);
  const boardPlacements = isDemoMode ? demoRows.map((row) => row.placement) : placements;
  const boardJobsById = isDemoMode ? new Map(demoRows.map((row) => [row.job.id, row.job])) : jobsById;
  const boardWorkersById = isDemoMode ? new Map(demoRows.map((row) => [row.worker.workerProfileId, row.worker])) : workersById;
  const boardRecommendationsById = isDemoMode ? new Map(demoRows.map((row) => [row.recommendation.id, row.recommendation])) : recommendationsById;
  const boardStats = isDemoMode
    ? {
      activeRecommendations: 4,
      interviewsScheduled: 1,
      workersSelected: 1,
      workersJoined: 1,
      followUpsDue: 1
    }
    : stats;

  return (
    <div className="mx-auto flex h-full max-w-[1500px] flex-col gap-4 overflow-hidden bg-[#f8fbff] text-slate-950">
      <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">NGO / Foundation Workspace</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <ClipboardList className="h-5 w-5" />
            </span>
            <h2 className="truncate text-3xl font-black leading-tight text-slate-950">Placement Pipeline</h2>
          </div>
          <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-600">Track consent, recommendations, employer responses, interviews, selection, joining and retention follow-ups.</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50">
            <CalendarDays className="h-4 w-4" />
            This Month
          </button>
          <button type="button" onClick={() => setStatusMessage?.("Demo report export is prepared locally for review.")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid shrink-0 gap-3 md:grid-cols-5">
        {pipelineMetricCards.map((metric) => <PipelineMetricCard key={metric.key} config={metric} value={boardStats?.[metric.value] || 0} />)}
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto pb-1">
        <div className="flex min-h-full min-w-[1880px] gap-3">
          {pipelineStages.map((stage) => {
            const rows = boardPlacements.filter((placement) => placement.placementStatus === stage.key || (stage.key === "submitted" && placement.placementStatus === "recommended"));
            return (
              <section key={stage.key} className={`flex w-[268px] shrink-0 flex-col overflow-hidden rounded-2xl border ${stage.shell}`}>
                <div className={`border-b px-4 py-3 ${stage.head}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-black">{stage.label}</h3>
                    <span className={`grid h-6 min-w-6 place-items-center rounded-full px-2 text-xs font-black ${stage.countTone}`}>{rows.length}</span>
                  </div>
                  <p className="mt-1 text-xs font-bold opacity-90">Audit logged movement</p>
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                  {rows.map((placement) => (
                    <PlacementCard
                      key={placement.id}
                      placement={placement}
                      job={boardJobsById.get(placement.jobId)}
                      worker={boardWorkersById.get(placement.workerProfileId)}
                      recommendation={boardRecommendationsById.get(placement.recommendationId)}
                      navigateTo={navigateTo}
                      onMove={movePlacement}
                      stageConfig={stage}
                    />
                  ))}
                  {!rows.length && <EmptyStage stage={stage} />}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function NgoPlacementDetail({ organization, routeInfo, navigateTo }) {
  const [state, setState] = useState({ placement: null, job: null, worker: null, history: [], activity: [] });
  useEffect(() => {
    async function load() {
      const placement = await database.getPlacementById(routeInfo.placementId, organization.id);
      const [job, worker, history, activity] = await Promise.all([
        placement ? database.getNgoJobById(placement.jobId) : null,
        placement ? database.getOrganizationWorkerById(organization.id, placement.workerProfileId) : null,
        placement ? database.getPlacementStatusHistory(placement.id, organization.id) : [],
        placement ? database.getPlacementActivity({ organizationId: organization.id, placementId: placement.id }) : []
      ]);
      setState({ placement, job, worker, history, activity });
    }
    load();
  }, [organization?.id, routeInfo.placementId]);
  if (!state.placement) return <Card className="mx-auto max-w-[1440px] p-8 text-sm font-bold text-slate-500">Placement not found.</Card>;
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <button type="button" onClick={() => navigateTo("/ngo/pipeline")} className="inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to pipeline</button>
      <PageHeader title={state.worker?.name || "Placement record"} description={`${state.job?.title || "Job"} • ${state.job?.employerName || "Employer"} • ${stageLabels[state.placement.placementStatus]}`} />
      <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
        <Card className="p-6">
          <h3 className="text-lg font-black text-slate-950">Shared profile snapshot</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {["name", "workerId", "primarySkill", "city", "experience", "availability"].map((field) => (
              <div key={field} className="rounded-2xl border border-slate-100 p-3">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{titleCase(field)}</p>
                <p className="mt-1 text-sm font-black text-slate-950">{state.worker?.[field] || "Not shared"}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-bold leading-6 text-blue-800">
            Employer-visible details are separate from NGO-only notes, attendance, assessment feedback and consent history.
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-black text-slate-950">Activity history</h3>
          <div className="mt-4 space-y-3">
            {[...state.activity, ...state.history].slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-3">
                <p className="text-sm font-black text-slate-950">{item.description || `${stageLabels[item.previous_status]} to ${stageLabels[item.new_status]}`}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{formatDate(item.createdAt || item.created_at)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function NgoEmployers({ organization, navigateTo, isDemoMode = false }) {
  const { employers, stats } = usePlacementData(organization?.id);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("all");
  const [status, setStatus] = useState("all");
  const pageEmployers = isDemoMode ? demoEmployerPartners : employers;
  const derivedStats = {
    activeEmployers: isDemoMode ? 5 : (stats?.activeEmployers ?? pageEmployers.length),
    verifiedEmployers: isDemoMode ? 4 : (stats?.verifiedEmployers ?? pageEmployers.filter((employer) => employer.verificationStatus === "verified").length),
    openOpportunities: isDemoMode ? 7 : (stats?.openOpportunities ?? pageEmployers.reduce((sum, employer) => sum + getEmployerOpenings(employer), 0)),
    workersJoined: isDemoMode ? 12 : (stats?.workersJoined ?? pageEmployers.reduce((sum, employer) => sum + getEmployerPlacedCount(employer), 0))
  };
  const industries = useMemo(() => Array.from(new Set(pageEmployers.map((employer) => employer.industry).filter(Boolean))), [pageEmployers]);
  const visibleEmployers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return pageEmployers.filter((employer) => {
      const matchesQuery = !needle || [employer.employerName, employer.industry, employer.industryLabel, employer.locationCity, employer.description].some((value) => String(value || "").toLowerCase().includes(needle));
      const matchesIndustry = industry === "all" || employer.industry === industry;
      const matchesStatus = status === "all" || employer.connectionStatus === status || employer.verificationStatus === status;
      return matchesQuery && matchesIndustry && matchesStatus;
    });
  }, [industry, pageEmployers, query, status]);
  const metricCards = [
    { icon: Building2, value: derivedStats.activeEmployers, label: "Active Employers", trend: "↑ 25% from last month", tone: { border: "border-blue-200", iconBg: "bg-blue-50", iconText: "text-blue-700" } },
    { icon: ShieldCheck, value: derivedStats.verifiedEmployers, label: "Verified Employers", trend: "↑ 33% from last month", tone: { border: "border-green-200", iconBg: "bg-green-50", iconText: "text-green-700" } },
    { icon: BriefcaseBusiness, value: derivedStats.openOpportunities, label: "Open Opportunities", trend: "↑ 40% from last month", tone: { border: "border-violet-200", iconBg: "bg-violet-50", iconText: "text-violet-700" } },
    { icon: UserCheck, value: derivedStats.workersJoined, label: "Workers Joined", trend: "↑ 20% from last month", tone: { border: "border-orange-200", iconBg: "bg-orange-50", iconText: "text-orange-700" } }
  ];

  return (
    <div className="mx-auto flex h-full max-w-[1500px] flex-col gap-5 overflow-hidden bg-[#f8fbff] text-slate-950">
      <PageHeader title="Employers" description="Manage verified employer relationships, active openings, recommendations, interviews and placement outcomes." />
      <div className="grid shrink-0 gap-3 md:grid-cols-4">
        {metricCards.map((metric) => <EmployerMetricCard key={metric.label} {...metric} />)}
      </div>

      <Card className="min-h-0 flex-1 overflow-hidden p-4">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-black text-slate-950">{isDemoMode ? "Demo Employer Partners" : "Employer Partners"}</h3>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-500">{isDemoMode ? "These are demo companies available in demo mode." : "Verified employer relationships from your real workspace."}</p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="w-full lg:w-72">
              <SearchBar value={query} onChange={setQuery} placeholder="Search employers..." />
            </div>
            <select value={industry} onChange={(event) => setIndustry(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
              <option value="all">All Industries</option>
              {industries.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
            <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(37,99,235,0.22)] transition hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Add Employer
            </button>
          </div>
        </div>

        <div className="min-h-0 overflow-auto pt-4">
          <table className="w-full min-w-[1060px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-slate-50">
                {["Employer", "Industry", "Location", "Open Jobs", "Verified", "Workers Placed", "Last Activity", "Actions"].map((heading, index) => (
                  <th key={heading} className={`border-y border-slate-100 px-4 py-4 text-xs font-black text-slate-500 ${index === 0 ? "rounded-l-2xl border-l" : ""} ${index === 7 ? "rounded-r-2xl border-r text-right" : ""}`}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleEmployers.map((employer) => {
                const employerId = getEmployerKey(employer);
                const placedCount = getEmployerPlacedCount(employer);
                const openJobs = getEmployerOpenings(employer);
                return (
                  <tr key={employerId} className="group transition hover:bg-blue-50/40">
                    <td className="border-b border-slate-100 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-4">
                        <EmployerLogo employer={employer} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">{employer.employerName || "Unnamed employer"}</p>
                          <p className="mt-1 truncate text-xs font-semibold text-slate-500">{employer.description || employer.industry || "Employer details pending"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <span className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs font-black ${employer.industryTone || "bg-slate-100 text-slate-700"}`}>{employer.industryLabel || employer.industry || "General"}</span>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"><MapPin className="h-4 w-4 text-slate-400" />{employer.locationCity || "Not set"}</span>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <p className="text-center text-base font-black text-blue-700">{openJobs}</p>
                      <p className="text-center text-xs font-black text-blue-600">open</p>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-sm font-black text-emerald-700"><ShieldCheck className="h-4 w-4" />{employer.verificationStatus === "verified" ? "Verified" : titleCase(employer.verificationStatus || "Pending")}</span>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <p className="text-center text-base font-black text-emerald-700">{placedCount}</p>
                      <p className="text-center text-xs font-black text-emerald-600">{placedCount === 1 ? "worker" : "workers"}</p>
                    </td>
                    <td className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-600">{employer.lastActivity || formatDate(employer.updatedAt)}</td>
                    <td className="border-b border-slate-100 px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button type="button" onClick={() => navigateTo(`/ngo/employers/${encodeURIComponent(employerId)}`)} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 hover:shadow-md">
                          View Details
                        </button>
                        <button type="button" aria-label={`More actions for ${employer.employerName}`} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:text-blue-700">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visibleEmployers.length && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm font-bold text-slate-500">
              {isDemoMode ? "No demo employers match the current filters." : "No employer connections yet. Add verified employer relationships when real data is available."}
            </div>
          )}
        </div>
        <p className="mt-4 text-sm font-bold text-slate-500">Showing {visibleEmployers.length ? 1 : 0} to {visibleEmployers.length} of {pageEmployers.length} employers</p>
      </Card>
    </div>
  );
}

export function NgoEmployerDetail({ organization, routeInfo, navigateTo, isDemoMode = false }) {
  const { jobs, recommendations, placements, employers } = usePlacementData(organization?.id);
  const pageEmployers = isDemoMode ? demoEmployerPartners : employers;
  const pageJobs = isDemoMode ? buildDemoJobOpportunities() : jobs;
  const pagePlacements = isDemoMode ? buildDemoPlacementRows().map((row) => row.placement) : placements;
  const employer = pageEmployers.find((item) => item.employerProfileId === routeInfo.employerId || item.id === routeInfo.employerId);
  if (!employer) return <Card className="mx-auto max-w-[1440px] p-8 text-sm font-bold text-slate-500">Employer not found.</Card>;
  const employerJobs = pageJobs.filter((job) => job.employerProfileId === employer.employerProfileId);
  const jobIds = new Set(employerJobs.map((job) => job.id));
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <button type="button" onClick={() => navigateTo("/ngo/employers")} className="inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft className="h-4 w-4" /> Back to employers</button>
      <PageHeader title={employer.employerName} description={`${employer.industry || "Employer"} • ${employer.locationCity || "Location not set"} • ${titleCase(employer.connectionStatus)}`} />
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard icon={BriefcaseBusiness} label="Active jobs" value={getEmployerOpenings(employer)} />
        <MetricCard icon={Send} label="Recommendations" value={isDemoMode ? employer.recommendationsSent : recommendations.filter((item) => jobIds.has(item.jobId)).length} />
        <MetricCard icon={UserCheck} label="Shortlisted" value={employer.workersShortlisted} />
        <MetricCard icon={CheckCircle2} label="Hired" value={getEmployerPlacedCount(employer)} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-black text-slate-950">Active jobs</h3>
          <div className="mt-4 space-y-3">{employerJobs.map((job) => <JobCard key={job.id} job={job} navigateTo={navigateTo} />)}</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-black text-slate-950">Placement history</h3>
          <div className="mt-4 space-y-3">{pagePlacements.filter((item) => item.employerProfileId === employer.employerProfileId).map((placement) => <div key={placement.id} className="rounded-2xl border border-slate-100 p-3 text-sm font-bold text-slate-700">{stageLabels[placement.placementStatus]} • {formatDate(placement.updatedAt)}</div>)}</div>
        </Card>
      </div>
    </div>
  );
}

export function NgoInterviews({ organization, account, setStatusMessage }) {
  const { interviews, jobs, refresh } = usePlacementData(organization?.id);
  const [form, setForm] = useState({ jobId: "", workerProfileId: "", scheduledDate: "", startTime: "", location: "" });
  const [workers, setWorkers] = useState([]);
  useEffect(() => { database.getOrganizationWorkers(organization.id).then(setWorkers); }, [organization?.id]);

  async function schedule() {
    const job = jobs.find((item) => item.id === form.jobId);
    await database.createInterview({ ...form, organizationId: organization.id, employerProfileId: job?.employerProfileId || "" }, account);
    setStatusMessage?.("Interview scheduled.");
    setForm({ jobId: "", workerProfileId: "", scheduledDate: "", startTime: "", location: "" });
    await refresh();
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Interviews" description="Schedule, confirm and track employer interviews without exposing private NGO notes." />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h3 className="text-lg font-black text-slate-950">Interview schedule</h3>
          <div className="mt-4 space-y-3">{interviews.map((interview) => <div key={interview.id} className="rounded-2xl border border-slate-100 p-4"><p className="font-black text-slate-950">{formatDate(interview.scheduledDate)} • {interview.startTime || "Time not set"}</p><p className="mt-1 text-sm font-bold text-slate-500">{titleCase(interview.interviewType)} • {titleCase(interview.status)} • {interview.location || interview.meetingLink || "Location pending"}</p></div>)}</div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-black text-slate-950">Schedule interview</h3>
          <div className="mt-4 space-y-3">
            <select value={form.workerProfileId} onChange={(event) => setForm({ ...form, workerProfileId: event.target.value })} className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold"><option value="">Select worker</option>{workers.map((worker) => <option key={worker.workerProfileId} value={worker.workerProfileId}>{worker.name}</option>)}</select>
            <select value={form.jobId} onChange={(event) => setForm({ ...form, jobId: event.target.value })} className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold"><option value="">Select job</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select>
            <input type="date" value={form.scheduledDate} onChange={(event) => setForm({ ...form, scheduledDate: event.target.value })} className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" />
            <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" />
            <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Location or meeting link" className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-bold" />
            <button type="button" onClick={schedule} className="min-h-11 w-full rounded-xl bg-blue-600 text-sm font-black text-white">Schedule Interview</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function NgoPlacementFollowUps({ organization }) {
  const { followUps } = usePlacementData(organization?.id);
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Follow-ups" description="Track joining-day, 7-day, 30-day, 90-day and custom retention support checkpoints." />
      <div className="grid gap-3">
        {followUps.map((followUp) => (
          <Card key={followUp.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-950">{titleCase(followUp.followUpType)}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">Due {formatDate(followUp.scheduledFor)} • {titleCase(followUp.status)}</p>
              </div>
              <Badge tone={followUp.issueCategory === "none" ? "border-green-100 bg-green-50 text-green-700" : "border-orange-100 bg-orange-50 text-orange-700"}>{titleCase(followUp.issueCategory)}</Badge>
            </div>
          </Card>
        ))}
        {!followUps.length && <Card className="p-8 text-center text-sm font-bold text-slate-500">No follow-ups due yet. Follow-ups appear after joined placements are recorded.</Card>}
      </div>
    </div>
  );
}

export function NgoPlacementReports({ organization }) {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => { database.getPlacementAnalytics(organization.id).then(setAnalytics); }, [organization?.id]);
  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <PageHeader title="Placement Reports" description="Measure real recommendation, interview, joining and retention outcomes. Unavailable metrics are labelled honestly." />
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard icon={Send} label="Recommendations sent" value={analytics?.recommendationsSent || 0} />
        <MetricCard icon={UserCheck} label="Shortlist rate" value={`${analytics?.recommendationToShortlistRate || 0}%`} tone="bg-violet-50 text-violet-700 border-violet-100" />
        <MetricCard icon={CalendarClock} label="Interview rate" value={`${analytics?.shortlistToInterviewRate || 0}%`} tone="bg-indigo-50 text-indigo-700 border-indigo-100" />
        <MetricCard icon={CheckCircle2} label="Joining rate" value={`${analytics?.selectionToJoiningRate || 0}%`} tone="bg-green-50 text-green-700 border-green-100" />
      </div>
      <Card className="p-6">
        <h3 className="text-lg font-black text-slate-950">Retention</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{analytics?.retention90DayLabel || "No placement records yet."}</p>
      </Card>
    </div>
  );
}
