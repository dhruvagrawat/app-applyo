"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search, Brain, FileText, Target, Mail, BookOpen, Sparkles, ClipboardList,
  BarChart3, ShieldCheck, FolderOpen, Zap, CreditCard, User, Activity, Settings,
  Wand2, CornerDownLeft, Video, GraduationCap, ListChecks, MessageSquare,
} from "lucide-react"

type Cmd = { label: string; sub: string; slug: string; icon: React.ElementType; keywords?: string }

function buildCommands(basePath: string): Cmd[] {
  const p = (s: string) => `${basePath}/${s}`
  return [
    { label: "Tailor Everything", sub: "Resume + cover letter + ATS in one go", slug: p("tailor"), icon: Wand2, keywords: "one click auto all" },
    { label: "Resume Improver", sub: "AI-enhance your resume", slug: p("resume-improver"), icon: Brain, keywords: "cv rewrite" },
    { label: "Cover Letter Maker", sub: "Generate a tailored letter", slug: p("cover-letter"), icon: FileText },
    { label: "Email Maker", sub: "Follow-ups & outreach", slug: p("email-maker"), icon: Mail, keywords: "follow up thank you" },
    { label: "ATS Checker", sub: "Score your resume", slug: p("ats-checker"), icon: Target, keywords: "applicant tracking score" },
    { label: "ATS Improver", sub: "Boost your ATS score", slug: p("ats-improver"), icon: Target },
    { label: "Interview Prep", sub: "Practice questions", slug: p("interview-questions"), icon: BookOpen, keywords: "questions" },
    ...(basePath === "/dashboard"
      ? [
          { label: "Interview Studio", sub: "Guide, questions, tests & video", slug: p("interview"), icon: Video, keywords: "mock practice" },
          { label: "Interview Guide", sub: "STAR, research, negotiation", slug: p("interview/guide"), icon: GraduationCap, keywords: "learn tips" },
          { label: "Question Bank", sub: "Answer with AI feedback", slug: p("interview/practice"), icon: MessageSquare, keywords: "practice answer behavioral" },
          { label: "Skill Tests", sub: "Timed quizzes", slug: p("interview/tests"), icon: ListChecks, keywords: "quiz test mcq" },
          { label: "Video Mock Interview", sub: "Record answers on camera", slug: p("interview/video"), icon: Video, keywords: "camera record webcam" },
        ]
      : []),
    { label: "Job Finder", sub: "Find matching roles", slug: p("job-finder"), icon: Search, keywords: "search jobs" },
    { label: "Job Tracker", sub: "Track applications", slug: p("job-tracker"), icon: ClipboardList, keywords: "kanban board" },
    { label: "Job-Resume Compare", sub: "Match score", slug: p("job-resume-compare"), icon: BookOpen },
    { label: "Skill Gap Finder", sub: "What you're missing", slug: p("skill-gap-finder"), icon: BarChart3 },
    { label: "Job Validity", sub: "Is this job legit?", slug: p("job-validity"), icon: ShieldCheck, keywords: "scam" },
    { label: "Resume Vault", sub: "Manage resumes", slug: p("memory"), icon: FolderOpen, keywords: "storage" },
    { label: "Auto-Applier", sub: "Auto-apply to jobs", slug: p("auto-applier/start"), icon: Zap },
    { label: "Analytics", sub: "Your usage", slug: p("analytics"), icon: BarChart3 },
    { label: "Billing & Plans", sub: "Manage your plan", slug: p("billing"), icon: CreditCard, keywords: "pricing upgrade" },
    { label: "Profile", sub: "Your details", slug: p("profile"), icon: User },
    { label: "Activity Log", sub: "Recent actions", slug: p("activity"), icon: Activity },
    { label: "Settings", sub: "Theme & preferences", slug: p("settings"), icon: Settings, keywords: "color appearance" },
  ]
}

export function CommandPalette({ basePath = "/dashboard" }: { basePath?: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const commands = buildCommands(basePath)

  const filtered = query.trim()
    ? commands.filter((c) =>
        `${c.label} ${c.sub} ${c.keywords ?? ""}`.toLowerCase().includes(query.toLowerCase()),
      )
    : commands

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery("")
      setActive(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => setActive(0), [query])

  const go = (slug: string) => {
    setOpen(false)
    router.push(slug)
  }

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)) }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === "Enter" && filtered[active]) { e.preventDefault(); go(filtered[active].slug) }
  }

  return (
    <>
      {/* Trigger pill (shown in topbar) */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 smooth-hover text-sm"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="text-xs">Search…</span>
        <kbd className="ml-2 text-[10px] font-mono bg-background border border-border rounded px-1.5 py-0.5">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4 animate-fade-in" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search tools and pages…"
                className="flex-1 h-12 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No results for “{query}”</p>
              )}
              {filtered.map((c, i) => (
                <button
                  key={c.slug}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(c.slug)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left smooth-hover ${
                    i === active ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${i === active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <c.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground leading-tight">{c.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.sub}</p>
                  </div>
                  {i === active && <CornerDownLeft className="w-3.5 h-3.5 text-primary shrink-0" />}
                </button>
              ))}
            </div>

            <div className="px-4 py-2 border-t border-border bg-muted/40 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Quick navigation</span>
              <span className="ml-auto">↑↓ to move · ↵ to open</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
