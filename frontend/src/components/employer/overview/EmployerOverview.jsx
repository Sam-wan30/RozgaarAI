import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users
} from "lucide-react";
import employerRobotReference from "../../../assets/employer-robot-reference.png";

function OverviewCard({ children, className = "" }) {
  return (
    <section className={`rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.045)] ${className}`}>
      {children}
    </section>
  );
}

function AssistantVisual({ label }) {
  return (
    <div className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[46%] overflow-hidden rounded-r-[20px] md:block" aria-hidden="true">
      <div className="absolute bottom-0 right-0 h-24 w-full rounded-tl-[5rem] bg-blue-100/80" />
      <img
        src={employerRobotReference}
        alt=""
        className="absolute bottom-4 right-4 h-[176px] w-auto object-contain drop-shadow-[0_18px_22px_rgba(37,99,235,0.16)]"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

function EmployerOverviewHero({ copy, companyName, summary, hasJobs, onReviewMatches, onPostJob }) {
  return (
    <OverviewCard className="relative h-full overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 p-3 lg:col-span-5">
      <div className="relative z-10 max-w-full md:max-w-[64%]">
        <p className="text-[13px] font-extrabold text-slate-600">{copy.goodMorning.replace("{company}", companyName)}</p>
        <h2 className="mt-1 text-[17px] font-black leading-[1.02] text-slate-950 xl:text-[19px]">
          {hasJobs ? copy.briefTitle : copy.emptyBriefTitle}
        </h2>
        <div className="mt-2 space-y-0.5">
          {(hasJobs ? summary : [copy.emptyBriefSummary]).map((item) => {
            const Icon = item.icon || Sparkles;
            return (
              <div key={item.label || item} className="flex items-start gap-2 text-[9.5px] font-bold leading-3 text-slate-700">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded bg-blue-100 text-blue-700">
                  <Icon className="h-3 w-3" />
                </span>
                <span>{item.label || item}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex max-w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={hasJobs ? onReviewMatches : onPostJob} className="focus-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[11px] font-black text-white shadow-sm hover:bg-blue-700 sm:min-h-7 sm:shrink-0 sm:whitespace-nowrap">
            <Sparkles className="h-4 w-4" />
            {hasJobs ? copy.reviewAiMatches : copy.postFirstJob}
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={onPostJob} className="focus-ring inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-700 hover:border-blue-200 hover:bg-blue-50 sm:min-h-7 sm:shrink-0 sm:whitespace-nowrap">
            <Plus className="h-4 w-4" />
            {copy.postNewJob}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <AssistantVisual label={copy.assistantVisualLabel} />
    </OverviewCard>
  );
}

function HiringFunnel({ copy, stages }) {
  return (
    <OverviewCard className="h-full p-5 lg:col-span-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-950">{copy.hiringFunnel}</h2>
        <button type="button" className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-black text-slate-600 hover:bg-slate-50">
          {copy.thisMonth}
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-6 overflow-x-auto">
        <div className="grid min-w-[34rem] grid-cols-5 items-start gap-3 lg:min-w-0">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <button key={stage.label} type="button" onClick={stage.onClick} className="focus-ring group relative text-center" aria-label={`${stage.label}: ${stage.value}`}>
                {index < stages.length - 1 && <span className="absolute left-[61%] top-7 h-px w-[78%] bg-slate-200" aria-hidden="true" />}
                <span className={`relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-full border ${stage.tone}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <span className="mt-3 block text-[13px] font-black text-slate-700">{stage.label}</span>
                <span className="mt-2 block text-[30px] font-black leading-none text-slate-950">{stage.value}</span>
                <span className={`mt-2 block text-xs font-extrabold ${stage.trendTone}`}>{stage.trend}</span>
              </button>
            );
          })}
        </div>
      </div>
    </OverviewCard>
  );
}

function RecommendedWorkerRow({ copy, worker, onView, onMessage, onShortlist }) {
  return (
    <article className="grid min-h-[64px] gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30 xl:grid-cols-[minmax(12rem,1fr)_4.25rem_5.75rem_5.25rem_minmax(11.75rem,auto)] xl:items-center xl:gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 p-0.5 text-xs font-black text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)]`}>
          {worker.photoUrl ? <img src={worker.photoUrl} alt="" className="h-full w-full rounded-full object-cover" /> : <span className={`grid h-full w-full place-items-center rounded-full bg-gradient-to-br ${worker.gradient || "from-blue-600 to-emerald-500"}`}>{worker.avatar}</span>}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-black leading-4 text-slate-950">{worker.name}</h3>
          <p className="text-xs font-bold leading-4 text-slate-600">{worker.role}</p>
          <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-extrabold leading-4 text-slate-500">
            <span className="truncate">{worker.experience} • {worker.city}</span>
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.62rem] font-black leading-3 text-slate-600">{worker.languages}</span>
          </div>
        </div>
      </div>
      <div className="w-fit min-w-[4.25rem] rounded-lg bg-green-50 px-2 py-1.5 text-center text-green-700">
        <p className="text-sm font-black leading-none">{worker.match}</p>
        <p className="whitespace-nowrap text-[0.65rem] font-black uppercase">{copy.match}</p>
      </div>
      <div className="min-w-[5.75rem]">
        <p className="text-[13px] font-black text-slate-950">{worker.salary}</p>
        <p className="whitespace-nowrap text-[11px] font-bold text-slate-500">{copy.expectedSalary}</p>
      </div>
      <div className="min-w-[5.25rem]">
        <p className="text-[13px] font-black text-green-700">{worker.available}</p>
        <p className="whitespace-nowrap text-[11px] font-bold text-slate-500">{worker.availability}</p>
      </div>
      <div className="flex min-w-[11.75rem] flex-wrap gap-1 xl:flex-nowrap xl:justify-end">
        <button type="button" onClick={onView} className="focus-ring min-h-8 rounded-lg border border-slate-200 bg-white px-2 text-[0.68rem] font-black text-blue-700 hover:bg-blue-50">{copy.view}</button>
        <button type="button" onClick={onMessage} className="focus-ring inline-flex min-h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[0.68rem] font-black text-slate-700 hover:bg-blue-50"><MessageSquare className="h-3 w-3" />{copy.message}</button>
        <button type="button" onClick={onShortlist} className="focus-ring inline-flex min-h-8 items-center gap-1 rounded-lg bg-blue-600 px-2 text-[0.68rem] font-black text-white hover:bg-blue-700"><Star className="h-3 w-3" />{copy.shortlist}</button>
      </div>
    </article>
  );
}

function RecommendedWorkers({ copy, workers, onViewAll, onView, onMessage, onShortlist }) {
  return (
    <OverviewCard className="flex min-h-0 flex-col p-5 lg:col-span-8 xl:h-full">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-950">{copy.recommendedWorkers}</h2>
        <button type="button" onClick={onViewAll} className="focus-ring min-h-10 rounded-lg px-3 text-sm font-black text-blue-700 hover:bg-blue-50">{copy.viewAllMatches}</button>
      </div>
      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-visible pr-0 xl:overflow-y-auto xl:pr-1">
        {workers.length ? workers.map((worker) => (
          <RecommendedWorkerRow
            key={worker.id}
            copy={copy}
            worker={worker}
            onView={() => onView(worker.id)}
            onMessage={() => onMessage(worker.id)}
            onShortlist={() => onShortlist(worker.id)}
          />
        )) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-bold text-slate-600">{copy.noRecommendedWorkers}</div>
        )}
      </div>
    </OverviewCard>
  );
}

function AIHiringInsights({ copy, insights, onViewDetails }) {
  return (
    <OverviewCard className="flex h-full flex-col p-5 lg:col-span-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700">
          <Sparkles className="h-5 w-5" />
        </span>
        <h2 className="text-xl font-black text-slate-950">{copy.aiHiringInsights}</h2>
      </div>
      <div className="mt-4 flex-1 space-y-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <article key={insight.title} className="flex gap-4">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${insight.tone}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-950">{insight.title}</h3>
                <p className="mt-1 text-[13px] font-semibold leading-5 text-slate-600">{insight.body}</p>
              </div>
            </article>
          );
        })}
      </div>
      <button type="button" onClick={onViewDetails} className="focus-ring mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black text-blue-700 hover:bg-blue-50">
        {copy.viewDetailedInsights}
        <ChevronRight className="h-4 w-4" />
      </button>
    </OverviewCard>
  );
}

function QuickActions({ copy, actions }) {
  return (
    <OverviewCard className="h-full p-5 lg:col-span-4">
      <h2 className="text-lg font-black text-slate-950">{copy.quickActions}</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} type="button" onClick={action.onClick} className="focus-ring group flex min-h-[5.25rem] flex-col items-center justify-start gap-2 rounded-xl px-1.5 py-2 text-center hover:bg-slate-50">
              <span className={`grid h-12 w-12 place-items-center rounded-xl border ${action.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-black leading-3 text-slate-800">{action.label}</span>
            </button>
          );
        })}
      </div>
    </OverviewCard>
  );
}

function HiringTimeline({ copy, events, onViewAll }) {
  return (
    <OverviewCard className="h-full overflow-hidden p-5 lg:col-span-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">{copy.hiringTimeline}</h2>
        <button type="button" onClick={onViewAll} className="focus-ring min-h-10 rounded-lg px-3 text-sm font-black text-blue-700 hover:bg-blue-50">{copy.viewAllActivity}</button>
      </div>
      <div className="mt-4 space-y-3">
        {events.length ? events.map((event, index) => (
          <article key={`${event.time}-${event.title}`} className="grid grid-cols-[4rem_1rem_1fr] gap-3">
            <time className="text-xs font-black text-slate-500">{event.time}</time>
            <span className="relative mt-1 flex justify-center">
              {index < events.length - 1 && <span className="absolute left-1/2 top-3 h-[calc(100%+1rem)] w-px -translate-x-1/2 bg-slate-200" aria-hidden="true" />}
              <span className={`relative z-10 h-2.5 w-2.5 rounded-full ${event.dot}`} />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-950">{event.title}</h3>
              <p className="mt-1 text-xs font-semibold text-slate-500">{event.meta}</p>
            </div>
          </article>
        )) : (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600">{copy.emptyTimeline}</p>
        )}
      </div>
    </OverviewCard>
  );
}

function CompanySnapshot({ copy, company }) {
  return (
    <OverviewCard className="h-full overflow-hidden p-5 lg:col-span-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-950">{copy.companySnapshot}</h2>
        <button type="button" onClick={company.onEdit} className="focus-ring min-h-10 rounded-lg px-3 text-sm font-black text-blue-700 hover:bg-blue-50">{copy.editProfile}</button>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="grid h-16 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-green-50 text-blue-700">
          <Building2 className="h-8 w-8" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-slate-950">{company.name}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-600">{company.industry}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-600"><MapPin className="h-4 w-4" />{company.location}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm font-black text-slate-700">
          <span>{copy.profileCompletion}</span>
          <span>{company.completion}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full bg-blue-600" style={{ width: `${company.completion}%` }} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {company.metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-xl font-black text-slate-950">{metric.value}</p>
            <p className="mt-1 text-xs font-black text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>
    </OverviewCard>
  );
}

export function EmployerOverviewDashboard({
  copy,
  companyName,
  hasJobs,
  briefSummary,
  funnelStages,
  recommendedWorkers,
  insights,
  quickActions,
  timelineEvents,
  companySnapshot,
  onReviewMatches,
  onPostJob,
  onViewWorker,
  onMessageWorker,
  onShortlistWorker,
  onViewInsights,
  onViewActivity
}) {
  return (
    <div className="grid min-h-0 grid-cols-1 gap-5 xl:h-full xl:grid-cols-12 xl:grid-rows-[minmax(200px,0.3fr)_minmax(280px,0.44fr)_minmax(160px,0.26fr)]">
      <EmployerOverviewHero copy={copy} companyName={companyName} summary={briefSummary} hasJobs={hasJobs} onReviewMatches={onReviewMatches} onPostJob={onPostJob} />
      <HiringFunnel copy={copy} stages={funnelStages} />
      <RecommendedWorkers copy={copy} workers={recommendedWorkers} onViewAll={onReviewMatches} onView={onViewWorker} onMessage={onMessageWorker} onShortlist={onShortlistWorker} />
      <AIHiringInsights copy={copy} insights={insights} onViewDetails={onViewInsights} />
      <QuickActions copy={copy} actions={quickActions} />
      <HiringTimeline copy={copy} events={timelineEvents} onViewAll={onViewActivity} />
      <CompanySnapshot copy={copy} company={companySnapshot} />
    </div>
  );
}

export const employerOverviewIcons = {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Users
};
