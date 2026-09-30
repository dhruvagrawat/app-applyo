"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Clock, ListChecks, Sparkles, ArrowRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InterviewNav } from "@/components/interview/interview-nav"
import { AI_QUIZ_KEY, QUIZ_BEST_KEY as BEST_KEY, QUIZZES } from "@/lib/interview/quizzes"




export default function TestsPage() {
  const router = useRouter()
  const [topic, setTopic] = useState("")
  const [level, setLevel] = useState("intermediate")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [best, setBest] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      setBest(JSON.parse(localStorage.getItem(BEST_KEY) || "{}"))
    } catch {}
  }, [])

  const generate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/interview/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, count: 10 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Couldn't generate quiz")
      sessionStorage.setItem(AI_QUIZ_KEY, JSON.stringify(data.quiz))
      router.push("/dashboard/interview/tests/ai")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate quiz")
      setLoading(false)
    }
  }

  const groups = Array.from(new Set(QUIZZES.map((q) => q.category)))

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Skill Tests</h1>
          <p className="text-sm text-muted-foreground">Timed multiple-choice tests with explanations. Find your weak spots before the interviewer does.</p>
        </div>
        <InterviewNav />

        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-card p-5 md:p-6 mb-8">
          <p className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Generate a test for anything</p>
          <p className="text-xs text-muted-foreground mt-1">React hooks, financial modeling, nursing triage, AWS basics, Excel formulas — any topic or role.</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} placeholder="Topic or role, e.g. 'Python for data analysts'" className="h-10 bg-background" />
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="h-10 sm:w-40 bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Button className="h-10 gap-1.5" onClick={generate} disabled={loading || !topic.trim()}>
              {loading ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />} {loading ? "Writing questions…" : "Generate test"}
            </Button>
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </div>

        {groups.map((g) => (
          <section key={g} className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{g}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {QUIZZES.filter((q) => q.category === g).map((q) => (
                <Link key={q.id} href={`/dashboard/interview/tests/${q.id}`} className="group">
                  <div className="h-full rounded-2xl border border-border bg-card p-5 hover-lift">
                    <ListChecks className="w-5 h-5 text-primary" />
                    <h3 className="mt-3 font-semibold text-foreground">{q.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{q.description}</p>
                    <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.questions.length} questions · {q.minutes} min</span>
                      {best[q.id] != null ? (
                        <span className="flex items-center gap-1 text-emerald-600"><Trophy className="w-3 h-3" /> Best {best[q.id]}%</span>
                      ) : (
                        <span className="flex items-center gap-1 text-primary font-medium">Start <ArrowRight className="w-3 h-3" /></span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
