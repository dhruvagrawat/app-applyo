# app-applyo — Applyo Main Application

## What this is

The primary production application for **Applyo** — an AI-powered job application assistant. This is a full-featured Next.js app (v16, React 19) with Supabase auth/database and Gemini AI integration.

The companion project `applyo.app/` is an earlier prototype with a fancier landing page but far fewer features. This is the one to develop.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth + DB | Supabase (SSR, RLS) |
| AI | Google Gemini (default `gemini-2.5-flash`, override with `GEMINI_MODEL`) |
| PDF Parsing | `pdf-parse`, `pdfjs-dist` |
| Package Manager | pnpm |

---

## Project Structure

```
app-applyo/
├── app/
│   ├── page.tsx                    # Landing page (public, parallax hero, JSON-LD, FAQ)
│   ├── blog/                       # Public blog: index, [slug], category/[category], rss.xml
│   ├── robots.ts / sitemap.ts      # SEO: crawler rules (incl. AI bots) + sitemap of all public pages
│   ├── manifest.ts                 # PWA manifest
│   ├── opengraph-image.tsx         # Generated social cards (also per blog post)
│   ├── llms.txt/ llms-full.txt/    # LLM-readable site map + full blog text (AI SEO)
│   ├── layout.tsx                  # Root layout + ThemeProvider
│   ├── globals.css                 # Global styles + animations
│   ├── auth/
│   │   ├── login/page.tsx          # Email/password login
│   │   ├── sign-up/page.tsx        # Registration
│   │   └── sign-up-success/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard shell (Sidebar + Topbar), auth guard
│   │   ├── page.tsx                # Dashboard home (stats + quick links)
│   │   ├── resumes/                # Resume Builder: vault (list/import/duplicate) + [id] editor with live preview & PDF
│   │   ├── email-maker/            # AI follow-up / thank-you / outreach emails
│   │   ├── analytics/              # Real usage stats (server component)
│   │   ├── billing/                # Plan page (checkout not wired yet — contact link)
│   │   ├── resume-improver/        # AI resume enhancement
│   │   ├── ats-checker/            # ATS compatibility scoring
│   │   ├── ats-improver/           # ATS-targeted improvements
│   │   ├── cover-letter/           # AI cover letter generation
│   │   ├── interview-questions/    # Interview prep question generator
│   │   ├── interview/              # Interview Studio: overview, guide, practice (question bank + AI feedback),
│   │   │                           #   tests (+ tests/[id] runner, "ai" = generated quiz), video (mock interview)
│   │   ├── job-finder/             # Job discovery
│   │   ├── job-tracker/            # Smart tracker: paste a job link → AI parses it; fit score, tool handoff
│   │   ├── job-resume-compare/     # Resume vs. job description match
│   │   ├── job-validity/           # Job posting validity check
│   │   ├── skill-gap-finder/       # Skills gap analysis
│   │   ├── auto-applier/start/     # AI auto-applier: embedded live Steel browser + agent panel
│   │   ├── activity/               # Activity log
│   │   ├── profile/                # User profile
│   │   └── settings/               # App settings
│   └── api/
│       ├── core/                   # AI feature endpoints
│       │   ├── resume-improver/    POST - improve resume text
│       │   ├── ats-checker/        POST - score ATS compatibility
│       │   ├── ats-improver/       POST - ATS-targeted improvements
│       │   ├── cover-letter/       POST - generate cover letter
│       │   ├── interview-questions/ POST - generate interview questions
│       │   ├── job-finder/         POST - find matching jobs
│       │   ├── job-resume-compare/ POST - compare resume to job
│       │   ├── job-validity/       POST - check job validity
│       │   └── skill-gap-finder/   POST - find skill gaps
│       ├── auto/sessions/          GET list / POST start a Steel browser session
│       │   └── [id]/               GET status, DELETE(/POST beacon) release
│       │       ├── step/           POST - one AI agent step (fill / approved submit)
│       │       ├── navigate/       POST - navigate the live browser
│       │       └── complete/       POST - mark applied + add to job tracker
│       ├── interview/              feedback (score an answer), generate (questions), quiz (AI test), history
│       ├── jobs/parse/             POST - parse a job URL or pasted text into structured data
│       ├── resumes/                GET list / POST create (blank, from data, or copyFrom)
│       │   ├── [id]/               GET / PUT (builder data → also syncs plain-text `content`) / DELETE
│       │   ├── ai/                 POST action: parse | bullet | summary | tailor
│       │   └── latest/             GET most recently *edited* resume (used by every tool) / POST save text
│       ├── profile/application/    GET/PUT - application profile (phone, links, work auth, EEO…)
│       ├── upload/resume/          POST - PDF resume upload + parsing
│       ├── profile/                GET/PUT - user profile CRUD
│       └── items/                  GET - fetch generated items history
├── components/
│   ├── sidebar.tsx                 # Dashboard navigation sidebar
│   ├── topbar.tsx                  # Dashboard top bar (theme toggle, user menu)
│   ├── resume-uploader.tsx         # PDF drag-and-drop uploader
│   ├── job-link-importer.tsx       # "Paste a job link" → fills job description (used by all AI tools)
│   ├── saved-resume-button.tsx     # "Use saved / Save" resume links next to resume inputs
│   ├── site/                       # Public site header, footer, blog post card
│   ├── landing/                    # Hero + motion primitives (Parallax, Reveal, Tilt, CountUp)
│   ├── interview/                  # Interview Studio nav + AI feedback card
│   ├── feature-card.tsx            # Reusable feature card
│   ├── theme-provider.tsx          # next-themes provider
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── gemini.ts                   # Gemini API client (callGemini function)
│   ├── handoff.ts                  # Pass a job between tools (sessionStorage) + jobToDescription()
│   ├── site.ts                     # SITE config (name, url, description) used by all SEO code
│   ├── seo/                        # JSON-LD helpers, OG image template, canonical feature list
│   ├── blog/                       # 50 posts (posts/*.ts), categories, markdown renderer
│   ├── interview/                  # Question bank, quizzes, guide chapters, delivery metrics, speech hook
│   ├── resume/types.ts             # ResumeData model, normalizeResume(), resumeToText(), completeness score
│   ├── jobs/
│   │   ├── fetch-page.ts           # SSRF-safe page fetch, JSON-LD JobPosting + text extraction
│   │   └── parse-job.ts            # parseJob(): URL/text → structured job via Gemini
│   ├── auto-apply/
│   │   ├── steel.ts                # Steel.dev REST client (sessions, live view URL, CDP URL)
│   │   ├── agent.ts                # Playwright-over-CDP agent: snapshot page → Gemini plan → execute
│   │   ├── tasks.ts                # auto_tasks helpers + candidate (profile/resume) loader
│   │   └── profile.ts              # Application profile field list
│   ├── supabase/
│   │   ├── client.ts               # Browser-side Supabase client
│   │   ├── server.ts               # Server-side Supabase client (SSR)
│   │   ├── admin.ts                # Service-role admin client
│   │   ├── middleware.ts           # Session refresh middleware helper
│   │   ├── profile-helpers.ts      # Profile CRUD helpers
│   │   └── validation-helpers.ts   # Input validation
│   └── utils/
│       ├── prompts.ts              # All Gemini prompt templates
│       ├── pdf-parser.ts           # PDF text extraction
│       ├── gibberish-detector.ts   # Resume quality check
│       ├── sidebar-data.ts         # Sidebar nav config
│       └── validation.ts           # Zod schemas
├── scripts/
│   ├── schema.sql                  # Initial DB schema (run first)
│   ├── schema_additions.sql        # Adds job_applications table
│   ├── schema_v2_additions.sql     # Adds auto_tasks + resume upload columns
│   ├── schema_v3_additions.sql     # Smart tracker columns, auto_tasks session columns, application_profile
│   ├── schema_v4_additions.sql     # Interview Studio: interview_attempts, quiz_results
│   └── schema_v5_additions.sql     # Resume edit/delete RLS, profile insert + auto-create trigger, misc RLS fixes
└── middleware.ts                   # Next.js middleware → session refresh + auth redirect
```

---

## Environment Variables

File: `.env` (not committed — create locally)

```env
NEXT_PUBLIC_SUPABASE_URL="https://xefkhuwyxkjjabxefooc.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon key>"
SUPABASE_SERVICE_ROLE_KEY="<service role key>"
SUPABASE_URL="https://xefkhuwyxkjjabxefooc.supabase.co"
GEMINI_API_KEY="<gemini key>"          # or GEMINI_API_KEY_1..10 for rotation
GEMINI_MODEL="gemini-2.5-flash"        # optional override
GEMINI_BASE_URL=""                     # optional (proxy / local mock)
STEEL_API_KEY="<steel.dev API key>"   # server-only; required for the auto-applier
NEXT_PUBLIC_SITE_URL="https://applyo.app"   # canonical URLs, sitemap, OG images (defaults to applyo.app)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""     # optional: Search Console token
NEXT_PUBLIC_BING_SITE_VERIFICATION=""       # optional: Bing Webmaster token
```

> Supabase project ref: `xefkhuwyxkjjabxefooc`

---

## Database Schema

Run SQL scripts in this order against the Supabase project:

1. `scripts/schema.sql` — core tables
2. `scripts/schema_additions.sql` — job_applications table
3. `scripts/schema_v2_additions.sql` — resume upload columns + auto_tasks table
4. `scripts/schema_v3_additions.sql` — smart tracker, auto-applier sessions, application profile
5. `scripts/schema_v4_additions.sql` — Interview Studio history (interview_attempts, quiz_results)
6. `scripts/schema_v5_additions.sql` — **required**: lets users edit/delete resumes and create their profile row
   (adds an `auth.users` trigger that creates `profiles` on sign-up). Every script is safe to re-run.

### Tables

| Table | Purpose |
|---|---|
| `profiles` | Extra user info (name, headline, tones) |
| `generated_items` | Log of all AI feature outputs |
| `resumes` | Saved resume texts + metadata |
| `cover_letters` | Saved cover letters |
| `activity_log` | User activity events |
| `job_applications` | Job tracker entries |
| `auto_tasks` | Auto-applier task queue |

All tables use Row Level Security (RLS) — users can only see their own rows.

---

## Authentication

- Supabase email/password auth
- Middleware at `middleware.ts` refreshes sessions and redirects unauthenticated users to `/auth/login`
- Dashboard layout (`app/dashboard/layout.tsx`) has a server-side auth guard
- Public routes: `/` (landing), `/auth/*`, `/blog/*`, `/demo/*`, `/privacy`, `/terms`, and SEO files
  (`robots.txt`, `sitemap.xml`, `llms.txt`, `manifest.webmanifest`, OG images) — see `PUBLIC_FILES` in `middleware.ts`.
  Anything new that crawlers must reach has to be added there, or it will redirect to login.

---

## AI Integration

All AI calls go through `lib/gemini.ts → callGemini()`. Prompts are centralized in `lib/utils/prompts.ts`. Each API route (`app/api/core/*/route.ts`) calls Gemini and saves the result to `generated_items`.

---

## Auto-Applier

1. `POST /api/auto/sessions` creates a Steel cloud browser and opens the job URL. Its `debugUrl` (with `interactive=true`) is embedded in an iframe, so the user can watch **and** click/type (e.g. to log in).
2. Each `POST /api/auto/sessions/[id]/step` connects with `playwright-core` over CDP, snapshots form fields/buttons in every frame (tagging elements with `data-applyo-id`), asks Gemini for a plan, and fills fields / uploads the resume / clicks "Apply" or "Next". The client loops up to 8 steps.
3. The agent never clicks the final submit in `fill` mode (`executePlan` guards `click === submit_id`). The user approves with "Submit application", which runs a `submit`-mode step.
4. `complete` adds the job to `job_applications`; sessions are released on end/page leave.

The Steel key stays server-side — never put it in client code.

## Interview Studio (`/dashboard/interview`)

- **Guide** — chapters in `lib/interview/guide.ts` (markdown via `lib/blog/markdown.tsx`); checklist progress in localStorage.
- **Question bank** — `lib/interview/questions.ts`. Answers can be typed or dictated (Web Speech API, `use-speech.ts`);
  `POST /api/interview/feedback` returns score, STAR check, strengths, improvements and a rewritten answer.
- **Tests** — static quizzes in `lib/interview/quizzes.ts`; `POST /api/interview/quiz` generates one for any topic.
- **Video** — `getUserMedia` + `MediaRecorder` recording, live transcript, pace/filler metrics (`metrics.ts`) and AI
  feedback per answer. Recordings stay in the browser (blob URLs) unless the user downloads them.
- History is saved to `interview_attempts` / `quiz_results` (schema v4); pages still work without the tables.
- Hidden from the demo sidebar (needs a real account for AI + camera).

## Resume Builder (`/dashboard/resumes`)

- Structured data lives in `resumes.metadata.builder` (`ResumeData`, see `lib/resume/types.ts`); every save also writes a
  plain-text copy to `resumes.content`, so "Use saved resume", ATS checker, fit scoring and the Auto-Applier all pick
  up the latest edits automatically (ordered by `updated_at`).
- Always pass untrusted JSON (client, DB, AI) through `normalizeResume()`.
- Templates (`minimal`, `classic`, `compact`) are single-column on purpose (ATS-safe). PDF export is the browser print
  dialog; print CSS in `globals.css` isolates `#resume-print`.
- AI actions never invent facts; missing metrics come back as `[brackets]`.

## Blog & SEO

- Posts are TypeScript data in `lib/blog/posts/<category>.ts` (markdown subset). Add a post there and it appears in the
  blog, sitemap, RSS, `llms.txt` and `llms-full.txt` automatically. Link internally with `/blog/<slug>`.
- Every public page sets `alternates.canonical`; the root layout deliberately sets none (children must not inherit `/`).
- Pages that override `openGraph` must pass `images: [DEFAULT_OG_IMAGE]` (from `lib/site.ts`) or they lose the card.
- Structured data: Organization + WebSite (root), SoftwareApplication + FAQPage (home), BlogPosting + BreadcrumbList
  (+ FAQPage when a post has `faqs`).

## Testing end-to-end without cloud services

The full flow (sign-up → resume builder → AI tools → tracker → interview studio) was verified against a local
Supabase-compatible stack (Postgres 16 + GoTrue + PostgREST behind a small gateway) and a mock Gemini server pointed
to via `GEMINI_BASE_URL`. Apply all `scripts/*.sql` in order on a fresh database to reproduce.

## Running Locally

```bash
cd app-applyo
pnpm install
pnpm dev       # starts at http://localhost:3000
```

---

## Known Issues / TODOs

- Auto-applier needs `STEEL_API_KEY`; job boards behind logins (LinkedIn/Indeed) require the user to log in inside the live view
- Job link parsing can't read pages behind a login wall — users get a "paste the description" fallback
- Resume upload stores files in Supabase Storage (bucket must be created: `resumes`)
- All schema SQL must be run manually in the Supabase dashboard SQL editor
