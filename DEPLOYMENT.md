# RozgaarAI Deployment Guide

RozgaarAI is a React + Vite frontend app with Firebase Authentication. The app is deployment-ready for Vercel and supports SPA routing for direct refreshes such as `/dashboard`, `/worker/:id`, and `/public/:id`.

## 1. Push To GitHub

1. Commit your latest code.
2. Push the repository to GitHub.
3. Do not commit real `.env` files. Use `.env.example` as the template.

## 2. Import In Vercel

1. Open [Vercel](https://vercel.com).
2. Click **Add New Project**.
3. Import the RozgaarAI GitHub repository.
4. Use one of these setup options:

### Option A: Import Repository Root

Use the root `vercel.json`.

- Framework Preset: `Vite`
- Build Command: `cd frontend && npm install && npm run build`
- Output Directory: `frontend/dist`

### Option B: Set Root Directory To `frontend`

Use the `frontend/vercel.json`.

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## 3. Add Environment Variables

In Vercel, open:

`Project Settings -> Environment Variables`

Add these variables:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Optional:

```bash
VITE_API_URL=
VITE_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

For local development, copy `frontend/.env.example` to `frontend/.env` and fill in the same Firebase values.

## 4. Deploy Backend On Render

1. Open [Render](https://render.com).
2. Click **New +**.
3. Choose **Web Service**.
4. Select the GitHub repository.
5. Use these settings:

```text
Name: rozgaarai-backend
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

6. Add these environment variables:

```bash
PYTHON_VERSION=3.11.9
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
OPENAI_API_KEY=
GEMINI_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
DATABASE_URL=
```

`PYTHON_VERSION=3.11.9` is important. It prevents Render from using Python 3.14, which can force `pydantic-core` to compile from source and fail during deployment.

7. Click **Deploy Web Service**.
8. After deploy, test:

```text
https://your-render-backend.onrender.com/docs
```

## 5. Deploy Frontend On Vercel

1. Click **Deploy** in Vercel.
2. Wait for the build to complete.
3. Copy your Vercel deployment domain, for example:

```text
https://rozgaarai-demo.vercel.app
```

After the backend is live, set this Vercel environment variable:

```bash
VITE_API_URL=https://your-render-backend.onrender.com
```

Then redeploy the frontend.

## 6. Add Firebase Authorized Domain

Google Sign-In will not work until Firebase trusts the deployed domain.

1. Open [Firebase Console](https://console.firebase.google.com).
2. Select the RozgaarAI Firebase project.
3. Go to **Authentication**.
4. Open **Settings**.
5. Under **Authorized domains**, add:

```text
your-vercel-domain.vercel.app
```

If you use a custom domain, add that domain too.

## 7. Test Routes After Deployment

Verify these routes load directly and after refresh:

- `/`
- `/demo`
- `/login`
- `/signup`
- `/dashboard`
- `/worker/:id`
- `/employer`
- `/public/:id`

The Vercel rewrite rule sends all routes to the Vite SPA entry point:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## 8. Final Deployment Checklist

- Landing page loads.
- Google Sign-In works.
- Create Account works.
- Dashboard opens after login.
- Create Worker Identity works.
- Explore Worker Journey opens.
- Resume PDF downloads.
- Digital Worker Card downloads.
- Employer Dashboard works.
- Public worker profile route works.
- Mobile layout looks clean.
- Refresh works on `/dashboard`, `/worker/:id`, and `/public/:id`.
- No real `.env` files are committed.

## Troubleshooting

### Google Sign-In Opens But Fails

Check that the Vercel domain is added to Firebase Authorized Domains.

### Google Sign-In Says Firebase Is Not Configured

Check that all `VITE_FIREBASE_*` variables are set in Vercel and redeploy.

### Route Shows 404 On Refresh

Confirm the Vercel rewrite rule is present in `vercel.json`.

### QR/Public Profile Uses Localhost

Set this in Vercel:

```bash
VITE_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

### Render Build Fails On `pydantic-core`

If Render logs show Python `3.14` and an error from `pydantic-core`, add this Render environment variable and redeploy:

```bash
PYTHON_VERSION=3.11.9
```

This repo also includes `backend/.python-version` with `3.11.9`.
