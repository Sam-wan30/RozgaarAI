# Build for Good Hackathon Submission

## Project Title

RozgaarAI

## Description

RozgaarAI is a voice-first AI employment assistant for India's informal workforce. It helps workers create a verified digital career identity, generate a professional resume, match with safer jobs, estimate fair wages, detect fake job risks, and practice interviews in English or Hindi.

The product is designed for daily wage workers, domestic workers, plumbers, electricians, drivers, tailors, construction workers, cooks, delivery workers, beauticians, and security guards. It is demo-safe even without paid AI keys or a live database because every AI feature has local fallback logic.

## Links

- Demo URL: `https://your-demo-url.vercel.app`
- Repository URL: `https://github.com/your-org/rozgaarai`
- Video URL: `https://your-video-link`
- Presentation URL: `https://your-presentation-link`

## 5-Minute Demo Script

### 0:00-0:30 — Problem and Vision

"India's informal workers have real skills, but often no portable proof of work, formal resume, verified profile, or safe way to evaluate jobs. RozgaarAI turns real-world skills into a digital career identity."

Show the landing page hero: **Digital Career Identity for India's Informal Workforce**.

### 0:30-1:00 — Language and Accessibility

Switch between English and Hindi. Explain that English loads by default, Hindi persists when selected, and the interface is built for workers with varying literacy levels.

### 1:00-1:40 — Worker Onboarding

Open guided demo mode and then Worker Onboarding. Load **Asha Kumari, Domestic Worker, Delhi** or use the voice/text example:

"My name is Asha Kumari. I work as a domestic worker in Delhi. I have 4 years of experience."

Show that RozgaarAI extracts name, city, skill, experience, language, wage, and availability.

### 1:40-2:20 — AI Profile, Resume, and Digital Identity

Generate the worker profile. Show:

- AI-generated worker profile
- Resume card
- Digital Career Identity card
- Worker ID
- QR code linking to public profile
- Employment Readiness Score

Explain that local fallback logic keeps the demo working if AI keys are missing.

### 2:20-3:00 — Job Matching and Wage Estimate

Open Job Matches. Explain the match score:

- Skill match
- Location match
- Wage match
- Language match
- Safety score

Open Wage Estimator and show a fair wage range based on skill, city, and experience.

### 3:00-3:35 — Fake Job Detector

Show the risky job offer example. Explain the detector flags:

- Registration money
- No address
- Unrealistic salary
- Unknown employer
- Documents before interview
- Poor contact details

### 3:35-4:10 — Interview Coach

Generate role-specific interview questions. Type or speak a short answer and show feedback on confidence, clarity, and technical relevance.

### 4:10-4:40 — Employer Dashboard

Open the employer dashboard. Search workers by skill/city, open a public profile, and shortlist a worker.

### 4:40-5:00 — Impact Dashboard and Close

Show impact metrics:

- Workers registered
- Women workers supported
- Jobs matched
- Average wage increase
- Verified skill cards
- Interviews completed
- Cities covered
- Estimated monthly income unlocked

Close with: "RozgaarAI gives informal workers a dignified, portable, AI-powered career identity that can scale through NGOs, employers, and public-interest employment programs."

## 10-Slide Presentation Outline

1. **Title**
   RozgaarAI: Digital Career Identity for India's Informal Workforce.

2. **Problem**
   Informal workers lack resumes, verified identity, safe job discovery, and wage transparency.

3. **User Personas**
   Asha Kumari, Ramesh Patel, Rekha Devi, Sanjay Verma, Imran Khan.

4. **Solution**
   Voice-first onboarding that creates a complete employability kit.

5. **Product Demo Flow**
   Onboarding → AI profile → resume → digital identity QR → jobs → wages → interview → employer/impact dashboards.

6. **AI and Reliability**
   Optional Gemini/OpenAI integration with deterministic fallback logic for no-key demos.

7. **Job Safety and Wage Fairness**
   Fake job detector and wage estimator reduce exploitation risk.

8. **Employer and NGO Value**
   Search verified workers, shortlist profiles, track outcomes, support field onboarding.

9. **Impact Potential**
   Portable identity, safer work discovery, higher wage clarity, interview confidence, measurable livelihoods outcomes.

10. **Roadmap and Ask**
   WhatsApp onboarding, regional languages, verified employers, Supabase persistence, NGO pilots, funding/mentorship.

## Required Demo Profiles

| Name | Role | City | Demo Purpose |
| --- | --- | --- | --- |
| Asha Kumari | Domestic Worker | Delhi | Default worker journey and QR identity |
| Ramesh Patel | Plumber | Bhopal | Skilled trade with wage estimate |
| Rekha Devi | Tailor | Raipur | Women worker and home-based skill pathway |
| Sanjay Verma | Driver | Nagpur | Mobility role and employer shortlist flow |
| Imran Khan | Electrician | Lucknow | Technical role and safety/interview demo |

## Reliability Checklist

- Works without AI API key.
- Works without database.
- Works if backend is unavailable.
- Works if voice input is unsupported.
- Uses mock jobs and demo profiles.
- Has error messages, loading states, and empty states.
- Supports English and Hindi.
- QR profile route works through frontend routing.
- Mobile-first responsive layout.
- Production build passes.

## Submission Notes

Before final upload:

- Add deployed demo URL.
- Add GitHub repository URL.
- Add pitch video URL.
- Add presentation deck URL.
- Add screenshots to `docs/screenshots/`.
- Add team member details to `README.md`.
