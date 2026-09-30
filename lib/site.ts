/** Central site config used by metadata, sitemap, structured data and public pages. */
export const SITE = {
  name: "Applyo",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://applyo.app").replace(/\/$/, ""),
  tagline: "Your AI career co-pilot",
  title: "Applyo — AI Resume Builder, Interview Practice & Job Auto-Applier",
  description:
    "AI career platform: fix your resume for ATS, write cover letters, practice video interviews with AI feedback, track applications and auto-apply to jobs.",
  keywords: [
    "AI resume builder",
    "ATS resume checker",
    "cover letter generator",
    "mock interview practice",
    "AI video interview practice",
    "interview questions and answers",
    "job application tracker",
    "auto apply to jobs",
    "career coach AI",
    "job search tools",
  ],
  twitter: "@applyoapp",
  email: "hello@applyo.app",
  locale: "en_US",
}

/** Default social card for pages that set their own `openGraph` (which replaces the inherited image). */
export const DEFAULT_OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: "Applyo — AI career platform" }

export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`
