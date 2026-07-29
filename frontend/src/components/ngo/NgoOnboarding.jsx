import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  CircleCheck,
  ClipboardList,
  Database,
  HandHeart,
  Heart,
  HelpCircle,
  Landmark,
  Leaf,
  LockKeyhole,
  PlayCircle,
  Shield,
  ShieldCheck,
  Users
} from "lucide-react";
import { useState } from "react";
import logoFull from "../../assets/brand/rozgaarai-logo-full.png";
import ngoDemoHeroWorkers from "../../assets/ngo-demo-hero-workers.jpg";

export const organizationTypes = [
  "NGO",
  "Foundation",
  "CSR Initiative",
  "Skill-Development Centre",
  "Vocational Institute",
  "Training Partner",
  "Community Organization",
  "Other"
];

export const emptyNgoOrganizationForm = {
  name: "",
  organizationType: "NGO",
  registrationNumber: "",
  contactPersonName: "",
  officialEmail: "",
  phone: "",
  website: "",
  headquartersCity: "",
  headquartersState: "",
  locationsServed: "",
  skillSectors: [],
  description: "",
  approximateWorkersTrained: "",
  logoUrl: "",
  termsAccepted: false
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s-]{7,}$/;

export function validateNgoOrganizationForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Organization name is required.";
  if (!form.organizationType) errors.organizationType = "Select an organization type.";
  if (!form.contactPersonName.trim()) errors.contactPersonName = "Contact person is required.";
  if (!emailPattern.test(form.officialEmail.trim())) errors.officialEmail = "Enter a valid official email.";
  if (!phonePattern.test(form.phone.trim())) errors.phone = "Enter a valid phone number.";
  if (!form.skillSectors.length) errors.skillSectors = "Select at least one skill sector.";
  if (!form.termsAccepted) errors.termsAccepted = "Consent and terms must be accepted.";
  return errors;
}

function TextField({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}

function inputClass(error) {
  return `min-h-11 w-full rounded-xl border bg-white px-3 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${error ? "border-red-200 focus:border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"}`;
}

const trustPills = [
  [LockKeyhole, "Secure & Private", "text-blue-700"],
  [Heart, "Impact Focused", "text-green-700"],
  [Users, "Worker First", "text-green-700"],
  [Database, "Data You Own", "text-blue-700"]
];

const capabilityItems = [
  [Users, "Worker Support", "Support enrolled workers throughout their journey.", "bg-blue-50 text-blue-700"],
  [ClipboardList, "Program Management", "Create and manage training and employment programs.", "bg-green-50 text-green-700"],
  [BadgeCheck, "Verified Skills", "Review and verify worker skills and credentials.", "bg-cyan-50 text-cyan-700"],
  [BarChart3, "Impact Reports", "Track outcomes through clear and transparent reports.", "bg-green-50 text-green-700"]
];

const featureItems = [
  [CircleCheck, "Easy Onboarding", "Set up your organization in just a few minutes.", "bg-blue-50 text-blue-700"],
  [Users, "All-in-One Workspace", "Manage programs, workers, verifications & reports.", "bg-green-50 text-green-700"],
  [ClipboardList, "Program Management", "Create, organize and monitor training and employment programs.", "bg-blue-50 text-blue-700"],
  [ShieldCheck, "Secure Data Handling", "Keep organization and worker information protected and under your control.", "bg-green-50 text-green-700"]
];

function NgoLandingHeader({ onHelp }) {
  return (
    <header className="relative z-10 flex min-h-[94px] w-full items-center justify-between gap-4 px-6 pt-3 sm:px-8 lg:px-12 xl:px-16">
      <img src={logoFull} alt="RozgaarAI" className="h-14 w-auto object-contain sm:h-16" />
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

function NgoTrustPills() {
  return (
    <div className="mt-6">
      <p className="flex items-center gap-2 text-sm font-bold text-[#53627A] xl:text-[15px]">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green-50 text-green-700">
          <Shield className="h-4 w-4" />
        </span>
        Designed for NGOs, Foundations and Community Organizations
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        {trustPills.map(([Icon, label, tone]) => (
          <span key={label} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#DCE7F5] bg-white/85 px-4 text-xs font-black text-[#07132E] shadow-[0_8px_22px_rgba(15,23,42,0.035)] xl:px-5">
            <Icon className={`h-4 w-4 ${tone}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function NgoHeroContent({ onCreate, onDemo }) {
  return (
    <section className="min-w-0 pt-2 lg:pt-4">
      <span className="inline-flex min-h-10 items-center gap-3 rounded-full bg-blue-50 px-5 text-xs font-black uppercase tracking-[0.18em] text-blue-700 ring-1 ring-blue-100 xl:min-h-11 xl:px-6">
        <Shield className="h-4 w-4" />
        NGO / Foundation Workspace
      </span>
      <h1 className="mt-5 max-w-[760px] whitespace-normal text-[clamp(46px,4vw,64px)] font-black leading-[1.04] text-[#07132E]">
        Create or switch to an{" "}
        <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-green-500 bg-clip-text text-transparent">
          NGO account
        </span>
      </h1>
      <p className="mt-5 max-w-[620px] whitespace-normal text-[18px] font-bold leading-8 text-[#53627A] xl:text-[20px] xl:leading-[1.5]">
        Manage programs, support workers, track impact and build a stronger community together.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:max-w-[600px] xl:max-w-[620px]">
        <button
          type="button"
          onClick={onCreate}
          className="group flex min-h-[80px] min-w-0 items-center gap-4 rounded-[14px] bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-left text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15">
            <Landmark className="h-7 w-7" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-black leading-5">Create NGO Account</span>
            <span className="mt-1 block text-sm font-bold leading-5 text-blue-50">Set up your organization</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onDemo}
          className="flex min-h-[80px] min-w-0 items-center gap-4 rounded-[14px] border border-blue-300 bg-white px-6 text-left shadow-[0_12px_28px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
            <PlayCircle className="h-7 w-7" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-black leading-5 text-blue-700">Open NGO Demo</span>
            <span className="mt-1 block text-sm font-bold leading-5 text-[#53627A]">Explore demo workspace</span>
          </span>
        </button>
      </div>
      <NgoTrustPills />
    </section>
  );
}

function NgoCapabilitiesCard() {
  return (
    <div className="absolute inset-x-[3%] bottom-2 z-10 rounded-[26px] border border-[#DCE7F5] bg-white/95 px-4 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.13)] backdrop-blur sm:px-5 lg:bottom-3 xl:px-6 xl:py-5">
      <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
        {capabilityItems.map(([Icon, title, text, tone], index) => (
          <div key={title} className={`min-w-0 px-2 text-center sm:px-3 xl:px-4 ${index < capabilityItems.length - 1 ? "sm:border-r sm:border-slate-200" : ""}`}>
            <span className={`mx-auto grid h-11 w-11 place-items-center rounded-full xl:h-12 xl:w-12 ${tone}`}>
              <Icon className="h-5 w-5 xl:h-6 xl:w-6" />
            </span>
            <strong className="mt-2 block text-[13px] font-black leading-tight text-[#07132E] xl:text-sm">{title}</strong>
            <span className="mx-auto mt-1.5 block max-w-[170px] whitespace-normal text-[10px] font-bold leading-[1.35] text-[#53627A] xl:text-[11px]">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NgoHeroVisual() {
  return (
    <section className="relative min-w-0 pt-6 lg:pt-0">
      <div className="absolute -inset-12 rounded-full bg-gradient-to-br from-blue-100/80 via-cyan-50/80 to-green-100/70 blur-2xl" aria-hidden="true" />
      <div className="absolute -left-12 top-20 hidden h-28 w-28 rounded-full bg-green-100/70 lg:block" aria-hidden="true" />
      <div className="relative h-[clamp(420px,54vh,590px)] overflow-hidden rounded-[110px_28px_28px_28px] bg-gradient-to-br from-blue-50 to-green-50 shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
        <img
          src={ngoDemoHeroWorkers}
          alt="Indian NGO community workers reviewing worker support information together"
          className="h-full w-full object-cover object-[90%_center]"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/5" />
        <NgoCapabilitiesCard />
      </div>
    </section>
  );
}

function NgoFeatureStrip() {
  return (
    <section className="relative z-10 mt-6 rounded-[22px] border border-[#DCE7F5] bg-white/88 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.055)] backdrop-blur lg:min-h-[168px] lg:p-4 xl:min-h-[178px]">
      <div className="grid h-full min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-[1.9fr_repeat(4,minmax(0,1fr))] lg:items-center lg:gap-0 xl:grid-cols-[1.65fr_repeat(4,minmax(0,1fr))]">
        <div className="grid min-w-0 gap-3 sm:grid-cols-[auto_1fr] sm:items-center lg:border-r lg:border-slate-200 lg:pr-5 xl:gap-4 xl:pr-7">
          <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700">
            <Landmark className="h-8 w-8" />
            <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700">
              <Leaf className="h-4 w-4" />
            </span>
          </span>
          <div className="min-w-0">
            <h2 className="max-w-[430px] whitespace-normal text-base font-black leading-tight text-[#07132E]">Built for NGOs, Foundations & Community Organizations</h2>
            <p className="mt-2 max-w-[470px] whitespace-normal text-[11px] font-bold leading-[1.45] text-[#53627A] xl:text-xs">Everything you need to manage programs, verify skills, track outcomes and create lasting impact.</p>
          </div>
        </div>
        {featureItems.map(([Icon, title, text, tone]) => (
          <article key={title} className="min-w-0 text-center lg:border-r lg:border-slate-200 lg:px-3 lg:last:border-r-0 xl:px-5">
            <span className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-2 whitespace-normal text-[13px] font-black leading-tight text-[#07132E]">{title}</h3>
            <p className="mx-auto mt-1.5 max-w-[210px] whitespace-normal text-[10px] font-bold leading-[1.3] text-[#53627A] xl:text-[11px]">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function NgoOnboardingLanding({ onCreate, onDemo, onHelp }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white text-[#07132E] [box-sizing:border-box]">
      <div className="pointer-events-none absolute right-0 top-0 h-[44vh] w-[65vw] rounded-bl-full bg-blue-50/90" aria-hidden="true" />
      <div className="pointer-events-none absolute left-[40%] top-[25%] h-[540px] w-[540px] rounded-full bg-green-100/45 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28vh] bg-gradient-to-t from-blue-50/70 to-transparent" aria-hidden="true" />
      <NgoLandingHeader onHelp={onHelp} />
      <main className="relative z-10 mx-auto w-full px-6 pb-6 pt-8 sm:px-8 sm:pt-9 lg:px-12 lg:pt-10 xl:px-16 xl:pt-12">
        <div className="absolute left-[46%] top-28 hidden grid-cols-5 gap-3 opacity-70 lg:grid" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, index) => <span key={index} className="h-1.5 w-1.5 rounded-full bg-slate-300" />)}
        </div>
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:gap-10">
          <NgoHeroContent onCreate={onCreate} onDemo={onDemo} />
          <NgoHeroVisual />
        </div>
        <NgoFeatureStrip />
      </main>
    </div>
  );
}

export function NgoOnboarding({ account, existingOrganization, jobRoles, onSubmit, onContinue, onSignOut, onDemo, onHelp }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(() => ({
    ...emptyNgoOrganizationForm,
    contactPersonName: account?.name || "",
    officialEmail: account?.email || "",
    skillSectors: []
  }));
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const toggleSkill = (skill) => {
    setForm((current) => ({
      ...current,
      skillSectors: current.skillSectors.includes(skill)
        ? current.skillSectors.filter((item) => item !== skill)
        : [...current.skillSectors, skill]
    }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateNgoOrganizationForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setIsSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setIsSaving(false);
    }
  }

  if (existingOrganization) {
    return (
      <div className="min-h-dvh bg-slate-50 px-4 py-8 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-3xl border border-green-100 bg-white p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-green-50 text-green-700">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-3xl font-black">Organization onboarding is complete</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            {existingOrganization.name} is already linked to this NGO account.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={onContinue} className="min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">Open NGO Dashboard</button>
            <button type="button" onClick={onSignOut} className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100">Logout</button>
          </div>
        </section>
      </div>
    );
  }

  if (!showForm) {
    return (
      <NgoOnboardingLanding
        onCreate={() => setShowForm(true)}
        onDemo={onDemo}
        onHelp={onHelp}
      />
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50 px-4 py-6 text-slate-950 sm:py-8">
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="bg-gradient-to-br from-blue-50 via-white to-green-50 p-6 lg:p-8">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <HandHeart className="h-7 w-7" />
            </span>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-blue-600">NGO / Foundation Onboarding</p>
            <h1 className="mt-2 text-3xl font-black leading-tight">Create your organization workspace</h1>
            <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
              For NGOs, foundations, skill-development centres and community organizations supporting workers with training and employment.
            </p>
            <div className="mt-6 rounded-2xl border border-blue-100 bg-white/80 p-4">
              <p className="flex items-center gap-2 text-sm font-black text-slate-900"><ShieldCheck className="h-4 w-4 text-green-700" /> Consent-first access</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Worker identities remain owned by workers. Your organization can assist, verify and support workers only with their permission.
              </p>
            </div>
          </aside>

          <main className="p-5 sm:p-6 lg:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Organization name" error={errors.name}>
                <input className={inputClass(errors.name)} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Udaan Skill Foundation" />
              </TextField>
              <TextField label="Organization type" error={errors.organizationType}>
                <select className={inputClass(errors.organizationType)} value={form.organizationType} onChange={(event) => setForm({ ...form, organizationType: event.target.value })}>
                  {organizationTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </TextField>
              <TextField label="Registration number (optional)">
                <input className={inputClass()} value={form.registrationNumber} onChange={(event) => setForm({ ...form, registrationNumber: event.target.value })} placeholder="Registration or CSR ID" />
              </TextField>
              <TextField label="Contact person name" error={errors.contactPersonName}>
                <input className={inputClass(errors.contactPersonName)} value={form.contactPersonName} onChange={(event) => setForm({ ...form, contactPersonName: event.target.value })} placeholder="Programme lead name" />
              </TextField>
              <TextField label="Official email" error={errors.officialEmail}>
                <input className={inputClass(errors.officialEmail)} type="email" value={form.officialEmail} onChange={(event) => setForm({ ...form, officialEmail: event.target.value })} placeholder="team@organization.org" />
              </TextField>
              <TextField label="Phone number" error={errors.phone}>
                <input className={inputClass(errors.phone)} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+91 90000 00000" />
              </TextField>
              <TextField label="Website (optional)">
                <input className={inputClass()} value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} placeholder="https://organization.org" />
              </TextField>
              <TextField label="Logo URL (optional)">
                <input className={inputClass()} value={form.logoUrl} onChange={(event) => setForm({ ...form, logoUrl: event.target.value })} placeholder="Upload support can be added later" />
              </TextField>
              <TextField label="Headquarters city">
                <input className={inputClass()} value={form.headquartersCity} onChange={(event) => setForm({ ...form, headquartersCity: event.target.value })} placeholder="Bhopal" />
              </TextField>
              <TextField label="State">
                <input className={inputClass()} value={form.headquartersState} onChange={(event) => setForm({ ...form, headquartersState: event.target.value })} placeholder="Madhya Pradesh" />
              </TextField>
              <TextField label="Locations served">
                <input className={inputClass()} value={form.locationsServed} onChange={(event) => setForm({ ...form, locationsServed: event.target.value })} placeholder="Bhopal, Indore, Sehore" />
              </TextField>
              <TextField label="Approx. workers trained">
                <input className={inputClass()} type="number" min="0" value={form.approximateWorkersTrained} onChange={(event) => setForm({ ...form, approximateWorkersTrained: event.target.value })} placeholder="0" />
              </TextField>
            </div>

            <div className="mt-5">
              <p className="text-sm font-black text-slate-800">Skill sectors supported</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {jobRoles.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`min-h-9 rounded-xl border px-3 text-xs font-black transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${form.skillSectors.includes(skill) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                    aria-pressed={form.skillSectors.includes(skill)}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {errors.skillSectors && <p className="mt-1 text-xs font-bold text-red-600">{errors.skillSectors}</p>}
            </div>

            <TextField label="Organization description">
              <textarea className={`${inputClass()} min-h-24 py-3`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Briefly describe your training and placement work." />
            </TextField>

            <label className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <input type="checkbox" checked={form.termsAccepted} onChange={(event) => setForm({ ...form, termsAccepted: event.target.checked })} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-100" />
              <span>
                <span className="block text-sm font-black text-slate-900">I confirm consent-first worker support</span>
                <span className="mt-1 block text-sm font-semibold leading-6 text-slate-600">Our organization will only assist, verify and recommend workers with their permission.</span>
                {errors.termsAccepted && <span className="mt-1 block text-xs font-bold text-red-600">{errors.termsAccepted}</span>}
              </span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={onSignOut} className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100">Logout</button>
              <button type="submit" disabled={isSaving} className="min-h-11 rounded-xl bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-4 focus:ring-blue-100">
                {isSaving ? "Creating workspace..." : "Create NGO Workspace"}
              </button>
            </div>
          </main>
        </div>
      </form>
    </div>
  );
}
