import { hasNgoPermission, NGO_PERMISSIONS } from "./roles";

export const NGO_ROLE_LABELS = {
  organization_admin: "Organization Admin",
  programme_manager: "Programme Manager",
  placement_coordinator: "Placement Coordinator",
  trainer: "Trainer",
  viewer: "Viewer"
};

export const NGO_PERMISSION_LABELS = {
  [NGO_PERMISSIONS.createProgramme]: "Create programmes",
  [NGO_PERMISSIONS.manageProgramme]: "Edit programmes",
  [NGO_PERMISSIONS.enrolWorkers]: "Enrol workers",
  [NGO_PERMISSIONS.manageSessions]: "Manage sessions",
  [NGO_PERMISSIONS.markAttendance]: "Mark attendance",
  [NGO_PERMISSIONS.recordAssessments]: "Record assessments",
  [NGO_PERMISSIONS.completeTraining]: "Complete training",
  [NGO_PERMISSIONS.issueCertificates]: "Issue certificates",
  [NGO_PERMISSIONS.verifyCertificates]: "Verify certificates",
  [NGO_PERMISSIONS.searchJobs]: "Search jobs",
  [NGO_PERMISSIONS.recommendWorkers]: "Recommend workers",
  [NGO_PERMISSIONS.managePlacementPipeline]: "Manage placement pipeline",
  [NGO_PERMISSIONS.manageEmployerConnections]: "Manage employers",
  [NGO_PERMISSIONS.scheduleInterviews]: "Schedule interviews",
  [NGO_PERMISSIONS.recordPlacementOutcomes]: "Record outcomes",
  [NGO_PERMISSIONS.viewReports]: "View reports",
  [NGO_PERMISSIONS.manageTeam]: "Manage team",
  [NGO_PERMISSIONS.viewAuditLog]: "View audit log",
  [NGO_PERMISSIONS.exportData]: "Export data",
  [NGO_PERMISSIONS.editOrganization]: "Edit organization"
};

export function canNgo(member, permission) {
  return hasNgoPermission(member, permission);
}

export function getNgoPermissionMatrix(member) {
  return Object.entries(NGO_PERMISSION_LABELS).map(([permission, label]) => ({
    permission,
    label,
    allowed: canNgo(member, permission)
  }));
}
