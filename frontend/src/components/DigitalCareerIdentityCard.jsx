import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Languages,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserRound,
  Wrench,
  WalletCards
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useMemo, useRef } from "react";
import logoMark from "../assets/brand/rozgaarai-logo-mark.png";

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const logoAlt = "RozgaarAI Logo";

function ProgressRing({ value, label, compact = false }) {
  const percent = clampPercent(value);
  const radius = compact ? 30 : 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const size = compact ? 84 : 104;
  const center = size / 2;

  return (
    <div className={`relative grid place-items-center ${compact ? "h-20 w-20" : "h-24 w-24"}`} aria-label={`${label}: ${percent}%`}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="presentation">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(254, 215, 170, 0.72)" strokeWidth="8" />
        <circle
          className="career-ring"
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#careerRingGradient)"
          strokeLinecap="round"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="careerRingGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`absolute font-black text-ink dark:text-white ${compact ? "text-lg" : "text-2xl"}`}>{percent}%</span>
    </div>
  );
}

function DetailTile({ icon: Icon, label, value, compact = false, className = "" }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/10 ${compact ? "p-2" : "p-3"} ${className}`}>
      <div className="flex items-start gap-2">
        <span className={`grid shrink-0 place-items-center rounded-md bg-blue-50 text-saffron dark:bg-blue-400/15 dark:text-blue-200 ${compact ? "h-7 w-7" : "h-8 w-8"}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{label}</p>
          <p className={`break-words text-sm font-black text-ink dark:text-white ${compact ? "mt-0.5 leading-4" : "mt-1 leading-5"}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, inverted = false }) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b py-3 last:border-b-0 ${inverted ? "border-white/10" : "border-slate-100 dark:border-white/10"}`}>
      <p className={`text-[13px] font-semibold leading-5 ${inverted ? "text-slate-300" : "text-slate-500 dark:text-slate-300"}`}>{label}</p>
      <p className={`max-w-[58%] text-right text-base font-bold leading-6 ${inverted ? "text-white" : "text-ink dark:text-white"}`}>{value}</p>
    </div>
  );
}

function CardSection({ title, children, inverted = false }) {
  return (
    <section className={`rounded-xl border p-5 shadow-sm ${inverted ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/10"}`}>
      <h3 className={`text-[15px] font-bold leading-6 ${inverted ? "text-white" : "text-ink dark:text-white"}`}>{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * Premium reusable RozgaarAI worker identity card.
 *
 * @param {{
 *  identity: {
 *    name: string,
 *    occupation: string,
 *    city: string,
 *    workerId: string,
 *    experience: string,
 *    primarySkill: string,
 *    secondarySkills: string[],
 *    languages: string,
 *    availability: string,
 *    preferredWorkType: string,
 *    expectedWage: string,
 *    fairWage: string,
 *    skillConfidence: number,
 *    bestJobMatch: number,
 *    matchingJobs: number,
 *    nearbyOpportunities: string,
 *    suggestedSkillUpgrade: string,
 *    profileUrl: string,
 *    contact: string,
 *    resumeSummary: string,
 *    statusBadges: string[]
 *  },
 *  labels: Record<string, string>,
 *  variant?: "hero" | "full",
 *  contentMode?: "full" | "identityOnly"
 * }} props
 */
export function DigitalCareerIdentityCard({ identity, labels, variant = "full", contentMode = "full" }) {
  const isHero = variant === "hero";
  const identityOnly = contentMode === "identityOnly";
  const qrRef = useRef(null);
  const initials = useMemo(
    () => identity.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
    [identity.name]
  );
  const confidence = clampPercent(identity.skillConfidence);
  const statusBadges = identity.statusBadges.filter(Boolean);
  const visibleBadges = statusBadges.filter((badge) => {
    const normalized = String(badge).toLowerCase();
    return normalized.includes("verified") || normalized.includes("available") || badge.includes("सत्यापित") || badge.includes("उपलब्ध");
  }).slice(0, 2);
  const detailTiles = [
    [CalendarClock, labels.experience, identity.experience],
    [Sparkles, labels.primarySkill, identity.primarySkill],
    [Languages, labels.languages, identity.languages],
    [WalletCards, labels.expectedWage, identity.expectedWage],
    [ClipboardCheck, labels.availability, identity.availability],
    [BriefcaseBusiness, labels.preferredWorkType, identity.preferredWorkType],
    [TrendingUp, labels.fairWage, identity.fairWage],
    [ShieldCheck, labels.secondarySkills, identity.secondarySkills.join(", ")]
  ];
  const visibleDetails = isHero ? detailTiles.slice(0, 4) : detailTiles;
  const workerInfo = [
    [labels.experience, identity.experience],
    [labels.primarySkill, identity.primarySkill],
    [labels.languages, identity.languages],
    [labels.availability, identity.availability]
  ];
  const workPreferences = [
    [labels.preferredWorkType, identity.preferredWorkType],
    [labels.expectedWage, identity.expectedWage],
    [labels.fairWage, identity.fairWage]
  ];
  const assessmentRows = [
    [labels.aiSkillConfidence, `${confidence}/100`],
    [labels.bestSuitableRole || "Best Suitable Role", identity.primarySkill],
    [labels.matchingOpportunities || "Matching Opportunities", `${identity.matchingJobs} ${labels.nearbyVerifiedJobs || labels.matchingJobs}`],
    [labels.suggestedCertification || labels.suggestedSkillUpgrade, identity.suggestedSkillUpgrade]
  ];
  const credentialMode = identityOnly && !isHero;
  const issuedDate = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());

  function downloadQrCode() {
    const canvas = qrRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${identity.workerId}-qr.png`;
    link.click();
  }

  if (credentialMode) {
    const trustItems = [
      [ShieldCheck, labels.identity || "Identity", labels.verified],
      [BriefcaseBusiness, labels.skills || "Skills", labels.recorded || "Recorded"],
      [UserCheck, labels.employment || "Employment", labels.ready || "Ready"]
    ];
    const infoRows = [
      [CalendarClock, labels.experience, identity.experience],
      [Wrench, labels.primarySkill, identity.primarySkill],
      [Languages, labels.languages, identity.languages],
      [CheckCircle2, labels.availability, identity.availability]
    ];

    return (
      <article className="career-card career-card-enter relative overflow-hidden rounded-xl border border-slate-700/70 bg-ink text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-10 h-80 w-80 rounded-full bg-emerald-500/16 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_92%_10%,rgba(22,163,74,0.14),transparent_32%)]" />
        <img src={logoMark} alt="" aria-hidden="true" className="pointer-events-none absolute right-8 top-40 h-56 w-56 object-contain opacity-[0.04] grayscale" />
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-neem" />

        <div className="relative p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src={logoMark} alt={logoAlt} className="h-10 w-10 shrink-0 rounded-xl bg-white/95 object-contain p-1 shadow-sm" />
              <div className="min-w-0">
                <p className="text-lg font-black leading-5 text-white">RozgaarAI</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {labels.title}
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-black text-white shadow-sm backdrop-blur">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              {labels.verified}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" />
            <p className="min-w-0 text-[13px] font-black uppercase tracking-[0.22em] text-emerald-200">
              {labels.verifiedDigitalCareerIdentity || "Verified Digital Career Identity"}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-neem p-1 shadow-[0_0_38px_rgba(37,99,235,0.26)]">
              <div className="grid h-full w-full place-items-center rounded-full border border-white/10 bg-slate-800 text-white">
                {initials ? <span className="text-3xl font-black">{initials}</span> : <UserRound className="h-10 w-10" />}
              </div>
              <span className="absolute bottom-0.5 right-0 grid h-7 w-7 place-items-center rounded-full border-4 border-ink bg-emerald-400 text-ink">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="break-words text-4xl font-black leading-tight text-white sm:text-5xl">{identity.name}</h2>
              <p className="mt-1.5 flex items-center gap-2 text-2xl font-black text-slate-100">
                <Wrench className="h-5 w-5 text-blue-400" />
                {identity.occupation}
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-lg font-semibold text-slate-300">
                <MapPin className="h-5 w-5 text-slate-400" />
                {identity.city}
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] shadow-inner backdrop-blur">
            {trustItems.map(([Icon, label, value]) => (
              <div key={label} className="flex items-center justify-center gap-2 border-r border-white/15 px-2.5 py-1.5 last:border-r-0">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-500/15 text-blue-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-5 text-slate-300">{label.replace("Identity ", "").replace("Skills ", "").replace("Employment ", "")}</p>
                  <p className="text-base font-black leading-5 text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2.5 flex items-center gap-4">
            <span className="h-px flex-1 border-t border-dashed border-slate-600/70" />
            <p className="text-center text-[12px] font-black uppercase tracking-[0.28em] text-slate-400">{labels.issuedBy || "Issued by RozgaarAI Digital Career Identity Network"}</p>
            <span className="h-px flex-1 border-t border-dashed border-slate-600/70" />
          </div>

          <div className="mt-2.5 grid grid-cols-[1.05fr_0.95fr] gap-3">
            <section className="min-h-[8rem] rounded-2xl border border-slate-600/80 bg-white/[0.055] p-3 shadow-inner">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-300">{labels.workerId}</p>
              <p className="mt-2 break-words text-3xl font-black leading-tight text-white">{identity.workerId}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {visibleBadges.map((badge) => (
                  <span key={badge} className="inline-flex items-center gap-2 rounded-xl border border-blue-400/25 bg-blue-500/10 px-2.5 py-1 text-sm font-black text-white">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {badge}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-600/80 bg-white/[0.055] p-2.5 text-center shadow-inner">
              <a className="focus-ring mx-auto grid w-fit place-items-center rounded-2xl bg-white p-2 shadow-[0_0_0_3px_rgba(22,163,74,0.7),0_0_0_5px_rgba(37,99,235,0.5)] transition hover:shadow-soft" href={identity.profileUrl} aria-label={labels.qrAria}>
                <QRCodeCanvas
                  ref={qrRef}
                  value={identity.profileUrl}
                  size={152}
                  level="H"
                  marginSize={2}
                  bgColor="#ffffff"
                  fgColor="#172033"
                  title={labels.qrAlt}
                />
              </a>
              <p className="mt-1.5 text-base font-black text-white">{labels.publicVerificationQr || "Public Verification QR"}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-400">{labels.verifyWorkerIdentity || "Scan to verify identity"}</p>
              <button type="button" className="mt-1.5 inline-flex items-center gap-2 text-sm font-black text-blue-400 underline-offset-4 hover:underline" onClick={downloadQrCode}>
                <Download className="h-4 w-4" />
                {labels.downloadQr}
              </button>
            </section>
          </div>

          <section className="mt-2">
            <div className="mb-2 flex items-center gap-3">
              <UserRound className="h-5 w-5 text-blue-500" />
              <h3 className="text-base font-black uppercase tracking-[0.18em] text-blue-500">{labels.workerInformation || "Worker Information"}</h3>
            </div>
            <div className="rounded-2xl border border-slate-600/80 bg-white/[0.055] px-4 py-1.5 shadow-inner">
              {infoRows.map(([Icon, label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-dashed border-slate-600/70 py-1.5 last:border-b-0">
                  <p className="flex items-center gap-3 text-[15px] font-semibold text-slate-300">
                    <Icon className="h-5 w-5 text-blue-500" />
                    {label}
                  </p>
                  <p className="max-w-[50%] text-right text-base font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl border border-white/10 bg-white/[0.055] px-3.5 py-1.5 text-sm font-semibold text-slate-300">
            <p className="inline-flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-slate-400" />
              <span>{labels.issuedOn || "Issued On"}<br/><span className="text-base font-black text-white">{issuedDate}</span></span>
            </p>
            <img src={logoMark} alt={logoAlt} className="h-8 w-8 rounded-lg object-contain opacity-35 grayscale" />
            <p className="inline-flex items-center justify-end gap-3 text-right">
              <RotateCcw className="h-5 w-5 text-slate-400" />
              <span>{labels.lastUpdated || "Last Updated"}<br/><span className="text-base font-black text-white">{issuedDate}</span></span>
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`career-card career-card-enter overflow-hidden rounded-xl border shadow-soft ${credentialMode ? "border-white/10 bg-ink text-white" : "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950"} ${isHero ? "max-w-[34rem]" : "w-full"}`}>
      <div className={`relative border-b ${isHero ? "p-4 sm:p-5" : "p-6 sm:p-8"} ${credentialMode ? "overflow-hidden border-white/10 bg-ink" : "border-slate-200 bg-gradient-to-br from-white via-blue-50 to-emerald-50 dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950"}`}>
        {credentialMode && (
          <>
            <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-24 top-8 h-64 w-64 rounded-full bg-emerald-500/12 blur-3xl" />
          </>
        )}
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-saffron via-marigold to-neem" />
        <img src={logoMark} alt={logoAlt} className={`pointer-events-none absolute rounded-md object-contain opacity-20 grayscale ${isHero ? "bottom-3 right-3 h-8 w-8" : "bottom-4 right-4 h-9 w-9"}`} />
        <div className={`relative flex flex-col sm:flex-row sm:items-start sm:justify-between ${isHero ? "gap-3" : "gap-5"}`}>
          <div className={`flex min-w-0 items-center ${isHero ? "gap-3.5" : "gap-5"}`}>
            <div className={`grid shrink-0 place-items-center rounded-xl border shadow-lg ${credentialMode ? "h-20 w-20 border-white/15 bg-white/10 text-white shadow-black/20 sm:h-24 sm:w-24" : isHero ? "h-14 w-14 border-slate-200 bg-ink text-white shadow-slate-900/15 sm:h-16 sm:w-16" : "h-16 w-16 border-slate-200 bg-ink text-white shadow-slate-900/15 sm:h-20 sm:w-20"}`}>
              {initials ? <span className={`${credentialMode ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black`}>{initials}</span> : <UserRound className="h-8 w-8" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">{labels.title}</p>
              <h2 className={`${isHero ? "mt-1.5" : "mt-3"} break-words text-3xl font-black leading-tight sm:text-[34px] ${credentialMode ? "text-white" : "text-ink dark:text-white"}`}>{identity.name}</h2>
              <p className={`${isHero ? "mt-1.5" : "mt-3"} flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold ${credentialMode ? "text-slate-200" : "text-slate-600 dark:text-slate-300"}`}>
                <BriefcaseBusiness className="h-4 w-4" />
                {identity.occupation}
                <span aria-hidden="true">•</span>
                <MapPin className="h-4 w-4" />
                {identity.city}
              </p>
            </div>
          </div>
          <span className={`verification-pulse inline-flex w-fit items-center gap-2 rounded-md border px-3 ${isHero ? "py-1.5" : "py-2"} text-sm font-black shadow-sm ${credentialMode ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100" : "border-emerald-200 bg-emerald-50 text-neem dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100"}`}>
            <BadgeCheck className="h-4 w-4" />
            {labels.verified}
          </span>
        </div>
        <p className={`relative max-w-xl text-sm font-medium leading-6 ${credentialMode ? "text-slate-300" : "text-slate-600 dark:text-slate-300"} ${isHero ? "mt-3 line-clamp-2" : "mt-5"}`}>{labels.subtitle}</p>
      </div>

      <div className={`${isHero ? "space-y-4 p-4 sm:p-5" : "space-y-6"} ${isHero ? "" : credentialMode ? "p-6 sm:p-7" : "p-6 sm:p-8"}`}>
        <div className={`grid lg:grid-cols-[1fr_0.9fr] ${isHero ? "gap-3" : "gap-4"}`}>
          <div className={`rounded-xl border ${isHero ? "p-4" : "p-5"} ${credentialMode ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-paper dark:border-white/10 dark:bg-white/10"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={`text-[13px] font-semibold ${credentialMode ? "text-blue-100" : "text-slate-500 dark:text-blue-100"}`}>{labels.workerId}</p>
                <p className={`break-words text-lg font-black leading-tight sm:text-xl ${isHero ? "mt-1.5" : "mt-2"} ${credentialMode ? "text-white" : "text-ink dark:text-white"}`}>{identity.workerId}</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-neem">{labels.verified}</span>
            </div>
            <div className={`${isHero ? "mt-3" : "mt-5"} flex flex-wrap gap-2`}>
              {visibleBadges.map((badge) => (
                <span key={badge} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${credentialMode ? "border-white/10 bg-white/10 text-blue-100" : "border-slate-200 bg-white text-mitti dark:border-white/10 dark:bg-white/10 dark:text-blue-100"}`}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className={`flex flex-col items-center rounded-xl border shadow-sm ${isHero ? "gap-2.5 p-3" : "gap-4 p-5"} ${credentialMode ? "border-white/10 bg-white/[0.06]" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/10"}`}>
            <a className={`focus-ring grid w-full place-items-center rounded-md border border-slate-200 bg-white transition hover:shadow-soft ${isHero ? "p-1.5" : "p-2"}`} href={identity.profileUrl} aria-label={labels.qrAria}>
                <QRCodeCanvas
                  ref={qrRef}
                  value={identity.profileUrl}
                  size={isHero ? 148 : 164}
                  level="H"
                  marginSize={2}
                  bgColor="#ffffff"
                  fgColor="#172033"
                  title={labels.qrAlt}
                />
            </a>
            <div className="min-w-0 text-center">
              <p className={`text-sm font-bold ${credentialMode ? "text-white" : "text-ink dark:text-white"}`}>{labels.scanPublicProfile || labels.scanLabel}</p>
              <button type="button" className={`${isHero ? "mt-2" : "mt-3"} inline-flex items-center gap-1 text-xs font-bold text-saffron underline-offset-4 hover:underline`} onClick={downloadQrCode}>
                <Download className="h-3.5 w-3.5" />
                {labels.downloadQr}
              </button>
            </div>
          </div>
        </div>

        {isHero ? (
          <div className="grid grid-cols-2 gap-3">
            {visibleDetails.map(([Icon, label, value], index) => (
              <DetailTile key={label} icon={Icon} label={label} value={value} compact className={index > 1 ? "hidden sm:block" : ""} />
            ))}
          </div>
        ) : (
          <>
            <CardSection title={labels.workerInformation || "Worker Information"} inverted={credentialMode}>
              <div>
                {workerInfo.map(([label, value]) => <InfoRow key={label} label={label} value={value} inverted={credentialMode} />)}
              </div>
            </CardSection>

            {!identityOnly && (
              <>
                <CardSection title={labels.workPreferences || "Work Preferences"}>
                  <div>
                    {workPreferences.map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
                  </div>
                </CardSection>

                <CardSection title={labels.skills || "Skills"}>
                  <div className="flex flex-wrap gap-2">
                    {identity.secondarySkills.map((skill) => (
                      <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardSection>
              </>
            )}
          </>
        )}

        {!identityOnly && (
        <div className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/10 ${isHero ? "p-3.5" : "p-5"}`}>
          {isHero ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-neem dark:text-emerald-200">{labels.aiSkillConfidence}</p>
                <p className="mt-1 text-xl font-black text-ink dark:text-white">{confidence}%</p>
              </div>
              <p className="text-right text-xs font-bold leading-5 text-slate-500 dark:text-slate-300">{identity.matchingJobs} {labels.matchingJobs}</p>
            </div>
          ) : (
            <>
              <h3 className="text-[15px] font-bold leading-6 text-ink dark:text-white">{labels.aiAssessment || "AI Assessment"}</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-300">{labels.aiSkillConfidence}</p>
                  <p className="mt-1 text-2xl font-black text-ink dark:text-white">{confidence}/100</p>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-blue-100 dark:bg-white/10">
                    <div className="ai-confidence-fill h-full rounded-full bg-gradient-to-r from-saffron to-neem" style={{ width: `${confidence}%` }} />
                  </div>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/10">
                  {assessmentRows.slice(1).map(([label, value]) => <InfoRow key={label} label={label} value={value} />)}
                </div>
              </div>
            </>
          )}
          {isHero && (
            <>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-blue-100 dark:bg-white/10">
                <div className="ai-confidence-fill h-full rounded-full bg-gradient-to-r from-saffron to-neem" style={{ width: `${confidence}%` }} />
              </div>
              <p className="mt-2.5 hidden text-sm font-semibold leading-5 text-slate-600 dark:text-slate-300 sm:line-clamp-2">
                <span className="font-black text-ink dark:text-white">{labels.suggestedSkillUpgrade}:</span> {identity.suggestedSkillUpgrade}
              </p>
            </>
          )}
        </div>
        )}
      </div>
    </article>
  );
}

export function PublicWorkerProfile({ identity, labels, onBack }) {
  function downloadResume() {
    const content = [
      `${identity.name} - ${identity.primarySkill}`,
      `${labels.workerId}: ${identity.workerId}`,
      "",
      `${labels.experience}: ${identity.experience}`,
      `${labels.city}: ${identity.city}`,
      `${labels.languages}: ${identity.languages}`,
      `${labels.availability}: ${identity.availability}`,
      `${labels.fairWage}: ${identity.fairWage}`,
      "",
      identity.resumeSummary
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${identity.workerId}-resume.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-6 text-ink dark:bg-slate-950 sm:px-6 lg:px-8">
      <main className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <DigitalCareerIdentityCard identity={identity} labels={labels} />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-slate-950 sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4">
            <img src={logoMark} alt={logoAlt} className="h-10 w-10 rounded-md object-contain" />
            <div>
              <p className="font-black text-ink dark:text-white">RozgaarAI</p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-300">{labels.publicProfile}</p>
            </div>
          </div>
          <h1 className="mt-3 text-3xl font-black text-ink dark:text-white">{identity.name}</h1>
          <p className="mt-2 text-sm font-bold text-slate-600 dark:text-slate-300">{identity.occupation} • {identity.city}</p>

          <div className="mt-6 space-y-3">
            {[
              [labels.workerId, identity.workerId],
              [labels.skill, identity.primarySkill],
              [labels.experience, identity.experience],
              [labels.city, identity.city],
              [labels.languages, identity.languages],
              [labels.availability, identity.availability],
              [labels.fairWage, identity.fairWage],
              [labels.interviewReadiness || "Interview readiness", identity.interviewReadiness],
              [labels.incomeThisMonth || "Income this month", identity.incomeThisMonth],
              [labels.employmentRecords || "Employment records", identity.employmentRecords],
              [labels.bestJobMatch, `${identity.bestJobMatch}%`],
              [labels.verificationStatus, labels.verified]
            ].filter(([, value]) => value !== undefined).map(([label, value]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-blue-50/50 p-4 dark:border-white/10 dark:bg-white/10">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">{label}</p>
                <p className="mt-1 break-words text-sm font-bold leading-6 text-ink dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="focus-ring rounded-md bg-ink px-4 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800" onClick={downloadResume}>
              {labels.downloadResume}
            </button>
            <a className="focus-ring rounded-md border border-blue-200 bg-white px-4 py-3 text-sm font-black text-ink shadow-sm transition hover:bg-blue-50" href={`tel:${identity.contact}`}>
              {labels.contactWorker}: {identity.contact}
            </a>
            <button type="button" className="focus-ring rounded-md border border-blue-200 bg-white px-4 py-3 text-sm font-black text-ink shadow-sm transition hover:bg-blue-50" onClick={onBack}>
              {labels.backToApp}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
