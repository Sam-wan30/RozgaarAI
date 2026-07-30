import { Bell, ChevronDown, Globe2, LogOut, Search, UserRound } from "lucide-react";
import { translations } from "../../i18n/translations";

export function NgoHeader({
  title,
  subtitle,
  organization,
  account,
  lang,
  languageConfig,
  onLanguageChange,
  onSignOut,
  isDemoMode = false,
  onExitDemo
}) {
  const copy = translations[lang]?.ngo || translations.en.ngo;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-[62px] flex-wrap items-start justify-between gap-2.5 px-4 py-2 lg:flex-nowrap lg:items-center lg:px-5">
        <div className="min-w-0 w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">{isDemoMode ? "" : copy.workspace}</p>
            {organization?.verificationStatus && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-black capitalize text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {isDemoMode ? copy.demoMode : organization.verificationStatus}
              </span>
            )}
          </div>
          <h1 className="truncate text-xl font-black text-slate-950">{title}</h1>
          {subtitle && <p className="mt-0.5 hidden text-xs font-bold text-slate-500 xl:block">{subtitle}</p>}
        </div>

        <div className="flex w-full min-w-0 flex-1 items-center justify-start gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:w-auto lg:justify-end lg:gap-3 lg:overflow-visible lg:pb-0">
          {isDemoMode && (
            <span className="mr-auto hidden min-h-8 items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 text-xs font-black text-green-700 sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {copy.demoMode}
            </span>
          )}
          <div className="relative hidden w-[min(36vw,420px)] md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="min-h-9 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 text-xs font-bold text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.035)] outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              placeholder={copy.searchPlaceholder}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-black text-slate-500 xl:inline-flex">⌘K</span>
          </div>
          <button type="button" className="relative grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100" aria-label={copy.notifications}>
            <Bell className="h-4 w-4" />
            {isDemoMode && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />}
          </button>
          <label className="relative hidden sm:block">
            <Globe2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-900" />
            <select value={lang} onChange={(event) => onLanguageChange(event.target.value)} className="min-h-9 max-w-32 appearance-none rounded-xl border border-slate-200 bg-white px-9 text-xs font-black text-slate-900 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100">
              {languageConfig.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </label>
          <div className="hidden h-9 max-w-40 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-900 sm:flex" title={account?.email || account?.name}>
            <UserRound className="h-4 w-4 text-blue-600" />
            <span className="truncate">{isDemoMode ? copy.demoAccount : account?.name || organization?.contactPersonName || copy.adminFallback}</span>
          </div>
          {isDemoMode && (
            <button type="button" onClick={onExitDemo} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-black text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100">
              {copy.exitDemo}
            </button>
          )}
          <button type="button" onClick={onSignOut} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{copy.logout}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
