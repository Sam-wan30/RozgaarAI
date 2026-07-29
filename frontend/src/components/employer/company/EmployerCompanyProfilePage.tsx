import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Edit3,
  ExternalLink,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users
} from "lucide-react";

function Card({ children, className = "" }) {
  return (
    <section className={`rounded-[16px] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.045)] ${className}`}>
      {children}
    </section>
  );
}

function OutlineButton({ icon: Icon, children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-4 text-sm font-black text-blue-700 transition hover:border-blue-400 hover:bg-blue-50 ${className}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}

function CompanyHeader() {
  return (
    <div className="flex shrink-0 items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-blue-700">
          <Building2 className="h-8 w-8" />
        </span>
        <div>
          <h2 className="text-[28px] font-black leading-none text-slate-950">Company Profile</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">Manage company identity, hiring preferences, notification settings, and contact permissions.</p>
        </div>
      </div>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-black text-green-700">
      <ShieldCheck className="h-3.5 w-3.5 fill-green-600 text-green-600" />
      Verified
    </span>
  );
}

function CompanyHeroCard({ profile, onEdit }) {
  const meta = [
    { icon: MapPin, value: profile.location },
    { icon: Users, value: profile.size },
    { icon: CalendarDays, value: profile.joined }
  ].filter((item) => item.value && !String(item.value).startsWith("Add "));

  return (
    <Card className="flex min-h-[120px] items-center justify-between gap-5 p-5">
      <div className="flex min-w-0 items-center gap-5">
        <span className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700">
          <Building2 className="h-10 w-10" />
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-xl font-black text-slate-950">{profile.name}</h3>
            <ShieldCheck className="h-5 w-5 shrink-0 fill-green-600 text-green-600" />
          </div>
          <p className="mt-2 text-sm font-bold text-slate-600">{profile.tagline}</p>
          {meta.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-bold text-slate-600">
              {meta.map(({ icon: MetaIcon, value }, index) => (
                <span key={value} className="inline-flex items-center gap-4">
                  {index > 0 && <span className="text-slate-300">•</span>}
                  <span className="inline-flex items-center gap-2">
                    <MetaIcon className="h-4 w-4" />
                    {value}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm font-bold text-slate-400">Add company details to complete your public employer profile.</p>
          )}
        </div>
      </div>
      <OutlineButton icon={Edit3} onClick={onEdit} className="shrink-0">Edit Company Profile</OutlineButton>
    </Card>
  );
}

function MetricCard({ icon: Icon, value, title, subtitle, link, tone, progress, onClick }) {
  return (
    <Card className="flex h-[138px] flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(37,99,235,0.08)]">
      <div className="flex items-start gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-black text-slate-950">{title}</p>
          <p className="mt-2 text-[28px] font-black leading-none text-slate-950">{value}</p>
          <p className="mt-2 text-sm font-bold text-slate-500">{subtitle}</p>
        </div>
      </div>
      {typeof progress === "number" && (
        <span className="mb-1 block h-2 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
        </span>
      )}
      <button type="button" onClick={onClick} className="inline-flex w-fit items-center gap-2 text-sm font-black text-blue-700 hover:text-blue-800">
        {link} <ChevronRight className="h-4 w-4" />
      </button>
    </Card>
  );
}

function CompanyInformationCard({ profile, onEdit }) {
  const rows = [
    ["Company Name", profile.name],
    ["Industry", profile.industry],
    ["Company Size", profile.size],
    ["Headquarters", profile.location],
    ["Website", profile.website],
    ["Founded", profile.founded]
  ];

  return (
    <Card className="flex h-[318px] flex-col overflow-hidden p-5">
      <h3 className="text-base font-black text-slate-950">Company Information</h3>
      <div className="mt-3 grid min-h-0 flex-1 gap-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[150px_minmax(0,1fr)] gap-3 text-sm">
            <p className="font-bold text-slate-500">{label}</p>
            {label === "Website" && !String(value).startsWith("Add ") ? (
              <a href={`https://${value}`} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-1 font-black text-blue-700 hover:underline">
                <span className="truncate">{value}</span><ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            ) : (
              <p className="truncate font-bold text-slate-700">{value}</p>
            )}
          </div>
        ))}
      </div>
      <OutlineButton icon={Edit3} onClick={onEdit} className="mt-3 h-9 w-fit shrink-0">Edit Information</OutlineButton>
    </Card>
  );
}

function PreferenceItem({ icon: Icon, tone, title, subtitle }) {
  return (
    <button type="button" className="flex w-full items-center gap-3 border-b border-slate-100 py-3 text-left last:border-b-0 hover:bg-slate-50/60">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-slate-950">{title}</span>
        <span className="mt-1 block truncate text-xs font-bold text-slate-500">{subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-slate-500" />
    </button>
  );
}

function HiringPreferencesCard({ preferences, onEdit }) {
  return (
    <Card className="flex h-[318px] flex-col overflow-hidden p-5">
      <h3 className="text-base font-black text-slate-950">Hiring Preferences</h3>
      <div className="mt-3 min-h-0 flex-1">
        <PreferenceItem icon={BriefcaseBusiness} tone="bg-green-50 text-green-700" title="Preferred Job Categories" subtitle={preferences.categories} />
        <PreferenceItem icon={Users} tone="bg-blue-50 text-blue-700" title="Experience Levels" subtitle={preferences.experience} />
        <PreferenceItem icon={Building2} tone="bg-violet-50 text-violet-700" title="Employment Types" subtitle={preferences.employmentTypes} />
      </div>
      <OutlineButton icon={Edit3} onClick={onEdit} className="mt-3 h-9 w-fit shrink-0">Edit Preferences</OutlineButton>
    </Card>
  );
}

function Toggle({ checked }) {
  return (
    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-300"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${checked ? "left-6" : "left-1"}`} />
    </span>
  );
}

function NotificationRow({ icon: Icon, title, subtitle, checked }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-blue-700"><Icon className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 truncate text-xs font-bold text-slate-500">{subtitle}</p>
      </div>
      <Toggle checked={checked} />
    </div>
  );
}

function NotificationSettingsCard({ onManage }) {
  return (
    <Card className="flex h-[318px] flex-col p-5">
      <h3 className="text-base font-black text-slate-950">Notification Settings</h3>
      <div className="mt-4 flex-1">
        <NotificationRow icon={Bell} title="New Applicant Alerts" subtitle="Get notified when someone applies" checked />
        <NotificationRow icon={Users} title="Shortlist Notifications" subtitle="Get notified about shortlisted candidates" checked />
        <NotificationRow icon={CalendarDays} title="Interview Updates" subtitle="Get notified about interview schedules" checked />
        <NotificationRow icon={BriefcaseBusiness} title="Job Post Performance" subtitle="Weekly performance summary" checked={false} />
      </div>
      <OutlineButton onClick={onManage} className="mt-4 w-fit">Manage Notifications</OutlineButton>
    </Card>
  );
}

function ContactPermissionsCard({ profile, onManage }) {
  return (
    <Card className="flex h-[132px] flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-950">Contact & Permissions</h3>
          <p className="mt-2 text-sm font-bold text-slate-500">Manage who can contact your company and permissions for team members.</p>
        </div>
        <OutlineButton icon={ShieldCheck} onClick={onManage} className="h-9 shrink-0">Manage Permissions</OutlineButton>
      </div>
      <div className="grid grid-cols-[1fr_1fr_1.25fr] items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Mail className="h-5 w-5" /></span>
          <p className={`text-sm font-black ${profile.email.startsWith("Add ") ? "text-slate-400" : "text-slate-950"}`}>{profile.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Phone className="h-5 w-5" /></span>
          <p className={`text-sm font-black ${profile.phone.startsWith("Add ") ? "text-slate-400" : "text-slate-950"}`}>{profile.phone}</p>
        </div>
        <button type="button" className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 text-left hover:bg-slate-50">
          <span className="flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Globe2 className="h-5 w-5" /></span>
            <span>
              <span className="block text-sm font-black text-slate-950">Public Profile</span>
              <span className="mt-1 block text-sm font-bold text-slate-500">{profile.publicVisibility}</span>
            </span>
          </span>
          <ChevronRight className="h-5 w-5 text-slate-500" />
        </button>
      </div>
    </Card>
  );
}

export function EmployerCompanyProfilePage({ account, companyName, analytics, navigateTo, isEmployerDemoMode = false, setStatusMessage }) {
  const profile = {
    name: isEmployerDemoMode ? "Samiksha Wanjari Enterprises" : companyName,
    location: account?.city || account?.location || (isEmployerDemoMode ? "Bhopal, Madhya Pradesh, India" : "Add headquarters"),
    size: isEmployerDemoMode ? "51–200 employees" : (account?.companySize || "Add company size"),
    industry: isEmployerDemoMode ? "Information Technology" : (account?.industry || "Add industry"),
    website: isEmployerDemoMode ? "www.samikshawanjari.com" : (account?.website || "Add website"),
    founded: isEmployerDemoMode ? "2025" : (account?.founded || "Add founded year"),
    email: isEmployerDemoMode ? "hr@rozgaarai-demo.com" : "Add contact email",
    phone: isEmployerDemoMode ? "+91 90000 12345" : "Add phone number",
    tagline: isEmployerDemoMode ? "Building great teams. Empowering talent." : "Add a company tagline to introduce your hiring team.",
    joined: isEmployerDemoMode ? "Joined May 2025" : "",
    publicVisibility: isEmployerDemoMode ? "Visible to workers" : "Configure visibility"
  };
  const preferences = isEmployerDemoMode
    ? {
        categories: "IT & Software, Data Science, Design, Marketing",
        experience: "Fresher, 1–3 years, 3–5 years",
        employmentTypes: "Full-time, Intern, Contract"
      }
    : {
        categories: "Add preferred job categories",
        experience: "Add preferred experience levels",
        employmentTypes: "Add employment types"
      };
  const profileFields = [profile.name, profile.location, profile.size, profile.industry, profile.website, profile.founded, profile.email].filter((value) => value && !String(value).startsWith("Add "));
  const profileStrength = isEmployerDemoMode ? 85 : Math.round((profileFields.length / 7) * 100);
  const activeJobs = Number(analytics?.activeJobs || 0);
  const applicants = Number(analytics?.applicants || 0);
  const memberCount = isEmployerDemoMode ? 3 : 1;
  const feedback = (message) => setStatusMessage?.(message);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-y-auto bg-[#f8fafc] px-2 py-3 xl:overflow-hidden lg:px-3">
      <CompanyHeader />
      <div className="mt-6 shrink-0">
        <CompanyHeroCard profile={profile} onEdit={() => feedback("Company profile editing is ready.")} />
      </div>
      <div className="mt-5 grid shrink-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={BriefcaseBusiness} value={activeJobs} title="Active Job Posts" subtitle="Published job posts" link="View all job posts" tone="bg-blue-50 text-blue-700" onClick={() => navigateTo("/employer/jobs")} />
        <MetricCard icon={Users} value={applicants} title="Total Applicants" subtitle="Across all job posts" link="View all applicants" tone="bg-green-50 text-green-700" onClick={() => navigateTo("/employer/applicants")} />
        <MetricCard icon={ShieldCheck} value={`${profileStrength}%`} title="Profile Strength" subtitle="Complete your profile" link="Improve profile" tone="bg-violet-50 text-violet-700" progress={profileStrength} onClick={() => feedback("Profile improvement checklist is ready.")} />
        <MetricCard icon={User} value={memberCount} title="Member Accounts" subtitle="Team members" link="Manage members" tone="bg-orange-50 text-orange-600" onClick={() => feedback("Member management is ready.")} />
      </div>
      <div className="mt-5 grid min-h-0 flex-1 grid-cols-1 gap-5 xl:grid-cols-[1.05fr_1fr_1.05fr]">
        <CompanyInformationCard profile={profile} onEdit={() => feedback("Company information editing is ready.")} />
        <HiringPreferencesCard preferences={preferences} onEdit={() => feedback("Hiring preferences editing is ready.")} />
        <NotificationSettingsCard onManage={() => feedback("Notification settings are ready.")} />
      </div>
      <div className="mt-5 shrink-0">
        <ContactPermissionsCard profile={profile} onManage={() => feedback("Permission management is ready.")} />
      </div>
    </section>
  );
}
