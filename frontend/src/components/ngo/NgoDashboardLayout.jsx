import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  MessageSquarePlus,
  Settings,
  ShieldCheck,
  UserPlus,
  Users
} from "lucide-react";
import { useState } from "react";
import { translations } from "../../i18n/translations";
import { NgoEmptyState } from "./NgoEmptyState";
import { NgoHeader } from "./NgoHeader";
import { NgoOrganizationProfile } from "./NgoOrganizationProfile";
import { NgoOverview } from "./NgoOverview";
import { getNgoSectionFromPath, NgoSidebar } from "./NgoSidebar";
import {
  NgoAssistedOnboarding,
  NgoInviteWorker,
  NgoWorkerActivity,
  NgoWorkerDetail,
  NgoWorkerProfileAssistance,
  NgoWorkers
} from "./NgoWorkers";
import {
  NgoCertificateDetail,
  NgoCertificates,
  NgoEnrolWorkers,
  NgoTrainingAssessments,
  NgoTrainingAttendance,
  NgoTrainingProgrammeDetail,
  NgoTrainingProgrammeForm,
  NgoTrainingProgrammes
} from "./NgoTrainingProgrammes";
import {
  NgoEmployerDetail,
  NgoEmployers,
  NgoInterviews,
  NgoJobDetail,
  NgoJobOpportunityForm,
  NgoJobOpportunities,
  NgoPlacementDetail,
  NgoPlacementFollowUps,
  NgoPlacementPipeline,
  NgoPlacementReports,
  NgoRecommendWorkers
} from "./NgoPlacementWorkspace";
import {
  NgoAdvancedReports,
  NgoAuditLog,
  NgoProductionSettings,
  NgoTeamManagement
} from "./NgoProductionWorkspace";

const placeholderContent = {
  workers: [Users, "Worker Management", "Phase 3 will add linked-worker search, consent status, profile assistance, placement notes, and worker-safe removal of organization access."],
  "add-worker": [UserPlus, "Add or Invite Worker", "Phase 3 will add assisted onboarding, existing-worker invitation by phone/Worker ID/QR, consent requests, and voice onboarding handoff."],
  training: [GraduationCap, "Training & Certifications", "Create programmes, enrol linked workers, track attendance, record assessments and verify certificates."],
  placements: [ShieldCheck, "Placement Pipeline", "Track recommendations, interviews, selection, joining and retention follow-ups."],
  employers: [Building2, "Employer Directory", "Manage verified employer relationships, active openings and placement outcomes."],
  jobs: [BriefcaseBusiness, "Job Opportunities", "Discover relevant jobs and recommend eligible workers with consent."],
  reports: [BarChart3, "Reports & Analytics", "Review placement, training, joining and retention outcomes."],
  team: [Users, "Team Management", "Invite members, manage roles, disable access and review permissions."],
  audit: [ShieldCheck, "Audit Log", "Review immutable organization, consent, training and placement activity."],
  settings: [Settings, "NGO Settings", "Review production readiness, security, permissions and export controls."]
};

function titleForSection(section, copy) {
  if (section === "overview") return copy.sections.overview;
  if (section === "workers") return copy.sections.workers;
  if (section === "add-worker") return copy.sections.addWorker;
  if (section === "profile") return copy.sections.profile;
  const content = placeholderContent[section] || placeholderContent.workers;
  return [copy.nav[section] || content[1], copy.sections.defaultSubtitle];
}

function getWorkerRouteInfo(routePath) {
  const parts = routePath.split("/").filter(Boolean);
  if (routePath === "/ngo/workers") return { screen: "list" };
  if (routePath === "/ngo/workers/invite") return { screen: "invite" };
  if (routePath === "/ngo/workers/add" || routePath === "/ngo/add-worker") return { screen: "add" };
  if (routePath === "/ngo/requests") return { screen: "requests" };
  if (parts[0] === "ngo" && parts[1] === "workers" && parts[2]) {
    const workerId = decodeURIComponent(parts[2]);
    if (parts[3] === "edit-assistance") return { screen: "assistance", workerId };
    if (parts[3] === "activity") return { screen: "activity", workerId };
    return { screen: "detail", workerId };
  }
  return null;
}

function getTrainingRouteInfo(routePath) {
  const parts = routePath.split("/").filter(Boolean);
  if (routePath === "/ngo/training") return { screen: "training-list" };
  if (routePath === "/ngo/training/new") return { screen: "training-new" };
  if (routePath === "/ngo/certificates") return { screen: "certificates" };
  if (parts[0] === "ngo" && parts[1] === "certificates" && parts[2]) return { screen: "certificate-detail", certificateId: decodeURIComponent(parts[2]) };
  if (parts[0] === "ngo" && parts[1] === "training" && parts[2]) {
    const programmeId = decodeURIComponent(parts[2]);
    const action = parts[3] || "detail";
    if (action === "edit") return { screen: "training-edit", programmeId };
    if (action === "enrol") return { screen: "training-enrol", programmeId };
    if (action === "attendance") return { screen: "training-attendance", programmeId };
    if (action === "assessments") return { screen: "training-assessments", programmeId };
    if (action === "certificates") return { screen: "training-certificates", programmeId };
    if (action === "reports") return { screen: "training-detail", programmeId };
    return { screen: "training-detail", programmeId };
  }
  return null;
}

function getPlacementRouteInfo(routePath) {
  const parts = routePath.split("/").filter(Boolean);
  if (routePath === "/ngo/jobs") return { screen: "jobs" };
  if (routePath === "/ngo/jobs/new") return { screen: "job-new" };
  if (parts[0] === "ngo" && parts[1] === "jobs" && parts[2]) {
    const jobId = decodeURIComponent(parts[2]);
    if (parts[3] === "recommend") return { screen: "recommend-workers", jobId };
    return { screen: "job-detail", jobId };
  }
  if (routePath === "/ngo/employers") return { screen: "employers" };
  if (parts[0] === "ngo" && parts[1] === "employers" && parts[2]) return { screen: "employer-detail", employerId: decodeURIComponent(parts[2]) };
  if (routePath === "/ngo/pipeline" || routePath === "/ngo/placements" || routePath === "/ngo/recommendations") return { screen: "pipeline" };
  if (parts[0] === "ngo" && parts[1] === "pipeline" && parts[2]) return { screen: "placement-detail", placementId: decodeURIComponent(parts[2]) };
  if (parts[0] === "ngo" && parts[1] === "placements" && parts[2]) return { screen: "placement-detail", placementId: decodeURIComponent(parts[2]) };
  if (routePath === "/ngo/interviews") return { screen: "interviews" };
  if (routePath === "/ngo/follow-ups") return { screen: "follow-ups" };
  if (routePath === "/ngo/reports/placements") return { screen: "placement-reports" };
  return null;
}

function getProductionRouteInfo(routePath) {
  if (routePath === "/ngo/reports") return { screen: "advanced-reports" };
  if (routePath === "/ngo/team") return { screen: "team" };
  if (routePath === "/ngo/audit") return { screen: "audit" };
  if (routePath === "/ngo/settings") return { screen: "production-settings" };
  return null;
}

export function NgoDashboardLayout({
  account,
  organization,
  membership,
  stats,
  activityLogs,
  routePath,
  logoMark,
  logoAlt,
  lang,
  languageConfig,
  onLanguageChange,
  navigateTo,
  onSignOut,
  onUpdateOrganization,
  setStatusMessage,
  jobRoles,
  isDemoMode = false,
  onExitDemo
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const ngoCopy = translations[lang]?.ngo || translations.en.ngo;
  const activeSection = getNgoSectionFromPath(routePath);
  const [title, subtitle] = titleForSection(activeSection, ngoCopy);
  const workerRoute = getWorkerRouteInfo(routePath);
  const trainingRoute = getTrainingRouteInfo(routePath);
  const placementRoute = getPlacementRouteInfo(routePath);
  const productionRoute = getProductionRouteInfo(routePath);
  const reportsRoute = productionRoute?.screen === "advanced-reports";
  const placeholder = ["overview", "profile"].includes(activeSection) || workerRoute || trainingRoute || placementRoute || productionRoute ? null : placeholderContent[activeSection];

  return (
    <div className="h-dvh overflow-hidden bg-[#f8fafc] text-slate-950">
      <div className="grid h-dvh lg:grid-cols-[auto_1fr]">
        <NgoSidebar
          logoMark={logoMark}
          logoAlt={logoAlt}
          organization={organization}
          activeSection={activeSection}
          navigateTo={navigateTo}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((value) => !value)}
          isDemoMode={isDemoMode}
          lang={lang}
        />
        <div className="min-w-0 overflow-hidden">
          <NgoHeader
            title={title}
            subtitle={subtitle}
            organization={organization}
            account={account}
            lang={lang}
            languageConfig={languageConfig}
            onLanguageChange={onLanguageChange}
            onSignOut={onSignOut}
            isDemoMode={isDemoMode}
            onExitDemo={onExitDemo}
          />
          <nav className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2 lg:hidden" aria-label={ngoCopy.sidebar.navigation}>
            {[
              [ngoCopy.nav.overview, "/ngo"],
              [ngoCopy.nav.workers, "/ngo/workers"],
              [ngoCopy.nav.addWorker, "/ngo/workers/add"],
              [ngoCopy.nav.profile, "/ngo/profile"]
            ].map(([label, href]) => (
              <button key={href} type="button" onClick={() => navigateTo(href)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-black ${routePath === href ? "bg-blue-50 text-blue-700" : "text-slate-600"}`}>
                {label}
              </button>
            ))}
          </nav>
          <main className={`h-[calc(100dvh-62px)] min-h-0 ${reportsRoute ? "overflow-hidden p-0" : workerRoute || trainingRoute || placementRoute || productionRoute ? "overflow-y-auto px-4 pb-4 pt-4 lg:px-5 lg:pb-3 lg:pt-3.5 xl:overflow-hidden" : "p-4 lg:p-5"} ${!reportsRoute && !workerRoute && !trainingRoute && !placementRoute && !productionRoute && isDemoMode && activeSection === "overview" ? "overflow-hidden" : !reportsRoute && !workerRoute && !trainingRoute && !placementRoute && !productionRoute ? "overflow-y-auto" : ""}`}>
            {activeSection === "overview" && (
              <NgoOverview
                organization={organization}
                stats={stats}
                activityLogs={activityLogs}
                navigateTo={navigateTo}
                isDemoMode={isDemoMode}
              />
            )}
            {activeSection === "profile" && (
              <NgoOrganizationProfile
                organization={organization}
                jobRoles={jobRoles}
                onSave={onUpdateOrganization}
                setStatusMessage={setStatusMessage}
              />
            )}
            {workerRoute?.screen === "list" && (
              <NgoWorkers
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {workerRoute?.screen === "invite" && (
              <NgoInviteWorker
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {workerRoute?.screen === "add" && (
              <NgoAssistedOnboarding
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                jobRoles={jobRoles}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {workerRoute?.screen === "detail" && (
              <NgoWorkerDetail
                organization={organization}
                account={account}
                workerProfileId={workerRoute.workerId}
                navigateTo={navigateTo}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {trainingRoute?.screen === "training-list" && (
              <NgoTrainingProgrammes
                organization={organization}
                account={account}
                membership={membership}
                navigateTo={navigateTo}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {["training-new", "training-edit"].includes(trainingRoute?.screen) && (
              <NgoTrainingProgrammeForm
                organization={organization}
                account={account}
                membership={membership}
                navigateTo={navigateTo}
                routeInfo={trainingRoute}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {trainingRoute?.screen === "training-detail" && (
              <NgoTrainingProgrammeDetail
                organization={organization}
                account={account}
                membership={membership}
                navigateTo={navigateTo}
                routeInfo={trainingRoute}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {trainingRoute?.screen === "training-enrol" && (
              <NgoEnrolWorkers
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                routeInfo={trainingRoute}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {trainingRoute?.screen === "training-attendance" && (
              <NgoTrainingAttendance
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                routeInfo={trainingRoute}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {trainingRoute?.screen === "training-assessments" && (
              <NgoTrainingAssessments
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                routeInfo={trainingRoute}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {["training-certificates", "certificates"].includes(trainingRoute?.screen) && (
              <NgoCertificates
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                routeInfo={trainingRoute}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {trainingRoute?.screen === "certificate-detail" && (
              <NgoCertificateDetail
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                routeInfo={trainingRoute}
                setStatusMessage={setStatusMessage}
              />
            )}
            {placementRoute?.screen === "jobs" && (
              <NgoJobOpportunities
                organization={organization}
                membership={membership}
                navigateTo={navigateTo}
                isDemoMode={isDemoMode}
              />
            )}
            {placementRoute?.screen === "job-new" && (
              <NgoJobOpportunityForm
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                setStatusMessage={setStatusMessage}
              />
            )}
            {placementRoute?.screen === "job-detail" && (
              <NgoJobDetail
                organization={organization}
                routeInfo={placementRoute}
                navigateTo={navigateTo}
                isDemoMode={isDemoMode}
              />
            )}
            {placementRoute?.screen === "recommend-workers" && (
              <NgoRecommendWorkers
                organization={organization}
                account={account}
                routeInfo={placementRoute}
                navigateTo={navigateTo}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {placementRoute?.screen === "pipeline" && (
              <NgoPlacementPipeline
                organization={organization}
                account={account}
                navigateTo={navigateTo}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {placementRoute?.screen === "placement-detail" && (
              <NgoPlacementDetail
                organization={organization}
                routeInfo={placementRoute}
                navigateTo={navigateTo}
              />
            )}
            {placementRoute?.screen === "employers" && (
              <NgoEmployers
                organization={organization}
                navigateTo={navigateTo}
                isDemoMode={isDemoMode}
              />
            )}
            {placementRoute?.screen === "employer-detail" && (
              <NgoEmployerDetail
                organization={organization}
                routeInfo={placementRoute}
                navigateTo={navigateTo}
                isDemoMode={isDemoMode}
              />
            )}
            {placementRoute?.screen === "interviews" && (
              <NgoInterviews
                organization={organization}
                account={account}
                setStatusMessage={setStatusMessage}
              />
            )}
            {placementRoute?.screen === "follow-ups" && (
              <NgoPlacementFollowUps
                organization={organization}
              />
            )}
            {placementRoute?.screen === "placement-reports" && (
              <NgoPlacementReports
                organization={organization}
              />
            )}
            {productionRoute?.screen === "advanced-reports" && (
              <NgoAdvancedReports
                organization={organization}
                membership={membership}
                isDemoMode={isDemoMode}
              />
            )}
            {productionRoute?.screen === "team" && (
              <NgoTeamManagement
                organization={organization}
                account={account}
                membership={membership}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {productionRoute?.screen === "audit" && (
              <NgoAuditLog
                organization={organization}
                membership={membership}
                isDemoMode={isDemoMode}
              />
            )}
            {productionRoute?.screen === "production-settings" && (
              <NgoProductionSettings
                membership={membership}
              />
            )}
            {workerRoute?.screen === "assistance" && (
              <NgoWorkerProfileAssistance
                organization={organization}
                account={account}
                workerProfileId={workerRoute.workerId}
                navigateTo={navigateTo}
                setStatusMessage={setStatusMessage}
                isDemoMode={isDemoMode}
              />
            )}
            {workerRoute?.screen === "activity" && (
              <NgoWorkerActivity
                organization={organization}
                workerProfileId={workerRoute.workerId}
                navigateTo={navigateTo}
                isDemoMode={isDemoMode}
              />
            )}
            {workerRoute?.screen === "requests" && (
              <NgoEmptyState
                icon={MessageSquarePlus}
                title="Worker Requests"
                description="Worker-facing consent requests are available from the worker dashboard at /dashboard/organizations."
                onAction={() => navigateTo("/ngo/workers")}
              />
            )}
            {placeholder && (
              <NgoEmptyState
                icon={placeholder[0]}
                title={placeholder[1]}
                description={placeholder[2]}
                onAction={() => navigateTo("/ngo")}
              />
            )}
            {!placeholder && !workerRoute && !trainingRoute && !placementRoute && !productionRoute && !["overview", "profile"].includes(activeSection) && (
              <NgoEmptyState
                icon={MessageSquarePlus}
                title="NGO Module"
                description="This NGO workspace route is reserved for a later phase."
                onAction={() => navigateTo("/ngo")}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
