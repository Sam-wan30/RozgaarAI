import { Award, BookOpenCheck, Building2, CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { database } from "../../lib/database";

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function Card({ children, className = "" }) {
  return <section className={`rounded-[22px] border border-slate-200 bg-white p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] ${className}`}>{children}</section>;
}

function Badge({ children, tone = "blue" }) {
  const tones = {
    blue: "border-blue-100 bg-blue-50 text-blue-700",
    green: "border-green-100 bg-green-50 text-green-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-white text-slate-600"
  };
  return <span className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-black ${tones[tone]}`}>{children}</span>;
}

function titleCase(value = "") {
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function WorkerTraining({ workerProfile }) {
  const [records, setRecords] = useState({ enrollments: [], attendance: [], assessments: [], certificates: [] });

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!workerProfile?.workerId) return;
      const [attendance, assessments, certificates] = await Promise.all([
        database.getWorkerTrainingAttendance(workerProfile.workerId),
        database.getWorkerAssessments(workerProfile.workerId),
        database.getWorkerCertificates(workerProfile.workerId)
      ]);
      if (alive) setRecords({ enrollments: [], attendance, assessments, certificates });
    }
    load();
    return () => { alive = false; };
  }, [workerProfile?.workerId]);

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-5">
      <Card className="bg-gradient-to-br from-white via-blue-50/40 to-green-50/40">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Worker Training</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Training & Certificates</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              Organization-provided records appear here for review. You own your RozgaarAI profile and control what verified credentials are shared with employers.
            </p>
          </div>
          <ShieldCheck className="h-10 w-10 text-green-600" />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><BookOpenCheck className="h-6 w-6 text-blue-600" /><p className="mt-3 text-2xl font-black">{records.attendance.length}</p><p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Attendance Records</p></Card>
        <Card><CheckCircle2 className="h-6 w-6 text-green-600" /><p className="mt-3 text-2xl font-black">{records.assessments.length}</p><p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Assessments</p></Card>
        <Card><Award className="h-6 w-6 text-violet-600" /><p className="mt-3 text-2xl font-black">{records.certificates.length}</p><p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Certificates</p></Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <h3 className="text-xl font-black text-slate-950">Assessments</h3>
          <div className="mt-4 divide-y divide-slate-100">
            {records.assessments.length ? records.assessments.map((assessment) => (
              <article key={assessment.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-slate-950">{assessment.assessmentTitle}</p>
                  <Badge tone={assessment.resultStatus === "passed" ? "green" : "amber"}>{titleCase(assessment.resultStatus)}</Badge>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-500">{assessment.skillName} • {assessment.percentage}% • {formatDate(assessment.assessmentDate)}</p>
                {assessment.feedback && <p className="mt-2 text-sm font-semibold text-slate-600">{assessment.feedback}</p>}
              </article>
            )) : <p className="text-sm font-semibold text-slate-500">No organization-provided assessments yet.</p>}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-black text-slate-950">Certificates</h3>
          <div className="mt-4 space-y-3">
            {records.certificates.length ? records.certificates.map((certificate) => (
              <article key={certificate.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><GraduationCap className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-950">{certificate.certificateTitle}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{certificate.certificateNumber} • {certificate.skillName}</p>
                    <p className="mt-2 flex items-center gap-2 text-xs font-black text-slate-500"><Building2 className="h-3.5 w-3.5" /> Organization-issued record</p>
                  </div>
                  <Badge tone={certificate.verificationStatus === "verified" ? "green" : certificate.verificationStatus === "revoked" ? "rose" : "blue"}>{titleCase(certificate.verificationStatus)}</Badge>
                </div>
              </article>
            )) : <p className="text-sm font-semibold text-slate-500">No certificates issued yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
