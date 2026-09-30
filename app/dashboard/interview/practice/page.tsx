"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Shuffle, Mic, MicOff, Send, Sparkles, Lightbulb, CheckCircle2, Timer, Wand2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InterviewNav } from "@/components/interview/interview-nav"
import { FeedbackCard } from "@/components/interview/feedback-card"
import { QUESTION_BANK, QUESTION_CATEGORIES, type InterviewQuestion } from "@/lib/interview/questions"
import { useSpeechRecognition } from "@/lib/interview/use-speech"
import type { AnswerFeedback } from "@/lib/interview/types"

const PRACTICED_KEY = "applyo:practiced-questions"

type Q = Pick<InterviewQuestion, "id" | "question" | "tip" | "category"> & { difficulty?: string; custom?: boolean }

export default function PracticePage() {
  const [category, setCategory] = useState("all")
  const [difficulty, setDifficulty] = useState("all")
  const [search, setSearch] = useState("")
  const [custom, setCustom] = useState<Q[]>([])
  const [selected, setSelected] = useState<Q>(QUESTION_BANK[0])
  const [answer, setAnswer] = useState("")
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [practiced, setPracticed] = useState<Record<string, number>>({})
  const [seconds, setSeconds] = useState(0)
  const [timing, setTiming] = useState(false)
  const speech = useSpeechRecognition()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get("category")
    if (c && QUESTION_CATEGORIES.some((x) => x.slug === c)) {
      setCategory(c)
      const first = QUESTION_BANK.find((q) => q.category === c)
      if (first) setSelected(first)
    }
    try {
      setPracticed(JSON.parse(localStorage.getItem(PRACTICED_KEY) || "{}"))
      setRole(localStorage.getItem("applyo:interview-role") || "")
    } catch {}
  }, [])

  // Answer timer
  useEffect(() => {
    if (!timing) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [timing])

  // Merge dictated speech into the answer box
  useEffect(() => {
    if (speech.transcript) setAnswer(speech.transcript)
  }, [speech.transcript])

  const all: Q[] = useMemo(() => [...custom, ...QUESTION_BANK], [custom])
  const visible = all.filter((q) => {
    if (category === "ai" ? !q.custom : category !== "all" && q.category !== category) return false
    if (difficulty !== "all" && q.difficulty && q.difficulty !== difficulty) return false
    if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const pick = (q: Q) => {
    setSelected(q)
    setAnswer("")
    setFeedback(null)
    setError(null)
    setSeconds(0)
    setTiming(false)
    speech.stop()
    speech.reset()
  }

  const random = () => {
    const pool = visible.length ? visible : all
    pick(pool[Math.floor(Math.random() * pool.length)])
  }

  const toggleMic = () => {
    if (speech.listening) {
      speech.stop()
      setTiming(false)
    } else {
      speech.reset()
      speech.setTranscript(answer)
      speech.start()
      setTiming(true)
    }
  }

  const submit = async () => {
    speech.stop()
    setTiming(false)
    setLoading(true)
    setError(null)
    setFeedback(null)
    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: selected.question, answer, role, category: selected.category, mode: "text" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Feedback failed")
      setFeedback(data.feedback)
      const next = { ...practiced, [selected.id]: data.feedback.score }
      setPracticed(next)
      try {
        localStorage.setItem(PRACTICED_KEY, JSON.stringify(next))
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const generate = async () => {
    if (!role.trim()) {
      setError("Enter your target role to generate tailored questions")
      return
    }
    setGenerating(true)
    setError(null)
    try {
      localStorage.setItem("applyo:interview-role", role)
    } catch {}
    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, count: 8, type: "mixed" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      const qs: Q[] = data.questions.map((q: { question: string; tip: string; category: string }, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        question: q.question,
        tip: q.tip,
        category: q.category,
        custom: true,
      }))
      setCustom(qs)
      setCategory("ai")
      pick(qs[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const categoryName = (slug: string) => QUESTION_CATEGORIES.find((c) => c.slug === slug)?.name || slug
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0
  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Question Bank</h1>
          <p className="text-sm text-muted-foreground">
            {QUESTION_BANK.length} real interview questions. Answer in your own words — AI scores it and shows a stronger version.
          </p>
        </div>
        <InterviewNav />

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* Question list */}
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-3 space-y-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Wand2 className="w-3.5 h-3.5 text-primary" /> Tailor to your role</p>
              <div className="flex gap-2">
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Product Designer" className="h-9 text-xs bg-muted" onKeyDown={(e) => e.key === "Enter" && generate()} />
                <Button size="sm" className="h-9" onClick={generate} disabled={generating}>
                  {generating ? <Spinner className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions" className="h-9 pl-8 text-xs bg-muted" />
              </div>
              <Button variant="outline" size="sm" className="h-9" onClick={random} title="Random question"><Shuffle className="w-3.5 h-3.5" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-xs bg-muted"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {custom.length > 0 && <SelectItem value="ai">✨ Tailored for you</SelectItem>}
                  {QUESTION_CATEGORIES.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="h-9 text-xs bg-muted"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any difficulty</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {visible.length} questions · {Object.keys(practiced).length} practiced
            </p>
            <div className="rounded-xl border border-border bg-card divide-y divide-border max-h-[62vh] overflow-y-auto">
              {visible.map((q) => (
                <button
                  key={q.id}
                  onClick={() => pick(q)}
                  className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${selected.id === q.id ? "bg-primary/10" : "hover:bg-muted"}`}
                >
                  <div className="flex items-start gap-2">
                    {practiced[q.id] != null ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
                    <span className="text-foreground">{q.question}</span>
                  </div>
                  <div className="ml-5.5 pl-0.5 mt-1 flex gap-2 text-[10px] text-muted-foreground">
                    <span>{q.custom ? "Tailored" : categoryName(q.category)}</span>
                    {q.difficulty && <span className="capitalize">· {q.difficulty}</span>}
                    {practiced[q.id] != null && <span>· scored {practiced[q.id]}</span>}
                  </div>
                </button>
              ))}
              {visible.length === 0 && <p className="p-4 text-xs text-muted-foreground">No questions match.</p>}
            </div>
          </div>

          {/* Answer area */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                <span className="px-2 py-0.5 rounded-full bg-muted">{selected.custom ? "Tailored" : categoryName(selected.category)}</span>
                {selected.difficulty && <span className="capitalize">{selected.difficulty}</span>}
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-foreground">{selected.question}</h2>
              <p className="mt-3 text-xs text-muted-foreground flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> {selected.tip}
              </p>

              <div className="relative mt-5">
                <Textarea
                  value={speech.listening && speech.interim ? `${answer} ${speech.interim}` : answer}
                  onChange={(e) => {
                    setAnswer(e.target.value)
                    if (!timing && !seconds) setTiming(true)
                  }}
                  placeholder="Type your answer, or press the mic and say it out loud…"
                  className="min-h-48 text-sm bg-muted resize-y"
                  readOnly={speech.listening}
                />
                {speech.listening && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-500/10 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 rec-dot" /> Listening
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-3">
                  <span>{words} words</span>
                  <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {mmss}</span>
                  {words > 0 && seconds > 10 && <span>~{Math.round((words / seconds) * 60)} wpm</span>}
                </span>
                {!speech.supported && <span>Voice input works in Chrome, Edge and Safari.</span>}
              </div>

              {(error || speech.error) && <p className="mt-3 text-xs text-destructive">{error || speech.error}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={submit} disabled={loading || words < 5} className="gap-1.5">
                  {loading ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />} {loading ? "Reviewing…" : "Get AI feedback"}
                </Button>
                {speech.supported && (
                  <Button variant="outline" onClick={toggleMic} className="gap-1.5">
                    {speech.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />} {speech.listening ? "Stop" : "Answer by voice"}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => pick(selected)} className="gap-1.5 text-muted-foreground">
                  <RotateCcw className="w-4 h-4" /> Reset
                </Button>
                <Button variant="ghost" onClick={random} className="gap-1.5 text-muted-foreground ml-auto">
                  <Shuffle className="w-4 h-4" /> Next question
                </Button>
              </div>
            </div>

            {feedback && (
              <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <FeedbackCard feedback={feedback} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
