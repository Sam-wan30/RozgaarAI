import {
  BadgeCheck,
  Archive,
  Award,
  AudioLines,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  Gauge,
  GraduationCap,
  Globe2,
  HandHeart,
  IdCard,
  Info,
  IndianRupee,
  Landmark,
  LockKeyhole,
  LogOut,
  MapPin,
  MessageSquare,
  Mic,
  Github,
  Instagram,
  Linkedin,
  PlayCircle,
  Quote,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Volume2,
  WalletCards,
  Youtube,
  UserRound,
  Menu,
  X,
  Cloud,
  Columns3,
  Copy,
  Edit3,
  PanelLeft,
  Pause,
  Phone,
  Plus,
  Settings,
  SlidersHorizontal,
  Star,
  Target,
  Trash2,
  Zap
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import heroImage from "./assets/rozgaar-hero.png";
import informalWorkerOrbit from "./assets/orbit .png";
import rahulWorkerPhoto from "./assets/rahul-kumar-electrician.jpg";
import createWorkerIdentityPhoto from "./assets/create-worker-identity-photo.jpg";
import logoFull from "./assets/brand/rozgaarai-logo-full.png";
import logoFullTransparent from "./assets/brand/rozgaarai-logo-full-transparent.png";
import logoMark from "./assets/brand/rozgaarai-logo-mark.png";
import { DigitalCareerIdentityCard, PublicWorkerProfile } from "./components/DigitalCareerIdentityCard";
import { EmployerAnalyticsPage } from "./components/employer/analytics/EmployerAnalyticsPage";
import { EmployerApplicantsPage } from "./components/employer/applicants/EmployerApplicantsPage";
import { EmployerCompanyProfilePage } from "./components/employer/company/EmployerCompanyProfilePage";
import { EmployerFindWorkersPage } from "./components/employer/find-workers/EmployerFindWorkers";
import { EmployerJobPostsPage } from "./components/employer/job-posts/EmployerJobPostsPage";
import { EmployerMessagesPage } from "./components/employer/messages/EmployerMessagesPage";
import { EmployerOnboarding } from "./components/employer/EmployerOnboarding";
import { EmployerOverviewDashboard } from "./components/employer/overview/EmployerOverview";
import { EmployerHiringPipelinePage } from "./components/employer/pipeline/EmployerHiringPipelinePage";
import { EmployerSettingsPage } from "./components/employer/settings/EmployerSettingsPage";
import { AdminDiagnostics } from "./components/admin/AdminDiagnostics";
import { NgoDashboardLayout } from "./components/ngo/NgoDashboardLayout";
import { NgoOnboarding, NgoOnboardingLanding } from "./components/ngo/NgoOnboarding";
import { NgoProductStory } from "./components/NgoProductStory";
import { WorkerOrganizationRequests } from "./components/ngo/NgoWorkers";
import { UnifiedAuthModal } from "./components/UnifiedAuthModal";
import { WorkerTraining } from "./components/worker/WorkerTraining";
import { MetricCard } from "./components/MetricCard";
import { Section } from "./components/Section";
import {
  cities,
  demoProfiles,
  incomePassports,
  initialWorker,
  jobRoles
} from "./data/mockData";
import {
  getInitialLanguage,
  htmlLanguageCodes,
  languageConfig,
  languageLabel as getLanguageLabel,
  normalizeLanguage,
  resolveInitialLanguage,
  speechLocales,
  translateOption,
  translations
} from "./i18n/translations";
import {
  api,
  createWorkerId,
  localFakeCheck,
  localMatches,
  localProfile,
  localResume,
  localWageEstimate,
  parseWorkerInput
} from "./lib/api";
import { database } from "./lib/database";
import {
  hasFirebaseAuthConfig,
  signInWithGoogleAuth,
  signOutFirebaseAuth,
  subscribeToFirebaseAuth
} from "./lib/firebaseAuth";
import {
  defaultShareSettings,
  getPublicWorkerById,
  getPublicWorkerByIdSync,
  getWorkerIdFromPublicPath,
  getWorkerPublicProfileUrl
} from "./lib/publicWorkerProfile";
import { resolveRouteAccess } from "./lib/routeGuards";
import { getDefaultRouteForRole, normalizeAccountRole, normalizeRole, resolvePostAuthRoute, ROLES } from "./lib/roles";

const sessionStorageKey = "rozgaarai-worker-session-v1";
const demoModeStorageKey = "rozgaar-demo-mode";
const employerDemoIntentStorageKey = "rozgaar-employer-demo-intent";
const ngoDemoIntentStorageKey = "rozgaar-ngo-demo-intent";
const initialAuthForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "",
  phone: "",
  organizationName: "",
  employerType: "",
  organizationType: "",
  remember: true
};

function hasEmployerDemoUrlIntent() {
  if (typeof window === "undefined") return false;
  const demoIntent = new URLSearchParams(window.location.search).get("demo");
  return demoIntent === "employer" || (window.location.pathname.startsWith("/employer") && demoIntent === "true");
}

function hasNgoDemoUrlIntent() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("demo") === "ngo";
}

const demoNgoOrganization = {
  id: "demo-ngo",
  name: "Rozgaar India Demo NGO",
  organizationType: "NGO",
  verificationStatus: "Demo Mode",
  contactPersonName: "Demo Coordinator",
  officialEmail: "demo.ngo@rozgaarai.org",
  phone: "+91 90000 45678",
  headquartersCity: "Bhopal",
  headquartersState: "Madhya Pradesh",
  locationsServed: "Bhopal, Delhi, Lucknow, Nagpur, Raipur",
  skillSectors: ["Domestic Worker", "Electrician", "Plumber", "Tailor", "Driver"],
  onboardingCompleted: true,
  createdAt: "2026-07-01T09:00:00.000Z"
};

const demoNgoStats = {
  totalWorkersLinked: 24,
  workersInTraining: 9,
  trainingCompleted: 12,
  availableForEmployment: 15,
  workersPlaced: 6,
  placementRate: 25,
  activeEmployers: 8,
  openOpportunities: 14,
  placementStages: { linkedWorkers: 24, inTraining: 9, certified: 12, available: 15, shortlisted: 7, placed: 6 },
  workerStatus: { consentPending: 3, linked: 24, accessLimited: 2, accessRevoked: 0 }
};

const demoNgoActivityLogs = [
  { id: "ngo-demo-1", description: "Asha Kumari granted worker profile access to the NGO.", activityType: "consent_granted", createdAt: "2026-07-26T09:30:00.000Z" },
  { id: "ngo-demo-2", description: "Ramesh Patel completed plumbing readiness verification.", activityType: "training_completed", createdAt: "2026-07-25T16:45:00.000Z" },
  { id: "ngo-demo-3", description: "Imran Khan was recommended to a verified employer in Lucknow.", activityType: "placement_recommended", createdAt: "2026-07-24T11:20:00.000Z" },
  { id: "ngo-demo-4", description: "Rekha Devi moved to tailoring placement shortlist.", activityType: "shortlisted", createdAt: "2026-07-23T14:05:00.000Z" },
  { id: "ngo-demo-5", description: "Sanjay Verma accepted a driver opportunity through NGO support.", activityType: "placed", createdAt: "2026-07-22T10:15:00.000Z" }
];
const stakeholderIcons = [Users, Building2, HandHeart];
const currentIssueDate = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
const logoAlt = "RozgaarAI Logo";
const allowedProofTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const maxProofFileSize = 5 * 1024 * 1024;
const emptyWorkRecordForm = {
  employerName: "",
  workType: "",
  workDate: new Date().toISOString().slice(0, 10),
  amountEarned: "",
  paymentStatus: "paid",
  hoursWorked: "",
  location: "",
  notes: ""
};
const practiceLanguageOptions = [
  ["en", "English"],
  ["hi", "हिन्दी"],
  ["mr", "मराठी"],
  ["bn", "বাংলা"],
  ["ta", "தமிழ்"],
  ["te", "తెలుగు"]
];
const demoWorkerText = {
  en: {
    languages: "Hindi, Basic English",
    availability: "Full-time",
    notes: "Experienced in cooking, cleaning, elderly care, punctual attendance, and managing household supplies."
  },
  hi: {
    languages: "हिन्दी, थोड़ी English",
    availability: "पूर्णकालिक",
    notes: "खाना बनाने में मदद, सफाई, बुजुर्गों की देखभाल, समय पर काम और घर का सामान संभालने का अनुभव।"
  }
};
const demoOfferText = {
  en: {
    title: "Airport job",
    employerName: "Unknown Hiring Desk",
    contactDetails: "WhatsApp only",
    documents: "Original Aadhaar required",
    description: "Urgent limited seats. Pay deposit today for guaranteed joining."
  },
  hi: {
    title: "एयरपोर्ट नौकरी",
    employerName: "अज्ञात हायरिंग डेस्क",
    contactDetails: "सिर्फ WhatsApp",
    documents: "मूल आधार मांगा गया",
    description: "जल्दी करें, सीटें कम हैं। पक्की नौकरी के लिए आज ही जमा राशि दें।"
  }
};

const demoWhatsAppJobMessage = `Hello!

Urgent Airport Helper jobs available in Bhopal.

Salary ₹65,000/month.

Limited seats.

Registration fee ₹2500.

Bring original Aadhaar.

Contact only on WhatsApp.

Join today.`;

const extractionSteps = [
  "Reading message...",
  "Extracting entities...",
  "Checking scam indicators...",
  "Generating safety report..."
];
const resumeBuildSteps = [
  "Analyzing profile...",
  "Structuring work history...",
  "Adding verification QR...",
  "Preparing PDF...",
  "Resume ready ✓"
];

const emptyResume = { title: "", sections: [] };
const employerStorageKey = "rozgaarai-employer-workspace-v1";
const onboardingDemoWorkerName = "Ramesh Patel";
const employerDemoWorkerCount = 5;
const employerDemoPipelineStages = ["Recommended", "Shortlisted", "Interview Scheduled", "Selected"];
const employerDemoApplicationStatuses = ["Recommended", "Shortlisted", "Shortlisted", "Interview Scheduled", "Selected"];

function readEmployerWorkspace() {
  try {
    return JSON.parse(window.localStorage.getItem(employerStorageKey) || "{}");
  } catch {
    return {};
  }
}

function writeEmployerWorkspace(patch) {
  const next = { ...readEmployerWorkspace(), ...patch };
  window.localStorage.setItem(employerStorageKey, JSON.stringify(next));
  return next;
}

function parseWhatsAppJobMessage(message) {
  const text = String(message || "");
  const lower = text.toLowerCase();
  const salaryMatch = text.match(/(?:salary|वेतन|मजदूरी)[^\d₹]*(?:₹|rs\.?|inr)?\s*([\d,]+)/i) || text.match(/₹\s*([\d,]+)\s*\/?\s*(?:month|माह)?/i);
  const feeMatch = text.match(/(?:registration fee|deposit|joining fee|processing fee|रजिस्ट्रेशन)[^\d₹]*(?:₹|rs\.?|inr)?\s*([\d,]+)/i);
  const cityMatch = text.match(/\b(Bhopal|Delhi|Raipur|Nagpur|Lucknow|Mumbai|Pune|Bengaluru|Hyderabad|Chennai|Kolkata|Ahmedabad)\b/i);
  const titleMatch = text.match(/([A-Z][A-Za-z ]{2,40}?(?:job|jobs|helper|plumber|driver|electrician|tailor|worker))/i);
  const documents = /aadhaar|aadhar|pan|original|documents/i.test(text)
    ? (/original/i.test(text) ? "Original Aadhaar" : "Aadhaar/PAN documents")
    : "";
  const contact = /whatsapp only|only on whatsapp|whatsapp/i.test(lower) ? "WhatsApp only" : "";
  const employerName = /unknown|hiring desk|limited seats|contact only|whatsapp/i.test(lower) ? "Unknown Hiring Desk" : "";
  const address = /address|office|worksite|location:/i.test(text) && cityMatch ? cityMatch[0] : "";
  const title = titleMatch?.[1]?.replace(/\s+available$/i, "").trim() || "Airport Helper job";

  return {
    offer: {
      title,
      employerName,
      address,
      contactDetails: contact,
      salary: salaryMatch ? Number(salaryMatch[1].replace(/,/g, "")) : "",
      deposit: feeMatch ? Number(feeMatch[1].replace(/,/g, "")) : "",
      documents,
      description: text
    },
    entities: {
      employer: employerName || "Not found",
      salary: salaryMatch ? `₹${Number(salaryMatch[1].replace(/,/g, "")).toLocaleString("en-IN")}/month` : "Not found",
      fee: feeMatch ? `₹${Number(feeMatch[1].replace(/,/g, "")).toLocaleString("en-IN")}` : "Not found",
      documents: documents || "Not found",
      contact: contact || "Not found",
      address: address || "Not Found"
    },
    confidence: {
      employer: employerName ? 82 : 71,
      salary: salaryMatch ? 96 : 58,
      fee: feeMatch ? 95 : 62,
      documents: documents ? 92 : 60,
      contact: contact ? 94 : 64,
      address: address ? 86 : 74
    }
  };
}

function readSavedSession() {
  if (typeof window === "undefined") return null;
  try {
    const session = JSON.parse(window.localStorage.getItem(sessionStorageKey) || "null");
    if (!session || typeof session !== "object" || Array.isArray(session)) return null;
    const safeWorker = session.worker && typeof session.worker === "object" && !Array.isArray(session.worker) ? session.worker : initialWorker;
    const safeProfile = session.profile && typeof session.profile === "object" && !Array.isArray(session.profile) ? session.profile : null;
    const safeResume = session.resume && typeof session.resume === "object" && !Array.isArray(session.resume) ? session.resume : emptyResume;
    return {
      ...session,
      worker: session.account ? initialWorker : safeWorker,
      profile: session.account ? null : safeProfile,
      resume: session.account ? emptyResume : safeResume,
      matches: session.account || !Array.isArray(session.matches) ? [] : session.matches,
      wage: session.account || !session.wage || typeof session.wage !== "object" || Array.isArray(session.wage) ? null : session.wage,
      wageEntries: session.account || !Array.isArray(session.wageEntries) ? [] : session.wageEntries,
      hasGeneratedProfile: session.account ? false : Boolean(session.hasGeneratedProfile),
      userProfiles: []
    };
  } catch {
    return null;
  }
}

function accountUserId(account) {
  return account?.uid || account?.id || account?.firebaseUid || "";
}

function userProfilesStorageKey(account) {
  const userKey = accountUserId(account);
  return userKey ? `rozgaarai_user_profiles_${userKey}` : "";
}

function readUserProfiles(account) {
  if (typeof window === "undefined") return [];
  const key = userProfilesStorageKey(account);
  if (!key) return [];
  try {
    const profiles = JSON.parse(window.localStorage.getItem(key) || "[]");
    const userId = accountUserId(account);
    return Array.isArray(profiles) ? profiles.filter((profile) => profile.userId === userId) : [];
  } catch {
    return [];
  }
}

function writeUserProfiles(account, profiles) {
  if (typeof window === "undefined") return;
  const key = userProfilesStorageKey(account);
  if (!key) return;
  const userId = accountUserId(account);
  window.localStorage.setItem(key, JSON.stringify(profiles.filter((profile) => profile.userId === userId)));
}

function readDemoModeSession() {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(demoModeStorageKey) === "true";
}

function createDemoJob(profileData) {
  return {
    id: `${profileData.workerId}-JOB-01`,
    title: `${profileData.skill} opportunity in ${profileData.city}`,
    city: profileData.city,
    skill: profileData.skill,
    wageRange: {
      min: Math.round(Number(profileData.expectedWage) * 0.9),
      max: Math.round(Number(profileData.expectedWage) * 1.12),
      period: "Monthly"
    },
    employerName: `${profileData.city} Verified Work Network`,
    employerType: "Verified employer network",
    requiredExperience: Math.max(1, Number(profileData.experience) - 2),
    requiredSkills: [profileData.skill, "Punctuality", "Mobile reachable"],
    languagePreference: profileData.languages.split(",").map((language) => language.trim()).filter(Boolean),
    safetyScore: 94,
    status: "Verified",
    addressAvailable: true,
    contactQuality: "Strong",
    perks: ["Written wage terms", "Verified contact", "Safe workplace"],
    employer: `${profileData.city} Verified Work Network`,
    trust: "Verified",
    wage: Number(profileData.expectedWage),
    type: "Monthly",
    score: profileData.jobMatch,
    matchReasons: ["Skill fit", "Same city", "Experience eligible", "Language match", "Verified employer"],
    matchBreakdown: {
      skill: 100,
      location: 100,
      wage: 94,
      language: 100,
      experience: 100,
      safety: 94
    }
  };
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs font-medium text-slate-500">{hint}</span>}
    </label>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`focus-ring w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink shadow-sm transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-300 ${className}`}
    />
  );
}

function Select({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={`focus-ring w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-blue-200 focus:border-blue-300 ${className}`}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`focus-ring min-h-32 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-ink shadow-sm transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-300 ${className}`}
    />
  );
}

function BrandLockup({ tagline, compact = false, className = "" }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img src={logoMark} alt={logoAlt} className={`${compact ? "h-11 w-11" : "h-12 w-12"} shrink-0 rounded-md object-contain transition duration-200 group-hover:scale-[1.03]`} />
      <span className="min-w-0">
        <span className="block text-base font-black leading-5 text-ink">RozgaarAI</span>
        {tagline && <span className="block text-xs font-bold leading-4 text-slate-500">{tagline}</span>}
      </span>
    </span>
  );
}

function ActionButton({ children, icon: Icon, variant = "primary", className = "", ...props }) {
  const styles =
    variant === "primary"
      ? "bg-saffron text-white shadow-sm hover:bg-blue-700"
      : variant === "dark"
        ? "bg-ink text-white shadow-sm hover:bg-slate-800"
        : "border border-slate-300 bg-white text-ink shadow-sm hover:border-blue-300 hover:bg-slate-50";

  return (
    <button
      {...props}
      className={`focus-ring button-press inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${styles} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function FeatureCard({ icon: Icon, title, hindi, children, action }) {
  return (
    <article className="premium-card group flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-saffron transition group-hover:border-blue-200 group-hover:bg-blue-50">
          <Icon className="h-5 w-5" />
        </span>
        {action}
      </div>
      <h3 className="mt-4 text-lg font-extrabold text-ink">{title}</h3>
      {hindi && <p className="mt-1 text-sm font-semibold text-slate-600">{hindi}</p>}
      <div className="mt-3 flex-1 text-sm leading-6 text-slate-600">{children}</div>
    </article>
  );
}

function DemoStep({ step, active }) {
  return (
    <div className={`rounded-lg border p-4 transition hover:-translate-y-1 ${active ? "border-blue-200 bg-white text-ink shadow-soft" : "border-white/10 bg-white/10"}`}>
      <p className={`text-xs font-black ${active ? "text-saffron" : "text-blue-100"}`}>{step[0]}</p>
      <p className={`mt-2 text-sm font-bold ${active ? "text-ink" : "text-white"}`}>{step[1]}</p>
      <p className={`mt-1 text-xs font-semibold ${active ? "text-mitti" : "text-blue-100"}`}>{step[2]}</p>
    </div>
  );
}

function openPrintableDocument(title, bodyHtml, autoPrint = true) {
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>${title}</title><meta charset="utf-8" />
    <style>
      body{font-family:Inter,Noto Sans Devanagari,Arial,sans-serif;color:#0f172a;margin:40px;line-height:1.55}
      h1{font-size:28px;margin:0 0 8px} h2{font-size:15px;margin:22px 0 8px;text-transform:uppercase;letter-spacing:.08em;color:#2563eb}
      .muted{color:#64748b}.box{border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin:14px 0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .brand{color:#2563eb;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.cert{border:8px solid #dbeafe;padding:34px;border-radius:18px}
      .doc-logo{height:48px;width:auto;object-fit:contain;margin:0 0 18px}.doc-head{display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:1px solid #e2e8f0;margin-bottom:22px;padding-bottom:14px}
      @media print{button{display:none} body{margin:24px}}
    </style></head><body>${bodyHtml}${autoPrint ? "<script>setTimeout(() => window.print(), 250)</script>" : ""}</body></html>`);
  win.document.close();
}

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-extrabold text-slate-700">
        <span>{label}</span>
        <span className="text-ink">{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-saffron to-neem" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MatchRing({ value, label, compact = false }) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0));
  const degrees = percent * 3.6;

  return (
    <div className="flex flex-col items-center justify-center text-center" aria-label={`${label}: ${percent}%`}>
      <div
        className={`grid place-items-center rounded-full shadow-sm ${compact ? "h-24 w-24" : "h-28 w-28"}`}
        style={{
          background: `conic-gradient(from -90deg, #2563eb 0deg, #16a34a ${degrees}deg, #e2e8f0 ${degrees}deg 360deg)`
        }}
      >
        <div className={`grid place-items-center rounded-full bg-white ${compact ? "h-[4.4rem] w-[4.4rem]" : "h-20 w-20"}`}>
          <span className={`font-black text-ink ${compact ? "text-xl" : "text-2xl"}`}>{percent}%</span>
        </div>
      </div>
      <p className={`${compact ? "mt-1.5" : "mt-2"} text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600`}>{label}</p>
    </div>
  );
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function withCopyTokens(template, replacements = {}) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) => replacements[key] ?? "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toDownloadSlug(value) {
  return String(value || "worker")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "worker";
}

function summarizeIncome(records) {
  const totalIncome = records.reduce((sum, record) => sum + Number(record.paymentReceived || 0), 0);
  const pending = records.reduce((sum, record) => sum + Number(record.paymentPending || 0), 0);
  const totalDays = records.length;
  const avgDaily = totalDays ? Math.round(totalIncome / totalDays) : 0;
  const totalHours = records.reduce((sum, record) => sum + Number(record.hoursWorked || 0), 0);
  const monthly = records.reduce((acc, record) => {
    const month = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date(record.date));
    acc[month] = (acc[month] || 0) + Number(record.paymentReceived || 0);
    return acc;
  }, {});
  return { totalIncome, pending, totalDays, avgDaily, totalHours, monthly };
}

function parseSpokenNumber(value) {
  const devanagari = "०१२३४५६७८९";
  return Number(String(value || "").replace(/[०-९]/g, (digit) => devanagari.indexOf(digit)).replace(/[^\d.]/g, ""));
}

function parseWorkRecordDate(text) {
  const raw = String(text || "");
  const monthMap = {
    january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3, may: 4, june: 5, jun: 5,
    july: 6, jul: 6, august: 7, aug: 7, september: 8, sep: 8, october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11
  };
  const numeric = raw.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
  if (numeric) {
    const year = numeric[3] ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]) : new Date().getFullYear();
    const date = new Date(year, Number(numeric[2]) - 1, Number(numeric[1]));
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const named = raw.toLowerCase().match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${Object.keys(monthMap).join("|")})(?:\\s+(\\d{4}))?\\b`));
  if (named) {
    const date = new Date(Number(named[3] || new Date().getFullYear()), monthMap[named[2]], Number(named[1]));
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  return "";
}

function parseWorkRecordVoiceInput(transcript) {
  const raw = String(transcript || "").trim();
  const lower = raw.toLowerCase();
  const extracted = {};
  const matchedRole = jobRoles.find((role) => new RegExp(`\\b${role.replace(/\s+/g, "\\s+")}\\b`, "i").test(raw));
  const roleMatch = raw.match(/(?:worked as|work as|job as|as a|as an)\s+([a-zA-Z ]{3,36}?)(?:\s+for|\s+with|\s+at|\s+in|\s+on|,|\.|$)/i);
  if (matchedRole) extracted.workType = matchedRole;
  else if (roleMatch?.[1]) extracted.workType = roleMatch[1].trim().replace(/\b\w/g, (char) => char.toUpperCase());

  const employerMatch =
    raw.match(/(?:for|with|at)\s+([a-zA-Z0-9&.' -]{2,60}?)(?:\s+in|\s+on|\s+for\s+(?:₹|rs|rupees|\d)|,|\.|$)/i) ||
    raw.match(/(?:employer|client)\s+(?:was|is|name is)?\s*([a-zA-Z0-9&.' -]{2,60}?)(?:\s+in|\s+on|,|\.|$)/i);
  if (employerMatch?.[1]) extracted.employerName = employerMatch[1].trim();

  const city = cities.find((item) => new RegExp(`\\b${item.replace(/\s+/g, "\\s+")}\\b`, "i").test(raw));
  if (city) extracted.location = city;

  const workDate = parseWorkRecordDate(raw);
  if (workDate) extracted.workDate = workDate;

  const amountMatch =
    raw.match(/(?:earned|paid|amount|wage|salary|मिला|कमाए|कमाया)\D{0,16}((?:\d|[०-९])[\d०-९,.]*)/i) ||
    raw.match(/((?:\d|[०-९])[\d०-९,.]*)\s*(?:rupees|rs|inr|₹|रुपये)/i);
  if (amountMatch?.[1]) extracted.amountEarned = String(parseSpokenNumber(amountMatch[1]) || "");

  const hoursMatch = raw.match(/((?:\d|[०-९])[\d०-९.]*)\s*(?:hours|hour|hrs|घंटे|घंटा)/i);
  if (hoursMatch?.[1]) extracted.hoursWorked = String(parseSpokenNumber(hoursMatch[1]) || "");

  if (/partially paid|partial payment|part paid|कुछ भुगतान|आधा भुगतान/.test(lower)) extracted.paymentStatus = "partially_paid";
  else if (/pending|unpaid|not paid|बकाया|बाकी/.test(lower)) extracted.paymentStatus = "pending";
  else if (/\bpaid\b|payment was paid|भुगतान मिला|पेमेंट मिला/.test(lower)) extracted.paymentStatus = "paid";

  extracted.notes = raw;
  return extracted;
}

function inferPracticeLanguage(profile, uiLanguage) {
  const languages = String(profile.languages || "").toLowerCase();
  if (languages.includes("marathi")) return "mr";
  if (languages.includes("bengali")) return "bn";
  if (languages.includes("tamil")) return "ta";
  if (languages.includes("telugu")) return "te";
  if (languages.includes("hindi") || uiLanguage === "hi") return "hi";
  return "en";
}

function localizedPracticeText(code, key, fallback) {
  const text = {
    en: {
      availability: "Are you available for urgent calls or immediate work?",
      wage: "What wage do you expect for a full-day job?",
      intro: "Tell me about your previous {skill} work.",
      example: "Share one example of work you completed well.",
      safety: "How do you keep the workplace safe and communicate clearly?",
      sample: "I explain my experience clearly, confirm the work, discuss wage terms, and share one real example from my past work.",
      confidence: "Speak slowly, mention your experience, and give one clear example."
    },
    hi: {
      availability: "क्या आप तुरंत काम पर आने के लिए उपलब्ध हैं?",
      wage: "पूरे दिन के काम के लिए आपकी मजदूरी कितनी होगी?",
      intro: "आपने पहले किस तरह का {skill} काम किया है?",
      example: "अपने किसी अच्छे पूरे किए हुए काम का एक उदाहरण बताएं।",
      safety: "आप काम की जगह सुरक्षा और साफ़ बातचीत कैसे रखते हैं?",
      sample: "मैं अपना अनुभव साफ़ बताऊँगा, काम और मजदूरी पहले पक्का करूँगा, और अपने पिछले काम का एक उदाहरण दूँगा।",
      confidence: "धीरे बोलें, अपना अनुभव बताएं और एक साफ़ उदाहरण जोड़ें।"
    },
    mr: {
      availability: "तुम्ही तातडीच्या कामासाठी लगेच उपलब्ध आहात का?",
      wage: "पूर्ण दिवसाच्या कामासाठी तुमची मजुरी किती असेल?",
      intro: "तुम्ही आधी कोणते {skill} काम केले आहे?",
      example: "तुम्ही चांगले पूर्ण केलेल्या कामाचे एक उदाहरण सांगा.",
      safety: "कामाच्या ठिकाणी सुरक्षा आणि स्पष्ट संवाद कसा ठेवता?",
      sample: "मी माझा अनुभव स्पष्ट सांगतो, काम आणि मजुरी आधी ठरवतो, आणि मागील कामाचे एक उदाहरण देतो.",
      confidence: "हळू बोला, अनुभव सांगा आणि एक खरे उदाहरण जोडा."
    },
    bn: {
      availability: "আপনি কি জরুরি কাজে দ্রুত আসতে পারবেন?",
      wage: "পুরো দিনের কাজের জন্য আপনার মজুরি কত হবে?",
      intro: "আপনি আগে কী ধরনের {skill} কাজ করেছেন?",
      example: "আপনি ভালোভাবে শেষ করা একটি কাজের উদাহরণ বলুন.",
      safety: "কাজের জায়গায় নিরাপত্তা ও পরিষ্কার যোগাযোগ কীভাবে রাখেন?",
      sample: "আমি আমার অভিজ্ঞতা পরিষ্কারভাবে বলি, কাজ ও মজুরি আগে ঠিক করি, এবং আগের কাজের একটি উদাহরণ দিই.",
      confidence: "ধীরে বলুন, অভিজ্ঞতা বলুন এবং একটি বাস্তব উদাহরণ যোগ করুন."
    },
    ta: {
      availability: "அவசர வேலைக்கு நீங்கள் உடனே வர முடியுமா?",
      wage: "முழு நாள் வேலைக்கு உங்கள் கூலி எவ்வளவு?",
      intro: "முன்பு எந்த வகையான {skill} வேலை செய்துள்ளீர்கள்?",
      example: "நீங்கள் நன்றாக முடித்த ஒரு வேலை உதாரணத்தை சொல்லுங்கள்.",
      safety: "வேலை இடத்தில் பாதுகாப்பும் தெளிவான தகவல்களும் எப்படி கவனிக்கிறீர்கள்?",
      sample: "நான் என் அனுபவத்தை தெளிவாக சொல்வேன், வேலை மற்றும் கூலியை முன்பே உறுதி செய்வேன், முன்பு செய்த ஒரு உதாரணத்தை சொல்வேன்.",
      confidence: "மெதுவாக பேசுங்கள், அனுபவத்தை சொல்லுங்கள், ஒரு உண்மை உதாரணத்தை சேர்க்குங்கள்."
    },
    te: {
      availability: "అత్యవసర పనికి మీరు వెంటనే రావగలరా?",
      wage: "పూర్తి రోజు పనికి మీ కూలీ ఎంత?",
      intro: "మీరు ముందుగా ఏ రకమైన {skill} పని చేశారు?",
      example: "మీరు బాగా పూర్తి చేసిన ఒక పనికి ఉదాహరణ చెప్పండి.",
      safety: "పని ప్రదేశంలో భద్రత మరియు స్పష్టమైన మాటల్ని ఎలా చూసుకుంటారు?",
      sample: "నేను నా అనుభవాన్ని స్పష్టంగా చెబుతాను, పని మరియు కూలీ ముందే నిర్ధారిస్తాను, గత పనికి ఒక ఉదాహరణ ఇస్తాను.",
      confidence: "నెమ్మదిగా మాట్లాడండి, అనుభవం చెప్పండి, ఒక నిజమైన ఉదాహరణ జోడించండి."
    }
  };
  return (text[code]?.[key] || text.en[key] || fallback).replace("{skill}", fallback);
}

function skillSpecificQuestions(skill, code) {
  const label = skill || "work";
  const english = {
    Plumber: ["How do you handle emergency pipe leakage?", "What tools do you usually carry?"],
    Electrician: ["How do you check wiring faults safely?", "What safety steps do you follow before repair?"],
    Driver: ["How do you plan routes and keep passengers safe?", "How do you handle vehicle checks before a trip?"],
    Tailor: ["How do you take accurate measurements?", "How do you handle urgent alteration requests?"],
    "Domestic Worker": ["What household tasks are you most comfortable with?", "How do you manage cleaning, cooking support, and timing?"]
  };
  const hindi = {
    Plumber: ["अगर अचानक पाइप लीक हो जाए तो आप क्या करेंगे?", "आप अपने साथ कौन-कौन से औजार रखते हैं?"],
    Electrician: ["वायरिंग की खराबी को सुरक्षित तरीके से कैसे जांचते हैं?", "मरम्मत से पहले आप कौन से सुरक्षा कदम लेते हैं?"],
    Driver: ["आप रास्ता कैसे तय करते हैं और यात्रियों की सुरक्षा कैसे रखते हैं?", "यात्रा से पहले वाहन की जांच कैसे करते हैं?"],
    Tailor: ["आप सही नाप कैसे लेते हैं?", "तुरंत alteration की जरूरत हो तो कैसे संभालते हैं?"],
    "Domestic Worker": ["घर के कौन से काम आप सबसे अच्छे से करती/करते हैं?", "सफाई, खाना मदद और समय को कैसे संभालती/संभालते हैं?"]
  };
  if (code === "hi") return hindi[skill] || [localizedPracticeText(code, "intro", label), localizedPracticeText(code, "example", label)];
  if (code !== "en") return [localizedPracticeText(code, "intro", label), localizedPracticeText(code, "example", label)];
  return english[skill] || [localizedPracticeText("en", "intro", label), localizedPracticeText("en", "example", label)];
}

function buildLocalInterviewCoach(profile, mode, practiceLanguage, uiLanguage, demoProfile) {
  const skill = profile.skill || "work";
  const baseQuestions = [
    localizedPracticeText(practiceLanguage, "intro", skill),
    ...skillSpecificQuestions(skill, practiceLanguage),
    localizedPracticeText(practiceLanguage, "availability", skill),
    localizedPracticeText(practiceLanguage, "wage", skill),
    localizedPracticeText(practiceLanguage, "safety", skill)
  ];
  const modePrefix = mode === "simulation"
    ? (uiLanguage === "hi" ? "नियोक्ता पूछता है: " : "Employer asks: ")
    : mode === "confidence"
      ? (uiLanguage === "hi" ? "आसान अभ्यास: " : "Confidence prompt: ")
      : "";
  const questions = baseQuestions.slice(0, 5).map((question) => `${modePrefix}${question}`);
  const sampleAnswer = localizedPracticeText(practiceLanguage, "sample", skill);
  const score = demoProfile?.interviewScore || Math.min(96, 72 + Math.min(Number(profile.experience || 0) * 3, 18));
  return {
    mode,
    practiceLanguage,
    score,
    questions,
    answers: questions.map((question) => ({ question, answer: sampleAnswer })),
    feedback: localizedPracticeText(practiceLanguage, "confidence", skill)
  };
}

export default function App() {
  const [savedSession] = useState(readSavedSession);
  const [lang, setLang] = useState(() => resolveInitialLanguage(savedSession?.account));
  const [authResolved, setAuthResolved] = useState(!hasFirebaseAuthConfig);
  const [isBooting, setIsBooting] = useState(true);
  const [worker, setWorker] = useState(savedSession?.worker || initialWorker);
  const [profile, setProfile] = useState(savedSession?.profile || null);
  const [resume, setResume] = useState(savedSession?.resume || emptyResume);
  const [matches, setMatches] = useState(savedSession?.matches || []);
  const [wage, setWage] = useState(savedSession?.wage || null);
  const [offer, setOffer] = useState({
    title: demoOfferText.en.title,
    employerName: demoOfferText.en.employerName,
    address: "",
    contactDetails: demoOfferText.en.contactDetails,
    salary: 65000,
    deposit: 2500,
    documents: demoOfferText.en.documents,
    description: demoOfferText.en.description
  });
  const [risk, setRisk] = useState(localFakeCheck(offer));
  const [whatsAppMessage, setWhatsAppMessage] = useState("");
  const [extractedOffer, setExtractedOffer] = useState(null);
  const [isAnalyzingMessage, setIsAnalyzingMessage] = useState(false);
  const [extractionStepIndex, setExtractionStepIndex] = useState(-1);
  const [resumeTemplate, setResumeTemplate] = useState("Modern");
  const [isBuildingResume, setIsBuildingResume] = useState(false);
  const [resumeBuildStepIndex, setResumeBuildStepIndex] = useState(-1);
  const [coach, setCoach] = useState(null);
  const [coachMode, setCoachMode] = useState("quick");
  const [practiceLanguage, setPracticeLanguage] = useState(savedSession?.practiceLanguage || inferPracticeLanguage(savedSession?.worker || initialWorker, getInitialLanguage()));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [smartInput, setSmartInput] = useState(savedSession?.smartInput || "");
  const [wageEntries, setWageEntries] = useState(savedSession?.wageEntries || []);
  const [wageEntry, setWageEntry] = useState({ employer: "", date: new Date().toISOString().slice(0, 10), dailyWage: "", hoursWorked: "", paymentReceived: "", paymentPending: "" });
  const [isWorkRecordModalOpen, setIsWorkRecordModalOpen] = useState(false);
  const [workRecordForm, setWorkRecordForm] = useState(emptyWorkRecordForm);
  const [workRecordErrors, setWorkRecordErrors] = useState({});
  const [workRecordProof, setWorkRecordProof] = useState(null);
  const [isWorkRecordDirty, setIsWorkRecordDirty] = useState(false);
  const [workRecordVoiceStatus, setWorkRecordVoiceStatus] = useState("idle");
  const [workRecordVoiceText, setWorkRecordVoiceText] = useState("");
  const [isSavingWorkRecord, setIsSavingWorkRecord] = useState(false);
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [employerFilters, setEmployerFilters] = useState({ skill: "", city: "", availability: "" });
  const [employerSearch, setEmployerSearch] = useState("");
  const [employerSmartFilters, setEmployerSmartFilters] = useState(["Verified Only", "Highest Match"]);
  const [employerSort, setEmployerSort] = useState("match");
  const [employerWorkerFilters, setEmployerWorkerFilters] = useState({ experience: "", wageMax: "", readiness: "", language: "", resumeReady: false, incomePassport: false });
  const [selectedCompareWorkers, setSelectedCompareWorkers] = useState([]);
  const [isEmployerSidebarCollapsed, setIsEmployerSidebarCollapsed] = useState(false);
  const [employerJobs, setEmployerJobs] = useState(() => readEmployerWorkspace().jobs || []);
  const [employerApplications, setEmployerApplications] = useState(() => readEmployerWorkspace().applications || []);
  const [employerInterviews, setEmployerInterviews] = useState(() => readEmployerWorkspace().interviews || []);
  const [employerMessages, setEmployerMessages] = useState(() => readEmployerWorkspace().messages || []);
  const [isEmployerDemoMode, setIsEmployerDemoMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(employerDemoIntentStorageKey) === "true" || hasEmployerDemoUrlIntent();
  });
  const [employerDemoApplications, setEmployerDemoApplications] = useState([]);
  const [employerDemoInterviews, setEmployerDemoInterviews] = useState([]);
  const [employerDemoMessages, setEmployerDemoMessages] = useState([]);
  const [draggedEmployerApplicationId, setDraggedEmployerApplicationId] = useState("");
  const [employerJobForm, setEmployerJobForm] = useState({
    title: "",
    category: "",
    description: "",
    city: "",
    wageMin: "",
    wageMax: "",
    wageType: "Monthly",
    experienceRequired: "",
    languages: "Hindi",
    availability: "",
    employmentType: "Full-time",
    openings: 1,
    workHours: "",
    benefits: "",
    requirements: "",
    contactMethod: "Phone",
    closingDate: ""
  });
  const [interviewForm, setInterviewForm] = useState({ candidateId: "", jobId: "", date: "", time: "", mode: "Phone", location: "", notes: "" });
  const [shortlistedWorkers, setShortlistedWorkers] = useState([]);
  const [listening, setListening] = useState(false);
  const [voiceAnswerStatus, setVoiceAnswerStatus] = useState("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingRisk, setIsCheckingRisk] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [authPrepStep, setAuthPrepStep] = useState(-1);
  const [hasGeneratedProfile, setHasGeneratedProfile] = useState(Boolean(savedSession?.hasGeneratedProfile));
  const [isDemoMode, setIsDemoMode] = useState(readDemoModeSession);
  const [authMode, setAuthMode] = useState("");
  const [authLoading, setAuthLoading] = useState("");
  const [authError, setAuthError] = useState("");
  const [authFieldErrors, setAuthFieldErrors] = useState({});
  const [authRedirectTo, setAuthRedirectTo] = useState("");
  const [account, setAccount] = useState(() => hasFirebaseAuthConfig ? null : normalizeAccountRole(savedSession?.account) || null);
  const [userProfiles, setUserProfiles] = useState(() => hasFirebaseAuthConfig ? [] : readUserProfiles(savedSession?.account));
  const [ngoOrganization, setNgoOrganization] = useState(null);
  const [ngoMembership, setNgoMembership] = useState(null);
  const [ngoStats, setNgoStats] = useState({
    totalWorkersLinked: 0,
    workersInTraining: 0,
    trainingCompleted: 0,
    availableForEmployment: 0,
    workersPlaced: 0,
    placementRate: 0,
    activeEmployers: 0,
    openOpportunities: 0,
    placementStages: { linkedWorkers: 0, inTraining: 0, certified: 0, available: 0, shortlisted: 0, placed: 0 },
    workerStatus: { consentPending: 0, linked: 0, accessLimited: 0, accessRevoked: 0 }
  });
  const [ngoActivityLogs, setNgoActivityLogs] = useState([]);
  const [ngoDataLoading, setNgoDataLoading] = useState(false);
  const [ngoDataError, setNgoDataError] = useState("");
  const [ngoWorkspaceChecked, setNgoWorkspaceChecked] = useState(false);
  const [isNgoDemoMode, setIsNgoDemoMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(ngoDemoIntentStorageKey) === "true" || hasNgoDemoUrlIntent();
  });
  const [profileFetchError, setProfileFetchError] = useState("");
  const [authForm, setAuthForm] = useState(initialAuthForm);
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [cardExportStepIndex, setCardExportStepIndex] = useState(-1);
  const [routePath, setRoutePath] = useState(() => (typeof window === "undefined" ? "/" : window.location.pathname));
  const [publicWorkerRouteLookup, setPublicWorkerRouteLookup] = useState(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("overview");
  const [onboardingStep, setOnboardingStep] = useState("input");
  const [jobFilters, setJobFilters] = useState({ role: "", city: "", verifiedOnly: false, sort: "match" });
  const [demoWorkerCategory, setDemoWorkerCategory] = useState("all");
  const [demoWorkerSearch, setDemoWorkerSearch] = useState("");
  const [demoWorkerSort, setDemoWorkerSort] = useState("match");
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [activeNavKey, setActiveNavKey] = useState("challenge");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const workerCardExportRef = useRef(null);
  const languageMenuRef = useRef(null);
  const t = translations[lang] || translations.en;
  const workerCopy = translations[lang]?.workerWorkspace || translations.en.workerWorkspace;
  const isLocalizedLanguage = lang !== "en";
  const contentLang = normalizeLanguage(lang);
  const roleLabel = (role) => translateOption("roleLabels", role, lang);
  const cityLabel = (city) => translateOption("cityLabels", city, lang);
  const periodLabel = (period) => period === "Daily" ? t.common.daily : t.common.monthly;
  const statusLabel = (status) => status === "Verified" ? t.verified : t.unverified;
  const riskLabel = (riskValue) => t.riskLabels[riskValue] || riskValue;
  const riskFlagLabel = (flag) => t.riskFlags[flag] || flag;
  const demoBadgeLabel = (badge) => t.demoMode.badges?.[badge] || badge;
  const wageFactorLabel = (factor) => t.factorLabels[factor] || factor;
  const jobTitleLabel = (job) => isLocalizedLanguage ? `${roleLabel(job?.skill)} की नौकरी` : job?.title;
  const employerTypeLabel = (job) => contentLang === "hi" ? `${roleLabel(job?.skill)} सेवा` : job?.employerType;
  const languageLabel = (language) => ({
    Hindi: "हिन्दी",
    "Basic English": "थोड़ी English",
    Marathi: "मराठी",
    Kannada: "कन्नड़",
    Telugu: "तेलुगु",
    Tamil: "तमिल",
    Gujarati: "गुजराती",
    Bengali: "बंगाली"
  }[language] || language);
  const selectedLanguageLabel = getLanguageLabel(lang);
  const navItems = useMemo(() => [
    { key: "challenge", label: t.navMain?.challenge || "Challenge", id: "about", route: "/" },
    { key: "how", label: t.navMain?.howItWorks || "How It Works", id: "journey", route: "/" },
    { key: "product", label: t.navMain?.product || "Product", id: "ngo-product-story", route: "/" },
    { key: "employers", label: t.navMain?.employers || "Employers", id: "employers", route: "/" },
    { key: "ngos", label: t.navMain?.ngos || "NGOs", route: "/ngo/onboarding", action: "ngoEntry" }
  ], [t.navMain]);
  const jobChips = (job) => contentLang === "hi"
    ? [roleLabel(job.skill), statusLabel(job.status), `${job.requiredExperience}+ ${t.common.years}`]
    : [...job.requiredSkills.slice(0, 3), ...job.perks];
  const localizedHeadline = hasGeneratedProfile
    ? `${worker.experience}+ ${t.common.years} ${roleLabel(worker.skill)} ${cityLabel(worker.city)} ${t.common.in}`
    : t.emptyProfileTitle;
  const localizedSummary = hasGeneratedProfile
    ? (contentLang === "hi"
      ? `${worker.name} ${cityLabel(worker.city)} के भरोसेमंद ${roleLabel(worker.skill)} हैं। वे ${worker.availability} काम के लिए उपलब्ध हैं।`
      : profile?.summary || t.emptyProfileSummary)
    : t.emptyProfileSummary;
  const localizedStrength = (strength) => ({
    Punctual: t.common.punctual,
    "Reference-ready": t.common.referenceReady,
    "Mobile reachable": t.common.mobileReachable,
    "Open to verified jobs": t.common.verifiedJobs
  }[strength] || strength);
  const localizedSignal = (signal) => ({
    "Phone available": t.common.phoneAvailable,
    "Skill self-declared": t.common.skillDeclared,
    "City preference captured": t.common.cityCaptured
  }[signal] || signal);

  useEffect(() => {
    if (!statusMessage && !errorMessage) return undefined;
    const timer = window.setTimeout(() => {
      setStatusMessage("");
      setErrorMessage("");
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [statusMessage, errorMessage]);

  const workerId = useMemo(() => createWorkerId(worker), [worker]);
  const sampleWorkers = useMemo(() => {
    const currentWorker = hasGeneratedProfile && worker.name && !demoProfiles.some((profileData) => profileData.name === worker.name)
      ? [worker]
      : [];
    const mergedProfiles = [...currentWorker, ...demoProfiles];
    return mergedProfiles.map((profileData) => ({
      ...profileData,
        availability: contentLang === "hi"
        ? profileData.availability.replace("Immediate", "तुरंत").replace("Full-time", "पूर्णकालिक")
        : profileData.availability.replace("तुरंत", "Immediate").replace("पूर्णकालिक", "Full-time")
    }));
  }, [worker, contentLang, hasGeneratedProfile]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasFirebaseAuthConfig) return undefined;
    return subscribeToFirebaseAuth(async (firebaseAccount) => {
      setAuthResolved(false);
      if (!firebaseAccount) {
        setAccount(null);
        resetPrivateWorkspaceState();
        setAuthResolved(true);
        return;
      }
      try {
        const storedAccount = await database.getCurrentAccount();
        const storedRole = storedAccount && (storedAccount.uid === firebaseAccount.uid || storedAccount.id === firebaseAccount.uid || storedAccount.email === firebaseAccount.email)
          ? storedAccount.role
          : firebaseAccount.role;
        const nextAccount = await database.signInOrCreateAccount({
          ...firebaseAccount,
          role: normalizeRole(storedRole || "worker"),
          preferredLanguage: lang
        });
        const localizedAccount = normalizeAccount(nextAccount);
        setAccount(localizedAccount);
        if (localizedAccount.role === ROLES.WORKER) await loadProfilesForAccount(localizedAccount);
      } catch (error) {
        setProfileFetchError(error.message || "Unable to load your worker profile.");
      } finally {
        setAuthResolved(true);
      }
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavScrolled(window.scrollY > 40);
      if (routePath === "/employer") {
        setActiveNavKey("employers");
        return;
      }
      if (routePath === "/demo") {
        setActiveNavKey("demo");
        return;
      }
      const visibleSection = navItems
        .filter((item) => item.route === "/" && item.id)
        .map((item) => {
          const element = document.getElementById(item.id);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          return { key: item.key, top: Math.abs(rect.top - 112), passed: rect.top <= 132 && rect.bottom > 132 };
        })
        .filter(Boolean)
        .find((item) => item.passed);
      if (visibleSection) {
        setActiveNavKey(visibleSection.key);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [routePath, navItems]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsLanguageMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const normalizedLang = normalizeLanguage(lang);
    window.localStorage.setItem("rozgaarai-language", normalizedLang);
    document.documentElement.lang = htmlLanguageCodes[normalizedLang] || normalizedLang;
    document.documentElement.dataset.lang = normalizedLang;
    document.title = normalizedLang === "hi" ? "RozgaarAI — डिजिटल करियर पहचान" : "RozgaarAI";

    const activeContentLang = ["en", "hi"].includes(normalizedLang) ? normalizedLang : null;
    if (!activeContentLang) return;
    const otherLang = activeContentLang === "hi" ? "en" : "hi";
    setWorker((current) => {
      const next = {
        ...current,
        languages: current.languages === demoWorkerText[otherLang].languages ? demoWorkerText[activeContentLang].languages : current.languages,
        availability: current.availability === demoWorkerText[otherLang].availability ? demoWorkerText[activeContentLang].availability : current.availability,
        notes: current.notes === demoWorkerText[otherLang].notes ? demoWorkerText[activeContentLang].notes : current.notes
      };
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
    setOffer((current) => {
      const next = {
        ...current,
        title: current.title === demoOfferText[otherLang].title ? demoOfferText[activeContentLang].title : current.title,
        employerName: current.employerName === demoOfferText[otherLang].employerName ? demoOfferText[activeContentLang].employerName : current.employerName,
        contactDetails: current.contactDetails === demoOfferText[otherLang].contactDetails ? demoOfferText[activeContentLang].contactDetails : current.contactDetails,
        documents: current.documents === demoOfferText[otherLang].documents ? demoOfferText[activeContentLang].documents : current.documents,
        description: current.description === demoOfferText[otherLang].description ? demoOfferText[activeContentLang].description : current.description
      };
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
  }, [lang]);

  useEffect(() => {
    const accountLanguage = normalizeLanguage(account?.preferredLanguage || account?.preferred_language);
    if (account && accountLanguage !== lang && accountLanguage !== "en") {
      setLang(accountLanguage);
    }
  }, [account?.id, account?.email, account?.preferredLanguage, account?.preferred_language]);

  useEffect(() => {
    if (!account || normalizeLanguage(account.preferredLanguage || account.preferred_language) === lang) return;
    database.updateAccountLanguage(account, lang).then((nextAccount) => {
      if (nextAccount) setAccount((current) => current ? { ...current, preferredLanguage: lang } : current);
    });
  }, [lang, account?.id, account?.email]);

  useEffect(() => {
    const syncPath = () => setRoutePath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  useEffect(() => {
    if (routePath === "/login") {
      openAuthModal({ mode: "signin", redirectTo: window.sessionStorage.getItem("rozgaarai-intended-route") || "" });
      navigateTo("/");
      return;
    }
    if (routePath === "/signup") {
      const signupParams = new URLSearchParams(window.location.search);
      const requestedRole = normalizeRole(signupParams.get("role") || ROLES.WORKER);
      const requestedRedirect = signupParams.get("redirect") || "";
      openAuthModal({ mode: "signup", role: requestedRole, redirectTo: requestedRedirect });
      navigateTo("/");
      return;
    }
    if (authResolved && !account && (routePath === "/dashboard" || routePath.startsWith("/dashboard/") || routePath === "/demo/dashboard" || routePath.startsWith("/demo/dashboard/"))) {
      window.sessionStorage.setItem("rozgaarai-intended-route", routePath);
      openAuthModal({ mode: "signin", redirectTo: routePath });
      return;
    }
    const openingEmployerDemo = routePath.startsWith("/employer") && (
      isEmployerDemoMode ||
      window.sessionStorage.getItem(employerDemoIntentStorageKey) === "true" ||
      hasEmployerDemoUrlIntent()
    );
    const openingNgoDemo = routePath.startsWith("/ngo") && (
      isNgoDemoMode ||
      window.sessionStorage.getItem(ngoDemoIntentStorageKey) === "true" ||
      hasNgoDemoUrlIntent()
    );
    if (openingEmployerDemo || openingNgoDemo) return;
    if (authResolved) {
      const waitsForNgoOrganization = account?.role === ROLES.NGO && routePath.startsWith("/ngo") && routePath !== "/ngo/onboarding" && !ngoWorkspaceChecked;
      if (!waitsForNgoOrganization) {
        const access = resolveRouteAccess({
          account,
          pathname: routePath,
          ngoOnboardingComplete: Boolean(ngoOrganization?.onboardingCompleted)
        });
        if (!access.allowed && access.redirectTo && access.redirectTo !== routePath) {
          if (access.reason === "auth_required") {
            window.sessionStorage.setItem("rozgaarai-intended-route", routePath);
            openAuthModal({ mode: "signin", role: access.role, redirectTo: routePath });
            return;
          }
          if (access.reason === "role_mismatch") {
            const label = activeAccountRole === ROLES.NGO ? "an NGO" : activeAccountRole === ROLES.EMPLOYER ? "an Employer" : "a Worker";
            setStatusMessage(`You are signed in as ${label} account, so we redirected you to your workspace.`);
          }
          navigateTo(access.redirectTo);
          return;
        }
      }
    }
    if (routePath === "/dashboard" || routePath === "/demo/dashboard") {
      window.setTimeout(() => document.getElementById("product-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
    if (routePath === "/create-profile") {
      window.setTimeout(() => document.getElementById("onboarding")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [routePath, authResolved, account?.id, account?.uid, account?.role, ngoOrganization?.id, ngoOrganization?.onboardingCompleted, ngoWorkspaceChecked, isEmployerDemoMode, isNgoDemoMode]);

  useEffect(() => {
    if (!account || !authResolved || account.role !== ROLES.WORKER) return;
    loadProfilesForAccount(account);
  }, [account?.uid, account?.email, account?.id]);

  useEffect(() => {
    if (!account || !authResolved || account.role !== ROLES.NGO) return;
    loadNgoWorkspace(account);
  }, [account?.uid, account?.email, account?.id, account?.role, authResolved]);

  useEffect(() => {
    if (!routePath.startsWith("/employer")) return;
    const shouldOpenEmployerDemo = isEmployerDemoMode || window.sessionStorage.getItem(employerDemoIntentStorageKey) === "true" || hasEmployerDemoUrlIntent();
    if (!shouldOpenEmployerDemo) return;
    window.sessionStorage.removeItem(employerDemoIntentStorageKey);
    if (hasEmployerDemoUrlIntent()) window.history.replaceState({}, "", routePath);
    enterEmployerDemoMode();
  }, [routePath]);

  useEffect(() => {
    if (!routePath.startsWith("/ngo")) return;
    const shouldOpenNgoDemo = isNgoDemoMode || window.sessionStorage.getItem(ngoDemoIntentStorageKey) === "true" || hasNgoDemoUrlIntent();
    if (!shouldOpenNgoDemo) return;
    window.sessionStorage.removeItem(ngoDemoIntentStorageKey);
    if (hasNgoDemoUrlIntent()) window.history.replaceState({}, "", routePath);
    setIsNgoDemoMode(true);
  }, [routePath]);

  useEffect(() => {
    if (!account) return;
    writeUserProfiles(account, userProfiles);
  }, [account, userProfiles]);

  function normalizeAccount(nextAccount) {
    const normalizedRoleAccount = normalizeAccountRole(nextAccount);
    return {
      ...normalizedRoleAccount,
      id: normalizedRoleAccount.uid || normalizedRoleAccount.id,
      uid: normalizedRoleAccount.uid || normalizedRoleAccount.id,
      preferredLanguage: normalizeLanguage(normalizedRoleAccount.preferredLanguage || normalizedRoleAccount.preferred_language || lang)
    };
  }

  function resetPrivateWorkspaceState() {
    setWorker(initialWorker);
    setProfile(null);
    setResume(emptyResume);
    setMatches([]);
    setWage(null);
    setWageEntries([]);
    setSmartInput("");
    setHasGeneratedProfile(false);
    setIsDemoMode(false);
    setPracticeHistory([]);
    setCoach(null);
    setAnswerFeedback(null);
    setUserProfiles([]);
    setProfileFetchError("");
  }

  async function loadProfilesForAccount(nextAccount) {
    if (!nextAccount) {
      setUserProfiles([]);
      return [];
    }
    setProfileFetchError("");
    try {
      const profiles = await database.getWorkerProfiles(nextAccount);
      const ownedProfiles = profiles.filter((item) => item.userId === accountUserId(nextAccount));
      setUserProfiles(ownedProfiles);
      if (!ownedProfiles.length) {
        resetPrivateWorkspaceState();
      }
      return ownedProfiles;
    } catch (error) {
      setUserProfiles([]);
      setProfileFetchError(error.message || "Unable to load your worker profile.");
      return [];
    }
  }

  async function loadNgoWorkspace(nextAccount = account) {
    if (!nextAccount || normalizeRole(nextAccount.role) !== ROLES.NGO) {
      setNgoOrganization(null);
      setNgoMembership(null);
      setNgoActivityLogs([]);
      setNgoDataError("");
      setNgoWorkspaceChecked(true);
      return null;
    }
    setNgoWorkspaceChecked(false);
    setNgoDataLoading(true);
    setNgoDataError("");
    try {
      const [organization, membership] = await Promise.all([
        database.getOrganizationByAccount(nextAccount),
        database.getOrganizationMembership(nextAccount)
      ]);
      setNgoOrganization(organization);
      setNgoMembership(membership);
      if (organization?.id) {
        const [stats, logs] = await Promise.all([
          database.getOrganizationDashboardStats(organization.id),
          database.getOrganizationActivityLogs(organization.id)
        ]);
        setNgoStats(stats);
        setNgoActivityLogs(logs);
      } else {
        setNgoStats({
          totalWorkersLinked: 0,
          workersInTraining: 0,
          trainingCompleted: 0,
          availableForEmployment: 0,
          workersPlaced: 0,
          placementRate: 0,
          activeEmployers: 0,
          openOpportunities: 0,
          placementStages: { linkedWorkers: 0, inTraining: 0, certified: 0, available: 0, shortlisted: 0, placed: 0 },
          workerStatus: { consentPending: 0, linked: 0, accessLimited: 0, accessRevoked: 0 }
        });
        setNgoActivityLogs([]);
      }
      return organization;
    } catch (error) {
      setNgoDataError(error.message || "Unable to load NGO workspace.");
      return null;
    } finally {
      setNgoDataLoading(false);
      setNgoWorkspaceChecked(true);
    }
  }

  async function createNgoOrganization(form) {
    if (!account || account.role !== ROLES.NGO) {
      setErrorMessage("Only NGO/Foundation accounts can create an organization workspace.");
      return null;
    }
    const existing = await database.getOrganizationByAccount(account);
    if (existing) {
      setNgoOrganization(existing);
      navigateTo("/ngo");
      return existing;
    }
    const organization = await database.createOrganization(form, account);
    await database.createOrganizationMember({
      organizationId: organization.id,
      accountId: accountUserId(account),
      role: "organization_admin",
      status: "active"
    });
    await database.logOrganizationActivity({
      organizationId: organization.id,
      actorAccountId: accountUserId(account),
      activityType: "organization_created",
      description: "Your organization workspace has been created."
    });
    await loadNgoWorkspace(account);
    setStatusMessage("NGO workspace created.");
    navigateTo("/ngo");
    return organization;
  }

  async function updateNgoOrganization(updates) {
    if (!ngoOrganization?.id) throw new Error("Organization profile is not loaded.");
    const updated = await database.updateOrganization(ngoOrganization.id, updates, account);
    setNgoOrganization(updated);
    await database.logOrganizationActivity({
      organizationId: updated.id,
      actorAccountId: accountUserId(account),
      activityType: "organization_updated",
      description: "Organization profile was updated."
    });
    await loadNgoWorkspace(account);
    return updated;
  }

  function navigateTo(path) {
    window.history.pushState({}, "", path);
    setRoutePath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openAuthModal({ mode = "signin", role = "", redirectTo = "" } = {}) {
    const normalizedRole = role ? normalizeRole(role) : "";
    setAuthMode(mode === "signup" ? "signup" : "signin");
    setAuthRedirectTo(redirectTo || "");
    setAuthError("");
    setAuthFieldErrors({});
    setShowAuthPassword(false);
    setAuthForm((current) => ({
      ...initialAuthForm,
      email: current.email || "",
      role: normalizedRole,
      remember: current.remember ?? true
    }));
  }

  function closeAuthModal() {
    if (authLoading) return;
    setAuthMode("");
    setAuthRedirectTo("");
    setAuthError("");
    setAuthFieldErrors({});
  }

  function updateAuthField(field, value) {
    setAuthForm((current) => ({ ...current, [field]: value }));
    setAuthFieldErrors((current) => ({ ...current, [field]: "" }));
    if (authError) setAuthError("");
  }

  function validateAuthForm(mode = authMode) {
    const errors = {};
    const role = authForm.role ? normalizeRole(authForm.role) : "";
    const email = String(authForm.email || "").trim();
    if (!role) errors.role = "Please select Worker, Employer, or NGO / Foundation.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
    if (!authForm.password || authForm.password.length < 8) errors.password = "Use a password with at least 8 characters.";
    if (mode === "signup") {
      if (!String(authForm.name || "").trim()) errors.name = "Enter your full name.";
      if (authForm.password !== authForm.confirmPassword) errors.confirmPassword = "Passwords do not match.";
      if ([ROLES.EMPLOYER, ROLES.NGO].includes(role) && !String(authForm.organizationName || "").trim()) {
        errors.organizationName = role === ROLES.NGO ? "Enter the NGO or foundation name." : "Enter the organization or company name.";
      }
    }
    setAuthFieldErrors(errors);
    if (Object.keys(errors).length) {
      setAuthError(Object.values(errors)[0]);
      return null;
    }
    return role;
  }

  async function ensureSelectedRoleMatchesExisting({ email, selectedRole, mode }) {
    if (!email || !selectedRole) return null;
    const existing = await database.getAccountByEmail(email);
    if (!existing) return null;
    const existingRole = normalizeRole(existing.role);
    if ((mode === "signin" || existingRole) && existingRole !== selectedRole) {
      throw new Error(`This account is registered as a ${existingRole === ROLES.NGO ? "NGO" : existingRole === ROLES.EMPLOYER ? "Employer" : "Worker"}. Please select ${existingRole === ROLES.NGO ? "NGO / Foundation" : existingRole === ROLES.EMPLOYER ? "Employer" : "Worker"} to continue.`);
    }
    return existing;
  }

  function openDemoSection() {
    navigateTo("/demo");
  }

  function openDemoByRole(role) {
    const normalizedRole = normalizeRole(role);
    closeAuthModal();
    if (normalizedRole === ROLES.EMPLOYER) {
      openEmployerDemoMode();
      return;
    }
    if (normalizedRole === ROLES.NGO) {
      openNgoDemoMode();
      return;
    }
    startOnboardingDemo();
  }

  function openEmployerDemoMode() {
    window.sessionStorage.setItem(employerDemoIntentStorageKey, "true");
    navigateTo("/employer");
  }

  function openNgoDemoMode() {
    window.sessionStorage.setItem(ngoDemoIntentStorageKey, "true");
    setIsNgoDemoMode(true);
    navigateTo("/ngo");
  }

  function exitNgoDemoMode() {
    window.sessionStorage.removeItem(ngoDemoIntentStorageKey);
    setIsNgoDemoMode(false);
    setStatusMessage("Returned to the real NGO workspace.");
    navigateTo(activeAccountRole === ROLES.NGO ? "/ngo" : "/ngo/onboarding");
  }

  function openInterviewPracticePage() {
    const targetIdentity = activeWorkerIdentity || dashboardIdentity || latestProfileIdentity;
    if (!hasPrimaryIdentity || !targetIdentity?.workerId) {
      navigateTo("/create-profile");
      return;
    }
    setActiveWorkspaceTab("coach");
    navigateTo(`/worker/${encodeURIComponent(targetIdentity.workerId)}`);
  }

  function openCareerIdentityPage() {
    const targetIdentity = activeWorkerIdentity || dashboardIdentity || latestProfileIdentity;
    if (!hasPrimaryIdentity || !targetIdentity?.workerId) {
      navigateTo("/create-profile");
      return;
    }
    setActiveWorkspaceTab("identity");
    navigateTo(`/worker/${encodeURIComponent(targetIdentity.workerId)}`);
  }

  function openWorkerProfileTab(tab, message = "") {
    const targetIdentity = activeWorkerIdentity || dashboardIdentity || latestProfileIdentity || identityPageIdentity;
    if (!targetIdentity?.workerId) {
      navigateTo("/create-profile");
      return;
    }
    setActiveWorkspaceTab(tab);
    if (message) setStatusMessage(message);
    if (!routePath.startsWith("/worker/")) {
      navigateTo(`/worker/${encodeURIComponent(targetIdentity.workerId)}`);
    }
    window.setTimeout(() => {
      document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function openWorkerSidebarDestination(key, path) {
    const tabByKey = {
      jobs: "jobs",
      income: "income",
      resume: "resume",
      coach: "coach",
      safety: "rights"
    };
    if (key === "identity") {
      openCareerIdentityPage();
      return;
    }
    if (tabByKey[key]) {
      openWorkerProfileTab(tabByKey[key]);
      return;
    }
    navigateTo(path);
  }

  async function copyWorkerProfileLink() {
    const profileLink = identityPageIdentity?.profileUrl || routePublicIdentity?.profileUrl || publicProfileUrl;
    try {
      await navigator.clipboard?.writeText(profileLink);
      setStatusMessage(isLocalizedLanguage ? "प्रोफ़ाइल लिंक कॉपी हो गया।" : "Profile link copied.");
    } catch {
      setErrorMessage(isLocalizedLanguage ? "लिंक कॉपी नहीं हो पाया।" : "Could not copy profile link.");
    }
  }

  function scrollToSection(sectionId) {
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 90);
  }

  function goHomeTop() {
    setIsMobileMenuOpen(false);
    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
      setRoutePath("/");
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 80);
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNavClick(item) {
    setActiveNavKey(item.key);
    setIsMobileMenuOpen(false);
    if (item.action === "ngoEntry") {
      if (account?.role === ROLES.NGO) {
        navigateTo("/ngo");
        return;
      }
      navigateTo("/ngo/onboarding");
      return;
    }
    if (window.location.pathname !== item.route) {
      window.history.pushState({}, "", item.route);
      setRoutePath(item.route);
      scrollToSection(item.id);
      return;
    }
    scrollToSection(item.id);
  }

  function handleLanguageSelect(nextLang) {
    const normalizedLang = normalizeLanguage(nextLang);
    setLang(normalizedLang);
    setIsLanguageMenuOpen(false);
    const label = getLanguageLabel(normalizedLang);
    setStatusMessage((translations[normalizedLang]?.languageChanged || translations.en.languageChanged).replace("{language}", label));
  }

  function handleFooterNewsletterSubmit(event) {
    event.preventDefault();
    const email = footerEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Enter a valid email address to get updates.");
      return;
    }
    setFooterEmail("");
    setStatusMessage("Thanks. Newsletter signup is saved for this demo session only.");
  }

  useEffect(() => {
    window.localStorage.setItem(sessionStorageKey, JSON.stringify({
      worker: account ? initialWorker : worker,
      profile: account ? null : profile,
      resume: account ? emptyResume : resume,
      matches: account ? [] : matches,
      wage: account ? null : wage,
      smartInput,
      wageEntries: account ? [] : wageEntries,
      practiceLanguage,
      hasGeneratedProfile: account ? false : hasGeneratedProfile,
      isDemoMode: false,
      account: account ? { id: account.id, uid: account.uid, email: account.email, name: account.name, role: account.role, preferredLanguage: account.preferredLanguage } : null,
      userProfiles: []
    }));
  }, [worker, profile, resume, matches, wage, smartInput, wageEntries, practiceLanguage, hasGeneratedProfile, isDemoMode, account, userProfiles]);

  function updateWorker(key, value) {
    setWorker((current) => ({ ...current, [key]: value }));
    setIsDemoMode(false);
  }

  function sanitizeParsedWorker(parsed) {
    const allowedFields = ["name", "phone", "city", "skill", "experience", "expectedWage", "languages", "availability", "notes"];
    return Object.fromEntries(
      allowedFields
        .filter((field) => parsed[field] !== undefined && parsed[field] !== null)
        .map((field) => [field, String(parsed[field])])
    );
  }

  function workerTextValue(value) {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value === "[object Object]" ? "" : value;
    return "";
  }

  async function startSignupWorkspace() {
    const steps = [
      ...workerCopy.onboarding.prepSteps
    ];
    setAuthPrepStep(0);
    for (let index = 1; index < steps.length; index += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 420));
      setAuthPrepStep(index);
    }
    await new Promise((resolve) => window.setTimeout(resolve, 360));
    setAuthPrepStep(-1);
    openAuthModal({ mode: "signup", role: ROLES.WORKER });
  }

  async function submitAuth(event) {
    event.preventDefault();
    const mode = authMode;
    const selectedRole = validateAuthForm(mode);
    if (!selectedRole) return;
    setAuthError("");
    setAuthLoading(mode === "signup" ? "Creating workspace..." : "Signing in...");
    try {
      const email = String(authForm.email || "").trim().toLowerCase();
      const existing = await ensureSelectedRoleMatchesExisting({ email, selectedRole, mode });
      const nextAccount = await database.signInOrCreateAccount({
        ...(existing || {}),
        ...authForm,
        email,
        name: authForm.name || existing?.name || email.split("@")[0],
        role: selectedRole,
        roleLabel: selectedRole === ROLES.NGO ? "NGO / Foundation" : undefined,
        organizationName: authForm.organizationName,
        employerType: authForm.employerType,
        organizationType: authForm.organizationType,
        phone: authForm.phone,
        preferredLanguage: lang,
        mode
      });
      completeAuth(nextAccount, mode === "signup" ? "Account created successfully" : "Welcome back", { mode });
    } catch (error) {
      setAuthError(error.message || "We could not sign you in. Please check your email and password.");
    } finally {
      setAuthLoading("");
    }
  }

  function completeAuth(nextAccount, message, { mode = "signin" } = {}) {
    const localizedAccount = normalizeAccount(nextAccount);
    setAccount(localizedAccount);
    setAuthMode("");
    setAuthRedirectTo("");
    setErrorMessage("");
    setAuthError("");
    setAuthFieldErrors({});
    setAuthForm(initialAuthForm);
    if (localizedAccount.role === ROLES.WORKER && hasGeneratedProfile && !isDemoMode) {
      saveAuthenticatedWorkerProfile(
        { workerData: worker, profileData: profile, resumeData: resume, matchesData: matches, wageData: wage, wageEntriesData: wageEntries },
        localizedAccount
      );
    } else if (localizedAccount.role === ROLES.WORKER) {
      loadProfilesForAccount(localizedAccount);
    } else if (localizedAccount.role === ROLES.NGO) {
      loadNgoWorkspace(localizedAccount);
    }
    setStatusMessage(message);
    const storedIntendedRoute = authRedirectTo || window.sessionStorage.getItem("rozgaarai-intended-route");
    const intendedRoute = mode === "signin" && localizedAccount.role === ROLES.WORKER && storedIntendedRoute === "/create-profile"
      ? ""
      : storedIntendedRoute;
    window.sessionStorage.removeItem("rozgaarai-intended-route");
    navigateTo(resolvePostAuthRoute({
      account: localizedAccount,
      requestedRoute: intendedRoute,
      workerOnboardingComplete: Boolean(hasGeneratedProfile || userProfiles.length),
      ngoOnboardingComplete: Boolean(ngoOrganization?.onboardingCompleted)
    }));
  }

  function saveAuthenticatedWorkerProfile({ workerData, profileData, resumeData, matchesData, wageData, wageEntriesData = [] }, ownerAccount = account) {
    if (!ownerAccount) return null;
    const userId = accountUserId(ownerAccount);
    if (!userId) return null;
    const stableWorkerId = workerData.workerId || createWorkerId(workerData);
    const timestamp = new Date().toISOString();
    const record = {
      id: `${userId}:${stableWorkerId}`,
      userId,
      workerId: stableWorkerId,
      worker: { ...workerData, workerId: stableWorkerId },
      profile: profileData,
      resume: resumeData,
      matches: matchesData,
      wage: wageData,
      wageEntries: wageEntriesData,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    setUserProfiles((current) => {
      const ownedCurrent = current.filter((item) => item.userId === userId);
      const existing = ownedCurrent.find((item) => item.workerId === stableWorkerId);
      const nextRecord = existing ? { ...existing, ...record, createdAt: existing.createdAt || timestamp } : record;
      const nextProfiles = [nextRecord];
      writeUserProfiles(ownerAccount, nextProfiles);
      database.saveWorkerProfile(nextRecord, ownerAccount);
      return nextProfiles;
    });
    return record;
  }

  async function continueWithGoogle() {
    const mode = authMode || "signin";
    const selectedRole = authForm.role ? normalizeRole(authForm.role) : "";
    if (!selectedRole) {
      setAuthError("Please select Worker, Employer, or NGO / Foundation before continuing with Google.");
      setAuthFieldErrors({ role: "Please select a role before continuing with Google." });
      return;
    }
    setAuthError("");
    setAuthLoading("Connecting to Google...");
    try {
      const googleAccount = await signInWithGoogleAuth(selectedRole);
      if (!googleAccount) return;
      const existing = await ensureSelectedRoleMatchesExisting({ email: googleAccount.email, selectedRole, mode });
      const nextAccount = await database.signInOrCreateAccount({
        ...(existing || {}),
        ...googleAccount,
        role: existing ? normalizeRole(existing.role) : selectedRole,
        roleLabel: selectedRole === ROLES.NGO ? "NGO / Foundation" : undefined,
        organizationName: authForm.organizationName,
        employerType: authForm.employerType,
        organizationType: authForm.organizationType,
        phone: authForm.phone,
        preferredLanguage: lang,
        mode
      });
      completeAuth(nextAccount, mode === "signup" ? "Google account connected. Workspace created." : "Signed in with Google.", { mode });
    } catch (error) {
      const friendlyMessages = {
        "auth/not-configured": "Google authentication is not configured yet. Add Firebase credentials to enable Google sign in.",
        "auth/popup-closed-by-user": "Google sign in was cancelled. You can try again or continue with email.",
        "auth/cancelled-popup-request": "Google sign in was cancelled. Please try again.",
        "auth/popup-blocked": "Your browser blocked the Google sign in popup. Please allow popups and try again.",
        "auth/network-request-failed": "Network error while connecting to Google. Please check your connection.",
        "auth/account-exists-with-different-credential": "This email is already linked to another sign in method."
      };
      setAuthError(friendlyMessages[error.code] || "We could not connect to Google. Please try again.");
    } finally {
      setAuthLoading("");
    }
  }

  async function signOut() {
    resetPrivateWorkspaceState();
    await signOutFirebaseAuth();
    await database.signOut();
    setAccount(null);
    setNgoOrganization(null);
    setNgoMembership(null);
    setNgoActivityLogs([]);
    setNgoWorkspaceChecked(false);
    setAuthMode("");
    setStatusMessage("");
    setErrorMessage("");
    setAuthError("");
    navigateTo("/");
    setStatusMessage("Signed out successfully.");
  }

  function loadDemoWorker(profileData, { tab = "overview" } = {}) {
    const demoWorker = { ...profileData };
    const nextProfile = {
      ...localProfile({ ...demoWorker, uiLanguage: lang }),
      workerId: profileData.workerId,
      readiness: profileData.readiness,
      interviewScore: profileData.interviewScore,
      summary: isLocalizedLanguage
        ? `${profileData.name} ${cityLabel(profileData.city)} के सत्यापित ${roleLabel(profileData.skill)} हैं। उनके पास ${profileData.experience} साल का अनुभव, दर्ज आय इतिहास और तैयार डिजिटल श्रमिक कार्ड है।`
        : `${profileData.name} is a verified ${profileData.skill.toLowerCase()} from ${profileData.city} with ${profileData.experience} years of experience, recorded income history, and a ready digital worker card.`
    };
    const demoMatches = [createDemoJob(profileData), ...localMatches(demoWorker)
      .map((job) => ({
        ...job,
        score: job.skill === profileData.skill && job.city === profileData.city ? profileData.jobMatch : Math.min(job.score, profileData.jobMatch - 4)
      }))
      .sort((a, b) => b.score - a.score)]
      .sort((a, b) => b.score - a.score);
    const demoWage = {
      ...localWageEstimate(demoWorker),
      fair: Number(profileData.expectedWage),
      low: Math.round(Number(profileData.expectedWage) * 0.9),
      high: Math.round(Number(profileData.expectedWage) * 1.12),
      confidence: "High"
    };
    setWorker(demoWorker);
    setProfile(nextProfile);
    setResume(localResume({ ...demoWorker, uiLanguage: lang }));
    setMatches(demoMatches);
    setWage(demoWage);
    setWageEntries(incomePassports[profileData.name] || []);
    const nextPracticeLanguage = inferPracticeLanguage(profileData, lang);
    setPracticeLanguage(nextPracticeLanguage);
    setCoachMode("quick");
    setCoach(buildLocalInterviewCoach(profileData, "quick", nextPracticeLanguage, lang, profileData));
    setCurrentQuestionIndex(0);
    setInterviewAnswer("");
    setAnswerFeedback(null);
    setPracticeHistory([
      {
        date: "24 Jun 2026",
        question: isLocalizedLanguage ? "पिछले काम का अनुभव बताएं।" : "Tell me about your previous work experience.",
        score: profileData.interviewScore,
        mode: "quick",
        improvement: isLocalizedLanguage ? "एक मजबूत उदाहरण जोड़ें।" : "Add one stronger work example."
      },
      {
        date: "18 Jun 2026",
        question: isLocalizedLanguage ? "काम के लिए आपकी उपलब्धता क्या है?" : "What is your availability for work?",
        score: Math.max(80, profileData.interviewScore - 6),
        mode: "confidence",
        improvement: isLocalizedLanguage ? "समय और मजदूरी साफ़ बताएं।" : "State timing and wage clearly."
      }
    ]);
    setSmartInput(`${profileData.name}, ${profileData.skill}, ${profileData.city}, ${profileData.experience} years experience, expected wage Rs ${profileData.expectedWage}.`);
    setEmployerFilters({ skill: profileData.skill, city: profileData.city, availability: "" });
    setHasGeneratedProfile(true);
    setIsDemoMode(true);
    window.sessionStorage.setItem(demoModeStorageKey, "true");
    setErrorMessage("");
    setStatusMessage(t.demoMode.loaded.replace("{name}", profileData.name));
    setActiveWorkspaceTab(tab);
  }

  function openDemoWorker(profileData, { tab = "overview" } = {}) {
    loadDemoWorker(profileData, { tab });
    navigateTo(`/worker/${encodeURIComponent(profileData.workerId)}`);
  }

  function startOnboardingDemo() {
    const demoProfile = demoProfiles.find((profileData) => profileData.name === onboardingDemoWorkerName) || demoProfiles[0];
    loadDemoWorker(demoProfile, { tab: "overview" });
    navigateTo("/demo/dashboard");
  }

  function startRealWorkerOnboarding() {
    window.sessionStorage.removeItem(demoModeStorageKey);
    resetPrivateWorkspaceState();
    setStatusMessage("Preparing your worker identity setup...");
    window.setTimeout(() => navigateTo("/create-profile"), 320);
  }

  function exitDemoMode() {
    window.sessionStorage.removeItem(demoModeStorageKey);
    setIsDemoMode(false);
    if (latestUserProfile) {
      openUserWorkerProfile(latestUserProfile, { shouldNavigate: false });
      navigateTo("/dashboard");
      return;
    }
    resetPrivateWorkspaceState();
    navigateTo("/dashboard");
  }

  function createProfileFromDemo() {
    window.sessionStorage.removeItem(demoModeStorageKey);
    resetPrivateWorkspaceState();
    navigateTo("/create-profile");
  }

  function openUserWorkerProfile(profileRecord, { shouldNavigate = true } = {}) {
    if (!profileRecord) return;
    const nextWorker = {
      ...profileRecord.worker,
      workerId: profileRecord.workerId
    };
    setWorker(nextWorker);
    setProfile(profileRecord.profile || localProfile({ ...nextWorker, uiLanguage: lang }));
    setResume(profileRecord.resume || localResume({ ...nextWorker, uiLanguage: lang }));
    setMatches(profileRecord.matches || localMatches(nextWorker));
    setWage(profileRecord.wage || localWageEstimate(nextWorker));
    setWageEntries(profileRecord.wageEntries || []);
    setPracticeLanguage(inferPracticeLanguage(nextWorker, lang));
    setHasGeneratedProfile(true);
    setIsDemoMode(false);
    setErrorMessage("");
    setStatusMessage("");
    setActiveWorkspaceTab("overview");
    if (shouldNavigate) {
      navigateTo(`/worker/${encodeURIComponent(profileRecord.workerId)}`);
    }
  }

  function applySmartInput(input) {
    const sourceText = typeof input === "string" ? input : smartInput;
    const parsed = parseWorkerInput(sourceText, { ...worker, uiLanguage: lang });
    const parsedWorker = sanitizeParsedWorker(parsed);
    setWorker((current) => ({ ...current, ...parsedWorker, notes: parsedWorker.notes || current.notes }));
    setStatusMessage(isLocalizedLanguage ? "आवाज़/टेक्स्ट से जानकारी निकाल ली गई है।" : "Details extracted from voice/text input.");
  }

  async function buildProfile() {
    const parsed = parseWorkerInput(smartInput, { ...worker, uiLanguage: lang });
    const parsedWorker = sanitizeParsedWorker(parsed);
    const generatedWorkerBase = { ...worker, ...parsedWorker, notes: parsedWorker.notes || worker.notes };
    const generatedWorker = { ...generatedWorkerBase, workerId: generatedWorkerBase.workerId || createWorkerId(generatedWorkerBase) };
    const missingRequired = ["name", "city", "skill", "experience"].filter((key) => !String(generatedWorker[key] || "").trim());
    if (missingRequired.length) {
      setErrorMessage(t.missingProfileFields);
      setStatusMessage("");
      document.getElementById("onboarding")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setWorker(generatedWorker);
    const localizedWorker = { ...generatedWorker, uiLanguage: lang, preferredLanguage: lang };
    setIsGenerating(true);
    setStatusMessage(t.loadingProfile);
    setErrorMessage("");
    try {
      const [nextProfile, nextResume, nextMatches, nextWage] = await Promise.all([
        api.generateProfile(localizedWorker),
        api.generateResume(localizedWorker),
        api.matchJobs(localizedWorker),
        api.estimateWage(localizedWorker)
      ]);
      setProfile(nextProfile);
      setResume(nextResume);
      setMatches(nextMatches);
      setWage(nextWage);
      setHasGeneratedProfile(true);
      setIsDemoMode(false);
      const savedProfileRecord = saveAuthenticatedWorkerProfile({
        workerData: generatedWorker,
        profileData: nextProfile,
        resumeData: nextResume,
        matchesData: nextMatches,
        wageData: nextWage,
        wageEntriesData: []
      });
      setStatusMessage(t.profileSuccess);
      setActiveWorkspaceTab("overview");
      if (savedProfileRecord) openUserWorkerProfile(savedProfileRecord);
      else navigateTo(`/worker/${encodeURIComponent(generatedWorker.workerId)}`);
    } catch (error) {
      console.error(error);
      setErrorMessage(t.profileError);
    } finally {
      setIsGenerating(false);
    }
  }

  function addWageEntry() {
    if (!hasGeneratedProfile && !routeDemoProfile) {
      setErrorMessage(t.generateProfileFirst);
      return;
    }
    const dailyWage = Number(wageEntry.dailyWage || 0);
    const paymentReceived = Number(wageEntry.paymentReceived || 0);
    const paymentPending = Number(wageEntry.paymentPending || 0);
    if (!wageEntry.date || dailyWage <= 0) {
      setErrorMessage(t.wageEntry.error);
      return;
    }
    const nextEntry = {
      id: `WAGE-${Date.now()}`,
      worker: worker.name,
      employer: wageEntry.employer || t.wageEntry.selfRecorded,
      date: wageEntry.date,
      jobType: worker.skill,
      location: worker.city,
      hoursWorked: Number(wageEntry.hoursWorked || 0),
      dailyWage,
      paymentReceived,
      paymentPending,
      status: "Self-recorded"
    };
    setWageEntries((current) => {
      const nextEntries = [nextEntry, ...current];
      if (account && worker.workerId) {
        const userId = accountUserId(account);
        setUserProfiles((profiles) => {
          const nextProfiles = profiles.map((item) => item.userId === userId && item.workerId === worker.workerId
            ? { ...item, wageEntries: nextEntries, updatedAt: new Date().toISOString() }
            : item);
          writeUserProfiles(account, nextProfiles);
          return nextProfiles;
        });
      }
      return nextEntries;
    });
    setWageEntry({ employer: "", date: new Date().toISOString().slice(0, 10), dailyWage: "", hoursWorked: "", paymentReceived: "", paymentPending: "" });
    setErrorMessage("");
    setStatusMessage(t.wageEntry.success);
  }

  function resetWorkRecordModal() {
    setWorkRecordForm({ ...emptyWorkRecordForm, workDate: new Date().toISOString().slice(0, 10) });
    setWorkRecordErrors({});
    setWorkRecordProof(null);
    setIsWorkRecordDirty(false);
    setWorkRecordVoiceStatus("idle");
    setWorkRecordVoiceText("");
    setIsSavingWorkRecord(false);
  }

  function openWorkRecordModal() {
    const activeProfileRecord = routeUserProfile || latestUserProfile || null;
    if (isDemoExperience) {
      setStatusMessage("Work record saved in Demo Mode. Create your profile to track real earnings.");
      return;
    }
    setErrorMessage("");
    setWorkRecordForm({
      ...emptyWorkRecordForm,
      workType: activeProfileRecord?.worker?.skill || identityPageWorker.skill || worker.skill || "",
      location: activeProfileRecord?.worker?.city || identityPageWorker.city || worker.city || "",
      workDate: new Date().toISOString().slice(0, 10)
    });
    setWorkRecordErrors({});
    setWorkRecordProof(null);
    setIsWorkRecordDirty(false);
    setWorkRecordVoiceStatus("idle");
    setWorkRecordVoiceText("");
    setIsWorkRecordModalOpen(true);
  }

  function hasUnsavedWorkRecordInput() {
    return isWorkRecordDirty;
  }

  function closeWorkRecordModal() {
    if (isSavingWorkRecord) return;
    if (hasUnsavedWorkRecordInput() && !window.confirm("Discard this unsaved work record?")) return;
    setIsWorkRecordModalOpen(false);
    resetWorkRecordModal();
  }

  function updateWorkRecordField(field, value) {
    setIsWorkRecordDirty(true);
    setWorkRecordForm((current) => ({ ...current, [field]: value }));
    setWorkRecordErrors((current) => ({ ...current, [field]: "" }));
  }

  function handleWorkProofChange(event) {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setWorkRecordProof(null);
      return;
    }
    setIsWorkRecordDirty(true);
    if (!allowedProofTypes.includes(file.type)) {
      setWorkRecordErrors((current) => ({ ...current, proof: "Upload a PDF, PNG, JPG or WebP file." }));
      event.target.value = "";
      return;
    }
    if (file.size > maxProofFileSize) {
      setWorkRecordErrors((current) => ({ ...current, proof: "File size must be 5 MB or less." }));
      event.target.value = "";
      return;
    }
    setWorkRecordProof(file);
    setWorkRecordErrors((current) => ({ ...current, proof: "" }));
  }

  function applyWorkRecordVoiceTranscript(transcript) {
    const extracted = parseWorkRecordVoiceInput(transcript);
    setWorkRecordForm((current) => ({
      ...current,
      ...Object.fromEntries(Object.entries(extracted).filter(([, value]) => value !== ""))
    }));
    setWorkRecordErrors((current) => {
      const nextErrors = { ...current };
      Object.keys(extracted).forEach((field) => {
        nextErrors[field] = "";
      });
      return nextErrors;
    });
    setIsWorkRecordDirty(true);
    setWorkRecordVoiceText(transcript);
  }

  function startWorkRecordVoiceInput() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setWorkRecordVoiceStatus("idle");
      setWorkRecordErrors((current) => ({ ...current, form: t.voiceUnsupported || t.speechUnsupported }));
      return;
    }
    const recognition = new Recognition();
    recognition.lang = speechLocales[normalizeLanguage(lang)] || "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => {
      setWorkRecordVoiceStatus("listening");
      setWorkRecordErrors((current) => ({ ...current, form: "" }));
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setWorkRecordVoiceStatus("processing");
      applyWorkRecordVoiceTranscript(transcript);
      window.setTimeout(() => setWorkRecordVoiceStatus("completed"), 350);
    };
    recognition.onerror = () => {
      setWorkRecordVoiceStatus("idle");
      setWorkRecordErrors((current) => ({ ...current, form: t.voiceUnsupported || t.speechUnsupported }));
    };
    recognition.onend = () => {
      setWorkRecordVoiceStatus((current) => current === "listening" ? "idle" : current);
    };
    recognition.start();
  }

  function validateWorkRecordForm() {
    const errors = {};
    const amountEarned = Number(workRecordForm.amountEarned);
    const hoursWorked = workRecordForm.hoursWorked === "" ? null : Number(workRecordForm.hoursWorked);
    const parsedDate = Date.parse(workRecordForm.workDate);

    if (!workRecordForm.employerName.trim()) errors.employerName = "Employer or client name is required.";
    if (!workRecordForm.workType.trim()) errors.workType = "Job or work type is required.";
    if (!workRecordForm.workDate || Number.isNaN(parsedDate)) errors.workDate = "Enter a valid work date.";
    if (!workRecordForm.amountEarned || Number.isNaN(amountEarned) || amountEarned < 0) errors.amountEarned = "Enter a valid amount earned.";
    if (!workRecordForm.paymentStatus) errors.paymentStatus = "Select a payment status.";
    if (hoursWorked !== null && (Number.isNaN(hoursWorked) || hoursWorked < 0)) errors.hoursWorked = workerCopy.validation.hoursWorkedNegative;
    if (workRecordForm.notes.length > 500) errors.notes = "Notes must be 500 characters or less.";

    setWorkRecordErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function saveWorkRecord() {
    if (isSavingWorkRecord || !validateWorkRecordForm()) return;
    const userId = accountUserId(account);
    const activeProfileRecord = routeUserProfile || latestUserProfile || userProfiles.find((item) => item.userId === userId && item.workerId === worker.workerId);
    const draftWorker = {
      ...initialWorker,
      ...worker,
      name: worker.name || account?.name || account?.email?.split("@")[0] || "Worker profile",
      city: worker.city || workRecordForm.location.trim() || "India",
      skill: worker.skill || workRecordForm.workType.trim() || "Worker",
      availability: worker.availability || "Available",
      notes: worker.notes || workRecordForm.notes.trim() || "Worker profile started from first work record.",
      uiLanguage: lang
    };
    const activeWorker = activeProfileRecord?.worker || draftWorker;
    const activeWorkerId = activeProfileRecord?.workerId || activeWorker.workerId || createWorkerId(activeWorker);
    setIsSavingWorkRecord(true);
    const now = new Date().toISOString();
    const amountEarned = Number(workRecordForm.amountEarned || 0);
    const paymentStatusLabels = {
      paid: "Paid",
      pending: "Pending",
      partially_paid: "Partially paid"
    };
    const paymentPending = workRecordForm.paymentStatus === "paid" ? 0 : workRecordForm.paymentStatus === "partially_paid" ? Math.round(amountEarned / 2) : amountEarned;
    const paymentReceived = Math.max(0, amountEarned - paymentPending);
    const nextRecord = {
      id: `WORK-${Date.now()}`,
      userId,
      worker: activeWorker.name,
      employerName: workRecordForm.employerName.trim(),
      employer: workRecordForm.employerName.trim(),
      workType: workRecordForm.workType.trim(),
      jobType: workRecordForm.workType.trim(),
      workDate: workRecordForm.workDate,
      date: workRecordForm.workDate,
      amountEarned,
      dailyWage: amountEarned,
      paymentStatus: workRecordForm.paymentStatus,
      paymentReceived,
      paymentPending,
      hoursWorked: workRecordForm.hoursWorked === "" ? 0 : Number(workRecordForm.hoursWorked),
      location: workRecordForm.location.trim(),
      notes: workRecordForm.notes.trim(),
      proofUrl: "",
      proofFileName: workRecordProof?.name || "",
      status: paymentStatusLabels[workRecordForm.paymentStatus],
      createdAt: now,
      updatedAt: now
    };

    try {
      if (!userId) {
        const nextEntries = [nextRecord, ...wageEntries];
        setWageEntries(nextEntries);
        setIsWorkRecordModalOpen(false);
        resetWorkRecordModal();
        setErrorMessage("");
        setStatusMessage("Work record saved locally. Create a worker identity to keep it with your account.");
        return;
      }

      const baseEntries = activeProfileRecord?.wageEntries || wageEntries;
      const nextEntries = [nextRecord, ...baseEntries];
      const existingProfile = userProfiles.find((item) => item.userId === userId && item.workerId === activeWorkerId);
      const draftProfile = existingProfile || {
        id: `${userId}:${activeWorkerId}`,
        userId,
        workerId: activeWorkerId,
        worker: { ...activeWorker, workerId: activeWorkerId },
        profile: localProfile({ ...activeWorker, workerId: activeWorkerId, uiLanguage: lang }),
        resume: localResume({ ...activeWorker, workerId: activeWorkerId, uiLanguage: lang }),
        matches: localMatches(activeWorker),
        wage: localWageEstimate(activeWorker),
        wageEntries: [],
        createdAt: now
      };
      const nextProfiles = [
        ...userProfiles.filter((item) => !(item.userId === userId && item.workerId === activeWorkerId)),
        { ...draftProfile, wageEntries: nextEntries, updatedAt: now }
      ];
      const profileToSave = nextProfiles.find((item) => item.userId === userId && item.workerId === activeWorkerId);
      if (!profileToSave) {
        throw new Error("Worker profile not found for this account.");
      }
      await database.saveWorkerProfile(profileToSave, account);
      writeUserProfiles(account, nextProfiles);
      setUserProfiles(nextProfiles);
      setWageEntries(nextEntries);
      setIsWorkRecordModalOpen(false);
      resetWorkRecordModal();
      setErrorMessage("");
      setStatusMessage("Work record saved. Income Passport updated.");
    } catch (error) {
      console.error(error);
      setWorkRecordErrors((current) => ({ ...current, form: "We couldn't save this work record. Please try again." }));
    } finally {
      setIsSavingWorkRecord(false);
    }
  }

  async function shortlistWorker(workerIdToSave) {
    setShortlistedWorkers((current) => current.includes(workerIdToSave) ? current : [...current, workerIdToSave]);
    if (isEmployerDemoMode) {
      setEmployerDemoApplications((current) => current.map((application) => application.workerId === workerIdToSave
        ? { ...application, status: "Shortlisted", updatedAt: new Date().toISOString().slice(0, 10) }
        : application));
      setStatusMessage("Demo worker shortlisted.");
      return;
    }
    await database.saveEmployerWorker(workerIdToSave);
    setStatusMessage(t.employerDashboard.saved);
  }

  function persistEmployerJobs(nextJobs) {
    setEmployerJobs(nextJobs);
    writeEmployerWorkspace({ jobs: nextJobs });
  }

  function persistEmployerApplications(nextApplications) {
    setEmployerApplications(nextApplications);
    writeEmployerWorkspace({ applications: nextApplications });
  }

  function persistEmployerInterviews(nextInterviews) {
    setEmployerInterviews(nextInterviews);
    writeEmployerWorkspace({ interviews: nextInterviews });
  }

  function persistEmployerMessages(nextMessages) {
    setEmployerMessages(nextMessages);
    writeEmployerWorkspace({ messages: nextMessages });
  }

  function generateEmployerJobDescription() {
    const role = employerJobForm.title || employerJobForm.category || "worker";
    const cityText = employerJobForm.city || "the selected city";
    const wageText = employerJobForm.wageMin && employerJobForm.wageMax
      ? `₹${Number(employerJobForm.wageMin).toLocaleString("en-IN")} to ₹${Number(employerJobForm.wageMax).toLocaleString("en-IN")} ${employerJobForm.wageType.toLowerCase()}`
      : "a fair wage range";
    const description = `We are hiring a verified ${role} in ${cityText}. The role requires ${employerJobForm.experienceRequired || "relevant"} years of practical experience, clear communication in ${employerJobForm.languages || "Hindi"}, and reliable availability. Pay is ${wageText}. RozgaarAI encourages safe hiring: no registration fee, clear wage terms, and document checks only after selection.`;
    setEmployerJobForm((current) => ({ ...current, description }));
  }

  function submitEmployerJob(event) {
    event?.preventDefault();
    if (isEmployerDemoMode) {
      setStatusMessage("Exit Demo to post a real job.");
      return;
    }
    if (!employerJobForm.title || !employerJobForm.category || !employerJobForm.city || !employerJobForm.wageMin || !employerJobForm.wageMax) {
      setErrorMessage(isLocalizedLanguage ? "कृपया जरूरी नौकरी विवरण भरें।" : "Please complete the required job details.");
      return;
    }
    const jobId = `job-${Date.now()}`;
    const nextJob = {
      ...employerJobForm,
      id: jobId,
      wageMin: Number(employerJobForm.wageMin),
      wageMax: Number(employerJobForm.wageMax),
      openings: Number(employerJobForm.openings || 1),
      experienceRequired: Number(employerJobForm.experienceRequired || 0),
      status: "Active",
      employerId: account?.id || "demo-employer",
      employerName: employerCompanyName,
      postedAt: new Date().toISOString().slice(0, 10)
    };
    persistEmployerJobs([nextJob, ...activeEmployerJobs.filter((job) => !job.id.startsWith("job-electrician") && !job.id.startsWith("job-domestic") && !job.id.startsWith("job-driver"))]);
    setEmployerJobForm({
      title: "",
      category: "",
      description: "",
      city: "",
      wageMin: "",
      wageMax: "",
      wageType: "Monthly",
      experienceRequired: "",
      languages: "Hindi",
      availability: "",
      employmentType: "Full-time",
      openings: 1,
      workHours: "",
      benefits: "",
      requirements: "",
      contactMethod: "Phone",
      closingDate: ""
    });
    setStatusMessage(isLocalizedLanguage ? "नौकरी प्रकाशित हो गई।" : "Job post published.");
    navigateTo(`/employer/jobs/${jobId}`);
  }

  function updateJobStatus(jobId, status) {
    if (isEmployerDemoMode) {
      setStatusMessage("Demo job status changes are not saved.");
      return;
    }
    persistEmployerJobs(activeEmployerJobs.map((job) => job.id === jobId ? { ...job, status } : job));
    setStatusMessage(isLocalizedLanguage ? "नौकरी की स्थिति अपडेट हुई।" : "Job status updated.");
  }

  function duplicateJob(job) {
    if (isEmployerDemoMode) {
      setStatusMessage("Exit Demo to duplicate a real job.");
      return;
    }
    const copyJob = { ...job, id: `job-${Date.now()}`, title: `${job.title} Copy`, status: "Draft", postedAt: new Date().toISOString().slice(0, 10) };
    persistEmployerJobs([copyJob, ...activeEmployerJobs]);
    setStatusMessage(isLocalizedLanguage ? "नौकरी कॉपी बन गई।" : "Job duplicated as draft.");
  }

  function deleteJob(jobId) {
    if (isEmployerDemoMode) {
      setStatusMessage("Exit Demo to delete a real job.");
      return;
    }
    if (!window.confirm(isLocalizedLanguage ? "क्या आप यह नौकरी हटाना चाहते हैं?" : "Delete this job post?")) return;
    persistEmployerJobs(activeEmployerJobs.filter((job) => job.id !== jobId));
    setStatusMessage(isLocalizedLanguage ? "नौकरी हट गई।" : "Job deleted.");
    if (routePath.includes(jobId)) navigateTo("/employer/jobs");
  }

  function updateApplicationStage(applicationId, status) {
    if (["Hired", "Rejected"].includes(status) && !window.confirm(`${status} candidate?`)) return;
    const nextApplications = activeEmployerApplications.map((application) => application.id === applicationId
      ? { ...application, status, updatedAt: new Date().toISOString().slice(0, 10) }
      : application);
    if (isEmployerDemoMode) {
      setEmployerDemoApplications(nextApplications);
      setStatusMessage("Demo pipeline updated.");
      return;
    }
    persistEmployerApplications(nextApplications);
    setStatusMessage(isLocalizedLanguage ? "उम्मीदवार चरण अपडेट हुआ।" : "Candidate stage updated.");
  }

  function updateDemoWorkerStage(workerIdToUpdate, status) {
    const application = activeEmployerApplications.find((item) => item.workerId === workerIdToUpdate);
    if (application) updateApplicationStage(application.id, status);
  }

  function scheduleEmployerInterview(event) {
    event?.preventDefault();
    if (!interviewForm.candidateId || !interviewForm.jobId || !interviewForm.date || !interviewForm.time) {
      setErrorMessage(isLocalizedLanguage ? "कृपया इंटरव्यू विवरण भरें।" : "Please complete interview details.");
      return;
    }
    const nextInterview = { ...interviewForm, id: `interview-${Date.now()}`, createdAt: new Date().toISOString() };
    if (isEmployerDemoMode) {
      setEmployerDemoInterviews((current) => [nextInterview, ...current]);
      const application = activeEmployerApplications.find((item) => item.workerId === interviewForm.candidateId && item.jobId === interviewForm.jobId);
      if (application) updateApplicationStage(application.id, "Interview Scheduled");
      setInterviewForm({ candidateId: "", jobId: "", date: "", time: "", mode: "Phone", location: "", notes: "" });
      setStatusMessage("Demo interview scheduled.");
      return;
    }
    persistEmployerInterviews([nextInterview, ...employerInterviews]);
    const application = activeEmployerApplications.find((item) => item.workerId === interviewForm.candidateId && item.jobId === interviewForm.jobId);
    if (application) updateApplicationStage(application.id, "Interview Scheduled");
    setInterviewForm({ candidateId: "", jobId: "", date: "", time: "", mode: "Phone", location: "", notes: "" });
    setStatusMessage(isLocalizedLanguage ? "इंटरव्यू शेड्यूल हो गया।" : "Interview scheduled.");
  }

  function sendEmployerMessage(workerId, jobId = "") {
    const workerRecord = employerWorkerSource.find((item) => item.workerId === workerId);
    const nextMessage = {
      id: `msg-${Date.now()}`,
      workerId,
      jobId,
      subject: workerRecord ? `${workerRecord.name} contact request` : "Contact request",
      lastMessage: "Contact request sent. Waiting for worker response.",
      updatedAt: new Date().toISOString()
    };
    if (isEmployerDemoMode) {
      setEmployerDemoMessages((current) => [nextMessage, ...current]);
      setStatusMessage("Demo contact request created.");
      return;
    }
    persistEmployerMessages([nextMessage, ...employerMessages]);
    setStatusMessage(isLocalizedLanguage ? "संपर्क अनुरोध भेजा गया।" : "Contact request sent.");
  }

  function enterEmployerDemoMode() {
    setIsEmployerDemoMode(true);
    setEmployerDemoApplications(demoEmployerApplications);
    setEmployerDemoInterviews([]);
    setEmployerDemoMessages([]);
    setShortlistedWorkers(demoEmployerApplications.filter((item) => ["Shortlisted", "Interview Scheduled", "Selected"].includes(item.status)).map((item) => item.workerId));
    setSelectedCompareWorkers([]);
    setEmployerFilters({ skill: "", city: "", availability: "" });
    setEmployerWorkerFilters({ experience: "", wageMax: "", readiness: "", language: "", resumeReady: false, incomePassport: false });
    setEmployerSearch("");
    setEmployerSort("match");
    setEmployerSmartFilters([workerCopy.recommendations.verifiedOnly, workerCopy.recommendations.highestMatch]);
    setStatusMessage("");
  }

  function exitEmployerDemoMode() {
    setIsEmployerDemoMode(false);
    setEmployerDemoApplications([]);
    setEmployerDemoInterviews([]);
    setEmployerDemoMessages([]);
    setDraggedEmployerApplicationId("");
    setShortlistedWorkers([]);
    setSelectedCompareWorkers([]);
    setStatusMessage("Returned to the real employer workspace.");
  }

  function reviewRecommendedEmployerWorkers() {
    setEmployerSort("match");
    setEmployerSmartFilters([workerCopy.recommendations.verifiedOnly, workerCopy.recommendations.highestMatch]);
    setEmployerSearch("");
    navigateTo("/employer/workers");
  }

  function resetEmployerWorkspaceFilters() {
    setEmployerFilters({ skill: "", city: "", availability: "" });
    setEmployerWorkerFilters({ experience: "", wageMax: "", readiness: "", language: "", resumeReady: false, incomePassport: false });
    setEmployerSearch("");
    setEmployerSort("match");
    setEmployerSmartFilters([workerCopy.recommendations.verifiedOnly, workerCopy.recommendations.highestMatch]);
  }

  function toggleCompareWorker(workerId) {
    setSelectedCompareWorkers((current) => current.includes(workerId)
      ? current.filter((id) => id !== workerId)
      : current.length >= 3 ? current : [...current, workerId]);
  }

  async function startVoiceInput() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert(t.speechUnsupported);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = speechLocales[normalizeLanguage(lang)] || "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSmartInput(transcript);
      applySmartInput(transcript);
    };
    recognition.start();
  }

  async function downloadResume({ preview = false } = {}) {
    if (!hasGeneratedProfile && !routeDemoProfile) {
      setErrorMessage(t.generateProfileFirst);
      return;
    }
    if (!preview) {
      setIsBuildingResume(true);
      for (let index = 0; index < resumeBuildSteps.length; index += 1) {
        setResumeBuildStepIndex(index);
        await new Promise((resolve) => window.setTimeout(resolve, 260));
      }
    }
    const resumeWorker = identityPageWorker || worker;
    const resumeIdentity = toEnglishArtifactIdentity(identityPageIdentity || careerIdentity, resumeWorker);
    const generatedResume = localResume({ ...resumeWorker, uiLanguage: "en", preferredLanguage: "en" });
    const sections = generatedResume.sections || [];
    const summary = sections[0]?.body || resumeIdentity.resumeSummary || "";
    const qrUrl = await QRCode.toDataURL(resumeIdentity.profileUrl || publicProfileUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 256
    });
    const skills = [roleLabelEnglish(resumeWorker.skill), ...(resumeIdentity.secondarySkills || secondarySkills || [])].slice(0, 6);
    const pdfWorkRecords = (identityPageRecords.length ? identityPageRecords.slice(0, 4) : [{
      id: "SELF-RECORDED",
      employer: `${cityLabelEnglish(resumeWorker.city)} verified work history`,
      jobType: roleLabelEnglish(resumeWorker.skill),
      date: currentIssueDate,
      location: cityLabelEnglish(resumeWorker.city),
      status: translations.en.verified || "Verified"
    }]);
    openPrintableDocument(`${resumeWorker.name} Resume`, `
      <style>
        body{background:#f8fafc;margin:0;padding:28px}
        .resume-page{width:794px;min-height:1123px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;box-shadow:0 18px 60px rgba(15,23,42,.12);overflow:hidden}
        .resume-top{display:grid;grid-template-columns:1fr 132px;gap:24px;padding:30px 34px 22px;border-top:6px solid #2563eb;background:linear-gradient(135deg,#ffffff 0%,#f8fbff 55%,#f0fdf4 100%)}
        .resume-logo{height:42px;width:auto;object-fit:contain}.resume-name{font-size:34px;line-height:1.05;margin:18px 0 6px;font-weight:900;color:#0f172a}.resume-role{font-size:16px;font-weight:800;color:#2563eb;margin:0}
        .badge{display:inline-flex;margin-top:12px;border:1px solid #bbf7d0;background:#f0fdf4;color:#16a34a;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900}.qr{border:1px solid #e2e8f0;border-radius:14px;background:#fff;padding:10px;text-align:center}.qr img{width:108px;height:108px}.qr p{font-size:10px;font-weight:900;color:#64748b;margin:6px 0 0;text-transform:uppercase;letter-spacing:.08em}
        .resume-meta{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 34px 20px}.meta{border:1px solid #e2e8f0;border-radius:10px;padding:10px}.meta span{display:block;font-size:10px;font-weight:900;color:#64748b;text-transform:uppercase;letter-spacing:.08em}.meta strong{display:block;margin-top:4px;font-size:13px;color:#0f172a}
        .resume-body{display:grid;grid-template-columns:1.5fr .9fr;gap:24px;padding:0 34px 28px}.section{margin-top:18px}.section h2{font-size:12px;color:#2563eb;font-weight:900;letter-spacing:.14em;text-transform:uppercase;margin:0 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:6px}.section p,.section li{font-size:13px;line-height:1.58;color:#334155;font-weight:600}.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{border:1px solid #dbeafe;background:#eff6ff;border-radius:999px;padding:6px 9px;font-size:12px;font-weight:800;color:#1d4ed8}
        .record{border:1px solid #e2e8f0;border-radius:10px;padding:10px;margin-top:8px}.record strong{display:block;color:#0f172a;font-size:13px}.record span{display:block;color:#64748b;font-size:11px;font-weight:800;margin-top:3px}.side-card{border:1px solid #e2e8f0;border-radius:12px;padding:12px;margin-top:10px}.footer{border-top:1px solid #e2e8f0;padding:14px 34px;color:#64748b;font-size:11px;font-weight:800;display:flex;justify-content:space-between;gap:16px}
        @media print{@page{size:A4;margin:12mm}body{background:#fff;padding:0}.resume-page{width:auto;min-height:auto;box-shadow:none;border-radius:0;border:0}.resume-top{border-top-color:#2563eb}}
      </style>
      <article class="resume-page">
        <header class="resume-top">
          <div>
            <img class="resume-logo" src="${logoFull}" alt="${logoAlt}" />
            <h1 class="resume-name">${escapeHtml(resumeWorker.name)}</h1>
            <p class="resume-role">${escapeHtml(roleLabelEnglish(resumeWorker.skill))} • ${escapeHtml(cityLabelEnglish(resumeWorker.city))}</p>
            <span class="badge">${escapeHtml(resumeArtifactLabels.verifiedWorker)}</span>
          </div>
          <div class="qr">
            <img src="${qrUrl}" alt="${escapeHtml(resumeArtifactLabels.digitalIdentityQr)}" />
            <p>${escapeHtml(resumeArtifactLabels.scanToVerify)}</p>
          </div>
        </header>
        <div class="resume-meta">
          <div class="meta"><span>${escapeHtml(resumeArtifactLabels.workerId)}</span><strong>${escapeHtml(resumeIdentity.workerId || resolvedWorkerId)}</strong></div>
          <div class="meta"><span>${escapeHtml(resumeArtifactLabels.phone)}</span><strong>${escapeHtml(resumeWorker.phone || resumeArtifactLabels.demoContact)}</strong></div>
          <div class="meta"><span>${escapeHtml(resumeArtifactLabels.languages)}</span><strong>${escapeHtml(resumeWorker.languages || notAvailableEnglish)}</strong></div>
          <div class="meta"><span>${escapeHtml(resumeArtifactLabels.availability)}</span><strong>${escapeHtml(resumeWorker.availability || notAvailableEnglish)}</strong></div>
        </div>
        <main class="resume-body">
          <section>
            <div class="section"><h2>${escapeHtml(resumeArtifactLabels.professionalSummary)}</h2><p>${escapeHtml(summary)}</p></div>
            <div class="section"><h2>${escapeHtml(resumeArtifactLabels.workExperience)}</h2>${pdfWorkRecords.map((record) => `<div class="record"><strong>${escapeHtml(record.employer || record.worksite || notAvailableEnglish)}</strong><span>${escapeHtml(record.jobType || roleLabelEnglish(resumeWorker.skill))} • ${escapeHtml(record.date || currentIssueDate)} • ${escapeHtml(record.location || cityLabelEnglish(resumeWorker.city))}</span></div>`).join("")}</div>
            <div class="section"><h2>${escapeHtml(resumeArtifactLabels.verifiedWorkStrengths)}</h2><ul>${(sections.slice(1, 4).map((section) => `<li>${escapeHtml(section.body)}</li>`).join("") || `<li>${escapeHtml(resumeIdentity.resumeSummary || summary)}</li>`)}</ul></div>
          </section>
          <aside>
            <div class="section"><h2>${escapeHtml(resumeArtifactLabels.skills)}</h2><div class="chips">${skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}</div></div>
            <div class="section side-card"><h2>${escapeHtml(resumeArtifactLabels.languages)}</h2><p>${escapeHtml(resumeWorker.languages || notAvailableEnglish)}</p></div>
            <div class="section side-card"><h2>${escapeHtml(resumeArtifactLabels.digitalIdentity)}</h2><p>${escapeHtml(resumeIdentity.verificationStatus || artifactLabels.statusVerified || "Verified")} • ${escapeHtml(resumeIdentity.skillConfidence || 96)}% ${escapeHtml(resumeArtifactLabels.skillConfidence)}</p></div>
            <div class="section side-card"><h2>${escapeHtml(resumeArtifactLabels.preferredWork)}</h2><p>${escapeHtml(resumeWorker.availability || notAvailableEnglish)} • ${escapeHtml(formatCurrency(resumeWorker.expectedWage || 0))}/${escapeHtml(resumeArtifactLabels.monthExpectedWage)}</p></div>
          </aside>
        </main>
        <footer class="footer">
          <span>${escapeHtml(resumeArtifactLabels.generatedBy)}</span>
          <span>${escapeHtml(resumeArtifactLabels.verifiedDigitalIdentity)} • ${escapeHtml(currentIssueDate)}</span>
        </footer>
      </article>
    `, !preview);
    setIsBuildingResume(false);
    setResumeBuildStepIndex(-1);
    setStatusMessage(t.resumeSuccess);
  }

  function downloadProfileResume(profileData) {
    const profileResume = localResume({ ...profileData, uiLanguage: "en", preferredLanguage: "en" });
    const content = [
      `${profileData.name} - ${roleLabelEnglish(profileData.skill)}`,
      `${resumeArtifactLabels.workerId}: ${profileData.workerId || createWorkerId(profileData)}`,
      `City: ${cityLabelEnglish(profileData.city)}`,
      `Experience: ${profileData.experience} years`,
      `Languages: ${profileData.languages}`,
      "",
      ...profileResume.sections.map((section) => `${section.heading}\n${section.body}\n`)
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${profileData.name.replace(/\s+/g, "-")}-resume.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function downloadCertificatePdf() {
    const exportNode = workerCardExportRef.current;
    if (!exportNode || cardExportStepIndex >= 0) return;

    const steps = isLocalizedLanguage
      ? ["डिजिटल वर्कर कार्ड तैयार हो रहा है…", "सत्यापित पहचान कैप्चर हो रही है…", "डाउनलोड बनाया जा रहा है…", "डाउनलोड तैयार ✓"]
      : [`Preparing ${workerCopy.documents.workerCard}…`, "Capturing verified identity…", "Generating download…", "Download ready ✓"];

    try {
      setErrorMessage("");
      for (let index = 0; index < steps.length - 1; index += 1) {
        setCardExportStepIndex(index);
        setStatusMessage(steps[index]);
        await new Promise((resolve) => window.setTimeout(resolve, index === 0 ? 180 : 260));
      }

      const { default: html2canvas } = await import("html2canvas");
      await document.fonts?.ready;
      const canvas = await html2canvas(exportNode, {
        backgroundColor: null,
        scale: Math.min(3, window.devicePixelRatio || 2),
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      setCardExportStepIndex(steps.length - 2);
      setStatusMessage(steps[steps.length - 2]);

      const dataUrl = canvas.toDataURL("image/png", 1);
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = `${toDownloadSlug(worker.name)}-digital-worker-card.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      setCardExportStepIndex(steps.length - 1);
      setStatusMessage(steps[steps.length - 1]);
      window.setTimeout(() => {
        setCardExportStepIndex(-1);
        setStatusMessage("");
      }, 1600);
    } catch (error) {
      console.error(error);
      setCardExportStepIndex(-1);
      setStatusMessage("");
      setErrorMessage(isLocalizedLanguage ? "डिजिटल वर्कर कार्ड नहीं बन पाया। कृपया फिर कोशिश करें।" : "Could not generate worker card. Please try again.");
    }
  }

  function downloadWorkHistory() {
    const lines = [
      `RozgaarAI ${workerCopy.incomePassport.title} - ${worker.name}`,
      `${t.workerId}: ${resolvedWorkerId}`,
      "",
      `${t.passport.employmentSummary}: ${incomeSummary.totalDays} ${t.passport.recorded}, ${formatCurrency(incomeSummary.totalIncome)} ${t.passport.totalEarned}, ${formatCurrency(incomeSummary.pending)} ${t.passport.paymentPending}`,
      "",
      ...workRecords.map((record) => `${record.date} | ${record.employer} | ${record.jobType} | ${record.location} | ${record.hoursWorked}h | ${formatCurrency(record.paymentReceived)} received | ${formatCurrency(record.paymentPending)} pending | ${record.status}`)
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${worker.name.replace(/\s+/g, "-")}-work-income-passport.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadEmploymentProof(record) {
    openPrintableDocument(`${record.id} Employment Proof`, `
      <div class="doc-head">
        <img class="doc-logo" src="${logoFull}" alt="${logoAlt}" />
        <p class="brand">${t.passport.digitalProof}</p>
      </div>
      <h1>${t.passport.employmentRecord}</h1>
      <p class="muted">${record.id} • ${resolvedWorkerId}</p>
      <div class="grid">
        <div class="box"><strong>${t.passport.employer}</strong><br/>${record.employer}</div>
        <div class="box"><strong>${t.passport.worker}</strong><br/>${record.worker}</div>
        <div class="box"><strong>${t.passport.dates}</strong><br/>${record.date}</div>
        <div class="box"><strong>${t.passport.location}</strong><br/>${record.location}</div>
        <div class="box"><strong>${t.passport.workType}</strong><br/>${record.jobType}</div>
        <div class="box"><strong>${t.passport.duration}</strong><br/>${record.hoursWorked} ${t.passport.hoursWorked}</div>
        <div class="box"><strong>${t.passport.received}</strong><br/>${formatCurrency(record.paymentReceived)}</div>
        <div class="box"><strong>${t.passport.verificationStatus}</strong><br/>${record.status}</div>
      </div>
      <p>${t.passport.trustedSummary}</p>
    `);
  }

  async function checkOffer() {
    setIsCheckingRisk(true);
    setStatusMessage(t.loadingSafety);
    setErrorMessage("");
    try {
      setRisk(await api.fakeCheck({ ...offer, uiLanguage: lang, preferredLanguage: lang }));
      setStatusMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage(t.profileError);
    } finally {
      setIsCheckingRisk(false);
    }
  }

  function loadDemoWhatsAppMessage() {
    setWhatsAppMessage(demoWhatsAppJobMessage);
    setExtractedOffer(null);
    setExtractionStepIndex(-1);
  }

  async function analyzeWhatsAppOffer() {
    const message = whatsAppMessage.trim();
    if (!message) {
      setErrorMessage(isLocalizedLanguage ? "कृपया WhatsApp नौकरी संदेश paste करें।" : `Paste a ${workerCopy.rights.whatsapp} first.`);
      return;
    }
    setErrorMessage("");
    setIsAnalyzingMessage(true);
    setExtractedOffer(null);
    try {
      for (let index = 0; index < extractionSteps.length; index += 1) {
        setExtractionStepIndex(index);
        await new Promise((resolve) => window.setTimeout(resolve, 420));
      }
      const extraction = parseWhatsAppJobMessage(message);
      const nextOffer = { ...offer, ...extraction.offer };
      setOffer(nextOffer);
      setRisk(localFakeCheck({ ...nextOffer, uiLanguage: lang, preferredLanguage: lang }));
      setExtractedOffer(extraction);
      setStatusMessage(isLocalizedLanguage ? "WhatsApp संदेश का AI विश्लेषण पूरा हुआ।" : "AI analysis completed and form populated.");
    } finally {
      setIsAnalyzingMessage(false);
      setExtractionStepIndex(-1);
    }
  }

  async function runCoach() {
    setIsCoaching(true);
    setStatusMessage(t.loadingCoach);
    setErrorMessage("");
    try {
      let nextCoach = buildLocalInterviewCoach(worker, coachMode, practiceLanguage, lang, activeDemoProfile);
      try {
        const aiCoach = await api.interviewCoach({ ...worker, uiLanguage: lang, preferredLanguage: lang, practiceLanguage, mode: coachMode });
        if (aiCoach?.questions?.length) {
          nextCoach = {
            ...nextCoach,
            ...aiCoach,
            mode: coachMode,
            practiceLanguage,
            answers: aiCoach.answers || aiCoach.questions.map((question) => ({ question, answer: nextCoach.answers[0]?.answer || "" }))
          };
        }
      } catch {
        // Local interview coach keeps Demo Mode reliable without AI keys.
      }
      setCoach(nextCoach);
      setCurrentQuestionIndex(0);
      setInterviewAnswer("");
      setAnswerFeedback(null);
      setStatusMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage(t.profileError);
    } finally {
      setIsCoaching(false);
    }
  }

  function evaluateAnswer() {
    const answer = interviewAnswer.trim();
    if (!answer) {
      setErrorMessage(t.interviewCoach.answerRequired);
      return;
    }
    setErrorMessage("");
    const wordCount = answer.split(/\s+/).filter(Boolean).length;
    const hasExample = /because|example|when|मैंने|क्योंकि|उदाहरण|जब/i.test(answer);
    const hasSkill = answer.toLowerCase().includes(worker.skill.toLowerCase()) || answer.includes(roleLabel(worker.skill));
    const clarity = wordCount >= 18 ? 88 : wordCount >= 10 ? 76 : 62;
    const confidence = Math.min(96, 62 + Math.min(wordCount * 2, 20) + (hasExample ? 8 : 0));
    const relevance = hasSkill ? 91 : 72;
    const communication = /time|wage|available|समय|मजदूरी|उपलब्ध|available/i.test(answer) ? 86 : 74;
    const completeness = Math.min(95, 58 + Math.min(wordCount * 2, 24) + (hasExample ? 10 : 0) + (hasSkill ? 8 : 0));
    const score = Math.round((clarity + confidence + relevance + communication + completeness) / 5);
    const tips = practiceLanguage === "hi"
      ? ["एक छोटा असली उदाहरण जोड़ें।", "काम का समय और मजदूरी साफ़ बताएं।", "सुरक्षा और भरोसे की बात जरूर करें।"]
      : ["Add one short real example.", "State timing and wage expectations clearly.", "Mention safety and trust signals."];
    const feedback = {
      score,
      clarity,
      confidence,
      relevance,
      communication,
      completeness,
      tips,
      message: practiceLanguage === "hi"
        ? "आपका जवाब अनुभव को अच्छी तरह बताता है। इसे और मजबूत बनाने के लिए किसी पुराने काम का एक उदाहरण जोड़ें।"
        : workerCopy.interviewCoach.feedbackMessage
    };
    setAnswerFeedback(feedback);
    setPracticeHistory((history) => [
      {
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        question: coach?.questions?.[currentQuestionIndex] || "",
        score,
        mode: coachMode,
        improvement: tips[0]
      },
      ...history
    ].slice(0, 6));
  }

  function skipQuestion() {
    const activeCoach = coach || buildLocalInterviewCoach(identityPageWorker, coachMode, practiceLanguage, lang, activeDemoProfile);
    if (!coach) setCoach(activeCoach);
    if (!activeCoach?.questions?.length) return;
    setCurrentQuestionIndex((index) => (index + 1) % activeCoach.questions.length);
    setInterviewAnswer("");
    setAnswerFeedback(null);
    setVoiceAnswerStatus("idle");
  }

  function useSampleAnswer() {
    const sample = coach?.answers?.[currentQuestionIndex]?.answer || localizedPracticeText(practiceLanguage, "sample", identityPageWorker.skill || worker.skill);
    setInterviewAnswer(sample);
    setVoiceAnswerStatus("completed");
  }

  function startVoiceAnswer() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceAnswerStatus("idle");
      setErrorMessage(t.voiceUnsupported);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = speechLocales[normalizeLanguage(practiceLanguage || lang)] || "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setVoiceAnswerStatus("listening");
    recognition.onresult = (event) => {
      setVoiceAnswerStatus("processing");
      setInterviewAnswer((current) => `${current ? `${current} ` : ""}${event.results[0][0].transcript}`.trim());
      window.setTimeout(() => setVoiceAnswerStatus("completed"), 450);
    };
    recognition.onerror = () => {
      setVoiceAnswerStatus("idle");
      setErrorMessage(t.voiceUnsupported);
    };
    recognition.onend = () => {
      setVoiceAnswerStatus((current) => current === "listening" ? "idle" : current);
    };
    recognition.start();
  }

  function changeInterviewLanguage(nextLanguage) {
    setPracticeLanguage(nextLanguage);
    const nextCoach = buildLocalInterviewCoach(identityPageWorker, coachMode, nextLanguage, lang, activeDemoProfile);
    setCoach(nextCoach);
    setCurrentQuestionIndex((index) => Math.min(index, nextCoach.questions.length - 1));
    setInterviewAnswer("");
    setVoiceAnswerStatus("idle");
    setAnswerFeedback((current) => current ? {
      ...current,
      tips: nextLanguage === "hi"
        ? ["एक छोटा असली उदाहरण जोड़ें।", "काम का समय और मजदूरी साफ़ बताएं।", "सुरक्षा और भरोसे की बात जरूर करें।"]
        : ["Add one short real example.", "State timing and wage expectations clearly.", "Mention safety and trust signals."],
      message: nextLanguage === "hi"
        ? "आपका जवाब अनुभव को अच्छी तरह बताता है। इसे और मजबूत बनाने के लिए किसी पुराने काम का एक उदाहरण जोड़ें।"
        : workerCopy.interviewCoach.feedbackMessage
    } : null);
  }

  const topMatch = matches[0];
  const activeDemoProfile = demoProfiles.find((profileData) => profileData.name === worker.name);
  const interviewModes = [
    ["quick", t.interviewCoach.modes.quick],
    ["simulation", t.interviewCoach.modes.simulation],
    ["confidence", t.interviewCoach.modes.confidence]
  ];
  const currentQuestion = coach?.questions?.[currentQuestionIndex] || "";
  const currentSampleAnswer = coach?.answers?.[currentQuestionIndex]?.answer || "";
  const interviewReadiness = answerFeedback?.score || coach?.score || activeDemoProfile?.interviewScore || (hasGeneratedProfile ? 72 : 0);
  const completedPracticeBoost = practiceHistory.length || coach ? 8 : 0;
  const readinessWithInterview = hasGeneratedProfile ? Math.min(100, Math.max(activeDemoProfile?.readiness || Number(topMatch?.score || 80), interviewReadiness + completedPracticeBoost)) : 0;
  const displayedPracticeHistory = practiceHistory.length ? practiceHistory : activeDemoProfile ? [
    {
      date: "24 Jun 2026",
      question: isLocalizedLanguage ? "पिछले काम का अनुभव बताएं।" : "Tell me about your previous work experience.",
      score: activeDemoProfile.interviewScore,
      mode: "quick",
      improvement: isLocalizedLanguage ? "एक मजबूत उदाहरण जोड़ें।" : "Add one stronger work example."
    }
  ] : [];
  const riskClass = risk.risk === "High" ? "text-red-600" : risk.risk.includes("Medium") ? "text-marigold" : "text-neem";
  const riskBaseScore = risk.risk === "High" ? 88 : risk.risk === "Medium" ? 66 : risk.risk === "Low-Medium" ? 42 : 18;
  const riskScore = Math.min(100, riskBaseScore + Math.max(0, risk.flags.length - 2) * 4);
  const safetyConfidence = Math.min(98, 84 + risk.flags.length * 3);
  const detectedRiskFactors = risk.flags.length ? risk.flags : [t.noRiskSignals];
  const riskFactorTitle = (flag) => {
    const titles = {
      "Asks for registration money before joining": isLocalizedLanguage ? "रजिस्ट्रेशन फीस मांगी गई" : "Registration fee detected",
      "No clear workplace address": isLocalizedLanguage ? "काम की जगह का पता नहीं है" : "Workplace address unavailable",
      "Salary looks unrealistic for an informal role": isLocalizedLanguage ? "वेतन असामान्य रूप से अधिक है" : "Unrealistic salary detected",
      "Unknown employer identity": isLocalizedLanguage ? "नियोक्ता की पहचान स्पष्ट नहीं" : "Employer identity missing",
      "Asks for documents before interview": isLocalizedLanguage ? "इंटरव्यू से पहले दस्तावेज़ मांगे गए" : "Original documents requested",
      "Poor contact details": isLocalizedLanguage ? "संपर्क जानकारी कमजोर है" : "Poor contact details",
      [t.noRiskSignals]: t.noRiskSignals
    };
    return titles[flag] || riskFlagLabel(flag);
  };
  const riskFactorReason = (flag) => {
    const reasons = {
      "Asks for registration money before joining": isLocalizedLanguage ? "जॉइनिंग से पहले पैसा मांगना फर्जी नौकरी का आम संकेत है।" : "Paying before joining is a common signal of fraudulent job offers.",
      "No clear workplace address": isLocalizedLanguage ? "बिना पते के काम की जगह और सुरक्षा सत्यापित नहीं हो सकती।" : "Without an address, the worksite and safety conditions cannot be verified.",
      "Salary looks unrealistic for an informal role": isLocalizedLanguage ? "बहुत अधिक वेतन अक्सर भरोसा जीतने के लिए इस्तेमाल किया जाता है।" : "Unusually high salary can be used to build false trust quickly.",
      "Unknown employer identity": isLocalizedLanguage ? "नियोक्ता की पहचान साफ न हो तो भुगतान और सुरक्षा जोखिम बढ़ता है।" : "Unclear employer identity increases payment and safety risk.",
      "Asks for documents before interview": isLocalizedLanguage ? "इंटरव्यू से पहले मूल दस्तावेज़ मांगना पहचान दुरुपयोग का जोखिम है।" : "Requesting documents before interview can lead to identity misuse.",
      "Poor contact details": isLocalizedLanguage ? "कमजोर संपर्क जानकारी से नियोक्ता को बाद में पकड़ना मुश्किल हो सकता है।" : "Weak contact details make the employer difficult to trace later.",
      [t.noRiskSignals]: isLocalizedLanguage ? "फिर भी नियोक्ता, पता और भुगतान शर्तें जुड़ने से पहले सत्यापित करें।" : "Still verify employer identity, address, and payment terms before joining."
    };
    return reasons[flag] || (isLocalizedLanguage ? "AI ने इसे श्रमिक सुरक्षा से जुड़ा जोखिम संकेत माना।" : "AI identified this as a worker safety risk signal.");
  };
  const resolvedWorkerId = profile?.workerId || workerId;
  const secondarySkills = t.careerIdentity.secondarySkillSuggestions[worker.skill] || t.careerIdentity.secondarySkillSuggestions.default;
  const suggestedSkillUpgrade = t.careerIdentity.skillUpgradeSuggestions[worker.skill] || t.careerIdentity.skillUpgradeSuggestions.default;
  const artifactLabels = translations.en.careerIdentity;
  const resumeArtifactLabels = translations.en.resumeLabels;
  const roleLabelEnglish = (role) => translateOption("roleLabels", role, "en");
  const cityLabelEnglish = (city) => translateOption("cityLabels", city, "en");
  const notAvailableEnglish = translations.en.notAvailable || "Not available";
  const fairWageText = wage ? `₹${wage.low.toLocaleString("en-IN")}-₹${wage.high.toLocaleString("en-IN")}` : t.notAvailable;
  const publicProfileUrl = getWorkerPublicProfileUrl(resolvedWorkerId);
  const workRecords = wageEntries.length ? wageEntries : [];
  const incomeSummary = summarizeIncome(workRecords);
  const monthlyIncomeTimeline = Object.entries(incomeSummary.monthly);
  const passportVerificationUrl = `${publicProfileUrl}#employment`;
  const careerIdentity = {
    name: worker.name || t.emptyWorkerName,
    occupation: worker.skill ? roleLabel(worker.skill) : t.notAvailable,
    city: worker.city ? cityLabel(worker.city) : t.notAvailable,
    workerId: resolvedWorkerId,
    experience: worker.experience ? `${worker.experience} ${t.common.years}` : t.notAvailable,
    primarySkill: worker.skill ? roleLabel(worker.skill) : t.notAvailable,
    secondarySkills,
    languages: worker.languages || t.notAvailable,
    availability: worker.availability || t.notAvailable,
    preferredWorkType: t.careerIdentity.preferredWorkTypeValue,
    expectedWage: worker.expectedWage ? `₹${Number(worker.expectedWage || 0).toLocaleString("en-IN")}/${t.common.monthly}` : t.notAvailable,
    fairWage: wage ? `${fairWageText}/${t.common.monthly}` : t.notAvailable,
    skillConfidence: hasGeneratedProfile ? activeDemoProfile?.readiness || Math.max(90, Math.min(98, Number(topMatch?.score || 92))) : 0,
    bestJobMatch: hasGeneratedProfile ? activeDemoProfile?.jobMatch || topMatch?.score || 0 : 0,
    matchingJobs: matches.length,
    nearbyOpportunities: t.careerIdentity.nearbyOpportunitiesValue,
    suggestedSkillUpgrade,
    profileUrl: publicProfileUrl,
    contact: worker.phone || t.notAvailable,
    resumeSummary: localizedSummary,
    incomeThisMonth: formatCurrency(incomeSummary.totalIncome),
    employmentRecords: workRecords.length,
    workRecords: workRecords.slice(0, 5),
    certificates: profile?.certificates || [],
	    interviewReadiness: hasGeneratedProfile ? `${interviewReadiness}%` : t.notAvailable,
	    shareSettings: {
	      ...defaultShareSettings,
	      ...(profile?.shareSettings || worker.shareSettings || {})
	    },
	    publicStatus: profile?.publicStatus || worker.publicStatus || "active",
	    statusBadges: activeDemoProfile?.badges?.map(demoBadgeLabel) || [
      t.careerIdentity.statusVerified,
      t.careerIdentity.statusAvailable,
      `${t.careerIdentity.statusInterview}${activeDemoProfile?.interviewScore ? ` ${activeDemoProfile.interviewScore}%` : ""}`,
      t.careerIdentity.statusResume,
      t.careerIdentity.statusSkillCard,
      t.careerIdentity.statusDocuments
    ]
  };
  function toEnglishArtifactIdentity(identity, sourceWorker = worker, sourceWage = wage) {
    if (!identity) return identity;
    const englishSecondarySkills = artifactLabels.secondarySkillSuggestions?.[sourceWorker?.skill] || artifactLabels.secondarySkillSuggestions?.default || identity.secondarySkills || [];
    const englishStatusBadges = [
      artifactLabels.statusVerified,
      artifactLabels.statusAvailable,
      artifactLabels.statusResume,
      artifactLabels.statusSkillCard
    ].filter(Boolean);
    const englishFairWage = sourceWage
      ? `₹${Number(sourceWage.low || sourceWage.fair || 0).toLocaleString("en-IN")}-₹${Number(sourceWage.high || sourceWage.fair || 0).toLocaleString("en-IN")}/Monthly`
      : identity.fairWage;
    return {
      ...identity,
      occupation: sourceWorker?.skill ? roleLabelEnglish(sourceWorker.skill) : identity.occupation || notAvailableEnglish,
      city: sourceWorker?.city ? cityLabelEnglish(sourceWorker.city) : identity.city || notAvailableEnglish,
      experience: sourceWorker?.experience ? `${sourceWorker.experience} years` : identity.experience || notAvailableEnglish,
      primarySkill: sourceWorker?.skill ? roleLabelEnglish(sourceWorker.skill) : identity.primarySkill || notAvailableEnglish,
      secondarySkills: englishSecondarySkills,
      preferredWorkType: artifactLabels.preferredWorkTypeValue || identity.preferredWorkType,
      expectedWage: sourceWorker?.expectedWage ? `₹${Number(sourceWorker.expectedWage || 0).toLocaleString("en-IN")}/Monthly` : identity.expectedWage || notAvailableEnglish,
      fairWage: englishFairWage,
      nearbyOpportunities: artifactLabels.nearbyOpportunitiesValue || identity.nearbyOpportunities,
      suggestedSkillUpgrade: artifactLabels.skillUpgradeSuggestions?.[sourceWorker?.skill] || artifactLabels.skillUpgradeSuggestions?.default || identity.suggestedSkillUpgrade,
      resumeSummary: sourceWorker?.notes || identity.resumeSummary,
      statusBadges: englishStatusBadges
    };
  }
  const englishCareerIdentity = toEnglishArtifactIdentity(careerIdentity, worker, wage);
  const rahulPreviewIdentity = {
    name: "Rahul Kumar",
    occupation: "Electrician",
    city: "Gurugram, Haryana",
    workerId: "RZG-DEL-ELC-7895",
    photoUrl: rahulWorkerPhoto,
    experience: `4 ${t.common.years}`,
    primarySkill: "Electrical Work",
    secondarySkills: ["Wiring", "Switchboard Repair", "Appliance Repair", "Safety Checks"],
    languages: "Hindi",
    availability: "Available for Work",
    preferredWorkType: t.careerIdentity.preferredWorkTypeValue,
    expectedWage: `₹32,000/${t.common.monthly}`,
    fairWage: `₹30,000-₹36,000/${t.common.monthly}`,
    skillConfidence: 94,
    bestJobMatch: 96,
    matchingJobs: 12,
    nearbyOpportunities: t.careerIdentity.nearbyOpportunitiesValue,
    suggestedSkillUpgrade: "Electrical safety certification",
    profileUrl: getWorkerPublicProfileUrl("RZG-DEL-ELC-7895"),
    contact: "9876507895",
    resumeSummary: "Verified electrician with four years of experience in residential wiring, switchboard repair, appliance checks, and safe maintenance work.",
    incomeThisMonth: "₹32,000",
    employmentRecords: 9,
    interviewReadiness: "94%",
    issuedOn: "09 Jul 2026",
    lastUpdated: "09 Jul 2026",
    statusBadges: [
      t.careerIdentity.statusVerified,
      t.careerIdentity.statusAvailable,
      t.careerIdentity.statusResume,
      t.careerIdentity.statusSkillCard
    ]
  };
  const cardExportSteps = isLocalizedLanguage
    ? ["डिजिटल वर्कर कार्ड तैयार हो रहा है…", "सत्यापित पहचान कैप्चर हो रही है…", "डाउनलोड बनाया जा रहा है…", "डाउनलोड तैयार ✓"]
    : [`Preparing ${workerCopy.documents.workerCard}…`, "Capturing verified identity…", "Generating download…", "Download ready ✓"];
  const isExportingWorkerCard = cardExportStepIndex >= 0;
  const digitalWorkerCardDownloadLabel = isExportingWorkerCard
    ? cardExportSteps[Math.min(cardExportStepIndex, cardExportSteps.length - 1)]
    : t.certificate.downloadPdf;
  const hiddenDigitalWorkerCardExport = (
    <div className="digital-worker-card-export" aria-hidden="true">
      <div ref={workerCardExportRef} className="digital-worker-card-export-frame">
        <DigitalCareerIdentityCard identity={englishCareerIdentity} labels={artifactLabels} variant="full" contentMode="identityOnly" />
      </div>
    </div>
  );
  const employerDemoWorkers = demoProfiles.slice(0, employerDemoWorkerCount);
  const employerDemoWorkerIds = new Set(employerDemoWorkers.map((item) => item.workerId));
  const realEmployerWorkers = sampleWorkers.filter((item) => item.workerId && !employerDemoWorkerIds.has(item.workerId));
  const employerWorkerSource = isEmployerDemoMode ? employerDemoWorkers : realEmployerWorkers;
  const employerWorkers = employerWorkerSource
    .filter((item) => !employerFilters.skill || item.skill === employerFilters.skill)
    .filter((item) => !employerFilters.city || item.city === employerFilters.city)
    .filter((item) => !employerFilters.availability || item.availability.toLowerCase().includes(employerFilters.availability.toLowerCase()))
    .filter((item) => !employerWorkerFilters.experience || Number(item.experience || 0) >= Number(employerWorkerFilters.experience))
    .filter((item) => !employerWorkerFilters.wageMax || Number(item.expectedWage || 0) <= Number(employerWorkerFilters.wageMax))
    .filter((item) => !employerWorkerFilters.readiness || Number(item.readiness || 0) >= Number(employerWorkerFilters.readiness))
    .filter((item) => !employerWorkerFilters.language || String(item.languages || "").toLowerCase().includes(employerWorkerFilters.language.toLowerCase()))
    .filter((item) => {
      const query = employerSearch.trim().toLowerCase();
      if (!query) return true;
      return [item.name, item.skill, item.city, item.languages, item.availability, item.workerId, String(item.expectedWage || "")]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .filter((item) => !employerSmartFilters.includes("Immediate Joiners") || /available|immediate|तुरंत|उपलब्ध/i.test(item.availability || ""))
    .filter((item) => !employerSmartFilters.includes("Women Workers") || ["Asha Kumari", "Rekha Devi"].includes(item.name))
    .filter((item) => !employerSmartFilters.includes("Interview Ready") || Number(item.interviewScore || item.readiness || 0) >= 88)
    .sort((a, b) => {
      if (employerSmartFilters.includes("Nearby")) {
        const preferredCity = employerFilters.city || worker.city;
        return Number(b.city === preferredCity) - Number(a.city === preferredCity);
      }
      return employerSmartFilters.includes(workerCopy.recommendations.highestMatch)
        ? Number(b.jobMatch || 0) - Number(a.jobMatch || 0)
        : Number(b.readiness || 0) - Number(a.readiness || 0);
    })
    .sort((a, b) => {
      if (employerSort === "wage") return Number(a.expectedWage || 0) - Number(b.expectedWage || 0);
      if (employerSort === "experience") return Number(b.experience || 0) - Number(a.experience || 0);
      if (employerSort === "readiness") return Number(b.readiness || 0) - Number(a.readiness || 0);
      return Number(b.jobMatch || 0) - Number(a.jobMatch || 0);
    });
  const employerCompanyName = account?.name ? `${account.name}${account.role === ROLES.EMPLOYER ? "" : " Hiring"}` : "RozgaarAI Hiring Desk";
  const employerDemoJobs = [
    { id: "job-electrician-gurugram", title: "Residential Electrician", category: "Electrician", city: "Delhi", wageMin: 28000, wageMax: 36000, wageType: "Monthly", employmentType: "Full-time", openings: 3, status: "Active", postedAt: "2026-07-09", closingDate: "2026-07-30", description: "Hire verified electricians for home wiring, switchboard repair, and safety checks.", experienceRequired: 3, languages: "Hindi", benefits: "Weekly payments, safety gear", workHours: "9 AM - 6 PM", requirements: "No registration fees. Aadhaar copy only after selection.", contactMethod: "Phone" },
    { id: "job-domestic-delhi", title: "Verified Domestic Worker", category: "Domestic Worker", city: "Delhi", wageMin: 18000, wageMax: 24000, wageType: "Monthly", employmentType: "Full-time", openings: 2, status: "Active", postedAt: "2026-07-08", closingDate: "2026-07-28", description: "Experienced domestic workers for cooking support, cleaning, and elderly care routines.", experienceRequired: 2, languages: "Hindi", benefits: "Monthly pay, weekly off", workHours: "8 AM - 5 PM", requirements: "Verified work history preferred.", contactMethod: "WhatsApp" },
    { id: "job-plumber-bhopal", title: "Home Maintenance Plumber", category: "Plumber", city: "Bhopal", wageMin: 25000, wageMax: 32000, wageType: "Monthly", employmentType: "Full-time", openings: 2, status: "Active", postedAt: "2026-07-10", closingDate: "2026-07-31", description: "Plumber needed for leak repair, fittings, and urgent home maintenance visits.", experienceRequired: 4, languages: "Hindi, Basic English", benefits: "Travel allowance, weekly payout option", workHours: "9 AM - 7 PM", requirements: "Verified work records preferred.", contactMethod: "Phone" },
    { id: "job-tailor-raipur", title: "Boutique Tailor", category: "Tailor", city: "Raipur", wageMin: 16000, wageMax: 22000, wageType: "Monthly", employmentType: "Full-time", openings: 1, status: "Active", postedAt: "2026-07-11", closingDate: "2026-07-29", description: "Tailor for blouse stitching, alterations, finishing, and customer measurements.", experienceRequired: 5, languages: "Hindi", benefits: "Monthly pay, festival bonus", workHours: "10 AM - 7 PM", requirements: "Machine stitching experience required.", contactMethod: "WhatsApp" },
    { id: "job-driver-nagpur", title: "Family Driver", category: "Driver", city: "Nagpur", wageMin: 24000, wageMax: 30000, wageType: "Monthly", employmentType: "Full-time", openings: 1, status: "Active", postedAt: "2026-07-04", closingDate: "2026-07-22", description: "Safe LMV driver with city route knowledge and punctual attendance.", experienceRequired: 4, languages: "Hindi, Marathi", benefits: "Fuel reimbursement, fixed route", workHours: "10 AM - 8 PM", requirements: "Valid license required.", contactMethod: "Phone" }
  ];
  const activeEmployerJobs = isEmployerDemoMode ? employerDemoJobs : employerJobs;
  const demoEmployerApplications = employerDemoWorkers.map((profileData, index) => {
    const job = employerDemoJobs[index % employerDemoJobs.length];
    return {
      id: `app-${profileData.workerId}`,
      workerId: profileData.workerId,
      jobId: job.id,
      status: employerDemoApplicationStatuses[index] || "Recommended",
      matchScore: profileData.jobMatch,
      appliedAt: `2026-07-${String(10 + index).padStart(2, "0")}`,
      updatedAt: `2026-07-${String(11 + index).padStart(2, "0")}`,
      employerNotes: ""
    };
  });
  const activeEmployerApplications = isEmployerDemoMode
    ? (employerDemoApplications.length ? employerDemoApplications : demoEmployerApplications)
    : employerApplications;
  const activeEmployerInterviews = isEmployerDemoMode ? employerDemoInterviews : employerInterviews;
  const activeEmployerMessages = isEmployerDemoMode ? employerDemoMessages : employerMessages;
  const employerRouteParts = routePath.split("/").filter(Boolean);
  const employerSection = routePath === "/employer" ? "overview" : employerRouteParts[1] || "overview";
  const employerRouteId = employerRouteParts[2] || "";
  const selectedEmployerWorker = employerRouteParts[1] === "workers" && employerRouteId
    ? employerWorkerSource.find((item) => (item.workerId || createWorkerId(item)) === decodeURIComponent(employerRouteId))
    : null;
  const selectedEmployerJob = employerRouteParts[1] === "jobs" && employerRouteId && employerRouteId !== "new"
    ? activeEmployerJobs.find((job) => job.id === decodeURIComponent(employerRouteId))
    : null;
  const employerApplicationsWithContext = activeEmployerApplications.map((application) => ({
    ...application,
    worker: employerWorkerSource.find((item) => item.workerId === application.workerId),
    job: activeEmployerJobs.find((job) => job.id === application.jobId)
  })).filter((application) => application.worker && application.job);
  const employerPipelineStages = isEmployerDemoMode ? employerDemoPipelineStages : ["Applied", "Reviewed", "Shortlisted", "Interview Scheduled", "Selected", "Hired"];
  const realEmployerAnalytics = {
    activeJobs: activeEmployerJobs.filter((job) => job.status === "Active").length,
    applicants: employerApplicationsWithContext.length,
    shortlisted: employerApplicationsWithContext.filter((item) => ["Shortlisted", "Interview Scheduled", "Selected", "Hired"].includes(item.status)).length,
    interviews: activeEmployerInterviews.length || employerApplicationsWithContext.filter((item) => item.status === "Interview Scheduled").length,
    hires: employerApplicationsWithContext.filter((item) => item.status === "Hired").length,
    contacted: new Set([...shortlistedWorkers, ...activeEmployerMessages.map((message) => message.workerId).filter(Boolean)]).size
  };
  const employerAnalytics = isEmployerDemoMode
    ? { activeJobs: 5, applicants: 5, shortlisted: 2, interviews: 1, contacted: 5, hires: 1 }
    : realEmployerAnalytics;
  const employerCopy = isLocalizedLanguage ? {
    overview: "ओवरव्यू", workers: "श्रमिक खोजें", jobs: "जॉब पोस्ट", applicants: "आवेदक", pipeline: "हायरिंग पाइपलाइन", messages: "संदेश", analytics: "एनालिटिक्स", company: "कंपनी प्रोफाइल", settings: "सेटिंग्स",
    search: "खोजें", postJob: "नौकरी पोस्ट करें", attention: "ध्यान देने योग्य", recent: "हाल की गतिविधि", assistant: "AI Hiring Assistant", recommended: "सुझाए गए श्रमिक देखें", activeJobs: "सक्रिय नौकरियाँ", newApplicants: "नए आवेदक", shortlisted: "शॉर्टलिस्ट", interviews: "इंटरव्यू", contacted: "संपर्क किए गए", hires: "इस महीने नियुक्ति",
    saveSearch: "सर्च सेव करें", filters: "फिल्टर", sort: "सॉर्ट", results: "परिणाम", viewProfile: "प्रोफाइल देखें", shortlist: "शॉर्टलिस्ट", contact: "संपर्क", save: "सेव", compare: "तुलना करें", schedule: "इंटरव्यू शेड्यूल करें", status: "स्थिति", actions: "एक्शन", noResults: "कोई परिणाम नहीं मिला। शहर, कौशल या मजदूरी फिल्टर बदलें।",
    title: "नियोक्ता कार्यक्षेत्र", subtext: "आज जिन hiring tasks पर ध्यान चाहिए।"
  } : {
    overview: "Overview", workers: "Find Workers", jobs: "Job Posts", applicants: "Applicants", pipeline: "Hiring Pipeline", messages: "Messages", analytics: "Analytics", company: "Company Profile", settings: "Settings",
    search: "Search", postJob: "Post a Job", attention: "Attention Required", recent: "Recent Activity", assistant: "AI Hiring Assistant", recommended: "Review Recommended Workers", activeJobs: "Active Job Posts", newApplicants: "New Applicants", shortlisted: "Shortlisted Candidates", interviews: "Interviews Scheduled", contacted: "Workers Contacted", hires: "Hires This Month",
    saveSearch: "Save search", filters: "Filters", sort: "Sort", results: "Results", viewProfile: "View Profile", shortlist: "Shortlist", contact: "Contact", save: "Save", compare: "Compare", schedule: "Schedule Interview", status: "Status", actions: "Actions", noResults: "No search results. Try broadening city, skill, or wage filters.",
    title: "Employer Workspace", subtext: "Here is what needs your attention today."
  };
  const employerNavItems = [
    [Gauge, employerCopy.overview, "/employer", "overview"],
    [Search, employerCopy.workers, "/employer/workers", "workers"],
    [BriefcaseBusiness, employerCopy.jobs, "/employer/jobs", "jobs"],
    [Users, employerCopy.applicants, "/employer/applicants", "applicants"],
    [Columns3, employerCopy.pipeline, "/employer/pipeline", "pipeline"],
    [MessageSquare, employerCopy.messages, "/employer/messages", "messages"],
    [BarChart3, employerCopy.analytics, "/employer/analytics", "analytics"],
    [Building2, employerCopy.company, "/employer/company", "company"],
    [Settings, employerCopy.settings, "/employer/settings", "settings"]
  ];
  const employerOverviewCopy = t.employerOverview;
  const hasEmployerJobs = activeEmployerJobs.length > 0;
  const activeJobCount = activeEmployerJobs.filter((job) => job.status === "Active").length;
  const applicantCount = employerApplicationsWithContext.length;
  const shortlistedCount = employerApplicationsWithContext.filter((item) => ["Shortlisted", "Interview Scheduled", "Selected", "Hired"].includes(item.status)).length;
  const interviewCount = activeEmployerInterviews.length || employerApplicationsWithContext.filter((item) => item.status === "Interview Scheduled").length;
  const hireCount = isEmployerDemoMode ? employerAnalytics.hires : employerApplicationsWithContext.filter((item) => ["Hired", "Selected"].includes(item.status)).length;
  const highMatchCount = employerWorkers.filter((item) => Number(item.jobMatch || 0) >= 95).length;
  const availableTodayCount = employerWorkers.filter((item) => /available|immediate|तुरंत|उपलब्ध/i.test(item.availability || "")).length;
  const firstActiveJob = activeEmployerJobs.find((job) => job.status === "Active") || activeEmployerJobs[0];
  const firstApplication = employerApplicationsWithContext[0];
  const firstShortlistedApplication = employerApplicationsWithContext.find((item) => ["Shortlisted", "Interview Scheduled", "Selected", "Hired"].includes(item.status));
  const firstInterviewApplication = employerApplicationsWithContext.find((item) => item.status === "Interview Scheduled") || firstShortlistedApplication;
  const employerOverviewBriefSummary = [
    { icon: Users, label: withCopyTokens(employerOverviewCopy.workersMatch, { count: employerWorkers.length }) },
    { icon: Sparkles, label: withCopyTokens(employerOverviewCopy.candidatesAvailable, { count: availableTodayCount }) },
    { icon: CalendarDays, label: withCopyTokens(employerOverviewCopy.interviewsTomorrow, { count: interviewCount }) },
    { icon: ShieldCheck, label: withCopyTokens(employerOverviewCopy.awaitingReview, { count: employerApplicationsWithContext.filter((item) => ["Applied", "Recommended"].includes(item.status)).length }) }
  ];
  const employerOverviewFunnelStages = [
    { label: employerOverviewCopy.postedJobs, value: activeJobCount, trend: withCopyTokens(employerOverviewCopy.fromLastMonth, { count: isEmployerDemoMode ? "+2" : "0" }), trendTone: isEmployerDemoMode ? "text-green-600" : "text-slate-400", icon: BriefcaseBusiness, tone: "border-blue-200 bg-blue-50 text-blue-700", onClick: () => navigateTo("/employer/jobs") },
    { label: employerOverviewCopy.applicants, value: applicantCount, trend: withCopyTokens(employerOverviewCopy.fromLastMonth, { count: isEmployerDemoMode ? "+5" : "0" }), trendTone: isEmployerDemoMode ? "text-green-600" : "text-slate-400", icon: Users, tone: "border-green-200 bg-green-50 text-green-700", onClick: () => navigateTo("/employer/applicants") },
    { label: employerOverviewCopy.shortlisted, value: shortlistedCount, trend: withCopyTokens(employerOverviewCopy.fromLastMonth, { count: isEmployerDemoMode ? "+2" : "0" }), trendTone: isEmployerDemoMode ? "text-green-600" : "text-slate-400", icon: Star, tone: "border-amber-200 bg-amber-50 text-amber-600", onClick: () => navigateTo("/employer/pipeline") },
    { label: employerOverviewCopy.interviews, value: interviewCount, trend: withCopyTokens(employerOverviewCopy.fromLastMonth, { count: isEmployerDemoMode ? "+1" : "0" }), trendTone: isEmployerDemoMode ? "text-green-600" : "text-slate-400", icon: CalendarDays, tone: "border-violet-200 bg-violet-50 text-violet-700", onClick: () => navigateTo("/employer/applicants") },
    { label: employerOverviewCopy.hires, value: hireCount, trend: withCopyTokens(employerOverviewCopy.fromLastMonth, { count: isEmployerDemoMode ? "+1" : "0" }), trendTone: isEmployerDemoMode ? "text-green-600" : "text-slate-400", icon: CheckCircle2, tone: "border-green-200 bg-green-50 text-green-700", onClick: () => navigateTo("/employer/pipeline") }
  ];
  const employerOverviewRecommendedWorkers = (hasEmployerJobs ? employerWorkers : []).map((item) => ({
    id: item.workerId || createWorkerId(item),
    name: item.name,
    role: roleLabel(item.skill),
    experience: `${item.experience} ${t.common.years}`,
    city: cityLabel(item.city),
    languages: item.languages,
    skill: roleLabel(item.skill),
    match: `${item.jobMatch || 90}%`,
    salary: formatCurrency(item.expectedWage || 0),
    available: employerOverviewCopy.available,
    availability: /available|immediate|तुरंत|उपलब्ध/i.test(item.availability || "") ? employerOverviewCopy.immediate : item.availability,
    avatar: item.avatar || item.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join(""),
    photoUrl: item.photoUrl,
    gradient: item.gradient
  }));
  const primaryInsightRole = firstActiveJob?.category ? roleLabel(firstActiveJob.category) : employerOverviewCopy.findWorkers;
  const primaryInsightRolePlural = isLocalizedLanguage || /s$/i.test(primaryInsightRole) ? primaryInsightRole : `${primaryInsightRole}s`;
  const primaryInsightCity = firstActiveJob?.city ? cityLabel(firstActiveJob.city) : employerOverviewCopy.locationFallback;
  const interviewConversion = applicantCount ? `${Math.round((hireCount / applicantCount) * 100)}%` : "0%";
  const employerOverviewInsights = hasEmployerJobs ? [
    {
      icon: TrendingUp,
      tone: "bg-blue-50 text-blue-700",
      title: withCopyTokens(employerOverviewCopy.insightDemandTitle, { role: primaryInsightRolePlural, city: primaryInsightCity }),
      body: withCopyTokens(employerOverviewCopy.insightDemandBody, { amount: formatCurrency(2000) })
    },
    {
      icon: MapPin,
      tone: "bg-green-50 text-green-700",
      title: withCopyTokens(employerOverviewCopy.insightMatchesTitle, { count: highMatchCount }),
      body: withCopyTokens(employerOverviewCopy.insightMatchesBody, { score: "95%" })
    },
    {
      icon: Clock3,
      tone: "bg-violet-50 text-violet-700",
      title: withCopyTokens(employerOverviewCopy.insightConversionTitle, { rate: interviewConversion }),
      body: employerOverviewCopy.insightConversionBody
    }
  ] : [
    { icon: Sparkles, tone: "bg-blue-50 text-blue-700", title: employerOverviewCopy.emptyInsightTitle, body: employerOverviewCopy.emptyInsightBody }
  ];
  const employerOverviewQuickActions = [
    { label: employerOverviewCopy.postAJob, icon: Plus, tone: "border-blue-100 bg-blue-50 text-blue-700", onClick: () => navigateTo("/employer/jobs/new") },
    { label: employerOverviewCopy.findWorkers, icon: Search, tone: "border-green-100 bg-green-50 text-green-700", onClick: () => navigateTo("/employer/workers") },
    { label: employerOverviewCopy.reviewApplicants, icon: Users, tone: "border-amber-100 bg-amber-50 text-amber-600", onClick: () => navigateTo("/employer/applicants") },
    { label: employerOverviewCopy.scheduleInterview, icon: CalendarDays, tone: "border-violet-100 bg-violet-50 text-violet-700", onClick: () => navigateTo("/employer/applicants") },
    { label: employerOverviewCopy.viewShortlisted, icon: Star, tone: "border-rose-100 bg-rose-50 text-rose-600", onClick: () => navigateTo("/employer/pipeline") }
  ];
  const employerOverviewTimelineEvents = [
    firstActiveJob && {
      time: "10:32 AM",
      title: withCopyTokens(employerOverviewCopy.newJobLive, { job: firstActiveJob.title }),
      meta: employerOverviewCopy.postedByYou,
      dot: "bg-blue-600"
    },
    firstApplication && {
      time: "11:15 AM",
      title: withCopyTokens(employerOverviewCopy.workerApplied, { worker: firstApplication.worker.name, job: firstApplication.job.title }),
      meta: employerOverviewCopy.newApplicationReceived,
      dot: "bg-green-500"
    },
    firstShortlistedApplication && {
      time: "11:20 AM",
      title: withCopyTokens(employerOverviewCopy.workerShortlisted, { worker: firstShortlistedApplication.worker.name, job: firstShortlistedApplication.job.title }),
      meta: employerOverviewCopy.addedToShortlist,
      dot: "bg-amber-500"
    },
    firstInterviewApplication && {
      time: "12:10 PM",
      title: withCopyTokens(employerOverviewCopy.interviewScheduled, { worker: firstInterviewApplication.worker.name }),
      meta: employerOverviewCopy.tomorrowTime,
      dot: "bg-violet-500"
    }
  ].filter(Boolean);
  const employerProfileFields = [employerCompanyName, account?.role, account?.city || account?.location, account?.email].filter(Boolean);
  const employerProfileCompletion = Math.max(25, Math.min(100, Math.round((employerProfileFields.length / 4) * 100)));
  const employerOverviewCompanySnapshot = {
    name: employerCompanyName,
    industry: account?.industry || account?.employerType || account?.role || employerOverviewCopy.industryFallback,
    location: account?.city || account?.location || employerOverviewCopy.locationFallback,
    completion: employerProfileCompletion,
    onEdit: () => navigateTo("/employer/company"),
    metrics: [
      { label: employerOverviewCopy.activeJobs, value: activeJobCount },
      { label: employerOverviewCopy.totalApplicants, value: applicantCount },
      { label: employerOverviewCopy.shortlisted, value: shortlistedCount },
      { label: employerOverviewCopy.hiredThisMonth, value: hireCount }
    ]
  };
  const dignityInsights = [
    [t.passport.incomeThisMonth, formatCurrency(incomeSummary.totalIncome), IndianRupee],
    [t.passport.daysWorked, incomeSummary.totalDays, CalendarClock],
    [t.passport.averageWage, formatCurrency(incomeSummary.avgDaily), Gauge],
    [t.passport.paymentPending, formatCurrency(incomeSummary.pending), WalletCards],
    [t.readiness.skill, hasGeneratedProfile ? `${careerIdentity.skillConfidence}%` : t.notAvailable, ShieldCheck],
    [t.readiness.interview, hasGeneratedProfile ? `${readinessWithInterview}%` : t.notAvailable, MessageSquare],
    [t.bestMatch, topMatch ? `${topMatch.score}%` : t.notAvailable, BriefcaseBusiness]
  ];
  const impactAnalytics = [
    [t.impactAnalytics.workersRegistered, "12,480"],
    [t.impactAnalytics.womenSupported, "5,240"],
    [t.impactAnalytics.jobsMatched, "8,930"],
    [t.impactAnalytics.avgWageIncrease, "18%"],
    [t.impactAnalytics.verifiedSkillCards, "9,780"],
    [t.impactAnalytics.interviewsCompleted, "4,620"],
    [t.impactAnalytics.citiesCovered, "42"],
    [t.impactAnalytics.incomeUnlocked, "₹7.8Cr"]
  ];
  const heroCapabilities = [
    [Mic, isLocalizedLanguage ? "Voice First" : "Voice First", isLocalizedLanguage ? "Natural onboarding in local languages." : "Natural onboarding in local languages."],
    [IdCard, isLocalizedLanguage ? "Verified Identity" : "Verified Identity", isLocalizedLanguage ? "Portable digital employment credentials." : "Portable digital employment credentials."],
    [FileText, isLocalizedLanguage ? "AI Resume" : "AI Resume", isLocalizedLanguage ? "Generated automatically from spoken experience." : "Generated automatically from spoken experience."],
    [BriefcaseBusiness, isLocalizedLanguage ? "Employer Ready" : "Employer Ready", isLocalizedLanguage ? "AI-powered job matching and interview readiness." : "AI-powered job matching and interview readiness."]
  ];
  const currentPathname = typeof window === "undefined" ? routePath : window.location.pathname;
  const isCreateProfileRoute = routePath === "/create-profile" || currentPathname === "/create-profile";
  const isDemoDashboardRoute = routePath === "/demo/dashboard" || routePath.startsWith("/demo/dashboard/");
  const isDemoExperience = Boolean(isDemoMode && isDemoDashboardRoute);
  const scopedUserProfiles = account ? userProfiles.filter((item) => item.userId === accountUserId(account)) : userProfiles;
  const latestUserProfile = [...scopedUserProfiles].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0];
  const routeWorkerId = routePath.startsWith("/worker/") || routePath.startsWith("/public/") || routePath.startsWith("/profile/")
    ? getWorkerIdFromPublicPath(routePath)
    : "";
  useEffect(() => {
    let active = true;
    if (!routeWorkerId || !(routePath.startsWith("/public/") || routePath.startsWith("/profile/"))) {
      setPublicWorkerRouteLookup(null);
      return () => {
        active = false;
      };
    }
    getPublicWorkerById(routeWorkerId).then((result) => {
      if (active) setPublicWorkerRouteLookup(result);
    });
    return () => {
      active = false;
    };
  }, [routeWorkerId, routePath]);
  const publicWorkerLookup = publicWorkerRouteLookup || (routeWorkerId ? getPublicWorkerByIdSync(routeWorkerId) : { status: "not-found", profile: null });
  const publicWorkerRecord = publicWorkerLookup.profile;
  const routeUserProfile = routeWorkerId ? (publicWorkerRecord?.source === "local" ? publicWorkerRecord : userProfiles.find((item) => item.workerId === routeWorkerId)) : null;
  const matchingDemoProfile = routeWorkerId ? demoProfiles.find((profileData) => profileData.workerId === routeWorkerId) : null;
  const routeDemoProfile = routeUserProfile ? null : matchingDemoProfile;
  const routeStoredWorker = routeUserProfile?.worker || null;
  const routeStoredRecords = routeUserProfile?.wageEntries || [];
  const routeStoredSummary = summarizeIncome(routeStoredRecords);
  const routeStoredMatches = routeUserProfile?.matches || [];
  const routeDemoRecords = routeDemoProfile ? incomePassports[routeDemoProfile.name] || [] : [];
  const routeDemoSummary = summarizeIncome(routeDemoRecords);
  const routeDemoMatch = routeDemoProfile ? createDemoJob(routeDemoProfile) : null;
  const featuredJourneyProfile = routeDemoProfile || activeDemoProfile || demoProfiles[0];
  const featuredJourneySummary = isLocalizedLanguage
    ? `${featuredJourneyProfile.name} ${cityLabel(featuredJourneyProfile.city)} के सत्यापित ${roleLabel(featuredJourneyProfile.skill)} हैं। उनके पास ${featuredJourneyProfile.experience} साल का अनुभव, दर्ज आय इतिहास और तैयार डिजिटल श्रमिक पहचान है।`
    : featuredJourneyProfile.notes || `${featuredJourneyProfile.name} is a verified ${featuredJourneyProfile.skill.toLowerCase()} from ${featuredJourneyProfile.city} with ${featuredJourneyProfile.experience} years of experience, recorded income history, and a ready digital worker identity.`;
  const routePublicWorker = routeDemoProfile || routeStoredWorker;
  const routePublicRecords = routeDemoProfile ? routeDemoRecords : routeStoredRecords;
  const routePublicSummary = routeDemoProfile ? routeDemoSummary : routeStoredSummary;
  const routePublicMatches = routeDemoProfile ? localMatches(routeDemoProfile) : routeStoredMatches;
  const routePublicIdentity = routePublicWorker ? {
    name: routePublicWorker.name || t.emptyWorkerName,
    occupation: routePublicWorker.skill ? roleLabel(routePublicWorker.skill) : t.notAvailable,
    city: routePublicWorker.city ? cityLabel(routePublicWorker.city) : t.notAvailable,
    workerId: routePublicWorker.workerId || routeWorkerId,
    experience: routePublicWorker.experience ? `${routePublicWorker.experience} ${t.common.years}` : t.notAvailable,
    primarySkill: routePublicWorker.skill ? roleLabel(routePublicWorker.skill) : t.notAvailable,
    secondarySkills: t.careerIdentity.secondarySkillSuggestions[routePublicWorker.skill] || t.careerIdentity.secondarySkillSuggestions.default,
    languages: routePublicWorker.languages || t.notAvailable,
    availability: routePublicWorker.availability || t.notAvailable,
    preferredWorkType: t.careerIdentity.preferredWorkTypeValue,
    expectedWage: routePublicWorker.expectedWage ? `₹${Number(routePublicWorker.expectedWage).toLocaleString("en-IN")}/${t.common.monthly}` : t.notAvailable,
    fairWage: routePublicWorker.expectedWage ? `₹${Math.round(routePublicWorker.expectedWage * 0.9).toLocaleString("en-IN")}-₹${Math.round(routePublicWorker.expectedWage * 1.12).toLocaleString("en-IN")}/${t.common.monthly}` : t.notAvailable,
    skillConfidence: routePublicWorker.readiness || routePublicMatches[0]?.score || 90,
    bestJobMatch: routePublicWorker.jobMatch || routePublicMatches[0]?.score || 0,
    matchingJobs: routePublicMatches.length,
    nearbyOpportunities: t.careerIdentity.nearbyOpportunitiesValue,
    suggestedSkillUpgrade: t.careerIdentity.skillUpgradeSuggestions[routePublicWorker.skill] || t.careerIdentity.skillUpgradeSuggestions.default,
    profileUrl: getWorkerPublicProfileUrl(routePublicWorker.workerId || routeWorkerId),
    contact: routePublicWorker.phone || t.notAvailable,
    resumeSummary: routeUserProfile?.profile?.summary || routePublicWorker.notes || t.emptyProfileSummary,
    incomeThisMonth: formatCurrency(routePublicSummary.totalIncome),
    employmentRecords: routePublicRecords.length,
    workRecords: routePublicRecords.slice(0, 5),
    certificates: routeUserProfile?.certificates || routePublicWorker.certificates || [],
    interviewReadiness: routePublicWorker.interviewScore ? `${routePublicWorker.interviewScore}%` : t.notAvailable,
    shareSettings: {
      ...defaultShareSettings,
      ...(routeUserProfile?.shareSettings || routePublicWorker.shareSettings || {})
    },
    publicStatus: routeUserProfile?.publicStatus || routePublicWorker.publicStatus || "active",
    statusBadges: (routePublicWorker.badges || [
      t.careerIdentity.statusVerified,
      t.careerIdentity.statusAvailable,
      t.careerIdentity.statusResume,
      t.careerIdentity.statusSkillCard
    ]).map(demoBadgeLabel),
    topMatch: routeDemoMatch?.title
  } : (!routeWorkerId ? careerIdentity : null);
  useEffect(() => {
    if (!routePath.startsWith("/worker/") || !routeUserProfile) return;
    if (worker.workerId === routeUserProfile.workerId) return;
    openUserWorkerProfile(routeUserProfile, { shouldNavigate: false });
  }, [routePath, routeUserProfile?.workerId]);

  useEffect(() => {
    if (!routePath.startsWith("/worker/") || !routeWorkerId || routeUserProfile || routeDemoProfile || !latestUserProfile) return;
    openUserWorkerProfile(latestUserProfile);
  }, [routePath, routeWorkerId, routeUserProfile?.workerId, routeDemoProfile?.workerId, latestUserProfile?.workerId]);

  const identityPageWorker = routeUserProfile?.worker || routeDemoProfile || worker;
  const publicRouteIdentity = routePublicIdentity;
  const identityPageIdentity = routePublicIdentity || careerIdentity;
  const identityPageCardIdentity = toEnglishArtifactIdentity(
    identityPageIdentity,
    identityPageWorker,
    routeUserProfile?.wage || (routeDemoProfile ? localWageEstimate(routeDemoProfile) : wage)
  );
  const employerPostedMatches = employerJobs
    .filter((job) => job.status === "Active")
    .map((job) => {
      const skillMatches = identityPageWorker.skill && job.category === identityPageWorker.skill;
      const cityMatches = identityPageWorker.city && job.city === identityPageWorker.city;
      const languageMatches = identityPageWorker.languages && String(job.languages || "").toLowerCase().includes(String(identityPageWorker.languages).split(",")[0]?.trim().toLowerCase());
      const wageMin = Number(job.wageMin || 0);
      const wageMax = Number(job.wageMax || 0);
      const expectedWage = Number(identityPageWorker.expectedWage || 0);
      const wageMatches = expectedWage && wageMax ? expectedWage >= wageMin * 0.75 && expectedWage <= wageMax * 1.25 : false;
      const score = 40 + (skillMatches ? 25 : 0) + (cityMatches ? 20 : 0) + (languageMatches ? 8 : 0) + (wageMatches ? 7 : 0);
      return {
        ...job,
        skill: job.category,
        employerName: job.employerName || job.companyName || job.employer || workerCopy.recommendations.employerPostedJob,
        wageRange: { min: wageMin, max: wageMax, period: job.wageType || "Monthly" },
        score: Math.min(100, score),
        source: "employer"
      };
    });
  const identityPageMatches = routeDemoProfile
    ? [routeDemoMatch, ...localMatches(routeDemoProfile)].filter(Boolean).sort((a, b) => b.score - a.score)
    : employerPostedMatches;
  const jobRoleOptions = [...new Set(identityPageMatches.map((job) => job.skill).filter(Boolean))];
  const jobCityOptions = [...new Set(identityPageMatches.map((job) => job.city).filter(Boolean))];
  const filteredJobMatches = identityPageMatches
    .filter((job) => !jobFilters.role || job.skill === jobFilters.role)
    .filter((job) => !jobFilters.city || job.city === jobFilters.city)
    .filter((job) => routeDemoProfile && jobFilters.verifiedOnly ? job.status === "Verified" : true)
    .sort((a, b) => {
      if (jobFilters.sort === "salary") return Number(b.wageRange?.max || 0) - Number(a.wageRange?.max || 0);
      if (jobFilters.sort === "nearest") return Number(b.matchBreakdown?.location || 0) - Number(a.matchBreakdown?.location || 0);
      return Number(b.score || 0) - Number(a.score || 0);
    });
  const identityPageRecords = routeUserProfile ? routeUserProfile.wageEntries || [] : routeDemoProfile ? routeDemoRecords : workRecords;
  const identityPageSummary = routeUserProfile ? summarizeIncome(routeUserProfile.wageEntries || []) : routeDemoProfile ? routeDemoSummary : incomeSummary;
  const identityExpectedIncome = identityPageSummary.totalIncome + identityPageSummary.pending;
  const identityPaymentCompletion = identityExpectedIncome ? Math.round((identityPageSummary.totalIncome / identityExpectedIncome) * 100) : 0;
  const identityPrimaryMonth = identityPageRecords[0]?.date
    ? new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(identityPageRecords[0].date))
    : new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date());
  const identityRecommendedWage = Number(wage?.fair || identityPageWorker.expectedWage || 0);
  const identityWageLow = Number(wage?.low || Math.round(identityRecommendedWage * 0.9));
  const identityWageHigh = Number(wage?.high || Math.round(identityRecommendedWage * 1.12));
  const identityMarketWage = Math.round(identityRecommendedWage * 0.875);
  const identityMarketLift = identityMarketWage ? Math.round(((identityRecommendedWage - identityMarketWage) / identityMarketWage) * 100) : 0;
  const identityPageReadiness = routeDemoProfile ? routeDemoProfile.readiness : readinessWithInterview;
  const displayResume = localResume({ ...identityPageWorker, uiLanguage: "en", preferredLanguage: "en" });
  const displayResumeSections = displayResume.sections || [];
  const resumeSummary = displayResumeSections[0]?.body || identityPageIdentity.resumeSummary || "";
  const resumeSkills = [roleLabelEnglish(identityPageWorker.skill), ...(identityPageCardIdentity.secondarySkills || secondarySkills || [])].slice(0, 6);
  const resumeWorkRecords = identityPageRecords.length ? identityPageRecords.slice(0, 4) : [{
    id: "SELF-RECORDED",
    employer: `${cityLabelEnglish(identityPageWorker.city)} verified work history`,
    jobType: roleLabelEnglish(identityPageWorker.skill),
    date: currentIssueDate,
    location: cityLabelEnglish(identityPageWorker.city),
    status: translations.en.verified || "Verified"
  }];
  const resumeSuggestions = ({
    Plumber: ["Add plumbing certification", "Mention emergency repairs", "Highlight water pump experience", "Include nearby verified work history"],
    Electrician: ["Add electrical safety certification", "Mention wiring fault diagnosis", "Highlight appliance repair experience", "Include nearby verified work history"],
    Driver: ["Add driving license details", "Mention route familiarity", "Highlight safety and punctuality", "Include verified trip history"],
    Tailor: ["Add machine stitching expertise", "Mention alteration experience", "Highlight measurement accuracy", "Include verified boutique work"],
    "Domestic Worker": ["Add household care references", "Mention cooking and cleaning strengths", "Highlight elderly care experience", "Include nearby verified work history"]
  }[identityPageWorker.skill] || [`Add ${roleLabel(identityPageWorker.skill).toLowerCase()} certification`, "Mention strongest work examples", "Highlight verified experience", "Include nearby verified work history"]);
  const viewedProfileRecord = routeUserProfile || (!account ? null : latestUserProfile);
  const viewedResume = viewedProfileRecord?.resume || null;
  const viewedRecords = viewedProfileRecord?.wageEntries || [];
  const viewedMatches = viewedProfileRecord?.matches || [];
  const viewedIncomeSummary = summarizeIncome(viewedRecords);
  const currentMonthKey = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date());
  const incomeThisMonth = viewedIncomeSummary.monthly[currentMonthKey] || 0;
  const currentMonthRecords = viewedRecords.filter((record) => {
    if (!record.date) return false;
    return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date(record.date)) === currentMonthKey;
  });
  const lastRecordedWork = [...viewedRecords]
    .filter((record) => record.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const overviewChecklist = [
    ["Personal details", Boolean(identityPageWorker.name && identityPageWorker.phone && identityPageWorker.city)],
    ["Primary skill", Boolean(identityPageWorker.skill)],
    ["Work experience", Boolean(identityPageWorker.experience)],
    ["Languages", Boolean(identityPageWorker.languages)],
    ["Availability", Boolean(identityPageWorker.availability)],
    ["Resume", Boolean(viewedResume?.sections?.length)],
    ["Work record", viewedRecords.length > 0],
    ["Identity verification", Boolean(viewedProfileRecord?.identityVerified || viewedProfileRecord?.verificationCompleted)]
  ];
  const completedOverviewSteps = overviewChecklist.filter(([, complete]) => complete).length;
  const overviewCompletionPercent = Math.round((completedOverviewSteps / overviewChecklist.length) * 100);
  const remainingOverviewSteps = overviewChecklist.filter(([, complete]) => !complete);
  const firstIncompleteStep = overviewChecklist.find(([, complete]) => !complete)?.[0] || "";
  const nextOverviewAction = firstIncompleteStep === "Work record"
    ? ["Add your first work record", "Start building your income history.", openWorkRecordModal, WalletCards]
    : firstIncompleteStep === "Resume"
      ? ["Generate your resume", "Create a resume from your saved profile.", () => setActiveWorkspaceTab("resume"), FileText]
      : firstIncompleteStep === "Languages"
        ? ["Add languages you speak", "Help employers understand communication fit.", () => navigateTo("/create-profile"), Globe2]
        : firstIncompleteStep === "Availability"
          ? ["Set your work availability", "Let employers know when you can work.", () => navigateTo("/create-profile"), CalendarClock]
          : firstIncompleteStep
            ? [`Complete ${firstIncompleteStep.toLowerCase()}`, "Fill the missing profile detail.", () => navigateTo("/create-profile"), Edit3]
            : ["Explore matching jobs", "Your essential profile steps are complete.", () => setActiveWorkspaceTab("jobs"), BriefcaseBusiness];
  const profileStatus = !viewedProfileRecord
    ? "Identity details incomplete"
    : !viewedRecords.length
      ? "Work history not added"
      : completedOverviewSteps === overviewChecklist.length
        ? "Ready to share"
        : "Profile created";
  const overviewActivities = [
    viewedProfileRecord && ["Profile created", viewedProfileRecord.createdAt, identityPageWorker.name, IdCard],
    viewedProfileRecord?.updatedAt && viewedProfileRecord.updatedAt !== viewedProfileRecord.createdAt && ["Worker identity updated", viewedProfileRecord.updatedAt, identityPageWorker.workerId || viewedProfileRecord.workerId, Edit3],
    viewedResume?.sections?.length && ["Resume generated", viewedProfileRecord?.updatedAt || viewedProfileRecord?.createdAt, viewedResume.title || identityPageWorker.skill, FileText],
    ...viewedRecords.slice(0, 3).map((record) => ["Work record added", record.createdAt || record.date, `${record.employer || record.employerName || "Work record"} · ${formatCurrency(record.paymentReceived || record.amountEarned || record.dailyWage || 0)}`, WalletCards])
  ].filter(Boolean).sort((a, b) => new Date(b[1] || 0) - new Date(a[1] || 0)).slice(0, 5);
  const overviewRecommendations = [
    !viewedRecords.length && ["Add your first work record", "Track real earnings and payment status in your Income Passport.", openWorkRecordModal, WalletCards],
    !viewedResume?.sections?.length && ["Generate your resume", "Create a resume using your saved skills and experience.", () => setActiveWorkspaceTab("resume"), FileText],
    !identityPageWorker.languages && ["Add languages you speak", "Make your profile clearer for employers.", () => navigateTo("/create-profile"), Globe2],
    !identityPageWorker.availability && ["Set your work availability", "Show when you are available for work.", () => navigateTo("/create-profile"), CalendarClock],
    !practiceHistory.length && ["Practice an interview", "Prepare role-based answers before employer conversations.", () => setActiveWorkspaceTab("coach"), MessageSquare],
    overviewChecklist.every(([, complete]) => complete) && ["Explore matching jobs", "Review opportunities connected to your profile.", () => setActiveWorkspaceTab("jobs"), BriefcaseBusiness]
  ].filter(Boolean).slice(0, 3);
  const primaryOverviewRecommendation = overviewRecommendations[0] || nextOverviewAction;
  const overviewAlerts = [
    viewedIncomeSummary.pending > 0 && [workerCopy.incomePassport.paymentPending, `${formatCurrency(viewedIncomeSummary.pending)} is still marked as pending.`, () => setActiveWorkspaceTab("income"), WalletCards],
    !identityPageWorker.phone && ["Missing phone number", "Add a phone number so employers can contact the worker.", () => navigateTo("/create-profile"), Phone],
    !viewedRecords.length && ["No work record added", "Add a work record to start building income history.", openWorkRecordModal, WalletCards],
    completedOverviewSteps < overviewChecklist.length && ["Profile draft not completed", `${overviewChecklist.length - completedOverviewSteps} profile step${overviewChecklist.length - completedOverviewSteps === 1 ? "" : "s"} remaining.`, nextOverviewAction[2], ClipboardCheck]
  ].filter(Boolean);
  const formatOverviewTimelineDate = (date) => {
    if (!date) return "Date unavailable";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    if (sameDay(parsed, today)) return "Today";
    if (sameDay(parsed, yesterday)) return "Yesterday";
    return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(parsed);
  };
  const overviewQuickActions = [
    [FileText, "Generate Resume", viewedResume?.sections?.length ? "Open saved resume" : "Create from profile", () => setActiveWorkspaceTab("resume")],
    [IdCard, "Digital Identity", viewedProfileRecord ? "View worker ID" : "Complete identity", () => setActiveWorkspaceTab("identity")],
    [WalletCards, "Income Passport", viewedRecords.length ? "Review records" : "Add income history", () => setActiveWorkspaceTab("income")],
    [MessageSquare, "Interview Coach", practiceHistory.length ? "Continue practice" : "Start practice", () => setActiveWorkspaceTab("coach")],
    [BriefcaseBusiness, "Job Matches", viewedMatches.length ? "Open matches" : "Complete profile first", () => setActiveWorkspaceTab("jobs")],
    [Download, "Worker Card", "Open downloads", () => setActiveWorkspaceTab("downloads")]
  ];
  const overviewResumeScore = viewedResume?.sections?.length ? Math.min(98, 82 + Math.min(viewedResume.sections.length * 3, 12)) : 0;
  const overviewInterviewScore = practiceHistory.length ? Math.max(0, Math.min(100, Number(interviewReadiness || 0))) : 0;
  const overviewJobMatchScore = viewedMatches.length ? Math.max(0, Math.min(100, Number(viewedMatches[0]?.score || 0))) : 0;
  const overviewAiInsights = [
    [FileText, "Resume Score", overviewResumeScore, viewedResume?.sections?.length ? "Generated" : "Not created", "#2563eb"],
    [ShieldCheck, "Profile Strength", overviewCompletionPercent, `${completedOverviewSteps}/${overviewChecklist.length} steps`, "#16a34a"],
    [MessageSquare, "Interview Readiness", overviewInterviewScore, practiceHistory.length ? "Practice saved" : "Not started", "#0891b2"],
    [BriefcaseBusiness, "Job Match Score", overviewJobMatchScore, viewedMatches.length ? "Top match" : "No matches yet", "#4f46e5"]
  ];
  const workerIdentityCopy = {
    en: {
      dashboard: "Dashboard", signOut: "Sign Out", demoLoaded: "Demo profile loaded",
      title: "Digital Career Identity", subtitle: "Verified employment identity and income passport for India’s informal workforce.",
      quickActions: "Quick Actions", quickCopy: "Open the most useful actions for this worker profile.",
      editProfile: "Edit Profile", viewIdentity: "View Digital Identity", shareProfile: "Share Profile", addRecord: "Add Work Record",
      workspace: "Workspace", apps: "RozgaarAI apps", appsCopy: "Open the tools that move this worker forward.",
      digitalIdentity: "Digital Identity", resume: "Resume", incomePassport: "Income Passport", jobMatches: "Job Matches", interviewCoach: "Interview Coach",
      workerCard: "Worker Card", downloads: "Downloads", created: "Created", incomplete: "Incomplete", generated: "Generated", createNow: "Create now",
      noRecords: "No records", records: "records", noEmployerJobs: "No employer jobs", jobs: "jobs", continue: "Continue", startPractice: "Start practice",
      preparing: "Preparing", downloadPdf: "Download PDF", documents: "Documents", copyPublicLink: "Copy public link",
      identityOpened: "Digital Identity opened.", resumeOpened: "Resume opened.", incomeOpened: "Income Passport opened.", jobsOpened: "Job Matches opened.",
      coachOpened: "Interview Coach opened.", downloadsOpened: "Downloads opened."
    },
    hi: {
      dashboard: "डैशबोर्ड", signOut: "साइन आउट", demoLoaded: "डेमो प्रोफ़ाइल लोड है",
      title: "डिजिटल करियर पहचान", subtitle: "भारत के असंगठित श्रमिकों के लिए सत्यापित रोजगार पहचान और आय पासपोर्ट।",
      quickActions: "त्वरित कार्य", quickCopy: "इस श्रमिक प्रोफ़ाइल के सबसे उपयोगी कार्य खोलें।",
      editProfile: "प्रोफ़ाइल संपादित करें", viewIdentity: "डिजिटल पहचान देखें", shareProfile: "प्रोफ़ाइल साझा करें", addRecord: "काम रिकॉर्ड जोड़ें",
      workspace: "वर्कस्पेस", apps: "RozgaarAI ऐप्स", appsCopy: "वे टूल खोलें जो इस श्रमिक को आगे बढ़ाते हैं।",
      digitalIdentity: "डिजिटल पहचान", resume: "रिज्यूमे", incomePassport: "आय पासपोर्ट", jobMatches: "नौकरी मिलान", interviewCoach: "इंटरव्यू कोच",
      workerCard: "वर्कर कार्ड", downloads: "डाउनलोड", created: "बन गई", incomplete: "अधूरी", generated: "बन गया", createNow: "अभी बनाएं",
      noRecords: "रिकॉर्ड नहीं", records: "रिकॉर्ड", noEmployerJobs: "नियोक्ता नौकरी नहीं", jobs: "नौकरियां", continue: "जारी रखें", startPractice: "अभ्यास शुरू करें",
      preparing: "तैयार हो रहा", downloadPdf: "PDF डाउनलोड", documents: "दस्तावेज़", copyPublicLink: "सार्वजनिक लिंक कॉपी करें",
      identityOpened: "डिजिटल पहचान खुल गई।", resumeOpened: "रिज्यूमे खुल गया।", incomeOpened: "आय पासपोर्ट खुल गया।", jobsOpened: "नौकरी मिलान खुल गया।",
      coachOpened: "इंटरव्यू कोच खुल गया।", downloadsOpened: "डाउनलोड खुल गए।"
    },
    mr: {
      dashboard: "डॅशबोर्ड", signOut: "साइन आउट", demoLoaded: "डेमो प्रोफाइल लोड झाले",
      title: "डिजिटल करिअर ओळख", subtitle: "भारताच्या अनौपचारिक कामगारांसाठी सत्यापित रोजगार ओळख आणि उत्पन्न पासपोर्ट.",
      quickActions: "जलद कृती", quickCopy: "या कामगार प्रोफाइलसाठी उपयुक्त कृती उघडा.",
      editProfile: "प्रोफाइल संपादित करा", viewIdentity: "डिजिटल ओळख पहा", shareProfile: "प्रोफाइल शेअर करा", addRecord: "कामाची नोंद जोडा",
      workspace: "वर्कस्पेस", apps: "RozgaarAI अॅप्स", appsCopy: "या कामगाराला पुढे नेणारी साधने उघडा.",
      digitalIdentity: "डिजिटल ओळख", resume: "रिझ्युमे", incomePassport: "उत्पन्न पासपोर्ट", jobMatches: "नोकरी जुळणी", interviewCoach: "मुलाखत कोच",
      workerCard: "कामगार कार्ड", downloads: "डाउनलोड", created: "तयार", incomplete: "अपूर्ण", generated: "तयार", createNow: "आता तयार करा",
      noRecords: "नोंदी नाहीत", records: "नोंदी", noEmployerJobs: "नियोक्ता नोकऱ्या नाहीत", jobs: "नोकऱ्या", continue: "पुढे चालू", startPractice: "सराव सुरू करा",
      preparing: "तयार होत आहे", downloadPdf: "PDF डाउनलोड", documents: "दस्तऐवज", copyPublicLink: "सार्वजनिक लिंक कॉपी करा",
      identityOpened: "डिजिटल ओळख उघडली.", resumeOpened: "रिझ्युमे उघडला.", incomeOpened: "उत्पन्न पासपोर्ट उघडला.", jobsOpened: "नोकरी जुळणी उघडली.",
      coachOpened: "मुलाखत कोच उघडला.", downloadsOpened: "डाउनलोड उघडले."
    },
    bn: {
      dashboard: "ড্যাশবোর্ড", signOut: "সাইন আউট", demoLoaded: "ডেমো প্রোফাইল লোড হয়েছে",
      title: "ডিজিটাল ক্যারিয়ার পরিচয়", subtitle: "ভারতের অনানুষ্ঠানিক কর্মীদের জন্য যাচাইকৃত কর্মসংস্থান পরিচয় ও আয় পাসপোর্ট।",
      quickActions: "দ্রুত কাজ", quickCopy: "এই কর্মী প্রোফাইলের সবচেয়ে দরকারি কাজ খুলুন।",
      editProfile: "প্রোফাইল সম্পাদনা", viewIdentity: "ডিজিটাল পরিচয় দেখুন", shareProfile: "প্রোফাইল শেয়ার", addRecord: "কাজের রেকর্ড যোগ করুন",
      workspace: "ওয়ার্কস্পেস", apps: "RozgaarAI অ্যাপস", appsCopy: "এই কর্মীকে এগিয়ে নেওয়ার টুল খুলুন।",
      digitalIdentity: "ডিজিটাল পরিচয়", resume: "রিজিউমে", incomePassport: "আয় পাসপোর্ট", jobMatches: "চাকরি মিল", interviewCoach: "ইন্টারভিউ কোচ",
      workerCard: "কর্মী কার্ড", downloads: "ডাউনলোড", created: "তৈরি", incomplete: "অসম্পূর্ণ", generated: "তৈরি", createNow: "এখন তৈরি করুন",
      noRecords: "রেকর্ড নেই", records: "রেকর্ড", noEmployerJobs: "নিয়োগকর্তার চাকরি নেই", jobs: "চাকরি", continue: "চালিয়ে যান", startPractice: "অনুশীলন শুরু",
      preparing: "প্রস্তুত হচ্ছে", downloadPdf: "PDF ডাউনলোড", documents: "ডকুমেন্ট", copyPublicLink: "পাবলিক লিংক কপি",
      identityOpened: "ডিজিটাল পরিচয় খোলা হয়েছে।", resumeOpened: "রিজিউমে খোলা হয়েছে।", incomeOpened: "আয় পাসপোর্ট খোলা হয়েছে।", jobsOpened: "চাকরি মিল খোলা হয়েছে।",
      coachOpened: "ইন্টারভিউ কোচ খোলা হয়েছে।", downloadsOpened: "ডাউনলোড খোলা হয়েছে।"
    },
    te: {
      dashboard: "డ్యాష్‌బోర్డ్", signOut: "సైన్ అవుట్", demoLoaded: "డెమో ప్రొఫైల్ లోడ్ అయింది",
      title: "డిజిటల్ కెరీర్ గుర్తింపు", subtitle: "భారత అసంఘటిత కార్మికుల కోసం ధృవీకరించిన ఉపాధి గుర్తింపు మరియు ఆదాయ పాస్‌పోర్ట్.",
      quickActions: "త్వరిత చర్యలు", quickCopy: "ఈ కార్మిక ప్రొఫైల్‌కు ఉపయోగకరమైన చర్యలను తెరవండి.",
      editProfile: "ప్రొఫైల్ సవరించండి", viewIdentity: "డిజిటల్ గుర్తింపు చూడండి", shareProfile: "ప్రొఫైల్ పంచుకోండి", addRecord: "పని రికార్డు జోడించండి",
      workspace: "వర్క్‌స్పేస్", apps: "RozgaarAI యాప్‌లు", appsCopy: "ఈ కార్మికుడిని ముందుకు తీసుకెళ్లే సాధనాలు తెరవండి.",
      digitalIdentity: "డిజిటల్ గుర్తింపు", resume: "రెజ్యూమే", incomePassport: "ఆదాయ పాస్‌పోర్ట్", jobMatches: "ఉద్యోగ సరిపోలికలు", interviewCoach: "ఇంటర్వ్యూ కోచ్",
      workerCard: "కార్మిక కార్డ్", downloads: "డౌన్‌లోడ్లు", created: "సృష్టించబడింది", incomplete: "అసంపూర్ణం", generated: "సృష్టించబడింది", createNow: "ఇప్పుడే సృష్టించండి",
      noRecords: "రికార్డులు లేవు", records: "రికార్డులు", noEmployerJobs: "ఉద్యోగదాత ఉద్యోగాలు లేవు", jobs: "ఉద్యోగాలు", continue: "కొనసాగించండి", startPractice: "ప్రాక్టీస్ ప్రారంభించండి",
      preparing: "సిద్ధమవుతోంది", downloadPdf: "PDF డౌన్‌లోడ్", documents: "పత్రాలు", copyPublicLink: "పబ్లిక్ లింక్ కాపీ",
      identityOpened: "డిజిటల్ గుర్తింపు తెరవబడింది.", resumeOpened: "రెజ్యూమే తెరవబడింది.", incomeOpened: "ఆదాయ పాస్‌పోర్ట్ తెరవబడింది.", jobsOpened: "ఉద్యోగ సరిపోలికలు తెరవబడ్డాయి.",
      coachOpened: "ఇంటర్వ్యూ కోచ్ తెరవబడింది.", downloadsOpened: "డౌన్‌లోడ్లు తెరవబడ్డాయి."
    }
  };
  workerIdentityCopy.ta = { ...workerIdentityCopy.en, title: "டிஜிட்டல் தொழில் அடையாளம்", subtitle: "இந்தியாவின் அமைப்புசாரா தொழிலாளர்களுக்கான சரிபார்க்கப்பட்ட வேலை அடையாளம் மற்றும் வருமான பாஸ்போர்ட்.", quickActions: "விரைவு செயல்கள்", quickCopy: "இந்த தொழிலாளர் சுயவிவரத்திற்கான பயனுள்ள செயல்களைத் திறக்கவும்.", editProfile: "சுயவிவரத்தை திருத்து", viewIdentity: "டிஜிட்டல் அடையாளம் பார்க்க", shareProfile: "சுயவிவரம் பகிர்", addRecord: "வேலை பதிவு சேர்க்க", workspace: "பணியிடம்", apps: "RozgaarAI செயலிகள்", appsCopy: "இந்த தொழிலாளரை முன்னேற்றும் கருவிகளைத் திறக்கவும்.", digitalIdentity: "டிஜிட்டல் அடையாளம்", resume: "ரெஸ்யூமே", incomePassport: "வருமான பாஸ்போர்ட்", jobMatches: "வேலை பொருத்தங்கள்", interviewCoach: "நேர்காணல் பயிற்சியாளர்", workerCard: "தொழிலாளர் அட்டை", downloads: "பதிவிறக்கங்கள்", created: "உருவாக்கப்பட்டது", generated: "உருவாக்கப்பட்டது", noRecords: "பதிவுகள் இல்லை", noEmployerJobs: "வேலை வழங்குநர் வேலைகள் இல்லை", continue: "தொடரவும்", downloadPdf: "PDF பதிவிறக்கு", documents: "ஆவணங்கள்", copyPublicLink: "பொது இணைப்பை நகலெடு" };
  workerIdentityCopy.kn = { ...workerIdentityCopy.en, title: "ಡಿಜಿಟಲ್ ಕರಿಯರ್ ಗುರುತು", subtitle: "ಭಾರತದ ಅಸಂಘಟಿತ ಕಾರ್ಮಿಕರಿಗೆ ಪರಿಶೀಲಿತ ಉದ್ಯೋಗ ಗುರುತು ಮತ್ತು ಆದಾಯ ಪಾಸ್‌ಪೋರ್ಟ್.", quickActions: "ತ್ವರಿತ ಕ್ರಮಗಳು", quickCopy: "ಈ ಕಾರ್ಮಿಕ ಪ್ರೊಫೈಲ್‌ಗೆ ಉಪಯುಕ್ತ ಕ್ರಮಗಳನ್ನು ತೆರೆಯಿರಿ.", editProfile: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ", viewIdentity: "ಡಿಜಿಟಲ್ ಗುರುತು ನೋಡಿ", shareProfile: "ಪ್ರೊಫೈಲ್ ಹಂಚಿಕೊಳ್ಳಿ", addRecord: "ಕೆಲಸದ ದಾಖಲೆ ಸೇರಿಸಿ", workspace: "ವರ್ಕ್‌ಸ್ಪೇಸ್", apps: "RozgaarAI ಆ್ಯಪ್‌ಗಳು", appsCopy: "ಈ ಕಾರ್ಮಿಕರನ್ನು ಮುಂದಕ್ಕೆ ಕೊಂಡೊಯ್ಯುವ ಸಾಧನಗಳನ್ನು ತೆರೆಯಿರಿ.", digitalIdentity: "ಡಿಜಿಟಲ್ ಗುರುತು", resume: "ರೆಸ್ಯೂಮೆ", incomePassport: "ಆದಾಯ ಪಾಸ್‌ಪೋರ್ಟ್", jobMatches: "ಉದ್ಯೋಗ ಹೊಂದಾಣಿಕೆ", interviewCoach: "ಸಂದರ್ಶನ ಕೋಚ್", workerCard: "ಕಾರ್ಮಿಕ ಕಾರ್ಡ್", downloads: "ಡೌನ್‌ಲೋಡ್‌ಗಳು", created: "ರಚಿಸಲಾಗಿದೆ", generated: "ರಚಿಸಲಾಗಿದೆ", noRecords: "ದಾಖಲೆಗಳಿಲ್ಲ", noEmployerJobs: "ಉದ್ಯೋಗದಾತ ಉದ್ಯೋಗಗಳಿಲ್ಲ", continue: "ಮುಂದುವರಿಸಿ", downloadPdf: "PDF ಡೌನ್‌ಲೋಡ್", documents: "ದಾಖಲೆಗಳು", copyPublicLink: "ಸಾರ್ವಜನಿಕ ಲಿಂಕ್ ನಕಲಿಸಿ" };
  workerIdentityCopy.gu = { ...workerIdentityCopy.en, title: "ડિજિટલ કરિયર ઓળખ", subtitle: "ભારતના અનૌપચારિક કામદારો માટે ચકાસાયેલ રોજગાર ઓળખ અને આવક પાસપોર્ટ.", quickActions: "ઝડપી ક્રિયાઓ", quickCopy: "આ કામદાર પ્રોફાઇલ માટે ઉપયોગી ક્રિયાઓ ખોલો.", editProfile: "પ્રોફાઇલ સંપાદિત કરો", viewIdentity: "ડિજિટલ ઓળખ જુઓ", shareProfile: "પ્રોફાઇલ શેર કરો", addRecord: "કામનો રેકોર્ડ ઉમેરો", workspace: "વર્કસ્પેસ", apps: "RozgaarAI એપ્સ", appsCopy: "આ કામદારને આગળ વધારતા સાધનો ખોલો.", digitalIdentity: "ડિજિટલ ઓળખ", resume: "રિઝ્યૂમે", incomePassport: "આવક પાસપોર્ટ", jobMatches: "નોકરી મેળાપ", interviewCoach: "ઇન્ટરવ્યુ કોચ", workerCard: "કામદાર કાર્ડ", downloads: "ડાઉનલોડ", created: "બન્યું", generated: "બન્યું", noRecords: "રેકોર્ડ નથી", noEmployerJobs: "નિયોક્તાની નોકરી નથી", continue: "ચાલુ રાખો", downloadPdf: "PDF ડાઉનલોડ", documents: "દસ્તાવેજો", copyPublicLink: "જાહેર લિંક કૉપિ કરો" };
  workerIdentityCopy.ml = { ...workerIdentityCopy.en, title: "ഡിജിറ്റൽ കരിയർ ഐഡന്റിറ്റി", subtitle: "ഇന്ത്യയിലെ അനൗപചാരിക തൊഴിലാളികൾക്കായുള്ള പരിശോധിച്ച തൊഴിൽ ഐഡന്റിറ്റിയും വരുമാന പാസ്‌പോർട്ടും.", quickActions: "വേഗത്തിലുള്ള പ്രവർത്തനങ്ങൾ", quickCopy: "ഈ തൊഴിലാളി പ്രൊഫൈലിന് ഉപയോഗപ്രദമായ പ്രവർത്തനങ്ങൾ തുറക്കുക.", editProfile: "പ്രൊഫൈൽ തിരുത്തുക", viewIdentity: "ഡിജിറ്റൽ ഐഡന്റിറ്റി കാണുക", shareProfile: "പ്രൊഫൈൽ പങ്കിടുക", addRecord: "ജോലി രേഖ ചേർക്കുക", workspace: "വർക്ക്സ്പേസ്", apps: "RozgaarAI ആപ്പുകൾ", appsCopy: "ഈ തൊഴിലാളിയെ മുന്നോട്ട് നയിക്കുന്ന ഉപകരണങ്ങൾ തുറക്കുക.", digitalIdentity: "ഡിജിറ്റൽ ഐഡന്റിറ്റി", resume: "റസ്യൂമെ", incomePassport: "വരുമാന പാസ്‌പോർട്ട്", jobMatches: "ജോലി പൊരുത്തങ്ങൾ", interviewCoach: "ഇന്റർവ്യൂ കോച്ച്", workerCard: "തൊഴിലാളി കാർഡ്", downloads: "ഡൗൺലോഡുകൾ", created: "സൃഷ്ടിച്ചു", generated: "സൃഷ്ടിച്ചു", noRecords: "രേഖകളില്ല", noEmployerJobs: "തൊഴിലുടമ ജോലികളില്ല", continue: "തുടരുക", downloadPdf: "PDF ഡൗൺലോഡ്", documents: "രേഖകൾ", copyPublicLink: "പൊതു ലിങ്ക് പകർത്തുക" };
  workerIdentityCopy.pa = { ...workerIdentityCopy.en, title: "ਡਿਜ਼ਿਟਲ ਕਰੀਅਰ ਪਛਾਣ", subtitle: "ਭਾਰਤ ਦੇ ਗੈਰ-ਸੰਗਠਿਤ ਮਜ਼ਦੂਰਾਂ ਲਈ ਤਸਦੀਕਸ਼ੁਦਾ ਰੋਜ਼ਗਾਰ ਪਛਾਣ ਅਤੇ ਆਮਦਨ ਪਾਸਪੋਰਟ.", quickActions: "ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ", quickCopy: "ਇਸ ਮਜ਼ਦੂਰ ਪ੍ਰੋਫਾਈਲ ਲਈ ਲਾਭਦਾਇਕ ਕਾਰਵਾਈਆਂ ਖੋਲ੍ਹੋ.", editProfile: "ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ", viewIdentity: "ਡਿਜ਼ਿਟਲ ਪਛਾਣ ਵੇਖੋ", shareProfile: "ਪ੍ਰੋਫਾਈਲ ਸਾਂਝੀ ਕਰੋ", addRecord: "ਕੰਮ ਰਿਕਾਰਡ ਜੋੜੋ", workspace: "ਵਰਕਸਪੇਸ", apps: "RozgaarAI ਐਪਸ", appsCopy: "ਇਸ ਮਜ਼ਦੂਰ ਨੂੰ ਅੱਗੇ ਵਧਾਉਣ ਵਾਲੇ ਟੂਲ ਖੋਲ੍ਹੋ.", digitalIdentity: "ਡਿਜ਼ਿਟਲ ਪਛਾਣ", resume: "ਰਿਜ਼ਿਊਮੇ", incomePassport: "ਆਮਦਨ ਪਾਸਪੋਰਟ", jobMatches: "ਨੌਕਰੀ ਮੇਲ", interviewCoach: "ਇੰਟਰਵਿਊ ਕੋਚ", workerCard: "ਮਜ਼ਦੂਰ ਕਾਰਡ", downloads: "ਡਾਊਨਲੋਡ", created: "ਬਣਾਇਆ", generated: "ਬਣਾਇਆ", noRecords: "ਰਿਕਾਰਡ ਨਹੀਂ", noEmployerJobs: "ਨਿਯੋਗਕਰਤਾ ਨੌਕਰੀ ਨਹੀਂ", continue: "ਜਾਰੀ ਰੱਖੋ", downloadPdf: "PDF ਡਾਊਨਲੋਡ", documents: "ਦਸਤਾਵੇਜ਼", copyPublicLink: "ਪਬਲਿਕ ਲਿੰਕ ਕਾਪੀ ਕਰੋ" };
  const wi = workerIdentityCopy[lang] || workerIdentityCopy.en;
  const overviewWorkspaceTiles = [
    [IdCard, wi.digitalIdentity, viewedProfileRecord ? wi.created : wi.incomplete, "bg-blue-50 text-blue-700", () => openWorkerProfileTab("identity", wi.identityOpened)],
    [FileText, wi.resume, viewedResume?.sections?.length ? wi.generated : wi.createNow, "bg-emerald-50 text-emerald-700", () => openWorkerProfileTab("resume", wi.resumeOpened)],
    [WalletCards, wi.incomePassport, viewedRecords.length ? `${viewedRecords.length} ${wi.records}` : wi.noRecords, "bg-cyan-50 text-cyan-700", () => openWorkerProfileTab("income", wi.incomeOpened)],
    [BriefcaseBusiness, wi.jobMatches, identityPageMatches.length ? `${identityPageMatches.length} ${wi.jobs}` : wi.noEmployerJobs, "bg-indigo-50 text-indigo-700", () => openWorkerProfileTab("jobs", wi.jobsOpened)],
    [MessageSquare, wi.interviewCoach, practiceHistory.length ? wi.continue : wi.startPractice, "bg-violet-50 text-violet-700", () => openWorkerProfileTab("coach", wi.coachOpened)],
    [BadgeCheck, wi.workerCard, isExportingWorkerCard ? wi.preparing : wi.downloadPdf, "bg-green-50 text-green-700", downloadCertificatePdf],
    [Download, wi.downloads, wi.documents, "bg-slate-100 text-slate-700", () => openWorkerProfileTab("downloads", wi.downloadsOpened)],
    [Copy, wi.shareProfile, wi.copyPublicLink, "bg-sky-50 text-sky-700", copyWorkerProfileLink]
  ];
  const overviewNotifications = overviewAlerts.length ? overviewAlerts : [
    remainingOverviewSteps.length
      ? ["Setup reminder", `${remainingOverviewSteps[0][0]} is still pending.`, nextOverviewAction[2], ClipboardCheck]
      : ["Workspace ready", "Your essential profile steps are complete.", () => setActiveWorkspaceTab("jobs"), CheckCircle2]
  ];
  const workspaceTabs = [
    ["identity", isLocalizedLanguage ? "डिजिटल पहचान" : "Digital Identity"],
    ["resume", isLocalizedLanguage ? "बायोडाटा" : "Resume"],
    ["income", isLocalizedLanguage ? "आय पासपोर्ट" : "Income Passport"],
    ["jobs", isLocalizedLanguage ? "नौकरी मिलान" : "Job Matches"],
    ["wages", isLocalizedLanguage ? "मजदूरी ट्रैकर" : "Wage Tracker"],
    ["coach", isLocalizedLanguage ? "साक्षात्कार" : "Interview Coach"],
    ["rights", isLocalizedLanguage ? "अधिकार सहायता" : "Rights & Safety"],
    ["downloads", isLocalizedLanguage ? "डाउनलोड" : "Downloads"]
  ];
  const identityPageTitle = wi.title;
  const identityPageSubtitle = wi.subtitle;
  const previewCards = [
    [WalletCards, isLocalizedLanguage ? workerCopy.incomePassport.title : workerCopy.incomePassport.title, isLocalizedLanguage ? "सत्यापित काम इतिहास, आय टाइमलाइन और डाउनलोड योग्य प्रमाण देखें।" : "View verified work history, income timeline, and downloadable proof.", "income", isLocalizedLanguage ? "पासपोर्ट खोलें" : "Open Passport"],
    [BriefcaseBusiness, isLocalizedLanguage ? "Job Matches" : "Job Matches", isLocalizedLanguage ? "कौशल, शहर, मजदूरी और सुरक्षा के आधार पर उपयुक्त काम देखें।" : "Explore verified opportunities matched by skill, city, wage, and safety.", "jobs", isLocalizedLanguage ? "नौकरियाँ देखें" : "View Job Matches"],
    [Mic, workerCopy.coach, isLocalizedLanguage ? "भूमिका के हिसाब से सवालों का अभ्यास करें और जवाब बेहतर बनाएं।" : "Practice role-specific questions and improve interview confidence.", "coach", isLocalizedLanguage ? "अभ्यास शुरू करें" : workerCopy.interviewCoach.startPractice],
    [ShieldAlert, isLocalizedLanguage ? "Rights & Safety" : "Rights & Safety", isLocalizedLanguage ? "फर्जी नौकरी संकेत, दस्तावेज़ मांग और बकाया भुगतान जोखिम जांचें।" : "Check job risk signals, document requests, and pending payment concerns.", "rights", isLocalizedLanguage ? "सहायता खोलें" : "Open Rights Help"]
  ];
  const securePreviewRows = [
    [IdCard, "Digital Career Identity", "Saved", "identity", "Open Digital Career Identity demo"],
    [FileText, "AI Resume", "Ready", "resume", "Open AI Resume demo"],
    [WalletCards, "Income Passport", "Active", "income", "Open Income Passport demo"],
    [BriefcaseBusiness, "Job Matches", "12", "jobs", "Open Job Matches demo"],
    [MessageSquare, "Interview Readiness", "94%", "coach", "Open Interview Coach demo"],
    [ShieldCheck, "Safety & Rights Checks", "Saved", "rights", "Open Rights and Safety demo"]
  ];
  const demoWorkerCategories = [
    ["all", Users, t.demoWorkersPage.categories.all, () => true],
    ["domestic", BriefcaseBusiness, t.demoWorkersPage.categories.domestic, (item) => item.skill === "Domestic Worker"],
    ["skilled", Sparkles, t.demoWorkersPage.categories.skilled, (item) => ["Plumber", "Electrician", "Tailor"].includes(item.skill)],
    ["services", WalletCards, t.demoWorkersPage.categories.services, (item) => ["Domestic Worker", "Tailor"].includes(item.skill)],
    ["transport", Gauge, t.demoWorkersPage.categories.transport, (item) => item.skill === "Driver"],
    ["manufacturing", Building2, t.demoWorkersPage.categories.manufacturing, (item) => ["Tailor", "Electrician"].includes(item.skill)]
  ];
  const activeDemoCategory = demoWorkerCategories.find(([key]) => key === demoWorkerCategory) || demoWorkerCategories[0];
  const filteredDemoProfiles = demoProfiles
    .filter((profileData) => activeDemoCategory[3](profileData))
    .filter((profileData) => {
      const query = demoWorkerSearch.trim().toLowerCase();
      if (!query) return true;
      return [
        profileData.name,
        profileData.skill,
        profileData.city,
        profileData.languages,
        profileData.workerId
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
    })
    .sort((a, b) => {
      if (demoWorkerSort === "readiness") return Number(b.readiness || 0) - Number(a.readiness || 0);
      if (demoWorkerSort === "experience") return Number(b.experience || 0) - Number(a.experience || 0);
      return Number(b.jobMatch || 0) - Number(a.jobMatch || 0);
    });
  const onboardingDemoProfile = demoProfiles.find((profileData) => profileData.name === onboardingDemoWorkerName) || demoProfiles[0];
  const onboardingDemoIdentity = {
    name: onboardingDemoProfile.name,
    occupation: roleLabel(onboardingDemoProfile.skill),
    city: onboardingDemoProfile.city,
    workerId: onboardingDemoProfile.workerId,
    photoUrl: rahulWorkerPhoto,
    experience: `${onboardingDemoProfile.experience} ${t.common.years}`,
    primarySkill: roleLabel(onboardingDemoProfile.skill),
    secondarySkills: t.careerIdentity.secondarySkillSuggestions[onboardingDemoProfile.skill] || t.careerIdentity.secondarySkillSuggestions.default,
    languages: onboardingDemoProfile.languages,
    availability: onboardingDemoProfile.availability,
    preferredWorkType: t.careerIdentity.preferredWorkTypeValue,
    expectedWage: `₹${Number(onboardingDemoProfile.expectedWage || 0).toLocaleString("en-IN")}/${t.common.monthly}`,
    fairWage: `₹${Math.round(Number(onboardingDemoProfile.expectedWage || 0) * 0.9).toLocaleString("en-IN")}-₹${Math.round(Number(onboardingDemoProfile.expectedWage || 0) * 1.15).toLocaleString("en-IN")}/${t.common.monthly}`,
    skillConfidence: onboardingDemoProfile.readiness,
    bestJobMatch: onboardingDemoProfile.jobMatch,
    matchingJobs: 40,
    nearbyOpportunities: t.careerIdentity.nearbyOpportunitiesValue,
    suggestedSkillUpgrade: t.careerIdentity.skillUpgradeSuggestions[onboardingDemoProfile.skill] || t.careerIdentity.skillUpgradeSuggestions.default,
	    profileUrl: getWorkerPublicProfileUrl(onboardingDemoProfile.workerId),
    contact: onboardingDemoProfile.phone,
    resumeSummary: onboardingDemoProfile.notes,
    incomeThisMonth: `₹${Number(onboardingDemoProfile.expectedWage || 0).toLocaleString("en-IN")}`,
    employmentRecords: 8,
    workRecords: (incomePassports[onboardingDemoProfile.name] || []).slice(0, 5),
    certificates: onboardingDemoProfile.certificates || [],
	    interviewReadiness: `${onboardingDemoProfile.interviewScore}%`,
	    shareSettings: { ...defaultShareSettings, ...(onboardingDemoProfile.shareSettings || {}) },
	    publicStatus: onboardingDemoProfile.publicStatus || "active",
    issuedOn: "09 Jul 2026",
    lastUpdated: "09 Jul 2026",
    statusBadges: onboardingDemoProfile.badges.map(demoBadgeLabel)
  };
  const latestWorker = isDemoExperience ? worker : latestUserProfile?.worker || (!account ? worker : initialWorker);
  const latestProfileMatches = isDemoExperience ? matches : latestUserProfile?.matches || [];
  const latestProfileRecords = isDemoExperience ? wageEntries : latestUserProfile?.wageEntries || [];
  const latestProfileIncome = summarizeIncome(latestProfileRecords);
  const latestProfileId = latestUserProfile?.workerId || latestWorker?.workerId || createWorkerId(latestWorker);
  const latestProfileIdentity = (latestUserProfile || isDemoExperience) ? {
    name: latestWorker.name || t.emptyWorkerName,
    occupation: latestWorker.skill ? roleLabel(latestWorker.skill) : t.notAvailable,
    city: latestWorker.city ? cityLabel(latestWorker.city) : t.notAvailable,
    workerId: latestProfileId,
    experience: latestWorker.experience ? `${latestWorker.experience} ${t.common.years}` : t.notAvailable,
    primarySkill: latestWorker.skill ? roleLabel(latestWorker.skill) : t.notAvailable,
    secondarySkills: t.careerIdentity.secondarySkillSuggestions[latestWorker.skill] || t.careerIdentity.secondarySkillSuggestions.default,
    languages: latestWorker.languages || t.notAvailable,
    availability: latestWorker.availability || t.notAvailable,
    preferredWorkType: t.careerIdentity.preferredWorkTypeValue,
    expectedWage: latestWorker.expectedWage ? `₹${Number(latestWorker.expectedWage || 0).toLocaleString("en-IN")}/${t.common.monthly}` : t.notAvailable,
    fairWage: (isDemoExperience ? wage : latestUserProfile.wage)?.fair ? `₹${Number((isDemoExperience ? wage : latestUserProfile.wage).low || (isDemoExperience ? wage : latestUserProfile.wage).fair).toLocaleString("en-IN")}-₹${Number((isDemoExperience ? wage : latestUserProfile.wage).high || (isDemoExperience ? wage : latestUserProfile.wage).fair).toLocaleString("en-IN")}/${t.common.monthly}` : t.notAvailable,
    skillConfidence: Math.max(84, Math.min(98, Number(latestProfileMatches[0]?.score || (isDemoExperience ? profile : latestUserProfile.profile)?.readiness || 90))),
    bestJobMatch: Number(latestProfileMatches[0]?.score || 0),
    matchingJobs: latestProfileMatches.length,
    nearbyOpportunities: t.careerIdentity.nearbyOpportunitiesValue,
    suggestedSkillUpgrade: t.careerIdentity.skillUpgradeSuggestions[latestWorker.skill] || t.careerIdentity.skillUpgradeSuggestions.default,
	    profileUrl: getWorkerPublicProfileUrl(latestProfileId),
    contact: latestWorker.phone || t.notAvailable,
    resumeSummary: (isDemoExperience ? profile : latestUserProfile.profile)?.summary || latestWorker.notes || t.emptyProfileSummary,
    incomeThisMonth: formatCurrency(latestProfileIncome.totalIncome),
    employmentRecords: latestProfileRecords.length,
    workRecords: latestProfileRecords.slice(0, 5),
    certificates: latestUserProfile?.certificates || [],
	    interviewReadiness: practiceHistory.length ? `${interviewReadiness}%` : t.notAvailable,
	    shareSettings: {
	      ...defaultShareSettings,
	      ...(latestUserProfile?.shareSettings || latestWorker.shareSettings || {})
	    },
	    publicStatus: latestUserProfile?.publicStatus || latestWorker.publicStatus || "active",
    statusBadges: [
      t.careerIdentity.statusVerified,
      t.careerIdentity.statusAvailable,
      t.careerIdentity.statusResume,
      t.careerIdentity.statusSkillCard
    ]
  } : null;
  const hasPrimaryIdentity = isDemoExperience ? true : account ? Boolean(latestUserProfile) : Boolean(latestUserProfile || hasGeneratedProfile);
  const hasResumeReady = isDemoExperience ? Boolean(resume.sections?.length) : account ? Boolean(latestUserProfile?.resume?.sections?.length) : Boolean(latestUserProfile?.resume?.sections?.length || resume.sections?.length);
  const hasIncomeRecords = isDemoExperience ? wageEntries.length > 0 : account ? latestProfileRecords.length > 0 : latestProfileRecords.length > 0 || wageEntries.length > 0;
  const activeWorkerMatches = isDemoExperience ? matches : account ? latestProfileMatches : (latestProfileMatches.length ? latestProfileMatches : matches);
  const activeWorkerIncome = isDemoExperience ? summarizeIncome(wageEntries) : account ? latestProfileIncome : (latestProfileRecords.length ? latestProfileIncome : incomeSummary);
  const activeWorkerRecords = isDemoExperience ? wageEntries : account ? latestProfileRecords : (latestProfileRecords.length ? latestProfileRecords : workRecords);
  const activeWorkerIdentity = latestProfileIdentity || ((!account || isDemoExperience) && hasGeneratedProfile ? careerIdentity : null);
  const dashboardIdentity = activeWorkerIdentity;
  const dashboardIdentityReady = Boolean(dashboardIdentity);
  const workerDashboardRoute = isDemoDashboardRoute
    ? (routePath.startsWith("/demo/dashboard/") ? routePath.split("/")[2] : "home")
    : routePath.startsWith("/dashboard/") ? routePath.split("/")[2] : "home";
  const isAdminRoute = routePath === "/admin/diagnostics";
  const isNgoRoute = routePath === "/ngo" || routePath.startsWith("/ngo/");
  const activeAccountRole = normalizeRole(account?.role);
  const activeNgoOrganization = isNgoDemoMode ? demoNgoOrganization : ngoOrganization;
  const activeNgoStats = isNgoDemoMode ? demoNgoStats : ngoStats;
  const activeNgoActivityLogs = isNgoDemoMode ? demoNgoActivityLogs : ngoActivityLogs;
  const activeNgoAccount = isNgoDemoMode
    ? { id: "ngo-demo-account", uid: "ngo-demo-account", name: "NGO Demo", email: "demo.ngo@rozgaarai.org", role: ROLES.NGO }
    : account;
  const workspaceShellActive = Boolean(authResolved && account && (isCreateProfileRoute || routePath === "/dashboard" || routePath.startsWith("/dashboard/") || isDemoDashboardRoute));
  const protectedWorkspaceRoute = Boolean(isAdminRoute || isCreateProfileRoute || routePath === "/dashboard" || routePath.startsWith("/dashboard/") || isDemoDashboardRoute || isNgoRoute);
  const showMarketingFooter = Boolean(!protectedWorkspaceRoute && !routePath.startsWith("/employer"));
  const isFirstRunOnboarding = Boolean(workspaceShellActive && account && !latestUserProfile && !isDemoExperience && workerDashboardRoute === "home" && !profileFetchError);
  const dashboardBasePath = isDemoExperience ? "/demo/dashboard" : "/dashboard";
  const workerNavItems = [
    [Gauge, workerCopy.home, dashboardBasePath, "home"],
    [IdCard, workerCopy.identity, `${dashboardBasePath}/identity`, "identity"],
    [BriefcaseBusiness, workerCopy.jobs, `${dashboardBasePath}/jobs`, "jobs"],
    [WalletCards, workerCopy.income, `${dashboardBasePath}/income`, "income"],
    [GraduationCap, workerCopy.training, `${dashboardBasePath}/training`, "training"],
    [FileText, workerCopy.resume, `${dashboardBasePath}/resume`, "resume"],
    [MessageSquare, workerCopy.coach, `${dashboardBasePath}/coach`, "coach"],
    [ShieldAlert, workerCopy.safety, `${dashboardBasePath}/safety`, "safety"],
    [ClipboardCheck, workerCopy.applications, `${dashboardBasePath}/applications`, "applications"],
    [Settings, workerCopy.settings, `${dashboardBasePath}/settings`, "settings"]
  ];
  const workerJourneySteps = [
    ["identity", workerCopy.journey[0], dashboardIdentityReady, () => dashboardIdentityReady ? navigateTo(`/worker/${encodeURIComponent(dashboardIdentity.workerId)}`) : navigateTo("/create-profile")],
    ["resume", workerCopy.journey[1], hasResumeReady, () => downloadResume({ preview: true })],
    ["income", workerCopy.journey[2], hasIncomeRecords, () => navigateTo(`${dashboardBasePath}/income`)],
    ["jobs", workerCopy.journey[3], activeWorkerMatches.length > 0, () => navigateTo(`${dashboardBasePath}/jobs`)],
    ["coach", workerCopy.journey[4], practiceHistory.length > 0, openInterviewPracticePage],
    ["safety", workerCopy.journey[5], isDemoExperience, () => navigateTo(`${dashboardBasePath}/safety`)]
  ];
  const recommendedWorkerStep = workerJourneySteps.find(([, , done]) => !done) || workerJourneySteps[workerJourneySteps.length - 1];
  const completedWorkerSteps = workerJourneySteps.filter(([, , done]) => done).length;
  const dashboardProgress = Math.round((completedWorkerSteps / workerJourneySteps.length) * 100);
  const workerReadinessScore = dashboardIdentityReady ? Math.max(72, dashboardProgress) : Math.max(24, dashboardProgress);
  const workerProfileCompletion = dashboardIdentityReady ? Math.max(72, dashboardProgress) : dashboardProgress;
  const expectedSalaryValue = latestWorker.expectedWage ? `₹${Number(latestWorker.expectedWage).toLocaleString("en-IN")}/month` : "₹28,000/month";
  const applicationCount = dashboardIdentityReady ? Math.max(12, Math.round(activeWorkerMatches.length * 0.3)) : 0;
  const resumeScore = hasResumeReady ? 94 : Math.max(36, dashboardProgress);
  const dashboardKpis = [
    [Gauge, workerCopy.kpis[0][0], `${workerReadinessScore}%`, dashboardIdentityReady ? workerCopy.kpis[0][1] : workerCopy.kpis[0][2], "blue"],
    [BriefcaseBusiness, workerCopy.kpis[1][0], activeWorkerMatches.length || 40, workerCopy.kpis[1][1], "green"],
    [IndianRupee, workerCopy.kpis[2][0], expectedSalaryValue, workerCopy.kpis[2][1], "emerald"],
    [ClipboardCheck, workerCopy.kpis[3][0], applicationCount || workerCopy.start, applicationCount ? workerCopy.kpis[3][1] : workerCopy.kpis[3][2], "violet"],
    [FileText, workerCopy.kpis[4][0], `${resumeScore}%`, hasResumeReady ? workerCopy.kpis[4][1] : workerCopy.kpis[4][2], "amber"],
    [IdCard, workerCopy.kpis[5][0], `${workerProfileCompletion}%`, workerCopy.kpis[5][1], "cyan"]
  ];
  const workerNavGroups = [
    [workerCopy.groups[0], [[Gauge, workerCopy.home, dashboardBasePath, "home"], [BriefcaseBusiness, workerCopy.jobs, `${dashboardBasePath}/jobs`, "jobs"], [ClipboardCheck, workerCopy.applications, `${dashboardBasePath}/applications`, "applications"]]],
    [workerCopy.groups[1], [[FileText, workerCopy.resume, `${dashboardBasePath}/resume`, "resume"], [MessageSquare, workerCopy.coach, `${dashboardBasePath}/coach`, "coach"]]],
    [workerCopy.groups[2], [[IdCard, workerCopy.identity, `${dashboardBasePath}/identity`, "identity"], [WalletCards, workerCopy.income, `${dashboardBasePath}/income`, "income"], [GraduationCap, workerCopy.training, `${dashboardBasePath}/training`, "training"]]],
    [workerCopy.groups[3], [[ShieldAlert, workerCopy.safety, `${dashboardBasePath}/safety`, "safety"], [Settings, workerCopy.settings, `${dashboardBasePath}/settings`, "settings"]]]
  ];
  const aiInsightHighlights = [
    withCopyTokens(workerCopy.insights[0], { count: activeWorkerMatches.length || 17, role: roleLabel(latestWorker.skill || worker.skill).toLowerCase() }),
    workerCopy.insights[1],
    withCopyTokens(workerCopy.insights[2], { percent: hasResumeReady ? 81 : 52 })
  ];
  const dashboardTimeline = [
    [workerCopy.today, [
      [FileText, hasResumeReady ? workerCopy.timeline.resumeGenerated : workerCopy.timeline.resumeNeeds, hasResumeReady ? workerCopy.timeline.resumeReady : workerCopy.timeline.resumeImprove, hasResumeReady ? () => downloadResume({ preview: true }) : () => navigateTo(`${dashboardBasePath}/resume`)],
      [IdCard, workerCopy.timeline.employerViewed, workerCopy.timeline.employerViewedCopy, () => dashboardIdentityReady ? navigateTo(`/worker/${encodeURIComponent(dashboardIdentity.workerId)}`) : navigateTo("/create-profile")],
      [WalletCards, hasIncomeRecords ? workerCopy.timeline.incomeUpdated : workerCopy.timeline.incomePending, hasIncomeRecords ? withCopyTokens(workerCopy.timeline.recordsAvailable, { count: activeWorkerRecords.length }) : workerCopy.timeline.incomeStart, () => navigateTo(`${dashboardBasePath}/income`)]
    ]],
    [workerCopy.yesterday, [
      [BriefcaseBusiness, workerCopy.timeline.jobMatched, withCopyTokens(workerCopy.timeline.jobMatchedCopy, { score: activeWorkerMatches[0]?.score || 87 }), () => navigateTo(`${dashboardBasePath}/jobs`)],
      [ShieldCheck, workerCopy.timeline.cardVerified, workerCopy.timeline.cardVerifiedCopy, () => dashboardIdentityReady ? navigateTo(`/worker/${encodeURIComponent(dashboardIdentity.workerId)}`) : navigateTo("/create-profile")]
    ]]
  ];
  const workerMetrics = hasPrimaryIdentity ? [
    [BriefcaseBusiness, workerCopy.kpis[1][0], activeWorkerMatches.length],
    [FileText, workerCopy.applications, 0],
    [IndianRupee, t.passport.incomeThisMonth, formatCurrency(activeWorkerIncome.totalIncome || 0)],
    [MessageSquare, workerCopy.readiness, practiceHistory.length ? `${interviewReadiness}%` : workerCopy.notStarted],
    [WalletCards, workerCopy.pendingPayments, formatCurrency(activeWorkerIncome.pending || 0)]
  ] : [];
  const workerActivity = [
    latestUserProfile && [workerCopy.profileCreated, latestUserProfile.createdAt, latestUserProfile.worker?.name],
    hasResumeReady && [workerCopy.timeline.resumeGenerated, latestUserProfile?.updatedAt || latestUserProfile?.createdAt || new Date().toISOString()],
    hasIncomeRecords && [workerCopy.workRecordAdded, activeWorkerRecords[0]?.date || new Date().toISOString()],
    practiceHistory[0] && [workerCopy.interviewPractice, practiceHistory[0].date],
    activeWorkerMatches[0] && [workerCopy.timeline.jobMatched, new Date().toISOString(), activeWorkerMatches[0].title]
  ].filter(Boolean).slice(0, 6);

  useEffect(() => {
    if (!authResolved || workerDashboardRoute !== "identity") return;
    openCareerIdentityPage();
  }, [authResolved, workerDashboardRoute, hasPrimaryIdentity, activeWorkerIdentity?.workerId]);

  const workerSidebar = (
    <aside className="workspace-sidebar hidden lg:block">
      <div className="workspace-sidebar-brand">
        <button type="button" className="flex min-w-0 items-center gap-3 text-left" onClick={() => navigateTo(dashboardBasePath)} aria-label={workerCopy.aria.openWorkerDashboard}>
          <img src={logoMark} alt={logoAlt} className="h-10 w-10 rounded-lg object-contain" />
          <div className="min-w-0">
            <p className="text-sm font-black text-ink">RozgaarAI</p>
            <p className="truncate text-xs font-bold text-slate-500">{workerCopy.title}</p>
          </div>
        </button>
        <span className="workspace-sidebar-live">{workerCopy.aiReady}</span>
      </div>
      <nav className="workspace-nav-groups" aria-label={workerCopy.aria.workerNavigation}>
        {workerNavGroups.map(([group, items]) => (
          <div key={group} className="workspace-nav-group">
            <p className="workspace-nav-group-label">{group}</p>
            <div className="grid gap-1">
              {items.map(([Icon, label, path, key]) => {
                const tabByKey = { jobs: "jobs", income: "income", resume: "resume", coach: "coach", safety: "rights" };
                const active = (key === "home" && routePath === "/dashboard")
                  || (key === "identity" && routePath.startsWith("/worker/") && ["identity", "overview"].includes(activeWorkspaceTab))
                  || (routePath.startsWith("/worker/") && tabByKey[key] === activeWorkspaceTab)
                  || workerDashboardRoute === key
                  || routePath === path;
                return (
                  <button
                    key={path}
                    type="button"
                    title={label}
                    className={`workspace-nav-item ${active ? "workspace-nav-item-active" : ""}`}
                    onClick={() => openWorkerSidebarDestination(key, path)}
                  >
                    <span className="workspace-nav-icon">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-sm font-extrabold leading-5">{label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="workspace-sidebar-foot">
        <Sparkles className="h-4 w-4 text-saffron" />
        <p>{workerCopy.sidebarHint}</p>
      </div>
    </aside>
  );

  useEffect(() => {
    if (!authResolved || !account || !isDemoDashboardRoute || !isDemoMode || worker.name) return;
    const demoProfile = demoProfiles.find((profileData) => profileData.name === onboardingDemoWorkerName) || demoProfiles[0];
    loadDemoWorker(demoProfile, { tab: "overview" });
  }, [authResolved, account?.id, account?.uid, isDemoDashboardRoute, isDemoMode, worker.name, lang]);

  const onboardingSteps = [
    ["input", workerCopy.onboardingFlow[0], Mic],
    ["extract", workerCopy.onboardingFlow[1], Sparkles],
    ["review", workerCopy.onboardingFlow[2], UserRound],
    ["generate", workerCopy.onboardingFlow[3], IdCard],
    ["open", workerCopy.onboardingFlow[4], CheckCircle2]
  ];
  const onboardingStepIndex = Math.max(0, onboardingSteps.findIndex(([step]) => step === onboardingStep));
  const onboardingProgress = hasGeneratedProfile ? 100 : Math.round(((onboardingStepIndex + 1) / onboardingSteps.length) * 100);
  const canReviewWorker = Boolean(worker.name && worker.phone && worker.city && worker.skill);

  if (isBooting) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-6 text-center">
        <div className="brand-fade flex flex-col items-center">
          <img src={logoMark} alt={logoAlt} className="h-16 w-16 rounded-lg object-contain shadow-soft" />
          <p className="mt-4 text-2xl font-black text-ink">RozgaarAI</p>
          <p className="mt-2 text-sm font-bold text-slate-500">{workerCopy.loading}</p>
        </div>
      </div>
    );
  }

  if (routePath.startsWith("/public/") || routePath.startsWith("/profile/")) {
    return (
      <PublicWorkerProfile
        identity={publicRouteIdentity ? toEnglishArtifactIdentity(publicRouteIdentity, identityPageWorker) : null}
        labels={artifactLabels}
        status={publicRouteIdentity?.publicStatus || publicWorkerLookup.status}
        onBack={() => {
          navigateTo("/");
        }}
      />
    );
  }

  if (routePath.startsWith("/worker/")) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        {hiddenDigitalWorkerCardExport}
        {(statusMessage || errorMessage) && (
          <div className="global-status-toast" role="status" aria-live="polite">
            {errorMessage || statusMessage}
          </div>
        )}
        {isWorkRecordModalOpen && (
          <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeWorkRecordModal(); }}>
            <form
              className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="work-record-modal-title"
              aria-describedby="work-record-modal-description"
              onSubmit={(event) => { event.preventDefault(); saveWorkRecord(); }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="work-record-modal-title" className="text-2xl font-black text-ink">{workerCopy.workRecord.title}</h2>
                  <p id="work-record-modal-description" className="mt-1 text-sm font-semibold text-slate-600">{workerCopy.workRecord.description}</p>
                </div>
                <button type="button" className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" onClick={closeWorkRecordModal} aria-label={`${workerCopy.actions.close} ${workerCopy.workRecord.title}`}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {workRecordErrors.form && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">{workRecordErrors.form}</p>}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label={workerCopy.workRecord.employerLabel}>
                  <Input value={workRecordForm.employerName} onChange={(event) => updateWorkRecordField("employerName", event.target.value)} placeholder={workerCopy.workRecord.employerPlaceholder} aria-invalid={Boolean(workRecordErrors.employerName)} />
                  {workRecordErrors.employerName && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.employerName}</span>}
                </Field>
                <Field label={workerCopy.workRecord.workTypeLabel}>
                  <Input value={workRecordForm.workType} onChange={(event) => updateWorkRecordField("workType", event.target.value)} placeholder={workerCopy.workRecord.workTypePlaceholder} aria-invalid={Boolean(workRecordErrors.workType)} />
                  {workRecordErrors.workType && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.workType}</span>}
                </Field>
                <Field label={workerCopy.workRecord.workDateLabel}>
                  <Input type="date" value={workRecordForm.workDate} onChange={(event) => updateWorkRecordField("workDate", event.target.value)} aria-invalid={Boolean(workRecordErrors.workDate)} />
                  {workRecordErrors.workDate && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.workDate}</span>}
                </Field>
                <Field label={workerCopy.workRecord.amountLabel}>
                  <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                    <span className="grid w-11 place-items-center border-r border-slate-200 text-sm font-black text-slate-500">₹</span>
                    <input className="min-h-[46px] w-full rounded-r-lg px-3 text-sm font-semibold text-ink outline-none" type="number" min="0" value={workRecordForm.amountEarned} onChange={(event) => updateWorkRecordField("amountEarned", event.target.value)} placeholder="0" aria-invalid={Boolean(workRecordErrors.amountEarned)} />
                  </div>
                  {workRecordErrors.amountEarned && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.amountEarned}</span>}
                </Field>
                <Field label={workerCopy.workRecord.paymentStatusLabel}>
                  <Select value={workRecordForm.paymentStatus} onChange={(event) => updateWorkRecordField("paymentStatus", event.target.value)} aria-invalid={Boolean(workRecordErrors.paymentStatus)}>
                    <option value="paid">{workerCopy.workRecord.paid}</option>
                    <option value="pending">{workerCopy.workRecord.pending}</option>
                    <option value="partially_paid">{workerCopy.workRecord.partiallyPaid}</option>
                  </Select>
                  {workRecordErrors.paymentStatus && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.paymentStatus}</span>}
                </Field>
                <Field label={workerCopy.workRecord.hoursLabel}>
                  <Input type="number" min="0" value={workRecordForm.hoursWorked} onChange={(event) => updateWorkRecordField("hoursWorked", event.target.value)} placeholder={workerCopy.workRecord.hoursPlaceholder} aria-invalid={Boolean(workRecordErrors.hoursWorked)} />
                  {workRecordErrors.hoursWorked && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.hoursWorked}</span>}
                </Field>
                <Field label={workerCopy.workRecord.locationLabel}>
                  <Input value={workRecordForm.location} onChange={(event) => updateWorkRecordField("location", event.target.value)} placeholder={workerCopy.workRecord.locationPlaceholder} />
                </Field>
              </div>

              <Field label={workerCopy.workRecord.notesLabel} hint={withCopyTokens(workerCopy.workRecord.notesHint, { count: workRecordForm.notes.length })}>
                <Textarea className="min-h-28" maxLength={500} value={workRecordForm.notes} onChange={(event) => updateWorkRecordField("notes", event.target.value)} placeholder={workerCopy.workRecord.notesPlaceholder} aria-invalid={Boolean(workRecordErrors.notes)} />
                {workRecordErrors.notes && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.notes}</span>}
              </Field>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <ActionButton type="button" icon={X} variant="secondary" onClick={closeWorkRecordModal} disabled={isSavingWorkRecord}>{workerCopy.actions.cancel}</ActionButton>
                <ActionButton type="submit" icon={WalletCards} disabled={isSavingWorkRecord}>{isSavingWorkRecord ? workerCopy.actions.saving : workerCopy.actions.saveWorkRecord}</ActionButton>
              </div>
            </form>
          </div>
        )}
        <div className={account ? "workspace-shell worker-identity-shell" : ""}>
          {account && workerSidebar}
          <div className={account ? "workspace-content" : ""}>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
          <div className="section-shell flex min-h-16 items-center justify-between gap-3 py-2">
            <button type="button" className="group flex items-center font-black text-ink" onClick={() => navigateTo("/")} aria-label={workerCopy.aria.home}>
              <BrandLockup tagline={t.brandTagline} compact />
            </button>
            <div className="flex items-center gap-2">
              <select value={lang} onChange={(event) => handleLanguageSelect(event.target.value)} aria-label={t.languageLabel} className="focus-ring min-h-10 rounded-md border border-slate-200 bg-white px-2 text-sm font-bold text-ink">
                {languageConfig.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
              </select>
              {account ? (
                <>
                  <ActionButton icon={Gauge} variant="secondary" className="hidden sm:inline-flex" onClick={() => navigateTo("/dashboard")}>
                  {wi.dashboard}
                  </ActionButton>
                  <ActionButton icon={UserRound} variant="secondary" className="hidden sm:inline-flex" onClick={signOut}>
                  {wi.signOut}
                  </ActionButton>
                </>
              ) : (
                <ActionButton icon={UserRound} variant="secondary" className="hidden sm:inline-flex" onClick={() => navigateTo("/login")}>
                  {t.auth.signIn}
                </ActionButton>
              )}
            </div>
          </div>
        </header>

        <main>
          <section className="bg-white py-4 sm:py-5">
            <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">
              {isDemoMode && (
                <p className="mb-2 w-fit rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-neem">
                  {wi.demoLoaded}
                </p>
              )}
              <div className="mb-3 max-w-4xl">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">RozgaarAI</p>
                <h1 className="mt-1.5 text-3xl font-black leading-tight text-ink sm:text-[2.45rem]">{identityPageTitle}</h1>
                <p className="mt-1.5 text-base font-medium leading-7 text-slate-600">{identityPageSubtitle}</p>
              </div>
              <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,0.59fr)_minmax(0,0.41fr)]">
                <div className="h-full self-stretch">
                  <div className="worker-hero-identity-card">
                    <DigitalCareerIdentityCard identity={identityPageCardIdentity} labels={artifactLabels} variant="full" contentMode="identityOnly" />
                  </div>
                </div>
	                <div className="flex h-full flex-col gap-5">
                    <div className="panel p-4 sm:p-5 xl:p-5">
	                    <h2 className="text-lg font-black text-ink">{wi.quickActions}</h2>
	                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
	                      {wi.quickCopy}
	                    </p>
	                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
	                      <ActionButton icon={Edit3} variant="secondary" onClick={() => navigateTo("/create-profile")}>{wi.editProfile}</ActionButton>
	                      <ActionButton icon={IdCard} variant="secondary" onClick={() => setActiveWorkspaceTab("identity")}>{wi.viewIdentity}</ActionButton>
	                    <ActionButton icon={MessageSquare} variant="secondary" onClick={copyWorkerProfileLink}>{wi.shareProfile}</ActionButton>
	                      <ActionButton icon={WalletCards} variant="secondary" onClick={openWorkRecordModal}>{wi.addRecord}</ActionButton>
	                    </div>
                    </div>
                    <div className="panel flex flex-1 flex-col p-4 sm:p-5 xl:p-5">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">{wi.workspace}</p>
                          <h3 className="mt-1 text-xl font-black text-ink">{wi.apps}</h3>
                        </div>
                        <p className="text-xs font-bold text-slate-500">{wi.appsCopy}</p>
                      </div>
                      <div className="mt-4 grid flex-1 gap-3 sm:grid-cols-4">
                        {overviewWorkspaceTiles.map(([Icon, title, status, tone, handler]) => (
                          <button key={title} type="button" className="focus-ring group flex min-h-[112px] flex-col items-center justify-center rounded-2xl bg-slate-50 p-3 text-center transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)]" onClick={handler}>
                            <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone} shadow-sm transition group-hover:scale-105`}><Icon className="h-5 w-5" /></span>
                            <span className="mt-3 block text-xs font-black leading-tight text-ink">{title}</span>
                            <span className="mt-1 block text-xs font-bold text-slate-500">{status}</span>
                          </button>
                        ))}
                      </div>
                    </div>
	                </div>
	              </div>
	            </div>
	          </section>

	          {!["identity", "overview"].includes(activeWorkspaceTab) && <section id="workspace" className="bg-white py-12">
            <div className="section-shell">
              {false && activeWorkspaceTab === "overview" && (
                <div className="space-y-6">
                  <section className="overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                        <span className="grid h-24 w-24 shrink-0 place-items-center rounded-[28px] bg-gradient-to-br from-blue-600 to-blue-500 text-3xl font-black text-white shadow-lg shadow-blue-500/20">
                          {String(identityPageWorker.name || "W").split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Worker Overview</p>
                          <h3 className="mt-2 text-4xl font-black leading-none text-ink">{identityPageWorker.name || "Worker"}</h3>
                          <p className="mt-3 text-base font-bold text-slate-600">
                            {identityPageWorker.skill ? roleLabel(identityPageWorker.skill) : "Skill not added"}
                            {identityPageWorker.city ? ` · ${cityLabel(identityPageWorker.city)}` : ""}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-slate-600">
                            <span className="rounded-full bg-slate-100 px-3 py-1.5">Worker ID: {identityPageIdentity.workerId}</span>
                            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">{profileStatus}</span>
                            {identityPageWorker.availability && <span className="rounded-full bg-green-50 px-3 py-1.5 text-neem">Available {identityPageWorker.availability}</span>}
                            {identityPageWorker.experience && <span className="rounded-full bg-slate-100 px-3 py-1.5">{identityPageWorker.experience} years experience</span>}
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
                        <ActionButton icon={Edit3} variant="secondary" onClick={() => navigateTo("/create-profile")}>Edit Profile</ActionButton>
                        <ActionButton icon={MessageSquare} variant="secondary" onClick={() => navigator.clipboard?.writeText(identityPageIdentity.profileUrl)}>Share Profile</ActionButton>
                        <ActionButton icon={IdCard} onClick={() => setActiveWorkspaceTab("identity")}>Digital Identity</ActionButton>
                      </div>
                    </div>
                  </section>

                  <div className="grid gap-5 xl:grid-cols-12">
                    <section className="rounded-[28px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 xl:col-span-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Today’s Progress</p>
                          <h3 className="mt-2 text-2xl font-black text-ink">{remainingOverviewSteps.length ? "Keep building your profile" : "Workspace is ready"}</h3>
                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{completedOverviewSteps} of {overviewChecklist.length} profile steps complete.</p>
                        </div>
                        <span className="rounded-2xl bg-blue-50 px-4 py-3 text-3xl font-black text-blue-700">{overviewCompletionPercent}%</span>
                      </div>
                      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Profile completion" aria-valuenow={overviewCompletionPercent} aria-valuemin="0" aria-valuemax="100">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-neem transition-all duration-700" style={{ width: `${overviewCompletionPercent}%` }} />
                      </div>
                      <div className="mt-5 grid gap-2">
                        {overviewChecklist.slice(0, 5).map(([label, complete]) => (
                          <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5 text-sm font-bold">
                            <span className="flex items-center gap-2 text-slate-700">{complete ? <CheckCircle2 className="h-4 w-4 text-neem" /> : <span className="h-4 w-4 rounded-full border-2 border-blue-400 bg-white" />}{label}</span>
                            <span className={complete ? "text-neem" : "text-blue-600"}>{complete ? "Done" : "Next"}</span>
                          </div>
                        ))}
                      </div>
                      <ActionButton icon={nextOverviewAction[3]} className="mt-5 w-full justify-center" onClick={nextOverviewAction[2]}>{nextOverviewAction[0]}</ActionButton>
                    </section>

                    <section className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] xl:col-span-7">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">AI Insights</p>
                          <h3 className="mt-2 text-2xl font-black">Profile intelligence</h3>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-blue-100">Live workspace signals</span>
                      </div>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {overviewAiInsights.map(([Icon, label, value, status, color]) => {
                          const percent = Math.max(0, Math.min(100, Number(value) || 0));
                          return (
                            <article key={label} className="rounded-3xl bg-white/[0.07] p-4 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/[0.1]">
                              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${percent * 3.6}deg, rgba(255,255,255,0.14) 0deg)` }}>
                                <div className="grid h-[4.7rem] w-[4.7rem] place-items-center rounded-full bg-slate-950">
                                  <span className="text-xl font-black">{percent}%</span>
                                </div>
                              </div>
                              <div className="mt-4 flex items-start gap-2">
                                <Icon className="h-4 w-4 shrink-0 text-blue-200" />
                                <div>
                                  <h4 className="text-sm font-black">{label}</h4>
                                  <p className="mt-1 text-xs font-bold text-slate-300">{status}</p>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>

                    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white shadow-[0_22px_58px_rgba(37,99,235,0.22)] xl:col-span-4">
                      {(() => {
                        const [title, copy, handler, Icon] = primaryOverviewRecommendation;
                        return (
                          <>
                            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
                            <div className="absolute bottom-6 right-6 grid h-24 w-24 place-items-center rounded-[2rem] bg-white/10 text-white/80">
                              <Sparkles className="h-10 w-10" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-100">Recommended by AI</p>
                            <Icon className="mt-6 h-8 w-8" />
                            <h3 className="mt-4 max-w-xs text-2xl font-black leading-tight">{title}</h3>
                            <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-blue-50">{copy}</p>
                            <div className="mt-5 grid gap-2 text-xs font-black text-blue-50">
                              <span>Benefit: stronger employer trust</span>
                              <span>Estimated time: 2 minutes</span>
                            </div>
                            <button type="button" className="focus-ring mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg" onClick={handler}>
                              <Icon className="h-4 w-4" /> Start now
                            </button>
                          </>
                        );
                      })()}
                    </section>

                    <section className="rounded-[28px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 xl:col-span-8">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Workspace</p>
                          <h3 className="mt-2 text-2xl font-black text-ink">RozgaarAI apps</h3>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">Open the tools that move this worker forward.</p>
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {overviewWorkspaceTiles.map(([Icon, title, status, tone, handler]) => (
                          <button key={title} type="button" className="focus-ring group rounded-3xl bg-slate-50 p-4 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]" onClick={handler}>
                            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tone} shadow-sm transition group-hover:scale-105`}><Icon className="h-5 w-5" /></span>
                            <span className="mt-4 block text-sm font-black text-ink">{title}</span>
                            <span className="mt-1 block text-xs font-bold text-slate-500">{status}</span>
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="rounded-[28px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 xl:col-span-7">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Recent Activity</p>
                      <h3 className="mt-2 text-2xl font-black text-ink">Latest workspace updates</h3>
                      <div className="mt-5 divide-y divide-slate-100">
                        {overviewActivities.length ? overviewActivities.map(([label, date, detail, Icon]) => (
                          <div key={`${label}-${date}-${detail}`} className="flex items-center gap-3 py-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-50 text-neem"><CheckCircle2 className="h-4 w-4" /></span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-black text-ink">{label}</p>
                              <p className="mt-1 truncate text-xs font-bold text-slate-500">{detail || "Workspace updated"}</p>
                            </div>
                            <span className="shrink-0 text-xs font-black text-slate-400">{formatOverviewTimelineDate(date)}</span>
                            <Icon className="hidden h-4 w-4 text-slate-300 sm:block" />
                          </div>
                        )) : (
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">No recent activity yet. Profile updates, resume actions, and income records will appear here.</div>
                        )}
                      </div>
                    </section>

                    <section className="rounded-[28px] bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70 xl:col-span-5">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Notifications</p>
                      <h3 className="mt-2 text-2xl font-black text-ink">Needs attention</h3>
                      <div className="mt-5 grid gap-3">
                        {overviewNotifications.slice(0, 4).map(([title, copy, handler, Icon], index) => (
                          <button key={`${title}-${index}`} type="button" className="focus-ring flex items-start gap-3 rounded-2xl bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-blue-50" onClick={handler}>
                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${index === 0 ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}><Icon className="h-5 w-5" /></span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-black text-ink">{title}</span>
                              <span className="mt-1 block text-xs font-bold leading-5 text-slate-600">{copy}</span>
                              <span className="mt-2 inline-flex text-xs font-black text-blue-700">Review</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {false && (activeWorkspaceTab === "identity" || activeWorkspaceTab === "overview") && (
                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                  <div className="worker-hero-identity-card">
                    <DigitalCareerIdentityCard identity={identityPageCardIdentity} labels={artifactLabels} variant="full" contentMode="identityOnly" />
                  </div>
                  <div className="grid content-start gap-4">
                    <div className="panel p-6 sm:p-7">
                      <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{isLocalizedLanguage ? "Verified credential" : "Verified credential"}</p>
                      <h3 className="mt-2 text-2xl font-black text-ink">{identityPageIdentity.name}</h3>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{identityPageIdentity.resumeSummary}</p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {[
                          [t.workerId, identityPageIdentity.workerId],
                          [t.fields.primarySkill, identityPageIdentity.primarySkill],
                          [t.fields.city, identityPageIdentity.city],
                          [t.fields.availability, identityPageIdentity.availability],
                          [t.careerIdentity.aiSkillConfidence, `${identityPageIdentity.skillConfidence}/100`],
                          [t.bestMatch, identityPageMatches[0] ? `${identityPageMatches[0].score}%` : t.notAvailable]
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
                            <p className="mt-1 text-sm font-black text-ink">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="panel p-6 sm:p-7">
                      <h3 className="text-xl font-black text-ink">{isLocalizedLanguage ? "Share identity" : "Share identity"}</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <ActionButton icon={IdCard} variant="secondary" onClick={downloadCertificatePdf} disabled={isExportingWorkerCard}>{digitalWorkerCardDownloadLabel}</ActionButton>
                        <ActionButton icon={Globe2} variant="secondary" onClick={() => window.open(identityPageIdentity.profileUrl, "_blank", "noopener,noreferrer")}>{t.shareProfile.open}</ActionButton>
                        <ActionButton icon={MessageSquare} variant="secondary" onClick={copyWorkerProfileLink}>{isLocalizedLanguage ? "Copy Link" : "Copy Link"}</ActionButton>
                        <ActionButton icon={Download} variant="secondary" onClick={downloadResume}>{t.careerIdentity.downloadResume}</ActionButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "income" && (
                <div className="mx-auto w-full max-w-[1240px] space-y-5">
                  <section className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-emerald-50/35 p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-saffron before:to-neem sm:p-8">
                    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-saffron">{workerCopy.incomePassport.eyebrow}</p>
                        <h3 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-[3rem]">{workerCopy.incomePassport.title}</h3>
                        <p className="mt-3 text-base font-medium leading-7 text-slate-600">{workerCopy.incomePassport.copy}</p>
                      </div>
                      <ActionButton icon={Download} variant="secondary" className="relative z-10 min-h-12 rounded-xl bg-white px-6 shadow-[0_12px_28px_rgba(15,23,42,0.08)]" onClick={downloadWorkHistory}>
                        {workerCopy.incomePassport.downloadHistory}
                      </ActionButton>
                    </div>
                    <div className="pointer-events-none absolute bottom-0 left-[52%] hidden h-36 w-72 opacity-70 lg:block">
                      <div className="absolute bottom-0 left-0 h-20 w-20 rounded-t-xl bg-blue-100/50" />
                      <div className="absolute bottom-0 left-16 h-28 w-20 rounded-t-xl bg-blue-100/40" />
                      <div className="absolute bottom-0 left-36 h-16 w-20 rounded-t-xl bg-emerald-100/45" />
                    </div>
                    <div className="pointer-events-none absolute bottom-7 left-[56%] hidden w-44 rotate-[-2deg] rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-[0_18px_40px_rgba(37,99,235,0.12)] backdrop-blur lg:block">
                      <ShieldCheck className="h-12 w-12 text-saffron" />
                      <div className="mt-4 h-2 w-24 rounded-full bg-slate-200" />
                      <div className="mt-2 h-2 w-16 rounded-full bg-slate-200" />
                      <span className="absolute -right-5 bottom-6 grid h-12 w-12 place-items-center rounded-full bg-neem text-white shadow-lg"><CheckCircle2 className="h-7 w-7" /></span>
                    </div>
                  </section>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,0.63fr)_minmax(360px,0.37fr)]">
                    <section className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-7">
                      <div className="grid gap-6 lg:grid-cols-[1fr_180px] lg:items-start">
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{workerCopy.incomePassport.totalIncome}</p>
                          <p className="mt-3 text-6xl font-black leading-none text-ink">{formatCurrency(identityPageSummary.totalIncome)}</p>
                          <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {[
                              [TrendingUp, workerCopy.incomePassport.incomeGrowth, identityPageRecords.length ? workerCopy.incomePassport.basedOnSaved : workerCopy.incomePassport.noPriorMonth, "text-neem"],
                              [ShieldCheck, workerCopy.incomePassport.verifiedRecords, identityPageRecords.length, "text-neem"],
                              [CheckCircle2, workerCopy.incomePassport.paymentReliability, `${identityPaymentCompletion}%`, "text-neem"],
                              [UserRound, workerCopy.incomePassport.employmentCredibility, `${identityPageReadiness}/100`, "text-neem"]
                            ].map(([Icon, label, value, tone]) => (
                              <div key={label} className="flex min-h-[64px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,23,42,0.07)]">
                                <Icon className={`h-5 w-5 shrink-0 ${tone}`} />
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
                                  <p className="mt-1 text-base font-black text-ink">{value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {workerCopy.incomePassport.indicators.map((indicator) => (
                              <span key={indicator} className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                                <IdCard className="h-3.5 w-3.5" /> {indicator}
                              </span>
                            ))}
                          </div>
                          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-slate-600">{workerCopy.incomePassport.shareCopy}</p>
                        </div>
                        <div className="flex justify-start lg:justify-end">
                          <div className="relative grid h-40 w-40 place-items-center rounded-full bg-white">
                            <svg className="h-40 w-40 -rotate-90 drop-shadow-sm" viewBox="0 0 120 120" aria-hidden="true">
                              <circle cx="60" cy="60" r="48" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                              <circle cx="60" cy="60" r="48" fill="none" stroke="url(#incomePaymentRingLarge)" strokeLinecap="round" strokeWidth="10" strokeDasharray={`${Math.min(identityPaymentCompletion, 100) * 3.016} 301.6`} />
                              <defs>
                                <linearGradient id="incomePaymentRingLarge" x1="0" x2="1" y1="0" y2="1">
                                  <stop offset="0%" stopColor="#2563EB" />
                                  <stop offset="100%" stopColor="#16A34A" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <span className="absolute left-1/2 top-4 h-3 w-3 -translate-x-1/2 rounded-full bg-neem shadow-sm" />
                            <div className="absolute text-center">
                              <p className="text-3xl font-black text-ink">{identityPaymentCompletion}%</p>
                              <p className="mt-1 max-w-24 text-[11px] font-black uppercase leading-3 tracking-[0.12em] text-slate-500">{workerCopy.incomePassport.paymentReliability}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="grid gap-4">
                      {[
                        [CalendarClock, workerCopy.incomePassport.daysWorked, identityPageSummary.totalDays, "default"],
                        [Gauge, workerCopy.incomePassport.averageDailyIncome, formatCurrency(identityPageSummary.avgDaily), "default"],
                        [BriefcaseBusiness, workerCopy.incomePassport.hoursWorked, identityPageSummary.totalHours, "default"],
                        [WalletCards, workerCopy.incomePassport.paymentPending, formatCurrency(identityPageSummary.pending), "warning"]
                      ].map(([Icon, label, value, tone]) => (
                        <button key={label} type="button" className={`focus-ring group flex min-h-[88px] items-center gap-4 rounded-[18px] border p-4 text-left shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)] ${tone === "warning" ? "border-amber-200 bg-amber-50/55" : "border-slate-200 bg-white"}`}>
                          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone === "warning" ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-saffron"}`}><Icon className="h-6 w-6" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-600">{label}</span>
                            <span className="mt-1 block text-2xl font-black text-ink">{value}</span>
                          </span>
                          <ChevronRight className={`h-5 w-5 shrink-0 transition group-hover:translate-x-0.5 ${tone === "warning" ? "text-amber-600" : "text-slate-500"}`} />
                        </button>
                      ))}
                    </section>
                  </div>

                  <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] before:block before:h-1 before:rounded-full before:bg-gradient-to-r before:from-saffron before:to-neem sm:p-6">
                    <div className="mt-1 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-blue-50 text-saffron"><CalendarClock className="h-7 w-7" /></span>
                        <div>
                          <p className="text-sm font-black text-ink">{identityPrimaryMonth}</p>
                          <p className="mt-1 text-3xl font-black text-ink">{formatCurrency(identityPageSummary.totalIncome)} earned</p>
                          <p className="mt-1 text-sm font-semibold text-slate-600">{identityPageSummary.totalDays} work days • Payment completion: {identityPaymentCompletion}%</p>
                        </div>
                      </div>
                      <div className="w-full lg:max-w-[460px]">
                        <div className="flex items-center gap-3">
                          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-gradient-to-r from-saffron to-neem transition-all duration-700" style={{ width: `${identityPaymentCompletion}%` }} />
                          </div>
                          <span className="text-sm font-black text-slate-700">{identityPaymentCompletion}%</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)] before:block before:h-1 before:rounded-full before:bg-gradient-to-r before:from-saffron before:to-neem">
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{workerCopy.incomePassport.verifiedRecords}</p>
                        <h3 className="mt-2 text-2xl font-black text-ink">{workerCopy.incomePassport.ledger}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-black text-slate-600">{identityPageRecords.length} records</span>
                        <button type="button" className="focus-ring rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-ink hover:bg-slate-50">{workerCopy.actions.filter}</button>
                        <button type="button" className="focus-ring rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-ink hover:bg-slate-50">{workerCopy.actions.sort}</button>
                        <ActionButton icon={Download} variant="secondary" className="min-h-10 px-3 py-2 text-sm" onClick={downloadWorkHistory}>{workerCopy.actions.downloadCsv}</ActionButton>
                      </div>
                    </div>

                    {identityPageRecords.length ? (
                      <div className="overflow-x-auto border-t border-slate-100">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.1em] text-slate-500">
                            <tr>
                              {workerCopy.incomePassport.table.map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {identityPageRecords.slice(0, 9).map((record) => {
                              const isPending = Number(record.paymentPending || 0) > 0;
                              return (
                                <tr key={record.id} className="transition hover:bg-blue-50/30">
                                  <td className="px-5 py-4 font-black text-ink">{record.employer || record.worksite || workerCopy.incomePassport.employerFallback}<p className="mt-1 text-xs font-bold text-slate-500">{record.date}</p></td>
                                  <td className="px-5 py-4 font-bold text-slate-700">{record.jobType || roleLabel(identityPageWorker.skill)}</td>
                                  <td className="px-5 py-4 font-bold text-slate-700">{record.days || 1}</td>
                                  <td className="px-5 py-4 font-black text-ink">{formatCurrency(record.paymentReceived || record.dailyWage || 0)}</td>
                                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${isPending ? "bg-amber-50 text-amber-700" : "bg-green-50 text-neem"}`}>{isPending ? workerCopy.workRecord.partiallyPaid : workerCopy.workRecord.paid}</span></td>
                                  <td className="px-5 py-4 font-bold text-slate-700">{workerCopy.incomePassport.verified}</td>
                                  <td className="px-5 py-4 font-bold text-slate-700">{isPending ? formatCurrency(record.paymentPending) : workerCopy.incomePassport.complete}</td>
                                  <td className="px-5 py-4"><button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-ink hover:border-blue-200 hover:bg-blue-50" onClick={() => downloadEmploymentProof(record)}>Proof PDF</button></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="border-t border-slate-100 p-8 text-center">
                        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-blue-50 text-saffron"><FileText className="h-10 w-10" /></div>
                        <h4 className="mt-5 text-2xl font-black text-ink">{workerCopy.incomePassport.emptyTitle}</h4>
                        <p className="mx-auto mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-600">{workerCopy.incomePassport.emptyCopy}</p>
                        <div className="mt-5 flex flex-wrap justify-center gap-3">
                          <ActionButton icon={Plus} onClick={openWorkRecordModal}>{workerCopy.workRecord.title}</ActionButton>
                          <ActionButton icon={Info} variant="secondary" onClick={() => setStatusMessage(workerCopy.incomePassport.learnMoreMessage)}>{workerCopy.actions.learnMore}</ActionButton>
                        </div>
                      </div>
                    )}
                  </section>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm font-semibold leading-6 text-slate-700">
                    This passport helps workers demonstrate income consistency, verified work history, and payment records to employers, NGOs, and financial partners.
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "training" && (
                <WorkerTraining workerProfile={latestUserProfile || routeUserProfile || routeDemoProfile || latestWorker} />
              )}

              {activeWorkspaceTab === "jobs" && (
                <div className="space-y-5">
                  <div className="panel p-6 sm:p-7">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">
                          {routeDemoProfile
                            ? (isLocalizedLanguage ? "AI नौकरी सुझाव" : workerCopy.recommendations.aiTitle)
                            : (isLocalizedLanguage ? "नियोक्ता नौकरी पोस्ट" : workerCopy.recommendations.employerTitle)}
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-ink">
                          {routeDemoProfile
                            ? (isLocalizedLanguage ? "आपके लिए उपयुक्त सत्यापित काम" : workerCopy.recommendations.aiTitle)
                            : (isLocalizedLanguage ? "नियोक्ताओं द्वारा जोड़ी गई नौकरियां" : workerCopy.recommendations.employerSubtitle)}
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                          {routeDemoProfile
                            ? (isLocalizedLanguage
                              ? "आपके सत्यापित कौशल, काम के इतिहास, मजदूरी अपेक्षा, भाषा और सुरक्षा पसंद के आधार पर सुझाव।"
                              : workerCopy.recommendations.aiCopy)
                            : (isLocalizedLanguage
                              ? "यहां केवल वे नौकरी पोस्ट दिखती हैं जिन्हें नियोक्ताओं ने Employer Workspace से प्रकाशित किया है।"
                              : workerCopy.recommendations.employerCopy)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <select value={jobFilters.role} onChange={(event) => setJobFilters({ ...jobFilters, role: event.target.value })} className="focus-ring min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-ink">
                          <option value="">{isLocalizedLanguage ? "सभी भूमिकाएँ" : "Role"}</option>
                          {jobRoleOptions.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                        </select>
                        <select value={jobFilters.city} onChange={(event) => setJobFilters({ ...jobFilters, city: event.target.value })} className="focus-ring min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-ink">
                          <option value="">{isLocalizedLanguage ? "सभी शहर" : "City"}</option>
                          {jobCityOptions.map((city) => <option key={city} value={city}>{cityLabel(city)}</option>)}
                        </select>
                        {routeDemoProfile && (
                          <button type="button" onClick={() => setJobFilters({ ...jobFilters, verifiedOnly: !jobFilters.verifiedOnly })} className={`focus-ring min-h-10 rounded-lg border px-3 text-sm font-black ${jobFilters.verifiedOnly ? "border-green-200 bg-green-50 text-neem" : "border-slate-200 bg-white text-ink"}`}>
                            {isLocalizedLanguage ? "केवल सत्यापित" : workerCopy.recommendations.verifiedOnly}
                          </button>
                        )}
                        {[
                          ["match", routeDemoProfile ? (isLocalizedLanguage ? "सबसे अच्छा मिलान" : workerCopy.recommendations.highestMatch) : (isLocalizedLanguage ? "प्रोफ़ाइल फिट" : workerCopy.recommendations.profileFit)],
                          ["salary", isLocalizedLanguage ? "सबसे अधिक वेतन" : workerCopy.recommendations.highestSalary],
                          ["nearest", isLocalizedLanguage ? "शहर मिलान" : workerCopy.recommendations.cityMatch]
                        ].map(([sortKey, label]) => (
                          <button key={sortKey} type="button" onClick={() => setJobFilters({ ...jobFilters, sort: sortKey })} className={`focus-ring min-h-10 rounded-lg border px-3 text-sm font-black ${jobFilters.sort === sortKey ? "border-blue-200 bg-blue-50 text-saffron" : "border-slate-200 bg-white text-ink"}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-2">
                    {filteredJobMatches.slice(0, 6).map((job, index) => {
                      const isEmployerJob = job.source === "employer";
                      const verified = !isEmployerJob && job.status === "Verified";
                      const salaryText = `${formatCurrency(job.wageRange?.min || 0)}-${formatCurrency(job.wageRange?.max || 0)} / ${periodLabel(job.wageRange?.period || "Monthly")}`;
                      const distance = `${4 + index * 2} km ${isLocalizedLanguage ? "दूर" : "away"}`;
                      const aiReasons = isEmployerJob
                        ? [
                          identityPageWorker.skill && job.skill === identityPageWorker.skill ? (isLocalizedLanguage ? "आपके प्राथमिक कौशल से मेल खाती है" : workerCopy.recommendations.matchesSkill) : "",
                          identityPageWorker.city && job.city === identityPageWorker.city ? (isLocalizedLanguage ? "आपके शहर में पोस्ट की गई" : workerCopy.recommendations.postedCity) : "",
                          job.languages ? `${isLocalizedLanguage ? "भाषा" : "Language"}: ${job.languages}` : "",
                          job.experienceRequired ? `${isLocalizedLanguage ? "अनुभव" : "Experience"}: ${job.experienceRequired}+ ${isLocalizedLanguage ? "वर्ष" : "years"}` : "",
                          job.openings ? `${job.openings} ${isLocalizedLanguage ? "रिक्तियां" : "openings"}` : ""
                        ].filter(Boolean)
                        : [
                          isLocalizedLanguage ? "आपके सत्यापित अनुभव से मेल खाता है" : workerCopy.recommendations.matchesExperience,
                          isLocalizedLanguage ? "आपकी पसंदीदा मजदूरी के भीतर" : workerCopy.recommendations.withinWage,
                          `${(job.languagePreference || []).map(languageLabel).join(", ")} ${isLocalizedLanguage ? "बोलने वाला कार्यस्थल" : "speaking workplace"}`,
                          verified ? (isLocalizedLanguage ? "सत्यापित नियोक्ता" : "Verified employer") : (isLocalizedLanguage ? "सुरक्षा जाँच जरूरी" : workerCopy.recommendations.needsSafety),
                          Number(job.safetyScore || 0) >= 85 ? (isLocalizedLanguage ? "मजबूत भुगतान इतिहास" : workerCopy.recommendations.strongPayment) : (isLocalizedLanguage ? "भुगतान शर्तें पहले जांचें" : workerCopy.recommendations.reviewPayment),
                          Number(job.safetyScore || 0) >= 80 ? (isLocalizedLanguage ? "सुरक्षित कार्यस्थल" : workerCopy.recommendations.safeWorkplace) : (isLocalizedLanguage ? "कार्यस्थल सत्यापन बाकी" : workerCopy.recommendations.workplacePending)
                        ];
                      const trustChips = isEmployerJob ? [] : [
                        verified ? (isLocalizedLanguage ? "सत्यापित नियोक्ता" : "Verified Employer") : (isLocalizedLanguage ? "असत्यापित" : workerCopy.recommendations.unverified),
                        `${isLocalizedLanguage ? "भुगतान भरोसा" : workerCopy.incomePassport.paymentReliability} ${Math.min(98, Math.max(72, job.safetyScore || 85))}%`,
                        `${18 + index * 7} ${isLocalizedLanguage ? "श्रमिक रखे" : workerCopy.recommendations.workersHired}`,
                        `0 ${isLocalizedLanguage ? "फ्रॉड रिपोर्ट" : workerCopy.recommendations.fraudReports}`,
                        isLocalizedLanguage ? "बैकग्राउंड जाँचा गया" : workerCopy.recommendations.backgroundVerified
                      ];
                      return (
                        <article key={job.id} className="premium-card p-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="text-2xl font-black leading-tight text-ink">{jobTitleLabel(job)}</h3>
                              <p className="mt-1 text-sm font-bold text-slate-600">{job.employer || job.employerName}</p>
                              <p className="mt-3 text-3xl font-black leading-tight text-ink">{salaryText}</p>
                              <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700">
                                  <MapPin className="mr-1 inline h-3.5 w-3.5 text-saffron" /> {cityLabel(job.city)}
                                </span>
                                {identityPageWorker.city && job.city === identityPageWorker.city && (
                                  <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-neem">
                                    {isLocalizedLanguage ? "आपके शहर में" : workerCopy.recommendations.inCity}
                                  </span>
                                )}
                                {!isEmployerJob && <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700">{distance}</span>}
                                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700">
                                  {isEmployerJob ? (job.employmentType || (isLocalizedLanguage ? "नियोक्ता पोस्ट" : workerCopy.recommendations.employerPost)) : (isLocalizedLanguage ? "तुरंत भर्ती" : workerCopy.recommendations.immediateHiring)}
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-center shadow-sm">
                              {!isEmployerJob && <p className="text-sm tracking-[0.12em] text-saffron">★★★★★</p>}
                              <p className="mt-1 text-2xl font-black text-ink">{job.score}%</p>
                              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{isEmployerJob ? (isLocalizedLanguage ? "प्रोफ़ाइल फिट" : "Profile fit") : (isLocalizedLanguage ? "मिलान" : "Match")}</p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-xl border border-slate-200 bg-white/85 p-4">
                            <h4 className="text-sm font-black text-ink">{isEmployerJob ? (isLocalizedLanguage ? "पोस्ट की गई नौकरी का विवरण" : workerCopy.recommendations.postedDetails) : (isLocalizedLanguage ? "AI ने यह क्यों सुझाया" : workerCopy.recommendations.whyAi)}</h4>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {aiReasons.map((reason) => (
                                <p key={reason} className="flex gap-2 text-sm font-semibold leading-5 text-slate-700">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neem" />
                                  <span>{reason}</span>
                                </p>
                              ))}
                            </div>
                            {isEmployerJob && job.description && (
                              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{job.description}</p>
                            )}
                            {isEmployerJob && (job.requirements || job.benefits || job.closingDate) && (
                              <div className="mt-3 grid gap-2 text-xs font-black text-slate-600 sm:grid-cols-3">
                                {job.requirements && <span className="rounded-lg bg-slate-50 px-3 py-2">{isLocalizedLanguage ? "जरूरतें" : workerCopy.recommendations.requirements}: {job.requirements}</span>}
                                {job.benefits && <span className="rounded-lg bg-slate-50 px-3 py-2">{isLocalizedLanguage ? "लाभ" : workerCopy.recommendations.benefits}: {job.benefits}</span>}
                                {job.closingDate && <span className="rounded-lg bg-slate-50 px-3 py-2">{isLocalizedLanguage ? "अंतिम तारीख" : workerCopy.recommendations.closes}: {job.closingDate}</span>}
                              </div>
                            )}
                          </div>

                          {!isEmployerJob && (
                            <div className="mt-5">
                              <h4 className="text-sm font-black text-ink">{isLocalizedLanguage ? "नियोक्ता भरोसा" : workerCopy.recommendations.employerTrust}</h4>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {trustChips.map((chip, chipIndex) => (
                                  <span key={chip} className={`rounded-full border px-2.5 py-1 text-xs font-black ${chipIndex === 0 && verified ? "border-green-200 bg-green-50 text-neem" : "border-slate-200 bg-white text-slate-700"}`}>
                                    {chip}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-6 flex flex-wrap gap-2">
                            <button type="button" onClick={() => isEmployerJob ? navigateTo(`/employer/jobs/${job.id}`) : setStatusMessage(workerCopy.recommendations.detailsOpened)} className="focus-ring rounded-lg bg-saffron px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-blue-700">
                              {isLocalizedLanguage ? "विवरण देखें" : workerCopy.actions.viewDetails}
                            </button>
                            <button type="button" onClick={() => setStatusMessage(workerCopy.recommendations.saved)} className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-ink hover:border-blue-200 hover:bg-blue-50">
                              {isLocalizedLanguage ? "सेव करें" : "Save"}
                            </button>
                            <button type="button" onClick={() => setActiveWorkspaceTab("coach")} className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-ink hover:border-blue-200 hover:bg-blue-50">
                              {isLocalizedLanguage ? "इंटरव्यू शुरू करें" : workerCopy.actions.startInterview}
                            </button>
                            <button type="button" onClick={() => {
                              navigator.clipboard?.writeText(`${jobTitleLabel(job)} • ${identityPageIdentity.profileUrl}`);
                              setStatusMessage(workerCopy.recommendations.copied);
                            }} className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-ink hover:border-blue-200 hover:bg-blue-50">
                              {isLocalizedLanguage ? "शेयर" : "Share"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {!filteredJobMatches.length && (
                    <div className="panel p-8 text-center">
                      <Search className="mx-auto h-8 w-8 text-slate-400" />
                      <h3 className="mt-3 text-xl font-black text-ink">
                        {!routeDemoProfile && !identityPageMatches.length
                          ? (isLocalizedLanguage ? "अभी कोई नियोक्ता नौकरी पोस्ट नहीं है" : workerCopy.recommendations.noEmployerJobs)
                          : (isLocalizedLanguage ? "इस फ़िल्टर में नौकरी नहीं मिली" : workerCopy.recommendations.noFilteredJobs)}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        {!routeDemoProfile && !identityPageMatches.length
                          ? (isLocalizedLanguage
                            ? "Employer Workspace से प्रकाशित नौकरियां यहां दिखाई देंगी।"
                            : workerCopy.recommendations.employerEmpty)
                          : (isLocalizedLanguage ? "भूमिका या शहर फ़िल्टर बदलकर फिर देखें।" : workerCopy.recommendations.filtersEmpty)}
                      </p>
                      {!routeDemoProfile && !identityPageMatches.length && (
                        <button type="button" onClick={() => navigateTo("/employer/jobs")} className="focus-ring mt-5 rounded-lg bg-saffron px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-blue-700">
                          {isLocalizedLanguage ? "Employer Jobs खोलें" : workerCopy.recommendations.openEmployerJobs}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeWorkspaceTab === "wages" && (
                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="premium-card p-6 sm:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">
                          {isLocalizedLanguage ? "AI मजदूरी समझ" : workerCopy.wages.eyebrow}
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-ink">
                          {isLocalizedLanguage ? "AI उचित मजदूरी सलाह" : workerCopy.wages.title}
                        </h3>
                        <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600">
                          {isLocalizedLanguage
                            ? "आपके अनुभव, शहर, काम इतिहास और भुगतान रिकॉर्ड के आधार पर बेहतर मजदूरी तय करने में मदद।"
                            : workerCopy.wages.copy}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center">
                        <p className="text-2xl font-black text-neem">95%</p>
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-neem">{isLocalizedLanguage ? "विश्वास" : "Confidence"}</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-bold text-slate-500">{isLocalizedLanguage ? "सुझाई गई मासिक मजदूरी" : workerCopy.wages.recommendedMonthly}</p>
                      <p className="mt-2 text-5xl font-black leading-tight text-ink">{formatCurrency(identityRecommendedWage)}</p>
                      <p className="mt-2 text-sm font-bold text-slate-600">
                        {isLocalizedLanguage ? "रेंज" : "Range"}: {formatCurrency(identityWageLow)}-{formatCurrency(identityWageHigh)}
                      </p>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h4 className="text-sm font-black text-ink">{isLocalizedLanguage ? "AI यह मजदूरी क्यों सुझाता है" : workerCopy.wages.why}</h4>
                        <div className="mt-4 space-y-3">
                          {[
                            `${identityPageWorker.experience} ${isLocalizedLanguage ? "साल सत्यापित अनुभव" : "years verified experience"}`,
                            isLocalizedLanguage ? `${cityLabel(identityPageWorker.city)} में उच्च मांग` : `High demand in ${cityLabel(identityPageWorker.city)}`,
                            isLocalizedLanguage ? "सत्यापित नियोक्ता नेटवर्क" : workerCopy.wages.verifiedNetwork,
                            isLocalizedLanguage ? "मजबूत भुगतान इतिहास" : workerCopy.recommendations.strongPayment
                          ].map((reason) => (
                            <p key={reason} className="flex gap-2 text-sm font-semibold leading-5 text-slate-700">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neem" />
                              <span>{reason}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                        <h4 className="text-sm font-black text-ink">{isLocalizedLanguage ? "स्थानीय मजदूरी तुलना" : workerCopy.wages.benchmark}</h4>
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-bold text-slate-600">{isLocalizedLanguage ? "बाज़ार औसत" : workerCopy.wages.marketAverage}</p>
                            <p className="text-lg font-black text-ink">{formatCurrency(identityMarketWage)}</p>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-bold text-slate-600">{isLocalizedLanguage ? "सुझाई मजदूरी" : workerCopy.wages.recommendedWage}</p>
                            <p className="text-lg font-black text-neem">{formatCurrency(identityRecommendedWage)}</p>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white">
                            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-saffron to-neem" />
                          </div>
                          <p className="text-sm font-black text-neem">+{identityMarketLift}% {isLocalizedLanguage ? "बाज़ार से अधिक" : "above market"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                      <h4 className="text-sm font-black text-ink">{isLocalizedLanguage ? "मोलभाव सुझाव" : workerCopy.wages.tips}</h4>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          isLocalizedLanguage ? "सत्यापित काम इतिहास बताएं" : workerCopy.wages.mentionHistory,
                          isLocalizedLanguage ? `${roleLabel(identityPageWorker.skill)} के जरूरी काम का अनुभव दिखाएं` : `Highlight emergency ${roleLabel(identityPageWorker.skill).toLowerCase()} experience`,
                          `${isLocalizedLanguage ? "मांगें" : "Ask for"} ${formatCurrency(identityRecommendedWage)}-${formatCurrency(Math.round(identityRecommendedWage * 1.07))}`,
                          isLocalizedLanguage ? "सप्ताहांत काम के लिए अतिरिक्त दर मांगें" : workerCopy.wages.weekendPremium
                        ].map((tip) => (
                          <p key={tip} className="flex gap-2 text-sm font-semibold leading-5 text-slate-700">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neem" />
                            <span>{tip}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="premium-card p-6 sm:p-7">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">
                          {isLocalizedLanguage ? "आय रिकॉर्ड जोड़ें" : workerCopy.wages.recordIncome}
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-ink">{t.wageEntry.title}</h3>
                      </div>

                      <div className="mt-5 space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{isLocalizedLanguage ? "काम विवरण" : workerCopy.wages.workDetails}</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Field label={t.wageEntry.employer}><Input value={wageEntry.employer} onChange={(event) => setWageEntry({ ...wageEntry, employer: event.target.value })} placeholder={t.wageEntry.employerPlaceholder} /></Field>
                            <Field label={t.wageEntry.date}><Input type="date" value={wageEntry.date} onChange={(event) => setWageEntry({ ...wageEntry, date: event.target.value })} /></Field>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{isLocalizedLanguage ? "मजदूरी और घंटे" : workerCopy.wages.wageHours}</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Field label={t.wageEntry.dailyWage}><Input type="number" min="0" value={wageEntry.dailyWage} onChange={(event) => setWageEntry({ ...wageEntry, dailyWage: event.target.value })} /></Field>
                            <Field label={t.wageEntry.hours}><Input type="number" min="0" value={wageEntry.hoursWorked} onChange={(event) => setWageEntry({ ...wageEntry, hoursWorked: event.target.value })} /></Field>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{isLocalizedLanguage ? "भुगतान स्थिति" : workerCopy.wages.paymentStatus}</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Field label={t.wageEntry.received}><Input type="number" min="0" value={wageEntry.paymentReceived} onChange={(event) => setWageEntry({ ...wageEntry, paymentReceived: event.target.value })} /></Field>
                            <Field label={t.wageEntry.pending}><Input type="number" min="0" value={wageEntry.paymentPending} onChange={(event) => setWageEntry({ ...wageEntry, paymentPending: event.target.value })} /></Field>
                          </div>
                        </div>
                      </div>

                      <ActionButton icon={WalletCards} className="mt-5 w-full justify-center" onClick={addWageEntry}>
                        {isLocalizedLanguage ? "मजदूरी रिकॉर्ड सुरक्षित करें" : "Save Wage Entry"}
                      </ActionButton>
                    </div>

                    <div className="premium-card p-5">
                      <h3 className="text-xl font-black text-ink">{isLocalizedLanguage ? "आज की आय का सारांश" : "Today's Income Summary"}</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          [t.wageEntry.employer, wageEntry.employer || (isLocalizedLanguage ? "अभी नहीं भरा" : "Not entered yet")],
                          [isLocalizedLanguage ? "आज की कमाई" : "Today's Earnings", formatCurrency(Number(wageEntry.paymentReceived || wageEntry.dailyWage || 0))],
                          [isLocalizedLanguage ? "भुगतान स्थिति" : "Payment Status", Number(wageEntry.paymentPending || 0) > 0 ? (isLocalizedLanguage ? "आंशिक भुगतान" : "Partially paid") : (isLocalizedLanguage ? "भुगतान पूरा" : "Paid")],
                          [isLocalizedLanguage ? "बकाया राशि" : "Pending Amount", formatCurrency(Number(wageEntry.paymentPending || 0))]
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
                            <p className="mt-1 text-base font-black text-ink">{value}</p>
                          </div>
                        ))}
                      </div>

                      {statusMessage === t.wageEntry.success && (
                        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                          {[
                            isLocalizedLanguage ? "मजदूरी रिकॉर्ड सुरक्षित हो गया" : "Wage Entry Saved",
                            isLocalizedLanguage ? "आय पासपोर्ट अपडेट हुआ" : "Income Passport Updated",
                            isLocalizedLanguage ? "रोजगार रिकॉर्ड जुड़ गया" : "Employment Record Added"
                          ].map((item) => (
                            <p key={item} className="mt-2 first:mt-0 flex gap-2 text-sm font-black text-neem">
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              <span>{item}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "coach" && (
                <div className="mx-auto w-full max-w-[1240px] space-y-7">
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(410px,0.72fr)] lg:items-center">
                    <div>
                      <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-saffron">
                        <MessageSquare className="h-4 w-4" /> AI INTERVIEW PRACTICE
                      </p>
                      <h3 className="mt-3 text-4xl font-black leading-tight text-ink sm:text-[2.65rem]">{workerCopy.coach}</h3>
                      <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-600">
                        Practice role-specific employer interviews in your preferred language and receive AI-powered feedback before applying.
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-[0.9fr_1.45fr]">
                      <label className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.04)]">
                        <span className="mb-3 block text-xs font-black text-slate-500">{workerCopy.interviewCoach.language}</span>
                        <select value={normalizeLanguage(practiceLanguage || lang)} onChange={(event) => changeInterviewLanguage(event.target.value)} className="focus-ring min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-ink">
                          {languageConfig.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                        </select>
                      </label>
                      <div className="flex items-center justify-between gap-5 rounded-2xl border border-green-200 bg-green-50/80 p-5 shadow-[0_12px_34px_rgba(22,163,74,0.06)]">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-neem">{workerCopy.interviewPractice}</p>
                          <p className="mt-2 text-4xl font-black text-ink">{answerFeedback?.score || interviewReadiness || 72}%</p>
                          <p className="mt-1 text-sm font-black text-neem">{workerCopy.interviewCoach.ready}</p>
                        </div>
                        <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#16a34a ${(answerFeedback?.score || interviewReadiness || 72) * 3.6}deg, #dcfce7 0deg)` }}>
                          <div className="grid h-[4.6rem] w-[4.6rem] place-items-center rounded-full bg-green-50">
                            <TrendingUp className="h-8 w-8 text-neem" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(practiceHistory.length >= (coach?.questions?.length || 5) && coach) ? (
                    <div className="rounded-[22px] border border-slate-200 bg-white p-8 text-center shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                      <Award className="mx-auto h-10 w-10 text-neem" />
                      <h3 className="mt-4 text-3xl font-black text-ink">{workerCopy.interviewCoach.complete}</h3>
                      <p className="mt-2 text-sm font-semibold text-slate-600">{workerCopy.interviewCoach.completeCopy}</p>
                      <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                          <p className="text-sm font-bold text-slate-500">{workerCopy.interviewCoach.overallScore}</p>
                          <p className="mt-1 text-4xl font-black text-ink">{answerFeedback?.score || interviewReadiness}%</p>
                        </div>
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                          <p className="text-sm font-bold text-neem">{workerCopy.interviewCoach.recommendation}</p>
                          <p className="mt-1 text-xl font-black text-ink">{interviewReadiness >= 80 ? workerCopy.interviewCoach.ready : workerCopy.interviewCoach.practiceMore}</p>
                        </div>
                      </div>
                      <ActionButton icon={Sparkles} className="mt-6" onClick={runCoach} disabled={isCoaching}>{isCoaching ? t.loadingCoach : t.startPractice}</ActionButton>
                    </div>
                  ) : (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.64fr)_minmax(360px,0.36fr)]">
                      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] before:block before:h-1 before:rounded-full before:bg-gradient-to-r before:from-saffron before:to-neem sm:p-6">
                        <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-saffron">{workerCopy.interviewCoach.setup}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                          {[
                            [FileText, "Role", `Residential ${roleLabel(identityPageWorker.skill)}`, "bg-amber-50 text-amber-600"],
                            [Building2, "Employer", `${cityLabel(identityPageWorker.city)} Verified Work Network`, "bg-green-50 text-neem"],
                            [Globe2, "Language", practiceLanguage === "hi" ? "हिन्दी" : "English", "bg-blue-50 text-saffron"],
                            [Sparkles, "Difficulty", practiceLanguage === "hi" ? "Easy" : "Easy", "bg-cyan-50 text-cyan-600"],
                            [MessageSquare, "Question", `${coach ? currentQuestionIndex + 1 : 1} of ${coach?.questions?.length || 5}`, "bg-indigo-50 text-indigo-600"]
                          ].map(([Icon, label, value, tone]) => (
                            <div key={label} className="min-h-[112px] rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                              <span className={`grid h-7 w-7 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
                              <p className="mt-3 text-xs font-black text-slate-500">{label}</p>
                              <p className="mt-1 text-sm font-black leading-5 text-ink">{value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-saffron to-neem" style={{ width: `${coach ? ((currentQuestionIndex + 1) / (coach.questions?.length || 5)) * 100 : 20}%` }} />
                        </div>

                        <div className="mt-5">
                          <p className="text-sm font-black text-saffron">{workerCopy.interviewCoach.employerAsks}</p>
                          <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/65 px-4 py-4">
                            <h4 className="text-xl font-black leading-snug text-ink sm:text-2xl">
                              “{currentQuestion || skillSpecificQuestions(identityPageWorker.skill, practiceLanguage)[0]}”
                            </h4>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-ink">{workerCopy.interviewCoach.yourAnswer}</p>
                            <p className="text-xs font-bold text-slate-500">{interviewAnswer.length} characters</p>
                          </div>
                          <textarea
                            value={interviewAnswer}
                            onChange={(event) => setInterviewAnswer(event.target.value)}
                            placeholder={practiceLanguage === "hi" ? "अपने पिछले काम को एक असली उदाहरण के साथ साफ़-साफ़ बताएं।" : workerCopy.interviewCoach.answerPlaceholder}
                            className="focus-ring min-h-[145px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold leading-7 text-ink shadow-sm placeholder:text-slate-400"
                          />
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-stretch">
                          <button type="button" onClick={startVoiceAnswer} className="focus-ring group flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50">
                            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-saffron shadow-sm">
                              {voiceAnswerStatus === "completed" ? <CheckCircle2 className="h-7 w-7 text-neem" /> : voiceAnswerStatus === "processing" ? <Sparkles className="h-7 w-7" /> : <AudioLines className={`h-7 w-7 ${voiceAnswerStatus === "listening" ? "animate-pulse" : ""}`} />}
                            </span>
                            <span>
                              <span className="block text-lg font-black text-ink">
                                {voiceAnswerStatus === "listening"
                                  ? (practiceLanguage === "hi" ? "सुन रहे हैं..." : workerCopy.interviewCoach.listening)
                                  : voiceAnswerStatus === "processing"
                                    ? (practiceLanguage === "hi" ? "प्रोसेस हो रहा है..." : workerCopy.interviewCoach.processing)
                                    : voiceAnswerStatus === "completed"
                                      ? (practiceLanguage === "hi" ? "आवाज़ कैप्चर हुई" : workerCopy.interviewCoach.captured)
                                      : (practiceLanguage === "hi" ? "बोलने के लिए टैप करें" : workerCopy.interviewCoach.tapToSpeak)}
                              </span>
                              <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">{practiceLanguage === "hi" ? "आवाज़ पहचान इस्तेमाल करके अपना जवाब रिकॉर्ड करें" : workerCopy.interviewCoach.voiceHelp}</span>
                            </span>
                          </button>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <ActionButton icon={MessageSquare} className="min-h-12" onClick={evaluateAnswer} disabled={!interviewAnswer.trim()}>{workerCopy.interviewCoach.scoreAnswer}</ActionButton>
                            <ActionButton icon={Sparkles} variant="secondary" className="min-h-12" onClick={useSampleAnswer}>{workerCopy.interviewCoach.useSample}</ActionButton>
                            <ActionButton icon={ChevronRight} variant="secondary" className="min-h-12 sm:col-span-2 sm:w-1/2" onClick={skipQuestion}>{workerCopy.interviewCoach.skipQuestion}</ActionButton>
                          </div>
                        </div>
                      </section>

                      <aside className="space-y-5">
                        <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] before:block before:h-1 before:rounded-full before:bg-gradient-to-r before:from-saffron before:to-neem sm:p-6">
                          <div className="mt-1 flex items-center justify-between gap-3">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{workerCopy.interviewCoach.feedback}</p>
                            <Sparkles className="h-5 w-5 text-saffron" />
                          </div>
                          {answerFeedback ? (
                            <div className="mt-5 space-y-4">
                              <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                                <p className="text-xs font-black uppercase tracking-[0.12em] text-neem">{workerCopy.interviewCoach.overallScore}</p>
                                <p className="mt-1 text-4xl font-black text-ink">{answerFeedback.score}%</p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{answerFeedback.message}</p>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                {[
                                  ["Confidence", answerFeedback.confidence],
                                  [workerCopy.interviewCoach.communication, answerFeedback.communication],
                                  [workerCopy.interviewCoach.technical, answerFeedback.relevance],
                                  [workerCopy.interviewCoach.professionalism, answerFeedback.completeness]
                                ].map(([label, value]) => (
                                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="text-sm font-black text-ink">{label}</p>
                                      <p className="text-sm font-black text-saffron">{value}%</p>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                      <div className="h-full rounded-full bg-gradient-to-r from-saffron to-neem" style={{ width: `${value}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                                <p className="text-sm font-black text-ink">{workerCopy.interviewCoach.suggested}</p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                                  {currentSampleAnswer || (practiceLanguage === "hi"
                                    ? `${identityPageWorker.experience} साल के अनुभव के साथ मैंने ${roleLabel(identityPageWorker.skill)} का काम किया है। एक पिछले काम में मैंने समस्या समझकर समय पर समाधान दिया और मजदूरी व समय पहले साफ़ किया।`
                                    : `I have ${identityPageWorker.experience} years of experience as a ${roleLabel(identityPageWorker.skill).toLowerCase()}. In one past job, I understood the issue, completed the work on time, and clearly discussed timing and wage expectations.`)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-50 text-saffron"><MessageSquare className="h-7 w-7" /></span>
                              <p className="text-base font-semibold leading-7 text-slate-600">{workerCopy.interviewCoach.emptyFeedback}</p>
                            </div>
                          )}
                        </section>

                        <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] sm:p-6">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{workerCopy.interviewCoach.tipsTitle}</p>
                          <div className="mt-5 divide-y divide-slate-100">
                            {[
                              [workerCopy.interviewCoach.tips[0][0], workerCopy.interviewCoach.tips[0][1]],
                              [workerCopy.interviewCoach.tips[1][0], workerCopy.interviewCoach.tips[1][1]],
                              [workerCopy.interviewCoach.tips[2][0], workerCopy.interviewCoach.tips[2][1]],
                              [workerCopy.interviewCoach.tips[3][0], workerCopy.interviewCoach.tips[3][1]]
                            ].map(([title, copy]) => (
                              <div key={title} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-50 text-neem"><CheckCircle2 className="h-5 w-5" /></span>
                                <span>
                                  <span className="block text-sm font-black text-ink">{title}</span>
                                  <span className="mt-1 block text-sm font-medium text-slate-500">{copy}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      </aside>
                    </div>
                  )}
                </div>
              )}

              {activeWorkspaceTab === "rights" && (
                <div className="space-y-5">
                  <div className="premium-card p-6 sm:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{isLocalizedLanguage ? "AI सुरक्षा सहायक" : workerCopy.rights.eyebrow}</p>
                        <h3 className="mt-2 text-3xl font-black text-ink">{isLocalizedLanguage ? "AI अधिकार और सुरक्षा सहायक" : workerCopy.rights.title}</h3>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                          {isLocalizedLanguage
                            ? "काम स्वीकार करने से पहले फर्जी नौकरी, श्रमिक अधिकार और AI सुरक्षा सलाह समझें।"
                            : workerCopy.rights.copy}
                        </p>
                      </div>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-black text-neem">
                        <ShieldCheck className="h-4 w-4" />
                        {isLocalizedLanguage ? workerCopy.rights.engine : workerCopy.rights.engine}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <div className="premium-card p-6 sm:p-7">
                      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{isLocalizedLanguage ? "WhatsApp नौकरी संदेश" : workerCopy.rights.whatsapp}</p>
                            <h3 className="mt-2 text-2xl font-black text-ink">📱 {isLocalizedLanguage ? "WhatsApp नौकरी प्रस्ताव जांचें" : workerCopy.rights.analyzeTitle}</h3>
                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                              {isLocalizedLanguage
                                ? "WhatsApp पर मिले नौकरी संदेश को paste करें। RozgaarAI नियोक्ता, भुगतान, दस्तावेज़, वेतन, स्थान और scam संकेत अपने-आप निकालेगा।"
                                : "Paste a job message received on WhatsApp. RozgaarAI will automatically extract employer details, payment requests, documents, wages, location, and detect potential scam signals."}
                            </p>
                          </div>
                          {isAnalyzingMessage && (
                            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-black text-saffron">
                              <Sparkles className="h-4 w-4 animate-pulse" />
                              {extractionSteps[Math.max(0, extractionStepIndex)]}
                            </span>
                          )}
                        </div>
                        <textarea
                          value={whatsAppMessage}
                          onChange={(event) => setWhatsAppMessage(event.target.value)}
                          placeholder={`Hello!\n\nUrgent Airport Helper jobs available in Bhopal.\n\nSalary ₹65,000/month.\n\nLimited seats.\n\nRegistration fee ₹2500.\n\nBring original Aadhaar.\n\nContact only on WhatsApp.\n\nJoin today.`}
                          className="focus-ring mt-4 min-h-56 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold leading-6 text-ink shadow-sm"
                        />
                        {isAnalyzingMessage && (
                          <div className="mt-4 space-y-2">
                            {extractionSteps.map((step, index) => (
                              <div key={step} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                                <span className={`grid h-6 w-6 place-items-center rounded-full border ${index <= extractionStepIndex ? "border-blue-200 bg-blue-50 text-saffron" : "border-slate-200 bg-white text-slate-400"}`}>
                                  {index < extractionStepIndex ? <CheckCircle2 className="h-3.5 w-3.5 text-neem" /> : <span className={index === extractionStepIndex ? "h-1.5 w-1.5 animate-pulse rounded-full bg-saffron" : "h-1.5 w-1.5 rounded-full bg-slate-300"} />}
                                </span>
                                {step}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <ActionButton icon={Sparkles} onClick={analyzeWhatsAppOffer} disabled={isAnalyzingMessage}>
                            {isAnalyzingMessage ? (isLocalizedLanguage ? "AI विश्लेषण कर रहा है..." : "Analyzing with AI...") : (isLocalizedLanguage ? "✨ AI से जांचें" : "✨ Analyze with AI")}
                          </ActionButton>
                          <button type="button" onClick={loadDemoWhatsAppMessage} className="focus-ring rounded-lg px-3 py-2 text-sm font-black text-saffron hover:bg-blue-50">
                            {isLocalizedLanguage ? "Demo Message डालें" : "Load Demo Message"}
                          </button>
                        </div>
                      </div>

                      {extractedOffer && (
                        <div className="mb-6 space-y-5 section-fade">
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-xl font-black text-ink">{isLocalizedLanguage ? "AI निकाली गई जानकारी" : "AI Extracted Information"}</h3>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {[
                                [Building2, isLocalizedLanguage ? "नियोक्ता" : "Employer", extractedOffer.entities.employer, extractedOffer.confidence.employer],
                                [IndianRupee, isLocalizedLanguage ? "वेतन" : "Salary", extractedOffer.entities.salary, extractedOffer.confidence.salary],
                                [Landmark, isLocalizedLanguage ? "रजिस्ट्रेशन फीस" : "Registration Fee", extractedOffer.entities.fee, extractedOffer.confidence.fee],
                                [FileText, isLocalizedLanguage ? "दस्तावेज़" : "Documents", extractedOffer.entities.documents, extractedOffer.confidence.documents],
                                [MessageSquare, isLocalizedLanguage ? "संपर्क" : "Contact", extractedOffer.entities.contact, extractedOffer.confidence.contact],
                                [MapPin, isLocalizedLanguage ? "काम का पता" : "Work Address", extractedOffer.entities.address, extractedOffer.confidence.address]
                              ].map(([Icon, label, value, confidence], index) => (
                                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3" style={{ animationDelay: `${index * 70}ms` }}>
                                  <div className="flex items-start gap-2">
                                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-saffron" />
                                    <div className="min-w-0">
                                      <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
                                      <p className="mt-1 break-words text-sm font-black text-ink">{value}</p>
                                      <p className="mt-1 text-xs font-bold text-slate-500">{confidence}% confidence</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
                            <h3 className="text-xl font-black text-ink">{isLocalizedLanguage ? "मिले scam संकेत" : "Detected Scam Signals"}</h3>
                            <div className="mt-4 grid gap-3">
                              {risk.flags.map((flag, index) => (
                                <div key={flag} className="rounded-xl border border-amber-200 bg-white p-4" style={{ animationDelay: `${index * 90}ms` }}>
                                  <div className="flex gap-3">
                                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                                    <div>
                                      <p className="font-black text-ink">{riskFactorTitle(flag)}</p>
                                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{riskFactorReason(flag)}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{isLocalizedLanguage ? "नौकरी प्रस्ताव जांचें" : "Analyze job offer"}</p>
                        <h3 className="mt-2 text-2xl font-black text-ink">{isLocalizedLanguage ? "प्रस्ताव विवरण" : "Offer intake"}</h3>
                      </div>

                      <div className="mt-5 space-y-5">
                        {[
                          [BriefcaseBusiness, isLocalizedLanguage ? "नौकरी विवरण" : "Job Details", [
                            [BriefcaseBusiness, t.fields.offerTitle, "title", "text", ""],
                            [IndianRupee, t.fields.salary, "salary", "number", ""]
                          ]],
                          [Building2, isLocalizedLanguage ? "नियोक्ता विवरण" : "Employer Details", [
                            [Building2, t.fields.employerName, "employerName", "text", ""],
                            [MapPin, t.fields.workAddress, "address", "text", t.placeholders.workAddress]
                          ]],
                          [IndianRupee, isLocalizedLanguage ? "भुगतान विवरण" : "Payment Details", [
                            [Landmark, t.fields.depositAmount, "deposit", "number", ""],
                            [Globe2, t.fields.contactDetails, "contactDetails", "text", t.placeholders.contactDetails]
                          ]]
                        ].map(([Icon, title, fields]) => (
                          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-saffron" />
                              <h4 className="text-sm font-black text-ink">{title}</h4>
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {fields.map(([FieldIcon, label, key, type, placeholder]) => (
                                <label key={key} className="block">
                                  <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                    <FieldIcon className="h-3.5 w-3.5 text-slate-400" />
                                    {label}
                                  </span>
                                  <Input type={type} min={type === "number" ? "0" : undefined} value={offer[key]} placeholder={placeholder} onChange={(e) => setOffer({ ...offer, [key]: e.target.value })} />
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}

                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-saffron" />
                            <h4 className="text-sm font-black text-ink">{isLocalizedLanguage ? "दस्तावेज़ मांग" : "Document Requests"}</h4>
                          </div>
                          <div className="mt-3 space-y-3">
                            <label className="block">
                              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                {t.fields.documentsRequested}
                              </span>
                              <Input value={offer.documents} onChange={(e) => setOffer({ ...offer, documents: e.target.value })} />
                            </label>
                            <label className="block">
                              <span className="mb-1 flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                                {t.fields.offerMessage}
                              </span>
                              <Textarea value={offer.description} onChange={(e) => setOffer({ ...offer, description: e.target.value })} />
                            </label>
                          </div>
                        </div>
                      </div>

                      <ActionButton icon={ShieldAlert} className="mt-5 w-full justify-center" onClick={checkOffer} disabled={isCheckingRisk}>
                        {isCheckingRisk ? t.loadingSafety : (isLocalizedLanguage ? "नौकरी प्रस्ताव जांचें" : workerCopy.rights.analyze)}
                      </ActionButton>
                    </div>

                    <div className="space-y-5">
                      <div className="premium-card p-6 sm:p-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{isLocalizedLanguage ? "AI सुरक्षा रिपोर्ट" : workerCopy.rights.report}</p>
                            <h3 className="mt-2 text-2xl font-black text-ink">{isLocalizedLanguage ? "जोखिम विश्लेषण" : workerCopy.rights.riskAnalysis}</h3>
                            <p className="mt-2 text-sm font-semibold text-slate-600">
                              {isLocalizedLanguage ? "RozgaarAI AI Safety Engine द्वारा तैयार" : workerCopy.rights.generatedBy}
                            </p>
                          </div>
                          <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full bg-white">
                            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                              <circle cx="60" cy="60" r="48" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                              <circle cx="60" cy="60" r="48" fill="none" stroke={risk.risk === "High" ? "#DC2626" : risk.risk.includes("Medium") ? "#F59E0B" : "#16A34A"} strokeLinecap="round" strokeWidth="10" strokeDasharray={`${riskScore * 3.016} 301.6`} />
                            </svg>
                            <div className="absolute text-center">
                              <p className="text-3xl font-black text-ink">{riskScore}</p>
                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{isLocalizedLanguage ? "जोखिम स्कोर" : workerCopy.rights.riskScore}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{t.riskLevel}</p>
                            <p className={`mt-1 text-xl font-black ${riskClass}`}>{riskLabel(risk.risk)}</p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{isLocalizedLanguage ? "AI विश्वास" : "AI Confidence"}</p>
                            <p className="mt-1 text-xl font-black text-ink">{safetyConfidence}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="premium-card p-6">
                        <h3 className="text-xl font-black text-ink">{isLocalizedLanguage ? "मिले जोखिम संकेत" : workerCopy.rights.factors}</h3>
                        <div className="mt-4 grid gap-3">
                          {detectedRiskFactors.map((flag) => (
                            <div key={flag} className="rounded-xl border border-slate-200 bg-white p-4">
                              <div className="flex gap-3">
                                <ShieldAlert className={`mt-0.5 h-5 w-5 shrink-0 ${risk.flags.length ? "text-amber-600" : "text-neem"}`} />
                                <div>
                                  <p className="font-black text-ink">{riskFactorTitle(flag)}</p>
                                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                                    {riskFactorReason(flag)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-1">
                        <div className="premium-card p-5">
                          <h3 className="text-lg font-black text-ink">{isLocalizedLanguage ? "यह क्यों flagged हुआ?" : workerCopy.rights.whyFlagged}</h3>
                          {extractedOffer && risk.flags.length ? (
                            <div className="mt-3 space-y-3 text-sm font-semibold leading-6 text-slate-700">
                              {(isLocalizedLanguage
                                ? [
                                  "RozgaarAI ने नौकरी से पहले रजिस्ट्रेशन फीस मांगे जाने का संकेत पकड़ा।",
                                  "यह informal workers से जुड़ी आम employment scam patterns से मेल खाता है।",
                                  "सत्यापन से पहले मूल पहचान दस्तावेज मांगे गए हैं।",
                                  "नियोक्ता ने साफ काम की जगह या ऑफिस पता साझा नहीं किया।",
                                  "ये संकेत fraud risk को काफी बढ़ाते हैं।"
                                ]
                                : [
                                  "RozgaarAI detected a registration fee before employment.",
                                  "This matches common employment scam patterns reported by informal workers.",
                                  "Original identity documents are requested before verification.",
                                  "The employer has not shared a workplace address.",
                                  "These signals significantly increase fraud risk."
                                ]).map((line) => (
                                <p key={line}>{line}</p>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
                              {risk.flags.length
                                ? (isLocalizedLanguage ? t.riskAdvice : risk.advice)
                                : (isLocalizedLanguage ? "इस प्रस्ताव में बड़े जोखिम संकेत नहीं मिले, लेकिन काम शुरू करने से पहले लिखित शर्तें और नियोक्ता पहचान जरूर जांचें।" : risk.advice)}
                            </p>
                          )}
                        </div>

                        <div className="premium-card p-5">
                          <h3 className="text-lg font-black text-ink">{isLocalizedLanguage ? "अगले सुरक्षित कदम" : workerCopy.rights.nextSteps}</h3>
                          <div className="mt-3 space-y-2">
                            {(isLocalizedLanguage
                              ? ["लिखित ऑफर मांगें", "नियोक्ता की पहचान सत्यापित करें", "जॉइनिंग से पहले पैसे न दें", "मूल दस्तावेज़ साझा न करें", "ऑफिस या काम की जगह का पता मांगें"]
                              : ["Ask for written offer", "Verify employer identity", "Never pay before joining", "Avoid sharing original documents", "Request office location"]
                            ).map((item) => (
                              <p key={item} className="flex gap-2 text-sm font-semibold text-slate-700">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-neem" />
                                <span>{item}</span>
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="premium-card p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-lg font-black text-ink">{isLocalizedLanguage ? "अपने अधिकार जानें" : workerCopy.rights.knowRights}</h3>
                              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                                {isLocalizedLanguage
                                  ? "नियोक्ता जॉइनिंग से पहले रजिस्ट्रेशन फीस नहीं मांग सकते। मूल पहचान दस्तावेज़ न दें। हमेशा लिखित मजदूरी शर्तें और नियोक्ता पहचान सत्यापित करें।"
                                  : workerCopy.rights.rightsCopy}
                              </p>
                            </div>
                            <button type="button" className="focus-ring shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-ink hover:border-blue-200 hover:bg-blue-50">
                              {isLocalizedLanguage ? "और जानें" : workerCopy.actions.learnMore}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "resume" && (
                <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
                  <div className="premium-card p-5 sm:p-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{isLocalizedLanguage ? "AI बायोडाटा बिल्डर" : "AI Resume Builder"}</p>
                        <h3 className="mt-2 text-3xl font-black text-ink">{isLocalizedLanguage ? "Employer-ready Resume" : "Employer-ready Resume"}</h3>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                          {isLocalizedLanguage ? "RozgaarAI बोले गए श्रमिक विवरण को polished, सत्यापित बायोडाटा में बदलता है।" : "RozgaarAI converts spoken worker details into a polished, verified resume for real employment."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["Classic", "Modern", "Minimal"].map((template) => (
                          <button key={template} type="button" onClick={() => setResumeTemplate(template)} className={`focus-ring rounded-lg border px-3 py-2 text-xs font-black ${resumeTemplate === template ? "border-blue-200 bg-blue-50 text-saffron" : "border-slate-200 bg-white text-ink hover:bg-slate-50"}`}>
                            {template}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 overflow-x-auto rounded-2xl bg-slate-100 p-4 sm:p-6">
                      <article className={`mx-auto aspect-[210/297] w-[min(100%,720px)] rounded-2xl border border-slate-200 bg-white shadow-xl ${resumeTemplate === "Minimal" ? "p-8" : "overflow-hidden"}`}>
                        <header className={`${resumeTemplate === "Classic" ? "border-t-[6px] border-ink bg-white" : resumeTemplate === "Minimal" ? "border-b border-slate-200 pb-5" : "border-t-[6px] border-saffron bg-gradient-to-br from-white via-blue-50/50 to-green-50/60"} p-7`}>
                          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
                            <div>
                              <div className="flex items-center gap-3">
                                <img src={logoMark} alt={logoAlt} className="h-10 w-10 rounded-md object-contain" />
                                <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-black text-neem">{resumeArtifactLabels.verifiedWorker}</span>
                              </div>
                              <h1 className="mt-5 text-4xl font-black leading-tight text-ink">{identityPageWorker.name}</h1>
                              <p className="mt-1 text-lg font-black text-saffron">{roleLabelEnglish(identityPageWorker.skill)} • {cityLabelEnglish(identityPageWorker.city)}</p>
                              <p className="mt-2 text-sm font-bold text-slate-600">{identityPageWorker.phone || resumeArtifactLabels.demoContact} • {identityPageWorker.languages}</p>
                              <p className="mt-1 text-sm font-bold text-slate-600">{resumeArtifactLabels.workerId}: {identityPageIdentity.workerId}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                              <QRCodeCanvas value={identityPageIdentity.profileUrl} size={92} level="H" marginSize={1} bgColor="#ffffff" fgColor="#0F172A" title={resumeArtifactLabels.resumeQr} />
                              <p className="mt-2 w-24 text-[10px] font-black leading-3 text-slate-500">{resumeArtifactLabels.scanToVerify}</p>
                            </div>
                          </div>
                        </header>

                        <div className="grid gap-7 p-7 lg:grid-cols-[1.45fr_0.85fr]">
                          <main className="space-y-5">
                            <section>
                              <h2 className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-[0.16em] text-saffron">{resumeArtifactLabels.professionalSummary}</h2>
                              <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">{resumeSummary}</p>
                            </section>
                            <section>
                              <h2 className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-[0.16em] text-saffron">{resumeArtifactLabels.workExperience}</h2>
                              <div className="mt-3 space-y-2">
                                {resumeWorkRecords.map((record) => (
                                  <div key={record.id || `${record.employer}-${record.date}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                    <p className="text-sm font-black text-ink">{record.employer || record.worksite || notAvailableEnglish}</p>
                                    <p className="mt-1 text-xs font-bold text-slate-600">{record.jobType || roleLabelEnglish(identityPageWorker.skill)} • {record.date || currentIssueDate} • {record.location || cityLabelEnglish(identityPageWorker.city)}</p>
                                  </div>
                                ))}
                              </div>
                            </section>
                            <section>
                              <h2 className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-[0.16em] text-saffron">{resumeArtifactLabels.workHighlights}</h2>
                              <ul className="mt-3 space-y-2">
                                {displayResumeSections.slice(1, 4).map((section) => (
                                  <li key={section.heading} className="text-sm font-semibold leading-6 text-slate-700"><span className="font-black text-ink">{section.heading}:</span> {section.body}</li>
                                ))}
                              </ul>
                            </section>
                          </main>
                          <aside className="space-y-4">
                            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{resumeArtifactLabels.skills}</h2>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {resumeSkills.map((skill) => <span key={skill} className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{skill}</span>)}
                              </div>
                            </section>
                            {[
                              [resumeArtifactLabels.languages, identityPageWorker.languages],
                              [resumeArtifactLabels.availability, identityPageWorker.availability],
                              [resumeArtifactLabels.contact, identityPageWorker.phone || resumeArtifactLabels.demoContact],
                              [resumeArtifactLabels.expectedWage, `${formatCurrency(identityPageWorker.expectedWage)}/Monthly`]
                            ].map(([label, value]) => (
                              <section key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</h2>
                                <p className="mt-2 text-sm font-black text-ink">{value || notAvailableEnglish}</p>
                              </section>
                            ))}
                          </aside>
                        </div>
                        <footer className="border-t border-slate-200 px-7 py-4 text-xs font-black text-slate-500">
                          {resumeArtifactLabels.generatedBy} • {resumeArtifactLabels.verifiedDigitalIdentity}
                        </footer>
                      </article>
                    </div>
                  </div>

                  <aside className="space-y-5">
                    <div className="premium-card p-6">
                      <h3 className="text-2xl font-black text-ink">{t.resumeLabels.aiResumeAssistant}</h3>
                      <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-neem">{t.resumeLabels.resumeQuality}</p>
                        <p className="mt-1 text-5xl font-black text-ink">96%</p>
                      </div>
                      <div className="mt-4 grid gap-2">
                        {t.resumeLabels.badges.map((item) => (
                          <p key={item} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-neem" />
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="premium-card p-6">
                      <h3 className="text-xl font-black text-ink">{t.resumeLabels.aiSuggestions}</h3>
                      <div className="mt-4 space-y-3">
                        {resumeSuggestions.map((item) => (
                          <p key={item} className="flex gap-2 text-sm font-semibold leading-6 text-slate-700">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neem" />
                            <span>{item}</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    {isBuildingResume && (
                      <div className="premium-card p-5 section-fade">
                        <h3 className="text-lg font-black text-ink">{t.resumeLabels.generatingResume}</h3>
                        <div className="mt-4 space-y-2">
                          {resumeBuildSteps.map((step, index) => (
                            <div key={step} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                              <span className={`grid h-6 w-6 place-items-center rounded-full border ${index <= resumeBuildStepIndex ? "border-blue-200 bg-blue-50 text-saffron" : "border-slate-200 bg-white text-slate-400"}`}>
                                {index < resumeBuildStepIndex ? <CheckCircle2 className="h-3.5 w-3.5 text-neem" /> : <span className={index === resumeBuildStepIndex ? "h-1.5 w-1.5 animate-pulse rounded-full bg-saffron" : "h-1.5 w-1.5 rounded-full bg-slate-300"} />}
                              </span>
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="premium-card p-5">
                      <ActionButton icon={Download} className="w-full justify-center" onClick={() => downloadResume()} disabled={isBuildingResume}>
                        {isBuildingResume ? workerCopy.documents.generatingPdf : workerCopy.documents.downloadPdfResume}
                      </ActionButton>
                      <ActionButton icon={FileText} variant="secondary" className="mt-3 w-full justify-center" onClick={() => downloadResume({ preview: true })}>
                        Preview Full Resume
                      </ActionButton>
                      <button type="button" onClick={() => {
                        navigator.clipboard?.writeText(identityPageIdentity.profileUrl);
                        setStatusMessage(isLocalizedLanguage ? "Resume link copied." : "Resume link copied.");
                      }} className="focus-ring mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-black text-saffron hover:bg-blue-50">
                        Share Resume
                      </button>
                    </div>
                  </aside>
                </div>
              )}

              {activeWorkspaceTab === "downloads" && (
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="panel p-6 sm:p-7">
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{isLocalizedLanguage ? workerCopy.documents.downloadCenter : workerCopy.documents.downloadCenter}</p>
                    <h3 className="mt-2 text-3xl font-black text-ink">{isLocalizedLanguage ? workerCopy.documents.title : workerCopy.documents.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                      {isLocalizedLanguage ? workerCopy.documents.copy : workerCopy.documents.copy}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {[
                        [IdCard, isLocalizedLanguage ? workerCopy.documents.workerCard : workerCopy.documents.workerCard, digitalWorkerCardDownloadLabel, downloadCertificatePdf, isExportingWorkerCard],
                        [FileText, isLocalizedLanguage ? workerCopy.documents.pdfResume : workerCopy.documents.pdfResume, t.careerIdentity.downloadResume, () => downloadResume(), isBuildingResume],
                        [WalletCards, isLocalizedLanguage ? workerCopy.documents.incomeHistory : workerCopy.documents.incomeHistory, t.passport.downloadHistory, downloadWorkHistory, false],
                        [Globe2, isLocalizedLanguage ? workerCopy.documents.publicProfile : workerCopy.documents.publicProfile, t.shareProfile.open, () => window.open(identityPageIdentity.profileUrl, "_blank", "noopener,noreferrer"), false]
                      ].map(([Icon, title, action, handler, disabled]) => (
                        <div key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-saffron">
                            <Icon className="h-5 w-5" />
                          </span>
                          <h4 className="mt-4 text-lg font-black text-ink">{title}</h4>
                          <ActionButton icon={Download} variant="secondary" className="mt-4 w-full justify-center" onClick={handler} disabled={disabled}>{action}</ActionButton>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel p-6 sm:p-7">
                    <h3 className="text-2xl font-black text-ink">{isLocalizedLanguage ? workerCopy.documents.sharePackage : workerCopy.documents.sharePackage}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {isLocalizedLanguage ? workerCopy.documents.shareCopy : workerCopy.documents.shareCopy}
                    </p>
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="break-all text-sm font-bold text-slate-700">{identityPageIdentity.profileUrl}</p>
                    </div>
                    <ActionButton icon={MessageSquare} className="mt-4" onClick={copyWorkerProfileLink}>
                      {isLocalizedLanguage ? workerCopy.actions.copyProfileLink : workerCopy.actions.copyProfileLink}
                    </ActionButton>
                  </div>
                </div>
              )}

            </div>
          </section>}
        </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {hiddenDigitalWorkerCardExport}
      {statusMessage && (
        <div className="global-status-toast" role="status" aria-live="polite">
          {statusMessage}
        </div>
      )}
      {isWorkRecordModalOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeWorkRecordModal(); }}>
          <form
            className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-record-modal-title"
            aria-describedby="work-record-modal-description"
            onSubmit={(event) => { event.preventDefault(); saveWorkRecord(); }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="work-record-modal-title" className="text-2xl font-black text-ink">{workerCopy.workRecord.title}</h2>
                <p id="work-record-modal-description" className="mt-1 text-sm font-semibold text-slate-600">{workerCopy.workRecord.accountDescription}</p>
              </div>
              <button type="button" className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" onClick={closeWorkRecordModal} aria-label={`${workerCopy.actions.close} ${workerCopy.workRecord.title}`}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {workRecordErrors.form && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">{workRecordErrors.form}</p>}

            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-saffron shadow-sm">
                    <Mic className={`h-5 w-5 ${workRecordVoiceStatus === "listening" ? "animate-pulse" : ""}`} />
                  </span>
                  <div>
                    <p className="text-sm font-black text-ink">{workerCopy.workRecord.voiceTitle}</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">{workerCopy.workRecord.voiceCopy}</p>
                  </div>
                </div>
                <ActionButton type="button" icon={Mic} variant={workRecordVoiceStatus === "listening" ? "dark" : "secondary"} className="shrink-0" onClick={startWorkRecordVoiceInput} disabled={workRecordVoiceStatus === "processing"}>
                  {workRecordVoiceStatus === "listening" ? workerCopy.workRecord.listening : workRecordVoiceStatus === "processing" ? workerCopy.workRecord.processing : workerCopy.workRecord.voiceStart}
                </ActionButton>
              </div>
              {workRecordVoiceText && (
                <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-600">
                  “{workRecordVoiceText}”
                </p>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={workerCopy.workRecord.employerLabel}>
                <Input value={workRecordForm.employerName} onChange={(event) => updateWorkRecordField("employerName", event.target.value)} placeholder={workerCopy.workRecord.employerPlaceholder} aria-invalid={Boolean(workRecordErrors.employerName)} />
                {workRecordErrors.employerName && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.employerName}</span>}
              </Field>
              <Field label={workerCopy.workRecord.workTypeLabel}>
                <Input value={workRecordForm.workType} onChange={(event) => updateWorkRecordField("workType", event.target.value)} placeholder={workerCopy.workRecord.workTypePlaceholder} aria-invalid={Boolean(workRecordErrors.workType)} />
                {workRecordErrors.workType && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.workType}</span>}
              </Field>
              <Field label={workerCopy.workRecord.workDateLabel}>
                <Input type="date" value={workRecordForm.workDate} onChange={(event) => updateWorkRecordField("workDate", event.target.value)} aria-invalid={Boolean(workRecordErrors.workDate)} />
                {workRecordErrors.workDate && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.workDate}</span>}
              </Field>
              <Field label={workerCopy.workRecord.amountLabel}>
                <div className="flex rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="grid w-11 place-items-center border-r border-slate-200 text-sm font-black text-slate-500">₹</span>
                  <input className="min-h-[46px] w-full rounded-r-lg px-3 text-sm font-semibold text-ink outline-none" type="number" min="0" value={workRecordForm.amountEarned} onChange={(event) => updateWorkRecordField("amountEarned", event.target.value)} placeholder="0" aria-invalid={Boolean(workRecordErrors.amountEarned)} />
                </div>
                {workRecordErrors.amountEarned && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.amountEarned}</span>}
              </Field>
              <Field label={workerCopy.workRecord.paymentStatusLabel}>
                <Select value={workRecordForm.paymentStatus} onChange={(event) => updateWorkRecordField("paymentStatus", event.target.value)} aria-invalid={Boolean(workRecordErrors.paymentStatus)}>
                  <option value="paid">{workerCopy.workRecord.paid}</option>
                  <option value="pending">{workerCopy.workRecord.pending}</option>
                  <option value="partially_paid">{workerCopy.workRecord.partiallyPaid}</option>
                </Select>
                {workRecordErrors.paymentStatus && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.paymentStatus}</span>}
              </Field>
              <Field label={workerCopy.workRecord.hoursLabel}>
                <Input type="number" min="0" value={workRecordForm.hoursWorked} onChange={(event) => updateWorkRecordField("hoursWorked", event.target.value)} placeholder={workerCopy.workRecord.hoursPlaceholder} aria-invalid={Boolean(workRecordErrors.hoursWorked)} />
                {workRecordErrors.hoursWorked && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.hoursWorked}</span>}
              </Field>
              <Field label={workerCopy.workRecord.locationLabel}>
                <Input value={workRecordForm.location} onChange={(event) => updateWorkRecordField("location", event.target.value)} placeholder={workerCopy.workRecord.locationPlaceholder} />
              </Field>
              <Field label={workerCopy.workRecord.proofLabel} hint={workerCopy.workRecord.proofHint}>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                  <input key={workRecordProof?.name || "empty-proof"} type="file" accept=".pdf,image/png,image/jpeg,image/webp" onChange={handleWorkProofChange} className="block w-full text-sm font-semibold text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-black file:text-saffron hover:file:bg-blue-100" />
                  {workRecordProof && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700">
                      <span className="truncate">{workRecordProof.name}</span>
                      <button type="button" className="text-red-600 hover:text-red-700" onClick={() => { setWorkRecordProof(null); setIsWorkRecordDirty(true); }}>{workerCopy.actions.remove}</button>
                    </div>
                  )}
                </div>
                {workRecordErrors.proof && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.proof}</span>}
              </Field>
            </div>

            <Field label={workerCopy.workRecord.notesLabel} hint={withCopyTokens(workerCopy.workRecord.notesHint, { count: workRecordForm.notes.length })}>
              <Textarea className="min-h-28" maxLength={500} value={workRecordForm.notes} onChange={(event) => updateWorkRecordField("notes", event.target.value)} placeholder={workerCopy.workRecord.notesPlaceholder} aria-invalid={Boolean(workRecordErrors.notes)} />
              {workRecordErrors.notes && <span className="mt-1 block text-xs font-bold text-red-600">{workRecordErrors.notes}</span>}
            </Field>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <ActionButton type="button" icon={X} variant="secondary" onClick={closeWorkRecordModal} disabled={isSavingWorkRecord}>{workerCopy.actions.cancel}</ActionButton>
              <ActionButton type="submit" icon={WalletCards} disabled={isSavingWorkRecord}>{isSavingWorkRecord ? workerCopy.actions.saving : workerCopy.actions.saveWorkRecord}</ActionButton>
            </div>
          </form>
        </div>
      )}
      {isAdminRoute && activeAccountRole === ROLES.ADMIN && (
        <AdminDiagnostics account={account} onBack={() => navigateTo(getDefaultRouteForRole(activeAccountRole))} />
      )}

      {!isAdminRoute && !workspaceShellActive && !routePath.startsWith("/employer") && !isNgoRoute && (
      <header className={`site-nav ${isNavScrolled ? "site-nav-scrolled" : ""}`}>
        <div className="section-shell site-nav-inner">
          <button type="button" className="site-brand group focus-ring" onClick={goHomeTop} aria-label={t.navMain.homeAria}>
            <BrandLockup tagline={t.brandTagline} compact className="gap-4" />
          </button>

          <nav className="site-nav-links" aria-label={t.navMain.primaryNavigation}>
            {navItems.map((item) => {
              const active = activeNavKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`site-nav-link focus-ring ${active ? "is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  onClick={() => handleNavClick(item)}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="site-nav-actions">
            <div className="language-menu" ref={languageMenuRef}>
              <button
                type="button"
                className="language-trigger focus-ring"
                aria-haspopup="listbox"
                aria-expanded={isLanguageMenuOpen}
                onClick={() => setIsLanguageMenuOpen((open) => !open)}
              >
                <Globe2 aria-hidden="true" />
                <span>{selectedLanguageLabel}</span>
                <ChevronDown className={`language-chevron ${isLanguageMenuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              <div className={`language-dropdown ${isLanguageMenuOpen ? "is-open" : ""}`} role="listbox" aria-label={t.navMain.selectLanguage}>
                {languageConfig.map(({ code: value, label }) => (
                  <button
                    key={value}
                    type="button"
                    role="option"
                    aria-selected={lang === value}
                    className={`language-option focus-ring ${lang === value ? "is-selected" : ""}`}
                    onClick={() => handleLanguageSelect(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="nav-demo-button focus-ring" onClick={openDemoSection}>
              <PlayCircle aria-hidden="true" />
              {t.navMain.exploreDemo}
            </button>

            {account ? (
              <>
                <button
                  type="button"
                  className="nav-signin-button focus-ring"
                  onClick={() => navigateTo(getDefaultRouteForRole(account.role))}
                >
                  <UserRound aria-hidden="true" />
                  {normalizeRole(account.role) === ROLES.EMPLOYER ? t.navMain.employerDashboard : normalizeRole(account.role) === ROLES.NGO ? "NGO Workspace" : t.navMain.workerProfile}
                </button>
                <button type="button" className="nav-signin-button focus-ring" onClick={signOut}>
                  <LogOut aria-hidden="true" />
                  Log out
                </button>
              </>
            ) : (
              <button type="button" className="nav-signin-button focus-ring" onClick={() => openAuthModal({ mode: "signin" })}>
                <UserRound aria-hidden="true" />
                {t.navMain.signIn}
              </button>
            )}

            <button
              type="button"
              className="mobile-menu-trigger focus-ring"
              aria-label={t.navMain.openMenu}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={`mobile-nav-backdrop ${isMobileMenuOpen ? "is-open" : ""}`} aria-hidden="true" onClick={() => setIsMobileMenuOpen(false)} />
        <aside className={`mobile-nav-panel ${isMobileMenuOpen ? "is-open" : ""}`} aria-label={t.navMain.mobileNavigation} aria-hidden={!isMobileMenuOpen}>
          <div className="flex items-center justify-between gap-4">
            <BrandLockup tagline={t.brandTagline} compact className="gap-4" />
            <button type="button" className="mobile-menu-close focus-ring" aria-label={t.navMain.closeMenu} onClick={() => setIsMobileMenuOpen(false)}>
              <X aria-hidden="true" />
            </button>
          </div>
          <nav className="mt-8 grid gap-2" aria-label={t.navMain.mobilePrimaryNavigation}>
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`mobile-nav-link focus-ring ${activeNavKey === item.key ? "is-active" : ""}`}
                onClick={() => handleNavClick(item)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-3">
            <p className="px-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{t.navMain.language}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {languageConfig.map(({ code: value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`language-option focus-ring ${lang === value ? "is-selected" : ""}`}
                  onClick={() => handleLanguageSelect(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-3">
            <button type="button" className="nav-demo-button focus-ring w-full" onClick={() => {
              setIsMobileMenuOpen(false);
              openDemoSection();
            }}>
              <PlayCircle aria-hidden="true" />
              {t.navMain.exploreDemo}
            </button>
            {account ? (
              <>
                <button type="button" className="nav-signin-button focus-ring w-full" onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigateTo(getDefaultRouteForRole(account.role));
                }}>
                  <UserRound aria-hidden="true" />
                  {normalizeRole(account.role) === ROLES.EMPLOYER ? t.navMain.employerDashboard : normalizeRole(account.role) === ROLES.NGO ? "NGO Workspace" : t.navMain.workerProfile}
                </button>
                <button type="button" className="nav-signin-button focus-ring w-full" onClick={() => {
                  setIsMobileMenuOpen(false);
                  signOut();
                }}>
                  <LogOut aria-hidden="true" />
                  Log out
                </button>
              </>
            ) : (
              <button type="button" className="nav-signin-button focus-ring w-full" onClick={() => {
                setIsMobileMenuOpen(false);
                openAuthModal({ mode: "signin" });
              }}>
                <UserRound aria-hidden="true" />
                {t.navMain.signIn}
              </button>
            )}
          </div>
        </aside>
      </header>
      )}

      <UnifiedAuthModal
        open={Boolean(authMode)}
        mode={authMode || "signin"}
        form={authForm}
        loading={authLoading}
        error={authError}
        fieldErrors={authFieldErrors}
        showPassword={showAuthPassword}
        onTogglePassword={() => setShowAuthPassword((visible) => !visible)}
        onClose={closeAuthModal}
        onModeChange={(nextMode) => {
          setAuthMode(nextMode);
          setAuthError("");
          setAuthFieldErrors({});
        }}
        onFieldChange={updateAuthField}
        onSubmit={submitAuth}
        onGoogle={continueWithGoogle}
        onDemo={openDemoByRole}
        lang={lang}
      />

      <main className={workspaceShellActive ? `workspace-shell ${isFirstRunOnboarding ? "workspace-shell-onboarding" : ""}` : ""}>
        {workspaceShellActive && !isFirstRunOnboarding && workerSidebar}
        <div className={workspaceShellActive ? "workspace-content" : ""}>
        {isNgoRoute && routePath === "/ngo/onboarding" && activeAccountRole === ROLES.NGO && !isNgoDemoMode && (
          <NgoOnboarding
            account={account}
            existingOrganization={ngoOrganization}
            jobRoles={jobRoles}
            onSubmit={createNgoOrganization}
            onContinue={() => navigateTo("/ngo")}
            onSignOut={signOut}
            onDemo={openNgoDemoMode}
            onHelp={() => setStatusMessage("Need help? Contact support from your RozgaarAI workspace.")}
          />
        )}

        {isNgoRoute && (isNgoDemoMode || (routePath !== "/ngo/onboarding" && activeAccountRole === ROLES.NGO)) && (
          <NgoDashboardLayout
            account={activeNgoAccount}
            organization={activeNgoOrganization}
            membership={isNgoDemoMode ? { role: "organization_admin", status: "active" } : ngoMembership}
            stats={activeNgoStats}
            activityLogs={activeNgoActivityLogs}
            routePath={routePath}
            logoMark={logoMark}
            logoAlt={logoAlt}
            lang={lang}
            languageConfig={languageConfig}
            onLanguageChange={handleLanguageSelect}
            navigateTo={navigateTo}
            onSignOut={signOut}
            onUpdateOrganization={updateNgoOrganization}
            setStatusMessage={setStatusMessage}
            jobRoles={jobRoles}
            isDemoMode={isNgoDemoMode}
            onExitDemo={exitNgoDemoMode}
          />
        )}

        {isNgoRoute && !isNgoDemoMode && activeAccountRole !== ROLES.NGO && (
          <NgoOnboardingLanding
            onCreate={() => openAuthModal({ mode: "signup", role: ROLES.NGO, redirectTo: "/ngo/onboarding" })}
            onDemo={openNgoDemoMode}
            onHelp={() => setStatusMessage("Need help? Create an account or open the demo workspace to explore support options.")}
          />
        )}

        {routePath === "/employer/onboarding" && (
          <EmployerOnboarding
            onCreateAccount={() => openAuthModal({ mode: "signup", role: ROLES.EMPLOYER, redirectTo: "/employer" })}
            onDemo={openEmployerDemoMode}
            onHelp={() => setStatusMessage("Need help? Create an employer account or open the demo workspace to explore hiring tools.")}
          />
        )}

        {routePath === "/" && (
        <section id="home" className="premium-mesh relative min-h-screen overflow-hidden">
          <img src={heroImage} alt={t.heroAlt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="hero-mask absolute inset-0" />
          <div className="absolute left-10 top-24 hidden h-24 w-24 rounded-full border border-white/10 bg-white/10 blur-[1px] lg:block" />
          <div className="absolute bottom-24 right-16 hidden h-32 w-32 rounded-full border border-emerald-300/20 bg-emerald-300/10 blur-sm lg:block" />
          <div className="section-shell landing-container section-fade relative grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
            <div className="max-w-3xl text-white">
              <div className="mb-5 flex w-fit rounded-lg border border-white/20 bg-white p-2.5 shadow-lift">
                <img src={logoFull} alt={logoAlt} className="h-14 w-auto max-w-[min(25rem,82vw)] object-contain sm:h-16" />
              </div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/12 px-3 py-2 text-sm font-bold backdrop-blur">
                <Volume2 className="h-4 w-4 text-marigold" />
                {t.heroBadge}
              </p>
              <h1 className="text-balance text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {t.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50 sm:text-xl sm:leading-8">
                {t.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ActionButton icon={IdCard} className="transition duration-200 hover:-translate-y-0.5" onClick={() => openAuthModal({ mode: "signup", role: ROLES.WORKER, redirectTo: "/create-profile" })}>
                  {t.createCareerIdentity}
                  <ChevronRight className="h-4 w-4" />
                </ActionButton>
                <ActionButton icon={Building2} variant="secondary" className="transition duration-200 hover:-translate-y-0.5" onClick={() => navigateTo("/employer/onboarding")}>
                  {t.heroEmployerDashboard}
                  <ChevronRight className="h-4 w-4" />
                </ActionButton>
              </div>
              <div className="mt-10 hidden max-w-2xl grid-cols-2 gap-3 sm:grid sm:grid-cols-4">
                {heroCapabilities.map(([Icon, title, copy]) => (
                  <div key={title} className="glass min-h-[6.4rem] rounded-lg border border-white/30 px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/90">
                    <Icon className="h-4 w-4 text-neem" />
                    <p className="mt-2 text-sm font-black leading-4 text-ink">{title}</p>
                    <p className="mt-1 text-[11px] font-bold leading-4 text-slate-600">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full justify-center overflow-hidden py-4 lg:justify-start lg:py-0">
              <div className="pointer-events-none w-full max-w-[42rem] shrink-0 origin-center scale-[0.68] select-none sm:-my-28 lg:-my-36">
                <DigitalCareerIdentityCard identity={toEnglishArtifactIdentity(rahulPreviewIdentity, { skill: "Electrician", city: "Delhi", experience: 4, expectedWage: 32000, notes: rahulPreviewIdentity.resumeSummary })} labels={artifactLabels} variant="full" contentMode="identityOnly" />
              </div>
            </div>
          </div>
        </section>
        )}

        {(routePath === "/dashboard" || routePath.startsWith("/dashboard/") || isDemoDashboardRoute || isCreateProfileRoute) && (
        <Section
          id={isCreateProfileRoute ? "onboarding" : "product-dashboard"}
          eyebrow=""
          title=""
          tone="warm"
        >
          {routePath === "/dashboard/organizations" && account ? (
            <WorkerOrganizationRequests
              account={account}
              navigateTo={navigateTo}
              setStatusMessage={setStatusMessage}
            />
          ) : !account && !isCreateProfileRoute ? (
            <div className="secure-access-hero">
              <div className="grid gap-10 xl:grid-cols-[0.84fr_1.16fr] xl:items-center">
                <div className="secure-copy-column">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-saffron">
                      <ShieldCheck className="h-4 w-4" />
                      {workerCopy.onboarding.secureAccess}
                    </span>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-neem">
                      {workerCopy.onboarding.accountProfiles}
                    </span>
                  </div>

                  <h3 className="mt-7 max-w-2xl text-4xl font-black leading-[1.12] text-ink sm:text-5xl lg:text-[3.35rem]">
                    {workerCopy.onboarding.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-slate-600">
                    {workerCopy.onboarding.copy}
                  </p>

                  <div className="mt-8 grid gap-5">
                    {[
                      [IdCard, workerCopy.securePreview.features[0][0], workerCopy.securePreview.features[0][1], "blue"],
                      [FileText, workerCopy.securePreview.features[1][0], workerCopy.securePreview.features[1][1], "green"],
                      [WalletCards, workerCopy.securePreview.features[2][0], workerCopy.securePreview.features[2][1], "purple"]
                    ].map(([Icon, title, copy, tone]) => (
                      <div key={title} className="flex items-start gap-4">
                        <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${tone === "green" ? "bg-green-50 text-neem" : tone === "purple" ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-saffron"}`}>
                          <Icon className="h-7 w-7" />
                        </span>
                        <span>
                          <span className="block text-lg font-black text-ink">{title}</span>
                          <span className="mt-1 block text-sm font-semibold leading-6 text-slate-600">{copy}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 h-px w-full bg-slate-200" />

                  {authPrepStep >= 0 && (
                    <div className="mt-5 max-w-xl rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-black text-saffron">
                      {[
                        ...workerCopy.onboarding.prepSteps
                      ][authPrepStep]}
                    </div>
                  )}

                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <ActionButton icon={Sparkles} className="min-h-14 rounded-xl px-7 text-base" onClick={startSignupWorkspace} disabled={authPrepStep >= 0}>
                      {authPrepStep >= 0 ? workerCopy.onboarding.preparing : workerCopy.onboarding.createFreeAccount}
                      <ChevronRight className="h-5 w-5" />
                    </ActionButton>
                    <ActionButton icon={UserRound} variant="secondary" className="min-h-14 rounded-xl px-7 text-base" onClick={() => openAuthModal({ mode: "signin", role: ROLES.WORKER, redirectTo: "/dashboard" })}>
                      {t.auth.signIn}
                    </ActionButton>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-neem" />{workerCopy.onboarding.dataSecure}</span>
                    <span className="inline-flex items-center gap-2"><Sparkles className="h-5 w-5 text-saffron" />{workerCopy.onboarding.syncDevices}</span>
                  </div>

                  <div className="secure-trust-strip mt-10">
                    {[
                      [workerCopy.onboarding.trustItems[0], ShieldCheck],
                      [workerCopy.onboarding.trustItems[1], ShieldCheck],
                      [workerCopy.onboarding.trustItems[2], ShieldAlert],
                      [workerCopy.onboarding.trustItems[3], Users]
                    ].map(([label, Icon]) => (
                      <div key={label} className="secure-trust-item">
                        {Icon && <Icon className="h-5 w-5 shrink-0 text-saffron" />}
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="secure-workspace-preview">
                  <div className="secure-preview-shell">
                    <div className="flex items-center justify-between gap-3">
                      <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        <span className="h-2 w-2 rounded-full bg-neem" />
                        {workerCopy.onboarding.preview}
                      </p>
                      <div className="flex gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500"><Gauge className="h-5 w-5" /></span>
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-500"><IdCard className="h-5 w-5" /></span>
                      </div>
                    </div>

                    <div className="secure-identity-widget">
                      <div className="flex items-center justify-between gap-5">
                        <div className="flex min-w-0 items-center gap-5">
                          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-white/20 bg-white/15 text-2xl font-black sm:h-24 sm:w-24">RK</span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-2xl font-black leading-tight sm:text-3xl">Rahul Kumar</p>
                              <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-black text-green-100">Verified ✓</span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-blue-100">Electrician • Gurugram, Haryana</p>
                            <p className="mt-3 text-sm font-semibold text-blue-50">ID: RZ-RAHU-7Y • Member since Aug 2024</p>
                          </div>
                        </div>
                        <div className="hidden h-24 w-24 shrink-0 place-items-center rounded-full border-[7px] border-emerald-300 bg-white/10 text-center sm:grid">
                          <span className="text-3xl font-black">82</span>
                          <span className="-mt-3 text-[10px] font-bold leading-3">{workerCopy.onboarding.readinessScore}</span>
                        </div>
                      </div>
                    </div>

                    <div className="secure-preview-grid">
                      {securePreviewRows.slice(1, 5).map(([Icon, label, status, tab, ariaLabel], index) => (
                        <button
                          key={label}
                          type="button"
                          aria-label={ariaLabel}
                          title={ariaLabel}
                          className="secure-preview-tile focus-ring group"
                          onClick={() => openDemoWorker(featuredJourneyProfile, { tab })}
                        >
                          <span className="flex items-start gap-4">
                            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${index === 1 ? "bg-green-50 text-neem" : index === 2 ? "bg-violet-50 text-violet-600" : index === 3 ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-saffron"}`}>
                              <Icon className="h-6 w-6" />
                            </span>
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-base font-black text-ink">{label}</span>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-black ${String(status).includes("%") || status === "12" ? "bg-blue-50 text-saffron" : "bg-green-50 text-neem"}`}>{status}</span>
                              </span>
                              <span className="mt-3 block text-sm font-semibold leading-6 text-slate-600">
                                {label === workerCopy.securePreview.features[1][0] && workerCopy.securePreview.features[1][1]}
                                {label === workerCopy.securePreview.features[2][0] && workerCopy.securePreview.features[2][1]}
                                {label === workerCopy.securePreview.features[3][0] && workerCopy.securePreview.features[3][1]}
                                {label === workerCopy.securePreview.features[4][0] && workerCopy.securePreview.features[4][1]}
                              </span>
                            </span>
                          </span>
                          <ChevronRight className="absolute right-4 top-5 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-saffron" />
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="secure-activity-row focus-ring group"
                      onClick={() => openDemoWorker(featuredJourneyProfile, { tab: "identity" })}
                    >
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-green-50 text-neem">
                        <Sparkles className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block text-base font-black text-ink">{workerCopy.onboarding.generated}</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-600">{workerCopy.onboarding.generatedCopy}</span>
                      </span>
                      <span className="text-sm font-semibold text-slate-500">{workerCopy.onboarding.twoHoursAgo}</span>
                      <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-black text-neem">{workerCopy.onboarding.synced}</span>
                    </button>

                    <div className="secure-preview-trust">
                      {[
                        [ShieldCheck, workerCopy.securePreview.trust[0][0], workerCopy.securePreview.trust[0][1]],
                        [Sparkles, workerCopy.securePreview.trust[1][0], workerCopy.securePreview.trust[1][1]],
                        [UserRound, workerCopy.securePreview.trust[2][0], workerCopy.securePreview.trust[2][1]],
                        [ShieldAlert, workerCopy.securePreview.trust[3][0], workerCopy.securePreview.trust[3][1]]
                      ].map(([Icon, title, copy]) => (
                        <div key={title} className="secure-preview-trust-item">
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-saffron">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span>
                            <span className="block text-sm font-black text-ink">{title}</span>
                            <span className="mt-1 block text-xs font-semibold text-slate-500">{copy}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          ) : isCreateProfileRoute ? (
            <div className="create-identity-page">
              <div className="create-identity-shell">
                <div className="create-brandbar">
                  <button type="button" className="create-brand" onClick={() => navigateTo("/dashboard")} aria-label={workerCopy.aria.home}>
                    <img src={logoMark} alt={logoAlt} />
                    <span>
                      <strong>RozgaarAI</strong>
                      <small>{workerCopy.onboarding.brandTagline}</small>
                    </span>
                  </button>
                  <div className="create-top-actions">
                    <select value={lang} onChange={(event) => handleLanguageSelect(event.target.value)} className="create-language-select focus-ring" aria-label={t.language}>
                      {languageConfig.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                    </select>
                    <button type="button" className="create-ghost-button focus-ring" onClick={() => navigateTo(dashboardBasePath)}>
                      <ChevronRight className="h-4 w-4 rotate-180" /> {workerCopy.actions.backToDashboard}
                    </button>
                    <button type="button" className="create-help-button focus-ring" onClick={() => setStatusMessage(workerCopy.onboarding.helpMessage)}>
                      {workerCopy.actions.needHelp} <MessageSquare className="h-4 w-4" />
                    </button>
                    <button type="button" className="create-ghost-button focus-ring" onClick={signOut}>
                      <LogOut className="h-4 w-4" /> {workerCopy.logOut}
                    </button>
                  </div>
                </div>

                <section className="create-identity-card">
                  <header className="create-identity-header">
                    <div className="create-title-group">
                      <span className="create-title-icon"><ShieldCheck className="h-7 w-7" /></span>
                      <span>
                        <small>{workerCopy.title}</small>
                        <strong>{workerCopy.createIdentity}</strong>
                      </span>
                      <span className="create-secure-badge"><CheckCircle2 className="h-3.5 w-3.5" /> {workerCopy.onboarding.securePrivate}</span>
                    </div>
                    <ol className="create-stepper" aria-label={workerCopy.onboarding.stepperLabel}>
                      {[
                        [workerCopy.onboarding.steps[0], UserRound, "current"],
                        [workerCopy.onboarding.steps[1], BriefcaseBusiness, "upcoming"],
                        [workerCopy.onboarding.steps[2], Sparkles, "upcoming"],
                        [workerCopy.onboarding.steps[3], ClipboardCheck, "upcoming"],
                        [workerCopy.onboarding.steps[4], CheckCircle2, "upcoming"]
                      ].map(([label, Icon, state]) => (
                        <li key={label} className={`create-step create-step-${state}`}>
                          <span><Icon className="h-4 w-4" /></span>
                          <strong>{label}</strong>
                        </li>
                      ))}
                    </ol>
                  </header>

                  <div className="create-identity-grid">
                    <aside className="create-ai-panel">
                      <span className="create-ai-badge"><Sparkles className="h-4 w-4" /> {workerCopy.onboarding.aiAssisted}</span>
                      <h2>{workerCopy.onboarding.tell}</h2>
                      <p>{workerCopy.onboarding.tellCopy}</p>

                      <img src={createWorkerIdentityPhoto} alt={workerCopy.onboarding.imageAlt} className="create-worker-photo" />

                      <div className="create-example-card">
                        <div className="create-example-copy">
                        <div className="create-example-header">
                          <span className="create-example-title">
                            <Mic className="h-4 w-4" aria-hidden="true" />
                            {workerCopy.onboarding.trySaying}
                          </span>
                        </div>
                          <textarea
                            value={smartInput}
                            onChange={(event) => setSmartInput(event.target.value)}
                            placeholder={workerCopy.onboarding.examplePlaceholder}
                            aria-label={workerCopy.onboarding.exampleAria}
                          />
                        </div>
                        <div className="create-example-voice">
                          <button type="button" className={`create-wave-button focus-ring ${listening ? "is-listening" : ""}`} onClick={startVoiceInput} aria-label={listening ? t.listening : workerCopy.onboarding.speakAria}>
                            <span className="create-wave-rings" aria-hidden="true" />
                            <span className="create-wave-bars" aria-hidden="true">
                              {Array.from({ length: 3 }).map((_, index) => <i key={index} style={{ "--i": index }} />)}
                            </span>
                            <Mic className="h-5 w-5" aria-hidden="true" />
                          </button>
                          <strong>{workerCopy.onboarding.voiceExample}</strong>
                        </div>
                      </div>

                      <div className="create-ai-actions">
                        <button type="button" className={`create-speak-button focus-ring ${listening ? "is-active" : ""}`} onClick={startVoiceInput}>
                          <Mic className="h-4 w-4" /> {listening ? t.listening : workerCopy.actions.speakNow}
                        </button>
                        <button type="button" className="create-outline-button focus-ring" onClick={() => setStatusMessage(workerCopy.onboarding.uploadIdMessage)}>
                          <FileText className="h-4 w-4" /> {workerCopy.actions.uploadId}
                        </button>
                        <button type="button" className="create-outline-button focus-ring" onClick={applySmartInput}>
                          <Sparkles className="h-4 w-4" /> {isGenerating ? workerCopy.actions.extracting : workerCopy.actions.extractDetails}
                        </button>
                      </div>
                    </aside>

                    <form className="create-form-panel" onSubmit={(event) => { event.preventDefault(); if (canReviewWorker && !isGenerating) buildProfile(); }}>
                      <div className="create-form-heading">
                        <h2>{workerCopy.onboarding.formTitle}</h2>
                        <p>{workerCopy.onboarding.formCopy}</p>
                      </div>

                      <div className="create-form-grid">
                        <label className="create-field">
                          <span>{workerCopy.form.fullName}<strong>*</strong></span>
                          <div><UserRound className="h-5 w-5" /><input placeholder={workerCopy.form.fullNamePlaceholder} value={worker.name} onChange={(event) => updateWorker("name", event.target.value)} /></div>
                        </label>
                        <label className="create-field">
                          <span>{workerCopy.form.phone}<strong>*</strong></span>
                          <div><Phone className="h-5 w-5" /><input placeholder={workerCopy.form.phonePlaceholder} value={worker.phone} onChange={(event) => updateWorker("phone", event.target.value)} /></div>
                        </label>
                        <label className="create-field">
                          <span>{workerCopy.form.city}<strong>*</strong></span>
                          <div><MapPin className="h-5 w-5" /><select value={worker.city} onChange={(event) => updateWorker("city", event.target.value)}><option value="">{workerCopy.form.cityPlaceholder}</option>{cities.map((city) => <option key={city} value={city}>{cityLabel(city)}</option>)}</select></div>
                        </label>
                        <label className="create-field">
                          <span>{workerCopy.form.primarySkill}<strong>*</strong></span>
                          <div><BriefcaseBusiness className="h-5 w-5" /><select value={worker.skill} onChange={(event) => updateWorker("skill", event.target.value)}><option value="">{workerCopy.form.skillPlaceholder}</option>{jobRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></div>
                        </label>
                        <label className="create-field">
                          <span>{workerCopy.form.experience}</span>
                          <div><CalendarClock className="h-5 w-5" /><input type="number" min="0" placeholder={workerCopy.form.experiencePlaceholder} value={worker.experience} onChange={(event) => updateWorker("experience", event.target.value)} /></div>
                        </label>
                        <label className="create-field">
                          <span>{workerCopy.form.expectedWage}</span>
                          <div><IndianRupee className="h-5 w-5" /><input type="number" min="0" placeholder={workerCopy.form.wagePlaceholder} value={worker.expectedWage} onChange={(event) => updateWorker("expectedWage", event.target.value)} /></div>
                        </label>
                        <label className="create-field">
                          <span>{workerCopy.form.languages}</span>
                          <div><Globe2 className="h-5 w-5" /><input placeholder={workerCopy.form.languagesPlaceholder} value={worker.languages} onChange={(event) => updateWorker("languages", event.target.value)} /></div>
                        </label>
                        <label className="create-field">
                          <span>{workerCopy.form.availability}</span>
                          <div><CalendarDays className="h-5 w-5" /><input placeholder={workerCopy.form.availabilityPlaceholder} value={worker.availability} onChange={(event) => updateWorker("availability", event.target.value)} /></div>
                        </label>
                      </div>

                      <label className="create-work-details">
                        <span>{workerCopy.form.workAbout}</span>
                        <div>
                          <textarea placeholder={workerCopy.form.notesPlaceholder} value={workerTextValue(worker.notes)} onChange={(event) => updateWorker("notes", event.target.value)} />
                          <Edit3 className="h-4 w-4" />
                        </div>
                        <small>{withCopyTokens(workerCopy.form.characters, { count: `${workerTextValue(worker.notes).length}/500` })}</small>
                      </label>

                      {!canReviewWorker && (
                        <div className="create-validation-card" role="alert">
                          <ShieldAlert className="h-5 w-5" />
                          <strong>{workerCopy.onboarding.requiredHelp}</strong>
                        </div>
                      )}

                      <div className="create-form-actions">
                        <button type="submit" className="create-primary-button focus-ring" disabled={isGenerating || !canReviewWorker}>
                          <Sparkles className={`h-5 w-5 ${isGenerating ? "animate-spin" : ""}`} /> {isGenerating ? workerCopy.actions.generatingProfile : workerCopy.createWorkerProfile}
                        </button>
                        <button type="button" className="create-save-button focus-ring" onClick={() => navigateTo(dashboardBasePath)}>
                          <Archive className="h-5 w-5" /> {workerCopy.saveLater}
                        </button>
                      </div>
                      <p className="create-time-note"><LockKeyhole className="h-4 w-4" /> {workerCopy.lessThanTwoMinutes}</p>
                      {(statusMessage || errorMessage) && (
                        <div className={`create-status-message ${errorMessage ? "is-error" : ""}`}>
                          {errorMessage || statusMessage}
                        </div>
                      )}
                    </form>
                  </div>
                </section>

              </div>
            </div>
          ) : (
            <div className="space-y-5 pb-20 lg:pb-0">
              {isFirstRunOnboarding ? (
                <header className="first-run-topbar">
                  <button type="button" className="flex min-w-0 items-center gap-3 text-left" onClick={() => navigateTo("/dashboard")} aria-label={workerCopy.aria.workerWorkspace}>
                    <img src={logoMark} alt={logoAlt} className="h-10 w-10 rounded-xl object-contain" />
                    <span className="min-w-0">
                      <span className="block text-sm font-black text-ink">RozgaarAI</span>
                      <span className="block text-xs font-black uppercase tracking-[0.14em] text-saffron">{workerCopy.title}</span>
                    </span>
                  </button>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <select value={lang} onChange={(event) => handleLanguageSelect(event.target.value)} className="focus-ring min-h-10 rounded-xl bg-white px-3 text-sm font-black text-ink shadow-sm ring-1 ring-slate-200">
                      {languageConfig.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                    </select>
                    <span className="hidden min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 sm:inline-flex">
                      <UserRound className="h-4 w-4 text-saffron" /> {account.name || account.email || workerCopy.worker}
                    </span>
                    <button type="button" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-ink shadow-sm ring-1 ring-slate-200" onClick={signOut}>
                      <LogOut className="h-4 w-4" /> {workerCopy.logOut}
                    </button>
                  </div>
                </header>
              ) : (
                <header className="sticky top-0 z-20 -mx-4 -mt-8 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:-mx-8 lg:-mt-10 lg:px-8">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-saffron">{workerCopy.title}</p>
                      <h2 className="truncate text-xl font-black text-ink">{workerNavItems.find(([, , , key]) => key === workerDashboardRoute)?.[1] || workerCopy.home}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {isDemoMode && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-black text-neem">{workerCopy.demoMode}</span>}
                      <select value={lang} onChange={(event) => handleLanguageSelect(event.target.value)} className="focus-ring min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-sm font-black text-ink">
                        {languageConfig.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                      </select>
                      <button type="button" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-ink" onClick={signOut}>
                        <LogOut className="h-4 w-4" /> {workerCopy.logOut}
                      </button>
                    </div>
                  </div>
                </header>
              )}

              {isDemoExperience && (
                <section className="demo-mode-banner" role="status" aria-live="polite">
                  <div>
                    <span className="demo-mode-pill">{workerCopy.demo}</span>
                    <strong>{workerCopy.demoTitle}</strong>
                    <p>{workerCopy.demoCopy}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton icon={Mic} onClick={createProfileFromDemo}>{workerCopy.createMyProfile}</ActionButton>
                    <ActionButton icon={X} variant="secondary" onClick={exitDemoMode}>{workerCopy.exitDemo}</ActionButton>
                  </div>
                </section>
              )}

              {workerDashboardRoute === "home" && (
                <>
                  {profileFetchError ? (
                    <section className="dashboard-section-card">
                      <div className="dashboard-empty-state">
                        <ShieldAlert className="h-6 w-6 text-saffron" />
                        <p>{workerCopy.loadProfileError}</p>
                        <ActionButton icon={Cloud} onClick={() => loadProfilesForAccount(account)}>{workerCopy.tryAgain}</ActionButton>
                      </div>
                    </section>
                  ) : true ? (
                    <section className="onboarding-choice-card">
                      <div className="dashboard-hero-glow dashboard-hero-glow-blue" />
                      <div className="dashboard-hero-glow dashboard-hero-glow-green" />
                      <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                        <div className="first-run-copy">
                          <p className="dashboard-eyebrow">{workerCopy.welcome}</p>
                          <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-5xl">
                            {latestUserProfile ? workerCopy.readyTitle : workerCopy.createTitle}
                          </h1>
                          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                            {latestUserProfile
                              ? workerCopy.readyCopy
                              : workerCopy.createCopy}
                          </p>
                          <div className="first-run-stepper" aria-label={workerCopy.onboarding.stepperLabel}>
                            {workerCopy.onboardingSteps.map(([title, copy], index) => (
                              <div key={title} className="first-run-step">
                                <span>{index + 1}</span>
                                <div>
                                  <strong>{title}</strong>
                                  <p>{copy}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-8 grid gap-4 sm:max-w-xl sm:grid-cols-[1.1fr_0.9fr]">
                            <div>
                              <ActionButton icon={latestUserProfile ? IdCard : Mic} className="min-h-12 w-full rounded-xl px-5 shadow-lg shadow-blue-600/20" onClick={() => latestUserProfile ? navigateTo(`/worker/${encodeURIComponent(latestUserProfile.workerId)}`) : startRealWorkerOnboarding()}>
                                {latestUserProfile ? workerCopy.openMyWorkerIdentity : workerCopy.createMyWorkerIdentity}
                              </ActionButton>
                              <p className="mt-2 text-center text-xs font-black text-slate-500">
                                {latestUserProfile ? workerCopy.profilePrivate : workerCopy.approxTime}
                              </p>
                            </div>
                            <div>
                              <ActionButton icon={PlayCircle} variant="secondary" className="min-h-12 w-full rounded-xl px-5" onClick={startOnboardingDemo}>
                                {workerCopy.exploreDemo}
                              </ActionButton>
                              <p className="mt-2 text-center text-xs font-semibold leading-5 text-slate-500">{workerCopy.demoPreview}</p>
                            </div>
                          </div>
                          <div className="first-run-trust-row" aria-label={workerCopy.profilePrivate}>
                            {[
                              [ShieldCheck, workerCopy.trust[0]],
                              [LockKeyhole, workerCopy.trust[1]],
                              [Cloud, workerCopy.trust[2]]
                            ].map(([Icon, copy]) => (
                              <div key={copy}><Icon className="h-4 w-4" /> <span>{copy}</span></div>
                            ))}
                          </div>
                        </div>
                        <div className="flex w-full justify-center overflow-hidden py-4 lg:justify-start lg:py-0" aria-label={workerCopy.demoPreview}>
                          <div className="pointer-events-none w-full max-w-[42rem] shrink-0 origin-center scale-[0.68] select-none sm:-my-28 lg:-my-36">
                            <DigitalCareerIdentityCard identity={toEnglishArtifactIdentity(onboardingDemoIdentity, onboardingDemoProfile, localWageEstimate(onboardingDemoProfile))} labels={artifactLabels} variant="full" contentMode="identityOnly" />
                          </div>
                        </div>
                      </div>
                      <p className="relative z-10 mt-10 text-center text-xs font-bold text-slate-500">{workerCopy.dataPrivate}</p>
                    </section>
                  ) : (
                  <div className="dashboard-premium-grid">
                    <div className="dashboard-main-stack">
                      <section className="dashboard-hero-card">
                        <div className="dashboard-hero-glow dashboard-hero-glow-blue" />
                        <div className="dashboard-hero-glow dashboard-hero-glow-green" />
                        <div className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-center">
                          <div>
                            <p className="text-sm font-semibold text-slate-600">{dashboardIdentityReady ? withCopyTokens(workerCopy.goodMorning, { name: account.name || latestWorker.name || "Sami" }) : `${workerCopy.welcome}, ${account.name || "Sami"}`}</p>
                            <h3 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-ink sm:text-4xl">
                              {workerCopy.completeHeroTitle || "Complete your Income Passport to unlock Verified Jobs, Wage Protection and Digital Identity."}
                            </h3>
                            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                              {workerCopy.completeHeroCopy || "RozgaarAI is turning your work history into a trusted employment profile employers can understand in seconds."}
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                              <ActionButton icon={WalletCards} className="min-h-12 rounded-xl px-5 shadow-lg shadow-blue-600/20" onClick={() => dashboardIdentityReady ? navigateTo(`${dashboardBasePath}/income`) : navigateTo("/create-profile")}>
                                {workerCopy.continueIncome || workerCopy.incomePassport}
                              </ActionButton>
                              <ActionButton icon={BriefcaseBusiness} variant="secondary" className="min-h-12 rounded-xl px-5" onClick={() => dashboardIdentityReady ? navigateTo(`${dashboardBasePath}/jobs`) : navigateTo("/create-profile")}>
                                {withCopyTokens(workerCopy.viewJobMatches || "View {count} Job Matches", { count: activeWorkerMatches.length || 40 })}
                              </ActionButton>
                            </div>
                          </div>
                          <div className="dashboard-readiness-orb">
                            <span>{workerCopy.employmentReady || workerCopy.kpis[0][0]}</span>
                            <strong>{workerReadinessScore}%</strong>
                            <div className="dashboard-progress-track mt-4">
                              <div className="dashboard-progress-fill" style={{ width: `${workerReadinessScore}%` }} />
                            </div>
                            <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">{workerCopy.aiRecommendation || "AI recommends finishing the current step before applying to high-trust jobs."}</p>
                          </div>
                        </div>
                      </section>

                      <section className="dashboard-kpi-grid">
                        {dashboardKpis.map(([Icon, label, value, status, tone]) => (
                          <article key={label} className={`dashboard-kpi-card dashboard-kpi-${tone}`}>
                            <span className="dashboard-kpi-icon"><Icon className="h-5 w-5" /></span>
                            <p>{label}</p>
                            <strong>{value}</strong>
                            <span>{status}</span>
                          </article>
                        ))}
                      </section>

                      <section className="dashboard-section-card">
                        <div className="dashboard-section-heading">
                          <div>
                            <p className="dashboard-eyebrow">{workerCopy.roadmap}</p>
                            <h3>{workerCopy.careerJourney}</h3>
                          </div>
                          <span className="dashboard-score-pill">{dashboardProgress}% {workerCopy.complete}</span>
                        </div>
                        <div className="dashboard-roadmap" style={{ "--progress": `${dashboardProgress}%` }}>
                          {workerJourneySteps.map(([key, label, done, action], index) => {
                            const current = key === recommendedWorkerStep?.[0];
                            return (
                              <button key={key} type="button" className={`dashboard-roadmap-step ${done ? "is-complete" : ""} ${current ? "is-current" : ""}`} onClick={action}>
                                <span className="dashboard-roadmap-node">{done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span>
                                <strong>{label}</strong>
                                <small>{done ? workerCopy.completed : current ? workerCopy.current : workerCopy.upcoming}</small>
                              </button>
                            );
                          })}
                        </div>
                      </section>

                      <section className="dashboard-section-card">
                        <div className="dashboard-section-heading">
                          <div>
                            <p className="dashboard-eyebrow">{workerCopy.nextActions}</p>
                            <h3>{workerCopy.quickActions}</h3>
                          </div>
                        </div>
                        <div className="dashboard-action-layout">
                          <button type="button" className="dashboard-featured-action" onClick={() => dashboardIdentityReady ? navigateTo(`${dashboardBasePath}/income`) : navigateTo("/create-profile")}>
                            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/18 text-white"><WalletCards className="h-6 w-6" /></span>
                            <span>
                              <small>{workerCopy.featuredAction}</small>
                              <strong>{workerCopy.continueIncome || workerCopy.incomePassport}</strong>
                              <em>{workerCopy.noRecordsHint}</em>
                            </span>
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <div className="dashboard-action-mini-grid">
                            {[
                              [IdCard, workerCopy.digitalIdentity, dashboardIdentityReady ? workerCopy.viewProfileCard : workerCopy.createIdentityShort, () => dashboardIdentityReady ? navigateTo(`/worker/${encodeURIComponent(dashboardIdentity.workerId)}`) : navigateTo("/create-profile")],
                              [BriefcaseBusiness, workerCopy.browseJobs, withCopyTokens(workerCopy.matchesReady, { count: activeWorkerMatches.length || 40 }), () => navigateTo(`${dashboardBasePath}/jobs`)],
                              [MessageSquare, workerCopy.interviewPractice, practiceHistory.length ? workerCopy.continuePractice : workerCopy.startCoaching, openInterviewPracticePage],
                              [ShieldAlert, workerCopy.safetyCheck, workerCopy.scanRiskyOffers, () => navigateTo(`${dashboardBasePath}/safety`)],
                              [FileText, workerCopy.resume, hasResumeReady ? workerCopy.downloadResume : workerCopy.generateResume, () => dashboardIdentityReady ? downloadResume({ preview: true }) : navigateTo("/create-profile")]
                            ].map(([Icon, title, copy, action]) => (
                              <button key={title} type="button" className="dashboard-mini-action" onClick={action}>
                                <Icon className="h-5 w-5" />
                                <span><strong>{title}</strong><small>{copy}</small></span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </section>

                      <section className="dashboard-section-card dashboard-ai-card">
                        <div className="dashboard-section-heading">
                          <div>
                            <p className="dashboard-eyebrow">{workerCopy.intelligence}</p>
                            <h3>{workerCopy.aiTitle}</h3>
                          </div>
                          <Sparkles className="h-5 w-5 text-saffron" />
                        </div>
                        <p className="mt-4 text-base font-semibold leading-7 text-slate-700">{withCopyTokens(workerCopy.goodMorning, { name: account.name || latestWorker.name || "Sami" })}</p>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                          {aiInsightHighlights.map((insight) => (
                            <div key={insight} className="dashboard-insight-chip">{insight}</div>
                          ))}
                        </div>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 p-4">
                          <p className="text-sm font-bold text-slate-700"><span className="font-black text-ink">{workerCopy.recommendedAction}</span> {workerCopy.applyBefore}</p>
                          <ActionButton icon={BriefcaseBusiness} onClick={() => navigateTo(`${dashboardBasePath}/jobs`)}>{workerCopy.openJobs}</ActionButton>
                        </div>
                      </section>

                      <section className="dashboard-section-card">
                        <div className="dashboard-section-heading">
                          <div>
                            <p className="dashboard-eyebrow">{workerCopy.matched}</p>
                            <h3>{workerCopy.opportunities}</h3>
                          </div>
                          <button type="button" className="dashboard-text-button" onClick={() => navigateTo(`${dashboardBasePath}/jobs`)}>{workerCopy.viewAll}</button>
                        </div>
                        {dashboardIdentityReady ? (
                          <div className="mt-5 grid gap-4">
                            {activeWorkerMatches.slice(0, 3).map((job, index) => (
                              <article key={job.id || job.title || index} className="dashboard-job-card">
                                <div className="dashboard-job-logo">{(job.employer || job.employerName || "RJ").slice(0, 2).toUpperCase()}</div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4>{jobTitleLabel(job)}</h4>
                                    <span className="dashboard-verified-badge"><BadgeCheck className="h-3.5 w-3.5" /> {workerCopy.verifiedEmployer}</span>
                                    <span className="dashboard-match-badge">{job.score || 90}% {workerCopy.aiMatch}</span>
                                  </div>
                                  <p className="mt-1 text-sm font-semibold text-slate-600">{job.employer || job.employerName || "RozgaarAI Partner"} • {cityLabel(job.city)} • {job.distance || "4.2 km"}</p>
                                  <div className="dashboard-job-meta">
                                    <span>{job.wageRange?.min ? `₹${job.wageRange.min.toLocaleString("en-IN")}-₹${job.wageRange.max.toLocaleString("en-IN")}/${periodLabel(job.wageRange.period || "Monthly")}` : expectedSalaryValue}</span>
                                    <span>{job.language || latestWorker.languages || "Hindi"}</span>
                                    <span>{job.type || job.employmentType || "Full-time"}</span>
                                  </div>
                                  <div className="dashboard-job-reasons" aria-label={workerCopy.whyRecommended}>
                                    {[workerCopy.nearby, `${roleLabel(latestWorker.skill || worker.skill)} ${workerCopy.experience}`, latestWorker.languages || "Hindi", workerCopy.salaryPreference].map((reason) => (
                                      <span key={reason}><CheckCircle2 className="h-3.5 w-3.5" /> {reason}</span>
                                    ))}
                                  </div>
                                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-600"><strong className="text-ink">{workerCopy.whyRecommended}</strong> {workerCopy.whyRecommendedCopy}</p>
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <button type="button" className="dashboard-primary-button" onClick={() => isDemoExperience ? setStatusMessage(workerCopy.status.demoApply) : setStatusMessage(workerCopy.status.applyStarted)}>{workerCopy.applyNow}</button>
                                    <button type="button" className="dashboard-secondary-button" onClick={() => isDemoExperience ? setStatusMessage(workerCopy.status.demoSaved) : setStatusMessage(workerCopy.status.saved)}>{workerCopy.save}</button>
                                    <button type="button" className="dashboard-secondary-button" onClick={() => setStatusMessage(workerCopy.status.detailsOpened)}>{workerCopy.details}</button>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="dashboard-empty-state">
                            <BriefcaseBusiness className="h-6 w-6 text-saffron" />
                            <p>{workerCopy.emptyJobMatch}</p>
                            <ActionButton icon={Mic} onClick={() => navigateTo("/create-profile")}>{workerCopy.createIdentity}</ActionButton>
                          </div>
                        )}
                      </section>

                      <section className="dashboard-section-card">
                        <div className="dashboard-section-heading">
                          <div>
                            <p className="dashboard-eyebrow">{workerCopy.activity}</p>
                            <h3>{workerCopy.updates}</h3>
                          </div>
                        </div>
                        <div className="dashboard-timeline">
                          {dashboardTimeline.map(([day, items]) => (
                            <div key={day} className="dashboard-timeline-day">
                              <p>{day}</p>
                              <div className="grid gap-3">
                                {items.map(([Icon, title, copy, action]) => (
                                  <button key={title} type="button" className="dashboard-timeline-item" onClick={action}>
                                    <span><Icon className="h-4 w-4" /></span>
                                    <strong>{title}</strong>
                                    <small>{copy}</small>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <aside className="dashboard-profile-rail">
                      <section className="dashboard-worker-card">
                        <div className="dashboard-worker-card-top">
                          <img src={account.photoUrl || account.image || rahulWorkerPhoto} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                          <span className="dashboard-verified-badge"><BadgeCheck className="h-3.5 w-3.5" /> {t.verified}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <h3 className="!mt-0">{dashboardIdentity?.name || latestWorker.name || account.name || "Sami"}</h3>
                          {isDemoExperience && <span className="demo-mode-pill">{workerCopy.demo}</span>}
                        </div>
                        <p>{roleLabel(latestWorker.skill || worker.skill)} • {cityLabel(latestWorker.city || worker.city)}</p>
                        <div className="dashboard-worker-stats">
                          <span><strong>{latestWorker.experience || 3}+ {workerCopy.years}</strong><small>{workerCopy.experience}</small></span>
                          <span><strong>{latestWorker.languages || "Hindi"}</strong><small>{workerCopy.languages}</small></span>
                        </div>
                        <div className="dashboard-worker-qr">
	                          {dashboardIdentity?.profileUrl ? (
	                            <a href={dashboardIdentity.profileUrl} aria-label={artifactLabels.qrAria} className="focus-ring rounded-lg bg-white p-1">
	                              <QRCodeCanvas value={dashboardIdentity.profileUrl} size={74} level="H" marginSize={1} bgColor="#ffffff" fgColor="#0F172A" title={workerCopy.qrTitle} />
	                            </a>
	                          ) : (
                            <IdCard className="h-8 w-8 text-slate-400" />
                          )}
                          <div>
                            <small>{workerCopy.digitalWorkerId}</small>
                            <strong>{dashboardIdentity?.workerId || latestProfileId}</strong>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-3">
                          {[
                            [workerCopy.kpis[5][0], workerProfileCompletion],
                            [workerCopy.readiness, workerReadinessScore]
                          ].map(([label, value]) => (
                            <div key={label}>
                              <div className="mb-1 flex items-center justify-between text-xs font-black text-slate-600"><span>{label}</span><span>{value}%</span></div>
                              <div className="dashboard-progress-track"><div className="dashboard-progress-fill" style={{ width: `${value}%` }} /></div>
                            </div>
                          ))}
                        </div>
                        <ActionButton icon={IdCard} className="mt-5 w-full" onClick={() => dashboardIdentityReady ? navigateTo(`/worker/${encodeURIComponent(dashboardIdentity.workerId)}`) : navigateTo("/create-profile")}>
                          {workerCopy.openIdentity}
                        </ActionButton>
                      </section>
                    </aside>
                  </div>
                  )}
                </>
              )}

              {workerDashboardRoute !== "home" && (
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-2xl font-black text-ink">{workerNavItems.find(([, , , key]) => key === workerDashboardRoute)?.[1] || workerCopy.home}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                    {isDemoExperience
                      ? workerDashboardRoute === "jobs" ? workerCopy.routeCopy.jobs
                        : workerDashboardRoute === "resume" ? workerCopy.routeCopy.resume
                          : workerDashboardRoute === "income" ? workerCopy.routeCopy.income
                            : workerCopy.routeCopy.demoDefault
                      : workerCopy.routeCopy.default}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {workerDashboardRoute === "identity" && <ActionButton icon={IdCard} onClick={() => hasPrimaryIdentity ? navigateTo(`/worker/${encodeURIComponent(activeWorkerIdentity.workerId)}`) : navigateTo("/create-profile")}>{hasPrimaryIdentity ? workerCopy.openIdentity : workerCopy.createIdentity}</ActionButton>}
                    {workerDashboardRoute === "jobs" && <ActionButton icon={BriefcaseBusiness} onClick={() => hasPrimaryIdentity ? setActiveWorkspaceTab("jobs") : navigateTo("/create-profile")}>{workerCopy.browse}</ActionButton>}
                    {workerDashboardRoute === "income" && <ActionButton icon={WalletCards} onClick={openWorkRecordModal}>{workerCopy.addRecord}</ActionButton>}
                    {workerDashboardRoute === "resume" && <ActionButton icon={FileText} disabled={!hasPrimaryIdentity} onClick={() => downloadResume({ preview: true })}>{workerCopy.generate}</ActionButton>}
                    {workerDashboardRoute === "coach" && <ActionButton icon={MessageSquare} onClick={openInterviewPracticePage}>{workerCopy.practice}</ActionButton>}
                    {workerDashboardRoute === "safety" && <ActionButton icon={ShieldAlert} onClick={() => setActiveWorkspaceTab("rights")}>{workerCopy.checkOffer}</ActionButton>}
                    {workerDashboardRoute === "applications" && <ActionButton icon={BriefcaseBusiness} onClick={() => navigateTo(`${dashboardBasePath}/jobs`)}>{workerCopy.browse}</ActionButton>}
                    {workerDashboardRoute === "settings" && <ActionButton icon={UserRound} variant="secondary" onClick={signOut}>{workerCopy.signOut}</ActionButton>}
                    {isDemoExperience && <ActionButton icon={Mic} variant="secondary" onClick={createProfileFromDemo}>{workerCopy.createMyProfile}</ActionButton>}
                  </div>
                </section>
              )}
            </div>
          )}
        </Section>
        )}

        {!routePath.startsWith("/dashboard") && !isDemoDashboardRoute && (
        <>
        {routePath === "/demo" && (
        <Section id="demo" eyebrow="" title="">
          <div className="demo-workers-section">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.96fr] lg:items-center">
              <div>
                <p className="section-label text-saffron">{t.demoWorkersPage.eyebrow}</p>
                <h2 className="mt-3 text-[40px] font-black leading-[1.05] text-ink sm:text-[48px]">
                  {t.demoWorkersPage.titlePrefix} <span className="text-saffron">{t.demoWorkersPage.titleAccent}</span> <span className="bg-gradient-to-r from-saffron to-neem bg-clip-text text-transparent">{t.demoWorkersPage.titleSuffix}</span>
                </h2>
                <p className="mt-4 max-w-3xl text-[16px] font-medium leading-7 text-slate-600">
                  {t.demoWorkersPage.description}
                </p>
              </div>

              <div className="demo-active-banner">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-50 text-neem">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-base font-black text-ink">{t.demoWorkersPage.bannerTitlePrefix} <span className="text-saffron">{t.demoWorkersPage.bannerTitleAccent}</span> {t.demoWorkersPage.bannerTitleSuffix}</p>
                  <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">{t.demoWorkersPage.bannerCopy}<br />{t.demoWorkersPage.bannerNote}</p>
                </div>
                <ActionButton icon={PlayCircle} className="ml-auto min-h-11 shrink-0 rounded-lg px-6 text-sm" onClick={openDemoSection}>
                  {t.exploreDemo}
                </ActionButton>
              </div>
            </div>

            <div className="demo-controls-row mt-7">
              <div className="demo-category-row">
                {demoWorkerCategories.map(([key, Icon, label]) => {
                  const active = demoWorkerCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                    className={`focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-4 text-sm font-semibold transition ${active ? "border-saffron bg-saffron text-white shadow-md shadow-blue-600/20" : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50"}`}
                      onClick={() => setDemoWorkerCategory(key)}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="demo-search-row">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={demoWorkerSearch}
                    onChange={(event) => setDemoWorkerSearch(event.target.value)}
                    placeholder={t.demoWorkersPage.searchPlaceholder}
                    className="focus-ring min-h-10 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-ink shadow-sm placeholder:text-slate-400"
                  />
                </label>
                <select
                  value={demoWorkerSort}
                  onChange={(event) => setDemoWorkerSort(event.target.value)}
                  className="focus-ring min-h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"
                  aria-label={t.demoWorkersPage.sortLabel}
                >
                  <option value="match">{t.demoWorkersPage.sortMostRelevant}</option>
                  <option value="readiness">{t.demoWorkersPage.sortReadiness}</option>
                  <option value="experience">{t.demoWorkersPage.sortExperience}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {filteredDemoProfiles.map((profileData) => (
                <article
                  key={profileData.workerId}
                  className={`demo-worker-card-v2 group ${profileData.workerId === featuredJourneyProfile.workerId ? "demo-worker-card-selected" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="demo-avatar">
                        {profileData.photoUrl ? <img src={profileData.photoUrl} alt="" className="h-full w-full rounded-full object-cover" /> : <span className={`grid h-full w-full place-items-center rounded-full bg-gradient-to-br ${profileData.gradient || "from-blue-600 to-emerald-500"}`}>{profileData.avatar}</span>}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-[21px] font-black leading-7 text-ink">{profileData.name}</h3>
                          <span className="verified-pill"><BadgeCheck className="h-3.5 w-3.5" /> {t.demoWorkersPage.verified}</span>
                        </div>
                        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold leading-5 text-slate-600">
                          <BriefcaseBusiness className="h-4 w-4 text-slate-500" />
                          {roleLabel(profileData.skill)}
                          <span className="text-slate-300">•</span>
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold leading-5 text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          {cityLabel(profileData.city)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="demo-metric-grid">
                    {[
                      [CalendarClock, t.demoWorkersPage.metricExperience, `${profileData.experience} ${t.demoWorkersPage.years}`],
                      [Gauge, t.demoWorkersPage.metricReadiness, `${profileData.readiness}/100`],
                      [TrendingUp, t.demoWorkersPage.metricBestMatch, `${profileData.jobMatch}%`]
                    ].map(([Icon, label, value], metricIndex) => (
                      <div key={label} className={`demo-metric ${metricIndex ? "border-l border-slate-200" : ""}`}>
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-saffron">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-xs font-semibold leading-4 text-slate-600">{label}</span>
                          <span className="mt-0.5 block text-base font-black leading-5 text-ink">{value}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {[t.demoWorkersPage.badges.aiResume, t.demoWorkersPage.badges.incomePassport, t.demoWorkersPage.badges.interviewReady, t.demoWorkersPage.badges.verifiedIdentity].map((badge) => (
                      <span key={badge} className="demo-chip">✓ {badge}</span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="focus-ring button-press mt-5 inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-lg bg-saffron px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
                    onClick={() => openDemoWorker(profileData)}
                  >
                    {t.demoWorkersPage.exploreJourney}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </article>
              ))}

              <aside className="demo-proof-panel">
                <div className="demo-proof-card">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-saffron">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-ink">{t.demoWorkersPage.proofSafeTitle}</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{t.demoWorkersPage.proofSafeCopy}</p>
                  </div>
                </div>
                <div className="demo-proof-card">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-50 text-neem">
                    <IdCard className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-black text-ink">{t.demoWorkersPage.proofJourneyTitle}</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{t.demoWorkersPage.proofJourneyCopy}</p>
                  </div>
                </div>
                <div className="demo-proof-stats">
                  {[
                    ["50+", t.demoWorkersPage.stats.demoWorkers],
                    ["10K+", t.demoWorkersPage.stats.journeysTried],
                    ["98%", t.demoWorkersPage.stats.userSatisfaction]
                  ].map(([value, label]) => (
                    <div key={label}>
                      <p className="text-2xl font-black text-ink">{value}</p>
                      <p className="mt-2 text-sm font-medium text-slate-600">{label}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </Section>
        )}

        {routePath === "/" && (
        <>
        {false && (
        <Section id="trusted-impact" eyebrow="" title="">
          <div className="impact-timeline-section">
            <div className="max-w-4xl">
              <p className="section-label text-saffron">HOW IT WORKS</p>
              <span className="mt-4 block h-1 w-8 rounded-full bg-neem" />
              <h2 className="mt-5 max-w-5xl text-[36px] font-black leading-[1.08] text-ink sm:text-[44px]">
                A Four-Step Journey from Voice to{" "}
                <span className="bg-gradient-to-r from-saffron to-neem bg-clip-text text-transparent">Verified Employment</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">
                Every worker’s journey follows a simple, intelligent pipeline—from voice onboarding to a trusted digital identity that employers can verify instantly.
              </p>
            </div>

            <div className="impact-timeline">
              {[
                [Mic, "Voice-first AI Onboarding", "Workers simply speak in Hindi or English. AI creates a structured employment profile in seconds."],
                [FileText, "AI Resume Generation", "Spoken experience becomes an employer-ready resume and polished PDF."],
                [IdCard, "Digital Career Identity", "Skills, work history, QR verification, and credibility live in one secure identity."],
                [ShieldCheck, "AI Job Safety Analysis", "AI flags fake jobs, fees, document requests, and unsafe signals before workers accept."]
              ].map(([Icon, title, copy], index) => {
                const green = index >= 2;
                return (
                  <article key={title} className="impact-timeline-step">
                    <div className={`impact-icon-ring ${green ? "impact-icon-ring-green" : ""}`}>
                      <span>
                        <Icon className="h-7 w-7" />
                      </span>
                    </div>
                    <span className={`impact-step-number ${green ? "bg-neem" : "bg-saffron"}`}>{index + 1}</span>
                    <h3 className="mt-5 text-xl font-black leading-7 text-ink">{title}</h3>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{copy}</p>
                    <span className={`mt-4 block h-1 w-16 rounded-full ${green ? "bg-neem" : "bg-saffron"}`} />
                  </article>
                );
              })}
            </div>

          </div>
        </Section>
        )}

        <Section id="about" eyebrow="" title="" tone="warm">
          <div className="problem-section">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p className="section-label text-saffron">{t.landingV2.challengeEyebrow}</p>
                <span className="mt-2 block h-1 w-9 rounded-full bg-neem" />
                <h2 className="mt-6 max-w-4xl text-[34px] font-black leading-[1.1] text-ink sm:text-[42px]">
                  {t.landingV2.challengeTitlePrefix}{" "}
                  <span className="bg-gradient-to-r from-saffron to-neem bg-clip-text text-transparent">{t.landingV2.challengeTitleAccent}</span>
                </h2>
                <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
                  {t.landingV2.challengeCopyLine1}<br />{t.landingV2.challengeCopyLine2}
                </p>
              </div>

              <div className="problem-orbit" aria-label={t.landingV2.orbitAria}>
                <div className="problem-orbit-ring problem-orbit-ring-outer" />
                <div className="problem-orbit-ring problem-orbit-ring-inner" />
                <div className="problem-worker-avatar">
                  <img src={informalWorkerOrbit} alt={t.landingV2.workerOrbitAlt} />
                </div>
                {[
                  [FileText, t.landingV2.challengeItems.resume[0], "top-left", "blue"],
                  [IdCard, t.landingV2.challengeItems.identity[0], "top-right", "red"],
                  [WalletCards, t.landingV2.challengeItems.wages[0], "middle-left", "blue"],
                  [ShieldAlert, t.landingV2.challengeItems.unsafe[0], "middle-right", "red"],
                  [Globe2, t.landingV2.challengeItems.language[0], "bottom-left", "purple"],
                  [MessageSquare, t.landingV2.challengeItems.confidence[0], "bottom-right", "purple"]
                ].map(([Icon, label, position, tone]) => (
                  <div key={label} className={`problem-orbit-pill problem-orbit-pill-${position}`}>
                    <span className={`problem-orbit-icon problem-orbit-icon-${tone}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{label}</span>
                    <span className="text-red-400">×</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="problem-card-grid">
              {[
                [FileText, t.landingV2.challengeItems.resume[0], t.landingV2.challengeItems.resume[1], "blue"],
                [IdCard, t.landingV2.challengeItems.identity[0], t.landingV2.challengeItems.identity[1], "purple"],
                [ShieldAlert, t.landingV2.challengeItems.unsafe[0], t.landingV2.challengeItems.unsafe[1], "red"],
                [WalletCards, t.landingV2.challengeItems.wages[0], t.landingV2.challengeItems.wages[1], "green"],
                [Globe2, t.landingV2.challengeItems.language[0], t.landingV2.challengeItems.language[1], "amber"],
                [MessageSquare, t.landingV2.challengeItems.confidence[0], t.landingV2.challengeItems.confidence[1], "blue"]
              ].map(([Icon, title, copy, tone]) => (
                <article key={title} className={`problem-card problem-card-${tone}`}>
                  <span className={`problem-card-icon problem-card-icon-${tone}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black leading-6 text-ink">{title}</h3>
                    <p className="mt-1.5 text-sm font-medium leading-6 text-slate-600">{copy}</p>
                  </div>
                </article>
              ))}
            </div>

            {false && (
            <div className="problem-transform-strip">
              <div className="flex items-start gap-5">
                <span className="problem-transform-shield">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="max-w-md text-xl font-black leading-tight text-ink">
                    Without trusted proof, experience remains invisible.
                  </h3>
                  <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">
                    RozgaarAI transforms spoken experience into verified digital identity, AI-generated resumes, employment records, safer job opportunities, and interview readiness.
                  </p>
                </div>
              </div>
              <div className="problem-transform-flow">
                {[
                  [Mic, "Speak", "blue"],
                  [Sparkles, "AI Understands", "green"],
                  [IdCard, "Digital Identity", "purple"],
                  [BriefcaseBusiness, "Better Opportunities", "blue"]
                ].map(([Icon, label, tone], index, items) => (
                  <div key={label} className="problem-flow-step">
                    <span className={`problem-flow-icon problem-flow-icon-${tone}`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="mt-3 block text-sm font-black text-ink">{label}</span>
                    {index < items.length - 1 && <span className="problem-flow-line" />}
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </Section>

        <Section id="journey" eyebrow="" title="">
          <div className="solution-journey-section">
            <div className="solution-hero-grid">
              <div>
                <p className="section-label text-saffron">{t.landingV2.howEyebrow}</p>
                <span className="mt-2 block h-1 w-9 rounded-full bg-neem" />
                <h2 className="mt-6 max-w-3xl text-[42px] font-black leading-[1.08] text-ink sm:text-[54px]">
                  {t.landingV2.howTitlePrefix}{" "}
                  <span className="bg-gradient-to-r from-saffron to-neem bg-clip-text text-transparent">{t.landingV2.howTitleAccent}</span>
                </h2>
                <p className="mt-6 max-w-3xl text-lg font-medium leading-8 text-slate-600">
                  {t.landingV2.howCopy}
                </p>
              </div>

              <div className="solution-curve" aria-hidden="true">
                <svg viewBox="0 0 560 170" role="presentation">
                  <defs>
                    <linearGradient id="solutionGradient" x1="76" x2="500" y1="112" y2="62" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="55%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                  <path className="solution-curve-glow" d="M92 112 C160 112 178 48 248 58 C322 69 334 126 406 112 C455 104 474 79 500 68" />
                  <path className="solution-curve-path" d="M92 112 C160 112 178 48 248 58 C322 69 334 126 406 112 C455 104 474 79 500 68" />
                  <circle className="solution-wave-dot" cx="248" cy="58" r="7" />
                  <circle className="solution-wave-dot" cx="406" cy="112" r="7" />
                  <g className="solution-wave-icon solution-wave-icon-mic" transform="translate(64 112)">
                    <circle r="24" />
                    <path d="M0-10v16m-7-9v8a7 7 0 0 0 14 0v-8m-18 12a11 11 0 0 0 22 0m-11 11v8m-8 0h16" />
                  </g>
                  <g className="solution-wave-icon solution-wave-icon-check" transform="translate(522 62)">
                    <circle r="24" />
                    <path d="M-11 0l7 7 16-17" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="solution-timeline-wrap">
              <div className="solution-timeline">
                {[
                  [Mic, "01", t.landingV2.steps.speak[0], t.landingV2.steps.speak[1], "blue"],
                  [Sparkles, "02", t.landingV2.steps.aiProfile[0], t.landingV2.steps.aiProfile[1], "blue"],
                  [IdCard, "03", t.landingV2.steps.identity[0], t.landingV2.steps.identity[1], "blue"],
                  [WalletCards, "04", t.landingV2.steps.income[0], t.landingV2.steps.income[1], "blue"],
                  [BriefcaseBusiness, "05", t.landingV2.steps.job[0], t.landingV2.steps.job[1], "blue"],
                  [MessageSquare, "06", t.landingV2.steps.coach[0], t.landingV2.steps.coach[1], "green"],
                  [CheckCircle2, "07", t.landingV2.steps.employment[0], t.landingV2.steps.employment[1], "green"]
                ].map(([Icon, number, title, copy, tone], index) => (
                  <article key={title} className={`solution-step-card solution-step-card-${tone}`}>
                    <span className={`solution-step-number solution-step-number-${tone}`}>{number}</span>
                    {index < 6 && <span className={`solution-step-connector solution-step-connector-${tone}`} />}
                    <span className={`solution-step-icon solution-step-icon-${tone}`}>
                      <Icon className="h-8 w-8" />
                    </span>
                    <h3 className="mt-7 text-xl font-black leading-7 text-ink">{title}</h3>
                    <span className={`mt-4 block h-1 w-8 rounded-full ${tone === "green" ? "bg-neem" : "bg-saffron"}`} />
                    <p className="mt-5 text-base font-medium leading-7 text-slate-600">{copy}</p>
                  </article>
                ))}
              </div>
            </div>

            {false && (
            <div className="solution-trust-strip">
              {[
                [ShieldCheck, "Verified & Secure", "Your data is protected with bank-level security.", "blue"],
                [UserRound, "Worker First", "Built for dignity, privacy and equal opportunity.", "green"],
                [Sparkles, "AI-assisted Form Filling", "Extract details from the worker story into profile fields.", "purple"],
                [TrendingUp, "Opportunity Focused", "Every step designed to unlock better jobs.", "amber"]
              ].map(([Icon, title, copy, tone]) => (
                <div key={title} className="solution-trust-item">
                  <span className={`solution-trust-icon solution-trust-icon-${tone}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block text-lg font-black text-ink">{title}</span>
                    <span className="mt-2 block text-sm font-medium leading-6 text-slate-600">{copy}</span>
                  </span>
                </div>
              ))}
            </div>
            )}
          </div>
        </Section>

        {false && (
        <>
        <Section id="asha-story" eyebrow={t.landing.storyEyebrow} title={t.landing.storyTitle}>
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="panel overflow-hidden p-6">
              <div className="rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 p-6 text-white shadow-lift">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-blue-100">{t.landing.storySubtitle}</p>
                <h3 className="mt-4 text-4xl font-black">{featuredJourneyProfile.name}</h3>
                <p className="mt-4 leading-7 text-blue-50">{featuredJourneySummary}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white/15 p-3">
                    <p className="text-2xl font-black">{featuredJourneyProfile.jobMatch}%</p>
                    <p className="text-xs font-bold text-blue-50">{t.bestMatch}</p>
                  </div>
                  <div className="rounded-lg bg-white/15 p-3">
                    <p className="text-2xl font-black">₹{Math.round(Number(featuredJourneyProfile.expectedWage || 0) / 1000)}k+</p>
                    <p className="text-xs font-bold text-blue-50">{t.fairWage}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {t.landing.storySteps.map(([title, copy], index) => (
                <div key={title} className="premium-card p-5">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-blue-50 text-sm font-black text-saffron">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="how" eyebrow={t.howEyebrow} title={t.howTitle} tone="dark">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {t.demoSteps.map((step, index) => (
              <DemoStep key={step[0]} step={step} active={index < 3} />
            ))}
          </div>
        </Section>

        <Section id="guided-demo" eyebrow={t.guidedDemo.eyebrow} title={t.guidedDemo.title}>
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="panel bg-ink p-6 text-white">
              <PlayCircle className="h-9 w-9 text-marigold" />
              <p className="mt-5 leading-7 text-slate-200">{t.guidedDemo.copy}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton icon={Mic} onClick={() => document.getElementById("onboarding").scrollIntoView()}>
                  {t.createIdentity}
                </ActionButton>
                <ActionButton icon={Users} variant="secondary" onClick={() => document.getElementById("employers").scrollIntoView()}>
                  {t.employerDashboard.title}
                </ActionButton>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {t.guidedDemo.steps.map(([number, title, copy]) => (
                <div key={number} className="premium-card p-4">
                  <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-black text-saffron">{number}</span>
                  <h3 className="mt-3 text-base font-black">{title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="onboarding" eyebrow={t.onboardingEyebrow} title={t.onboardingTitle} tone="warm">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="panel p-5 sm:p-7">
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-xl font-black">{t.workerDetails}</h3>
                  <p className="mt-1 text-sm text-slate-600">{t.sampleHelp}</p>
                </div>
                <ActionButton icon={Mic} variant={listening ? "dark" : "secondary"} onClick={startVoiceInput}>
                  {listening ? t.listening : t.speakDetails}
                </ActionButton>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="grid gap-2 sm:grid-cols-4">
                  {onboardingSteps.map(([step, label, Icon], index) => {
                    const active = onboardingStep === step;
                    const complete = hasGeneratedProfile || index < onboardingStepIndex;
                    return (
                      <button
                        key={step}
                        type="button"
                        className={`focus-ring rounded-xl border px-3 py-3 text-left transition ${active ? "border-blue-300 bg-blue-50 text-saffron" : complete ? "border-green-200 bg-green-50 text-neem" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
                        onClick={() => setOnboardingStep(step)}
                      >
                        <span className="flex items-center gap-2 text-sm font-black">
                          <Icon className="h-4 w-4" />
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-saffron to-neem transition-all" style={{ width: `${onboardingProgress}%` }} />
                </div>
              </div>

              {hasGeneratedProfile && (
                <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-neem shadow-sm">
                        <CheckCircle2 className="h-6 w-6" />
                      </span>
                      <div>
                        <h4 className="text-xl font-black text-ink">{isLocalizedLanguage ? "Digital Career Identity ready" : "Digital Career Identity ready"}</h4>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                          {isLocalizedLanguage ? "Profile, resume, matches and workspace tools are ready." : "Profile, resume, matches and workspace tools are ready."}
                        </p>
                      </div>
                    </div>
                    <ActionButton icon={ChevronRight} onClick={() => navigateTo(`/worker/${encodeURIComponent(resolvedWorkerId)}`)}>
                      {t.viewDashboard}
                    </ActionButton>
                  </div>
                </div>
              )}

              <div className="mt-5">
                {onboardingStep === "input" && (
                  <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-saffron">{isLocalizedLanguage ? "AI assisted" : "AI assisted"}</p>
                          <h4 className="mt-1 text-lg font-black text-ink">{t.smartInput.title}</h4>
                        </div>
                        <Sparkles className={`h-5 w-5 text-saffron ${smartInput ? "animate-pulse" : ""}`} />
                      </div>
                      <div className="mt-4">
                        <Field label={isLocalizedLanguage ? "Worker story" : "Worker story"} hint={t.smartInput.hint}>
                          <Textarea className="min-h-56" value={smartInput} onChange={(event) => setSmartInput(event.target.value)} placeholder={t.smartInput.placeholder} />
                        </Field>
                        <ActionButton icon={Sparkles} className="mt-3 w-full justify-center" variant="secondary" onClick={() => {
                          applySmartInput();
                          setOnboardingStep("extract");
                        }}>
                          {t.smartInput.extract}
                        </ActionButton>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isLocalizedLanguage ? "How this works" : "How this works"}</p>
                      <div className="mt-4 grid gap-3">
                        {extractionSteps.map((step, index) => (
                          <div key={step} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-xs font-black text-saffron shadow-sm">{index + 1}</span>
                            <p className="text-sm font-black text-ink">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {onboardingStep === "extract" && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isLocalizedLanguage ? "AI extracted details" : "AI extracted details"}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t.fields.workerName}><Input placeholder={t.placeholders.workerName} value={worker.name} onChange={(e) => updateWorker("name", e.target.value)} /></Field>
                      <Field label={t.fields.phone}><Input placeholder={t.placeholders.phone} value={worker.phone} onChange={(e) => updateWorker("phone", e.target.value)} /></Field>
                      <Field label={t.fields.city}><Select value={worker.city} onChange={(e) => updateWorker("city", e.target.value)}><option value="">{t.placeholders.city}</option>{cities.map((city) => <option key={city} value={city}>{cityLabel(city)}</option>)}</Select></Field>
                      <Field label={t.fields.primarySkill}><Select value={worker.skill} onChange={(e) => updateWorker("skill", e.target.value)}><option value="">{t.placeholders.primarySkill}</option>{jobRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</Select></Field>
                    </div>
                  </div>
                )}

                {onboardingStep === "review" && (
                  <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isLocalizedLanguage ? "Work preferences" : "Work preferences"}</p>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <Field label={t.fields.experience}><Input type="number" min="0" value={worker.experience} onChange={(e) => updateWorker("experience", e.target.value)} /></Field>
                        <Field label={t.fields.expectedWage}><Input placeholder={t.placeholders.expectedWage} type="number" min="0" value={worker.expectedWage} onChange={(e) => updateWorker("expectedWage", e.target.value)} /></Field>
                        <Field label={t.fields.languages}><Input value={worker.languages} onChange={(e) => updateWorker("languages", e.target.value)} /></Field>
                        <Field label={t.fields.availability}><Input value={worker.availability} onChange={(e) => updateWorker("availability", e.target.value)} /></Field>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="mb-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isLocalizedLanguage ? "Experience notes" : "Experience notes"}</p>
                      <Field label={t.fields.workDetails}><Textarea className="min-h-64" placeholder={t.placeholders.workDetails} value={workerTextValue(worker.notes)} onChange={(e) => updateWorker("notes", e.target.value)} /></Field>
                    </div>
                  </div>
                )}

                {onboardingStep === "generate" && (
                  <div className="grid gap-5 lg:grid-cols-[1fr_0.86fr]">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{isLocalizedLanguage ? "Review worker identity" : "Review worker identity"}</p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          [t.fields.workerName, worker.name || t.notAvailable],
                          [t.fields.phone, worker.phone || t.notAvailable],
                          [t.fields.city, worker.city ? cityLabel(worker.city) : t.notAvailable],
                          [t.fields.primarySkill, worker.skill ? roleLabel(worker.skill) : t.notAvailable],
                          [t.fields.experience, worker.experience ? `${worker.experience} ${t.common.years}` : t.notAvailable],
                          [t.fields.expectedWage, worker.expectedWage ? formatCurrency(worker.expectedWage) : t.notAvailable],
                          [t.fields.languages, worker.languages || t.notAvailable],
                          [t.fields.availability, worker.availability || t.notAvailable]
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
                            <p className="mt-1 text-sm font-black text-ink">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-5">
                      <Sparkles className="h-7 w-7 text-saffron" />
                      <h4 className="mt-4 text-2xl font-black text-ink">{isLocalizedLanguage ? "Ready to generate identity" : "Ready to generate identity"}</h4>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                        {isLocalizedLanguage ? "RozgaarAI will create the verified profile, resume, wage estimate and job matches." : "RozgaarAI will create the verified profile, resume, wage estimate and job matches."}
                      </p>
                      {!canReviewWorker && (
                        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
                          {isLocalizedLanguage ? "Name, phone, city and primary skill are required." : "Name, phone, city and primary skill are required."}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {onboardingStep === "open" && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
                    <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                      <div className="flex items-start gap-4">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-neem shadow-sm">
                          <CheckCircle2 className="h-8 w-8" />
                        </span>
                        <div>
                          <p className="text-sm font-black uppercase tracking-[0.16em] text-neem">{isLocalizedLanguage ? "Workspace ready" : "Workspace ready"}</p>
                          <h4 className="mt-2 text-3xl font-black text-ink">{isLocalizedLanguage ? "Open the worker workspace" : "Open the worker workspace"}</h4>
                          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-700">
                            {isLocalizedLanguage ? "Digital Career Identity, resume, wage estimate, job matches and tools are ready." : "Digital Career Identity, resume, wage estimate, job matches and tools are ready."}
                          </p>
                        </div>
                      </div>
                      <ActionButton icon={ChevronRight} onClick={() => navigateTo(`/worker/${encodeURIComponent(resolvedWorkerId)}`)}>
                        {t.viewDashboard}
                      </ActionButton>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  {onboardingStepIndex > 0 && (
                    <ActionButton icon={ChevronRight} variant="secondary" onClick={() => setOnboardingStep(onboardingSteps[onboardingStepIndex - 1][0])}>
                      {isLocalizedLanguage ? "Back" : "Back"}
                    </ActionButton>
                  )}
                  {onboardingStep !== "generate" && onboardingStep !== "open" ? (
                    <ActionButton icon={ChevronRight} onClick={() => setOnboardingStep(onboardingSteps[Math.min(onboardingStepIndex + 1, onboardingSteps.length - 1)][0])}>
                      {isLocalizedLanguage ? "Continue" : "Continue"}
                    </ActionButton>
                  ) : onboardingStep === "generate" ? (
                    <ActionButton icon={Sparkles} onClick={buildProfile} disabled={isGenerating || !canReviewWorker}>{isGenerating ? t.loadingProfile : t.createProfile}</ActionButton>
                  ) : (
                    <ActionButton icon={ChevronRight} onClick={() => navigateTo(`/worker/${encodeURIComponent(resolvedWorkerId)}`)}>
                      {t.viewDashboard}
                    </ActionButton>
                  )}
                </div>
                <ActionButton icon={ChevronRight} variant="secondary" onClick={() => hasGeneratedProfile ? navigateTo(`/worker/${encodeURIComponent(resolvedWorkerId)}`) : setErrorMessage(t.generateProfileFirst)}>
                  {t.viewDashboard}
                </ActionButton>
              </div>
              {(statusMessage || errorMessage) && (
                <div className={`mt-4 rounded-md px-3 py-2 text-sm font-bold ${errorMessage ? "bg-red-50 text-red-700" : "bg-blue-50 text-mitti"}`}>
                  {errorMessage || statusMessage}
                </div>
              )}
            </div>

            <aside className="panel p-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-saffron">{t.productFlow.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-black">{t.productFlow.title}</h3>
              <div className="mt-6 space-y-4">
                {t.productFlow.steps.map((step) => (
                  <div key={step[0]} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue-50 text-xs font-black text-saffron">{step[0]}</span>
                    <div>
                      <p className="font-bold">{step[1]}</p>
                      <p className="text-sm font-semibold text-mitti">{step[2]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </Section>

        <Section id="dashboard" eyebrow={t.dashboardEyebrow} title={t.dashboardTitle}>
          {(statusMessage || errorMessage) && (
            <div className={`mb-5 rounded-lg border px-4 py-3 text-sm font-black ${errorMessage ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-saffron"}`}>
              {errorMessage || statusMessage}
            </div>
          )}
          {isDemoMode && !account && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <p className="text-sm font-black leading-6 text-neem">{t.auth.demoCta}</p>
              <ActionButton icon={UserRound} className="mt-3 sm:mt-0" variant="secondary" onClick={() => openAuthModal({ mode: "signup", role: ROLES.WORKER, redirectTo: "/create-profile" })}>
                {t.auth.createAccount}
              </ActionButton>
            </div>
          )}
          {!hasGeneratedProfile ? (
            <div className="panel grid gap-5 p-6 sm:p-8 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-blue-50 text-saffron">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black">{t.emptyDashboard.title}</h3>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">{t.emptyDashboard.copy}</p>
                <ActionButton icon={Mic} className="mt-5" onClick={() => document.getElementById("onboarding").scrollIntoView()}>
                  {t.emptyDashboard.action}
                </ActionButton>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap gap-3">
                {dignityInsights.map(([label, value, Icon]) => (
                  <div key={label} className="premium-card flex w-full items-center gap-3 p-4 sm:w-[15.5rem]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-saffron">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-5 text-slate-600">{label}</p>
                      <p className="mt-1 text-xl font-black leading-tight text-ink">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-5 lg:grid-cols-3">
                <FeatureCard icon={IdCard} title={t.cards.skillCard}>
                  <p className="font-bold text-ink">{worker.name}</p>
                  <p className="mt-1">{roleLabel(worker.skill)} • {cityLabel(worker.city)}</p>
                  <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 font-black text-ink">{resolvedWorkerId}</p>
                </FeatureCard>

                <FeatureCard
                  icon={FileText}
                  title={t.shareProfile.title}
                  action={<ActionButton icon={Download} variant="secondary" onClick={() => window.open(publicProfileUrl, "_blank", "noopener,noreferrer")}>{t.shareProfile.open}</ActionButton>}
                >
                  <p className="font-bold text-ink">{worker.name} - {roleLabel(worker.skill)}</p>
                  <p className="mt-2 line-clamp-3">{localizedSummary}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button type="button" className="text-xs font-black text-saffron underline-offset-4 hover:underline" onClick={downloadResume}>
                      {t.careerIdentity.downloadResume}
                    </button>
                    <button type="button" className="text-xs font-black text-saffron underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60" onClick={downloadCertificatePdf} disabled={isExportingWorkerCard}>
                      {digitalWorkerCardDownloadLabel}
                    </button>
                  </div>
                </FeatureCard>

                <FeatureCard icon={BriefcaseBusiness} title={t.cards.jobMatches}>
                  {topMatch ? (
                    <>
                      <p className="font-bold text-ink">{jobTitleLabel(topMatch)}</p>
                      <p className="mt-1">{topMatch.employer || topMatch.employerName} • {cityLabel(topMatch.city)}</p>
                      <p className="mt-3 text-2xl font-black text-neem">{topMatch.score}% {t.match}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{t.safety} {topMatch.safetyScore}/100 • {statusLabel(topMatch.trust || topMatch.status)}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-slate-600">{t.emptyJobs}</p>
                  )}
                </FeatureCard>

                <FeatureCard icon={IndianRupee} title={t.cards.wageEstimate}>
                  {wage ? (
                    <>
                      <p className="text-3xl font-black text-ink">Rs {wage.fair.toLocaleString("en-IN")}</p>
                      <p className="mt-2">{t.range}: Rs {wage.low.toLocaleString("en-IN")} - Rs {wage.high.toLocaleString("en-IN")}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-slate-600">{t.emptyWage}</p>
                  )}
                </FeatureCard>

                <FeatureCard icon={ShieldAlert} title={t.cards.fakeJobSafety}>
                  <p className={`text-3xl font-black ${riskClass}`}>{riskLabel(risk.risk)}</p>
                  <p className="mt-2">{risk.flags[0] ? riskFlagLabel(risk.flags[0]) : t.noRiskSignals}</p>
                </FeatureCard>

                <FeatureCard
                  icon={Mic}
                  title={t.cards.interviewCoach}
                  action={<ActionButton icon={ChevronRight} variant="secondary" onClick={() => document.getElementById("coach")?.scrollIntoView({ behavior: "smooth", block: "start" })}>{t.startPractice}</ActionButton>}
                >
                  <p className="text-3xl font-black text-ink">{interviewReadiness}%</p>
                  <p className="mt-2">{t.interviewCoach.tagline}</p>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-saffron">{t.interviewCoach.readinessBoost}</p>
                </FeatureCard>

              </div>
            </>
          )}
        </Section>

        <Section id="income-passport" eyebrow={t.passport.eyebrow} title={t.passport.title} tone="warm">
          <div className="space-y-5">
            <div className="panel p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-saffron">
                    <WalletCards className="h-5 w-5" />
                  </span>
                  <p className="max-w-4xl text-sm font-medium leading-6 text-slate-600">{t.passport.copy}</p>
                </div>
                <ActionButton icon={Download} className="w-fit min-h-9 px-3 py-1.5 text-xs" variant="secondary" onClick={downloadWorkHistory}>
                  {t.passport.downloadHistory}
                </ActionButton>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  [t.passport.totalEarned, formatCurrency(incomeSummary.totalIncome)],
                  [t.passport.daysWorked, incomeSummary.totalDays],
                  [t.passport.averageWage, formatCurrency(incomeSummary.avgDaily)],
                  [t.passport.hoursWorked, incomeSummary.totalHours]
                ].map(([label, value]) => (
                  <div key={label} className="gradient-card-surface rounded-lg border border-slate-200 p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">{label}</p>
                    <p className="mt-2 text-2xl font-extrabold text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5 sm:p-6">
              <h3 className="text-lg font-extrabold text-ink">{t.passport.monthlyTimeline}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {monthlyIncomeTimeline.map(([month, amount]) => (
                  <div key={month} className="gradient-card-surface rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between text-sm font-extrabold text-slate-700">
                      <span>{month}</span>
                      <span className="text-ink">{formatCurrency(amount)}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-saffron to-neem" style={{ width: `${Math.min(100, (amount / Math.max(incomeSummary.totalIncome, 1)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-saffron">{t.passport.digitalProof}</p>
                  <h3 className="mt-2 text-xl font-extrabold text-ink">{t.passport.workTimeline}</h3>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                  <QRCodeCanvas value={passportVerificationUrl} size={72} level="H" marginSize={1} bgColor="#ffffff" fgColor="#0F172A" title={t.passport.qrVerification} />
                </div>
              </div>

              <div className="mt-5 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-y border-slate-200 bg-slate-50 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-600">
                      <th className="px-3 py-3">{t.passport.dates}</th>
                      <th className="px-3 py-3">{t.passport.employer}</th>
                      <th className="px-3 py-3">{t.passport.workType}</th>
                      <th className="px-3 py-3">{t.passport.hoursWorked}</th>
                      <th className="px-3 py-3">{t.passport.dailyWage}</th>
                      <th className="px-3 py-3">{t.passport.verificationStatus}</th>
                      <th className="px-3 py-3">{t.passport.digitalProof}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workRecords.map((record) => (
                      <tr key={record.id} className="text-slate-700">
                        <td className="px-3 py-3 font-semibold text-ink">{record.date}</td>
                        <td className="px-3 py-3 font-semibold">{record.employer}</td>
                        <td className="px-3 py-3">{record.jobType}</td>
                        <td className="px-3 py-3">{record.hoursWorked}h</td>
                        <td className="px-3 py-3 font-semibold text-ink">{formatCurrency(record.dailyWage)}</td>
                        <td className="px-3 py-3">
                          <span className="rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-extrabold text-neem">{record.status}</span>
                        </td>
                        <td className="px-3 py-3">
                          <button type="button" className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-extrabold text-ink hover:border-blue-300 hover:bg-slate-50" onClick={() => downloadEmploymentProof(record)}>
                            {t.passport.downloadProof}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 space-y-3 md:hidden">
                {workRecords.map((record) => (
                  <article key={record.id} className="gradient-card-surface rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">{record.date} • {record.location}</p>
                        <h4 className="mt-2 text-base font-extrabold text-ink">{record.jobType}</h4>
                        <p className="mt-1 text-sm font-semibold text-slate-600">{t.passport.employer}: {record.employer}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="rounded-md border border-slate-200 bg-white p-1">
                          <QRCodeCanvas value={`${passportVerificationUrl}?record=${encodeURIComponent(record.id)}`} size={58} level="H" marginSize={1} bgColor="#ffffff" fgColor="#0F172A" title={t.passport.qrVerification} />
                        </div>
                        <span className="w-fit rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-extrabold text-neem">{record.status}</span>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-700 sm:grid-cols-4">
                      <p>{record.hoursWorked}h</p>
                      <p>{t.passport.dailyWage}: {formatCurrency(record.dailyWage)}</p>
                      <p>{t.passport.received}: {formatCurrency(record.paymentReceived)}</p>
                      <p>{t.passport.pending}: {formatCurrency(record.paymentPending)}</p>
                    </div>
                    <ActionButton icon={Download} variant="secondary" className="mt-4 min-h-9 px-3 py-1.5 text-xs" onClick={() => downloadEmploymentProof(record)}>
                      {t.passport.downloadProof}
                    </ActionButton>
                  </article>
                ))}
              </div>
              <p className="mt-5 rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-sm font-semibold leading-6 text-slate-700">{t.passport.trustedSummary}</p>
            </div>
          </div>
        </Section>

        {hasGeneratedProfile && (
          <Section id="certificate" eyebrow={t.certificate.eyebrow} title={t.certificate.title} tone="warm">
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="panel relative overflow-hidden border-blue-100 bg-white p-6 shadow-lift sm:p-8">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-saffron via-neem to-blue-500" />
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img src={logoMark} alt={logoAlt} className="h-12 w-12 rounded-md object-contain" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t.certificate.verifiedProfile}</p>
                      <h3 className="mt-1 text-2xl font-black text-ink sm:text-3xl">{t.certificate.name}</h3>
                    </div>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs font-black text-neem">
                    <BadgeCheck className="h-4 w-4" />
                    {t.verified}
                  </span>
                </div>

                <div className="mt-7 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">{t.workerId}</p>
                    <p className="mt-2 break-all text-lg font-black text-ink">{resolvedWorkerId}</p>
                    <div className="mt-5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-green-500 text-xl font-black text-white">
                      {worker.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                    </div>
                    <h4 className="mt-4 text-2xl font-black text-ink">{worker.name}</h4>
                    <p className="mt-1 font-bold text-slate-600">{roleLabel(worker.skill)} • {cityLabel(worker.city)}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-mitti">{t.certificate.skills}</p>
                      <p className="mt-1 font-black">{roleLabel(worker.skill)}</p>
                      <p className="mt-1 text-sm font-bold text-slate-600">{secondarySkills.join(", ")}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-mitti">{t.certificate.workCategory}</p>
                      <p className="mt-1 font-black">{roleLabel(worker.skill)}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-mitti">{t.certificate.location}</p>
                      <p className="mt-1 font-black">{cityLabel(worker.city)}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-mitti">{t.fields.experience}</p>
                      <p className="mt-1 font-black">{worker.experience} {t.common.years}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-mitti">{t.certificate.availability}</p>
                      <p className="mt-1 font-black">{worker.availability}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-mitti">{t.certificate.issueDate}</p>
                      <p className="mt-1 font-black">{currentIssueDate}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-5 rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-sm font-bold leading-6 text-slate-700">{t.certificate.copy}</p>
              </div>
              <div className="panel p-6 sm:p-8">
                <Award className="h-10 w-10 text-saffron" />
                <h3 className="mt-4 text-2xl font-black">{t.certificate.downloadTitle}</h3>
                <p className="mt-3 leading-7 text-slate-600">{t.certificate.downloadCopy}</p>
                <ActionButton icon={Download} className="mt-5" onClick={downloadCertificatePdf} disabled={isExportingWorkerCard}>
                  {digitalWorkerCardDownloadLabel}
                </ActionButton>
              </div>
            </div>
          </Section>
        )}

        <Section id="profile" eyebrow={t.profileEyebrow} title={t.profileTitle}>
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="panel p-5 sm:p-6">
              <h3 className="text-2xl font-extrabold text-ink">{localizedHeadline}</h3>
              <p className="mt-4 max-w-3xl leading-7 text-slate-700">{localizedSummary}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(profile?.strengths || []).map((strength) => (
                  <div key={strength} className="gradient-card-surface rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="mb-2 h-4 w-4 text-neem" />
                    {localizedStrength(strength)}
                  </div>
                ))}
              </div>
            </div>
            <div className="panel p-5 sm:p-6">
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-ink">{t.trustSignals}</p>
              <div className="mt-5 space-y-3">
                {(profile?.verifiedSignals || []).map((signal) => (
                  <p key={signal} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <BadgeCheck className="h-4 w-4 shrink-0 text-neem" />
                    {localizedSignal(signal)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section id="jobs" eyebrow={t.jobsEyebrow} title={t.jobsTitle} tone="warm">
          <div className="grid gap-4">
            {matches.length === 0 && (
              <div className="panel p-6 text-sm font-bold text-slate-600 lg:col-span-3">{hasGeneratedProfile ? t.emptyJobs : t.generateProfileFirst}</div>
            )}
            {matches.slice(0, 3).map((job) => (
              <article key={job.id} className="panel p-5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-saffron">
                          <BriefcaseBusiness className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-xl font-extrabold leading-7 text-ink">{jobTitleLabel(job)}</h3>
                          <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">{job.employer || job.employerName} • {cityLabel(job.city)}</p>
                        </div>
                      </div>
                      <span className="inline-flex w-fit shrink-0 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-extrabold text-neem">{job.score}% {t.match}</span>
                    </div>

                    <div className="mt-5 rounded-lg border border-slate-200 bg-white/70 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-600">{t.cards.wageEstimate}</p>
                      <p className="mt-2 text-2xl font-extrabold leading-tight text-ink">
                        Rs {job.wageRange.min.toLocaleString("en-IN")}-{job.wageRange.max.toLocaleString("en-IN")}
                        <span className="text-sm font-bold text-slate-500">/{periodLabel(job.wageRange.period)}</span>
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {[
                        [t.employerType, employerTypeLabel(job)],
                        [t.requiredExperience, `${job.requiredExperience}+ ${t.common.years}`],
                        [t.language, job.languagePreference.map(languageLabel).join(", ")],
                        [t.safety, `${job.safetyScore}/100 • ${statusLabel(job.status)}`]
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2.5">
                          <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-600">{label}</p>
                          <p className="mt-1 text-sm font-bold leading-5 text-ink">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {jobChips(job).slice(0, 4).map((chip) => (
                        <span key={chip} className="rounded-md border border-slate-200 bg-white/80 px-2 py-1 text-xs font-bold text-slate-700">{chip}</span>
                      ))}
                    </div>
                  </div>

                  <div className="gradient-card-surface flex h-full flex-col rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink">{t.matchExplain.title}</p>
                      <span className="rounded-md border border-blue-200 bg-white px-2 py-1 text-xs font-extrabold text-saffron">{job.score}%</span>
                    </div>
                    <div className="mt-4 grid content-start gap-3 sm:grid-cols-2">
                      <ScoreBar label={t.matchExplain.skill} value={job.matchBreakdown?.skill || 0} />
                      <ScoreBar label={t.matchExplain.location} value={job.matchBreakdown?.location || 0} />
                      <ScoreBar label={t.matchExplain.wage} value={job.matchBreakdown?.wage || 0} />
                      <ScoreBar label={t.matchExplain.language} value={job.matchBreakdown?.language || 0} />
                      <ScoreBar label={t.matchExplain.experience} value={job.matchBreakdown?.experience || 0} />
                      <ScoreBar label={t.matchExplain.safety} value={job.matchBreakdown?.safety || 0} />
                    </div>
                    <div className="flex flex-1 items-center justify-center py-5">
                      <MatchRing value={job.score} label={t.bestMatch} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                      {job.matchReasons?.slice(0, 4).map((reason) => (
                        <span key={reason} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-extrabold text-slate-700">{t.matchExplain.reasons[reason] || reason}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="wages" eyebrow={t.wageEstimatorEyebrow} title={t.wageEstimatorTitle}>
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="panel p-6 sm:p-7">
              <Gauge className="h-9 w-9 text-saffron" />
              {wage ? (
                <>
                  <p className="mt-5 text-sm font-bold text-slate-500">{t.recommendedFairWage}</p>
                  <p className="mt-2 text-4xl font-black">Rs {wage.fair.toLocaleString("en-IN")}</p>
                  <p className="mt-2 text-slate-600">{t.range}: Rs {wage.low.toLocaleString("en-IN")} - Rs {wage.high.toLocaleString("en-IN")}</p>
                </>
              ) : (
                <>
                  <h3 className="mt-5 text-xl font-black">{t.emptyWageTitle}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{t.emptyWage}</p>
                </>
              )}
            </div>
            <div className="panel p-6 sm:p-7">
              <h3 className="flex items-center gap-2 text-xl font-black"><IndianRupee className="h-5 w-5 text-saffron" /> {t.wageFactors}</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {(wage?.factors || [t.generateProfileFirst]).map((factor) => <div key={factor} className="rounded-md border border-slate-200 px-3 py-3 text-sm font-bold">{wageFactorLabel(factor)}</div>)}
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="panel p-6 sm:p-7">
              <h3 className="text-xl font-black">{t.wageEntry.title}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">{t.wageEntry.copy}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label={t.wageEntry.employer}><Input value={wageEntry.employer} onChange={(event) => setWageEntry({ ...wageEntry, employer: event.target.value })} placeholder={t.wageEntry.employerPlaceholder} /></Field>
                <Field label={t.wageEntry.date}><Input type="date" value={wageEntry.date} onChange={(event) => setWageEntry({ ...wageEntry, date: event.target.value })} /></Field>
                <Field label={t.wageEntry.dailyWage}><Input type="number" min="0" value={wageEntry.dailyWage} onChange={(event) => setWageEntry({ ...wageEntry, dailyWage: event.target.value })} /></Field>
                <Field label={t.wageEntry.hours}><Input type="number" min="0" value={wageEntry.hoursWorked} onChange={(event) => setWageEntry({ ...wageEntry, hoursWorked: event.target.value })} /></Field>
                <Field label={t.wageEntry.received}><Input type="number" min="0" value={wageEntry.paymentReceived} onChange={(event) => setWageEntry({ ...wageEntry, paymentReceived: event.target.value })} /></Field>
                <Field label={t.wageEntry.pending}><Input type="number" min="0" value={wageEntry.paymentPending} onChange={(event) => setWageEntry({ ...wageEntry, paymentPending: event.target.value })} /></Field>
              </div>
              <ActionButton icon={WalletCards} className="mt-5" onClick={addWageEntry}>
                {t.wageEntry.add}
              </ActionButton>
            </div>
            <div className="panel p-6 sm:p-7">
              <h3 className="text-xl font-black">{t.wageEntry.history}</h3>
              {workRecords.length ? (
                <div className="mt-5 space-y-3">
                  {workRecords.slice(0, 4).map((record) => (
                    <div key={record.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-ink">{record.employer}</p>
                          <p className="mt-1 text-xs font-bold text-slate-500">{record.date} • {record.hoursWorked || 0}h</p>
                        </div>
                        <p className="font-black text-neem">{formatCurrency(record.dailyWage)}</p>
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-600">{t.wageEntry.received}: {formatCurrency(record.paymentReceived)} • {t.wageEntry.pending}: {formatCurrency(record.paymentPending)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-lg bg-blue-50 p-4 text-sm font-bold leading-6 text-slate-600">{t.wageEntry.empty}</p>
              )}
            </div>
          </div>
        </Section>

        <Section id="safety" eyebrow={t.safetyEyebrow} title={t.safetyTitle} tone="warm">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel p-6 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.fields.offerTitle}><Input value={offer.title} onChange={(e) => setOffer({ ...offer, title: e.target.value })} /></Field>
                <Field label={t.fields.employerName}><Input value={offer.employerName} onChange={(e) => setOffer({ ...offer, employerName: e.target.value })} /></Field>
                <Field label={t.fields.workAddress}><Input placeholder={t.placeholders.workAddress} value={offer.address} onChange={(e) => setOffer({ ...offer, address: e.target.value })} /></Field>
                <Field label={t.fields.contactDetails}><Input placeholder={t.placeholders.contactDetails} value={offer.contactDetails} onChange={(e) => setOffer({ ...offer, contactDetails: e.target.value })} /></Field>
                <Field label={t.fields.salary}><Input type="number" value={offer.salary} onChange={(e) => setOffer({ ...offer, salary: e.target.value })} /></Field>
                <Field label={t.fields.depositAmount}><Input type="number" value={offer.deposit} onChange={(e) => setOffer({ ...offer, deposit: e.target.value })} /></Field>
                <Field label={t.fields.documentsRequested}><Input value={offer.documents} onChange={(e) => setOffer({ ...offer, documents: e.target.value })} /></Field>
              </div>
              <div className="mt-4">
                <Field label={t.fields.offerMessage}><Textarea value={offer.description} onChange={(e) => setOffer({ ...offer, description: e.target.value })} /></Field>
              </div>
              <ActionButton icon={ShieldAlert} className="mt-5" onClick={checkOffer} disabled={isCheckingRisk}>{isCheckingRisk ? t.loadingSafety : t.checkRisk}</ActionButton>
            </div>
            <div className="panel p-6 sm:p-7">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-saffron">{t.riskLevel}</p>
              <p className={`mt-3 text-5xl font-black ${riskClass}`}>{riskLabel(risk.risk)}</p>
              <div className="mt-5 space-y-2">
                {(risk.flags.length ? risk.flags : [t.noRiskSignals]).map((flag) => (
                  <p key={flag} className="rounded-md bg-slate-50 px-3 py-2 text-sm font-bold">{riskFlagLabel(flag)}</p>
                ))}
              </div>
              <p className="mt-5 leading-7 text-slate-700">{isLocalizedLanguage && risk.flags.length ? t.riskAdvice : risk.advice}</p>
            </div>
          </div>
        </Section>

        <Section id="coach" eyebrow={t.coachEyebrow} title={t.coachTitle}>
          <div className="grid gap-5 xl:grid-cols-[0.75fr_1.2fr_0.85fr]">
            <aside className="panel p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-saffron to-neem text-sm font-black text-white">
                  {(worker.name || "RA").split(/\s+/).map((part) => part[0]).join("").slice(0, 2)}
                </span>
                <div>
                  <h3 className="text-lg font-black text-ink">{worker.name || t.emptyWorkerName}</h3>
                  <p className="text-sm font-semibold text-slate-600">{worker.skill ? roleLabel(worker.skill) : t.notAvailable} • {worker.city ? cityLabel(worker.city) : t.notAvailable}</p>
                </div>
              </div>
              <p className="mt-5 text-sm font-semibold leading-6 text-slate-700">{t.interviewCoach.tagline}</p>
              <div className="mt-5 grid gap-3">
                {[
                  [t.fields.experience, worker.experience ? `${worker.experience} ${t.common.years}` : t.notAvailable],
                  [t.fields.languages, worker.languages || t.notAvailable],
                  [t.fields.availability, worker.availability || t.notAvailable],
                  [t.readiness.interview, `${interviewReadiness}%`]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2.5">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-600">{label}</p>
                    <p className="mt-1 text-sm font-bold text-ink">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-sm font-bold leading-6 text-slate-700">
                {t.interviewCoach.readinessBoost}
              </p>
            </aside>

            <div className="panel p-5 sm:p-6">
              <div className="grid gap-3 md:grid-cols-3">
                {interviewModes.map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    className={`focus-ring rounded-lg border px-3 py-3 text-left text-sm font-black transition ${coachMode === mode ? "border-blue-300 bg-blue-50 text-saffron" : "border-slate-200 bg-white/80 text-ink hover:bg-white"}`}
                    onClick={() => {
                      setCoachMode(mode);
                      setCoach(null);
                      setAnswerFeedback(null);
                    }}
                  >
                    {label}
                    <span className="mt-1 block text-xs font-semibold text-slate-600">{t.interviewCoach.modeHelp[mode]}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[0.65fr_0.35fr]">
                <Field label={t.interviewCoach.practiceLanguage}>
                  <Select value={practiceLanguage} onChange={(event) => setPracticeLanguage(event.target.value)}>
                    {practiceLanguageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </Select>
                </Field>
                <ActionButton icon={Sparkles} className="self-end" onClick={runCoach} disabled={isCoaching}>
                  {isCoaching ? t.loadingCoach : t.startPractice}
                </ActionButton>
              </div>

              <div className="gradient-card-surface mt-5 rounded-xl border border-slate-200 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-black uppercase tracking-[0.12em] text-saffron">{t.interviewCoach.questionProgress.replace("{current}", coach ? currentQuestionIndex + 1 : 0).replace("{total}", coach?.questions?.length || 5)}</p>
                  <div className="flex gap-2">
                    <button type="button" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-black text-ink" onClick={skipQuestion} disabled={!coach}>{t.interviewCoach.skip}</button>
                    <button type="button" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-black text-ink" onClick={useSampleAnswer} disabled={!coach}>{t.interviewCoach.sampleAnswer}</button>
                  </div>
                </div>
                <h3 className="mt-4 text-2xl font-black leading-tight text-ink">{currentQuestion || t.practiceEmpty}</h3>
                <div className="mt-5">
                  <Field label={t.interviewAnswer.label} hint={t.interviewAnswer.hint}>
                    <Textarea value={interviewAnswer} onChange={(event) => setInterviewAnswer(event.target.value)} placeholder={t.interviewAnswer.placeholder} />
                  </Field>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <ActionButton icon={Mic} variant="secondary" onClick={startVoiceAnswer}>{t.interviewCoach.voiceAnswer}</ActionButton>
                    <ActionButton icon={MessageSquare} onClick={evaluateAnswer} disabled={!coach}>{t.interviewAnswer.score}</ActionButton>
                  </div>
                </div>
                {currentSampleAnswer && (
                  <details className="mt-4 rounded-lg border border-slate-200 bg-white/70 p-3">
                    <summary className="cursor-pointer text-sm font-black text-ink">{t.interviewCoach.viewSample}</summary>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{currentSampleAnswer}</p>
                  </details>
                )}
              </div>
            </div>

            <aside className="panel p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-saffron">{t.interviewCoach.overall}</p>
                  <p className="mt-1 text-4xl font-black text-ink">{interviewReadiness}%</p>
                </div>
                <MatchRing value={interviewReadiness} label={t.readiness.interview} />
              </div>
              {answerFeedback ? (
                <div className="mt-5">
                  <p className="text-sm font-bold leading-6 text-slate-700">{answerFeedback.message}</p>
                  <div className="mt-4 grid gap-3">
                    <ScoreBar label={t.interviewAnswer.clarity} value={answerFeedback.clarity} />
                    <ScoreBar label={t.interviewAnswer.confidence} value={answerFeedback.confidence} />
                    <ScoreBar label={t.interviewAnswer.relevance} value={answerFeedback.relevance} />
                    <ScoreBar label={t.interviewAnswer.communication} value={answerFeedback.communication} />
                    <ScoreBar label={t.interviewAnswer.completeness} value={answerFeedback.completeness} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {answerFeedback.tips.map((tip) => <span key={tip} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-700">{tip}</span>)}
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm font-semibold leading-6 text-slate-600">{coach?.feedback || t.emptyCoach}</p>
              )}
              <div className="mt-6 border-t border-slate-200 pt-5">
                <h4 className="text-sm font-black uppercase tracking-[0.12em] text-ink">{t.interviewCoach.history}</h4>
                <div className="mt-3 space-y-3">
                  {displayedPracticeHistory.length ? displayedPracticeHistory.map((item, index) => (
                    <div key={`${item.date}-${index}`} className="rounded-lg border border-slate-200 bg-white/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold text-slate-500">{item.date}</p>
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-black text-saffron">{item.score}%</span>
                      </div>
                      <p className="mt-2 text-sm font-bold leading-5 text-ink">{item.question}</p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{item.improvement}</p>
                    </div>
                  )) : (
                    <p className="rounded-lg border border-slate-200 bg-white/70 p-3 text-sm font-semibold text-slate-600">{t.interviewCoach.noHistory}</p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </Section>

        <Section id="stakeholders" eyebrow={t.stakeholdersEyebrow} title={t.stakeholdersTitle} tone="warm">
          <div className="grid gap-5 lg:grid-cols-3">
            {t.stakeholders.map(({ title, copy }, index) => {
              const Icon = stakeholderIcons[index];
              return (
              <article key={title} className="panel p-6">
                <Icon className="h-8 w-8 text-saffron" />
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-4 leading-7 text-slate-600">{copy}</p>
              </article>
            );})}
          </div>
        </Section>
        </>
        )}
        </>
        )}

        {routePath.startsWith("/employer") && routePath !== "/employer/onboarding" && (
        <div className="h-dvh overflow-hidden bg-slate-50 text-ink">
          <div className="grid h-dvh lg:grid-cols-[auto_1fr]">
            <aside className={`sticky top-0 hidden h-dvh border-r border-slate-200 bg-white lg:flex lg:flex-col ${isEmployerSidebarCollapsed ? "w-20" : "w-64"}`}>
              <div className="flex h-[72px] items-center justify-between border-b border-slate-200 px-4">
                <button type="button" className="flex min-w-0 items-center gap-3 font-black text-ink" onClick={() => navigateTo("/employer")}>
                  <img src={logoMark} alt={logoAlt} className="h-9 w-9 rounded-md object-contain" />
                  {!isEmployerSidebarCollapsed && (
                    <span className="min-w-0">
                      <span className="block truncate text-xl leading-5">RozgaarAI</span>
                      <span className="mt-0.5 block truncate text-xs font-bold text-slate-500">for Employers</span>
                    </span>
                  )}
                </button>
                <button type="button" className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-slate-50" onClick={() => setIsEmployerSidebarCollapsed((value) => !value)} aria-label="Toggle sidebar">
                  <PanelLeft className="h-4 w-4" />
                </button>
              </div>
              <nav className="space-y-1.5 p-4 pt-6" aria-label="Employer navigation">
                {employerNavItems.map(([Icon, label, href, key]) => (
                  <button
                    key={key}
                    type="button"
                    className={`focus-ring flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-black transition ${employerSection === key || (key === "workers" && selectedEmployerWorker) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-ink"}`}
                    onClick={() => navigateTo(href)}
                    title={label}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!isEmployerSidebarCollapsed && (
                      <>
                        <span>{label}</span>
                        {key === "messages" && <span className="ml-auto rounded-md bg-blue-100 px-2 py-0.5 text-xs font-black text-blue-700">3</span>}
                      </>
                    )}
                  </button>
                ))}
              </nav>
              {!isEmployerSidebarCollapsed && (
                <div className="mt-auto p-4">
                  {employerSection === "messages" ? (
                    <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-2 text-sm font-black text-violet-800"><Sparkles className="h-4 w-4" /> AI Hiring Assistant</p>
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700">BETA</span>
                      </div>
                      <p className="mt-3 text-xs font-bold leading-5 text-slate-600">Get AI-powered suggestions to hire the right talent.</p>
                      <div className="mt-3 grid gap-1.5">
                        {["Suggest top candidates", "Generate interview questions", "Draft message to worker", "Check availability"].map((label) => (
                          <button key={label} type="button" onClick={() => setStatusMessage(`${label} ready.`)} className="flex min-h-8 items-center gap-2 rounded-lg border border-violet-100 bg-white px-2 text-left text-[11px] font-black text-slate-600 hover:bg-violet-50">
                            <MessageSquare className="h-3.5 w-3.5 text-violet-700" /> {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                      <p className="text-sm font-black text-blue-700">{employerOverviewCopy.needHelp}</p>
                      <p className="mt-2 text-xs font-bold leading-5 text-slate-600">{employerOverviewCopy.supportCopy}</p>
                      <button type="button" onClick={() => navigateTo("/employer/messages")} className="focus-ring mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-xs font-black text-blue-700 hover:bg-blue-50">
                        <MessageSquare className="h-4 w-4" />
                        {employerOverviewCopy.contactSupport}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </aside>

            <div className="min-w-0 overflow-hidden">
              <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
                <div className="flex min-h-[72px] flex-wrap items-center gap-3 px-4 lg:flex-nowrap lg:px-7">
                  <div className="min-w-0 shrink-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-saffron">{employerCopy.title}</p>
                      {isEmployerDemoMode && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-black text-neem">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          {employerOverviewCopy.demoMode}
                        </span>
                      )}
                    </div>
                    {!(employerSection === "jobs" && !selectedEmployerJob && employerRouteId !== "new") && !["analytics", "company"].includes(employerSection) && (
                      <h1 className="truncate text-xl font-black text-ink">{selectedEmployerWorker ? selectedEmployerWorker.name : selectedEmployerJob ? selectedEmployerJob.title : employerNavItems.find(([, , , key]) => key === employerSection)?.[1] || employerCopy.overview}</h1>
                    )}
                    {employerSection === "workers" && !selectedEmployerWorker && (
                      <p className="mt-0.5 hidden text-xs font-bold text-slate-500 xl:block">AI-Powered search to find the right talent</p>
                    )}
                    {employerSection === "pipeline" && (
                      <p className="mt-0.5 hidden text-xs font-bold text-slate-500 xl:block">Manage and track your best talent across the hiring journey.</p>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <div className="relative hidden min-w-[220px] max-w-xl flex-1 md:block">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input value={employerSearch} onChange={(event) => setEmployerSearch(event.target.value)} placeholder={employerOverviewCopy.searchPlaceholder} className="min-h-10 rounded-lg pl-9" />
                      <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-black text-slate-500 xl:inline-flex">⌘K</span>
                    </div>
                    <button type="button" className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600"><Bell className="h-4 w-4" /></button>
                    <label className="relative hidden sm:block">
                      <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
                      <select value={lang} onChange={(event) => handleLanguageSelect(event.target.value)} className="focus-ring min-h-10 max-w-32 appearance-none rounded-lg border border-slate-200 bg-white px-9 text-sm font-black text-ink">
                        {languageConfig.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </label>
                    <button type="button" className="focus-ring hidden h-10 max-w-36 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-black text-ink xl:max-w-40 sm:flex" title={employerCompanyName}>
                      <Building2 className="h-4 w-4" />
                      <span className="truncate">{employerSection === "jobs" && !selectedEmployerJob ? "RozgaarAI Hub" : employerCompanyName}</span>
                    </button>
                    <button
                      type="button"
                      className={`focus-ring flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3 text-sm font-black transition ${isEmployerDemoMode ? "border-blue-200 bg-blue-50 text-saffron" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"}`}
                      onClick={isEmployerDemoMode ? exitEmployerDemoMode : enterEmployerDemoMode}
                    >
                      <PlayCircle className="h-4 w-4" />
                      {isEmployerDemoMode ? employerOverviewCopy.exitDemo : employerOverviewCopy.employerDemo}
                    </button>
                    <ActionButton icon={Plus} className="shrink-0 whitespace-nowrap px-3" onClick={() => navigateTo("/employer/jobs/new")}>{employerCopy.postJob}</ActionButton>
                  </div>
                </div>
                <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 lg:hidden" aria-label="Employer mobile navigation">
                  {employerNavItems.slice(0, 7).map(([Icon, label, href, key]) => (
                    <button key={key} type="button" className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black ${employerSection === key ? "bg-blue-50 text-saffron" : "text-slate-600"}`} onClick={() => navigateTo(href)}>
                      <Icon className="mx-auto h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </header>

              <main className={`${employerSection === "overview" || (employerSection === "workers" && !selectedEmployerWorker) || (employerSection === "jobs" && employerRouteId !== "new" && !selectedEmployerJob) || employerSection === "applicants" || employerSection === "pipeline" || employerSection === "messages" || employerSection === "analytics" || employerSection === "company" || employerSection === "settings" ? "h-[calc(100dvh-4.5rem)] w-full max-w-none overflow-y-auto p-4" : "mx-auto h-[calc(100dvh-4.5rem)] max-w-[1440px] overflow-y-auto p-4 lg:p-6"}`}>
                {(employerSection === "overview") && (
                  <EmployerOverviewDashboard
                    copy={employerOverviewCopy}
                    companyName={employerCompanyName}
                    hasJobs={hasEmployerJobs}
                    briefSummary={employerOverviewBriefSummary}
                    funnelStages={employerOverviewFunnelStages}
                    recommendedWorkers={employerOverviewRecommendedWorkers}
                    insights={employerOverviewInsights}
                    quickActions={employerOverviewQuickActions}
                    timelineEvents={employerOverviewTimelineEvents}
                    companySnapshot={employerOverviewCompanySnapshot}
                    onReviewMatches={reviewRecommendedEmployerWorkers}
                    onPostJob={() => navigateTo("/employer/jobs/new")}
                    onViewWorker={(workerIdToView) => navigateTo(`/employer/workers/${workerIdToView}`)}
                    onMessageWorker={(workerIdToMessage) => sendEmployerMessage(workerIdToMessage)}
                    onShortlistWorker={(workerIdToShortlist) => shortlistWorker(workerIdToShortlist)}
                    onViewInsights={() => navigateTo("/employer/analytics")}
                    onViewActivity={() => navigateTo("/employer/messages")}
                  />
                )}

                {employerSection === "workers" && !selectedEmployerWorker && (
                  <EmployerFindWorkersPage
                    workers={employerWorkers}
                    allWorkers={employerWorkerSource}
                    selectedCompareWorkers={selectedCompareWorkers}
                    employerSearch={employerSearch}
                    setEmployerSearch={setEmployerSearch}
                    employerSort={employerSort}
                    setEmployerSort={setEmployerSort}
                    employerFilters={employerFilters}
                    setEmployerFilters={setEmployerFilters}
                    employerWorkerFilters={employerWorkerFilters}
                    setEmployerWorkerFilters={setEmployerWorkerFilters}
                    employerSmartFilters={employerSmartFilters}
                    setEmployerSmartFilters={setEmployerSmartFilters}
                    clearFilters={resetEmployerWorkspaceFilters}
                    roleLabel={roleLabel}
                    cityLabel={cityLabel}
                    cities={cities}
                    jobRoles={jobRoles}
                    navigateTo={navigateTo}
                    shortlistWorker={shortlistWorker}
                    sendEmployerMessage={sendEmployerMessage}
                    updateDemoWorkerStage={updateDemoWorkerStage}
                    toggleCompareWorker={toggleCompareWorker}
                    isEmployerDemoMode={isEmployerDemoMode}
                  />
                )}

                {selectedEmployerWorker && (
                  <section className="grid gap-5 xl:grid-cols-[1fr_18rem]">
                    <div className="space-y-5">
                      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex gap-4">
                          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 p-0.5 text-lg font-black text-white shadow-[0_12px_26px_rgba(37,99,235,0.18)]">
                            {selectedEmployerWorker.photoUrl ? <img src={selectedEmployerWorker.photoUrl} alt="" className="h-full w-full rounded-[0.9rem] object-cover" /> : <span className={`grid h-full w-full place-items-center rounded-[0.9rem] bg-gradient-to-br ${selectedEmployerWorker.gradient || "from-blue-600 to-emerald-500"}`}>{selectedEmployerWorker.avatar}</span>}
                          </span>
                          <div>
                            <h2 className="text-2xl font-black text-ink">{selectedEmployerWorker.name}</h2>
                            <p className="mt-1 font-bold text-slate-600">{roleLabel(selectedEmployerWorker.skill)} • {cityLabel(selectedEmployerWorker.city)} • {selectedEmployerWorker.experience} {t.common.years}</p>
                            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{selectedEmployerWorker.notes}</p>
                          </div>
                        </div>
                      </div>
                      {["Digital Career Identity", "Resume Preview", workerCopy.incomePassport.title, "Experience Timeline", "Skills & Languages", "Job-match Explanation", "Verification Signals"].map((title) => (
                        <div key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <h3 className="font-black text-ink">{title}</h3>
                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{selectedEmployerWorker.name} is verified for {roleLabel(selectedEmployerWorker.skill)} work, speaks {selectedEmployerWorker.languages}, expects ₹{Number(selectedEmployerWorker.expectedWage).toLocaleString("en-IN")}/month, and has {selectedEmployerWorker.readiness}% employment readiness.</p>
                        </div>
                      ))}
                    </div>
                    <aside className="sticky top-24 h-fit space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      {[
                        [MessageSquare, "Contact Worker", () => sendEmployerMessage(selectedEmployerWorker.workerId)],
                        [CalendarDays, "Schedule Interview", () => { setInterviewForm({ ...interviewForm, candidateId: selectedEmployerWorker.workerId }); navigateTo("/employer/applicants"); }],
                        [Star, "Shortlist", () => shortlistWorker(selectedEmployerWorker.workerId)],
                        [Download, "Download Resume", () => downloadProfileResume(selectedEmployerWorker)],
                        [Globe2, workerCopy.documents.openPublicProfile, () => navigateTo(`/worker/${selectedEmployerWorker.workerId}`)],
                        [CheckCircle2, "Mark as Hired", () => setStatusMessage("Marked as hired.")],
                        [Archive, "Reject / Archive", () => setStatusMessage("Candidate archived.")]
                      ].filter(Boolean).map(([Icon, label, action]) => (
                        <button key={label} type="button" className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-black text-slate-700 hover:bg-blue-50" onClick={action}><Icon className="h-4 w-4" />{label}</button>
                      ))}
                    </aside>
                  </section>
                )}

                {employerSection === "jobs" && employerRouteId !== "new" && !selectedEmployerJob && (
                  <EmployerJobPostsPage
                    jobs={activeEmployerJobs}
                    applications={employerApplicationsWithContext}
                    roleLabel={roleLabel}
                    cityLabel={cityLabel}
                    navigateTo={navigateTo}
                    updateJobStatus={updateJobStatus}
                    duplicateJob={duplicateJob}
                    deleteJob={deleteJob}
                    isEmployerDemoMode={isEmployerDemoMode}
                  />
                )}

                {employerSection === "jobs" && employerRouteId === "new" && (
                  <form onSubmit={submitEmployerJob} className="grid gap-5 xl:grid-cols-[1fr_20rem]">
                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h2 className="text-xl font-black">{employerCopy.postJob}</h2>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <Field label="Job title"><Input value={employerJobForm.title} onChange={(e) => setEmployerJobForm({ ...employerJobForm, title: e.target.value })} /></Field>
                        <Field label="Skill/category"><Select value={employerJobForm.category} onChange={(e) => setEmployerJobForm({ ...employerJobForm, category: e.target.value })}><option value="">Select</option>{jobRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</Select></Field>
                        <Field label="City/location"><Select value={employerJobForm.city} onChange={(e) => setEmployerJobForm({ ...employerJobForm, city: e.target.value })}><option value="">Select</option>{cities.map((city) => <option key={city} value={city}>{cityLabel(city)}</option>)}</Select></Field>
                        <Field label="Employment type"><Input value={employerJobForm.employmentType} onChange={(e) => setEmployerJobForm({ ...employerJobForm, employmentType: e.target.value })} /></Field>
                        <Field label="Wage minimum"><Input type="number" value={employerJobForm.wageMin} onChange={(e) => setEmployerJobForm({ ...employerJobForm, wageMin: e.target.value })} /></Field>
                        <Field label="Wage maximum"><Input type="number" value={employerJobForm.wageMax} onChange={(e) => setEmployerJobForm({ ...employerJobForm, wageMax: e.target.value })} /></Field>
                        <Field label="Experience required"><Input type="number" value={employerJobForm.experienceRequired} onChange={(e) => setEmployerJobForm({ ...employerJobForm, experienceRequired: e.target.value })} /></Field>
                        <Field label="Openings"><Input type="number" value={employerJobForm.openings} onChange={(e) => setEmployerJobForm({ ...employerJobForm, openings: e.target.value })} /></Field>
                        <Field label="Languages preferred"><Input value={employerJobForm.languages} onChange={(e) => setEmployerJobForm({ ...employerJobForm, languages: e.target.value })} /></Field>
                        <Field label="Closing date"><Input type="date" value={employerJobForm.closingDate} onChange={(e) => setEmployerJobForm({ ...employerJobForm, closingDate: e.target.value })} /></Field>
                        <Field label="Work hours"><Input value={employerJobForm.workHours} onChange={(e) => setEmployerJobForm({ ...employerJobForm, workHours: e.target.value })} /></Field>
                        <Field label="Contact method"><Input value={employerJobForm.contactMethod} onChange={(e) => setEmployerJobForm({ ...employerJobForm, contactMethod: e.target.value })} /></Field>
                        <Field label={workerCopy.recommendations.benefits}><Textarea value={employerJobForm.benefits} onChange={(e) => setEmployerJobForm({ ...employerJobForm, benefits: e.target.value })} /></Field>
                        <Field label="Safety and document requirements"><Textarea value={employerJobForm.requirements} onChange={(e) => setEmployerJobForm({ ...employerJobForm, requirements: e.target.value })} /></Field>
                      </div>
                      <Field label="Job description"><Textarea value={employerJobForm.description} onChange={(e) => setEmployerJobForm({ ...employerJobForm, description: e.target.value })} /></Field>
                    </section>
                    <aside className="h-fit rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                      <h3 className="font-black">{employerCopy.assistant}</h3>
                      <p className="mt-2 text-sm font-semibold text-slate-600">Generate a clear, inclusive and safe job description from your entered details.</p>
                      <button type="button" onClick={generateEmployerJobDescription} className="mt-4 w-full rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-black text-saffron">Generate Job Description</button>
                      <button type="submit" className="mt-3 w-full rounded-lg bg-saffron px-4 py-2 text-sm font-black text-white">Publish Job</button>
                    </aside>
                  </form>
                )}

                {selectedEmployerJob && (
                  <section className="space-y-5">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-2xl font-black">{selectedEmployerJob.title}</h2><p className="mt-2 font-bold text-slate-600">{selectedEmployerJob.description}</p></div>
                    <div className="grid gap-4 md:grid-cols-4">{["Applicants", "Recommended Workers", "Pipeline", "Activity"].map((tab) => <button key={tab} className="rounded-xl border border-slate-200 bg-white p-4 text-left font-black shadow-sm">{tab}</button>)}</div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-black">AI recommended workers</h3><div className="mt-3 grid gap-3 lg:grid-cols-2">{employerWorkers.slice(0, 4).map((item) => <button key={item.workerId} className="rounded-lg border border-slate-200 p-3 text-left" onClick={() => navigateTo(`/employer/workers/${item.workerId}`)}><strong>{item.name}</strong><p>{item.jobMatch}% match • {roleLabel(item.skill)}</p></button>)}</div></div>
                  </section>
                )}

                {employerSection === "applicants" && (
                  <EmployerApplicantsPage
                    applications={employerApplicationsWithContext}
                    workers={employerWorkerSource}
                    jobs={activeEmployerJobs}
                    roleLabel={roleLabel}
                    cityLabel={cityLabel}
                    navigateTo={navigateTo}
                    updateApplicationStage={updateApplicationStage}
                    interviewForm={interviewForm}
                    setInterviewForm={setInterviewForm}
                    scheduleEmployerInterview={scheduleEmployerInterview}
                  />
                )}

                {employerSection === "pipeline" && (
                  <EmployerHiringPipelinePage
                    applications={employerApplicationsWithContext}
                    workers={employerWorkerSource}
                    stages={employerPipelineStages}
                    roleLabel={roleLabel}
                    cityLabel={cityLabel}
                    navigateTo={navigateTo}
                    updateApplicationStage={updateApplicationStage}
                    isEmployerDemoMode={isEmployerDemoMode}
                  />
                )}

                {employerSection === "messages" && (
                  <EmployerMessagesPage
                    messages={activeEmployerMessages}
                    workers={employerWorkerSource}
                    isEmployerDemoMode={isEmployerDemoMode}
                    navigateTo={navigateTo}
                    setStatusMessage={setStatusMessage}
                  />
                )}

                {employerSection === "analytics" && (
                  <EmployerAnalyticsPage
                    analytics={employerAnalytics}
                    applications={employerApplicationsWithContext}
                    jobs={activeEmployerJobs}
                    isEmployerDemoMode={isEmployerDemoMode}
                  />
                )}

                {employerSection === "company" && (
                  <EmployerCompanyProfilePage
                    account={account}
                    companyName={employerCompanyName}
                    analytics={employerAnalytics}
                    navigateTo={navigateTo}
                    isEmployerDemoMode={isEmployerDemoMode}
                    setStatusMessage={setStatusMessage}
                  />
                )}

                {employerSection === "settings" && (
                  <EmployerSettingsPage
                    account={account}
                    companyName={employerCompanyName}
                    jobs={activeEmployerJobs}
                    applications={employerApplicationsWithContext}
                    isEmployerDemoMode={isEmployerDemoMode}
                    lang={lang}
                    onLanguageChange={handleLanguageSelect}
                    setStatusMessage={setStatusMessage}
                  />
                )}
              </main>
            </div>
          </div>
        </div>
        )}

        {false && routePath === "/employer" && (
        <>
        <section className="border-b border-slate-200 bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-10 sm:py-14">
          <div className="section-shell">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">Employer Workspace</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-ink sm:text-5xl">
              Hire verified workers with confidence.
            </h1>
            <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600 sm:text-lg">
              Search, compare, verify and hire workers using trusted employment identities.
            </p>
          </div>
        </section>
        <Section
          id="employers"
          eyebrow={t.employerDashboard.eyebrow}
          title={isLocalizedLanguage ? "भरोसे के साथ सत्यापित श्रमिक नियुक्त करें।" : "Hire verified workers with confidence."}
        >
          <div className="mx-auto max-w-[1360px] space-y-5">
            <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
              <article className="premium-card p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <img src={logoMark} alt={logoAlt} className="h-11 w-11 rounded-md object-contain" />
                  <div>
                    <p className="text-sm font-black text-ink">RozgaarAI</p>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-saffron">{isLocalizedLanguage ? "Employer Intelligence" : "Employer Intelligence"}</p>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-700">
                  {isLocalizedLanguage
                    ? "Verified identity, work history, income records, AI matching और employment readiness के आधार पर सही श्रमिक खोजें।"
                    : "Search workers using verified identity, work history, income records, AI matching, and employment readiness."}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {[
                    [isLocalizedLanguage ? "Results" : "Results", employerWorkers.length],
                    [isLocalizedLanguage ? "Ready now" : "Ready now", employerWorkers.filter((item) => /available|immediate|तुरंत|उपलब्ध/i.test(item.availability || "")).length],
                    [isLocalizedLanguage ? "90%+ ready" : "90%+ ready", employerWorkers.filter((item) => Number(item.readiness || 0) >= 90).length]
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
                      <p className="mt-1 text-2xl font-black text-ink">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    isLocalizedLanguage ? "सत्यापित पहचान" : "Verified Identity",
                    isLocalizedLanguage ? "AI Match" : "AI Match",
                    isLocalizedLanguage ? "भरोसेमंद काम इतिहास" : "Trusted Work History"
                  ].map((benefit) => (
                    <span key={benefit} className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-black text-neem">
                      <CheckCircle2 className="h-4 w-4" />
                      {benefit}
                    </span>
                  ))}
                </div>
              </article>

              <article className="premium-card p-5 sm:p-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-saffron" />
                  <Input
                    value={employerSearch}
                    onChange={(event) => setEmployerSearch(event.target.value)}
                    placeholder={isLocalizedLanguage ? "कौशल, शहर, भाषा, मजदूरी या उपलब्धता खोजें..." : "Search by skill, city, language, wage, or availability..."}
                    className="min-h-14 rounded-xl border-slate-200 bg-white pl-12 text-base font-bold shadow-sm focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    [workerCopy.recommendations.verifiedOnly, isLocalizedLanguage ? workerCopy.recommendations.verifiedOnly : workerCopy.recommendations.verifiedOnly],
                    ["Immediate Joiners", isLocalizedLanguage ? "Immediate Joiners" : "Immediate Joiners"],
                    [workerCopy.recommendations.highestMatch, isLocalizedLanguage ? workerCopy.recommendations.highestMatch : workerCopy.recommendations.highestMatch],
                    ["Women Workers", isLocalizedLanguage ? "Women Workers" : "Women Workers"],
                    ["Nearby", isLocalizedLanguage ? "Nearby" : "Nearby"],
                    ["Interview Ready", isLocalizedLanguage ? "Interview Ready" : "Interview Ready"]
                  ].map(([key, label]) => {
                    const active = employerSmartFilters.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`focus-ring button-press rounded-full border px-3 py-2 text-xs font-black transition ${active ? "border-blue-200 bg-blue-50 text-saffron shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"}`}
                        onClick={() => setEmployerSmartFilters((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Field label={t.fields.primarySkill}>
                    <Select value={employerFilters.skill} onChange={(event) => setEmployerFilters({ ...employerFilters, skill: event.target.value })}>
                      <option value="">{t.employerDashboard.anySkill}</option>
                      {jobRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                    </Select>
                  </Field>
                  <Field label={t.fields.city}>
                    <Select value={employerFilters.city} onChange={(event) => setEmployerFilters({ ...employerFilters, city: event.target.value })}>
                      <option value="">{t.employerDashboard.anyCity}</option>
                      {cities.map((city) => <option key={city} value={city}>{cityLabel(city)}</option>)}
                    </Select>
                  </Field>
                  <Field label={t.fields.availability}>
                    <Input value={employerFilters.availability} onChange={(event) => setEmployerFilters({ ...employerFilters, availability: event.target.value })} placeholder={t.employerDashboard.availabilityPlaceholder} />
                  </Field>
                </div>
              </article>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <article className="premium-card flex items-start gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-blue-100 bg-blue-50 text-saffron">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-saffron">{isLocalizedLanguage ? "AI Recommendation" : "AI Recommendation"}</p>
                  <p className="mt-2 text-lg font-black leading-7 text-ink">
                    {isLocalizedLanguage
                      ? `हमें ${employerWorkers.length} सत्यापित श्रमिक मिले। ${employerWorkers.filter((item) => /available|immediate|तुरंत|उपलब्ध/i.test(item.availability || "")).length} तुरंत उपलब्ध हैं। ${employerWorkers.filter((item) => Number(item.readiness || 0) >= 90).length} की employment readiness 90% से अधिक है।`
                      : `We found ${employerWorkers.length} verified workers. ${employerWorkers.filter((item) => /available|immediate/i.test(item.availability || "")).length} are available immediately. ${employerWorkers.filter((item) => Number(item.readiness || 0) >= 90).length} have employment readiness above 90%.`}
                  </p>
                </div>
              </article>

              <article className="premium-card p-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    [Search, isLocalizedLanguage ? "Search" : "Search"],
                    [ShieldCheck, isLocalizedLanguage ? "Verify" : "Verify"],
                    [MessageSquare, isLocalizedLanguage ? "Contact" : "Contact"],
                    [CheckCircle2, isLocalizedLanguage ? "Hire" : "Hire"]
                  ].map(([Icon, label], index, items) => (
                    <div key={label} className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-saffron">
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-black text-ink">{label}</p>
                      {index < items.length - 1 && <ChevronRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-white text-slate-400 sm:block" />}
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {employerWorkers.map((item) => {
                const itemId = item.workerId || createWorkerId(item);
                const itemUrl = getWorkerPublicProfileUrl(itemId);
                const itemMatch = item.jobMatch || 90;
                return (
                  <article key={itemId} className="premium-card group grid gap-5 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lift lg:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 p-0.5 text-sm font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.16)]">
                          {item.photoUrl ? <img src={item.photoUrl} alt="" className="h-full w-full rounded-[0.9rem] object-cover" /> : <span className={`grid h-full w-full place-items-center rounded-[0.9rem] bg-gradient-to-br ${item.gradient || "from-blue-600 to-emerald-500"}`}>{item.avatar || item.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}</span>}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-black leading-6 text-ink">{item.name}</h3>
                          <p className="mt-1 text-sm font-bold text-slate-600">{roleLabel(item.skill)} • {cityLabel(item.city)}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-neem">{t.verified}</span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-bold text-slate-500">{t.fields.experience}</p>
                        <p className="mt-1 font-black text-ink">{item.experience} {t.common.years}</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-bold text-slate-500">{isLocalizedLanguage ? "अपेक्षित मजदूरी" : "Expected wage"}</p>
                        <p className="mt-1 font-black text-ink">₹{Number(item.expectedWage || 0).toLocaleString("en-IN")}/mo</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-bold text-slate-500">{t.demoMode.readiness}</p>
                        <p className="mt-1 font-black text-ink">{item.readiness || 88}%</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-bold text-slate-500">{t.fields.availability}</p>
                        <p className="mt-1 font-black text-ink">{item.availability}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-black">
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-saffron">{isLocalizedLanguage ? "Resume Ready" : "Resume Ready"}</span>
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-saffron">{isLocalizedLanguage ? "Income Passport" : "Income Passport"}</span>
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-saffron">{isLocalizedLanguage ? "Interview Ready" : "Interview Ready"}</span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-saffron">{isLocalizedLanguage ? "Verification signals" : "Verification signals"}</p>
                      <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600 sm:grid-cols-2">
                        {[
                          isLocalizedLanguage ? "Skill match" : "Skill match",
                          isLocalizedLanguage ? "Nearby location" : "Nearby location",
                          isLocalizedLanguage ? "Wage expectation aligned" : "Wage expectation aligned",
                          isLocalizedLanguage ? "Verified work history" : "Verified work history",
                          isLocalizedLanguage ? "Available immediately" : "Available immediately"
                        ].map((reason) => (
                          <span key={reason} className="inline-flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-neem" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 text-sm font-semibold text-slate-600">
                      {isLocalizedLanguage ? "भाषाएँ" : "Languages"}: <span className="font-black text-ink">{item.languages}</span>
                    </div>
                    </div>

                    <div className="flex flex-col justify-between gap-3 lg:w-44">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-center">
                        <p className="text-4xl font-black text-ink">{itemMatch}%</p>
                        <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-saffron">{t.match}</p>
                      </div>
                      <button type="button" className="button-press min-h-10 rounded-lg bg-saffron px-4 text-sm font-black text-white transition hover:bg-blue-700" onClick={() => openDemoWorker(item)}>
                        {isLocalizedLanguage ? "View Worker" : "View Worker"}
                      </button>
                      <button type="button" className="button-press min-h-10 rounded-lg border border-blue-200 bg-white px-4 text-sm font-black text-ink transition hover:bg-blue-50" onClick={() => shortlistWorker(itemId)}>
                        {shortlistedWorkers.includes(itemId) ? t.employerDashboard.shortlisted : t.employerDashboard.shortlist}
                      </button>
                      <details className="relative">
                        <summary className="button-press flex min-h-10 cursor-pointer list-none items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 transition hover:bg-slate-50">
                          {isLocalizedLanguage ? "More" : "More"}
                        </summary>
                        <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lift">
                          <a className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50" href={itemUrl}>{t.employerDashboard.qrProfile || "QR Profile"}</a>
                          <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50" onClick={() => downloadProfileResume(item)}>{t.careerIdentity.downloadResume}</button>
                          <a className="block rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50" href={`tel:${item.phone}`}>{t.employerDashboard.contact}</a>
                        </div>
                      </details>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="premium-card flex flex-wrap items-center justify-between gap-4 p-5">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">{isLocalizedLanguage ? "Trusted hiring ecosystem" : "Trusted hiring ecosystem"}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  isLocalizedLanguage ? "Used by NGOs" : "Used by NGOs",
                  isLocalizedLanguage ? "Housing Societies" : "Housing Societies",
                  isLocalizedLanguage ? "Facility Companies" : "Facility Companies",
                  isLocalizedLanguage ? "Verified Employers" : "Verified Employers"
                ].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </Section>
        </>
        )}

        {routePath === "/" && (
        <>
        {false && (
        <>
        <Section id="impact" eyebrow={t.impactEyebrow} title={t.impactTitle} tone="dark">
          <div className="mb-8 flex flex-col gap-4 rounded-lg border border-white/10 bg-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img src={logoMark} alt={logoAlt} className="h-11 w-11 rounded-md bg-white object-contain p-1" />
              <div>
                <p className="font-black text-white">RozgaarAI</p>
                <p className="text-sm font-bold text-slate-200">{t.landing.ngoTitle}</p>
              </div>
            </div>
            <span className="rounded-md bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-blue-100">{t.landing.ngoEyebrow}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.impactStats.map((stat) => <MetricCard key={stat.label} {...stat} />)}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {impactAnalytics.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/10 p-4">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-sm font-bold text-slate-200">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {t.impactCards.map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/10 p-5">
                <Landmark className="h-6 w-6 text-marigold" />
                <h3 className="mt-4 text-lg font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-200">{copy}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="testimonials" eyebrow={t.landing.testimonialsEyebrow} title={t.landing.testimonialsTitle}>
          <div className="grid gap-5 lg:grid-cols-3">
            {t.landing.testimonials.map(([name, role, quote]) => (
              <article key={name} className="premium-card p-6">
                <Quote className="h-7 w-7 text-saffron" />
                <p className="mt-5 leading-7 text-slate-700">{quote}</p>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <p className="font-black text-ink">{name}</p>
                  <p className="mt-1 text-sm font-bold text-slate-500">{role}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>
        </>
        )}

        <section id="employers" className="employer-preview-section" aria-labelledby="employer-preview-title">
          <div className="employer-preview-dots" aria-hidden="true" />
          <div className="employer-preview-copy">
            <p className="employer-preview-label">{t.employerPreview.label}</p>
            <span className="employer-preview-label-rule" />
            <h2 id="employer-preview-title" className="employer-preview-title">
              {t.employerPreview.titleLine1}
              <span>{t.employerPreview.titleLine2}</span>
            </h2>
            <p className="employer-preview-description">
              {t.employerPreview.description}
            </p>

            <div className="employer-trust-points">
              {[
                [ShieldCheck, t.employerPreview.trustPoints.identity[0], t.employerPreview.trustPoints.identity[1]],
                [BriefcaseBusiness, t.employerPreview.trustPoints.proof[0], t.employerPreview.trustPoints.proof[1]],
                [Sparkles, t.employerPreview.trustPoints.match[0], t.employerPreview.trustPoints.match[1]],
                [BadgeCheck, t.employerPreview.trustPoints.safe[0], t.employerPreview.trustPoints.safe[1]]
              ].map(([Icon, title, copy]) => (
                <div key={title} className="employer-trust-point">
                  <span className="employer-trust-icon"><Icon aria-hidden="true" /></span>
                  <p>{title}</p>
                  <span>{copy}</span>
                </div>
              ))}
            </div>

            <div className="employer-preview-actions">
              <button
                type="button"
                className="employer-preview-cta focus-ring button-press"
                onClick={() => navigateTo("/employer/onboarding")}
              >
                <BriefcaseBusiness aria-hidden="true" />
                {t.employerPreview.openDashboard}
                <ChevronRight aria-hidden="true" />
              </button>
              <button
                type="button"
                className="employer-preview-secondary focus-ring"
                onClick={() => {
                  navigateTo("/");
                  window.setTimeout(() => document.getElementById("employers")?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
                }}
              >
                <PlayCircle aria-hidden="true" />
                {t.employerPreview.exploreHow}
              </button>
            </div>
            <p className="employer-preview-note">
              <Sparkles className="h-4 w-4" />
              {t.employerPreview.note} <span aria-hidden="true">•</span> {t.employerPreview.noteSuffix}
            </p>
          </div>

          <div className="employer-identity-wrap">
            <article className="employer-identity-card" aria-label={t.employerPreview.cardLabel}>
              <header className="employer-card-header">
                <div className="employer-card-brand">
                  <img src={logoMark} alt="" />
                  <div>
                    <p>RozgaarAI</p>
                    <span>{t.employerPreview.digitalIdentity}</span>
                  </div>
                </div>
                <span className="employer-card-verified">
                  <ShieldCheck aria-hidden="true" /> {t.employerPreview.verified}
                </span>
              </header>

              <div className="employer-card-main">
                <div className="employer-card-profile">
                  <div className="employer-worker-heading">
                    <div className="employer-worker-photo">
                      <img src={rahulWorkerPhoto} alt="Rahul Kumar, electrician" />
                      <span><CheckCircle2 aria-hidden="true" /></span>
                    </div>
                    <div>
                      <h3>Rahul Kumar</h3>
                      <p>{t.employerPreview.electrician} <Sparkles aria-hidden="true" /></p>
                      <span><MapPin aria-hidden="true" /> {t.employerPreview.location}</span>
                    </div>
                  </div>

                  <div className="employer-card-pills">
                    {[
                      [ShieldCheck, t.employerPreview.pills[0]],
                      [BriefcaseBusiness, t.employerPreview.pills[1]],
                      [UserRound, t.employerPreview.pills[2]]
                    ].map(([Icon, label]) => (
                      <span key={label}><Icon aria-hidden="true" /> {label} <CheckCircle2 aria-hidden="true" /></span>
                    ))}
                  </div>

                  <dl className="employer-worker-details">
                    {[
                      [IdCard, t.employerPreview.details.workerId, "RZG-DEL-ELC-7895"],
                      [CalendarClock, t.employerPreview.details.experience, t.employerPreview.values.experience],
                      [BadgeCheck, t.employerPreview.details.primarySkill, t.employerPreview.values.primarySkill],
                      [Globe2, t.employerPreview.details.languages, t.employerPreview.values.language]
                    ].map(([Icon, label, value]) => (
                      <div key={label}>
                        <Icon aria-hidden="true" />
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                    <div className="employer-worker-availability">
                      <CheckCircle2 aria-hidden="true" />
                      <dt>{t.employerPreview.details.availability}</dt>
                      <dd>{t.employerPreview.values.availability}</dd>
                    </div>
                  </dl>
                </div>

                <div className="employer-qr-panel">
                  <span className="employer-qr-verified"><ShieldCheck aria-hidden="true" /> {t.employerPreview.verified}</span>
                  <div className="employer-qr-code">
                    <QRCodeCanvas value={getWorkerPublicProfileUrl("RZG-DEL-ELC-7895")} size={126} level="H" includeMargin />
                  </div>
                  <p>{t.employerPreview.scan}</p>
                  <div className="employer-qr-assurance">
                    <ShieldCheck aria-hidden="true" />
                    <span><strong>{t.employerPreview.verifiedBy}</strong>{t.employerPreview.digitalIdentity}</span>
                  </div>
                </div>
              </div>

              <footer className="employer-card-status">
                {[
                  [CalendarClock, t.employerPreview.status.issuedOn, "09 Jul 2026"],
                  [Gauge, t.employerPreview.status.score, "94%", "score"],
                  [FileText, t.employerPreview.status.resume, t.employerPreview.status.ready],
                  [WalletCards, t.employerPreview.status.income, t.employerPreview.status.active],
                  [CalendarClock, t.employerPreview.status.updated, "09 Jul 2026"]
                ].map(([Icon, label, value, accent]) => (
                  <div key={label} className={accent === "score" ? "is-score" : ""}>
                    <Icon aria-hidden="true" />
                    <span>{label}<strong>{value}</strong></span>
                  </div>
                ))}
              </footer>
            </article>
          </div>
        </section>

        {false && routePath === "/" && (
        <section className="bg-white py-12 sm:py-16">
          <div className="section-shell landing-container">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {[
                [Mic, isLocalizedLanguage ? "Voice AI" : "Voice AI"],
                [IdCard, isLocalizedLanguage ? "Verified Identity" : "Verified Identity"],
                [WalletCards, isLocalizedLanguage ? "Income Passport" : "Income Passport"],
                [FileText, isLocalizedLanguage ? "AI Resume" : "AI Resume"],
                [BriefcaseBusiness, isLocalizedLanguage ? "Job Matching" : "Job Matching"],
                [MessageSquare, isLocalizedLanguage ? "Interview Coach" : "Interview Coach"],
                [ShieldAlert, isLocalizedLanguage ? "Rights Protection" : "Rights Protection"]
              ].map(([Icon, label]) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-saffron">
                  <CheckCircle2 className="h-4 w-4 text-neem" />
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-emerald-600 p-6 text-white shadow-lift sm:p-10">
              <div className="absolute -right-20 top-8 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-emerald-200/10 blur-3xl" />
              <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div className="max-w-3xl">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100">{t.finalEyebrow}</p>
                  <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">
                    {isLocalizedLanguage ? "हर श्रमिक को भरोसेमंद डिजिटल पहचान मिलनी चाहिए।" : "Every Worker Deserves a Trusted Digital Identity."}
                  </h2>
                  <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-blue-50">
                    {isLocalizedLanguage
                      ? "RozgaarAI बोले गए अनुभव को सत्यापित पहचान, भरोसेमंद आय इतिहास, पेशेवर बायोडाटा, सुरक्षित नौकरी अवसर और अधिक रोजगार आत्मविश्वास में बदलता है।"
                      : "RozgaarAI converts spoken experience into a verified identity, trusted income history, professional resume, safer job opportunities, and greater employment confidence."}
                  </p>
                  <p className="mt-5 max-w-2xl text-sm font-bold leading-7 text-blue-100">
                    {isLocalizedLanguage
                      ? "भारत भर के श्रमिकों, नियोक्ताओं, NGO, housing societies और workforce development programs के लिए बनाया गया।"
                      : "Designed for workers, employers, NGOs, housing societies, and workforce development programs across India."}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <ActionButton icon={Mic} variant="secondary" onClick={() => navigateTo("/create-profile")}>
                      {isLocalizedLanguage ? "Start Voice Onboarding" : "Start Voice Onboarding"}
                    </ActionButton>
                    <ActionButton icon={PlayCircle} variant="dark" onClick={openDemoSection}>
                      {isLocalizedLanguage ? "Explore Demo Workers" : "Explore Demo Workers"}
                    </ActionButton>
                  </div>
                </div>

                <div className="group rounded-3xl border border-white/15 bg-white/10 p-4 shadow-lift backdrop-blur transition duration-300 hover:-translate-y-1">
                  <div className="rounded-2xl border border-white/15 bg-ink p-5 text-white shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={logoMark} alt={logoAlt} className="h-9 w-9 rounded-md bg-white object-contain p-1" />
                        <div>
                          <p className="text-sm font-black">RozgaarAI</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">{isLocalizedLanguage ? "Digital Career Identity" : "Digital Career Identity"}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-300/30 bg-green-400/10 px-3 py-1 text-xs font-black text-emerald-100">
                        <BadgeCheck className="h-4 w-4" />
                        {t.verified}
                      </span>
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                      <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-300 to-emerald-300 p-0.5 text-xl font-black shadow-[0_12px_30px_rgba(16,185,129,0.24)]">
                        {featuredJourneyProfile.photoUrl ? <img src={featuredJourneyProfile.photoUrl} alt="" className="h-full w-full rounded-full object-cover" /> : <span className="grid h-full w-full place-items-center rounded-full bg-white/10">{featuredJourneyProfile.avatar || featuredJourneyProfile.name.split(" ").map((part) => part[0]).join("")}</span>}
                      </span>
                      <div>
                        <p className="text-2xl font-black leading-tight">{featuredJourneyProfile.name}</p>
                        <p className="mt-1 text-sm font-bold text-blue-100">{roleLabel(featuredJourneyProfile.skill)} • {cityLabel(featuredJourneyProfile.city)}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-100">{isLocalizedLanguage ? "Worker ID" : "Worker ID"}</p>
                        <p className="mt-2 text-xl font-black">{featuredJourneyProfile.workerId}</p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-emerald-100">
                          <Gauge className="h-4 w-4" />
                          {featuredJourneyProfile.readiness}% {isLocalizedLanguage ? "Employment Readiness" : "Employment Readiness"}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white p-4 text-ink">
                        <div className="grid h-24 w-24 place-items-center rounded-xl border border-slate-200 bg-slate-50">
                          <QRCodeCanvas value={getWorkerPublicProfileUrl(featuredJourneyProfile.workerId)} size={76} level="H" includeMargin />
                        </div>
                        <p className="mt-2 text-center text-[10px] font-black text-slate-500">{isLocalizedLanguage ? "Scan verified profile" : "Scan verified profile"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}
        </>
        )}

        {routePath === "/" && (
          <NgoProductStory copy={t.insideProduct} logoMark={logoMark} onExploreNgo={openNgoDemoMode} />
        )}
        </>
        )}

        {showMarketingFooter && (
        <footer className="relative w-full overflow-hidden border-t border-blue-100 bg-gradient-to-br from-slate-50 via-blue-50/40 to-emerald-50/30">
          <div className="pointer-events-none absolute -right-20 top-12 h-64 w-64 rounded-full bg-blue-200/18 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true" />

          <div className="section-shell relative py-10 sm:py-12 lg:py-12">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.45fr_0.75fr_0.85fr_1.1fr] lg:gap-10 xl:gap-12">
                <div className="max-w-md">
                  <img src={logoFullTransparent} alt={logoAlt} className="h-12 w-auto max-w-[230px] object-contain" />
                  <p className="mt-1 text-xs font-bold text-slate-600">{t.footer.tagline}</p>
	                  <div className="mt-7 flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/75 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                    <HandHeart className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    Made for Build for Good
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                    <LockKeyhole className="h-3.5 w-3.5 text-blue-700" aria-hidden="true" />
                    Secure. Private. Worker First.
                  </span>
                  </div>
                </div>

                <nav aria-label="Platform footer navigation" className="grid content-start gap-2.5 text-sm font-medium text-slate-600">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-800">Platform</p>
                  {[
                    ["Workers", () => navigateTo("/workers")],
                    ["Employers", () => navigateTo("/employer")],
                    ["NGOs", () => navigateTo("/ngo/onboarding")],
                    ["How It Works", () => { navigateTo("/"); scrollToSection("how"); }],
                    ["Impact", () => { navigateTo("/"); scrollToSection("impact"); }]
                  ].map(([label, action]) => (
                    <button key={label} type="button" onClick={action} className="focus-ring w-fit rounded-lg py-0.5 text-left transition hover:-translate-y-0.5 hover:text-blue-700">
                      {label}
                    </button>
                  ))}
                </nav>

                <nav aria-label="Resources footer navigation" className="grid content-start gap-2.5 text-sm font-medium text-slate-600">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-800">Resources</p>
                  <button type="button" onClick={() => navigateTo("/docs")} className="focus-ring w-fit rounded-lg py-0.5 text-left transition hover:-translate-y-0.5 hover:text-blue-700">Documentation</button>
	                  <a href="https://github.com/Sam-wan30/RozgaarAI" target="_blank" rel="noreferrer" className="focus-ring inline-flex w-fit items-center gap-2 rounded-lg py-0.5 transition hover:-translate-y-0.5 hover:text-blue-700">GitHub <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
                  <button type="button" onClick={() => setStatusMessage("Help Center is not published in this demo build yet.")} className="focus-ring w-fit rounded-lg py-0.5 text-left transition hover:-translate-y-0.5 hover:text-blue-700">Help Center</button>
                  <a href="mailto:hello@rozgaarai.demo" className="focus-ring w-fit rounded-lg py-0.5 transition hover:-translate-y-0.5 hover:text-blue-700">Contact Us</a>
                </nav>

                <div className="max-w-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-800">Stay Connected</p>
                  <p className="mt-3 text-sm font-medium leading-6 text-slate-600">Get product updates and impact stories.</p>
                  <form onSubmit={handleFooterNewsletterSubmit} className="mt-4 flex rounded-2xl border border-blue-100 bg-white p-1 shadow-sm">
                    <label htmlFor="footer-email" className="sr-only">Email address</label>
                    <input
                      id="footer-email"
                      type="email"
                      value={footerEmail}
                      onChange={(event) => setFooterEmail(event.target.value)}
                      placeholder="Enter your email"
                      className="min-w-0 flex-1 rounded-xl bg-transparent px-3 text-sm font-medium text-ink outline-none placeholder:text-slate-400"
                    />
                    <button type="submit" className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 text-white shadow-[0_10px_20px_rgba(37,99,235,0.16)] transition hover:-translate-y-0.5" aria-label="Submit email for updates">
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </form>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {[
                      [Linkedin, "LinkedIn"],
                      [Github, "GitHub"],
                      [Youtube, "YouTube"],
                      [Instagram, "Instagram"]
                    ].map(([Icon, label]) => (
                      <button key={label} type="button" onClick={() => setStatusMessage(`${label} channel is not connected in this demo build yet.`)} className="focus-ring grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-white text-slate-700 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:text-blue-700 hover:shadow-md" aria-label={label}>
                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-9 flex flex-col gap-4 border-t border-blue-100/80 pt-5 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm font-medium text-slate-600">© 2026 RozgaarAI. Built for worker dignity and opportunity.</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
                  {["Privacy Policy", "Terms of Service", "Data Protection"].map((label, index) => (
                    <span key={label} className="inline-flex items-center gap-2">
                      {index > 0 && <span aria-hidden="true">·</span>}
                      <button type="button" onClick={() => setStatusMessage(`${label} is not published in this demo build yet.`)} className="focus-ring rounded-md transition hover:text-blue-700">
                        {label}
                      </button>
                    </span>
                  ))}
                  <span aria-hidden="true">·</span>
                  <span>{t.landing.license}</span>
                </div>
                <label className="block w-full shrink-0 sm:w-[190px]">
                  <span className="sr-only">{t.languageLabel}</span>
                  <select
                    value={lang}
                    onChange={(event) => handleLanguageSelect(event.target.value)}
                    className="focus-ring min-h-11 w-full rounded-2xl border border-white bg-white px-4 text-sm font-bold text-ink shadow-sm"
                    aria-label={t.languageLabel}
                  >
                    {languageConfig.map(({ code, label }) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>
          </div>
        </footer>
        )}
        </div>
        {workspaceShellActive && (
          <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] lg:hidden" aria-label="Worker mobile navigation">
            {[
              [Gauge, workerCopy.home, dashboardBasePath, "home"],
              [BriefcaseBusiness, workerCopy.jobs, `${dashboardBasePath}/jobs`, "jobs"],
              [WalletCards, workerCopy.income, `${dashboardBasePath}/income`, "income"],
              [IdCard, "Profile", `${dashboardBasePath}/identity`, "identity"],
              [Menu, "More", `${dashboardBasePath}/settings`, "settings"]
            ].map(([Icon, label, path, key]) => {
              const active = (key === "home" && routePath === dashboardBasePath) || workerDashboardRoute === key;
              return (
                <button key={key} type="button" className={`focus-ring flex min-h-12 flex-col items-center justify-center rounded-lg text-[11px] font-black ${active ? "bg-blue-50 text-saffron" : "text-slate-500"}`} onClick={() => navigateTo(path)}>
                  <Icon className="h-4 w-4" />
                  <span className="mt-1">{label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </main>
    </div>
  );
}
