# AI Job Application Tracker

Track job applications with AI-powered job description analysis, tailored cover
letter generation, and resume-fit scoring. Built while preparing for a relocation
and job search in the UAE.

## Stack
- Next.js 14 (App Router) + Tailwind CSS
- Supabase (Postgres + free hosting for data)
- Google Gemini API (free tier) for AI features
- Deployed on Vercel (free)

## 1. Local setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

- **Supabase**: create a free project at https://supabase.com → Project Settings → API
  → copy the Project URL and anon public key.
- **Gemini**: get a free API key at https://aistudio.google.com/app/apikey
  (no card required).

## 2. Supabase database setup



## 3. Run locally

```bash
npm run dev
```


## 4. Deploy (free, no card)


## How it works

- **Add Application**: paste a job description, AI extracts required skills,
  nice-to-haves, seniority, and responsibilities.
- **Fit Score**: compares your resume text against the JD, returns a score and
  what's missing.
- **Cover Letter**: generates a tailored, non-generic draft from your resume + the JD.
- Your resume text is saved in your browser's localStorage only — never sent
  anywhere except directly to the Gemini API call when you click generate.

# ai-job-tracker
