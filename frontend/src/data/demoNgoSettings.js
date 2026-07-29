export const demoChecklistSummary = {
  completed: 5,
  actionNeeded: 1,
  pending: 0
};

export const demoLastReview = {
  reviewedAt: "15 May 2026, 10:30 AM",
  reviewedBy: "Ritu Sharma"
};

export const demoProductionChecklist = [
  {
    id: "error-boundary",
    title: "Error boundary",
    description: "Friendly app-level fallback is installed.",
    status: "Completed",
    checked: "Application shell, route boundaries and app-level fallback.",
    result: "Fallback is installed and ready.",
    why: "Unexpected UI errors should not break worker or NGO workflows.",
    nextAction: "Keep fallback copy reviewed after major route changes.",
    lastChecked: "15 May 2026, 10:30 AM",
    owner: "System",
    related: "frontend/src/AppErrorBoundary.jsx"
  },
  {
    id: "demo-isolation",
    title: "Demo isolation",
    description: "Demo data is rendered as overlays or demo-scoped records.",
    status: "Completed",
    checked: "Demo route intent, demo workspace state and local-only records.",
    result: "Demo data remains isolated from real NGO workspaces.",
    why: "Demo exploration must never create real consent, worker or placement records.",
    nextAction: "Retest when new production modules are added.",
    lastChecked: "15 May 2026, 10:30 AM",
    owner: "Ritu Sharma",
    related: "frontend/src/App.jsx"
  },
  {
    id: "permission-matrix",
    title: "Permission matrix",
    description: "Centralized NGO permission labels and checks are available.",
    status: "Completed",
    checked: "Permission constants, role labels and access helper coverage.",
    result: "Role checks resolve from a shared matrix.",
    why: "Central permissions reduce drift across training, placement and team modules.",
    nextAction: "Review access mappings before onboarding new NGO roles.",
    lastChecked: "15 May 2026, 10:30 AM",
    owner: "System",
    related: "frontend/src/lib/roles.js"
  },
  {
    id: "audit-log",
    title: "Audit log",
    description: "Organization, training and placement logs are visible from one place.",
    status: "Completed",
    checked: "Audit route, demo audit data, event details and CSV export.",
    result: "Audit log is visible to authorized users.",
    why: "Consent-first workflows need traceable history.",
    nextAction: "Connect production audit stream before pilot launch.",
    lastChecked: "15 May 2026, 10:30 AM",
    owner: "Ritu Sharma",
    related: "frontend/src/components/ngo/NgoProductionWorkspace.jsx"
  },
  {
    id: "csv-exports",
    title: "CSV exports",
    description: "Exports are permission-gated.",
    status: "Completed",
    checked: "Export controls in reports and audit modules.",
    result: "CSV actions require export permission checks.",
    why: "Data exports can expose worker information and must be permission-aware.",
    nextAction: "Add server-side export logging for production.",
    lastChecked: "15 May 2026, 10:30 AM",
    owner: "System",
    related: "frontend/src/lib/permissions.js"
  },
  {
    id: "supabase-rls",
    title: "Supabase RLS",
    description: "Migration files document required RLS policy intent; deploy policies before production pilots.",
    status: "Action needed",
    checked: "Supabase migration notes and database access assumptions.",
    result: "Policies documented but not deployed.",
    why: "Real NGO pilots require database-enforced tenant and consent boundaries.",
    nextAction: "Deploy and validate RLS policies before real NGO pilots.",
    lastChecked: "15 May 2026, 10:30 AM",
    owner: "Platform Admin",
    related: "supabase/migrations",
    riskLevel: "Medium",
    relatedAreas: "Worker profiles, training records, certificates and employer access"
  }
];

export const demoPermissionMatrix = [
  ["create_programmes", "Create programmes", "NGO Admin, Programme Manager", "Create new training programmes for linked workers."],
  ["edit_programmes", "Edit programmes", "NGO Admin, Programme Manager", "Update programme details, schedules and capacity."],
  ["enrol_workers", "Enrol workers", "NGO Admin, Programme Manager, Trainer", "Enrol consented workers into training programmes."],
  ["manage_sessions", "Manage sessions", "NGO Admin, Programme Manager, Trainer", "Create and adjust training session schedules."],
  ["mark_attendance", "Mark attendance", "NGO Admin, Trainer", "Record worker attendance for programme sessions."],
  ["record_assessments", "Record assessments", "NGO Admin, Trainer", "Save training and skill assessment outcomes."],
  ["complete_training", "Complete training", "NGO Admin, Programme Manager, Trainer", "Mark workers as completing programme requirements."],
  ["issue_certificates", "Issue certificates", "NGO Admin, Programme Manager", "Issue verified certificates after completion."],
  ["verify_certificates", "Verify certificates", "NGO Admin, Programme Manager", "Verify and review certificate status."],
  ["search_jobs", "Search jobs", "NGO Admin, Placement Coordinator", "Search employer opportunities for eligible workers."],
  ["recommend_workers", "Recommend workers", "NGO Admin, Placement Coordinator", "Recommend workers to jobs after consent checks."],
  ["view_placement_pipeline", "View placement pipeline", "NGO Admin, Programme Manager, Placement Coordinator, Viewer", "Review placements and follow-up status."]
].map(([key, label, roles, description]) => ({
  key,
  label,
  status: "Enabled",
  roles,
  description,
  securityImpact: "Protected by role-based access and consent-aware workspace checks.",
  lastChanged: "15 May 2026, 10:30 AM",
  changedBy: "Ritu Sharma"
}));

export const demoPermissionSummary = {
  enabled: 24,
  total: 24,
  description: "All critical actions are protected."
};
