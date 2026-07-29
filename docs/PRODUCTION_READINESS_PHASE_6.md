# RozgaarAI Phase 6 Production Readiness

## Architecture

RozgaarAI is a Vite React application with custom route handling in `frontend/src/App.jsx`. The product contains worker, employer and NGO/Foundation workspaces. Shared persistence lives in `frontend/src/lib/database.js`, which supports Supabase when configured and localStorage fallback for local development.

Core workspaces:

- Worker: identity, jobs, training, certificates and opportunity visibility.
- Employer: hiring workspace, jobs, applicants, pipeline, messages and analytics.
- NGO/Foundation: organization onboarding, worker consent, assisted onboarding, training, certificates, job opportunities, recommendations, placement pipeline, interviews, follow-ups, reports, team and audit.

## Authentication And Roles

Canonical roles are centralized in `frontend/src/lib/roles.js`:

- `worker`
- `employer`
- `ngo`
- `admin`

NGO permissions are centralized through `NGO_PERMISSIONS`, `hasNgoPermission`, and `frontend/src/lib/permissions.js`. UI checks must be paired with backend/RLS enforcement before production deployment.

## Database

Migration files live in `docs/database/`.

Important NGO tables:

- `organizations`
- `organization_members`
- `worker_organization_associations`
- `organization_activity_logs`
- `worker_organization_consent_events`
- `training_programmes`
- `programme_enrollments`
- `training_sessions`
- `attendance_records`
- `skill_assessments`
- `worker_certificates`
- `employer_job_opportunities`
- `worker_job_recommendations`
- `placement_records`
- `placement_status_history`
- `interview_records`
- `placement_follow_ups`
- `employer_organization_connections`
- `placement_activity_logs`
- `offer_records`

## Security Notes

Production deployment must enforce Supabase RLS for:

- Organization-scoped NGO data access.
- Employer access only to their own jobs and received recommendations.
- Worker access only to their own recommendations, offers and placements.
- No employer visibility into NGO-only notes, attendance details, assessment feedback or unshared private profile fields.
- Audit and status history append-only semantics.

## Accessibility

Phase 6 adds clearer labels, visible focus-compatible controls, honest empty states and permission-gated actions. Remaining production QA should include keyboard-only navigation and screen reader testing across worker, employer and NGO flows.

## Performance

Build currently succeeds. Vite reports large chunks because the app is still routed through a large `App.jsx` bundle and media assets. Future production hardening should introduce route-level lazy loading and image optimization where possible without changing routing semantics.

## Deployment Checklist

1. Configure `VITE_SUPABASE_URL`.
2. Configure `VITE_SUPABASE_ANON_KEY`.
3. Apply all migrations under `docs/database/`.
4. Add concrete Supabase RLS policies for the policy intent documented in migrations.
5. Run `npm run build`.
6. Run lint and targeted regression checks.
7. Verify demo mode isolation.
8. Verify role redirects and logout.
9. Verify no fake data appears in non-demo workspaces.
10. Verify worker consent before employer sharing.

## Known Limitations

- Supabase RLS policy SQL is documented as intent and still needs binding to the final production auth/account mapping.
- Full end-to-end browser tests are not yet added.
- Some existing historical lint errors remain outside the Phase 6 touched files.
- Bundle code splitting remains a future optimization.
