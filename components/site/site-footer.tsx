import Link from "next/link"
import { Sparkles } from "lucide-react"
import { BLOG_CATEGORIES } from "@/lib/blog"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "All features" },
      { href: "/#interview-studio", label: "Interview Studio" },
      { href: "/#auto-apply", label: "AI Auto-Applier" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/demo", label: "Live demo" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/demo/resume-improver", label: "Resume Improver" },
      { href: "/demo/ats-checker", label: "ATS Checker" },
      { href: "/demo/cover-letter", label: "Cover Letter Maker" },
      { href: "/demo/job-tracker", label: "Job Tracker" },
      { href: "/demo/skill-gap-finder", label: "Skill Gap Finder" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Career blog" },
      ...BLOG_CATEGORIES.slice(0, 4).map((c) => ({ href: `/blog/category/${c.slug}`, label: c.name })),
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/auth/sign-up", label: "Create account" },
      { href: "/auth/login", label: "Log in" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid grid-cols-2 md:grid-cols-6 gap-8">
        <div className="col-span-2 space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </span>
            <span className="text-lg font-bold text-foreground">Applyo</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            The all-in-one AI career platform — resumes, interviews, applications and everything in between.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="max-w-7xl mx-auto px-4 md:px-8 py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Applyo. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
