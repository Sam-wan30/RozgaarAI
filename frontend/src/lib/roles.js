export const ROLES = {
  WORKER: "worker",
  EMPLOYER: "employer",
  NGO: "ngo",
  ADMIN: "admin"
};

export const ROLE_DISPLAY_LABELS = {
  [ROLES.WORKER]: "Worker",
  [ROLES.EMPLOYER]: "Employer",
  [ROLES.NGO]: "NGO / Foundation",
  [ROLES.ADMIN]: "Admin"
};

export const ROLE_DEFAULT_ROUTES = {
  [ROLES.WORKER]: "/dashboard",
  [ROLES.EMPLOYER]: "/employer",
  [ROLES.NGO]: "/ngo",
  [ROLES.ADMIN]: "/admin"
};

const NGO_ROLE_ALIASES = new Set([
  "ngo",
  "ngo admin",
  "ngo partner",
  "ngo foundation",
  "ngo admin",
  "ngo / admin",
  "ngo / partner",
  "ngo / foundation",
  "foundation",
  "skill development",
  "skill development centre",
  "skill-development centre",
  "skill development center",
  "skill-development center",
  "training partner",
  "vocational institute",
  "community organization",
  "csr initiative"
]);

export function normalizeRole(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9/ -]+/g, " ")
    .replace(/\s+/g, " ");

  if (!normalized) return ROLES.WORKER;
  if (normalized === ROLES.WORKER || normalized === "worker") return ROLES.WORKER;
  if (normalized === ROLES.EMPLOYER || normalized === "employer" || normalized === "hiring") return ROLES.EMPLOYER;
  if (NGO_ROLE_ALIASES.has(normalized)) return ROLES.NGO;
  if (normalized === ROLES.ADMIN || normalized === "administrator") return ROLES.ADMIN;
  return ROLES.WORKER;
}

export function isValidRole(value) {
  return Object.values(ROLES).includes(normalizeRole(value));
}

export function getRoleDisplayLabel(value) {
  return ROLE_DISPLAY_LABELS[normalizeRole(value)] || ROLE_DISPLAY_LABELS[ROLES.WORKER];
}

export function getDefaultRouteForRole(value) {
  return ROLE_DEFAULT_ROUTES[normalizeRole(value)] || ROLE_DEFAULT_ROUTES[ROLES.WORKER];
}

export function getWorkspaceRoute(value) {
  return getDefaultRouteForRole(value);
}

export function isRouteAllowedForRole(pathname, role) {
  const path = pathname || "";
  const normalizedRole = normalizeRole(role);
  if (!path || path === "/" || path === "/login" || path === "/signup") return true;
  if (path === "/create-profile" || path === "/dashboard" || path.startsWith("/dashboard/") || path.startsWith("/worker/")) return normalizedRole === ROLES.WORKER;
  if (path === "/employer" || path.startsWith("/employer/")) return normalizedRole === ROLES.EMPLOYER;
  if (path === "/ngo/onboarding" || path === "/ngo" || path.startsWith("/ngo/")) return normalizedRole === ROLES.NGO;
  if (path.startsWith("/admin")) return normalizedRole === ROLES.ADMIN;
  return true;
}

export function resolvePostAuthRoute({ account, requestedRoute = "", workerOnboardingComplete = false, ngoOnboardingComplete = false } = {}) {
  const role = normalizeRole(account?.role);
  if (requestedRoute && isRouteAllowedForRole(requestedRoute, role)) return requestedRoute;
  if (role === ROLES.NGO && !ngoOnboardingComplete) return "/ngo/onboarding";
  return getWorkspaceRoute(role);
}

export const NGO_PERMISSIONS = {
  createProgramme: "create_programme",
  manageProgramme: "manage_programme",
  enrolWorkers: "enrol_workers",
  manageSessions: "manage_sessions",
  markAttendance: "mark_attendance",
  recordAssessments: "record_assessments",
  completeTraining: "complete_training",
  issueCertificates: "issue_certificates",
  verifyCertificates: "verify_certificates",
  viewReports: "view_reports",
  searchJobs: "search_jobs",
  recommendWorkers: "recommend_workers",
  managePlacementPipeline: "manage_placement_pipeline",
  manageEmployerConnections: "manage_employer_connections",
  scheduleInterviews: "schedule_interviews",
  recordPlacementOutcomes: "record_placement_outcomes",
  managePlacementSettings: "manage_placement_settings",
  manageTeam: "manage_team",
  viewAuditLog: "view_audit_log",
  exportData: "export_data",
  editOrganization: "edit_organization"
};

const ngoRolePermissions = {
  organization_admin: Object.values(NGO_PERMISSIONS),
  programme_manager: [
    NGO_PERMISSIONS.createProgramme,
    NGO_PERMISSIONS.manageProgramme,
    NGO_PERMISSIONS.enrolWorkers,
    NGO_PERMISSIONS.manageSessions,
    NGO_PERMISSIONS.markAttendance,
    NGO_PERMISSIONS.recordAssessments,
    NGO_PERMISSIONS.completeTraining,
    NGO_PERMISSIONS.issueCertificates,
    NGO_PERMISSIONS.viewReports
  ],
  trainer: [
    NGO_PERMISSIONS.manageSessions,
    NGO_PERMISSIONS.markAttendance,
    NGO_PERMISSIONS.recordAssessments
  ],
  placement_coordinator: [
    NGO_PERMISSIONS.searchJobs,
    NGO_PERMISSIONS.recommendWorkers,
    NGO_PERMISSIONS.managePlacementPipeline,
    NGO_PERMISSIONS.manageEmployerConnections,
    NGO_PERMISSIONS.scheduleInterviews,
    NGO_PERMISSIONS.recordPlacementOutcomes,
    NGO_PERMISSIONS.viewReports
  ],
  viewer: [
    NGO_PERMISSIONS.viewReports
  ]
};

export function hasNgoPermission(member, permission) {
  if (!member || member.status !== "active") return false;
  return (ngoRolePermissions[member.role] || ngoRolePermissions.viewer).includes(permission);
}

export function normalizeAccountRole(account) {
  if (!account) return null;
  const role = normalizeRole(account.role || account.accountRole || account.displayRole);
  return {
    ...account,
    role,
    canonicalRole: role,
    roleLabel: account.roleLabel || getRoleDisplayLabel(role),
    firebaseUid: account.firebaseUid || account.uid || account.id || "",
    authProvider: account.authProvider || account.provider || "local-fallback"
  };
}
