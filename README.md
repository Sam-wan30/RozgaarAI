# RozgaarAI

**Tagline:** Digital Career Identity for India's Informal Workforce.

RozgaarAI is a voice-first AI employment assistant for informal workers in India. It helps daily wage workers, domestic workers, plumbers, electricians, drivers, tailors, construction workers, cooks, delivery workers, beauticians, and security guards turn real-world skills into a verified digital career identity, professional resume, job matches, fair wage insight, fake-job safety check, and interview readiness.

Built for the **Build for Good national hackathon** as a polished, demo-safe social-impact platform.

## Operating Modes

RozgaarAI supports two clear modes:

### Demo Mode

Demo Mode works offline. Judges can explore complete worker journeys instantly using local demo data with no login, database, or paid AI key required.

Demo Mode includes five realistic worker profiles, digital career identity cards, QR profile routes, resume downloads, job recommendations, explainable match scores, wage estimates, work history, income history, employer actions, and public worker profiles.

### Real Usage Mode

Production mode supports secure login, persistent profiles, and database-backed worker records. The current implementation includes a production-ready architecture layer for:

- Login / Signup
- Role selection for Worker, Employer, and NGO / Admin
- Worker profile storage
- Employer saved workers and shortlists
- NGO/Admin impact data
- Supabase/PostgreSQL environment variables
- AI provider keys with local fallback

If Supabase/PostgreSQL credentials are missing, RozgaarAI falls back to local storage and demo data so no screen breaks.

Optional production persistence is routed through a database service layer. When Supabase credentials are configured and the tables exist, the frontend writes to:

- `rozgaar_accounts` for optional role-based accounts
- `rozgaar_worker_profiles` for saved worker profiles and generated AI profiles
- `rozgaar_employer_saved_workers` for employer shortlists
- `rozgaar_impact_metrics` for NGO/Admin impact data

If any database request fails, the app automatically falls back to local storage so Demo Mode stays reliable during judging.

## Problem Statement

India's informal workers often have strong practical skills but no portable proof of work, formal resume, verified profile, or safe way to evaluate job offers. Workers may depend on verbal references, middlemen, unclear wages, and risky messages that ask for money or documents before an interview.

This creates barriers for workers, employers, NGOs, and public programs:

- Workers cannot easily prove skill, experience, or availability.
- Employers struggle to discover verified workers quickly.
- NGOs spend time manually collecting worker details.
- Fake or unsafe job offers exploit first-time and low-literacy workers.
- Wage negotiation often happens without local benchmarks.
- English-first employment tools exclude many Hindi-speaking workers.

## Solution

RozgaarAI converts simple voice or text input into a structured worker profile and complete employability kit:

1. Worker enters or speaks details in English or Hindi.
2. AI/local fallback extracts name, city, skill, experience, wage, language, and availability.
3. RozgaarAI generates a worker profile, resume, and Digital Career Identity with QR.
4. The platform matches jobs using skill, city, experience, wage, language, safety, and verification.
5. Workers receive fair wage guidance, fake-job risk warnings, and interview coaching.
6. Employers and NGOs can search, view, shortlist, and track worker outcomes.

The app works even when paid AI keys, database access, or voice input are unavailable.

## Key Features

- Premium bilingual UI: English default, Hindi switch with localStorage persistence.
- Voice/text onboarding with fallback parser.
- AI-generated worker profile with deterministic local fallback.
- Digital Career Identity card with QR-linked public profile.
- Professional resume generation and PDF-friendly print flow.
- AI Skill Certificate with verification ID.
- 40 realistic mock job records for informal work roles.
- Explainable job matching with match percentage and reasons.
- Fair wage estimator based on role, city, and experience.
- Fake job detector for deposits, missing address, unrealistic salary, unknown employer, early document requests, and weak contact details.
- Interview coach with role-specific questions, sample answers, scoring, and improvement tips.
- Employer dashboard for searching and shortlisting workers.
- NGO/Impact dashboard with demo analytics.
- Employment Readiness Score with actionable suggestions.
- Loading states, empty states, error messages, and mobile-first responsive UI.

## Demo Data

The app includes realistic Indian demo worker profiles:

| Name | Role | City | Experience |
| --- | --- | --- | --- |
| Asha Kumari | Domestic Worker | Delhi | 4 years |
| Ramesh Patel | Plumber | Bhopal | 6 years |
| Rekha Devi | Tailor | Raipur | 8 years |
| Imran Khan | Electrician | Lucknow | 5 years |
| Sanjay Verma | Driver | Nagpur | 7 years |

Job data includes 40 role-specific mock jobs across Indian cities with wage ranges, employer type, required experience, skills, language preference, safety score, and verified/unverified status.

## Tech Stack

**Frontend**

- React
- Vite
- Tailwind CSS
- lucide-react
- qrcode.react
- Local JSON i18n files

**Backend**

- FastAPI
- Pydantic
- Uvicorn
- JSON mock data

**AI**

- Optional Gemini API
- Optional OpenAI API
- Local fallback logic when API keys are missing or provider calls fail

**Deployment**

- Vercel-ready frontend
- Render-ready backend
- Supabase/PostgreSQL-ready production architecture with local fallback

## Architecture

```text
RozgaarAI
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── DigitalCareerIdentityCard.jsx
│   │   │   ├── MetricCard.jsx
│   │   │   └── Section.jsx
│   │   ├── data/
│   │   │   └── mockData.js
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   └── translations.js
│   │   ├── lib/
│   │   │   ├── api.js
│   │   │   └── database.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── data/
│   │   │   └── jobs.json
│   │   ├── services/
│   │   │   ├── ai.py
│   │   │   └── mock_engine.py
│   │   ├── main.py
│   │   └── models.py
│   └── requirements.txt
├── docs/
│   └── screenshots/
├── .env.example
├── HACKATHON_SUBMISSION.md
├── render.yaml
├── vercel.json
└── README.md
```

## Demo Flow

Use the in-app guided demo mode or follow this judge walkthrough:

1. **Voice/text onboarding:** Load Asha Kumari or speak/type worker details.
2. **AI profile generated:** Click the profile generation action and show fallback-safe AI output.
3. **Resume generated:** Open the resume card and download/print the resume.
4. **Digital Career Identity with QR:** Show the premium card and scan/open the QR public profile.
5. **Job matches:** Explain match percentage and the skill, location, wage, language, and safety breakdown.
6. **Interview coach:** Generate role-specific questions and score a sample answer.
7. **Employer views worker profile:** Use the employer dashboard to search and shortlist a worker.
8. **Impact dashboard:** Close with worker registrations, women supported, jobs matched, wage uplift, and income unlocked.

## Screenshots

Add final screenshots before submission in `docs/screenshots/`.

Suggested captures:

- Landing page
- Guided demo mode
- Worker onboarding
- Digital Career Identity card
- Public worker profile QR route
- Resume generator
- Job matches with explainability
- Interview coach
- Employer dashboard
- Impact dashboard
- Hindi language mode
- Mobile view

## Impact Statement

RozgaarAI supports dignity and economic mobility for informal workers by making skills visible, shareable, and safer to monetize. It can help workers negotiate fair wages, avoid risky offers, prepare for interviews, and present experience professionally without needing English fluency or formal resume-writing skills.

For NGOs, skilling partners, and public programs, RozgaarAI can reduce onboarding effort and create measurable employment-readiness data for field pilots.

## Reliability and Fallbacks

RozgaarAI is designed for hackathon demo reliability:

- If an AI API key is missing, local AI-style logic generates profiles, resumes, jobs, wages, risk checks, and interview questions.
- If the backend is unavailable, frontend API calls fall back to local logic.
- If voice input is unsupported, workers can use text input.
- If a database is unavailable, JSON/mock data keeps the demo working.
- If network is slow, loading states and error messages keep the UI understandable.
- Public worker profile routes work through Vercel rewrites.

## Local Setup

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend health check:

```text
http://localhost:8000/health
```

## Environment Variables

Root `.env.example`:

```bash
VITE_API_URL=http://localhost:8000
VITE_PUBLIC_APP_URL=http://localhost:5173
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
ALLOWED_ORIGINS=http://localhost:5173
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
DATABASE_URL=
```

AI and database variables are optional for the MVP. Demo Mode works without them. Add Supabase/PostgreSQL values to enable production persistence.

## Build Scripts

Frontend:

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Backend:

```bash
uvicorn app.main:app --reload --port 8000
```

## Deployment Guide

### Frontend on Vercel

1. Import the repository into Vercel.
2. Use the included `vercel.json`.
3. Set environment variables:

```bash
VITE_API_URL=https://your-render-api.onrender.com
VITE_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

4. Deploy.

### Backend on Render

Use the included `render.yaml`, or configure manually:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set:

```bash
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
DATABASE_URL=
```

## Future Roadmap

- WhatsApp onboarding and shareable worker identity links.
- Supabase/PostgreSQL persistence for worker profiles and employer actions.
- Verified employer job-posting workflow.
- NGO field-worker onboarding tools.
- Regional languages beyond Hindi and English.
- PWA/offline mode for low-connectivity field demos.
- IVR mode for low-literacy workers.
- Reference-based trust badges without requiring Aadhaar.
- Partnerships with skilling centers, worker collectives, and local employers.

## Team

Add team member names, roles, and contact links before final submission.

```text
Team Name:
Members:
Institution/Organization:
Contact:
```

## License

MIT License. See [LICENSE](LICENSE) for details.
