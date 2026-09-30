"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InterviewNav } from "@/components/interview/interview-nav"
import { AI_QUIZ_KEY, QUIZ_BEST_KEY, getQuiz, type Quiz } from "@/lib/interview/quizzes"

type Phase = "intro" | "running" | "done"

/** Renders `inline code` spans inside quiz text. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="font-mono text-[0.9em] bg-muted px-1 py-0.5 rounded">{part.slice(1, -1)}</code>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

export default function QuizRunnerPage() {
  const { id } = useParams<{ id: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [missing, setMissing] = useState(false)
  const [phase, setPhase] = useState<Phase>("intro")
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [revealed, setRevealed] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const [startedAt, setStartedAt] = useState(0)

  useEffect(() => {
    if (id === "ai") {
      try {
        const raw = sessionStorage.getItem(AI_QUIZ_KEY)
        if (raw) return setQuiz(JSON.parse(raw))
      } catch {}
      setMissing(true)
      return
    }
    const q = getQuiz(id)
    if (q) setQuiz(q)
    else setMissing(true)
  }, [id])

  const start = () => {
    if (!quiz) return
    setAnswers(Array(quiz.questions.length).fill(null))
    setIndex(0)
    setRevealed(false)
    setRemaining(quiz.minutes * 60)
    setStartedAt(Date.now())
    setPhase("running")
  }

  // Countdown
  useEffect(() => {
    if (phase !== "running") return
    if (remaining <= 0) {
      finish()
      return
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, remaining])

  const score = useMemo(
    () => (quiz ? answers.reduce<number>((acc, a, i) => acc + (a === quiz.questions[i].answer ? 1 : 0), 0) : 0),
    [answers, quiz],
  )

  const finish = () => {
    if (!quiz) return
    setPhase("done")
    const pct = Math.round((score / quiz.questions.length) * 100)
    try {
      const best = JSON.parse(localStorage.getItem(QUIZ_BEST_KEY) || "{}")
      if (quiz.id !== "ai" && (best[quiz.id] ?? -1) < pct) {
        best[quiz.id] = pct
        localStorage.setItem(QUIZ_BEST_KEY, JSON.stringify(best))
      }
    } catch {}
    fetch("/api/interview/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: quiz.id,
        title: quiz.title,
        score,
        total: quiz.questions.length,
        durationSec: Math.round((Date.now() - startedAt) / 1000),
      }),
    }).catch(() => {})
  }

  const choose = (option: number) => {
    if (revealed) return
    const next = [...answers]
    next[index] = option
    setAnswers(next)
    setRevealed(true)
  }

  const nextQuestion = () => {
    if (!quiz) return
    if (index + 1 >= quiz.questions.length) finish()
    else {
      setIndex(index + 1)
      setRevealed(false)
    }
  }

  const header = (
    <div className="mb-6">
      <Link href="/dashboard/interview/tests" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2">
        <ChevronLeft className="w-3.5 h-3.5" /> All tests
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{quiz?.title || "Skill test"}</h1>
    </div>
  )

  if (missing) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        {header}
        <p className="text-sm text-muted-foreground">This test isn&apos;t available. <Link href="/dashboard/interview/tests" className="text-primary underline">Choose another test</Link>.</p>
      </div>
    )
  }
  if (!quiz) return <div className="p-8 text-sm text-muted-foreground">Loading…</div>

  const q = quiz.questions[index]
  const mmss = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        {header}
        <InterviewNav />

        {phase === "intro" && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center">
            <p className="text-muted-foreground">{quiz.description}</p>
            <div className="mt-5 flex justify-center gap-6 text-sm text-foreground">
              <span>{quiz.questions.length} questions</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {quiz.minutes} minutes</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">You&apos;ll see the correct answer and an explanation after each question.</p>
            <Button className="mt-6 gap-1.5" size="lg" onClick={start}>Start test <ArrowRight className="w-4 h-4" /></Button>
          </div>
        )}

        {phase === "running" && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>Question {index + 1} of {quiz.questions.length}</span>
              <span className={`flex items-center gap-1 font-medium ${remaining < 60 ? "text-destructive" : ""}`}><Clock className="w-3.5 h-3.5" /> {mmss}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-6">
              <div className="h-full bg-primary transition-all" style={{ width: `${(index / quiz.questions.length) * 100}%` }} />
            </div>
            <h2 className="text-lg font-semibold text-foreground"><Rich text={q.q} /></h2>
            <div className="mt-5 space-y-2">
              {q.options.map((opt, i) => {
                const picked = answers[index] === i
                const correct = i === q.answer
                const style = !revealed
                  ? "border-border hover:border-primary/50 hover:bg-primary/5"
                  : correct
                    ? "border-emerald-500 bg-emerald-500/10"
                    : picked
                      ? "border-red-500 bg-red-500/10"
                      : "border-border opacity-60"
                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={revealed}
                    className={`w-full text-left rounded-xl border-2 px-4 py-3 text-sm text-foreground transition-colors flex items-center gap-3 ${style}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-current/30 flex items-center justify-center text-xs shrink-0">{String.fromCharCode(65 + i)}</span>
                    <span className="flex-1"><Rich text={opt} /></span>
                    {revealed && correct && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {revealed && picked && !correct && <XCircle className="w-4 h-4 text-red-500" />}
                  </button>
                )
              })}
            </div>
            {revealed && (
              <div className="mt-5 rounded-xl bg-muted p-4 text-sm text-foreground animate-fade-in">
                <span className="font-semibold">{answers[index] === q.answer ? "Correct! " : "Not quite. "}</span>
                {q.explain}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <Button onClick={nextQuestion} disabled={!revealed} className="gap-1.5">
                {index + 1 >= quiz.questions.length ? "See results" : "Next"} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center">
              <Trophy className="w-10 h-10 text-primary mx-auto" />
              <p className="mt-3 text-4xl font-bold text-foreground">{score}/{quiz.questions.length}</p>
              <p className="text-muted-foreground mt-1">
                {Math.round((score / quiz.questions.length) * 100)}% ·{" "}
                {score / quiz.questions.length >= 0.8 ? "Excellent — you're interview-ready on this topic." : score / quiz.questions.length >= 0.6 ? "Solid. Review the misses below." : "Worth revisiting — study the explanations below."}
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <Button variant="outline" onClick={start} className="gap-1.5"><RotateCcw className="w-4 h-4" /> Retake</Button>
                <Link href="/dashboard/interview/tests"><Button className="gap-1.5">More tests <ArrowRight className="w-4 h-4" /></Button></Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <p className="text-sm font-semibold text-foreground">Review</p>
              {quiz.questions.map((qq, i) => {
                const ok = answers[i] === qq.answer
                return (
                  <div key={i} className={`rounded-xl border p-3 text-sm ${ok ? "border-emerald-500/30" : "border-red-500/30"}`}>
                    <p className="font-medium text-foreground flex gap-2">
                      {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                      <span><Rich text={qq.q} /></span>
                    </p>
                    {!ok && (
                      <p className="text-xs text-muted-foreground mt-1 ml-6">
                        {answers[i] != null ? <>Your answer: {qq.options[answers[i]!]} · </> : "Not answered · "}
                        Correct: <span className="text-foreground">{qq.options[qq.answer]}</span>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 ml-6">{qq.explain}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
