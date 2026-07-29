import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  HelpCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Workflow
} from "lucide-react";
import logoFull from "../../assets/brand/rozgaarai-logo-full.png";
import employerHeroImage from "../../assets/ngo-team-workspace-hero.png";

const trustChips = [
  [BadgeCheck, "Verified Workers", "text-blue-700"],
  [BriefcaseBusiness, "Faster Hiring", "text-green-700"],
  [Sparkles, "AI Job Matching", "text-blue-700"],
  [ShieldCheck, "Safer Decisions", "text-green-700"]
];

const visualFeatures = [
  [UserCheck, "Verified Talent", "Discover workers with trusted identities and recorded skills."],
  [BriefcaseBusiness, "Job Management", "Create job posts and manage active requirements."],
  [Sparkles, "Smart Matching", "Find relevant candidates using AI-based match scores."],
  [Workflow, "Hiring Pipeline", "Shortlist, interview and hire from one workspace."]
];

const bottomFeatures = [
  [BadgeCheck, "Easy Onboarding", "Set up your employer profile in just a few minutes.", "bg-blue-50 text-blue-700"],
  [BriefcaseBusiness, "All-in-One Workspace", "Manage jobs, candidates, interviews and hiring activity.", "bg-green-50 text-green-700"],
  [UserCheck, "Verified Worker Access", "Review worker identities, skills and employment readiness.", "bg-blue-50 text-blue-700"],
  [ShieldCheck, "Secure Hiring", "Access only worker-approved information with responsible data handling.", "bg-green-50 text-green-700"]
];

function EmployerOnboardingHeader({ onHelp }) {
  return (
    <header className="relative z-10 flex min-h-[86px] w-full items-center justify-between gap-4 px-6 pt-3 sm:px-8 lg:px-12 xl:px-16">
      <div className="flex min-w-0 items-center gap-4">
        <img src={logoFull} alt="RozgaarAI" className="h-12 w-auto max-w-[min(17rem,58vw)] object-contain sm:h-14" />
        <span className="hidden h-10 w-px bg-slate-200 sm:block" />
        <p className="hidden max-w-[260px] text-sm font-black leading-5 text-slate-600 md:block">
          Verified hiring for India’s informal workforce
        </p>
      </div>
      <button
        type="button"
        onClick={onHelp || undefined}
        className="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-black text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
      >
        <HelpCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Need help?</span>
      </button>
    </header>
  );
}

function EmployerHeroContent({ onCreateAccount, onDemo }) {
  return (
    <section className="min-w-0 pt-1 lg:pt-3">
      <span className="inline-flex min-h-10 items-center gap-3 rounded-full bg-blue-50 px-5 text-xs font-black uppercase tracking-[0.18em] text-blue-700 ring-1 ring-blue-100">
        <BriefcaseBusiness className="h-4 w-4" />
        Employer Workspace
      </span>
      <h1 className="mt-5 max-w-[700px] text-[clamp(42px,3.85vw,62px)] font-black leading-[1.04] text-[#07132E]">
        Create or switch to an{" "}
        <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 bg-clip-text text-transparent">
          Employer account
        </span>
      </h1>
      <p className="mt-5 max-w-[620px] text-[17px] font-bold leading-8 text-[#53627A] xl:text-[19px]">
        Post jobs, discover verified workers, manage applicants and make safer hiring decisions from one intelligent workspace.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:max-w-[620px]">
        <button
          type="button"
          onClick={onCreateAccount}
          className="group flex min-h-[82px] min-w-0 items-center gap-4 rounded-[14px] bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-left text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15">
            <Building2 className="h-7 w-7" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-black leading-5">Create Employer Account</span>
            <span className="mt-1 block text-sm font-bold leading-5 text-blue-50">Set up your organization</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onDemo}
          className="flex min-h-[82px] min-w-0 items-center gap-4 rounded-[14px] border border-blue-300 bg-white px-6 text-left shadow-[0_12px_28px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
            <PlayCircle className="h-7 w-7" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-black leading-5 text-blue-700">Open Employer Demo</span>
            <span className="mt-1 block text-sm font-bold leading-5 text-[#53627A]">Explore demo workspace</span>
          </span>
        </button>
      </div>
      <div className="mt-6">
        <p className="flex items-center gap-2 text-sm font-bold text-[#53627A] xl:text-[15px]">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green-50 text-green-700">
            <ShieldCheck className="h-4 w-4" />
          </span>
          Designed for Employers, Contractors and Hiring Organizations
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {trustChips.map(([Icon, label, tone]) => (
            <span key={label} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#DCE7F5] bg-white/85 px-4 text-xs font-black text-[#07132E] shadow-[0_8px_22px_rgba(15,23,42,0.035)]">
              <Icon className={`h-4 w-4 ${tone}`} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmployerHeroVisual() {
  return (
    <section className="relative min-w-0 pt-6 lg:pt-0">
      <div className="absolute -inset-12 rounded-full bg-gradient-to-br from-blue-100/85 via-cyan-50/80 to-green-100/70 blur-2xl" aria-hidden="true" />
      <div className="relative h-[clamp(410px,52vh,565px)] overflow-hidden rounded-[34px] bg-gradient-to-br from-blue-50 to-green-50 shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
        <img
          src={employerHeroImage}
          alt="Indian hiring team reviewing verified worker profiles together"
          className="h-full w-full object-cover object-[58%_center]"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/18 via-transparent to-green-300/14" />
        <div className="absolute inset-x-[3%] bottom-3 rounded-[24px] border border-[#DCE7F5] bg-white/94 px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.13)] backdrop-blur sm:px-5 xl:px-6">
          <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
            {visualFeatures.map(([Icon, title, text], index) => (
              <div key={title} className={`min-w-0 px-2 text-center sm:px-3 ${index < visualFeatures.length - 1 ? "sm:border-r sm:border-slate-200" : ""}`}>
                <span className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${index % 2 ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <strong className="mt-2 block text-[13px] font-black leading-tight text-[#07132E]">{title}</strong>
                <span className="mx-auto mt-1.5 block max-w-[170px] text-[10px] font-bold leading-[1.35] text-[#53627A] xl:text-[11px]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmployerFeatureStrip() {
  return (
    <section className="relative z-10 mt-6 rounded-[22px] border border-[#DCE7F5] bg-white/88 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.055)] backdrop-blur lg:min-h-[166px] lg:p-4 xl:min-h-[176px]">
      <div className="grid h-full min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-[1.75fr_repeat(4,minmax(0,1fr))] lg:items-center lg:gap-0">
        <div className="grid min-w-0 gap-3 sm:grid-cols-[auto_1fr] sm:items-center lg:border-r lg:border-slate-200 lg:pr-5 xl:gap-4 xl:pr-7">
          <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700">
            <Building2 className="h-8 w-8" />
            <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </span>
          <div className="min-w-0">
            <h2 className="max-w-[440px] text-base font-black leading-tight text-[#07132E]">Built for Employers, Contractors & Hiring Teams</h2>
            <p className="mt-2 max-w-[480px] text-[11px] font-bold leading-[1.45] text-[#53627A] xl:text-xs">
              Everything needed to find verified workers, manage job requirements and build a dependable workforce.
            </p>
          </div>
        </div>
        {bottomFeatures.map(([Icon, title, text, tone]) => (
          <article key={title} className="min-w-0 text-center lg:border-r lg:border-slate-200 lg:px-3 lg:last:border-r-0 xl:px-5">
            <span className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-2 text-[13px] font-black leading-tight text-[#07132E]">{title}</h3>
            <p className="mx-auto mt-1.5 max-w-[210px] text-[10px] font-bold leading-[1.3] text-[#53627A] xl:text-[11px]">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function EmployerOnboarding({ onCreateAccount, onDemo, onHelp }) {
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-white text-[#07132E] [box-sizing:border-box]">
      <div className="pointer-events-none absolute right-0 top-0 h-[44vh] w-[65vw] rounded-bl-full bg-blue-50/90" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[42%] top-[24%] h-[520px] w-[520px] rounded-full bg-green-100/45 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26vh] bg-gradient-to-t from-blue-50/70 to-transparent" aria-hidden="true" />
      <EmployerOnboardingHeader onHelp={onHelp} />
      <main className="relative z-10 mx-auto w-full px-6 pb-6 pt-7 sm:px-8 sm:pt-8 lg:px-12 lg:pt-9 xl:px-16 xl:pt-10">
        <div className="absolute left-[46%] top-28 hidden grid-cols-5 gap-3 opacity-70 lg:grid" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, index) => <span key={index} className="h-1.5 w-1.5 rounded-full bg-slate-300" />)}
        </div>
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start xl:gap-10">
          <EmployerHeroContent onCreateAccount={onCreateAccount} onDemo={onDemo} />
          <EmployerHeroVisual />
        </div>
        <EmployerFeatureStrip />
      </main>
    </div>
  );
}
