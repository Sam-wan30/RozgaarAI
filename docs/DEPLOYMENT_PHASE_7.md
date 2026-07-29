# RozgaarAI Phase 7 Deployment Runbook

Last updated: 2026-07-28

## Release Objective

Ship RozgaarAI as a pilot-ready platform with clean real workspaces, isolated demo modes, production diagnostics, and a documented path to deploy, verify, monitor, and roll back.

## Environments

| Environment | Frontend | Backend | Purpose |
| --- | --- | --- | --- |
| Local | Vite dev server | FastAPI/Uvicorn | Development and QA |
| Staging | Vercel preview or equivalent | Render/Railway/Fly preview | Pilot rehearsals and stakeholder review |
| Production | Vercel production | Render/Railway/Fly production | Public demo, pilot onboarding, and employer/NGO trials |

## Required Environment Variables

Frontend:

```bash
VITE_APP_VERSION=0.1.0
VITE_BUILD_TIMESTAMP=2026-07-28T00:00:00Z
VITE_API_URL=https://api.example.com
VITE_PUBLIC_APP_URL=https://app.example.com
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Backend:

```bash
ALLOWED_ORIGINS=https://app.example.com
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
DATABASE_URL=
```

Do not commit real keys. Use the deployment provider secret manager.

## Build Commands

Frontend:

```bash
cd frontend
npm install
npm run lint
npm run build
```

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Health Checks

Backend:

```bash
curl https://api.example.com/health
```

Expected response includes `status: ok`, version, timestamp, and boolean configuration checks.

Frontend:

Open `/admin/diagnostics` with an admin account. Confirm:

- Frontend runtime passes.
- Local storage passes.
- Backend API is configured.
- Backend health endpoint passes.
- Firebase and Supabase are either configured or intentionally warning for demo-only deployments.

## Data Safety

- Demo mode must stay in memory or local session state.
- Demo workers must reuse existing demo worker objects.
- Real workspaces must show zero or empty states until real data is added.
- No demo seed should be written into production tables.
- Any pilot import should be reviewed by an NGO operator before activation.

## Rollback

1. Keep the last known-good frontend deployment active in Vercel.
2. Keep the last known-good backend image/release active in the backend host.
3. If production breaks, roll back frontend first, then backend if `/health` still fails.
4. Confirm `/admin/diagnostics` and core demo flows after rollback.

## Backup Strategy

- Supabase/PostgreSQL: daily automated backups and point-in-time recovery for pilot environments.
- File exports: weekly CSV export of worker identities, consent state, training enrolments, placement records, and audit logs.
- Demo data: source-controlled only; do not back up demo-generated session state.
- Incident recovery: preserve audit logs before any destructive repair.

## Final Release Gate

Release only when:

- `npm run build` passes.
- Targeted lint for touched files passes.
- `/health` returns `ok`.
- `/admin/diagnostics` has no failures.
- Worker, Employer, NGO, Employer Demo, and NGO Demo smoke tests pass.
- Real non-demo views do not display fake stats or fake workers.
