import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileBadge,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  LayoutDashboard,
  MessageSquarePlus,
  PanelLeft,
  ScrollText,
  Settings,
  ShieldCheck,
  UserPlus,
  UserCog,
  Users
} from "lucide-react";
import { translations } from "../../i18n/translations";

const navItems = [
  [LayoutDashboard, "overview", "/ngo", "overview"],
  [Users, "workers", "/ngo/workers", "workers"],
  [UserPlus, "addWorker", "/ngo/workers/add", "add-worker"],
  [GraduationCap, "training", "/ngo/training", "training"],
  [FileBadge, "certificates", "/ngo/certificates", "certificates"],
  [ShieldCheck, "placements", "/ngo/pipeline", "placements"],
  [Building2, "employers", "/ngo/employers", "employers"],
  [BriefcaseBusiness, "jobs", "/ngo/jobs", "jobs"],
  [BarChart3, "reports", "/ngo/reports", "reports"],
  [UserCog, "team", "/ngo/team", "team"],
  [ScrollText, "audit", "/ngo/audit", "audit"],
  [HandHeart, "profile", "/ngo/profile", "profile"],
  [Settings, "settings", "/ngo/settings", "settings"]
];

export function getNgoSectionFromPath(pathname) {
  if (pathname === "/ngo") return "overview";
  if (pathname === "/ngo/add-worker" || pathname === "/ngo/workers/add") return "add-worker";
  if (pathname.startsWith("/ngo/pipeline") || pathname.startsWith("/ngo/placements") || pathname.startsWith("/ngo/recommendations") || pathname.startsWith("/ngo/interviews") || pathname.startsWith("/ngo/follow-ups")) return "placements";
  if (pathname.startsWith("/ngo/certificates")) return "certificates";
  if (pathname === "/ngo/requests") return "workers";
  if (pathname.startsWith("/ngo/workers")) return "workers";
  if (pathname.startsWith("/ngo/reports")) return "reports";
  if (pathname.startsWith("/ngo/team")) return "team";
  if (pathname.startsWith("/ngo/audit")) return "audit";
  return pathname.split("/").filter(Boolean)[1] || "overview";
}

export function NgoSidebar({ logoMark, logoAlt, organization, activeSection, navigateTo, collapsed, onToggle, isDemoMode = false, lang = "en" }) {
  const copy = translations[lang]?.ngo || translations.en.ngo;
  const workspaceLabel = organization?.organizationType ? `${organization.organizationType} ${copy.workspace}` : copy.sidebar.foundation;

  return (
    <aside className={`sticky top-0 hidden h-full border-r border-slate-200 bg-white lg:flex lg:flex-col ${collapsed ? "w-20" : "w-[236px]"}`}>
      <div className="flex min-h-[62px] items-center justify-between border-b border-slate-200 px-3 py-2">
        <button type="button" className="flex min-w-0 items-center gap-2.5 text-left font-black text-slate-950" onClick={() => navigateTo("/ngo")}>
          <img src={logoMark} alt={logoAlt} className="h-8 w-8 rounded-md object-contain" />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-lg leading-5">RozgaarAI</span>
              <span className="mt-0.5 block truncate text-xs font-bold text-slate-500">{workspaceLabel}</span>
            </span>
          )}
        </button>
        <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100" onClick={onToggle} aria-label={copy.sidebar.toggle}>
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>

      {!collapsed && (
        <div className={`mx-3 mt-3 rounded-2xl border px-3 py-2.5 ${isDemoMode ? "border-green-100 bg-green-50" : "border-green-100 bg-green-50"}`}>
          <div className="flex items-start gap-2.5">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-green-800">{organization?.name || copy.sidebar.ngoFoundation}</p>
              <p className={`mt-1 text-xs font-bold ${isDemoMode ? "text-blue-700" : "text-green-700"}`}>
                {isDemoMode ? copy.sidebar.demoImpact : copy.sidebar.workerOwned}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="space-y-1 p-3 pt-3" aria-label={copy.sidebar.navigation}>
        {navItems.map(([Icon, labelKey, href, key]) => {
          const label = copy.nav[labelKey] || translations.en.ngo.nav[labelKey] || labelKey;
          const active = activeSection === key;
          return (
            <button
              key={key}
              type="button"
              className={`flex min-h-9 w-full items-center gap-2.5 rounded-xl px-3 text-xs font-black transition duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 ${active ? "bg-blue-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(37,99,235,0.06)]" : "text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950"}`}
              onClick={() => navigateTo(href)}
              title={label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="min-w-0 whitespace-normal text-left leading-[1.15]">{label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-auto p-3 pb-2.5">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#05285f] via-[#0a3477] to-[#082044] p-3 text-white shadow-[0_14px_34px_rgba(8,32,68,0.22)]">
            <div className="mx-auto grid h-10 w-16 place-items-center">
              <div className="relative grid h-9 w-9 place-items-center rounded-full bg-blue-400/20">
                <HeartHandshake className="h-5 w-5 text-blue-100" />
                <span className="absolute -left-1.5 bottom-0.5 h-5 w-5 rounded-full bg-orange-300/80" />
                <span className="absolute -right-1 top-0.5 h-4 w-4 rounded-full bg-green-400/80" />
              </div>
            </div>
            <p className="mt-1.5 text-sm font-black">{copy.sidebar.consentTitle}</p>
            <p className="mt-1 text-[11px] font-semibold leading-4 text-blue-50">
              {copy.sidebar.consentCopy}
            </p>
            <button type="button" onClick={() => navigateTo("/ngo/workers/invite")} className="mt-3 inline-flex min-h-8 w-full items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50">
              <MessageSquarePlus className="h-3.5 w-3.5" />
              {copy.sidebar.inviteWorker}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
