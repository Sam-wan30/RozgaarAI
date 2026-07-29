import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChefHat,
  CircleDollarSign,
  ClipboardCheck,
  Construction,
  FileBadge2,
  FileCheck2,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Home,
  Mail,
  MapPin,
  Paintbrush,
  Phone,
  Save,
  ShieldCheck,
  Shirt,
  Sparkles,
  Truck,
  UserRound,
  Users,
  Wrench,
  Edit3,
  Globe2,
  CalendarDays,
  Link2,
  FileText,
  BadgeIndianRupee
} from "lucide-react";
import { useMemo, useState } from "react";
import { organizationTypes } from "./NgoOnboarding";

function asListText(value) {
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function parseList(value) {
  return String(value || "").split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-800">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

const inputClass = "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

const demoProfileDefaults = {
  name: "Rozgaar India Demo NGO",
  organizationType: "NGO",
  registrationNumber: "NGO/BPL/MP/2023/1456",
  contactPersonName: "Demo Coordinator",
  officialEmail: "demo.ngo@rozgaarai.org",
  alternateEmail: "coordinator@rozgaarindia.org",
  phone: "+91 90000 45678",
  establishedOn: "12 Aug 2023",
  website: "https://rozgaarindia.org",
  logoUrl: "https://rozgaarindia.org/logo.png",
  headquartersCity: "Bhopal",
  headquartersState: "Madhya Pradesh",
  locationsServed: "Bhopal, Delhi, Lucknow, Nagpur, Raipur",
  approximateWorkersTrained: 1248,
  description: "Rozgaar India Demo NGO works towards skilling, certifying and placing informal workers across multiple sectors. Our mission is to create sustainable livelihoods and ensure dignity of work.",
  mission: "Empowering informal workers with dignity and opportunity.",
  skillSectors: ["Plumber", "Electrician", "Driver", "Construction Worker", "Domestic Worker", "Cook", "Delivery Worker", "Tailor", "Beautician", "Security Guard", "Cleaner", "General Helper", "Carpenter"]
};

const skillIconMap = {
  Plumber: Wrench,
  Electrician: Sparkles,
  Driver: Truck,
  "Construction Worker": Construction,
  "Domestic Worker": Home,
  Cook: ChefHat,
  "Delivery Worker": BriefcaseBusiness,
  Tailor: Shirt,
  Beautician: Paintbrush,
  "Security Guard": ShieldCheck,
  Cleaner: Sparkles,
  "General Helper": Hammer,
  Carpenter: Hammer
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function profileValue(organization, key) {
  const value = organization?.[key];
  if (Array.isArray(value)) return value.length ? value.join(", ") : demoProfileDefaults[key];
  return value || demoProfileDefaults[key] || "";
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="group flex min-h-[42px] items-center gap-2.5 rounded-xl border border-[#e6edf7] bg-white px-3 py-1 shadow-[0_8px_20px_rgba(15,23,42,0.025)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f5f8fc] text-[#5f7191] transition group-hover:bg-blue-50 group-hover:text-blue-700">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-black leading-3 text-[#6a7892]">{label}</p>
        <p className="truncate text-xs font-black leading-4 text-[#111a3b]">{value}</p>
      </div>
    </div>
  );
}

function ProfileKpi({ icon: Icon, value, label, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    purple: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-500",
    cyan: "bg-cyan-50 text-cyan-600"
  };
  return (
    <div className="group flex min-w-[145px] flex-1 items-center justify-center gap-3 border-[#dbe5f2] px-3 py-1.5 transition duration-200 hover:-translate-y-0.5 sm:border-r sm:last:border-r-0">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tones[tone] || tones.blue} transition group-hover:scale-105`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-black leading-7 text-[#111a3b]">{value}</p>
        <p className="max-w-[88px] text-[11px] font-black leading-3 text-[#52627a]">{label}</p>
      </div>
    </div>
  );
}

function SideCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-[#e6edf7] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.045)]">
      <h3 className="text-sm font-black text-[#111a3b]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function NgoOrganizationProfile({ organization, jobRoles, onSave, setStatusMessage }) {
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    name: organization?.name || "",
    organizationType: organization?.organizationType || "NGO",
    registrationNumber: organization?.registrationNumber || "",
    contactPersonName: organization?.contactPersonName || "",
    officialEmail: organization?.officialEmail || "",
    phone: organization?.phone || "",
    website: organization?.website || "",
    headquartersCity: organization?.headquartersCity || "",
    headquartersState: organization?.headquartersState || "",
    locationsServed: asListText(organization?.locationsServed),
    skillSectors: organization?.skillSectors || [],
    description: organization?.description || "",
    approximateWorkersTrained: organization?.approximateWorkersTrained || 0,
    logoUrl: organization?.logoUrl || ""
  }));

  const completion = useMemo(() => {
    const fields = [
      organization?.name,
      organization?.organizationType,
      organization?.contactPersonName,
      organization?.officialEmail,
      organization?.phone,
      organization?.headquartersCity,
      organization?.headquartersState,
      organization?.description,
      organization?.locationsServed?.length,
      organization?.skillSectors?.length
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [organization]);

  const toggleSkill = (skill) => {
    setForm((current) => ({
      ...current,
      skillSectors: current.skillSectors.includes(skill)
        ? current.skillSectors.filter((item) => item !== skill)
        : [...current.skillSectors, skill]
    }));
  };

	  async function saveProfile(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        ...form,
        locationsServed: parseList(form.locationsServed),
        approximateWorkersTrained: Number(form.approximateWorkersTrained || 0)
      });
      setEditing(false);
      setStatusMessage?.("Organization profile updated.");
    } finally {
      setIsSaving(false);
    }
	  }

  const isDemoOrganization = organization?.id === "demo-ngo" || organization?.verificationStatus === "Demo Mode";
  const display = {
    ...demoProfileDefaults,
    ...organization,
    registrationNumber: profileValue(organization, "registrationNumber"),
    alternateEmail: profileValue(organization, "alternateEmail"),
    establishedOn: profileValue(organization, "establishedOn"),
    website: profileValue(organization, "website"),
    logoUrl: profileValue(organization, "logoUrl"),
    locationsServed: profileValue(organization, "locationsServed"),
    approximateWorkersTrained: organization?.approximateWorkersTrained || demoProfileDefaults.approximateWorkersTrained,
    description: profileValue(organization, "description"),
    mission: organization?.mission || demoProfileDefaults.mission,
    skillSectors: isDemoOrganization ? demoProfileDefaults.skillSectors : (organization?.skillSectors?.length ? organization.skillSectors : demoProfileDefaults.skillSectors)
  };

  const details = [
    [Building2, "Organization Name", display.name],
    [FileBadge2, "Organization Type", display.organizationType],
    [ClipboardCheck, "Registration Number", display.registrationNumber],
    [UserRound, "Contact Person", display.contactPersonName],
    [Mail, "Official Email", display.officialEmail],
    [Mail, "Alternate Email", display.alternateEmail],
    [Phone, "Phone", display.phone],
    [CalendarDays, "Established On", display.establishedOn],
    [Globe2, "Website", display.website],
    [Link2, "Logo URL", display.logoUrl],
    [MapPin, "Headquarters City", display.headquartersCity],
    [MapPin, "State", display.headquartersState],
    [MapPin, "Locations Served", display.locationsServed],
    [BadgeIndianRupee, "Approx. Workers Trained", formatNumber(display.approximateWorkersTrained)]
  ];

  const kpis = [
    [Users, formatNumber(display.approximateWorkersTrained), "Workers Onboarded", "blue"],
    [GraduationCap, "62", "Active Trainings", "green"],
    [FileCheck2, "186", "Certificates Issued", "purple"],
    [BriefcaseBusiness, "37", "Placements", "orange"],
    [MapPin, "5", "Cities Covered", "blue"],
    [Building2, "12", "Programs Running", "cyan"]
  ];

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1540px] flex-col gap-4 overflow-y-auto pb-3 text-[#111a3b] xl:overflow-hidden">
      <section className="rounded-2xl border border-[#e6edf7] bg-white p-4 shadow-[0_16px_42px_rgba(15,23,42,0.055)]">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#f3fbf4_0%,#ffffff_47%,#eefdfb_100%)] px-5 py-4">
          <div className="pointer-events-none absolute -right-12 -top-20 h-60 w-72 rotate-[-22deg] rounded-[44%] bg-emerald-100/45 blur-sm" />
          <div className="pointer-events-none absolute right-52 top-0 h-48 w-56 rotate-[28deg] rounded-[44%] bg-cyan-100/35 blur-sm" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_330px] lg:items-center">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-[#e6edf7] bg-white text-emerald-500 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
                <Building2 className="h-12 w-12" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-[28px] font-black leading-tight text-[#111a3b] lg:text-[30px]">{display.name}</h2>
                <p className="mt-2 text-sm font-bold text-[#52627a]">{display.organizationType} • {display.headquartersCity}, {display.headquartersState}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Demo Mode
                </span>
                <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-[#52627a]">{display.mission}</p>
              </div>
            </div>
            <div className="grid gap-5">
              <div>
                <div className="flex items-center justify-between text-sm font-black text-[#111a3b]">
                  <span>Profile completion</span>
                  <span>90%</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-blue-100">
                  <div className="h-full rounded-full bg-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.22)]" style={{ width: "90%" }} />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[#e6edf7] bg-white/82 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.045)] backdrop-blur">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-black text-[#111a3b]">Verified Organization</p>
                  <p className="mt-1 text-xs font-bold text-[#52627a]">Last verified on 15 May 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap overflow-hidden rounded-2xl border border-[#dfe8f4] bg-white py-2.5 shadow-[0_10px_26px_rgba(15,23,42,0.025)]">
          {kpis.map(([Icon, value, label, tone]) => <ProfileKpi key={label} icon={Icon} value={value} label={label} tone={tone} />)}
        </div>
      </section>

      <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <form onSubmit={saveProfile} className="min-h-0 overflow-hidden rounded-2xl border border-[#e6edf7] bg-white shadow-[0_16px_42px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5">
            <h3 className="text-lg font-black text-[#111a3b]">Organization Details</h3>
            <button type="button" onClick={() => setEditing((value) => !value)} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-black text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50">
              <Edit3 className="h-4 w-4" />
              {editing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>
          <div className="min-h-0 overflow-y-auto px-5 pb-4">
            <div className="grid gap-1.5 md:grid-cols-2">
              {details.map(([Icon, label, value]) => <InfoCard key={label} icon={Icon} label={label} value={value} />)}
            </div>

            {editing && (
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Organization name"><input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
                  <Field label="Organization type"><select className={inputClass} value={form.organizationType} onChange={(event) => setForm({ ...form, organizationType: event.target.value })}>{organizationTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></Field>
                  <Field label="Registration number"><input className={inputClass} value={form.registrationNumber} onChange={(event) => setForm({ ...form, registrationNumber: event.target.value })} /></Field>
                  <Field label="Contact person"><input className={inputClass} value={form.contactPersonName} onChange={(event) => setForm({ ...form, contactPersonName: event.target.value })} /></Field>
                  <Field label="Official email"><input className={inputClass} value={form.officialEmail} onChange={(event) => setForm({ ...form, officialEmail: event.target.value })} /></Field>
                  <Field label="Phone"><input className={inputClass} value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Field>
                  <Field label="Website"><input className={inputClass} value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></Field>
                  <Field label="Logo URL"><input className={inputClass} value={form.logoUrl} onChange={(event) => setForm({ ...form, logoUrl: event.target.value })} /></Field>
                  <Field label="Headquarters city"><input className={inputClass} value={form.headquartersCity} onChange={(event) => setForm({ ...form, headquartersCity: event.target.value })} /></Field>
                  <Field label="State"><input className={inputClass} value={form.headquartersState} onChange={(event) => setForm({ ...form, headquartersState: event.target.value })} /></Field>
                  <Field label="Locations served"><input className={inputClass} value={form.locationsServed} onChange={(event) => setForm({ ...form, locationsServed: event.target.value })} /></Field>
                  <Field label="Approx. workers trained"><input type="number" min="0" className={inputClass} value={form.approximateWorkersTrained} onChange={(event) => setForm({ ...form, approximateWorkersTrained: event.target.value })} /></Field>
                </div>
                <Field label="Description">
                  <textarea className={`${inputClass} min-h-24 py-3`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                </Field>
              </div>
            )}

            <div className="mt-4 border-t border-[#e6edf7] pt-4">
              <p className="text-sm font-black text-[#111a3b]">Skill Sectors We Work In</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {display.skillSectors.map((skill) => {
                  const Icon = skillIconMap[skill] || Wrench;
                  return (
                    <button key={skill} type="button" disabled={!editing} onClick={() => toggleSkill(skill)} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-blue-200 bg-blue-50/60 px-3.5 text-xs font-black text-blue-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-[0_8px_18px_rgba(37,99,235,0.12)] disabled:cursor-default">
                      <Icon className="h-3.5 w-3.5" />
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={isSaving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70">
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </form>

        <div className="grid content-start gap-3.5">
          <SideCard title="About Organization">
            <p className="text-sm font-semibold leading-6 text-[#52627a]">{display.description}</p>
            <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm font-black leading-6 text-emerald-800">
              <span className="mb-1 block text-3xl leading-none text-emerald-500">“</span>
              Building a future where every worker has skills, rights and opportunities.
            </div>
          </SideCard>
          <SideCard title="Focus Areas">
            <div className="grid gap-2.5">
              {["Skill Development", "Worker Certification", "Job Placement", "Worker Rights & Welfare", "Financial Inclusion"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-black text-[#314567]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </SideCard>
          <SideCard title="Documents & Compliance">
            <div className="grid gap-4">
              {[
                ["Registration Certificate", "View Document"],
                ["80G Certificate", "View Document"],
                ["12A Registration", "View Document"],
                ["FCRA Status", "Pending"]
              ].map(([title, action]) => (
                <div key={title} className="flex items-start gap-3 text-xs">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#587091]" />
                  <div>
                    <p className="font-black text-[#243756]">{title}</p>
                    {action === "Pending"
                      ? <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">{action}</span>
                      : <button type="button" className="mt-1 text-xs font-black text-blue-700 underline-offset-2 transition hover:text-blue-800 hover:underline">{action}</button>}
                  </div>
                </div>
              ))}
            </div>
          </SideCard>
        </div>
      </div>
    </div>
  );
}
