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

In your Supabase project, go to the SQL editor and run:

```sql
create table applications (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role_title text,
  jd_text text,
  status text default 'Applied',
  analysis jsonb,
  cover_letter text,
  fit_score int,
  fit_details jsonb,
  created_at timestamp with time zone default now()
);

-- Allow anon read/write for this solo-use portfolio project.
-- (For a multi-user version, add Supabase Auth + row-level security instead.)
alter table applications enable row level security;

create policy "Allow all for anon"
on applications
for all
to anon
using (true)
with check (true);
```

## 3. Run locally

```bash
npm run dev
```

Visit http://localhost:3000

## 4. Deploy (free, no card)

1. Push this project to a GitHub repo.
2. Go to https://vercel.com → "New Project" → import the repo.
3. In Vercel's project settings, add the same environment variables from
   `.env.local` (Settings → Environment Variables).
4. Deploy. You'll get a live `*.vercel.app` URL — put that in your portfolio.

## How it works

- **Add Application**: paste a job description, AI extracts required skills,
  nice-to-haves, seniority, and responsibilities.
- **Fit Score**: compares your resume text against the JD, returns a score and
  what's missing.
- **Cover Letter**: generates a tailored, non-generic draft from your resume + the JD.
- Your resume text is saved in your browser's localStorage only — never sent
  anywhere except directly to the Gemini API call when you click generate.

## Notes on scope

This is intentionally single-user (no login) to keep it shippable in a week.
A natural "v2" extension — worth mentioning in interviews even if unbuilt — is
adding Supabase Auth so each user has their own private applications.
# ai-job-tracker
