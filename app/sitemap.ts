import type { MetadataRoute } from "next"
import { ALL_POSTS, BLOG_CATEGORIES } from "@/lib/blog"
import { absoluteUrl } from "@/lib/site"

const DEMO_TOOLS = [
  "resume-improver", "ats-checker", "ats-improver", "cover-letter", "email-maker", "interview-questions",
  "job-finder", "job-tracker", "job-resume-compare", "skill-gap-finder", "job-validity", "tailor",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = ALL_POSTS[0]?.date
  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/demo"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/auth/sign-up"), changeFrequency: "yearly", priority: 0.6 },
    ...BLOG_CATEGORIES.map((c) => ({
      url: absoluteUrl(`/blog/category/${c.slug}`),
      lastModified: latest,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...ALL_POSTS.map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      lastModified: p.updated || p.date,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...DEMO_TOOLS.map((t) => ({ url: absoluteUrl(`/demo/${t}`), changeFrequency: "monthly" as const, priority: 0.5 })),
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ]
}
