import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Database,
  Download,
  Edit3,
  FileCheck2,
  Globe2,
  Languages,
  Link2,
  LockKeyhole,
  Mail,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { languageConfig } from "../../../i18n/translations";

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-[14px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.045)] transition hover:border-blue-100 hover:shadow-[0_16px_34px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </section>
  );
}

function IconBox({ icon: Icon, tone }) {
  return <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>;
}

function SettingsCard({ icon, tone, title, subtitle, children, action, danger = false, actionTone = "blue", className = "", contentClassName = "" }) {
  const actionStyles = {
    blue: "border-blue-300 bg-white text-blue-700 hover:bg-blue-50",
    green: "border-green-300 bg-white text-green-700 hover:bg-green-50",
    purple: "border-violet-300 bg-white text-violet-700 hover:bg-violet-50",
    orange: "border-orange-300 bg-white text-orange-600 hover:bg-orange-50",
    cyan: "border-cyan-300 bg-white text-cyan-700 hover:bg-cyan-50",
    red: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
  };
  return (
    <Card className={`flex min-h-[240px] flex-col p-4 ${className}`}>
      <div className="flex shrink-0 items-start gap-3">
        <IconBox icon={icon} tone={tone} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-[11px] font-bold leading-4 text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className={`mt-3 min-h-0 flex-1 overflow-visible ${contentClassName}`}>{children}</div>
      {action && (
        <CardAction onClick={action.onClick} className={danger ? actionStyles.red : actionStyles[actionTone] || actionStyles.blue}>
          {action.label}
        </CardAction>
      )}
    </Card>
  );
}

function CardAction({ children, onClick, className = "" }) {
  return (
    <div className="mt-auto shrink-0 border-t border-transparent pt-4">
      <button
        type="button"
        onClick={onClick}
        className={`min-h-9 w-full rounded-lg border px-3 py-2 text-[11px] font-black leading-4 transition ${className}`}
      >
        {children}
      </button>
    </div>
  );
}

function SettingRow({ label, children, as: Component = "div", className = "", ...props }) {
  return (
    <Component className={`flex min-h-8 w-full items-center justify-between gap-3 text-left text-xs font-bold text-slate-700 ${className}`} {...props}>
      <span className="min-w-0 flex-1 break-words">{label}</span>
      <span className="flex shrink-0 items-center gap-2">{children}</span>
    </Component>
  );
}

function ToggleRow({ row, state, onToggle }) {
  const [key, label] = row;
  return (
    <SettingRow label={label}>
      <Toggle checked={Boolean(state[key])} onChange={(value) => onToggle(key, value)} label={label} />
    </SettingRow>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 rounded-full transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${checked ? "bg-green-600" : "bg-slate-300"}`}
    >
      <span className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm transition ${checked ? "left-5" : "left-1"}`} />
    </button>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="settings-modal-title">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between gap-4">
          <h2 id="settings-modal-title" className="text-lg font-black text-slate-950">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close modal" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-black text-slate-600">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100" />
    </label>
  );
}

function SettingsHero() {
  return (
    <div className="flex h-[118px] shrink-0 items-start justify-between gap-8 overflow-hidden">
      <div className="pt-1">
        <h2 className="text-[26px] font-black leading-tight text-slate-950">Settings</h2>
        <p className="mt-3 max-w-[440px] text-[13px] font-bold leading-5 text-slate-600">Manage your company, hiring workflow, AI automation,<br />team permissions and integrations.</p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
          <span>Last updated: Today, 11:42 AM</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-green-700"><CheckCircle2 className="h-3.5 w-3.5" /> Verified Employer</span>
        </div>
      </div>
      <div className="relative hidden h-[118px] w-[500px] overflow-hidden lg:block">
        <div className="absolute bottom-0 right-0 h-16 w-[420px] rounded-t-full bg-blue-50" />
        <div className="absolute bottom-1 right-3 h-20 w-16 rounded-t-2xl bg-blue-100" />
        <div className="absolute bottom-1 right-24 h-16 w-12 rounded-t-xl bg-blue-100/80" />
        <div className="absolute bottom-1 right-44 h-12 w-16 rounded-t-xl bg-blue-50" />
        <div className="absolute left-80 top-5 h-6 w-10 rounded-full bg-blue-100" />
        <div className="absolute left-72 top-12 h-5 w-8 rounded-full bg-blue-50" />
        <div className="absolute left-32 top-4 grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-600"><SettingsGear small /></div>
        <div className="absolute left-10 top-[38px] grid h-[92px] w-[92px] place-items-center rounded-full bg-blue-100 text-blue-700 shadow-sm"><SettingsGear /></div>
        <div className="absolute bottom-[13px] right-36 h-[86px] w-[150px] rounded-xl border border-blue-100 bg-white/90 p-4 shadow-[0_16px_34px_rgba(37,99,235,0.12)]">
          {[0, 1, 2].map((item) => (
            <div key={item} className="mb-3 flex items-center gap-3 last:mb-0">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
              <span className={`h-2 rounded-full ${item === 1 ? "bg-blue-300" : "bg-blue-200"}`} style={{ width: `${72 - item * 8}px` }} />
            </div>
          ))}
        </div>
        <div className="absolute bottom-2 right-52 grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-[0_18px_36px_rgba(37,99,235,0.22)]"><ShieldCheck className="h-9 w-9" /></div>
      </div>
    </div>
  );
}

function SettingsGear({ small = false }) {
  return (
    <svg viewBox="0 0 80 80" className={small ? "h-6 w-6" : "h-16 w-16"} aria-hidden="true">
      <circle cx="40" cy="40" r="18" fill="currentColor" opacity="0.22" />
      <circle cx="40" cy="40" r="9" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => <rect key={deg} x="36" y="6" width="8" height="16" rx="4" fill="currentColor" transform={`rotate(${deg} 40 40)`} />)}
    </svg>
  );
}

function CompanyInfo({ profile, openModal }) {
  return (
    <SettingsCard icon={Building2} tone="bg-blue-50 text-blue-700" title="Company Information" subtitle="Manage your company identity and details." action={{ label: "Edit Information", onClick: () => openModal("company") }} className="min-h-[300px] 2xl:min-h-[285px]">
      <div className="rounded-xl border border-slate-200 p-2.5">
        <div className="flex items-start gap-3">
          <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-xl bg-blue-50 text-xl font-black text-blue-700">{profile.initials}</span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-black leading-5 text-slate-950">{profile.companyName}</p>
              </div>
              {profile.verified && <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">Verified</span>}
            </div>
            <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-500">{profile.industry}</p>
            <p className="mt-1 break-words text-xs font-bold leading-5 text-slate-600">{profile.location}</p>
            <p className="mt-1 break-all text-xs font-black leading-5 text-blue-700" title={profile.website}>{profile.website}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 text-[11px] font-black leading-4 text-slate-700 sm:grid-cols-2">
          <span className="min-w-0 break-all">GST: {profile.gst}</span>
          <span className="min-w-0 break-all">PAN: {profile.pan}</span>
        </div>
      </div>
    </SettingsCard>
  );
}

function SwitchRows({ rows, state, onToggle }) {
  return (
    <div className="space-y-2.5">
      {rows.map(([key, label]) => (
        <ToggleRow key={key} row={[key, label]} state={state} onToggle={onToggle} />
      ))}
    </div>
  );
}

function TeamMembers({ members, openModal }) {
  return (
    <SettingsCard icon={Users} tone="bg-orange-50 text-orange-600" title="Team Members" subtitle="Manage your team and permissions." action={{ label: "+ Invite Member", onClick: () => openModal("invite") }} actionTone="orange" className="min-h-[300px] 2xl:min-h-[285px]">
      <div className="rounded-xl border border-slate-200">
        {members.map((member) => (
          <div key={member.email} className="grid min-h-[56px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 px-3 py-2 last:border-b-0">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-black text-blue-700">{member.initials}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-slate-950">{member.name}</p>
              <p className="truncate text-[11px] font-bold text-slate-500" title={member.email}>{member.email}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${member.role === "Owner" ? "bg-blue-50 text-blue-700" : member.role === "Admin" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-600"}`}>{member.role}</span>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

function AISettings({ ai, setAi, openModal }) {
  return (
    <SettingsCard icon={Sparkles} tone="bg-violet-50 text-violet-700" title="AI & Automation" subtitle="Configure RozgaarAI automation settings." action={{ label: "Configure AI", onClick: () => openModal("ai") }} actionTone="purple" className="min-h-[330px] 2xl:min-h-[315px]" contentClassName="space-y-3">
      <div>
        <div className="flex items-center justify-between gap-3 text-xs font-black text-slate-700"><span className="min-w-0 flex-1 break-words">AI Match Confidence</span><span className="shrink-0 text-blue-700">{ai.confidence}%</span></div>
        <input type="range" min="50" max="100" value={ai.confidence} onChange={(event) => setAi((current) => ({ ...current, confidence: Number(event.target.value) }))} className="mt-2 w-full accent-blue-600" />
      </div>
      <div className="grid grid-cols-3 rounded-lg border border-slate-200 p-1">
        {["Flexible", "Balanced", "Strict"].map((item) => (
          <button key={item} type="button" onClick={() => setAi((current) => ({ ...current, strictness: item }))} className={`h-8 rounded-md text-xs font-black ${ai.strictness === item ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" : "text-slate-600 hover:bg-slate-50"}`}>{item}</button>
        ))}
      </div>
      <div className="space-y-2 text-xs font-bold text-slate-700">
        {["Fraud Detection", "Resume Generation", "Wage Recommendation", "Smart Ranking", "Auto Skill Matching"].map((item) => (
          <label key={item} className="flex min-h-5 min-w-0 items-center gap-2"><input type="checkbox" defaultChecked className="h-3.5 w-3.5 shrink-0 rounded accent-green-600" /> <span className="min-w-0 flex-1 break-words">{item}</span></label>
        ))}
      </div>
    </SettingsCard>
  );
}

function SecurityCard({ openModal }) {
  const rows = [["Two Factor Authentication", "Enabled"], ["Login History", ""], ["Active Devices", "3"], ["Change Password", ""]];
  return (
    <SettingsCard icon={ShieldCheck} tone="bg-blue-50 text-blue-700" title="Security" subtitle="Keep your account secure." action={{ label: "Manage Security", onClick: () => openModal("security") }} className="min-h-[300px] 2xl:min-h-[285px]">
      <div className="divide-y divide-slate-100">
        {rows.map(([label, badge]) => (
          <SettingRow key={label} as="button" type="button" onClick={() => openModal("security")} className="min-h-10 hover:text-blue-700" label={label}>
            {badge && <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-black text-green-700">{badge}</span>}<ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
          </SettingRow>
        ))}
      </div>
    </SettingsCard>
  );
}

function Integrations({ isDemo, openModal }) {
  const rows = ["eShram", "DigiLocker", "WhatsApp Business", "Google Calendar", "Google Drive"].map((name) => ({
    name,
    state: "Coming Soon"
  }));
  return (
    <SettingsCard icon={Link2} tone="bg-cyan-50 text-cyan-700" title="Integrations" subtitle="Connect with third-party services." action={{ label: "Manage Integrations", onClick: () => openModal("integrations") }} actionTone="cyan" className="min-h-[300px] 2xl:min-h-[285px]">
      <div className="space-y-2.5">
        {rows.map((row) => (
          <SettingRow key={row.name} as="button" type="button" onClick={() => openModal("integrations")} className="font-black" label={row.name}>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${row.state === "Connect" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-500"}`}>{row.state}</span>
          </SettingRow>
        ))}
      </div>
    </SettingsCard>
  );
}

function DataExport({ onExport, openModal }) {
  return (
    <SettingsCard icon={Database} tone="bg-green-50 text-green-700" title="Data & Export" subtitle="Export and manage your data." action={{ label: "Manage Data", onClick: () => openModal("data") }} actionTone="green" className="min-h-[300px] 2xl:min-h-[285px]">
      <div className="space-y-2.5 text-xs font-bold text-slate-700">
        {[["Export Hiring Data", "CSV", onExport], ["Download Company Data", "Excel", () => openModal("data")], ["Download Reports", "PDF", () => openModal("data")], ["API Keys", "", () => openModal("api")]].map(([label, badge, action]) => (
          <SettingRow key={label} as="button" type="button" onClick={action} className="hover:text-blue-700" label={label}>
            {badge ? <span className="shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-xs font-black text-slate-600">{badge}</span> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />}
          </SettingRow>
        ))}
      </div>
    </SettingsCard>
  );
}

export function EmployerSettingsPage({ account, companyName, jobs = [], applications = [], isEmployerDemoMode = false, lang = "en", onLanguageChange, setStatusMessage }) {
  const realName = companyName || account?.name || "Add company name";
  const profile = {
    initials: isEmployerDemoMode ? "SW" : String(realName).split(/\s+/).map((part) => part[0]).slice(0, 2).join(""),
    companyName: isEmployerDemoMode ? "Samiksha Works Pvt. Ltd." : realName,
    industry: isEmployerDemoMode ? "Technology, Staffing & Recruitment" : (account?.industry || "Add industry"),
    location: isEmployerDemoMode ? "Bhopal, Madhya Pradesh, India" : (account?.city || account?.location || "Add location"),
    website: isEmployerDemoMode ? "www.samikshaworks.com" : (account?.website || "Add website"),
    gst: isEmployerDemoMode ? "23AABCS1234D1Z5" : (account?.gst || "Add GST"),
    pan: isEmployerDemoMode ? "AABCS1234D" : (account?.pan || "Add PAN"),
    verified: isEmployerDemoMode || Boolean(account?.email)
  };
  const [prefs, setPrefs] = useState({ aadhaar: isEmployerDemoMode, resume: isEmployerDemoMode, screening: true, interview: isEmployerDemoMode, skills: true });
  const [notifications, setNotifications] = useState({ email: true, push: false, whatsapp: false, reminders: true, applicants: true });
  const [ai, setAi] = useState({ confidence: 80, strictness: "Balanced" });
  const [appearance, setAppearance] = useState("Light");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState("");
  const members = useMemo(() => {
    if (isEmployerDemoMode) {
      return [
        { name: "Samiksha Wanjari", email: "owner@samikshaworks.com", role: "Admin", initials: "SW" },
        { name: "HR Manager", email: "hr@samikshaworks.com", role: "Recruiter", initials: "HR" },
        { name: "Rohit Verma", email: "rohit@samikshaworks.com", role: "Recruiter", initials: "RV" }
      ];
    }
    return [{ name: account?.name || "Workspace Owner", email: account?.email || "Add owner email", role: "Owner", initials: "OW" }];
  }, [account?.email, account?.name, isEmployerDemoMode]);

  useEffect(() => {
    const handler = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      setSaving(true);
      window.setTimeout(() => {
        setSaving(false);
        setDirty(false);
        setStatusMessage?.("Settings saved.");
      }, 500);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setStatusMessage]);

  const markDirty = (setter) => (...args) => {
    setDirty(true);
    setter(...args);
  };
  function openModal(name) {
    setModal(name);
  }
  function saveChanges() {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      setDirty(false);
      setStatusMessage?.("Settings saved.");
    }, 600);
  }
  function exportCsv() {
    const rows = [["Type", "Name", "Status", "Date"], ...jobs.map((job) => ["Job", job.title, job.status, job.postedAt || ""]), ...applications.map((item) => ["Applicant", item.worker?.name || item.workerId, item.status, item.appliedAt || ""])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rozgaarai-employer-hiring-data.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    setStatusMessage?.("Hiring data CSV exported.");
  }

  return (
    <section className="relative flex min-h-screen flex-col overflow-y-auto overflow-x-hidden bg-[#f8fafc] px-2 py-3 pb-28 pr-20 lg:px-3 lg:pb-32 lg:pr-24">
      <SettingsHero />
      <div className="mt-4 grid grid-cols-1 items-stretch gap-4 xl:grid-cols-2 2xl:grid-cols-4">
        <CompanyInfo profile={profile} openModal={openModal} />
        <SettingsCard icon={FileCheck2} tone="bg-green-50 text-green-700" title="Hiring Preferences" subtitle="Configure how you want to hire." action={{ label: "Manage Preferences", onClick: () => openModal("preferences") }} actionTone="green" className="min-h-[300px] 2xl:min-h-[285px]">
          <SwitchRows rows={[["aadhaar", "Require Aadhaar Verification"], ["resume", "Require Resume"], ["screening", "AI Auto Screening"], ["interview", "Auto Interview Scheduling"], ["skills", "Skill Verification"]]} state={prefs} onToggle={(key, value) => markDirty(setPrefs)((current) => ({ ...current, [key]: value }))} />
        </SettingsCard>
        <SettingsCard icon={Bell} tone="bg-violet-50 text-violet-700" title="Notifications" subtitle="Choose what you want to be notified about." action={{ label: "Manage Notifications", onClick: () => openModal("notifications") }} actionTone="purple" className="min-h-[300px] 2xl:min-h-[285px]">
          <SwitchRows rows={[["email", "Email Notifications"], ["push", "Push Notifications"], ["whatsapp", "WhatsApp Alerts"], ["reminders", "Interview Reminders"], ["applicants", "New Applicants"]]} state={notifications} onToggle={(key, value) => markDirty(setNotifications)((current) => ({ ...current, [key]: value }))} />
        </SettingsCard>
        <TeamMembers members={members} openModal={openModal} />
        <AISettings ai={ai} setAi={markDirty(setAi)} openModal={openModal} />
        <SecurityCard openModal={openModal} />
        <Integrations isDemo={isEmployerDemoMode} openModal={openModal} />
        <DataExport onExport={exportCsv} openModal={openModal} />
        <SettingsCard icon={Palette} tone="bg-pink-50 text-pink-600" title="Appearance" subtitle="Customize your workspace theme." className="min-h-[142px]">
          <div className="flex flex-wrap gap-2">
            {[[Sun, "Light"], [Moon, "Dark"], [Monitor, "System"]].map(([Icon, label]) => (
              <button key={label} type="button" onClick={() => { setAppearance(label); setDirty(true); }} className={`flex min-h-8 min-w-[90px] flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 text-[11px] font-black ${appearance === label ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Icon className="h-3.5 w-3.5 shrink-0" /> <span className="min-w-0 truncate">{label}</span></button>
            ))}
          </div>
        </SettingsCard>
        <SettingsCard icon={Globe2} tone="bg-blue-50 text-blue-700" title="Language" subtitle="Choose your preferred language." className="min-h-[142px]">
          <div className="flex flex-wrap gap-2">
            {languageConfig.map(({ code, label }) => (
              <button key={code} type="button" onClick={() => onLanguageChange?.(code)} className={`min-h-8 min-w-[90px] flex-1 rounded-lg border px-2 text-[11px] font-black ${lang === code ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{label}</button>
            ))}
          </div>
        </SettingsCard>
        <SettingsCard icon={CircleHelp} tone="bg-blue-50 text-blue-700" title="Help & Support" subtitle="Need help? We are here for you." className="min-h-[142px]">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => openModal("docs")} className="min-h-8 min-w-[120px] flex-1 rounded-lg border border-blue-200 px-2 text-[11px] font-black text-blue-700 hover:bg-blue-50">Documentation</button>
            <button type="button" onClick={() => openModal("ticket")} className="min-h-8 min-w-[120px] flex-1 rounded-lg border border-blue-200 px-2 text-[11px] font-black text-blue-700 hover:bg-blue-50">Raise a Ticket</button>
          </div>
        </SettingsCard>
        <SettingsCard icon={ShieldAlert} tone="bg-red-50 text-red-700" title="Danger Zone" subtitle="Irreversible and sensitive actions." danger action={{ label: "Delete Workspace", onClick: () => openModal("danger") }} className="min-h-[142px]">
          <span />
        </SettingsCard>
      </div>
      <button type="button" disabled={!dirty || saving} onClick={saveChanges} className="ml-auto mt-4 inline-flex min-h-[42px] w-[150px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black text-white shadow-[0_16px_34px_rgba(37,99,235,0.26)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
        <Save className="h-4 w-4" /> {saving ? "Saving..." : dirty ? "Save Changes" : "Saved"}
      </button>

      {modal && (
        <Modal title={modal === "danger" ? "Delete Workspace" : modal === "ticket" ? "Raise a Ticket" : "Settings"} onClose={() => setModal("")}>
          {modal === "company" && <div className="grid gap-3 sm:grid-cols-2"><Field label="Company name" value={profile.companyName} onChange={() => setDirty(true)} /><Field label="Industry" value={profile.industry} onChange={() => setDirty(true)} /><Field label="Website" value={profile.website} onChange={() => setDirty(true)} /><Field label="GST" value={profile.gst} onChange={() => setDirty(true)} /></div>}
          {modal === "invite" && <div className="grid gap-3"><Field label="Email" value="" onChange={() => setDirty(true)} placeholder="name@company.com" /><Field label="Role" value="Recruiter" onChange={() => setDirty(true)} /><button className="h-10 rounded-lg bg-blue-600 text-sm font-black text-white" onClick={() => { setModal(""); setStatusMessage?.("Invitation prepared."); }}>Invite Member</button></div>}
          {modal === "danger" && <div className="space-y-4"><p className="text-sm font-bold leading-6 text-slate-600">Type your workspace name and confirm before deletion. This prototype does not perform destructive deletion without a backend owner-confirmed flow.</p><Field label="Workspace name" value="" onChange={() => setDirty(true)} placeholder={profile.companyName} /><button className="h-10 w-full rounded-lg border border-red-300 bg-red-50 text-sm font-black text-red-700">Confirm Delete Workspace</button></div>}
          {!["company", "invite", "danger"].includes(modal) && <div className="space-y-4"><p className="text-sm font-bold leading-6 text-slate-600">This panel is ready for connected backend settings. Changes made on the card are tracked and saved in this workspace session.</p><button className="h-10 rounded-lg bg-blue-600 px-5 text-sm font-black text-white" onClick={() => { setModal(""); setStatusMessage?.("Settings updated."); }}>Done</button></div>}
        </Modal>
      )}
    </section>
  );
}
