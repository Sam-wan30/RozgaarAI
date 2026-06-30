import {
  BadgeCheck,
  Award,
  AudioLines,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Gauge,
  Globe2,
  HandHeart,
  IdCard,
  IndianRupee,
  Landmark,
  MapPin,
  MessageSquare,
  Mic,
  PlayCircle,
  Quote,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Volume2,
  WalletCards,
  UserRound
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import heroImage from "./assets/rozgaar-hero.png";
import logoFull from "./assets/brand/rozgaarai-logo-full.png";
import logoMark from "./assets/brand/rozgaarai-logo-mark.png";
import { DigitalCareerIdentityCard, PublicWorkerProfile } from "./components/DigitalCareerIdentityCard";
import { MetricCard } from "./components/MetricCard";
import { Section } from "./components/Section";
import {
  cities,
  demoProfiles,
  incomePassports,
  initialWorker,
  jobRoles
} from "./data/mockData";
import { getInitialLanguage, translateOption, translations } from "./i18n/translations";
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

const navIds = ["#demo", "/employer", "#trusted-impact", "#about"];
const sessionStorageKey = "rozgaarai-worker-session-v1";
const stakeholderIcons = [Users, Building2, HandHeart];
const featureIcons = [AudioLines, IdCard, FileText, Award, BriefcaseBusiness, IndianRupee, Mic, Search, Landmark];
const problemIcons = [FileText, IdCard, ShieldAlert, WalletCards, Globe2, MessageSquare];
const journeyIcons = [Mic, Sparkles, IdCard, FileText, BriefcaseBusiness, Gauge, CheckCircle2];
const currentIssueDate = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
const logoAlt = "RozgaarAI Logo";
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
    return JSON.parse(window.localStorage.getItem(sessionStorageKey) || "null");
  } catch {
    return null;
  }
}

function userProfilesStorageKey(account) {
  const userKey = account?.uid || account?.email || account?.id;
  return userKey ? `rozgaarai_user_profiles_${userKey}` : "";
}

function readUserProfiles(account) {
  if (typeof window === "undefined") return [];
  const key = userProfilesStorageKey(account);
  if (!key) return [];
  try {
    const profiles = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(profiles) ? profiles : [];
  } catch {
    return [];
  }
}

function writeUserProfiles(account, profiles) {
  if (typeof window === "undefined") return;
  const key = userProfilesStorageKey(account);
  if (!key) return;
  window.localStorage.setItem(key, JSON.stringify(profiles));
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

function Input(props) {
  return (
    <input
      {...props}
      className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-ink shadow-sm"
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="focus-ring w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-ink shadow-sm"
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className="focus-ring min-h-32 w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm text-ink shadow-sm"
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
      className={`focus-ring button-press inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold ${styles} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.6 12.23c0-.74-.07-1.45-.19-2.14H12v4.05h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.31 2.98-7.44Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.89 6.62-2.42l-3.23-2.51c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H3.08v2.59A9.99 9.99 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.41 13.9a6.01 6.01 0 0 1 0-3.8V7.51H3.08a10 10 0 0 0 0 8.98l3.33-2.59Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.78.5 3.82 1.49l2.87-2.87C16.95 2.98 14.7 2 12 2a9.99 9.99 0 0 0-8.92 5.51l3.33 2.59C7.2 7.74 9.4 5.98 12 5.98Z" />
    </svg>
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
  const [lang, setLang] = useState(getInitialLanguage);
  const [savedSession] = useState(readSavedSession);
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
  const [interviewAnswer, setInterviewAnswer] = useState("");
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [employerFilters, setEmployerFilters] = useState({ skill: "", city: "", availability: "" });
  const [employerSearch, setEmployerSearch] = useState("");
  const [employerSmartFilters, setEmployerSmartFilters] = useState(["Verified Only", "Highest Match"]);
  const [shortlistedWorkers, setShortlistedWorkers] = useState([]);
  const [listening, setListening] = useState(false);
  const [voiceAnswerStatus, setVoiceAnswerStatus] = useState("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingRisk, setIsCheckingRisk] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [authPrepStep, setAuthPrepStep] = useState(-1);
  const [hasGeneratedProfile, setHasGeneratedProfile] = useState(Boolean(savedSession?.hasGeneratedProfile));
  const [isDemoMode, setIsDemoMode] = useState(Boolean(savedSession?.isDemoMode));
  const [authMode, setAuthMode] = useState("");
  const [authLoading, setAuthLoading] = useState("");
  const [authError, setAuthError] = useState("");
  const [account, setAccount] = useState(savedSession?.account || null);
  const [userProfiles, setUserProfiles] = useState(() => readUserProfiles(savedSession?.account));
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "Worker" });
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cardExportStepIndex, setCardExportStepIndex] = useState(-1);
  const [routePath, setRoutePath] = useState(() => (typeof window === "undefined" ? "/" : window.location.pathname));
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState("overview");
  const [jobFilters, setJobFilters] = useState({ role: "", city: "", verifiedOnly: false, sort: "match" });
  const workerCardExportRef = useRef(null);
  const t = translations[lang];
  const roleLabel = (role) => translateOption("roleLabels", role, lang);
  const cityLabel = (city) => translateOption("cityLabels", city, lang);
  const periodLabel = (period) => period === "Daily" ? t.common.daily : t.common.monthly;
  const statusLabel = (status) => status === "Verified" ? t.verified : t.unverified;
  const riskLabel = (riskValue) => t.riskLabels[riskValue] || riskValue;
  const riskFlagLabel = (flag) => t.riskFlags[flag] || flag;
  const demoBadgeLabel = (badge) => t.demoMode.badges?.[badge] || badge;
  const wageFactorLabel = (factor) => t.factorLabels[factor] || factor;
  const jobTitleLabel = (job) => lang === "hi" ? `${roleLabel(job?.skill)} की नौकरी` : job?.title;
  const employerTypeLabel = (job) => lang === "hi" ? `${roleLabel(job?.skill)} सेवा` : job?.employerType;
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
  const jobChips = (job) => lang === "hi"
    ? [roleLabel(job.skill), statusLabel(job.status), `${job.requiredExperience}+ ${t.common.years}`]
    : [...job.requiredSkills.slice(0, 3), ...job.perks];
  const localizedHeadline = hasGeneratedProfile
    ? `${worker.experience}+ ${t.common.years} ${roleLabel(worker.skill)} ${cityLabel(worker.city)} ${t.common.in}`
    : t.emptyProfileTitle;
  const localizedSummary = hasGeneratedProfile
    ? (lang === "hi"
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

  const workerId = useMemo(() => createWorkerId(worker), [worker]);
  const sampleWorkers = useMemo(() => {
    const currentWorker = hasGeneratedProfile && worker.name && !demoProfiles.some((profileData) => profileData.name === worker.name)
      ? [worker]
      : [];
    const mergedProfiles = [...currentWorker, ...demoProfiles];
    return mergedProfiles.map((profileData) => ({
      ...profileData,
      availability: lang === "hi"
        ? profileData.availability.replace("Immediate", "तुरंत").replace("Full-time", "पूर्णकालिक")
        : profileData.availability.replace("तुरंत", "Immediate").replace("पूर्णकालिक", "Full-time")
    }));
  }, [worker, lang, hasGeneratedProfile]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasFirebaseAuthConfig) return undefined;
    return subscribeToFirebaseAuth(async (firebaseAccount) => {
      if (!firebaseAccount) return;
      const nextAccount = await database.signInOrCreateAccount({
        ...firebaseAccount,
        role: account?.role || "Worker"
      });
      setAccount(nextAccount);
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("rozgaarai-language", lang);
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;

    const otherLang = lang === "hi" ? "en" : "hi";
    setWorker((current) => {
      const next = {
        ...current,
        languages: current.languages === demoWorkerText[otherLang].languages ? demoWorkerText[lang].languages : current.languages,
        availability: current.availability === demoWorkerText[otherLang].availability ? demoWorkerText[lang].availability : current.availability,
        notes: current.notes === demoWorkerText[otherLang].notes ? demoWorkerText[lang].notes : current.notes
      };
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
    setOffer((current) => {
      const next = {
        ...current,
        title: current.title === demoOfferText[otherLang].title ? demoOfferText[lang].title : current.title,
        employerName: current.employerName === demoOfferText[otherLang].employerName ? demoOfferText[lang].employerName : current.employerName,
        contactDetails: current.contactDetails === demoOfferText[otherLang].contactDetails ? demoOfferText[lang].contactDetails : current.contactDetails,
        documents: current.documents === demoOfferText[otherLang].documents ? demoOfferText[lang].documents : current.documents,
        description: current.description === demoOfferText[otherLang].description ? demoOfferText[lang].description : current.description
      };
      return JSON.stringify(next) === JSON.stringify(current) ? current : next;
    });
  }, [lang]);

  useEffect(() => {
    const syncPath = () => setRoutePath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  useEffect(() => {
    if (routePath === "/login") setAuthMode("signin");
    if (routePath === "/signup") setAuthMode("signup");
    if (routePath === "/demo") {
      window.setTimeout(() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
    if (routePath === "/employer") {
      window.setTimeout(() => document.getElementById("employers")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
    if (routePath === "/dashboard") {
      window.setTimeout(() => document.getElementById("product-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
    if (routePath === "/create-profile") {
      window.setTimeout(() => document.getElementById("onboarding")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [routePath]);

  useEffect(() => {
    setUserProfiles(readUserProfiles(account));
  }, [account?.uid, account?.email, account?.id]);

  useEffect(() => {
    if (!account) return;
    writeUserProfiles(account, userProfiles);
  }, [account, userProfiles]);

  function navigateTo(path) {
    window.history.pushState({}, "", path);
    setRoutePath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDemoSection() {
    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
      setRoutePath("/");
      window.setTimeout(() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      return;
    }
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    window.localStorage.setItem(sessionStorageKey, JSON.stringify({
      worker,
      profile,
      resume,
      matches,
      wage,
      smartInput,
      wageEntries,
      practiceLanguage,
      hasGeneratedProfile,
      isDemoMode,
      account,
      userProfiles
    }));
  }, [worker, profile, resume, matches, wage, smartInput, wageEntries, practiceLanguage, hasGeneratedProfile, isDemoMode, account, userProfiles]);

  function updateWorker(key, value) {
    setWorker((current) => ({ ...current, [key]: value }));
    setIsDemoMode(false);
  }

  async function startSignupWorkspace() {
    const steps = [
      "Preparing your workspace...",
      "Enabling AI assistant...",
      "Creating secure profile...",
      "Workspace ready ✓"
    ];
    setAuthPrepStep(0);
    for (let index = 1; index < steps.length; index += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 420));
      setAuthPrepStep(index);
    }
    await new Promise((resolve) => window.setTimeout(resolve, 360));
    setAuthPrepStep(-1);
    setAuthMode("signup");
  }

  async function submitAuth(event) {
    event.preventDefault();
    if (!authForm.email || !authForm.password || (authMode === "signup" && !authForm.name)) {
      setAuthError(authMode === "signup"
        ? "Please add your name, email, password, and role to create a workspace."
        : "Please enter your email and password to sign in.");
      return;
    }
    const mode = authMode;
    setAuthError("");
    setAuthLoading(mode === "signup" ? "Creating workspace..." : "Signing in...");
    try {
      const nextAccount = await database.signInOrCreateAccount({
        ...authForm,
        name: authForm.name || authForm.email.split("@")[0],
        mode
      });
      completeAuth(nextAccount, mode === "signup" ? "Account created successfully" : "Welcome back");
    } catch {
      setAuthError("We could not sign you in. Please check your email and password.");
    } finally {
      setAuthLoading("");
    }
  }

  function completeAuth(nextAccount, message) {
    setAccount(nextAccount);
    setUserProfiles(readUserProfiles(nextAccount));
    setAuthMode("");
    setErrorMessage("");
    setAuthError("");
    setAuthForm({ name: "", email: "", password: "", role: "Worker" });
    if (isDemoMode) {
      setWorker(initialWorker);
      setProfile(null);
      setResume(emptyResume);
      setHasGeneratedProfile(false);
      setIsDemoMode(false);
      setMatches([]);
      setWageEntries([]);
      setWage(null);
      setSmartInput("");
    }
    setStatusMessage(message);
    if (hasGeneratedProfile && !isDemoMode) {
      database.saveWorkerProfile({ workerId: resolvedWorkerId, worker, profile, resume, wage, wageEntries });
    }
    navigateTo("/dashboard");
  }

  function saveAuthenticatedWorkerProfile({ workerData, profileData, resumeData, matchesData, wageData, wageEntriesData = [] }) {
    if (!account) return;
    const stableWorkerId = workerData.workerId || createWorkerId(workerData);
    const timestamp = new Date().toISOString();
    const record = {
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
      const existing = current.find((item) => item.workerId === stableWorkerId);
      const nextRecord = existing ? { ...existing, ...record, createdAt: existing.createdAt || timestamp } : record;
      const nextProfiles = [nextRecord, ...current.filter((item) => item.workerId !== stableWorkerId)];
      writeUserProfiles(account, nextProfiles);
      return nextProfiles;
    });
  }

  async function continueWithGoogle() {
    const mode = authMode || "signin";
    setAuthError("");
    setAuthLoading("Connecting to Google...");
    try {
      const googleAccount = await signInWithGoogleAuth(authForm.role || "Worker");
      if (!googleAccount) return;
      const nextAccount = await database.signInOrCreateAccount({
        ...googleAccount,
        role: authForm.role || googleAccount.role || "Worker",
        mode
      });
      completeAuth(nextAccount, mode === "signup" ? "Google account connected. Workspace created." : "Signed in with Google.");
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

  function handleAuthModalKeyDown(event) {
    if (event.key === "Escape") {
      setAuthMode("");
      setAuthError("");
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(event.currentTarget.querySelectorAll("button, input, select, textarea, a[href]"))
      .filter((element) => !element.disabled && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function signOut() {
    await signOutFirebaseAuth();
    await database.signOut();
    setAccount(null);
    setUserProfiles([]);
    setAuthMode("");
    setStatusMessage("");
    setErrorMessage("");
    setAuthError("");
    navigateTo("/");
    setStatusMessage("Signed out successfully.");
  }

  function openDemoWorker(profileData) {
    const demoWorker = { ...profileData };
    const nextProfile = {
      ...localProfile({ ...demoWorker, uiLanguage: lang }),
      workerId: profileData.workerId,
      readiness: profileData.readiness,
      interviewScore: profileData.interviewScore,
      summary: lang === "hi"
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
        question: lang === "hi" ? "पिछले काम का अनुभव बताएं।" : "Tell me about your previous work experience.",
        score: profileData.interviewScore,
        mode: "quick",
        improvement: lang === "hi" ? "एक मजबूत उदाहरण जोड़ें।" : "Add one stronger work example."
      },
      {
        date: "18 Jun 2026",
        question: lang === "hi" ? "काम के लिए आपकी उपलब्धता क्या है?" : "What is your availability for work?",
        score: Math.max(80, profileData.interviewScore - 6),
        mode: "confidence",
        improvement: lang === "hi" ? "समय और मजदूरी साफ़ बताएं।" : "State timing and wage clearly."
      }
    ]);
    setSmartInput(`${profileData.name}, ${profileData.skill}, ${profileData.city}, ${profileData.experience} years experience, expected wage Rs ${profileData.expectedWage}.`);
    setEmployerFilters({ skill: profileData.skill, city: profileData.city, availability: "" });
    setHasGeneratedProfile(true);
    setIsDemoMode(true);
    setErrorMessage("");
    setStatusMessage(t.demoMode.loaded.replace("{name}", profileData.name));
    setActiveWorkspaceTab("overview");
    navigateTo(`/worker/${encodeURIComponent(profileData.workerId)}`);
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

  function applySmartInput(input = smartInput) {
    const parsed = parseWorkerInput(input, { ...worker, uiLanguage: lang });
    setWorker((current) => ({ ...current, ...parsed, notes: parsed.notes || current.notes }));
    setStatusMessage(lang === "hi" ? "आवाज़/टेक्स्ट से जानकारी निकाल ली गई है।" : "Details extracted from voice/text input.");
  }

  async function buildProfile() {
    const parsed = parseWorkerInput(smartInput, { ...worker, uiLanguage: lang });
    const generatedWorkerBase = { ...worker, ...parsed, notes: parsed.notes || worker.notes };
    const generatedWorker = { ...generatedWorkerBase, workerId: generatedWorkerBase.workerId || createWorkerId(generatedWorkerBase) };
    const missingRequired = ["name", "city", "skill", "experience"].filter((key) => !String(generatedWorker[key] || "").trim());
    if (missingRequired.length) {
      setErrorMessage(t.missingProfileFields);
      setStatusMessage("");
      document.getElementById("onboarding")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setWorker(generatedWorker);
    const localizedWorker = { ...generatedWorker, uiLanguage: lang };
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
      saveAuthenticatedWorkerProfile({
        workerData: generatedWorker,
        profileData: nextProfile,
        resumeData: nextResume,
        matchesData: nextMatches,
        wageData: nextWage,
        wageEntriesData: []
      });
      setStatusMessage(t.profileSuccess);
      setActiveWorkspaceTab("overview");
      navigateTo(`/worker/${encodeURIComponent(generatedWorker.workerId)}`);
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
        setUserProfiles((profiles) => {
          const nextProfiles = profiles.map((item) => item.workerId === worker.workerId
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

  async function shortlistWorker(workerIdToSave) {
    setShortlistedWorkers((current) => current.includes(workerIdToSave) ? current : [...current, workerIdToSave]);
    await database.saveEmployerWorker(workerIdToSave);
    setStatusMessage(t.employerDashboard.saved);
  }

  async function startVoiceInput() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      alert(t.speechUnsupported);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
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
    const resumeIdentity = identityPageIdentity || careerIdentity;
    const generatedResume = routeDemoProfile ? localResume({ ...routeDemoProfile, uiLanguage: lang }) : (resume.sections?.length ? resume : localResume({ ...resumeWorker, uiLanguage: lang }));
    const sections = generatedResume.sections || [];
    const summary = sections[0]?.body || resumeIdentity.resumeSummary || "";
    const employment = sections.find((section) => /experience|employment|work|अनुभव|काम/i.test(section.heading))?.body || `${resumeWorker.experience} ${t.common.years} ${roleLabel(resumeWorker.skill)} experience in ${cityLabel(resumeWorker.city)}.`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=${encodeURIComponent(resumeIdentity.profileUrl || publicProfileUrl)}`;
    const skills = [roleLabel(resumeWorker.skill), ...(resumeIdentity.secondarySkills || secondarySkills || [])].slice(0, 6);
    const pdfWorkRecords = (identityPageRecords.length ? identityPageRecords.slice(0, 4) : [{
      id: "SELF-RECORDED",
      employer: `${cityLabel(resumeWorker.city)} verified work history`,
      jobType: roleLabel(resumeWorker.skill),
      date: currentIssueDate,
      location: cityLabel(resumeWorker.city),
      status: t.verified
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
            <p class="resume-role">${escapeHtml(roleLabel(resumeWorker.skill))} • ${escapeHtml(cityLabel(resumeWorker.city))}</p>
            <span class="badge">Verified RozgaarAI Worker</span>
          </div>
          <div class="qr">
            <img src="${qrUrl}" alt="Digital Career Identity QR" />
            <p>Scan to verify digital worker identity</p>
          </div>
        </header>
        <div class="resume-meta">
          <div class="meta"><span>Worker ID</span><strong>${escapeHtml(resumeIdentity.workerId || resolvedWorkerId)}</strong></div>
          <div class="meta"><span>Phone</span><strong>${escapeHtml(resumeWorker.phone || "Demo contact")}</strong></div>
          <div class="meta"><span>Languages</span><strong>${escapeHtml(resumeWorker.languages || t.notAvailable)}</strong></div>
          <div class="meta"><span>Availability</span><strong>${escapeHtml(resumeWorker.availability || t.notAvailable)}</strong></div>
        </div>
        <main class="resume-body">
          <section>
            <div class="section"><h2>Professional Summary</h2><p>${escapeHtml(summary)}</p></div>
            <div class="section"><h2>Work Experience</h2>${pdfWorkRecords.map((record) => `<div class="record"><strong>${escapeHtml(record.employer || record.worksite || t.notAvailable)}</strong><span>${escapeHtml(record.jobType || roleLabel(resumeWorker.skill))} • ${escapeHtml(record.date || currentIssueDate)} • ${escapeHtml(record.location || cityLabel(resumeWorker.city))}</span></div>`).join("")}</div>
            <div class="section"><h2>Verified Work Strengths</h2><ul>${(sections.slice(1, 4).map((section) => `<li>${escapeHtml(section.body)}</li>`).join("") || `<li>${escapeHtml(resumeIdentity.resumeSummary || summary)}</li>`)}</ul></div>
          </section>
          <aside>
            <div class="section"><h2>Skills</h2><div class="chips">${skills.map((skill) => `<span class="chip">${escapeHtml(skill)}</span>`).join("")}</div></div>
            <div class="section side-card"><h2>Languages</h2><p>${escapeHtml(resumeWorker.languages || t.notAvailable)}</p></div>
            <div class="section side-card"><h2>Digital Identity</h2><p>${escapeHtml(resumeIdentity.verificationStatus || t.verified)} • ${escapeHtml(resumeIdentity.skillConfidence || 96)}% skill confidence</p></div>
            <div class="section side-card"><h2>Preferred Work</h2><p>${escapeHtml(resumeWorker.availability || t.notAvailable)} • ${escapeHtml(formatCurrency(resumeWorker.expectedWage || 0))}/month expected wage</p></div>
          </aside>
        </main>
        <footer class="footer">
          <span>Generated by RozgaarAI AI Resume Builder</span>
          <span>Verified Digital Career Identity • ${escapeHtml(currentIssueDate)}</span>
        </footer>
      </article>
    `, !preview);
    setIsBuildingResume(false);
    setResumeBuildStepIndex(-1);
    setStatusMessage(t.resumeSuccess);
  }

  function downloadProfileResume(profileData) {
    const profileResume = localResume({ ...profileData, uiLanguage: lang });
    const content = [
      `${profileData.name} - ${roleLabel(profileData.skill)}`,
      `${t.workerId}: ${profileData.workerId || createWorkerId(profileData)}`,
      `${t.fields.city}: ${cityLabel(profileData.city)}`,
      `${t.fields.experience}: ${profileData.experience} ${t.common.years}`,
      `${t.fields.languages}: ${profileData.languages}`,
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

    const steps = lang === "hi"
      ? ["डिजिटल वर्कर कार्ड तैयार हो रहा है…", "सत्यापित पहचान कैप्चर हो रही है…", "डाउनलोड बनाया जा रहा है…", "डाउनलोड तैयार ✓"]
      : ["Preparing Digital Worker Card…", "Capturing verified identity…", "Generating download…", "Download ready ✓"];

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
      setErrorMessage(lang === "hi" ? "डिजिटल वर्कर कार्ड नहीं बन पाया। कृपया फिर कोशिश करें।" : "Could not generate worker card. Please try again.");
    }
  }

  function downloadWorkHistory() {
    const lines = [
      `RozgaarAI Work & Income Passport - ${worker.name}`,
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
      setRisk(await api.fakeCheck({ ...offer, uiLanguage: lang }));
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
      setErrorMessage(lang === "hi" ? "कृपया WhatsApp नौकरी संदेश paste करें।" : "Paste a WhatsApp job message first.");
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
      setRisk(localFakeCheck({ ...nextOffer, uiLanguage: lang }));
      setExtractedOffer(extraction);
      setStatusMessage(lang === "hi" ? "WhatsApp संदेश का AI विश्लेषण पूरा हुआ।" : "AI analysis completed and form populated.");
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
        const aiCoach = await api.interviewCoach({ ...worker, uiLanguage: lang, practiceLanguage, mode: coachMode });
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
        : "Your answer explains your experience well. Add one example of a past job to make it stronger."
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
    recognition.lang = practiceLanguage === "hi" ? "hi-IN" : practiceLanguage === "mr" ? "mr-IN" : practiceLanguage === "bn" ? "bn-IN" : practiceLanguage === "ta" ? "ta-IN" : practiceLanguage === "te" ? "te-IN" : "en-IN";
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
        : "Your answer explains your experience well. Add one example of a past job to make it stronger."
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
      question: lang === "hi" ? "पिछले काम का अनुभव बताएं।" : "Tell me about your previous work experience.",
      score: activeDemoProfile.interviewScore,
      mode: "quick",
      improvement: lang === "hi" ? "एक मजबूत उदाहरण जोड़ें।" : "Add one stronger work example."
    }
  ] : [];
  const riskClass = risk.risk === "High" ? "text-red-600" : risk.risk.includes("Medium") ? "text-marigold" : "text-neem";
  const riskBaseScore = risk.risk === "High" ? 88 : risk.risk === "Medium" ? 66 : risk.risk === "Low-Medium" ? 42 : 18;
  const riskScore = Math.min(100, riskBaseScore + Math.max(0, risk.flags.length - 2) * 4);
  const safetyConfidence = Math.min(98, 84 + risk.flags.length * 3);
  const detectedRiskFactors = risk.flags.length ? risk.flags : [t.noRiskSignals];
  const riskFactorTitle = (flag) => {
    const titles = {
      "Asks for registration money before joining": lang === "hi" ? "रजिस्ट्रेशन फीस मांगी गई" : "Registration fee detected",
      "No clear workplace address": lang === "hi" ? "काम की जगह का पता नहीं है" : "Workplace address unavailable",
      "Salary looks unrealistic for an informal role": lang === "hi" ? "वेतन असामान्य रूप से अधिक है" : "Unrealistic salary detected",
      "Unknown employer identity": lang === "hi" ? "नियोक्ता की पहचान स्पष्ट नहीं" : "Employer identity missing",
      "Asks for documents before interview": lang === "hi" ? "इंटरव्यू से पहले दस्तावेज़ मांगे गए" : "Original documents requested",
      "Poor contact details": lang === "hi" ? "संपर्क जानकारी कमजोर है" : "Poor contact details",
      [t.noRiskSignals]: t.noRiskSignals
    };
    return titles[flag] || riskFlagLabel(flag);
  };
  const riskFactorReason = (flag) => {
    const reasons = {
      "Asks for registration money before joining": lang === "hi" ? "जॉइनिंग से पहले पैसा मांगना फर्जी नौकरी का आम संकेत है।" : "Paying before joining is a common signal of fraudulent job offers.",
      "No clear workplace address": lang === "hi" ? "बिना पते के काम की जगह और सुरक्षा सत्यापित नहीं हो सकती।" : "Without an address, the worksite and safety conditions cannot be verified.",
      "Salary looks unrealistic for an informal role": lang === "hi" ? "बहुत अधिक वेतन अक्सर भरोसा जीतने के लिए इस्तेमाल किया जाता है।" : "Unusually high salary can be used to build false trust quickly.",
      "Unknown employer identity": lang === "hi" ? "नियोक्ता की पहचान साफ न हो तो भुगतान और सुरक्षा जोखिम बढ़ता है।" : "Unclear employer identity increases payment and safety risk.",
      "Asks for documents before interview": lang === "hi" ? "इंटरव्यू से पहले मूल दस्तावेज़ मांगना पहचान दुरुपयोग का जोखिम है।" : "Requesting documents before interview can lead to identity misuse.",
      "Poor contact details": lang === "hi" ? "कमजोर संपर्क जानकारी से नियोक्ता को बाद में पकड़ना मुश्किल हो सकता है।" : "Weak contact details make the employer difficult to trace later.",
      [t.noRiskSignals]: lang === "hi" ? "फिर भी नियोक्ता, पता और भुगतान शर्तें जुड़ने से पहले सत्यापित करें।" : "Still verify employer identity, address, and payment terms before joining."
    };
    return reasons[flag] || (lang === "hi" ? "AI ने इसे श्रमिक सुरक्षा से जुड़ा जोखिम संकेत माना।" : "AI identified this as a worker safety risk signal.");
  };
  const resolvedWorkerId = profile?.workerId || workerId;
  const secondarySkills = t.careerIdentity.secondarySkillSuggestions[worker.skill] || t.careerIdentity.secondarySkillSuggestions.default;
  const suggestedSkillUpgrade = t.careerIdentity.skillUpgradeSuggestions[worker.skill] || t.careerIdentity.skillUpgradeSuggestions.default;
  const fairWageText = wage ? `₹${wage.low.toLocaleString("en-IN")}-₹${wage.high.toLocaleString("en-IN")}` : t.notAvailable;
  const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
  const publicProfileUrl = `${publicAppUrl}/public/${encodeURIComponent(resolvedWorkerId)}`;
  const workRecords = wageEntries.length ? wageEntries : [];
  const incomeSummary = summarizeIncome(workRecords);
  const monthlyIncomeTimeline = Object.entries(incomeSummary.monthly);
  const passportVerificationUrl = `${publicAppUrl}/public/${encodeURIComponent(resolvedWorkerId)}#employment`;
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
    interviewReadiness: hasGeneratedProfile ? `${interviewReadiness}%` : t.notAvailable,
    statusBadges: activeDemoProfile?.badges?.map(demoBadgeLabel) || [
      t.careerIdentity.statusVerified,
      t.careerIdentity.statusAvailable,
      `${t.careerIdentity.statusInterview}${activeDemoProfile?.interviewScore ? ` ${activeDemoProfile.interviewScore}%` : ""}`,
      t.careerIdentity.statusResume,
      t.careerIdentity.statusSkillCard,
      t.careerIdentity.statusDocuments
    ]
  };
  const cardExportSteps = lang === "hi"
    ? ["डिजिटल वर्कर कार्ड तैयार हो रहा है…", "सत्यापित पहचान कैप्चर हो रही है…", "डाउनलोड बनाया जा रहा है…", "डाउनलोड तैयार ✓"]
    : ["Preparing Digital Worker Card…", "Capturing verified identity…", "Generating download…", "Download ready ✓"];
  const isExportingWorkerCard = cardExportStepIndex >= 0;
  const digitalWorkerCardDownloadLabel = isExportingWorkerCard
    ? cardExportSteps[Math.min(cardExportStepIndex, cardExportSteps.length - 1)]
    : t.certificate.downloadPdf;
  const hiddenDigitalWorkerCardExport = (
    <div className="digital-worker-card-export" aria-hidden="true">
      <div ref={workerCardExportRef} className="digital-worker-card-export-frame">
        <DigitalCareerIdentityCard identity={careerIdentity} labels={t.careerIdentity} variant="full" contentMode="identityOnly" />
      </div>
    </div>
  );
  const employerWorkers = sampleWorkers
    .filter((item) => !employerFilters.skill || item.skill === employerFilters.skill)
    .filter((item) => !employerFilters.city || item.city === employerFilters.city)
    .filter((item) => !employerFilters.availability || item.availability.toLowerCase().includes(employerFilters.availability.toLowerCase()))
    .filter((item) => {
      const query = employerSearch.trim().toLowerCase();
      if (!query) return true;
      return [item.name, item.skill, item.city, item.languages, item.availability, String(item.expectedWage || "")]
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
      return employerSmartFilters.includes("Highest Match")
        ? Number(b.jobMatch || 0) - Number(a.jobMatch || 0)
        : Number(b.readiness || 0) - Number(a.readiness || 0);
    });
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
  const heroStats = [
    ["1000+", lang === "hi" ? "डेमो श्रमिक" : "Demo Workers"],
    ["500+", lang === "hi" ? "नौकरी मिलान" : "Job Matches"],
    ["95%", lang === "hi" ? "बायोडाटा पूरे" : "Resume Completion"],
    ["50+", lang === "hi" ? "शहर" : "Cities"]
  ];
  const routeWorkerId = routePath.startsWith("/worker/") || routePath.startsWith("/public/") || routePath.startsWith("/profile/")
    ? decodeURIComponent(routePath.split("/").filter(Boolean).at(-1) || "")
    : "";
  const routeUserProfile = account && routeWorkerId ? userProfiles.find((item) => item.workerId === routeWorkerId) : null;
  const routeDemoProfile = !account ? demoProfiles.find((profileData) => profileData.workerId === routeWorkerId) : null;
  const routeDemoRecords = routeDemoProfile ? incomePassports[routeDemoProfile.name] || [] : [];
  const routeDemoSummary = summarizeIncome(routeDemoRecords);
  const routeDemoMatch = routeDemoProfile ? createDemoJob(routeDemoProfile) : null;
  const featuredJourneyProfile = routeDemoProfile || activeDemoProfile || demoProfiles[0];
  const featuredJourneySummary = lang === "hi"
    ? `${featuredJourneyProfile.name} ${cityLabel(featuredJourneyProfile.city)} के सत्यापित ${roleLabel(featuredJourneyProfile.skill)} हैं। उनके पास ${featuredJourneyProfile.experience} साल का अनुभव, दर्ज आय इतिहास और तैयार डिजिटल श्रमिक पहचान है।`
    : featuredJourneyProfile.notes || `${featuredJourneyProfile.name} is a verified ${featuredJourneyProfile.skill.toLowerCase()} from ${featuredJourneyProfile.city} with ${featuredJourneyProfile.experience} years of experience, recorded income history, and a ready digital worker identity.`;
  const routePublicIdentity = routeDemoProfile ? {
    name: routeDemoProfile.name,
    occupation: roleLabel(routeDemoProfile.skill),
    city: cityLabel(routeDemoProfile.city),
    workerId: routeDemoProfile.workerId,
    experience: `${routeDemoProfile.experience} ${t.common.years}`,
    primarySkill: roleLabel(routeDemoProfile.skill),
    secondarySkills: t.careerIdentity.secondarySkillSuggestions[routeDemoProfile.skill] || t.careerIdentity.secondarySkillSuggestions.default,
    languages: routeDemoProfile.languages,
    availability: routeDemoProfile.availability,
    preferredWorkType: t.careerIdentity.preferredWorkTypeValue,
    expectedWage: `₹${Number(routeDemoProfile.expectedWage).toLocaleString("en-IN")}/${t.common.monthly}`,
    fairWage: `₹${Math.round(routeDemoProfile.expectedWage * 0.9).toLocaleString("en-IN")}-₹${Math.round(routeDemoProfile.expectedWage * 1.12).toLocaleString("en-IN")}/${t.common.monthly}`,
    skillConfidence: routeDemoProfile.readiness,
    bestJobMatch: routeDemoProfile.jobMatch,
    matchingJobs: localMatches(routeDemoProfile).length,
    nearbyOpportunities: t.careerIdentity.nearbyOpportunitiesValue,
    suggestedSkillUpgrade: t.careerIdentity.skillUpgradeSuggestions[routeDemoProfile.skill] || t.careerIdentity.skillUpgradeSuggestions.default,
    profileUrl: `${publicAppUrl}/public/${encodeURIComponent(routeDemoProfile.workerId)}`,
    contact: routeDemoProfile.phone,
    resumeSummary: routeDemoProfile.notes,
    incomeThisMonth: formatCurrency(routeDemoSummary.totalIncome),
    employmentRecords: routeDemoRecords.length,
    interviewReadiness: `${routeDemoProfile.interviewScore}%`,
    statusBadges: routeDemoProfile.badges.map(demoBadgeLabel),
    topMatch: routeDemoMatch?.title
  } : careerIdentity;
  useEffect(() => {
    if (!routePath.startsWith("/worker/") || !routeUserProfile) return;
    if (worker.workerId === routeUserProfile.workerId) return;
    openUserWorkerProfile(routeUserProfile, { shouldNavigate: false });
  }, [routePath, routeUserProfile?.workerId]);

  const identityPageWorker = routeUserProfile?.worker || routeDemoProfile || worker;
  const identityPageIdentity = routePublicIdentity;
  const identityPageMatches = routeDemoProfile
    ? [routeDemoMatch, ...localMatches(routeDemoProfile)].filter(Boolean).sort((a, b) => b.score - a.score)
    : matches;
  const jobRoleOptions = [...new Set(identityPageMatches.map((job) => job.skill).filter(Boolean))];
  const jobCityOptions = [...new Set(identityPageMatches.map((job) => job.city).filter(Boolean))];
  const filteredJobMatches = identityPageMatches
    .filter((job) => !jobFilters.role || job.skill === jobFilters.role)
    .filter((job) => !jobFilters.city || job.city === jobFilters.city)
    .filter((job) => !jobFilters.verifiedOnly || job.status === "Verified")
    .sort((a, b) => {
      if (jobFilters.sort === "salary") return Number(b.wageRange?.max || 0) - Number(a.wageRange?.max || 0);
      if (jobFilters.sort === "nearest") return Number(b.matchBreakdown?.location || 0) - Number(a.matchBreakdown?.location || 0);
      return Number(b.score || 0) - Number(a.score || 0);
    });
  const identityPageRecords = routeDemoProfile ? routeDemoRecords : workRecords;
  const identityPageSummary = routeDemoProfile ? routeDemoSummary : incomeSummary;
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
  const displayResume = routeDemoProfile ? localResume({ ...routeDemoProfile, uiLanguage: lang }) : (resume.sections?.length ? resume : localResume({ ...identityPageWorker, uiLanguage: lang }));
  const displayResumeSections = displayResume.sections || [];
  const resumeSummary = displayResumeSections[0]?.body || identityPageIdentity.resumeSummary || "";
  const resumeSkills = [roleLabel(identityPageWorker.skill), ...(identityPageIdentity.secondarySkills || secondarySkills || [])].slice(0, 6);
  const resumeWorkRecords = identityPageRecords.length ? identityPageRecords.slice(0, 4) : [{
    id: "SELF-RECORDED",
    employer: `${cityLabel(identityPageWorker.city)} verified work history`,
    jobType: roleLabel(identityPageWorker.skill),
    date: currentIssueDate,
    location: cityLabel(identityPageWorker.city),
    status: t.verified
  }];
  const resumeSuggestions = ({
    Plumber: ["Add plumbing certification", "Mention emergency repairs", "Highlight water pump experience", "Include nearby verified work history"],
    Electrician: ["Add electrical safety certification", "Mention wiring fault diagnosis", "Highlight appliance repair experience", "Include nearby verified work history"],
    Driver: ["Add driving license details", "Mention route familiarity", "Highlight safety and punctuality", "Include verified trip history"],
    Tailor: ["Add machine stitching expertise", "Mention alteration experience", "Highlight measurement accuracy", "Include verified boutique work"],
    "Domestic Worker": ["Add household care references", "Mention cooking and cleaning strengths", "Highlight elderly care experience", "Include nearby verified work history"]
  }[identityPageWorker.skill] || [`Add ${roleLabel(identityPageWorker.skill).toLowerCase()} certification`, "Mention strongest work examples", "Highlight verified experience", "Include nearby verified work history"]);
  const workspaceTabs = [
    ["overview", lang === "hi" ? "ओवरव्यू" : "Overview"],
    ["income", lang === "hi" ? "आय पासपोर्ट" : "Income Passport"],
    ["jobs", lang === "hi" ? "नौकरी मिलान" : "Job Matches"],
    ["wages", lang === "hi" ? "मजदूरी ट्रैकर" : "Wage Tracker"],
    ["coach", lang === "hi" ? "साक्षात्कार" : "Interview Coach"],
    ["rights", lang === "hi" ? "अधिकार सहायता" : "Rights Help"],
    ["resume", lang === "hi" ? "बायोडाटा" : "Resume"]
  ];
  const identityPageTitle = lang === "hi" ? "डिजिटल करियर पहचान" : "Digital Career Identity";
  const identityPageSubtitle = lang === "hi"
    ? "भारत के असंगठित श्रमिकों के लिए सत्यापित रोजगार पहचान और आय पासपोर्ट।"
    : "Verified employment identity and income passport for India’s informal workforce.";
  const previewCards = [
    [WalletCards, lang === "hi" ? "Work & Income Passport" : "Work & Income Passport", lang === "hi" ? "सत्यापित काम इतिहास, आय टाइमलाइन और डाउनलोड योग्य प्रमाण देखें।" : "View verified work history, income timeline, and downloadable proof.", "income", lang === "hi" ? "पासपोर्ट खोलें" : "Open Passport"],
    [BriefcaseBusiness, lang === "hi" ? "Job Matches" : "Job Matches", lang === "hi" ? "कौशल, शहर, मजदूरी और सुरक्षा के आधार पर उपयुक्त काम देखें।" : "Explore verified opportunities matched by skill, city, wage, and safety.", "jobs", lang === "hi" ? "नौकरियाँ देखें" : "View Job Matches"],
    [Mic, lang === "hi" ? "Interview Coach" : "Interview Coach", lang === "hi" ? "भूमिका के हिसाब से सवालों का अभ्यास करें और जवाब बेहतर बनाएं।" : "Practice role-specific questions and improve interview confidence.", "coach", lang === "hi" ? "अभ्यास शुरू करें" : "Start Interview Practice"],
    [ShieldAlert, lang === "hi" ? "Rights & Safety" : "Rights & Safety", lang === "hi" ? "फर्जी नौकरी संकेत, दस्तावेज़ मांग और बकाया भुगतान जोखिम जांचें।" : "Check job risk signals, document requests, and pending payment concerns.", "rights", lang === "hi" ? "सहायता खोलें" : "Open Rights Help"]
  ];
  const dashboardStats = [
    [IdCard, lang === "hi" ? "Profiles Created" : "Profiles Created", userProfiles.length],
    [FileText, lang === "hi" ? "AI Resumes" : "AI Resumes", userProfiles.filter((item) => item.resume?.sections?.length).length],
    [WalletCards, lang === "hi" ? "Income Passports" : "Income Passports", userProfiles.filter((item) => item.wageEntries?.length).length],
    [BriefcaseBusiness, lang === "hi" ? "Job Matches" : "Job Matches", userProfiles.reduce((sum, item) => sum + Number(item.matches?.length || 0), 0)],
    [MessageSquare, lang === "hi" ? "Interview Sessions" : "Interview Sessions", practiceHistory.length],
    [ShieldAlert, lang === "hi" ? "Safety Checks" : "Safety Checks", 0]
  ];
  const checklistItems = [
    [lang === "hi" ? "Create Worker Identity" : "Create Worker Identity", userProfiles.length > 0],
    [lang === "hi" ? "Generate AI Resume" : "Generate AI Resume", userProfiles.some((item) => item.resume?.sections?.length)],
    [lang === "hi" ? "Download Digital Worker Card" : "Download Digital Worker Card", false],
    [lang === "hi" ? "Complete Income Passport" : "Complete Income Passport", userProfiles.some((item) => item.wageEntries?.length)],
    [lang === "hi" ? "Find Job Matches" : "Find Job Matches", userProfiles.some((item) => item.matches?.length)],
    [lang === "hi" ? "Practice Interview" : "Practice Interview", practiceHistory.length > 0],
    [lang === "hi" ? "Run Safety Check" : "Run Safety Check", false]
  ];
  const completedChecklistCount = checklistItems.filter(([, done]) => done).length;
  const dashboardProgress = Math.round((completedChecklistCount / checklistItems.length) * 100);
  const userActivity = [
    account && [lang === "hi" ? "Signed in with Google" : "Signed in with Google", account.lastLogin || account.createdAt || new Date().toISOString()],
    ...userProfiles.flatMap((item) => [
      [lang === "hi" ? "Created Worker Identity" : "Created Worker Identity", item.createdAt, item.worker?.name],
      item.resume?.sections?.length && [lang === "hi" ? "Generated Resume" : "Generated Resume", item.createdAt, item.worker?.name],
      item.wageEntries?.length && [lang === "hi" ? "Completed Income Passport" : "Completed Income Passport", item.updatedAt || item.createdAt, item.worker?.name]
    ])
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b[1] || 0) - new Date(a[1] || 0))
    .slice(0, 6);

  if (isBooting) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-6 text-center">
        <div className="brand-fade flex flex-col items-center">
          <img src={logoMark} alt={logoAlt} className="h-16 w-16 rounded-lg object-contain shadow-soft" />
          <p className="mt-4 text-2xl font-black text-ink">RozgaarAI</p>
          <p className="mt-2 text-sm font-bold text-slate-500">{lang === "hi" ? "लोड हो रहा है..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (routePath.startsWith("/public/") || routePath.startsWith("/profile/")) {
    return (
      <PublicWorkerProfile
        identity={routePublicIdentity}
        labels={t.careerIdentity}
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
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
          <div className="section-shell flex min-h-16 items-center justify-between gap-3 py-2">
            <button type="button" className="group flex items-center font-black text-ink" onClick={() => navigateTo("/")} aria-label="RozgaarAI home">
              <BrandLockup tagline={t.brandTagline} compact />
            </button>
            <div className="flex items-center gap-2">
              <select value={lang} onChange={(event) => setLang(event.target.value)} aria-label={t.languageLabel} className="focus-ring min-h-10 rounded-md border border-slate-200 bg-white px-2 text-sm font-bold text-ink">
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
              {account ? (
                <>
                  <ActionButton icon={Gauge} variant="secondary" className="hidden sm:inline-flex" onClick={() => navigateTo("/dashboard")}>
                    {lang === "hi" ? "Dashboard" : "Dashboard"}
                  </ActionButton>
                  <ActionButton icon={UserRound} variant="secondary" className="hidden sm:inline-flex" onClick={signOut}>
                    {lang === "hi" ? "Sign Out" : "Sign Out"}
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
                  {lang === "hi" ? "डेमो प्रोफ़ाइल लोड है" : "Demo profile loaded"}
                </p>
              )}
              <div className="mb-3 max-w-4xl">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">RozgaarAI</p>
                <h1 className="mt-1.5 text-3xl font-black leading-tight text-ink sm:text-[2.45rem]">{identityPageTitle}</h1>
                <p className="mt-1.5 text-base font-medium leading-7 text-slate-600">{identityPageSubtitle}</p>
              </div>
              <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.59fr)_minmax(0,0.41fr)]">
                <div className="self-start">
                  <div className="worker-hero-identity-card">
                    <DigitalCareerIdentityCard identity={identityPageIdentity} labels={t.careerIdentity} variant="full" contentMode="identityOnly" />
                  </div>
                </div>
                <div className="grid content-start gap-4">
                  <div className="panel p-4 sm:p-5 xl:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-slate-500">{t.demoMode.readiness}</p>
                        <p className="mt-1 text-4xl font-black text-ink">{identityPageReadiness}<span className="text-xl text-slate-400">/100</span></p>
                        <p className="mt-2 text-base font-semibold text-neem">{lang === "hi" ? "सत्यापित रोजगार के लिए तैयार" : "Ready for verified employment"}</p>
                      </div>
                      <MatchRing value={identityPageReadiness} label={t.demoMode.readiness} compact />
                    </div>
                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <p className="text-sm font-black text-ink">{lang === "hi" ? "मुख्य ताकतें" : "Top strengths"}</p>
                      <div className="mt-3 space-y-2">
                      {[
                        lang === "hi" ? "सत्यापित अनुभव" : "Verified experience",
                        lang === "hi" ? "मजबूत साक्षात्कार तैयारी" : "Strong interview readiness",
                        lang === "hi" ? "उचित मजदूरी अपेक्षा" : "Fair wage expectation"
                      ].map((strength) => (
                        <p key={strength} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-neem" />
                          {strength}
                        </p>
                      ))}
                      </div>
                    </div>
                  </div>

                  <div className="panel p-4 sm:p-5 xl:p-5">
                    <h2 className="text-lg font-black text-ink">{lang === "hi" ? "त्वरित कार्य" : "Quick Actions"}</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <ActionButton icon={Download} variant="secondary" onClick={downloadResume}>{t.careerIdentity.downloadResume}</ActionButton>
                      <ActionButton icon={IdCard} variant="secondary" onClick={downloadCertificatePdf} disabled={isExportingWorkerCard}>{digitalWorkerCardDownloadLabel}</ActionButton>
                      <ActionButton icon={Globe2} variant="secondary" onClick={() => window.open(identityPageIdentity.profileUrl, "_blank", "noopener,noreferrer")}>{t.shareProfile.open}</ActionButton>
                      <ActionButton icon={MessageSquare} variant="secondary" onClick={() => navigator.clipboard?.writeText(identityPageIdentity.profileUrl)}>{lang === "hi" ? "प्रोफ़ाइल शेयर करें" : "Share Profile"}</ActionButton>
                    </div>
                    <ActionButton icon={ChevronRight} className="mt-4 w-full" onClick={() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                      {lang === "hi" ? "श्रमिक सफर देखें" : "Explore Worker Journey"}
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-paper py-10">
            <div className="section-shell">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {previewCards.map(([Icon, title, copy, tab, action]) => (
                  <article key={title} className="premium-card flex min-h-56 flex-col p-6">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white text-saffron shadow-sm">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h2 className="mt-5 text-xl font-black text-ink">{title}</h2>
                    <p className="mt-3 flex-1 text-sm font-medium leading-6 text-slate-600">{copy}</p>
                    <button type="button" className="mt-4 text-sm font-black text-saffron underline-offset-4 hover:underline" onClick={() => {
                      setActiveWorkspaceTab(tab);
                      document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}>{action} →</button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="workspace" className="bg-white py-12">
            <div className="section-shell">
              <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "श्रमिक वर्कस्पेस" : "Worker Workspace"}</p>
                  <h2 className="mt-2 text-3xl font-black text-ink">{identityPageWorker.name}</h2>
                  <p className="mt-2 text-base font-semibold leading-7 text-slate-600">
                    {identityPageIdentity.primarySkill} • {identityPageIdentity.city}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                    {lang === "hi"
                      ? "रोजगार इतिहास, आय रिकॉर्ड, साक्षात्कार तैयारी, नौकरी मिलान और सत्यापित पहचान संभालें।"
                      : "Manage employment history, income records, interview readiness, job matches, and verified identity."}
                  </p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {workspaceTabs.map(([tab, label]) => (
                    <button
                      key={tab}
                      type="button"
                      className={`focus-ring min-h-11 shrink-0 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${activeWorkspaceTab === tab ? "border-blue-300 bg-blue-50 text-saffron shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                      onClick={() => setActiveWorkspaceTab(tab)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {activeWorkspaceTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid gap-5 lg:grid-cols-[1.25fr_2fr]">
                    <div className="premium-card flex items-center gap-4 p-6">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-saffron">
                        <IndianRupee className="h-7 w-7" />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-600">{t.passport.incomeThisMonth}</p>
                        <p className="mt-1 text-3xl font-black text-ink">{formatCurrency(identityPageSummary.totalIncome)}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{identityPageSummary.totalDays} {t.passport.recorded}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        [t.readiness.skill, `${identityPageIdentity.skillConfidence}%`, ShieldCheck, "default"],
                        [t.readiness.interview, `${interviewReadiness}%`, MessageSquare, "default"],
                        [t.bestMatch, identityPageMatches[0] ? `${identityPageMatches[0].score}%` : t.notAvailable, BriefcaseBusiness, "default"],
                        [t.passport.daysWorked, identityPageSummary.totalDays, CalendarClock, "support"],
                        [t.passport.averageWage, formatCurrency(identityPageSummary.avgDaily), Gauge, "support"],
                        [t.passport.paymentPending, formatCurrency(identityPageSummary.pending), WalletCards, "warning"]
                      ].map(([label, value, Icon, tone]) => (
                        <div key={label} className={`rounded-xl border p-4 shadow-sm ${tone === "warning" ? "border-amber-200 bg-amber-50/60" : "border-slate-200 bg-white"}`}>
                          <Icon className={`h-5 w-5 ${tone === "warning" ? "text-amber-600" : "text-saffron"}`} />
                          <p className="mt-3 text-sm font-bold text-slate-600">{label}</p>
                          <p className="mt-1 text-xl font-black text-ink">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel p-6 sm:p-7">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "AI इनसाइट्स" : "AI Insights"}</p>
                        <h3 className="mt-2 text-2xl font-black text-ink">{lang === "hi" ? "अगले बेहतर अवसर के लिए श्रमिक संकेत" : "Worker signals for the next better opportunity"}</h3>
                      </div>
                      <span className="w-fit rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-neem">{identityPageIdentity.skillConfidence}/100 {t.careerIdentity.aiSkillConfidence}</span>
                    </div>

                    <div className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                      <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <p className="text-sm font-bold text-slate-500">{t.careerIdentity.bestSuitableRole}</p>
                          <p className="mt-1 text-xl font-black text-ink">{identityPageIdentity.primarySkill}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <p className="text-sm font-bold text-slate-500">{lang === "hi" ? "प्रोफ़ाइल सारांश" : "Profile Summary"}</p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{identityPageIdentity.resumeSummary}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-4">
                          <p className="text-sm font-bold text-slate-500">{lang === "hi" ? "Recommended Next Skill" : "Recommended Next Skill"}</p>
                          <p className="mt-1 text-lg font-black text-ink">{identityPageIdentity.suggestedSkillUpgrade}</p>
                          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                            {lang === "hi" ? "यह कौशल अधिक सुरक्षित और बेहतर भुगतान वाले सत्यापित कामों तक पहुंच बढ़ा सकता है।" : "Why it helps: Can increase access to higher-paying verified jobs."}
                          </p>
                          <button type="button" className="mt-3 text-sm font-black text-saffron underline-offset-4 hover:underline">
                            {lang === "hi" ? "Skill Path देखें" : "View Skill Path"} →
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-ink">{lang === "hi" ? "नज़दीकी सत्यापित नौकरियाँ" : "Nearby Verified Jobs"}</h4>
                        <div className="mt-4 space-y-4">
                          {identityPageMatches.slice(0, 2).map((job) => (
                            <article key={job.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h5 className="font-black text-ink">{jobTitleLabel(job)}</h5>
                                  <p className="mt-1 text-sm font-semibold text-slate-600">{job.employer || job.employerName} • {cityLabel(job.city)}</p>
                                  <p className="mt-2 text-sm font-bold text-slate-700">
                                    Rs {job.wageRange?.min?.toLocaleString("en-IN")}-{job.wageRange?.max?.toLocaleString("en-IN")}/{periodLabel(job.wageRange?.period || "Monthly")}
                                  </p>
                                </div>
                                <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-black text-neem">{job.score}%</span>
                              </div>
                              <div className="mt-4 flex items-center justify-between gap-3">
                                <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-black text-neem">{t.verified}</span>
                                <button type="button" className="text-sm font-black text-saffron underline-offset-4 hover:underline">{lang === "hi" ? "Job देखें" : "View Job"} →</button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "income" && (
                <div className="space-y-6">
                  <div className="panel p-6 sm:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">
                          {lang === "hi" ? "काम और आय का डिजिटल प्रमाण" : "Digital proof of work and income"}
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-ink">
                          {lang === "hi" ? "काम और आय पासपोर्ट" : "Work & Income Passport"}
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                          {lang === "hi"
                            ? "सत्यापित रोजगार रिकॉर्ड, मजदूरी इतिहास और डाउनलोड योग्य काम प्रमाण।"
                            : "Verified employment records, wage history, and downloadable proof of work."}
                        </p>
                      </div>
                      <ActionButton icon={Download} variant="secondary" onClick={downloadWorkHistory}>
                        {t.passport.downloadHistory}
                      </ActionButton>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="panel p-6 sm:p-8">
                      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-500">
                            {lang === "hi" ? "कुल अर्जित आय" : "Total Income Earned"}
                          </p>
                          <p className="mt-2 text-5xl font-black leading-tight text-ink">
                            {formatCurrency(identityPageSummary.totalIncome)}
                          </p>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {[
                              [TrendingUp, lang === "hi" ? "आय वृद्धि" : "Income growth", lang === "hi" ? "+18% पिछले महीने से" : "+18% vs last month"],
                              [ShieldCheck, lang === "hi" ? "सत्यापित रिकॉर्ड" : "Verified work records", `${identityPageSummary.totalDays}`],
                              [CheckCircle2, lang === "hi" ? "भुगतान भरोसा" : "Payment reliability", `${identityPaymentCompletion}%`],
                              [Award, lang === "hi" ? "रोजगार विश्वसनीयता" : "Employment credibility", `${identityPageReadiness}/100`]
                            ].map(([Icon, label, value]) => (
                              <div key={label} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                                <Icon className="h-4 w-4 shrink-0 text-neem" />
                                <div className="min-w-0">
                                  <p className="truncate text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
                                  <p className="text-sm font-black text-ink">{value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {[
                              lang === "hi" ? "नियोक्ता साझा करने योग्य" : "Employer-shareable",
                              lang === "hi" ? "NGO सत्यापन योग्य" : "NGO-verifiable",
                              lang === "hi" ? "वित्तीय रिकॉर्ड तैयार" : "Finance-ready record"
                            ].map((indicator) => (
                              <span key={indicator} className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
                                {indicator}
                              </span>
                            ))}
                          </div>
                          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                            {lang === "hi"
                              ? "सत्यापित आय इतिहास जिसे नियोक्ताओं, NGO और वित्तीय भागीदारों के साथ साझा किया जा सकता है।"
                              : "Verified income history that can be shared with employers, NGOs, and financial partners."}
                          </p>
                        </div>
                        <div className="flex justify-start lg:justify-end">
                          <div className="relative grid h-32 w-32 place-items-center rounded-full bg-white">
                            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                              <circle cx="60" cy="60" r="48" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                              <circle
                                cx="60"
                                cy="60"
                                r="48"
                                fill="none"
                                stroke="url(#incomePaymentRing)"
                                strokeLinecap="round"
                                strokeWidth="10"
                                strokeDasharray={`${Math.min(identityPaymentCompletion, 100) * 3.016} 301.6`}
                              />
                              <defs>
                                <linearGradient id="incomePaymentRing" x1="0" x2="1" y1="0" y2="1">
                                  <stop offset="0%" stopColor="#2563EB" />
                                  <stop offset="100%" stopColor="#16A34A" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute text-center">
                              <p className="text-2xl font-black text-ink">{identityPaymentCompletion}%</p>
                              <p className="mt-1 max-w-20 text-[10px] font-black uppercase leading-3 tracking-[0.12em] text-slate-500">
                                {lang === "hi" ? "भुगतान भरोसा" : "Payment reliability"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {[
                        [CalendarClock, t.passport.daysWorked, identityPageSummary.totalDays, "default"],
                        [Gauge, t.passport.averageWage, formatCurrency(identityPageSummary.avgDaily), "default"],
                        [BriefcaseBusiness, t.passport.hoursWorked, identityPageSummary.totalHours, "default"],
                        [WalletCards, t.passport.paymentPending, formatCurrency(identityPageSummary.pending), "warning"]
                      ].map(([Icon, label, value, tone]) => (
                        <div key={label} className={`rounded-xl border p-4 shadow-sm ${tone === "warning" ? "border-amber-200 bg-amber-50/70" : "border-slate-200 bg-white"}`}>
                          <div className="flex items-center gap-3">
                            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border bg-white ${tone === "warning" ? "border-amber-200 text-amber-600" : "border-slate-200 text-saffron"}`}>
                              <Icon className="h-5 w-5" />
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-600">{label}</p>
                              <p className="mt-1 text-xl font-black text-ink">{value}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel p-6 sm:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-black text-ink">{identityPrimaryMonth}</p>
                        <p className="mt-1 text-2xl font-black text-ink">
                          {formatCurrency(identityPageSummary.totalIncome)} {lang === "hi" ? "अर्जित" : "earned"}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {identityPageSummary.totalDays} {lang === "hi" ? "काम दिन" : "work days"} • {lang === "hi" ? "भुगतान पूरा" : "Payment completion"}: {identityPaymentCompletion}%
                        </p>
                      </div>
                      <div className="w-full lg:max-w-md">
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-saffron to-neem" style={{ width: `${identityPaymentCompletion}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="panel p-6 sm:p-7">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">
                          {lang === "hi" ? "सत्यापित काम रिकॉर्ड" : "Verified Work Records"}
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-ink">
                          {lang === "hi" ? "आधिकारिक रोजगार लेजर" : "Official employment ledger"}
                        </h3>
                      </div>
                      <p className="text-sm font-semibold text-slate-500">
                        {identityPageRecords.length} {lang === "hi" ? "रिकॉर्ड" : "records"}
                      </p>
                    </div>

                    <div className="mt-5 space-y-3">
                      {identityPageRecords.slice(0, 9).map((record) => {
                        const isPending = Number(record.paymentPending || 0) > 0;
                        return (
                          <article key={record.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="pointer-events-none absolute -right-12 -top-16 h-32 w-32 rounded-full bg-blue-500/[0.06] blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-emerald-500/[0.06] blur-2xl" />
                            <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                              <div className="min-w-0 xl:w-[24%]">
                                <p className="font-black text-ink">{record.employer}</p>
                                <p className="mt-1 text-xs font-bold text-slate-500">{record.date} • {record.id}</p>
                              </div>
                              <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                                {[
                                  [lang === "hi" ? "काम" : "Work type", record.jobType],
                                  [t.passport.location, cityLabel(record.location)],
                                  [t.passport.hoursWorked, `${record.hoursWorked}h`],
                                  [t.passport.dailyWage, formatCurrency(record.dailyWage)],
                                  [t.passport.received, formatCurrency(record.paymentReceived)],
                                  [t.passport.pending, formatCurrency(record.paymentPending)]
                                ].map(([label, value]) => (
                                  <div key={label}>
                                    <p className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">{label}</p>
                                    <p className="mt-1 text-sm font-bold text-ink">{value}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${isPending ? "border-amber-200 bg-amber-50 text-amber-700" : "border-green-200 bg-green-50 text-neem"}`}>
                                  {isPending ? (lang === "hi" ? "आंशिक भुगतान" : "Partially Paid") : t.verified}
                                </span>
                                <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-ink hover:border-blue-200 hover:bg-blue-50" onClick={() => downloadEmploymentProof(record)}>
                                  {lang === "hi" ? "Proof PDF डाउनलोड" : "Download Proof PDF"}
                                </button>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm font-semibold leading-6 text-slate-700">
                    {lang === "hi"
                      ? "यह पासपोर्ट श्रमिकों को आय की निरंतरता, सत्यापित काम इतिहास और भुगतान रिकॉर्ड नियोक्ताओं, NGO और वित्तीय भागीदारों को दिखाने में मदद करता है।"
                      : "This passport helps workers demonstrate income consistency, verified work history, and payment records to employers, NGOs, and financial partners."}
                  </div>
                </div>
              )}

              {activeWorkspaceTab === "jobs" && (
                <div className="space-y-5">
                  <div className="panel p-6 sm:p-7">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">
                          {lang === "hi" ? "AI नौकरी सुझाव" : "AI Job Recommendations"}
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-ink">
                          {lang === "hi" ? "आपके लिए उपयुक्त सत्यापित काम" : "AI Job Recommendations"}
                        </h3>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                          {lang === "hi"
                            ? "आपके सत्यापित कौशल, काम के इतिहास, मजदूरी अपेक्षा, भाषा और सुरक्षा पसंद के आधार पर सुझाव।"
                            : "Recommendations generated using your verified skills, work history, wage expectations, language, and safety preferences."}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <select value={jobFilters.role} onChange={(event) => setJobFilters({ ...jobFilters, role: event.target.value })} className="focus-ring min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-ink">
                          <option value="">{lang === "hi" ? "सभी भूमिकाएँ" : "Role"}</option>
                          {jobRoleOptions.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                        </select>
                        <select value={jobFilters.city} onChange={(event) => setJobFilters({ ...jobFilters, city: event.target.value })} className="focus-ring min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-ink">
                          <option value="">{lang === "hi" ? "सभी शहर" : "City"}</option>
                          {jobCityOptions.map((city) => <option key={city} value={city}>{cityLabel(city)}</option>)}
                        </select>
                        <button type="button" onClick={() => setJobFilters({ ...jobFilters, verifiedOnly: !jobFilters.verifiedOnly })} className={`focus-ring min-h-10 rounded-lg border px-3 text-sm font-black ${jobFilters.verifiedOnly ? "border-green-200 bg-green-50 text-neem" : "border-slate-200 bg-white text-ink"}`}>
                          {lang === "hi" ? "केवल सत्यापित" : "Verified Only"}
                        </button>
                        {[
                          ["match", lang === "hi" ? "सबसे अच्छा मिलान" : "Highest Match"],
                          ["salary", lang === "hi" ? "सबसे अधिक वेतन" : "Highest Salary"],
                          ["nearest", lang === "hi" ? "सबसे नज़दीक" : "Nearest"]
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
                      const verified = job.status === "Verified";
                      const salaryText = `${formatCurrency(job.wageRange?.min || 0)}-${formatCurrency(job.wageRange?.max || 0)} / ${periodLabel(job.wageRange?.period || "Monthly")}`;
                      const distance = `${4 + index * 2} km ${lang === "hi" ? "दूर" : "away"}`;
                      const aiReasons = [
                        lang === "hi" ? "आपके सत्यापित अनुभव से मेल खाता है" : "Matches your verified experience",
                        lang === "hi" ? "आपकी पसंदीदा मजदूरी के भीतर" : "Within your preferred wage",
                        `${(job.languagePreference || []).map(languageLabel).join(", ")} ${lang === "hi" ? "बोलने वाला कार्यस्थल" : "speaking workplace"}`,
                        verified ? (lang === "hi" ? "सत्यापित नियोक्ता" : "Verified employer") : (lang === "hi" ? "सुरक्षा जाँच जरूरी" : "Needs safety review"),
                        Number(job.safetyScore || 0) >= 85 ? (lang === "hi" ? "मजबूत भुगतान इतिहास" : "Strong payment history") : (lang === "hi" ? "भुगतान शर्तें पहले जांचें" : "Review payment terms first"),
                        Number(job.safetyScore || 0) >= 80 ? (lang === "hi" ? "सुरक्षित कार्यस्थल" : "Safe workplace") : (lang === "hi" ? "कार्यस्थल सत्यापन बाकी" : "Workplace verification pending")
                      ];
                      const trustChips = [
                        verified ? (lang === "hi" ? "सत्यापित नियोक्ता" : "Verified Employer") : (lang === "hi" ? "असत्यापित" : "Unverified"),
                        `${lang === "hi" ? "भुगतान भरोसा" : "Payment Reliability"} ${Math.min(98, Math.max(72, job.safetyScore || 85))}%`,
                        `${18 + index * 7} ${lang === "hi" ? "श्रमिक रखे" : "Workers hired"}`,
                        `0 ${lang === "hi" ? "फ्रॉड रिपोर्ट" : "Fraud reports"}`,
                        lang === "hi" ? "बैकग्राउंड जाँचा गया" : "Background verified"
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
                                <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-neem">
                                  {lang === "hi" ? "पसंदीदा शहर में" : "Within preferred city"}
                                </span>
                                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-700">{distance}</span>
                                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700">
                                  {lang === "hi" ? "तुरंत भर्ती" : "Immediate hiring"}
                                </span>
                              </div>
                            </div>
                            <div className="shrink-0 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-center shadow-sm">
                              <p className="text-sm tracking-[0.12em] text-saffron">★★★★★</p>
                              <p className="mt-1 text-2xl font-black text-ink">{job.score}%</p>
                              <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{lang === "hi" ? "मिलान" : "Match"}</p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-xl border border-slate-200 bg-white/85 p-4">
                            <h4 className="text-sm font-black text-ink">{lang === "hi" ? "AI ने यह क्यों सुझाया" : "Why AI Recommended This"}</h4>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {aiReasons.map((reason) => (
                                <p key={reason} className="flex gap-2 text-sm font-semibold leading-5 text-slate-700">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neem" />
                                  <span>{reason}</span>
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="mt-5">
                            <h4 className="text-sm font-black text-ink">{lang === "hi" ? "नियोक्ता भरोसा" : "Employer Trust"}</h4>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {trustChips.map((chip, chipIndex) => (
                                <span key={chip} className={`rounded-full border px-2.5 py-1 text-xs font-black ${chipIndex === 0 && verified ? "border-green-200 bg-green-50 text-neem" : "border-slate-200 bg-white text-slate-700"}`}>
                                  {chip}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-2">
                            <button type="button" onClick={() => setStatusMessage(lang === "hi" ? "नौकरी विवरण खुल गया।" : "Job details opened.")} className="focus-ring rounded-lg bg-saffron px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-blue-700">
                              {lang === "hi" ? "विवरण देखें" : "View Details"}
                            </button>
                            <button type="button" onClick={() => setStatusMessage(lang === "hi" ? "नौकरी सुरक्षित कर ली गई।" : "Job saved.")} className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-ink hover:border-blue-200 hover:bg-blue-50">
                              {lang === "hi" ? "सेव करें" : "Save"}
                            </button>
                            <button type="button" onClick={() => setActiveWorkspaceTab("coach")} className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-ink hover:border-blue-200 hover:bg-blue-50">
                              {lang === "hi" ? "इंटरव्यू शुरू करें" : "Start Interview"}
                            </button>
                            <button type="button" onClick={() => {
                              navigator.clipboard?.writeText(`${jobTitleLabel(job)} • ${identityPageIdentity.profileUrl}`);
                              setStatusMessage(lang === "hi" ? "नौकरी लिंक कॉपी हो गया।" : "Job recommendation copied.");
                            }} className="focus-ring rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-ink hover:border-blue-200 hover:bg-blue-50">
                              {lang === "hi" ? "शेयर" : "Share"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {!filteredJobMatches.length && (
                    <div className="panel p-8 text-center">
                      <Search className="mx-auto h-8 w-8 text-slate-400" />
                      <h3 className="mt-3 text-xl font-black text-ink">{lang === "hi" ? "इस फ़िल्टर में नौकरी नहीं मिली" : "No jobs match these filters"}</h3>
                      <p className="mt-2 text-sm font-semibold text-slate-600">{lang === "hi" ? "भूमिका, शहर या सत्यापित फ़िल्टर बदलकर फिर देखें।" : "Try changing the role, city, or verified-only filter."}</p>
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
                          {lang === "hi" ? "AI मजदूरी समझ" : "AI Wage Intelligence"}
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-ink">
                          {lang === "hi" ? "AI उचित मजदूरी सलाह" : "AI Fair Wage Intelligence"}
                        </h3>
                        <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600">
                          {lang === "hi"
                            ? "आपके अनुभव, शहर, काम इतिहास और भुगतान रिकॉर्ड के आधार पर बेहतर मजदूरी तय करने में मदद।"
                            : "Understand your market value, negotiate better wages, and build a trusted income record."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center">
                        <p className="text-2xl font-black text-neem">95%</p>
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-neem">{lang === "hi" ? "विश्वास" : "Confidence"}</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm font-bold text-slate-500">{lang === "hi" ? "सुझाई गई मासिक मजदूरी" : "Recommended Monthly Wage"}</p>
                      <p className="mt-2 text-5xl font-black leading-tight text-ink">{formatCurrency(identityRecommendedWage)}</p>
                      <p className="mt-2 text-sm font-bold text-slate-600">
                        {lang === "hi" ? "रेंज" : "Range"}: {formatCurrency(identityWageLow)}-{formatCurrency(identityWageHigh)}
                      </p>
                    </div>

                    <div className="mt-5 grid gap-5 lg:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h4 className="text-sm font-black text-ink">{lang === "hi" ? "AI यह मजदूरी क्यों सुझाता है" : "Why AI recommends this wage"}</h4>
                        <div className="mt-4 space-y-3">
                          {[
                            `${identityPageWorker.experience} ${lang === "hi" ? "साल सत्यापित अनुभव" : "years verified experience"}`,
                            lang === "hi" ? `${cityLabel(identityPageWorker.city)} में उच्च मांग` : `High demand in ${cityLabel(identityPageWorker.city)}`,
                            lang === "hi" ? "सत्यापित नियोक्ता नेटवर्क" : "Verified employer network",
                            lang === "hi" ? "मजबूत भुगतान इतिहास" : "Strong payment history"
                          ].map((reason) => (
                            <p key={reason} className="flex gap-2 text-sm font-semibold leading-5 text-slate-700">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neem" />
                              <span>{reason}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                        <h4 className="text-sm font-black text-ink">{lang === "hi" ? "स्थानीय मजदूरी तुलना" : "Local Wage Benchmark"}</h4>
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-bold text-slate-600">{lang === "hi" ? "बाज़ार औसत" : "Average Market Wage"}</p>
                            <p className="text-lg font-black text-ink">{formatCurrency(identityMarketWage)}</p>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-sm font-bold text-slate-600">{lang === "hi" ? "सुझाई मजदूरी" : "Recommended Wage"}</p>
                            <p className="text-lg font-black text-neem">{formatCurrency(identityRecommendedWage)}</p>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white">
                            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-saffron to-neem" />
                          </div>
                          <p className="text-sm font-black text-neem">+{identityMarketLift}% {lang === "hi" ? "बाज़ार से अधिक" : "above market"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
                      <h4 className="text-sm font-black text-ink">{lang === "hi" ? "मोलभाव सुझाव" : "Negotiation Tips"}</h4>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          lang === "hi" ? "सत्यापित काम इतिहास बताएं" : "Mention verified work history",
                          lang === "hi" ? `${roleLabel(identityPageWorker.skill)} के जरूरी काम का अनुभव दिखाएं` : `Highlight emergency ${roleLabel(identityPageWorker.skill).toLowerCase()} experience`,
                          `${lang === "hi" ? "मांगें" : "Ask for"} ${formatCurrency(identityRecommendedWage)}-${formatCurrency(Math.round(identityRecommendedWage * 1.07))}`,
                          lang === "hi" ? "सप्ताहांत काम के लिए अतिरिक्त दर मांगें" : "Weekend work deserves premium rates"
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
                          {lang === "hi" ? "आय रिकॉर्ड जोड़ें" : "Record verified income"}
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-ink">{t.wageEntry.title}</h3>
                      </div>

                      <div className="mt-5 space-y-5">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{lang === "hi" ? "काम विवरण" : "Work details"}</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Field label={t.wageEntry.employer}><Input value={wageEntry.employer} onChange={(event) => setWageEntry({ ...wageEntry, employer: event.target.value })} placeholder={t.wageEntry.employerPlaceholder} /></Field>
                            <Field label={t.wageEntry.date}><Input type="date" value={wageEntry.date} onChange={(event) => setWageEntry({ ...wageEntry, date: event.target.value })} /></Field>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{lang === "hi" ? "मजदूरी और घंटे" : "Wage and hours"}</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Field label={t.wageEntry.dailyWage}><Input type="number" min="0" value={wageEntry.dailyWage} onChange={(event) => setWageEntry({ ...wageEntry, dailyWage: event.target.value })} /></Field>
                            <Field label={t.wageEntry.hours}><Input type="number" min="0" value={wageEntry.hoursWorked} onChange={(event) => setWageEntry({ ...wageEntry, hoursWorked: event.target.value })} /></Field>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{lang === "hi" ? "भुगतान स्थिति" : "Payment status"}</p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <Field label={t.wageEntry.received}><Input type="number" min="0" value={wageEntry.paymentReceived} onChange={(event) => setWageEntry({ ...wageEntry, paymentReceived: event.target.value })} /></Field>
                            <Field label={t.wageEntry.pending}><Input type="number" min="0" value={wageEntry.paymentPending} onChange={(event) => setWageEntry({ ...wageEntry, paymentPending: event.target.value })} /></Field>
                          </div>
                        </div>
                      </div>

                      <ActionButton icon={WalletCards} className="mt-5 w-full justify-center" onClick={addWageEntry}>
                        {lang === "hi" ? "मजदूरी रिकॉर्ड सुरक्षित करें" : "Save Wage Entry"}
                      </ActionButton>
                    </div>

                    <div className="premium-card p-5">
                      <h3 className="text-xl font-black text-ink">{lang === "hi" ? "आज की आय का सारांश" : "Today's Income Summary"}</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          [t.wageEntry.employer, wageEntry.employer || (lang === "hi" ? "अभी नहीं भरा" : "Not entered yet")],
                          [lang === "hi" ? "आज की कमाई" : "Today's Earnings", formatCurrency(Number(wageEntry.paymentReceived || wageEntry.dailyWage || 0))],
                          [lang === "hi" ? "भुगतान स्थिति" : "Payment Status", Number(wageEntry.paymentPending || 0) > 0 ? (lang === "hi" ? "आंशिक भुगतान" : "Partially paid") : (lang === "hi" ? "भुगतान पूरा" : "Paid")],
                          [lang === "hi" ? "बकाया राशि" : "Pending Amount", formatCurrency(Number(wageEntry.paymentPending || 0))]
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
                            lang === "hi" ? "मजदूरी रिकॉर्ड सुरक्षित हो गया" : "Wage Entry Saved",
                            lang === "hi" ? "आय पासपोर्ट अपडेट हुआ" : "Income Passport Updated",
                            lang === "hi" ? "रोजगार रिकॉर्ड जुड़ गया" : "Employment Record Added"
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
                <div className="space-y-5">
                  <div className="premium-card p-6 sm:p-7">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "AI साक्षात्कार अभ्यास" : "AI interview practice"}</p>
                        <h3 className="mt-2 text-3xl font-black text-ink">{lang === "hi" ? "साक्षात्कार अभ्यास" : "Interview Coach"}</h3>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                          {lang === "hi"
                            ? "अपनी पसंदीदा भाषा में भूमिका-आधारित नियोक्ता साक्षात्कार का अभ्यास करें और आवेदन से पहले AI feedback पाएं।"
                            : "Practice role-specific employer interviews in your preferred language and receive AI-powered feedback before applying."}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <label className="block">
                          <span className="mb-1 block text-xs font-black tracking-[0.08em] text-slate-500">
                            Interview Language
                          </span>
                          <select value={practiceLanguage === "hi" ? "hi" : "en"} onChange={(event) => changeInterviewLanguage(event.target.value)} className="focus-ring min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-ink shadow-sm">
                            <option value="hi">🇮🇳 हिन्दी</option>
                            <option value="en">🇬🇧 English</option>
                          </select>
                        </label>
                        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-center">
                          <p className="text-xs font-black uppercase tracking-[0.12em] text-neem">{lang === "hi" ? "साक्षात्कार तैयारी" : "Interview Readiness"}</p>
                          <p className="mt-1 text-4xl font-black text-ink">{interviewReadiness || 93}%</p>
                          <p className="mt-1 text-sm font-black text-neem">{lang === "hi" ? "सत्यापित नियोक्ताओं के लिए तैयार" : "Ready for Verified Employers"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {(practiceHistory.length >= (coach?.questions?.length || 5) && coach) ? (
                    <div className="premium-card p-8 text-center">
                      <Award className="mx-auto h-10 w-10 text-neem" />
                      <h3 className="mt-4 text-3xl font-black text-ink">{lang === "hi" ? "साक्षात्कार पूरा" : "Interview Complete"}</h3>
                      <p className="mt-2 text-sm font-semibold text-slate-600">{lang === "hi" ? "आपने सभी अभ्यास प्रश्न पूरे कर लिए हैं।" : "You completed all practice questions."}</p>
                      <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5">
                          <p className="text-sm font-bold text-slate-500">{lang === "hi" ? "कुल स्कोर" : "Overall Score"}</p>
                          <p className="mt-1 text-4xl font-black text-ink">{answerFeedback?.score || interviewReadiness}%</p>
                        </div>
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                          <p className="text-sm font-bold text-neem">{lang === "hi" ? "सिफारिश" : "Recommendation"}</p>
                          <p className="mt-1 text-xl font-black text-ink">{interviewReadiness >= 80 ? (lang === "hi" ? "सत्यापित नियोक्ताओं के लिए तैयार" : "Ready for verified employers") : (lang === "hi" ? "एक बार और अभ्यास करें" : "Practice once more")}</p>
                        </div>
                      </div>
                      <ActionButton icon={Sparkles} className="mt-6" onClick={runCoach} disabled={isCoaching}>{isCoaching ? t.loadingCoach : t.startPractice}</ActionButton>
                    </div>
                  ) : (
                    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                      <div className="premium-card p-6 sm:p-7">
                        <div className="grid gap-3 sm:grid-cols-5">
                          {[
                            [lang === "hi" ? "भूमिका" : "Role", lang === "hi" ? roleLabel(identityPageWorker.skill) : `Residential ${roleLabel(identityPageWorker.skill)}`],
                            [lang === "hi" ? "नियोक्ता" : "Employer", `${cityLabel(identityPageWorker.city)} Verified Work Network`],
                            [lang === "hi" ? "भाषा" : "Language", practiceLanguage === "hi" ? "हिन्दी" : "English"],
                            [lang === "hi" ? "कठिनाई" : "Difficulty", lang === "hi" ? "आसान" : "Easy"],
                            [lang === "hi" ? "प्रश्न" : "Question", `${coach ? currentQuestionIndex + 1 : 1} of ${coach?.questions?.length || 5}`]
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
                              <p className="mt-1 text-sm font-black text-ink">{value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-saffron to-neem" style={{ width: `${coach ? ((currentQuestionIndex + 1) / (coach.questions?.length || 5)) * 100 : 20}%` }} />
                        </div>

                        <div className="mt-6 rounded-[1.5rem] border border-blue-100 bg-blue-50/70 p-5">
                          <p className="text-sm font-black text-saffron">{lang === "hi" ? "नियोक्ता पूछता है:" : "Employer asks:"}</p>
                          <h4 className="mt-3 text-2xl font-black leading-tight text-ink">
                            “{currentQuestion || skillSpecificQuestions(identityPageWorker.skill, practiceLanguage)[0]}”
                          </h4>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-sm font-black text-ink">{t.interviewAnswer.label}</p>
                            <p className="text-xs font-bold text-slate-500">{interviewAnswer.length} characters</p>
                          </div>
                          <textarea
                            value={interviewAnswer}
                            onChange={(event) => setInterviewAnswer(event.target.value)}
                            placeholder={practiceLanguage === "hi" ? "अपने पिछले काम को एक असली उदाहरण के साथ साफ़-साफ़ बताएं।" : "Describe your previous work clearly using one real example."}
                            className="focus-ring min-h-48 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold leading-7 text-ink shadow-sm"
                          />
                        </div>

                        <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
                          <button type="button" onClick={startVoiceAnswer} className="focus-ring group rounded-2xl border border-blue-100 bg-blue-50/70 p-5 text-left transition hover:border-blue-200 hover:bg-blue-50">
                            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-saffron shadow-sm">
                              {voiceAnswerStatus === "completed" ? <CheckCircle2 className="h-7 w-7 text-neem" /> : voiceAnswerStatus === "processing" ? <Sparkles className="h-7 w-7" /> : <AudioLines className={`h-7 w-7 ${voiceAnswerStatus === "listening" ? "animate-pulse" : ""}`} />}
                            </span>
                            <p className="mt-4 text-xl font-black text-ink">
                              {voiceAnswerStatus === "listening"
                                ? (practiceLanguage === "hi" ? "🎙 सुन रहे हैं..." : "🎙 Listening...")
                                : voiceAnswerStatus === "processing"
                                  ? (practiceLanguage === "hi" ? "🤖 प्रोसेस हो रहा है..." : "🤖 Processing...")
                                  : voiceAnswerStatus === "completed"
                                    ? (practiceLanguage === "hi" ? "✅ आवाज़ कैप्चर हुई" : "✅ Speech Captured")
                                    : (practiceLanguage === "hi" ? "🎤 बोलने के लिए टैप करें" : "🎤 Tap to Speak")}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-600">{practiceLanguage === "hi" ? "ब्राउज़र voice recognition उपलब्ध होने पर जवाब लिख देगा।" : "Uses browser speech recognition when available."}</p>
                          </button>
                          <div className="flex flex-wrap content-start gap-2 lg:items-start">
                            <ActionButton icon={MessageSquare} onClick={evaluateAnswer} disabled={!interviewAnswer.trim()}>{t.interviewAnswer.score}</ActionButton>
                            <ActionButton icon={Sparkles} variant="secondary" onClick={useSampleAnswer}>{t.interviewCoach.sampleAnswer}</ActionButton>
                            <ActionButton icon={ChevronRight} variant="secondary" onClick={skipQuestion}>{lang === "hi" ? "प्रश्न छोड़ें" : "Skip Question"}</ActionButton>
                            {answerFeedback && (
                              <ActionButton icon={PlayCircle} variant="secondary" onClick={skipQuestion}>{lang === "hi" ? "अगला प्रश्न" : "Next Question"}</ActionButton>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="premium-card p-6">
                          <h3 className="text-xl font-black text-ink">{lang === "hi" ? "AI Feedback" : "AI Feedback"}</h3>
                          {answerFeedback ? (
                            <>
                              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">
                                <p className="text-sm font-black text-neem">{lang === "hi" ? "कुल स्कोर" : "Overall Score"}</p>
                                <p className="mt-1 text-5xl font-black text-ink">{answerFeedback.score}%</p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{answerFeedback.message}</p>
                              </div>
                              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {[
                                  [practiceLanguage === "hi" ? "आत्मविश्वास" : "Confidence", answerFeedback.confidence],
                                  [practiceLanguage === "hi" ? "बातचीत की स्पष्टता" : "Communication", answerFeedback.communication],
                                  [practiceLanguage === "hi" ? "तकनीकी गुणवत्ता" : "Technical Quality", answerFeedback.relevance],
                                  [practiceLanguage === "hi" ? "पेशेवरपन" : "Professionalism", answerFeedback.completeness]
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
                            </>
                          ) : (
                            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-600">
                              {lang === "hi" ? "जवाब लिखें या बोलें, फिर AI से स्कोर और सुधार सुझाव पाएं।" : "Write or speak your answer, then get AI scoring and improvement suggestions."}
                            </div>
                          )}
                        </div>

                        {answerFeedback && (
                          <>
                            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                              <div className="premium-card p-5">
                                <h4 className="text-lg font-black text-ink">{lang === "hi" ? "मजबूत बातें" : "Strengths"}</h4>
                                {(practiceLanguage === "hi"
                                  ? ["पिछला अनुभव बताया", "असली काम का उल्लेख किया", "जवाब समझने में आसान है"]
                                  : ["Explained previous experience", "Mentioned real work", "Answer is easy to understand"]
                                ).map((item) => (
                                  <p key={item} className="mt-3 flex gap-2 text-sm font-semibold text-slate-700">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-neem" />
                                    <span>{item}</span>
                                  </p>
                                ))}
                              </div>
                              <div className="premium-card p-5">
                                <h4 className="text-lg font-black text-ink">{lang === "hi" ? "सुधार" : "Improvements"}</h4>
                                {answerFeedback.tips.map((tip) => (
                                  <p key={tip} className="mt-3 flex gap-2 text-sm font-semibold text-slate-700">
                                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                                    <span>{tip}</span>
                                  </p>
                                ))}
                              </div>
                            </div>

                            <div className="premium-card p-5">
                              <h4 className="text-lg font-black text-ink">{lang === "hi" ? "AI बेहतर जवाब" : "AI Improved Answer"}</h4>
                              <div className="mt-4 space-y-3">
                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{lang === "hi" ? "आपका जवाब" : "Your Answer"}</p>
                                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{interviewAnswer}</p>
                                </div>
                                <div className="text-center text-sm font-black text-saffron">↓</div>
                                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                  <p className="text-xs font-black uppercase tracking-[0.12em] text-neem">{lang === "hi" ? "AI सुधारा हुआ जवाब" : "AI Improved Version"}</p>
                                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                                    {currentSampleAnswer || (lang === "hi"
                                      ? `${identityPageWorker.experience} साल के अनुभव के साथ मैंने ${roleLabel(identityPageWorker.skill)} का काम किया है। एक पिछले काम में मैंने समस्या समझकर समय पर समाधान दिया और मजदूरी व समय पहले साफ़ किया।`
                                      : `I have ${identityPageWorker.experience} years of experience as a ${roleLabel(identityPageWorker.skill).toLowerCase()}. In one past job, I understood the issue, completed the work on time, and clearly discussed timing and wage expectations.`)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeWorkspaceTab === "rights" && (
                <div className="space-y-5">
                  <div className="premium-card p-6 sm:p-7">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "AI सुरक्षा सहायक" : "AI safety assistant"}</p>
                        <h3 className="mt-2 text-3xl font-black text-ink">{lang === "hi" ? "AI अधिकार और सुरक्षा सहायक" : "AI Rights & Safety Assistant"}</h3>
                        <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                          {lang === "hi"
                            ? "काम स्वीकार करने से पहले फर्जी नौकरी, श्रमिक अधिकार और AI सुरक्षा सलाह समझें।"
                            : "Detect fraudulent job offers, understand worker rights, and receive AI-powered safety guidance before accepting work."}
                        </p>
                      </div>
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-black text-neem">
                        <ShieldCheck className="h-4 w-4" />
                        {lang === "hi" ? "RozgaarAI Safety Engine" : "RozgaarAI Safety Engine"}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                    <div className="premium-card p-6 sm:p-7">
                      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "WhatsApp नौकरी संदेश" : "WhatsApp job message"}</p>
                            <h3 className="mt-2 text-2xl font-black text-ink">{lang === "hi" ? "📱 WhatsApp नौकरी प्रस्ताव जांचें" : "📱 Analyze WhatsApp Job Offer"}</h3>
                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                              {lang === "hi"
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
                            {isAnalyzingMessage ? (lang === "hi" ? "AI विश्लेषण कर रहा है..." : "Analyzing with AI...") : (lang === "hi" ? "✨ AI से जांचें" : "✨ Analyze with AI")}
                          </ActionButton>
                          <button type="button" onClick={loadDemoWhatsAppMessage} className="focus-ring rounded-lg px-3 py-2 text-sm font-black text-saffron hover:bg-blue-50">
                            {lang === "hi" ? "Demo Message डालें" : "Load Demo Message"}
                          </button>
                        </div>
                      </div>

                      {extractedOffer && (
                        <div className="mb-6 space-y-5 section-fade">
                          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="text-xl font-black text-ink">{lang === "hi" ? "AI निकाली गई जानकारी" : "AI Extracted Information"}</h3>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              {[
                                [Building2, lang === "hi" ? "नियोक्ता" : "Employer", extractedOffer.entities.employer, extractedOffer.confidence.employer],
                                [IndianRupee, lang === "hi" ? "वेतन" : "Salary", extractedOffer.entities.salary, extractedOffer.confidence.salary],
                                [Landmark, lang === "hi" ? "रजिस्ट्रेशन फीस" : "Registration Fee", extractedOffer.entities.fee, extractedOffer.confidence.fee],
                                [FileText, lang === "hi" ? "दस्तावेज़" : "Documents", extractedOffer.entities.documents, extractedOffer.confidence.documents],
                                [MessageSquare, lang === "hi" ? "संपर्क" : "Contact", extractedOffer.entities.contact, extractedOffer.confidence.contact],
                                [MapPin, lang === "hi" ? "काम का पता" : "Work Address", extractedOffer.entities.address, extractedOffer.confidence.address]
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
                            <h3 className="text-xl font-black text-ink">{lang === "hi" ? "मिले scam संकेत" : "Detected Scam Signals"}</h3>
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
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "नौकरी प्रस्ताव जांचें" : "Analyze job offer"}</p>
                        <h3 className="mt-2 text-2xl font-black text-ink">{lang === "hi" ? "प्रस्ताव विवरण" : "Offer intake"}</h3>
                      </div>

                      <div className="mt-5 space-y-5">
                        {[
                          [BriefcaseBusiness, lang === "hi" ? "नौकरी विवरण" : "Job Details", [
                            [BriefcaseBusiness, t.fields.offerTitle, "title", "text", ""],
                            [IndianRupee, t.fields.salary, "salary", "number", ""]
                          ]],
                          [Building2, lang === "hi" ? "नियोक्ता विवरण" : "Employer Details", [
                            [Building2, t.fields.employerName, "employerName", "text", ""],
                            [MapPin, t.fields.workAddress, "address", "text", t.placeholders.workAddress]
                          ]],
                          [IndianRupee, lang === "hi" ? "भुगतान विवरण" : "Payment Details", [
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
                            <h4 className="text-sm font-black text-ink">{lang === "hi" ? "दस्तावेज़ मांग" : "Document Requests"}</h4>
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
                        {isCheckingRisk ? t.loadingSafety : (lang === "hi" ? "नौकरी प्रस्ताव जांचें" : "Analyze Job Offer")}
                      </ActionButton>
                    </div>

                    <div className="space-y-5">
                      <div className="premium-card p-6 sm:p-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "AI सुरक्षा रिपोर्ट" : "AI Safety Report"}</p>
                            <h3 className="mt-2 text-2xl font-black text-ink">{lang === "hi" ? "जोखिम विश्लेषण" : "Job offer risk analysis"}</h3>
                            <p className="mt-2 text-sm font-semibold text-slate-600">
                              {lang === "hi" ? "RozgaarAI AI Safety Engine द्वारा तैयार" : "Generated by RozgaarAI AI Safety Engine"}
                            </p>
                          </div>
                          <div className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full bg-white">
                            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                              <circle cx="60" cy="60" r="48" fill="none" stroke="#E2E8F0" strokeWidth="10" />
                              <circle cx="60" cy="60" r="48" fill="none" stroke={risk.risk === "High" ? "#DC2626" : risk.risk.includes("Medium") ? "#F59E0B" : "#16A34A"} strokeLinecap="round" strokeWidth="10" strokeDasharray={`${riskScore * 3.016} 301.6`} />
                            </svg>
                            <div className="absolute text-center">
                              <p className="text-3xl font-black text-ink">{riskScore}</p>
                              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{lang === "hi" ? "जोखिम स्कोर" : "Risk Score"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{t.riskLevel}</p>
                            <p className={`mt-1 text-xl font-black ${riskClass}`}>{riskLabel(risk.risk)}</p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{lang === "hi" ? "AI विश्वास" : "AI Confidence"}</p>
                            <p className="mt-1 text-xl font-black text-ink">{safetyConfidence}%</p>
                          </div>
                        </div>
                      </div>

                      <div className="premium-card p-6">
                        <h3 className="text-xl font-black text-ink">{lang === "hi" ? "मिले जोखिम संकेत" : "Detected Risk Factors"}</h3>
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
                          <h3 className="text-lg font-black text-ink">{lang === "hi" ? "यह क्यों flagged हुआ?" : "Why was this flagged?"}</h3>
                          {extractedOffer && risk.flags.length ? (
                            <div className="mt-3 space-y-3 text-sm font-semibold leading-6 text-slate-700">
                              {(lang === "hi"
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
                                ? (lang === "hi" ? t.riskAdvice : risk.advice)
                                : (lang === "hi" ? "इस प्रस्ताव में बड़े जोखिम संकेत नहीं मिले, लेकिन काम शुरू करने से पहले लिखित शर्तें और नियोक्ता पहचान जरूर जांचें।" : risk.advice)}
                            </p>
                          )}
                        </div>

                        <div className="premium-card p-5">
                          <h3 className="text-lg font-black text-ink">{lang === "hi" ? "अगले सुरक्षित कदम" : "Recommended Next Steps"}</h3>
                          <div className="mt-3 space-y-2">
                            {(lang === "hi"
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
                              <h3 className="text-lg font-black text-ink">{lang === "hi" ? "अपने अधिकार जानें" : "Know Your Rights"}</h3>
                              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                                {lang === "hi"
                                  ? "नियोक्ता जॉइनिंग से पहले रजिस्ट्रेशन फीस नहीं मांग सकते। मूल पहचान दस्तावेज़ न दें। हमेशा लिखित मजदूरी शर्तें और नियोक्ता पहचान सत्यापित करें।"
                                  : "Employers cannot demand registration fees before joining. Never hand over original identity documents. Always request written wage terms and verify employer identity before accepting work."}
                              </p>
                            </div>
                            <button type="button" className="focus-ring shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-ink hover:border-blue-200 hover:bg-blue-50">
                              {lang === "hi" ? "और जानें" : "Learn More"}
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
                        <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "AI बायोडाटा बिल्डर" : "AI Resume Builder"}</p>
                        <h3 className="mt-2 text-3xl font-black text-ink">{lang === "hi" ? "Employer-ready Resume" : "Employer-ready Resume"}</h3>
                        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                          {lang === "hi" ? "RozgaarAI बोले गए श्रमिक विवरण को polished, सत्यापित बायोडाटा में बदलता है।" : "RozgaarAI converts spoken worker details into a polished, verified resume for real employment."}
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
                                <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-black text-neem">Verified RozgaarAI Worker</span>
                              </div>
                              <h1 className="mt-5 text-4xl font-black leading-tight text-ink">{identityPageWorker.name}</h1>
                              <p className="mt-1 text-lg font-black text-saffron">{roleLabel(identityPageWorker.skill)} • {cityLabel(identityPageWorker.city)}</p>
                              <p className="mt-2 text-sm font-bold text-slate-600">{identityPageWorker.phone || "Demo contact"} • {identityPageWorker.languages}</p>
                              <p className="mt-1 text-sm font-bold text-slate-600">{t.workerId}: {identityPageIdentity.workerId}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
                              <QRCodeCanvas value={identityPageIdentity.profileUrl} size={92} level="H" marginSize={1} bgColor="#ffffff" fgColor="#0F172A" title="Resume QR" />
                              <p className="mt-2 w-24 text-[10px] font-black leading-3 text-slate-500">Scan to verify digital worker identity</p>
                            </div>
                          </div>
                        </header>

                        <div className="grid gap-7 p-7 lg:grid-cols-[1.45fr_0.85fr]">
                          <main className="space-y-5">
                            <section>
                              <h2 className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-[0.16em] text-saffron">Professional Summary</h2>
                              <p className="mt-3 text-sm font-semibold leading-7 text-slate-700">{resumeSummary}</p>
                            </section>
                            <section>
                              <h2 className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-[0.16em] text-saffron">Work Experience</h2>
                              <div className="mt-3 space-y-2">
                                {resumeWorkRecords.map((record) => (
                                  <div key={record.id || `${record.employer}-${record.date}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                    <p className="text-sm font-black text-ink">{record.employer || record.worksite || t.notAvailable}</p>
                                    <p className="mt-1 text-xs font-bold text-slate-600">{record.jobType || roleLabel(identityPageWorker.skill)} • {record.date || currentIssueDate} • {record.location || cityLabel(identityPageWorker.city)}</p>
                                  </div>
                                ))}
                              </div>
                            </section>
                            <section>
                              <h2 className="border-b border-slate-200 pb-2 text-xs font-black uppercase tracking-[0.16em] text-saffron">Work Highlights</h2>
                              <ul className="mt-3 space-y-2">
                                {displayResumeSections.slice(1, 4).map((section) => (
                                  <li key={section.heading} className="text-sm font-semibold leading-6 text-slate-700"><span className="font-black text-ink">{section.heading}:</span> {section.body}</li>
                                ))}
                              </ul>
                            </section>
                          </main>
                          <aside className="space-y-4">
                            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <h2 className="text-xs font-black uppercase tracking-[0.16em] text-saffron">Skills</h2>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {resumeSkills.map((skill) => <span key={skill} className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">{skill}</span>)}
                              </div>
                            </section>
                            {[
                              ["Languages", identityPageWorker.languages],
                              ["Availability", identityPageWorker.availability],
                              ["Contact", identityPageWorker.phone || "Demo contact"],
                              ["Expected Wage", `${formatCurrency(identityPageWorker.expectedWage)}/month`]
                            ].map(([label, value]) => (
                              <section key={label} className="rounded-xl border border-slate-200 bg-white p-4">
                                <h2 className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</h2>
                                <p className="mt-2 text-sm font-black text-ink">{value || t.notAvailable}</p>
                              </section>
                            ))}
                          </aside>
                        </div>
                        <footer className="border-t border-slate-200 px-7 py-4 text-xs font-black text-slate-500">
                          Generated by RozgaarAI AI Resume Builder • Verified Digital Career Identity
                        </footer>
                      </article>
                    </div>
                  </div>

                  <aside className="space-y-5">
                    <div className="premium-card p-6">
                      <h3 className="text-2xl font-black text-ink">{lang === "hi" ? "AI Resume Assistant" : "AI Resume Assistant"}</h3>
                      <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-neem">Resume Quality</p>
                        <p className="mt-1 text-5xl font-black text-ink">96%</p>
                      </div>
                      <div className="mt-4 grid gap-2">
                        {["ATS Ready", "Employer Ready", "Verified Worker", "PDF Ready", "QR Verified"].map((item) => (
                          <p key={item} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-neem" />
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="premium-card p-6">
                      <h3 className="text-xl font-black text-ink">AI Suggestions</h3>
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
                        <h3 className="text-lg font-black text-ink">Generating Resume</h3>
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
                        {isBuildingResume ? "Generating PDF..." : "Download PDF Resume"}
                      </ActionButton>
                      <ActionButton icon={FileText} variant="secondary" className="mt-3 w-full justify-center" onClick={() => downloadResume({ preview: true })}>
                        Preview Full Resume
                      </ActionButton>
                      <button type="button" onClick={() => {
                        navigator.clipboard?.writeText(identityPageIdentity.profileUrl);
                        setStatusMessage(lang === "hi" ? "Resume link copied." : "Resume link copied.");
                      }} className="focus-ring mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-black text-saffron hover:bg-blue-50">
                        Share Resume
                      </button>
                    </div>
                  </aside>
                </div>
              )}

            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {hiddenDigitalWorkerCardExport}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="section-shell flex min-h-16 items-center justify-between gap-3 py-2">
          <button type="button" className="group flex items-center font-black text-ink" onClick={() => navigateTo("/")} aria-label="RozgaarAI home">
            <BrandLockup tagline={t.brandTagline} compact />
          </button>
          <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
            {(account
              ? [[lang === "hi" ? "Dashboard" : "Dashboard", "/dashboard"], [lang === "hi" ? "Create Identity" : "Create Identity", "/create-profile"], [lang === "hi" ? "Employers" : "Employers", "/employer"], [lang === "hi" ? "Impact" : "Impact", "#trusted-impact"], [lang === "hi" ? "About" : "About", "#about"]]
              : t.nav.map((item, index) => [item, navIds[index]])
            ).map(([item, href]) => (
              <a key={item} href={href} className="transition hover:text-saffron">
                {item}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 shadow-sm sm:flex">
              <Globe2 className="h-4 w-4 text-saffron" />
              <select value={lang} onChange={(event) => setLang(event.target.value)} aria-label={t.languageLabel} className="focus-ring min-h-9 rounded-md bg-transparent px-2 text-sm font-bold text-ink">
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
            {!account && (
              <ActionButton icon={PlayCircle} className="hidden sm:inline-flex" onClick={openDemoSection}>
                {t.exploreDemo}
              </ActionButton>
            )}
            {account ? (
              <details className="relative hidden sm:block">
                <summary className="focus-ring button-press flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm hover:border-blue-300 hover:bg-slate-50">
                  {account.photoUrl ? (
                    <img src={account.photoUrl} alt={`${account.name} profile`} className="h-7 w-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-50 text-xs font-black text-saffron">{account.name?.slice(0, 1) || "U"}</span>
                  )}
                  {account.name}
                </summary>
                <div className="absolute right-0 z-40 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lift">
                  <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50" onClick={() => navigateTo("/dashboard")}>{lang === "hi" ? "Dashboard" : "Dashboard"}</button>
                  <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50" onClick={() => navigateTo("/dashboard")}>{lang === "hi" ? "My Workspace" : "My Workspace"}</button>
                  <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50" onClick={() => navigateTo("/dashboard")}>{lang === "hi" ? "Settings" : "Settings"}</button>
                  <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm font-black text-red-600 hover:bg-red-50" onClick={signOut}>{lang === "hi" ? "Sign Out" : "Sign Out"}</button>
                </div>
              </details>
            ) : (
              <ActionButton icon={UserRound} variant="secondary" className="hidden sm:inline-flex" onClick={() => setAuthMode("signin")}>
                {t.auth.signIn}
              </ActionButton>
            )}
            <select value={lang} onChange={(event) => setLang(event.target.value)} aria-label={t.languageLabel} className="focus-ring min-h-10 rounded-md border border-slate-200 bg-white px-2 text-sm font-bold text-ink sm:hidden">
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </div>
      </header>

      {authMode && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-title"
          aria-describedby="auth-subtitle"
          onKeyDown={handleAuthModalKeyDown}
        >
          <form onSubmit={submitAuth} className="panel w-full max-w-5xl overflow-hidden p-0 shadow-lift">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{t.auth.eyebrow}</p>
                    <h2 id="auth-title" className="mt-2 text-3xl font-black leading-tight text-ink">
                      {authMode === "signup" ? "Create your RozgaarAI workspace" : "Welcome back to RozgaarAI"}
                    </h2>
                    <p id="auth-subtitle" className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-600">
                      {authMode === "signup"
                        ? "Start building verified worker identities, resumes, income passports, and safer employment journeys."
                        : "Sign in to continue managing worker identities, resumes, income passports, job matches, and safety checks."}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-50"
                    onClick={() => {
                      setAuthMode("");
                      setAuthError("");
                    }}
                    aria-label="Close authentication dialog"
                  >
                    {t.auth.close}
                  </button>
                </div>

                <button
                  type="button"
                  className="focus-ring button-press mt-6 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-ink shadow-sm transition hover:border-blue-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={continueWithGoogle}
                  disabled={Boolean(authLoading)}
                >
                  <GoogleIcon />
                  {authLoading === "Connecting to Google..."
                    ? "Connecting to Google..."
                    : authMode === "signup" ? "Sign up with Google" : "Continue with Google"}
                </button>

                <div className="my-6 flex items-center gap-3">
                  <span className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                    {authMode === "signup" ? "or create account with email" : "or continue with email"}
                  </span>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid gap-4">
                  {authMode === "signup" && (
                    <Field label="Full Name">
                      <Input
                        aria-label="Full Name"
                        autoComplete="name"
                        value={authForm.name}
                        onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                        placeholder={t.auth.namePlaceholder}
                      />
                    </Field>
                  )}
                  <Field label={t.auth.email}>
                    <Input
                      aria-label={t.auth.email}
                      type="email"
                      autoComplete="email"
                      value={authForm.email}
                      onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                      placeholder={t.auth.emailPlaceholder}
                      aria-invalid={Boolean(authError)}
                      aria-describedby={authError ? "auth-error" : undefined}
                    />
                  </Field>
                  <Field label={lang === "hi" ? "पासवर्ड" : "Password"}>
                    <Input
                      aria-label="Password"
                      type="password"
                      autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                      value={authForm.password}
                      onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                      placeholder={lang === "hi" ? "पासवर्ड दर्ज करें" : "Enter password"}
                      aria-invalid={Boolean(authError)}
                      aria-describedby={authError ? "auth-error" : undefined}
                    />
                  </Field>

                  {authMode === "signin" && (
                    <div className="flex justify-end">
                      <button type="button" className="focus-ring rounded-md px-2 py-1 text-sm font-black text-saffron hover:bg-blue-50">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {authMode === "signup" && (
                    <div>
                      <p className="mb-2 text-sm font-bold text-slate-700">{t.auth.role}</p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {[
                          ["Worker", "Worker"],
                          ["Employer", "Employer"],
                          ["NGO / Admin", "NGO / Partner"]
                        ].map(([role, label]) => (
                          <button
                            key={role}
                            type="button"
                            className={`focus-ring rounded-xl border px-3 py-3 text-sm font-black transition ${authForm.role === role ? "border-blue-300 bg-blue-50 text-saffron" : "border-slate-200 bg-white text-ink hover:bg-slate-50"}`}
                            onClick={() => setAuthForm({ ...authForm, role })}
                            aria-pressed={authForm.role === role}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {authError && (
                  <div id="auth-error" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
                    {authError}
                  </div>
                )}

                <div className="mt-6 space-y-3">
                  <ActionButton icon={authLoading ? null : UserRound} type="submit" className="w-full justify-center" disabled={Boolean(authLoading)}>
                    {authLoading && authLoading !== "Connecting to Google..." ? authLoading : authMode === "signup" ? "Create Account" : "Sign In"}
                  </ActionButton>
                  <button
                    type="button"
                    className="focus-ring w-full rounded-lg px-4 py-2.5 text-center text-sm font-black text-saffron transition hover:bg-blue-50"
                    onClick={() => {
                      setAuthError("");
                      setAuthMode(authMode === "signup" ? "signin" : "signup");
                    }}
                  >
                    {authMode === "signup" ? "Already have an account? Sign in" : "New to RozgaarAI? Create account"}
                  </button>
                  <button
                    type="button"
                    className="focus-ring w-full rounded-lg px-4 py-2.5 text-center text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-saffron"
                    onClick={() => {
                      setAuthMode("");
                      openDemoSection();
                    }}
                  >
                    {authMode === "signup" ? "Explore demo instead" : "Continue as Demo User"}
                  </button>
                </div>
              </div>

              <aside className="border-t border-slate-200 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 sm:p-8 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-3">
                  <img src={logoMark} alt={logoAlt} className="h-10 w-10 rounded-md object-contain" />
                  <div>
                    <p className="text-sm font-black text-ink">RozgaarAI</p>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-saffron">Secure Workspace</p>
                  </div>
                </div>
                <h3 className="mt-6 text-2xl font-black leading-tight text-ink">What you unlock</h3>
                <div className="mt-5 grid gap-3">
                  {[
                    [IdCard, "Saved Digital Career Identity"],
                    [FileText, "Professional PDF Resume"],
                    [WalletCards, "Income Passport"],
                    [BriefcaseBusiness, "AI Job Matches"],
                    [MessageSquare, "Interview Coach"],
                    [ShieldAlert, "Rights & Safety Checks"]
                  ].map(([Icon, label]) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-green-50 text-neem">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <Icon className="h-4 w-4 text-saffron" />
                      <p className="text-sm font-black text-ink">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Secure workspace", "Privacy friendly", "Demo-safe", "Data stays under your control"].map((badge) => (
                    <span key={badge} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">
                      {badge}
                    </span>
                  ))}
                </div>
              </aside>
            </div>
          </form>
        </div>
      )}

      <main>
        {routePath === "/" && (
        <section id="home" className="premium-mesh relative min-h-screen overflow-hidden">
          <img src={heroImage} alt={t.heroAlt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="hero-mask absolute inset-0" />
          <div className="absolute left-10 top-24 hidden h-24 w-24 rounded-full border border-white/10 bg-white/10 blur-[1px] lg:block" />
          <div className="absolute bottom-24 right-16 hidden h-32 w-32 rounded-full border border-emerald-300/20 bg-emerald-300/10 blur-sm lg:block" />
          <div className="section-shell section-fade relative grid min-h-screen items-center gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
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
                <ActionButton icon={PlayCircle} onClick={openDemoSection}>
                  {t.exploreDemo}
                </ActionButton>
                {account ? (
                  <ActionButton icon={Gauge} variant="secondary" onClick={() => navigateTo("/dashboard")}>
                    {lang === "hi" ? "Dashboard" : "Dashboard"}
                  </ActionButton>
                ) : (
                  <ActionButton icon={UserRound} variant="secondary" onClick={() => setAuthMode("signup")}>
                    {t.auth.createAccount}
                  </ActionButton>
                )}
              </div>
              <div className="mt-10 hidden max-w-2xl grid-cols-2 gap-3 sm:grid sm:grid-cols-4">
                {heroStats.map(([value, label]) => (
                  <div key={label} className="glass rounded-lg border border-white/30 px-4 py-3">
                    <p className="text-xl font-black text-ink">{value}</p>
                    <p className="mt-1 text-xs font-bold leading-4 text-slate-600">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full justify-center overflow-hidden py-4 lg:justify-start lg:py-0">
              <div className="pointer-events-none w-full max-w-[42rem] shrink-0 origin-center scale-[0.68] select-none sm:-my-28 lg:-my-36">
                <DigitalCareerIdentityCard identity={careerIdentity} labels={t.careerIdentity} variant="full" contentMode="identityOnly" />
              </div>
            </div>
          </div>
        </section>
        )}

        <Section
          id="product-dashboard"
          eyebrow={account ? (lang === "hi" ? "Product Workspace" : "Product Workspace") : (lang === "hi" ? "सुरक्षित एक्सेस" : "Secure Access")}
          title={account ? (lang === "hi" ? "Worker Dashboard" : "Worker Dashboard") : (lang === "hi" ? "Create your AI Employment Workspace" : "Create your AI Employment Workspace")}
          tone="warm"
        >
          {!account ? (
            <div className="panel grid gap-8 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1.02fr_0.98fr]">
              <div>
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-saffron shadow-sm">
                  <ShieldCheck className="h-7 w-7" />
                </span>
                <h3 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-ink">
                  {lang === "hi" ? "अपना AI Employment Workspace शुरू करें" : "Unlock your AI-powered employment workspace"}
                </h3>
                <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                  {lang === "hi"
                    ? "Save your Digital Career Identity, professional resume, income passport, job matches, interview practice, and safety checks in one secure workspace."
                    : "Save your Digital Career Identity, professional resume, income passport, job matches, interview practice, and safety checks in one secure workspace."}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    [IdCard, lang === "hi" ? "Save Digital Career Identity" : "Save Digital Career Identity"],
                    [FileText, lang === "hi" ? "Download ATS Resume anytime" : "Download ATS Resume anytime"],
                    [WalletCards, lang === "hi" ? "Store Income Passport" : "Store Income Passport"],
                    [BriefcaseBusiness, lang === "hi" ? "Track Job Matches" : "Track Job Matches"],
                    [MessageSquare, lang === "hi" ? "Continue Interview Practice" : "Continue Interview Practice"],
                    [ShieldAlert, lang === "hi" ? "Save Rights & Safety Checks" : "Save Rights & Safety Checks"]
                  ].map(([Icon, label]) => (
                    <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green-50 text-neem">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <Icon className="h-4 w-4 shrink-0 text-saffron" />
                      <p className="text-sm font-black leading-5 text-ink">{label}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500">
                  <Globe2 className="h-4 w-4 text-saffron" />
                  {lang === "hi" ? "Your workspace stays available across devices." : "Your workspace stays available across devices."}
                </p>

                {authPrepStep >= 0 && (
                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-black text-saffron">
                    {[
                      "Preparing your workspace...",
                      "Enabling AI assistant...",
                      "Creating secure profile...",
                      "Workspace ready ✓"
                    ][authPrepStep]}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <ActionButton icon={Sparkles} onClick={startSignupWorkspace} disabled={authPrepStep >= 0}>
                    {authPrepStep >= 0 ? "Preparing..." : "Create Free Account"}
                  </ActionButton>
                  <ActionButton icon={UserRound} variant="secondary" onClick={() => setAuthMode("signin")}>{t.auth.signIn}</ActionButton>
                  <button type="button" className="focus-ring rounded-lg px-3 py-2 text-sm font-black text-saffron hover:bg-blue-50" onClick={openDemoSection}>
                    {lang === "hi" ? "Explore sample demo" : "Explore sample demo"}
                  </button>
                </div>
              </div>

              <aside className="premium-card relative overflow-hidden p-5 sm:p-6">
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.14em] text-saffron">{lang === "hi" ? "My Workspace Preview" : "My Workspace Preview"}</p>
                      <h3 className="mt-2 text-2xl font-black text-ink">{lang === "hi" ? "Everything saved in one place" : "Everything saved in one place"}</h3>
                    </div>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-saffron">
                      <Gauge className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {[
                      [IdCard, "Digital Identity Saved", "✓"],
                      [FileText, "AI Resume Ready", "✓"],
                      [WalletCards, "Income Passport Active", "✓"],
                      [BriefcaseBusiness, "Job Matches", "12"],
                      [MessageSquare, "Interview Readiness", "94%"],
                      [ShieldAlert, "Safety Checks Saved", "✓"]
                    ].map(([Icon, label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-saffron">
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="text-sm font-black text-ink">{label}</p>
                        </div>
                        <span className="text-sm font-black text-neem">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "Secure Account",
                      "Synced Across Devices",
                      "Privacy Friendly",
                      "Made for India’s Workforce"
                    ].map((badge) => (
                      <span key={badge} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="panel grid gap-6 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="section-fade">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{account.role || "Worker"} Workspace</p>
                  <h3 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">
                    {lang === "hi" ? `Welcome back, ${account.name}` : `Welcome back, ${account.name}`}
                  </h3>
                  <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600">
                    {lang === "hi"
                      ? "Create your first Digital Worker Identity to unlock resumes, income records, verified cards, job matches, wage intelligence, interview practice, and safety checks."
                      : "Create your first Digital Worker Identity to unlock resumes, income records, verified cards, job matches, wage intelligence, interview practice, and safety checks."}
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {[
                      "AI Resume",
                      "Income Passport",
                      "Digital Worker Card",
                      "Job Matches",
                      "Wage Tracker",
                      "Interview Coach",
                      "Rights & Safety"
                    ].map((item) => (
                      <p key={item} className="flex items-center gap-2 text-sm font-black text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-neem" />
                        {item}
                      </p>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <ActionButton icon={Mic} onClick={() => navigateTo("/create-profile")}>{lang === "hi" ? "Create Worker Identity" : "Create Worker Identity"}</ActionButton>
                    {userProfiles.length > 0 && (
                      <ActionButton icon={IdCard} variant="secondary" onClick={() => openUserWorkerProfile(userProfiles[0])}>{lang === "hi" ? "Open Latest Profile" : "Open Latest Profile"}</ActionButton>
                    )}
                  </div>
                </div>
                <div className="premium-card p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.14em] text-saffron">{lang === "hi" ? "Getting Started" : "Getting Started"}</p>
                      <h4 className="mt-2 text-2xl font-black text-ink">{lang === "hi" ? "Workspace Progress" : "Workspace Progress"}</h4>
                    </div>
                    <span className="grid h-16 w-16 place-items-center rounded-full border border-blue-100 bg-blue-50 text-xl font-black text-saffron">
                      {dashboardProgress}%
                    </span>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-green-500 transition-all" style={{ width: `${dashboardProgress}%` }} />
                  </div>
                  <div className="mt-5 grid gap-2">
                    {checklistItems.map(([label, done]) => (
                      <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-black text-slate-700">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${done ? "border-green-200 bg-green-50 text-neem" : "border-slate-200 bg-slate-50 text-slate-400"}`}>
                          {done ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-slate-300" />}
                        </span>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {dashboardStats.map(([Icon, label, value]) => (
                  <article key={label} className="premium-card p-5">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-50 text-saffron">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-black text-ink">{value}</p>
                  </article>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                <section className="panel p-6 sm:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "Your Worker Profiles" : "Your Worker Profiles"}</p>
                      <h3 className="mt-2 text-2xl font-black text-ink">{lang === "hi" ? "Saved worker identities" : "Saved worker identities"}</h3>
                    </div>
                    <ActionButton icon={Mic} onClick={() => navigateTo("/create-profile")}>{lang === "hi" ? "Create Worker Identity" : "Create Worker Identity"}</ActionButton>
                  </div>
                  {userProfiles.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-saffron">
                        <IdCard className="h-8 w-8" />
                      </span>
                      <h4 className="mt-5 text-2xl font-black text-ink">{lang === "hi" ? "No worker profiles yet." : "No worker profiles yet."}</h4>
                      <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-600">
                        {lang === "hi"
                          ? "Create your first worker identity to begin using RozgaarAI."
                          : "Create your first worker identity to begin using RozgaarAI."}
                      </p>
                      <ActionButton icon={Mic} className="mt-5" onClick={() => navigateTo("/create-profile")}>{lang === "hi" ? "Create Worker Identity" : "Create Worker Identity"}</ActionButton>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                      {userProfiles.map((item) => {
                        const itemWorker = item.worker || {};
                        const initials = String(itemWorker.name || "Worker").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
                        const generatedDate = item.createdAt ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.createdAt)) : currentIssueDate;
                        const readiness = Math.max(78, Math.min(98, Number(item.matches?.[0]?.score || item.profile?.readiness || 90)));
                        return (
                          <article key={item.workerId} className="premium-card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex items-start gap-4">
                              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-100 via-white to-emerald-100 text-base font-black text-ink shadow-sm">
                                {initials}
                              </span>
                              <div className="min-w-0 flex-1">
                                <h4 className="break-words text-xl font-black text-ink">{itemWorker.name}</h4>
                                <p className="mt-1 text-sm font-bold text-slate-600">{roleLabel(itemWorker.skill)} • {cityLabel(itemWorker.city)}</p>
                                <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">Generated {generatedDate}</p>
                              </div>
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                              <div className="rounded-xl border border-slate-200 bg-white p-3">
                                <p className="text-xs font-bold text-slate-500">Readiness</p>
                                <p className="mt-1 text-lg font-black text-ink">{readiness}%</p>
                              </div>
                              <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                                <p className="text-xs font-black text-neem">Resume Ready</p>
                                <p className="mt-1 text-sm font-black text-ink">Yes</p>
                              </div>
                              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                                <p className="text-xs font-black text-saffron">Income Passport</p>
                                <p className="mt-1 text-sm font-black text-ink">{item.wageEntries?.length ? "Active" : "Ready"}</p>
                              </div>
                            </div>
                            <ActionButton icon={ChevronRight} className="mt-5 w-full justify-center" onClick={() => openUserWorkerProfile(item)}>
                              {lang === "hi" ? "View Profile" : "View Profile"}
                            </ActionButton>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                <aside className="panel p-6 sm:p-7">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-saffron">{lang === "hi" ? "Recent Activity" : "Recent Activity"}</p>
                  <h3 className="mt-2 text-2xl font-black text-ink">{lang === "hi" ? "Workspace timeline" : "Workspace timeline"}</h3>
                  <div className="mt-5 space-y-3">
                    {userActivity.length ? userActivity.map(([label, date, detail]) => (
                      <div key={`${label}-${date}-${detail || ""}`} className="flex gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green-50 text-neem">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-black text-ink">{label}</p>
                          {detail && <p className="mt-0.5 text-xs font-bold text-slate-500">{detail}</p>}
                          <p className="mt-1 text-xs font-bold text-slate-400">{date ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(date)) : currentIssueDate}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm font-bold leading-6 text-slate-600">
                        {lang === "hi" ? "Your workspace activity will appear here after you create a worker identity." : "Your workspace activity will appear here after you create a worker identity."}
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </div>
          )}
        </Section>

        {routePath !== "/dashboard" && (
        <>
        {!account && (
        <Section id="demo" eyebrow={t.demoMode.eyebrow} title={t.demoMode.title}>
          {!account && (
            <div className="mb-6 flex min-h-[76px] items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white px-3 py-3 shadow-sm sm:gap-5 sm:px-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-neem">
                  <CheckCircle2 className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold leading-5 text-ink sm:text-sm">{t.demoMode.active}</p>
                  <p className="mt-0.5 truncate text-[13px] font-medium leading-5 text-slate-600 sm:text-sm">{t.demoMode.bannerCopy}</p>
                </div>
              </div>
              <div className="flex shrink-0">
                <ActionButton icon={PlayCircle} className="min-h-9 px-2.5 py-1.5 text-xs sm:px-3" onClick={openDemoSection}>
                  {t.exploreDemo}
                </ActionButton>
              </div>
            </div>
          )}
          <p className="mb-8 max-w-3xl text-base font-medium leading-7 text-slate-600">
            {account
              ? (lang === "hi" ? "Sample profiles help teams understand the full RozgaarAI workflow without mixing them with saved worker records." : "Sample profiles help teams understand the full RozgaarAI workflow without mixing them with saved worker records.")
              : t.demoMode.subtitle}
          </p>
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
            {demoProfiles.map((profileData, index) => (
              <article
                key={profileData.workerId}
                className={`demo-worker-card group flex min-w-0 flex-col rounded-xl border border-slate-200 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg ${
                  profileData.workerId === featuredJourneyProfile.workerId ? "ring-1 ring-blue-100/70" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-100 via-white to-emerald-100 text-base font-black text-ink shadow-md shadow-blue-100/60 transition duration-300 group-hover:scale-[1.03] group-hover:shadow-lg group-hover:shadow-emerald-100/70">
                      {profileData.avatar}
                    </div>
                    <div className="min-w-0">
                      <h3 className="break-words text-[1.35rem] font-black leading-7 text-ink">{profileData.name}</h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold leading-5 text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
                          {roleLabel(profileData.skill)}
                        </span>
                        <span className="hidden text-slate-300 sm:inline">•</span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {cityLabel(profileData.city)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-black text-neem shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {t.verified}
                  </span>
                </div>

                {profileData.workerId === featuredJourneyProfile.workerId && (
                  <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-saffron shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    {lang === "hi" ? "Recommended Journey" : "Recommended Journey"}
                  </p>
                )}

                <div className="mt-5 grid gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white/80">
                  {[
                    [CalendarClock, t.fields.experience, `${profileData.experience} ${t.common.years}`],
                    [Gauge, t.demoMode.readiness, `${profileData.readiness}/100`],
                    [TrendingUp, t.bestMatch, `${profileData.jobMatch}%`]
                  ].map(([Icon, label, value], metricIndex) => (
                    <div key={label} className={`flex items-center justify-between gap-4 px-3.5 py-3 ${metricIndex ? "border-t border-slate-100" : ""}`}>
                      <p className="inline-flex min-w-0 items-center gap-2 text-[13px] font-bold leading-5 text-slate-600">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-saffron">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="truncate">{label}</span>
                      </p>
                      <p className="shrink-0 text-lg font-black text-ink">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 pb-4">
                  {[
                    lang === "hi" ? "AI Resume" : "AI Resume",
                    lang === "hi" ? "Income Passport" : "Income Passport",
                    lang === "hi" ? "Interview Ready" : "Interview Ready",
                    lang === "hi" ? "Verified Identity" : "Verified Identity"
                  ].map((badge) => (
                    <span key={badge} className="inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black leading-3 text-slate-700 transition duration-300 group-hover:border-green-200 group-hover:bg-green-50 group-hover:text-neem">
                      ✓ {badge}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="focus-ring button-press mt-auto inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-saffron px-4 text-sm font-black text-white shadow-sm transition duration-300 hover:bg-blue-700 group-hover:bg-blue-700 group-hover:shadow-md"
                  onClick={() => openDemoWorker(profileData)}
                >
                  {lang === "hi" ? "Explore Worker Journey" : "Explore Worker Journey"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </Section>
        )}

        <Section id="trusted-impact" eyebrow={t.landing.impactEyebrow} title={lang === "hi" ? "RozgaarAI श्रमिकों को भरोसेमंद डिजिटल रोजगार पहचान देता है" : "RozgaarAI turns worker experience into trusted employment proof"}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Mic, lang === "hi" ? "आवाज़ से AI ऑनबोर्डिंग" : "Voice-first AI Onboarding", lang === "hi" ? "श्रमिक हिन्दी या English में बोलते हैं, AI सेकंडों में रोजगार प्रोफ़ाइल बनाता है।" : "Workers simply speak in Hindi or English. AI creates a structured employment profile in seconds."],
              [FileText, lang === "hi" ? "AI बायोडाटा जनरेशन" : "AI Resume Generation", lang === "hi" ? "बोले गए अनुभव से नियोक्ता को भेजने योग्य बायोडाटा और PDF तैयार होता है।" : "Spoken experience becomes an employer-ready resume and polished PDF."],
              [IdCard, lang === "hi" ? "डिजिटल करियर पहचान" : "Digital Career Identity", lang === "hi" ? "कौशल, काम का इतिहास, QR और सत्यापन एक भरोसेमंद पहचान में जुड़ते हैं।" : "Skills, work history, QR verification, and credibility live in one identity."],
              [ShieldAlert, lang === "hi" ? "AI नौकरी सुरक्षा जांच" : "AI Job Safety Analysis", lang === "hi" ? "AI फर्जी नौकरी, फीस, दस्तावेज़ मांग और असुरक्षित संकेत पहले ही पकड़ता है।" : "AI flags fake jobs, fees, document requests, and unsafe signals before workers accept."],
            ].map(([Icon, title, copy]) => (
              <div key={title} className="premium-card h-full p-6">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-blue-100 bg-blue-50 text-saffron shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-black leading-6 text-ink">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{copy}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="about" eyebrow={t.landing.problemEyebrow} title={lang === "hi" ? "लाखों कुशल श्रमिक अवसर खो देते हैं, अनुभव की कमी से नहीं, बल्कि उसके भरोसेमंद प्रमाण की कमी से।" : "Millions of skilled workers lose opportunities every day, not because they lack experience, but because they lack trusted proof of it."} tone="warm">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [lang === "hi" ? "औपचारिक बायोडाटा नहीं" : "No Formal Resume", lang === "hi" ? "सालों का अनुभव होने पर भी नियोक्ता उसे भरोसेमंद तरीके से verify नहीं कर पाते।" : "Employers cannot verify experience, even when workers have years of practical skills."],
              [lang === "hi" ? "भरोसेमंद पहचान नहीं" : "No Trusted Identity", lang === "hi" ? "सत्यापित डिजिटल प्रोफ़ाइल के बिना कौशल अदृश्य रह जाता है।" : "Skills remain invisible without a verified digital profile."],
              [lang === "hi" ? "असुरक्षित नौकरी ऑफर" : "Unsafe Job Offers", lang === "hi" ? "फर्जी भर्ती करने वाले, रजिस्ट्रेशन फीस और अधूरे पते श्रमिकों को जोखिम में डालते हैं।" : "Workers risk scams, fake recruiters, and illegal registration fees."],
              [lang === "hi" ? "अनुचित मजदूरी" : "Unfair Wages", lang === "hi" ? "बाज़ार की सही जानकारी न होने पर श्रमिक अक्सर अपनी योग्यता से कम भुगतान स्वीकार करते हैं।" : "Without market insights, workers often accept lower pay than they deserve."],
              [lang === "hi" ? "भाषा की बाधा" : "Language Barriers", lang === "hi" ? "English-first सिस्टम करोड़ों श्रमिकों को डिजिटल रोजगार साधनों से दूर रखते हैं।" : "English-first systems prevent millions from accessing digital employment tools."],
              [lang === "hi" ? "कम साक्षात्कार भरोसा" : "Low Interview Confidence", lang === "hi" ? "काम आता है, लेकिन कई श्रमिक अपनी क्षमता को साफ और भरोसे से पेश नहीं कर पाते।" : "Workers know the job but struggle to present themselves effectively."]
            ].map(([title, copy], index) => {
              const Icon = problemIcons[index];
              return (
                <article key={title} className="premium-card h-full p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-blue-100 bg-blue-50 text-saffron shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-black leading-6 text-ink">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{copy}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-8 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h3 className="text-2xl font-black leading-tight text-ink">
                  {lang === "hi" ? "भरोसेमंद प्रमाण के बिना अनुभव अदृश्य रह जाता है।" : "Without trusted proof, experience remains invisible."}
                </h3>
                <p className="mt-3 max-w-4xl text-sm font-semibold leading-7 text-slate-700">
                  {lang === "hi"
                    ? "RozgaarAI बोली गई जानकारी को सत्यापित डिजिटल पहचान, AI बायोडाटा, रोजगार रिकॉर्ड, सुरक्षित नौकरी अवसर और साक्षात्कार तैयारी में बदलता है।"
                    : "RozgaarAI transforms spoken experience into verified digital identity, AI-generated resumes, employment records, safer job opportunities, and interview readiness."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-700">
                {[
                  [Mic, lang === "hi" ? "बोलें" : "Speak"],
                  [Sparkles, lang === "hi" ? "AI समझता है" : "AI Understands"],
                  [IdCard, lang === "hi" ? "डिजिटल पहचान" : "Digital Identity"],
                  [BriefcaseBusiness, lang === "hi" ? "बेहतर अवसर" : "Better Opportunities"]
                ].map(([Icon, label], index, items) => (
                  <span key={label} className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                      <Icon className="h-4 w-4 text-saffron" />
                      {label}
                    </span>
                    {index < items.length - 1 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="journey"
          eyebrow={t.landing.journeyEyebrow}
          title={lang === "hi" ? "बोले गए अनुभव से सत्यापित रोजगार तक" : "From spoken experience to verified employment"}
        >
          <p className="-mt-4 mb-8 max-w-3xl text-base font-semibold leading-7 text-slate-600">
            {lang === "hi"
              ? "RozgaarAI वास्तविक काम को भरोसेमंद डिजिटल पहचान, आय रिकॉर्ड, बायोडाटा, नौकरी मिलान और साक्षात्कार तैयारी में बदलता है।"
              : "RozgaarAI turns real-world work into a trusted digital identity, income record, resume, job matches, and interview readiness."}
          </p>
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="absolute left-8 right-8 top-[4.35rem] hidden h-px bg-gradient-to-r from-blue-100 via-emerald-200 to-blue-100 lg:block" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {[
                [Mic, lang === "hi" ? "बोलें" : "Speak", lang === "hi" ? "श्रमिक अपनी कहानी आवाज़ या टेक्स्ट से बताते हैं।" : "Workers share their story by voice or text."],
                [Sparkles, lang === "hi" ? "AI प्रोफ़ाइल" : "AI Profile", lang === "hi" ? "AI अनुभव को साफ रोजगार प्रोफ़ाइल में बदलता है।" : "AI structures experience into an employment profile."],
                [IdCard, lang === "hi" ? "डिजिटल पहचान" : "Digital Identity", lang === "hi" ? "कौशल, QR और सत्यापन एक जगह आते हैं।" : "Skills, QR, and verification come together."],
                [WalletCards, lang === "hi" ? "आय पासपोर्ट" : "Income Passport", lang === "hi" ? "काम और भुगतान का भरोसेमंद रिकॉर्ड बनता है।" : "Work and payment history become portable proof."],
                [BriefcaseBusiness, lang === "hi" ? "नौकरी मिलान" : "Job Match", lang === "hi" ? "कौशल, शहर, भाषा और सुरक्षा से अवसर मिलते हैं।" : "Opportunities match skill, city, language, and safety."],
                [MessageSquare, lang === "hi" ? "साक्षात्कार अभ्यास" : "Interview Coach", lang === "hi" ? "श्रमिक जवाब बोलकर आत्मविश्वास बढ़ाते हैं।" : "Workers practice answers and build confidence."],
                [CheckCircle2, lang === "hi" ? "रोज़गार" : "Employment", lang === "hi" ? "सत्यापित पहचान के साथ बेहतर अवसर मिलते हैं।" : "Verified identity leads to better opportunities."]
              ].map(([Icon, title, copy], index, items) => (
                <article key={title} className="group relative rounded-xl border border-slate-200 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-soft">
                  <span className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-blue-100 bg-blue-50 text-saffron shadow-sm transition group-hover:border-emerald-200 group-hover:bg-emerald-50">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-base font-black leading-5 text-ink">{title}</h3>
                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{copy}</p>
                  {index < items.length - 1 && (
                    <ChevronRight className="absolute -right-3 top-16 z-20 hidden h-5 w-5 rounded-full bg-white text-slate-400 lg:block" />
                  )}
                </article>
              ))}
            </div>
          </div>
        </Section>

        <Section
          id="features"
          eyebrow={t.landing.featuresEyebrow}
          title={lang === "hi" ? "एक प्लेटफ़ॉर्म जो अनुभव को रोजगार भरोसे में बदलता है" : "One platform that converts experience into employment trust"}
          tone="warm"
        >
          <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
            <article className="premium-card group relative overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lift">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-saffron">
                    <BadgeCheck className="h-4 w-4" />
                    {lang === "hi" ? "मुख्य सुविधा" : "Flagship"}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    {lang === "hi" ? "सत्यापित QR" : "Verified QR"}
                  </span>
                </div>
                <h3 className="mt-5 max-w-xl text-2xl font-black leading-tight text-ink sm:text-3xl">
                  {lang === "hi" ? "डिजिटल करियर पहचान और आय पासपोर्ट" : "Digital Career Identity & Income Passport"}
                </h3>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                  {lang === "hi"
                    ? "एक पोर्टेबल सत्यापित पहचान जो बायोडाटा, कौशल प्रमाण, काम का इतिहास, आय रिकॉर्ड और सार्वजनिक प्रोफ़ाइल को जोड़ती है।"
                    : "A portable verified identity that combines resume, skill proof, work history, income records, and public profile."}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-2xl border border-slate-200 bg-ink p-5 text-white shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-sm font-black">{featuredJourneyProfile.name.split(" ").map((part) => part[0]).join("")}</span>
                        <div>
                          <p className="text-lg font-black leading-5">{featuredJourneyProfile.name}</p>
                          <p className="mt-1 text-xs font-bold text-blue-100">{featuredJourneyProfile.skill} • {featuredJourneyProfile.city}</p>
                        </div>
                      </div>
                      <BadgeCheck className="h-5 w-5 text-neem" />
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                        <p className="text-xs font-bold text-blue-100">{lang === "hi" ? "श्रमिक ID" : "Worker ID"}</p>
                        <p className="mt-1 font-black">{featuredJourneyProfile.workerId}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                        <p className="text-xs font-bold text-blue-100">{lang === "hi" ? "तैयारी" : "Readiness"}</p>
                        <p className="mt-1 font-black">{featuredJourneyProfile.readiness}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid h-24 w-24 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-300">
                      <IdCard className="h-10 w-10" />
                    </div>
                    <p className="mt-4 text-sm font-black text-ink">{lang === "hi" ? "सार्वजनिक प्रोफ़ाइल QR" : "Public Profile QR"}</p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                      {lang === "hi" ? "नियोक्ता QR स्कैन करके सत्यापित प्रोफ़ाइल, बायोडाटा और काम का इतिहास देख सकता है।" : "Employers can scan to view verified profile, resume, and work history."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="focus-ring button-press mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-saffron px-5 text-sm font-black text-white shadow-sm transition duration-300 hover:bg-blue-700 group-hover:gap-3"
                  onClick={() => openDemoWorker(featuredJourneyProfile)}
                >
                  {lang === "hi" ? "लाइव श्रमिक पहचान देखें" : "Explore Live Worker Identity"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                [Mic, lang === "hi" ? "Voice AI Onboarding" : "Voice AI Onboarding", lang === "hi" ? "श्रमिक हिन्दी या English में स्वाभाविक रूप से बोलते हैं और AI रोजगार प्रोफ़ाइल बनाता है।" : "Workers speak naturally in Hindi or English and AI builds a structured employment profile.", () => navigateTo("/create-profile")],
                [FileText, lang === "hi" ? "AI Resume Generator" : "AI Resume Generator", lang === "hi" ? "वास्तविक काम के अनुभव से तुरंत पेशेवर बायोडाटा तैयार होता है।" : "Professional resume generated instantly from real work experience.", () => openDemoWorker(featuredJourneyProfile)],
                [Search, lang === "hi" ? "Explainable Job Matching" : "Explainable Job Matching", lang === "hi" ? "कौशल, शहर, मजदूरी, भाषा और सुरक्षा संकेतों से नौकरियाँ सुझाई जाती हैं।" : "Jobs recommended using skill, location, wage expectations, language, and safety signals.", () => openDemoWorker(featuredJourneyProfile)],
                [MessageSquare, lang === "hi" ? "AI Interview Coach" : "AI Interview Coach", lang === "hi" ? "Hindi या English में भूमिका के अनुसार सवालों का अभ्यास करें और बेहतर जवाब पाएं।" : "Practice role-specific questions in Hindi or English with feedback and improved answers.", () => openDemoWorker(featuredJourneyProfile)]
              ].map(([Icon, title, copy, action]) => (
                <button
                  key={title}
                  type="button"
                  onClick={action}
                  className="premium-card group flex h-full items-start gap-4 p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-soft"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-blue-100 bg-blue-50 text-saffron transition group-hover:border-emerald-200 group-hover:bg-emerald-50">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-base font-black leading-5 text-ink">{title}</span>
                    <span className="mt-2 block text-sm font-semibold leading-6 text-slate-600">{copy}</span>
                  </span>
                  <ChevronRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-saffron" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [IndianRupee, lang === "hi" ? "Fair Wage Intelligence" : "Fair Wage Intelligence", lang === "hi" ? "स्थानीय मजदूरी जानकारी श्रमिकों को बेहतर बातचीत और सही अपेक्षा में मदद करती है।" : "Local wage guidance helps workers negotiate better and set fair expectations."],
              [ShieldAlert, lang === "hi" ? "AI Rights & Safety Assistant" : "AI Rights & Safety Assistant", lang === "hi" ? "जोखिम भरे ऑफर, जमा राशि, दस्तावेज़ दुरुपयोग और नौकरी धोखाधड़ी पहले ही पकड़े।" : "Detect risky offers, deposits, document misuse, and job scams before accepting work."],
              [Building2, lang === "hi" ? "Employer Dashboard" : "Employer Dashboard", lang === "hi" ? "नियोक्ता पहचान, QR, बायोडाटा और match context के साथ सत्यापित श्रमिक खोजते हैं।" : "Employers discover verified workers with identity, QR, resume, and match context."],
              [Landmark, lang === "hi" ? "Impact Dashboard" : "Impact Dashboard", lang === "hi" ? "NGO और partners worker outcomes, safety alerts, wage uplift और employability track कर सकते हैं।" : "NGOs and partners track worker outcomes, safety alerts, wage uplift, and employability."]
            ].map(([Icon, title, copy]) => (
              <article key={title} className="premium-card group h-full p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-soft">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-50 text-saffron transition group-hover:border-emerald-200 group-hover:bg-emerald-50">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-black leading-5 text-ink">{title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </Section>

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
              <div className="mb-5 rounded-lg border border-slate-200 bg-blue-50/70 p-4">
                <Field label={t.smartInput.title} hint={t.smartInput.hint}>
                  <Textarea value={smartInput} onChange={(event) => setSmartInput(event.target.value)} placeholder={t.smartInput.placeholder} />
                </Field>
                <ActionButton icon={Sparkles} className="mt-3" variant="secondary" onClick={() => applySmartInput()}>
                  {t.smartInput.extract}
                </ActionButton>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.fields.workerName}><Input placeholder={t.placeholders.workerName} value={worker.name} onChange={(e) => updateWorker("name", e.target.value)} /></Field>
                <Field label={t.fields.phone}><Input placeholder={t.placeholders.phone} value={worker.phone} onChange={(e) => updateWorker("phone", e.target.value)} /></Field>
                <Field label={t.fields.city}><Select value={worker.city} onChange={(e) => updateWorker("city", e.target.value)}><option value="">{t.placeholders.city}</option>{cities.map((city) => <option key={city} value={city}>{cityLabel(city)}</option>)}</Select></Field>
                <Field label={t.fields.primarySkill}><Select value={worker.skill} onChange={(e) => updateWorker("skill", e.target.value)}><option value="">{t.placeholders.primarySkill}</option>{jobRoles.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</Select></Field>
                <Field label={t.fields.experience}><Input type="number" min="0" value={worker.experience} onChange={(e) => updateWorker("experience", e.target.value)} /></Field>
                <Field label={t.fields.expectedWage}><Input placeholder={t.placeholders.expectedWage} type="number" min="0" value={worker.expectedWage} onChange={(e) => updateWorker("expectedWage", e.target.value)} /></Field>
                <Field label={t.fields.languages}><Input value={worker.languages} onChange={(e) => updateWorker("languages", e.target.value)} /></Field>
                <Field label={t.fields.availability}><Input value={worker.availability} onChange={(e) => updateWorker("availability", e.target.value)} /></Field>
              </div>
              <div className="mt-4">
                <Field label={t.fields.workDetails}><Textarea placeholder={t.placeholders.workDetails} value={worker.notes} onChange={(e) => updateWorker("notes", e.target.value)} /></Field>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <ActionButton icon={Sparkles} onClick={buildProfile} disabled={isGenerating}>{isGenerating ? t.loadingProfile : t.createProfile}</ActionButton>
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
              <ActionButton icon={UserRound} className="mt-3 sm:mt-0" variant="secondary" onClick={() => setAuthMode("signup")}>
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
              <p className="mt-5 leading-7 text-slate-700">{lang === "hi" && risk.flags.length ? t.riskAdvice : risk.advice}</p>
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

        <Section
          id="employers"
          eyebrow={t.employerDashboard.eyebrow}
          title={lang === "hi" ? "भरोसे के साथ सत्यापित श्रमिक नियुक्त करें।" : "Hire verified workers with confidence."}
        >
          <div className="mx-auto max-w-[1360px] space-y-6">
            <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <article className="premium-card p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <img src={logoMark} alt={logoAlt} className="h-11 w-11 rounded-md object-contain" />
                  <div>
                    <p className="text-sm font-black text-ink">RozgaarAI</p>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-saffron">{lang === "hi" ? "Employer Intelligence" : "Employer Intelligence"}</p>
                  </div>
                </div>
                <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-700">
                  {lang === "hi"
                    ? "Verified identity, work history, income records, AI matching और employment readiness के आधार पर सही श्रमिक खोजें।"
                    : "Search workers using verified identity, work history, income records, AI matching, and employment readiness."}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    lang === "hi" ? "सत्यापित पहचान" : "Verified Identity",
                    lang === "hi" ? "AI Match" : "AI Match",
                    lang === "hi" ? "भरोसेमंद काम इतिहास" : "Trusted Work History"
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
                    placeholder={lang === "hi" ? "कौशल, शहर, भाषा, मजदूरी या उपलब्धता खोजें..." : "Search by skill, city, language, wage, or availability..."}
                    className="min-h-14 rounded-xl border-slate-200 bg-white pl-12 text-base font-bold shadow-sm focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    ["Verified Only", lang === "hi" ? "Verified Only" : "Verified Only"],
                    ["Immediate Joiners", lang === "hi" ? "Immediate Joiners" : "Immediate Joiners"],
                    ["Highest Match", lang === "hi" ? "Highest Match" : "Highest Match"],
                    ["Women Workers", lang === "hi" ? "Women Workers" : "Women Workers"],
                    ["Nearby", lang === "hi" ? "Nearby" : "Nearby"],
                    ["Interview Ready", lang === "hi" ? "Interview Ready" : "Interview Ready"]
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
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-saffron">{lang === "hi" ? "AI Recommendation" : "AI Recommendation"}</p>
                  <p className="mt-2 text-lg font-black leading-7 text-ink">
                    {lang === "hi"
                      ? `हमें ${employerWorkers.length} सत्यापित श्रमिक मिले। ${employerWorkers.filter((item) => /available|immediate|तुरंत|उपलब्ध/i.test(item.availability || "")).length} तुरंत उपलब्ध हैं। ${employerWorkers.filter((item) => Number(item.readiness || 0) >= 90).length} की employment readiness 90% से अधिक है।`
                      : `We found ${employerWorkers.length} verified workers. ${employerWorkers.filter((item) => /available|immediate/i.test(item.availability || "")).length} are available immediately. ${employerWorkers.filter((item) => Number(item.readiness || 0) >= 90).length} have employment readiness above 90%.`}
                  </p>
                </div>
              </article>

              <article className="premium-card p-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    [Search, lang === "hi" ? "Search" : "Search"],
                    [ShieldCheck, lang === "hi" ? "Verify" : "Verify"],
                    [MessageSquare, lang === "hi" ? "Contact" : "Contact"],
                    [CheckCircle2, lang === "hi" ? "Hire" : "Hire"]
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

            <div className="grid gap-5 lg:grid-cols-3">
              {employerWorkers.map((item) => {
                const itemId = item.workerId || createWorkerId(item);
                const itemUrl = `${publicAppUrl}/worker/${itemId}`;
                const itemMatch = item.jobMatch || 90;
                return (
                  <article key={itemId} className="premium-card group flex h-full flex-col p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lift">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-emerald-500 text-sm font-black text-white shadow-sm">
                          {item.avatar || item.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("")}
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
                        <p className="text-xs font-bold text-slate-500">{lang === "hi" ? "अपेक्षित मजदूरी" : "Expected wage"}</p>
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
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-saffron">{lang === "hi" ? "Resume Ready" : "Resume Ready"}</span>
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-saffron">{lang === "hi" ? "Income Passport" : "Income Passport"}</span>
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-saffron">{lang === "hi" ? "Interview Ready" : "Interview Ready"}</span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-2xl font-black text-ink">{itemMatch}% <span className="text-sm font-black text-slate-500">{t.match}</span></p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-saffron shadow-sm">{lang === "hi" ? "Why?" : "Why?"}</span>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600">
                        {[
                          lang === "hi" ? "Skill match" : "Skill match",
                          lang === "hi" ? "Nearby location" : "Nearby location",
                          lang === "hi" ? "Wage expectation aligned" : "Wage expectation aligned",
                          lang === "hi" ? "Verified work history" : "Verified work history",
                          lang === "hi" ? "Available immediately" : "Available immediately"
                        ].map((reason) => (
                          <span key={reason} className="inline-flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-neem" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 text-sm font-semibold text-slate-600">
                      {lang === "hi" ? "भाषाएँ" : "Languages"}: <span className="font-black text-ink">{item.languages}</span>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                      <button type="button" className="button-press min-h-10 flex-1 rounded-lg bg-saffron px-4 text-sm font-black text-white transition hover:bg-blue-700" onClick={() => openDemoWorker(item)}>
                        {lang === "hi" ? "View Worker" : "View Worker"}
                      </button>
                      <button type="button" className="button-press min-h-10 rounded-lg border border-blue-200 bg-white px-4 text-sm font-black text-ink transition hover:bg-blue-50" onClick={() => shortlistWorker(itemId)}>
                        {shortlistedWorkers.includes(itemId) ? t.employerDashboard.shortlisted : t.employerDashboard.shortlist}
                      </button>
                      <details className="relative">
                        <summary className="button-press flex min-h-10 cursor-pointer list-none items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-600 transition hover:bg-slate-50">
                          {lang === "hi" ? "More" : "More"}
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
              <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">{lang === "hi" ? "Trusted hiring ecosystem" : "Trusted hiring ecosystem"}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  lang === "hi" ? "Used by NGOs" : "Used by NGOs",
                  lang === "hi" ? "Housing Societies" : "Housing Societies",
                  lang === "hi" ? "Facility Companies" : "Facility Companies",
                  lang === "hi" ? "Verified Employers" : "Verified Employers"
                ].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </Section>

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

        {routePath === "/" && (
        <section className="bg-white py-12 sm:py-16">
          <div className="section-shell">
            <div className="mb-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              {[
                [Mic, lang === "hi" ? "Voice AI" : "Voice AI"],
                [IdCard, lang === "hi" ? "Verified Identity" : "Verified Identity"],
                [WalletCards, lang === "hi" ? "Income Passport" : "Income Passport"],
                [FileText, lang === "hi" ? "AI Resume" : "AI Resume"],
                [BriefcaseBusiness, lang === "hi" ? "Job Matching" : "Job Matching"],
                [MessageSquare, lang === "hi" ? "Interview Coach" : "Interview Coach"],
                [ShieldAlert, lang === "hi" ? "Rights Protection" : "Rights Protection"]
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
                    {lang === "hi" ? "हर श्रमिक को भरोसेमंद डिजिटल पहचान मिलनी चाहिए।" : "Every Worker Deserves a Trusted Digital Identity."}
                  </h2>
                  <p className="mt-5 max-w-2xl text-base font-semibold leading-8 text-blue-50">
                    {lang === "hi"
                      ? "RozgaarAI बोले गए अनुभव को सत्यापित पहचान, भरोसेमंद आय इतिहास, पेशेवर बायोडाटा, सुरक्षित नौकरी अवसर और अधिक रोजगार आत्मविश्वास में बदलता है।"
                      : "RozgaarAI converts spoken experience into a verified identity, trusted income history, professional resume, safer job opportunities, and greater employment confidence."}
                  </p>
                  <p className="mt-5 max-w-2xl text-sm font-bold leading-7 text-blue-100">
                    {lang === "hi"
                      ? "भारत भर के श्रमिकों, नियोक्ताओं, NGO, housing societies और workforce development programs के लिए बनाया गया।"
                      : "Designed for workers, employers, NGOs, housing societies, and workforce development programs across India."}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <ActionButton icon={Mic} variant="secondary" onClick={() => navigateTo("/create-profile")}>
                      {lang === "hi" ? "Start Voice Onboarding" : "Start Voice Onboarding"}
                    </ActionButton>
                    <ActionButton icon={PlayCircle} variant="dark" onClick={openDemoSection}>
                      {lang === "hi" ? "Explore Demo Workers" : "Explore Demo Workers"}
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
                          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-200">{lang === "hi" ? "Digital Career Identity" : "Digital Career Identity"}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-300/30 bg-green-400/10 px-3 py-1 text-xs font-black text-emerald-100">
                        <BadgeCheck className="h-4 w-4" />
                        {t.verified}
                      </span>
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                      <span className="grid h-16 w-16 place-items-center rounded-full border border-emerald-300/50 bg-white/10 text-xl font-black">
                        {featuredJourneyProfile.avatar || featuredJourneyProfile.name.split(" ").map((part) => part[0]).join("")}
                      </span>
                      <div>
                        <p className="text-2xl font-black leading-tight">{featuredJourneyProfile.name}</p>
                        <p className="mt-1 text-sm font-bold text-blue-100">{roleLabel(featuredJourneyProfile.skill)} • {cityLabel(featuredJourneyProfile.city)}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-100">{lang === "hi" ? "Worker ID" : "Worker ID"}</p>
                        <p className="mt-2 text-xl font-black">{featuredJourneyProfile.workerId}</p>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-emerald-100">
                          <Gauge className="h-4 w-4" />
                          {featuredJourneyProfile.readiness}% {lang === "hi" ? "Employment Readiness" : "Employment Readiness"}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white p-4 text-ink">
                        <div className="grid h-24 w-24 place-items-center rounded-xl border border-slate-200 bg-slate-50">
                          <QRCodeCanvas value={`${publicAppUrl}/worker/${featuredJourneyProfile.workerId}`} size={76} level="H" includeMargin />
                        </div>
                        <p className="mt-2 text-center text-[10px] font-black text-slate-500">{lang === "hi" ? "Scan verified profile" : "Scan verified profile"}</p>
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

        <footer className="border-t border-slate-200 bg-white py-10">
          <div className="section-shell grid gap-8 text-sm font-bold text-slate-600 lg:grid-cols-[1.15fr_0.9fr_0.75fr]">
            <div>
              <div className="flex items-center gap-3">
                <img src={logoMark} alt={logoAlt} className="h-11 w-11 rounded-md object-contain" />
                <div>
                  <p className="font-black text-ink">RozgaarAI</p>
                  <p className="text-xs font-black text-slate-500">{lang === "hi" ? "Digital Career Identity & Income Passport" : "Digital Career Identity & Income Passport"}</p>
                </div>
              </div>
              <p className="mt-4 max-w-md leading-7 text-slate-600">
                {lang === "hi"
                  ? "भारत के असंगठित श्रमिकों के वास्तविक अनुभव को भरोसेमंद रोजगार पहचान और आर्थिक गरिमा में बदलना।"
                  : "Turning real experience from India's informal workforce into trusted employment identity and economic dignity."}
              </p>
              <p className="mt-3 text-xs text-slate-400">{t.landing.footerMade}</p>
            </div>

            <nav aria-label="RozgaarAI footer navigation" className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-1">
              {[
                [lang === "hi" ? "Workers" : "Workers", "#demo"],
                [lang === "hi" ? "Employers" : "Employers", "/employer"],
                [lang === "hi" ? "NGOs" : "NGOs", "#impact"],
                [lang === "hi" ? "Impact" : "Impact", "#trusted-impact"],
                [lang === "hi" ? "About" : "About", "#about"]
              ].map(([label, href]) => (
                <a key={label} href={href} className="transition hover:text-saffron">{label}</a>
              ))}
            </nav>

            <div className="grid gap-3">
              <a href="https://github.com/" className="transition hover:text-saffron">GitHub</a>
              <a href="/docs" className="transition hover:text-saffron">{lang === "hi" ? "Documentation" : "Documentation"}</a>
              <span>{t.landing.license}</span>
              <a href="mailto:hello@rozgaarai.demo" className="transition hover:text-saffron">{lang === "hi" ? "Contact" : "Contact"}</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
