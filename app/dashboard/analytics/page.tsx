import Link from "next/link"
import { BarChart3, FileText, Briefcase, MessageSquare, Sparkles, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Usage Stats" }

const FEATURE_LABELS: Record<string, string> = {
  resume_improver: "Resume Improver",
  ats_checker: "ATS Checker",
  ats_improver: "ATS Improver",
  cover_letter: "Cover Letter",
  interview_questions: "Interview Questions",
  job_finder: "Job Finder",
  job_resume_compare: "Job-Resume Match",
  job_validity: "Job Validity",
  skill_gap_finder: "Skill Gap Finder",
  email_maker: "Email Maker",
  interview_feedback: "Interview answer feedback",
  interview_generate: "Interview question sets",
  interview_quiz: "AI skill tests",
}

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const since = new Date(Date.now() - 29 * 86_400_000)
  since.setHours(0, 0, 0, 0)
  const [items, jobs, resumes, attempts, quizzes] = await Promise.all([
    supabase.from("generated_items").select("feature, created_at").eq("user_id", user.id).limit(5000),
    supabase.from("job_applications").select("status").eq("user_id", user.id),
    supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("interview_attempts").select("score").eq("user_id", user.id),
    supabase.from("quiz_results").select("score, total").eq("user_id", user.id),
  ])

  const gen = items.data || []
  const byFeature = Object.entries(
    gen.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.feature]: (acc[i.feature] || 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1])
  const maxFeature = Math.max(1, ...byFeature.map(([, n]) => n))

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86_400_000)
    return { key: d.toDateString(), label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), n: 0 }
  })
  for (const i of gen) {
    const day = days.find((d) => d.key === new Date(i.created_at).toDateString())
    if (day) day.n++
  }
  const maxDay = Math.max(1, ...days.map((d) => d.n))
  const last30 = days.reduce((a, d) => a + d.n, 0)

  const jobRows = jobs.data || []
  const statusCount = (s: string) => jobRows.filter((j) => j.status === s).length
  const scores = (attempts.data || []).map((a) => Number(a.score)).filter((n) => !Number.isNaN(n))
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—"
  const quizRows = quizzes.data || []
  const quizPct = quizRows.length ? `${Math.round((quizRows.reduce((a, q) => a + q.score / q.total, 0) / quizRows.length) * 100)}%` : "—"

  const cards = [
    { icon: Sparkles, label: "AI generations (30 days)", value: last30 },
    { icon: FileText, label: "Resumes", value: resumes.count ?? 0 },
    { icon: Briefcase, label: "Jobs tracked", value: jobRows.length },
    { icon: MessageSquare, label: "Interview answers · avg score", value: `${scores.length} · ${avgScore}` },
    { icon: Trophy, label: "Skill tests · avg", value: `${quizRows.length} · ${quizPct}` },
  ]

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Usage Stats</h1>
            <p className="text-sm text-muted-foreground">Your activity across Applyo.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-card p-4">
              <c.icon className="w-4 h-4 text-primary mb-2" />
              <div className="text-2xl font-bold text-foreground">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">AI generations per day</p>
          <div className="flex items-end gap-1 h-36" role="img" aria-label={`${last30} AI generations in the last 30 days`}>
            {days.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col justify-end h-full group relative">
                <div className="rounded-t bg-primary/80 group-hover:bg-primary transition-colors" style={{ height: `${(d.n / maxDay) * 100}%`, minHeight: d.n ? 3 : 0 }} />
                <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground text-background text-[10px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100">
                  {d.label}: {d.n}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
            <span>{days[0].label}</span><span>Today</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-4">Most used tools</p>
            {byFeature.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nothing yet — try the <Link href="/dashboard/resumes" className="text-primary underline">Resume Builder</Link>.</p>
            ) : (
              <div className="space-y-2.5">
                {byFeature.slice(0, 10).map(([f, n]) => (
                  <div key={f}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-foreground">{FEATURE_LABELS[f] || f}</span><span className="text-muted-foreground">{n}</span></div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(n / maxFeature) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-4">Application pipeline</p>
            <div className="space-y-2.5">
              {["saved", "applied", "interviewing", "offer", "rejected"].map((s) => (
                <div key={s}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-foreground capitalize">{s}</span><span className="text-muted-foreground">{statusCount(s)}</span></div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${jobRows.length ? (statusCount(s) / jobRows.length) * 100 : 0}%` }} /></div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/job-tracker" className="inline-block mt-4 text-xs text-primary hover:underline">Open Job Tracker →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
