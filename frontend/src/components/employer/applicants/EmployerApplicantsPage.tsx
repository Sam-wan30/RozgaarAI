import {
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MapPin,
  Star,
  User,
  UserRoundPlus
} from "lucide-react";

const fallbackMatches = [98, 96, 94, 97, 95];
const stageOrder = ["Recommended", "Shortlisted", "Shortlisted", "Interview Scheduled", "Selected"];

function ShellCard({ children, className = "" }) {
  return (
    <section className={`rounded-[16px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.045)] ${className}`}>
      {children}
    </section>
  );
}

function ApplicantAvatar({ worker }) {
  const initials = worker?.avatar || String(worker?.name || "RA").split(/\s+/).map((part) => part[0]).slice(0, 2).join("");
  return (
    <span className="grid h-[52px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 p-0.5 text-sm font-black text-white shadow-[0_10px_20px_rgba(15,23,42,0.14)]">
      {worker?.photoUrl ? (
        <img src={worker.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center rounded-full bg-blue-600">{initials}</span>
      )}
    </span>
  );
}

function MatchBadge({ value }) {
  return (
    <span className="inline-flex min-h-8 items-center rounded-lg border border-green-100 bg-green-50 px-3 text-[15px] font-black text-green-700">
      {value}%
    </span>
  );
}

function StageBadge({ stage }) {
  const config = {
    Recommended: { icon: Star, className: "border-green-100 bg-green-50 text-green-700" },
    Shortlisted: { icon: Bookmark, className: "border-amber-100 bg-amber-50 text-amber-700" },
    "Interview Scheduled": { icon: CalendarDays, className: "border-blue-100 bg-blue-50 text-blue-700" },
    Selected: { icon: CheckCircle2, className: "border-violet-100 bg-violet-50 text-violet-700" }
  }[stage] || { icon: CheckCircle2, className: "border-slate-100 bg-slate-50 text-slate-600" };
  const Icon = config.icon;

  return (
    <span className={`inline-flex min-h-8 items-center gap-2 rounded-lg border px-3 text-xs font-black ${config.className}`}>
      <Icon className="h-4 w-4" />
      {stage}
    </span>
  );
}

function ActionLinks({ item, onViewProfile, onShortlist, onSchedule, onSelect }) {
  const actions = [
    [UserRoundPlus, "View Profile", onViewProfile],
    [Star, "Shortlist", onShortlist],
    [CalendarDays, "Schedule", onSchedule],
    [CheckCircle2, "Select", onSelect]
  ];

  return (
    <div className="grid gap-1.5">
      {actions.map(([Icon, label, action]) => (
        <button
          key={label}
          type="button"
          onClick={action}
          className="inline-flex w-fit items-center gap-2 rounded-md text-[13px] font-black text-blue-700 transition hover:bg-blue-50 hover:px-1"
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

function ApplicantRow({
  item,
  index,
  roleLabel,
  cityLabel,
  navigateTo,
  updateApplicationStage,
  setInterviewForm
}) {
  const stage = item.status || stageOrder[index] || "Recommended";
  const match = item.matchScore || item.worker?.jobMatch || fallbackMatches[index] || 95;

  return (
    <div className="grid min-h-[96px] grid-cols-[1.2fr_1fr_0.52fr_0.88fr_0.82fr] items-center gap-6 border-t border-dashed border-slate-200 px-5 py-3 transition hover:bg-blue-50/35">
      <div className="flex min-w-0 items-center gap-4">
        <ApplicantAvatar worker={item.worker} />
        <div className="min-w-0">
          <p className="truncate text-[17px] font-black text-slate-950">{item.worker?.name}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-slate-500">
            <MapPin className="h-4 w-4" />
            {cityLabel(item.worker?.city)}
          </p>
        </div>
      </div>

      <p className="truncate text-[15px] font-black text-slate-950">{item.job?.title || roleLabel(item.worker?.skill)}</p>

      <MatchBadge value={match} />

      <StageBadge stage={stage} />

      <ActionLinks
        item={item}
        onViewProfile={() => navigateTo(`/employer/workers/${item.workerId}`)}
        onShortlist={() => updateApplicationStage(item.id, "Shortlisted")}
        onSchedule={() => {
          setInterviewForm((current) => ({ ...current, candidateId: item.workerId, jobId: item.jobId }));
          updateApplicationStage(item.id, "Interview Scheduled");
        }}
        onSelect={() => updateApplicationStage(item.id, "Selected")}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-950">{label}</span>
      {children}
    </label>
  );
}

function SelectField({ value, onChange, children }) {
  return (
    <span className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-bold text-slate-600 outline-none transition hover:border-blue-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </span>
  );
}

function TextInput({ type = "text", value, onChange, placeholder }) {
  const Icon = type === "time" ? Clock3 : type === "date" ? CalendarDays : null;
  return (
    <span className="relative block">
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-bold text-slate-600 outline-none transition placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      />
      {Icon && <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />}
    </span>
  );
}

function InterviewSchedulerCard({
  workers,
  jobs,
  interviewForm,
  setInterviewForm,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="h-fit rounded-[16px] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.045)]">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700">
          <CalendarDays className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-black text-slate-950">Schedule Interview</h3>
      </div>

      <div className="mt-7 space-y-5">
        <Field label="Candidate">
          <SelectField value={interviewForm.candidateId} onChange={(candidateId) => setInterviewForm({ ...interviewForm, candidateId })}>
            <option value="">Select candidate</option>
            {workers.map((worker) => <option key={worker.workerId} value={worker.workerId}>{worker.name}</option>)}
          </SelectField>
        </Field>
        <Field label="Job">
          <SelectField value={interviewForm.jobId} onChange={(jobId) => setInterviewForm({ ...interviewForm, jobId })}>
            <option value="">Select job</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
          </SelectField>
        </Field>
        <Field label="Date">
          <TextInput type="date" value={interviewForm.date} onChange={(date) => setInterviewForm({ ...interviewForm, date })} />
        </Field>
        <Field label="Time">
          <TextInput type="time" value={interviewForm.time} onChange={(time) => setInterviewForm({ ...interviewForm, time })} />
        </Field>
        <Field label="Location / Meeting Link">
          <TextInput value={interviewForm.location} onChange={(location) => setInterviewForm({ ...interviewForm, location })} placeholder="Phone, address, or meeting link" />
        </Field>
      </div>

      <button type="submit" className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700">
        <CalendarDays className="h-4 w-4" />
        Schedule Interview
      </button>
    </form>
  );
}

export function EmployerApplicantsPage({
  applications,
  workers,
  jobs,
  roleLabel,
  cityLabel,
  navigateTo,
  updateApplicationStage,
  interviewForm,
  setInterviewForm,
  scheduleEmployerInterview
}) {
  const displayApplications = applications.slice(0, 5);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/80 px-2 py-4 lg:px-3">
      <div className="shrink-0">
        <h2 className="text-[34px] font-black leading-tight text-slate-950">Applicants</h2>
        <p className="mt-3 text-[15px] font-bold text-slate-600">Review and manage applicants for your job posts</p>
      </div>

      <div className="mt-7 grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <ShellCard className="min-h-0 overflow-hidden">
          <div className="grid h-12 grid-cols-[1.2fr_1fr_0.52fr_0.88fr_0.82fr] items-center gap-6 border-b border-slate-200 px-5 text-xs font-black uppercase tracking-[0.1em] text-slate-500">
            <span>Worker</span>
            <span>Job</span>
            <span>Match</span>
            <span>Stage</span>
            <span>Actions</span>
          </div>

          <div className="min-h-0 overflow-y-auto">
            {displayApplications.map((item, index) => (
              <ApplicantRow
                key={item.id}
                item={item}
                index={index}
                roleLabel={roleLabel}
                cityLabel={cityLabel}
                navigateTo={navigateTo}
                updateApplicationStage={updateApplicationStage}
                setInterviewForm={setInterviewForm}
              />
            ))}
            {!displayApplications.length && (
              <div className="px-5 py-10 text-center text-sm font-bold text-slate-500">No applicants yet.</div>
            )}
          </div>
        </ShellCard>

        <InterviewSchedulerCard
          workers={workers}
          jobs={jobs}
          interviewForm={interviewForm}
          setInterviewForm={setInterviewForm}
          onSubmit={scheduleEmployerInterview}
        />
      </div>
    </section>
  );
}
