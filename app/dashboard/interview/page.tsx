"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GraduationCap, MessageSquare, ListChecks, Video, ArrowRight, Trophy, Target, Flame, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InterviewNav } from "@/components/interview/interview-nav"
import { scoreColor } from "@/components/interview/feedback-card"
import { GUIDE_CHAPTERS } from "@/lib/interview/guide"
import { QUESTION_BANK } from "@/lib/interview/questions"
import { QUIZZES } from "@/lib/interview/quizzes"

interface Attempt { id: string; question: string; mode: string; score: number; category: string | null; created_at: string }
interface QuizResult { id: string; quiz_title: string; score: number; total: number; created_at: string }

const MODES = [
  { href: "/dashboard/interview/guide", icon: GraduationCap, title: "Interview Guide", desc: `${GUIDE_CHAPTERS.length} chapters from research to negotiation, with checklists.`, tint: "from-orange-500/15" },
  { href: "/dashboard/interview/practice", icon: MessageSquare, title: "Question Bank", desc: `${QUESTION_BANK.length} questions. Type or speak your answer and get AI feedback.`, tint: "from-sky-500/15" },
  { href: "/dashboard/interview/tests", icon: ListChecks, title: "Skill Tests", desc: `${QUIZZES.length} timed quizzes plus AI-generated tests for any role.`, tint: "from-emerald-500/15" },
  { href: "/dashboard/interview/video", icon: Video, title: "Video Mock Interview", desc: "Answer on camera with a live transcript, pace and filler-word analysis.", tint: "from-rose-500/15" },
]

function streakDays(dates: string[]) {
  const days = new Set(dates.map((d) => new Date(d).toDateString()))
  let streak = 0
  const cursor = new Date()
  while (days.has(cursor.toDateString())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function InterviewStudioPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [quizzes, setQuizzes] = useState<QuizResult[]>([])
  const [needsMigration, setNeedsMigration] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch("/api/interview/history")
      .then((r) => r.json())
      .then((d) => {
        setAttempts(d.attempts || [])
        setQuizzes(d.quizzes || [])
        setNeedsMigration(!!d.needsMigration)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  const avg = attempts.length ? attempts.reduce((a, b) => a + Number(b.score || 0), 0) / attempts.length : 0
  const quizAvg = quizzes.length ? Math.round((quizzes.reduce((a, q) => a + q.score / q.total, 0) / quizzes.length) * 100) : 0
  const streak = streakDays([...attempts.map((a) => a.created_at), ...quizzes.map((q) => q.created_at)])

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Interview Studio</h1>
          <p className="text-sm text-muted-foreground">Learn, practice and rehearse — with AI feedback on every answer.</p>
        </div>
        <InterviewNav />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: MessageSquare, label: "Answers reviewed", value: attempts.length },
            { icon: Target, label: "Avg answer score", value: attempts.length ? `${avg.toFixed(1)}/10` : "—" },
            { icon: Trophy, label: "Avg test score", value: quizzes.length ? `${quizAvg}%` : "—" },
            { icon: Flame, label: "Day streak", value: streak },
          ].map((s) => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-4">
                <s.icon className="w-4 h-4 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{loaded ? s.value : "…"}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {MODES.map((m) => (
            <Link key={m.href} href={m.href} className="group">
              <div className={`h-full rounded-2xl border border-border bg-gradient-to-br ${m.tint} to-card p-6 hover-lift`}>
                <m.icon className="w-6 h-6 text-primary" />
                <h2 className="mt-3 text-lg font-semibold text-foreground">{m.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{m.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {needsMigration && (
          <p className="mb-6 text-xs text-amber-700 dark:text-amber-400 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            Practice history isn&apos;t being saved yet — run <code>scripts/schema_v4_additions.sql</code> in Supabase to enable it.
          </p>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent answers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {attempts.length === 0 && <p className="text-xs text-muted-foreground">No answers yet — start with the question bank.</p>}
              {attempts.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{a.question}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {a.mode === "video" ? <Video className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                      <Clock className="w-3 h-3 ml-1" /> {new Date(a.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${scoreColor(Number(a.score))}`}>{Number(a.score).toFixed(1)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent tests</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {quizzes.length === 0 && <p className="text-xs text-muted-foreground">No tests yet — try a skill test.</p>}
              {quizzes.slice(0, 8).map((q) => (
                <div key={q.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{q.quiz_title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(q.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-bold text-foreground">{q.score}/{q.total}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
