"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Video, VideoOff, Mic, Play, Square, RotateCcw, ArrowRight, Download, Sparkles, Timer, Volume2, AlertCircle,
  CheckCircle2, Camera, SkipForward,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InterviewNav } from "@/components/interview/interview-nav"
import { FeedbackCard, scoreColor } from "@/components/interview/feedback-card"
import { QUESTION_BANK } from "@/lib/interview/questions"
import { useSpeechRecognition } from "@/lib/interview/use-speech"
import { analyzeDelivery, paceLabel, type DeliveryMetrics } from "@/lib/interview/metrics"
import type { AnswerFeedback } from "@/lib/interview/types"

type Stage = "setup" | "think" | "record" | "review" | "report"

interface SessionQuestion {
  question: string
  tip: string
  category: string
}

interface Take {
  videoUrl: string | null
  mimeType: string
  transcript: string
  metrics: DeliveryMetrics
  feedback: AnswerFeedback | null
}

const TYPE_TO_CATEGORIES: Record<string, string[]> = {
  mixed: ["general", "behavioral", "situational", "career", "tricky"],
  behavioral: ["behavioral", "leadership", "teamwork", "problem-solving"],
  general: ["general", "career"],
  tricky: ["tricky"],
}

function pickQuestions(type: string, count: number): SessionQuestion[] {
  const cats = TYPE_TO_CATEGORIES[type] || TYPE_TO_CATEGORIES.mixed
  const pool = QUESTION_BANK.filter((q) => cats.includes(q.category))
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  // Always open with "Tell me about yourself" for mixed/general sessions.
  const opener = QUESTION_BANK.find((q) => q.id === "general-1")!
  const list = type === "mixed" || type === "general" ? [opener, ...shuffled.filter((q) => q.id !== opener.id)] : shuffled
  return list.slice(0, count).map((q) => ({ question: q.question, tip: q.tip, category: q.category }))
}

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return ""
  for (const t of ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ""
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`

export default function VideoInterviewPage() {
  // Setup
  const [role, setRole] = useState("")
  const [type, setType] = useState("mixed")
  const [count, setCount] = useState("5")
  const [thinkTime, setThinkTime] = useState("30")
  const [answerTime, setAnswerTime] = useState("120")
  const [source, setSource] = useState<"bank" | "ai">("bank")
  const [speakQuestions, setSpeakQuestions] = useState(true)
  const [preparing, setPreparing] = useState(false)

  // Media
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordStartRef = useRef(0)
  const durationRef = useRef(0)
  const [cameraOn, setCameraOn] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [level, setLevel] = useState(0)
  const [recordingSupported, setRecordingSupported] = useState(true)

  // Session
  const [stage, setStage] = useState<Stage>("setup")
  const [questions, setQuestions] = useState<SessionQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [takes, setTakes] = useState<(Take | null)[]>([])
  const [manualTranscript, setManualTranscript] = useState("")
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const speech = useSpeechRecognition()

  useEffect(() => {
    setRecordingSupported(typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia)
    try {
      setRole(localStorage.getItem("applyo:interview-role") || "")
    } catch {}
  }, [])

  // ── Camera ────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setMediaError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play().catch(() => {})
      }
      setCameraOn(true)
    } catch (err) {
      const name = (err as DOMException)?.name
      setMediaError(
        name === "NotAllowedError"
          ? "Camera/microphone permission was denied. Allow access in your browser's address bar and try again."
          : name === "NotFoundError"
            ? "No camera or microphone found."
            : "Couldn't access your camera. Make sure no other app is using it.",
      )
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOn(false)
  }, [])

  // Re-attach the live stream when the <video> remounts between stages.
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {})
    }
  })

  // Mic level meter
  useEffect(() => {
    if (!cameraOn || !streamRef.current) return
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    ctx.createMediaStreamSource(streamRef.current).connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)
    let raf = 0
    const tick = () => {
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (const v of data) sum += ((v - 128) / 128) ** 2
      setLevel(Math.min(1, Math.sqrt(sum / data.length) * 4))
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      cancelAnimationFrame(raf)
      ctx.close().catch(() => {})
    }
  }, [cameraOn])

  // Clean up on unmount
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    window.speechSynthesis?.cancel()
  }, [])

  // ── Session flow ─────────────────────────────────────────
  const speak = (text: string) => {
    if (!speakQuestions || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1
    window.speechSynthesis.speak(u)
  }

  const beginQuestion = (i: number, list = questions) => {
    setIndex(i)
    setManualTranscript("")
    setError(null)
    speech.reset()
    setCountdown(Number(thinkTime))
    setStage("think")
    speak(list[i].question)
  }

  const startSession = async () => {
    setError(null)
    if (!cameraOn) await startCamera()
    if (!streamRef.current) return
    setPreparing(true)
    let list: SessionQuestion[] = []
    try {
      if (role) localStorage.setItem("applyo:interview-role", role)
    } catch {}
    if (source === "ai" && role.trim()) {
      try {
        const res = await fetch("/api/interview/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, type, count: Number(count) }),
        })
        const data = await res.json()
        if (res.ok) list = data.questions.map((q: SessionQuestion) => ({ question: q.question, tip: q.tip, category: q.category }))
        else setError(data.error)
      } catch {}
    }
    if (!list.length) list = pickQuestions(type, Number(count))
    setQuestions(list)
    setTakes(Array(list.length).fill(null))
    setPreparing(false)
    beginQuestion(0, list)
  }

  const startRecording = () => {
    const stream = streamRef.current
    if (!stream) return
    window.speechSynthesis?.cancel()
    chunksRef.current = []
    const mimeType = pickMimeType()
    try {
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      rec.start(1000)
      recorderRef.current = rec
    } catch {
      recorderRef.current = null // still allow transcript-only practice
    }
    recordStartRef.current = Date.now()
    speech.start()
    setCountdown(Number(answerTime))
    setStage("record")
  }

  const stopRecording = useCallback(() => {
    const durationSec = (Date.now() - recordStartRef.current) / 1000
    speech.stop()
    const rec = recorderRef.current
    const finalize = () => {
      const mime = rec?.mimeType || "video/webm"
      const blob = chunksRef.current.length ? new Blob(chunksRef.current, { type: mime }) : null
      setTakes((prev) => {
        const next = [...prev]
        if (next[index]?.videoUrl) URL.revokeObjectURL(next[index]!.videoUrl!)
        next[index] = {
          videoUrl: blob ? URL.createObjectURL(blob) : null,
          mimeType: mime,
          transcript: "",
          metrics: analyzeDelivery("", durationSec),
          feedback: null,
        }
        return next
      })
      setStage("review")
    }
    if (rec && rec.state !== "inactive") {
      rec.onstop = finalize
      rec.stop()
    } else finalize()
    durationRef.current = durationSec
  }, [index, speech])

  // Countdown ticker
  useEffect(() => {
    if (stage !== "think" && stage !== "record") return
    if (countdown <= 0) {
      if (stage === "think") startRecording()
      else stopRecording()
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, countdown])

  // Once in review, attach the final transcript + metrics.
  useEffect(() => {
    if (stage !== "review") return
    const t = setTimeout(() => {
      setTakes((prev) => {
        const take = prev[index]
        const transcript = speech.transcript
        // Late results from the recognizer can still arrive — keep the longest transcript.
        if (!take || take.feedback || take.transcript.length >= transcript.length) return prev
        const next = [...prev]
        next[index] = { ...take, transcript, metrics: analyzeDelivery(transcript, durationRef.current) }
        return next
      })
    }, 600) // give the recognizer a moment to flush final results
    return () => clearTimeout(t)
  }, [stage, index, speech.transcript])

  const take = takes[index]
  const transcriptForFeedback = (take?.transcript || manualTranscript).trim()

  const getFeedback = async () => {
    if (!take) return
    const text = transcriptForFeedback
    if (text.split(/\s+/).length < 5) {
      setError("No transcript captured. Type a quick summary of what you said to get feedback.")
      return
    }
    setLoadingFeedback(true)
    setError(null)
    const metrics = take.transcript ? take.metrics : analyzeDelivery(text, take.metrics.durationSec)
    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[index].question,
          answer: text,
          role,
          mode: "video",
          category: questions[index].category,
          metrics: { durationSec: metrics.durationSec, wordsPerMinute: metrics.wordsPerMinute, fillerCount: metrics.fillerCount, fillers: metrics.fillers },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Feedback failed")
      setTakes((prev) => {
        const next = [...prev]
        next[index] = { ...next[index]!, transcript: text, metrics, feedback: data.feedback }
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Feedback failed")
    } finally {
      setLoadingFeedback(false)
    }
  }

  const next = () => {
    if (index + 1 < questions.length) beginQuestion(index + 1)
    else {
      setStage("report")
      window.speechSynthesis?.cancel()
    }
  }

  const reset = () => {
    takes.forEach((t) => t?.videoUrl && URL.revokeObjectURL(t.videoUrl))
    setTakes([])
    setQuestions([])
    setStage("setup")
  }

  const download = (t: Take, i: number) => {
    if (!t.videoUrl) return
    const a = document.createElement("a")
    a.href = t.videoUrl
    a.download = `applyo-interview-q${i + 1}.${t.mimeType.includes("mp4") ? "mp4" : "webm"}`
    a.click()
  }

  const scored = takes.filter((t): t is Take => !!t?.feedback)
  const avgScore = scored.length ? scored.reduce((a, t) => a + t.feedback!.score, 0) / scored.length : 0
  const answered = takes.filter(Boolean) as Take[]
  const avgWpm = answered.filter((t) => t.metrics.wordsPerMinute).length
    ? Math.round(answered.reduce((a, t) => a + t.metrics.wordsPerMinute, 0) / answered.filter((t) => t.metrics.wordsPerMinute).length)
    : 0
  const totalFillers = answered.reduce((a, t) => a + t.metrics.fillerCount, 0)

  // ── Render ───────────────────────────────────────────────
  const liveVideo = (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-900 border border-border">
      <video ref={videoRef} playsInline muted className="w-full h-full object-cover -scale-x-100" />
      {!cameraOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 gap-3">
          <VideoOff className="w-10 h-10" />
          <Button variant="secondary" size="sm" onClick={startCamera} className="gap-1.5"><Camera className="w-4 h-4" /> Turn on camera</Button>
        </div>
      )}
      {stage === "record" && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-black/60 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-red-500 rec-dot" /> REC · {fmt(countdown)} left
        </div>
      )}
      {stage === "think" && (
        <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white">
          <p className="text-xs uppercase tracking-widest text-white/70">Think time</p>
          <p className="text-6xl font-bold tabular-nums">{countdown}</p>
          <Button size="sm" className="mt-4 gap-1.5" onClick={startRecording}><Play className="w-4 h-4" /> Start answering now</Button>
        </div>
      )}
      {cameraOn && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1">
          <Mic className="w-3 h-3 text-white" />
          <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 transition-[width] duration-75" style={{ width: `${level * 100}%` }} />
          </div>
        </div>
      )}
      {stage === "record" && (speech.transcript || speech.interim) && (
        <div className="absolute bottom-3 right-3 left-28 rounded-xl bg-black/60 p-2.5 text-[11px] text-white/90 max-h-20 overflow-hidden">
          {speech.transcript.split(" ").slice(-30).join(" ")} <span className="text-white/50">{speech.interim}</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Video Mock Interview</h1>
          <p className="text-sm text-muted-foreground">Rehearse on camera like a real one-way video interview. Recordings never leave your browser.</p>
        </div>
        <InterviewNav />

        {!recordingSupported && (
          <p className="mb-4 text-xs text-amber-700 dark:text-amber-400 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            Your browser doesn&apos;t support video recording. Use a recent Chrome, Edge, Firefox or Safari.
          </p>
        )}
        {mediaError && (
          <p className="mb-4 text-xs text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {mediaError}</p>
        )}

        {stage === "setup" && (
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
            <div className="space-y-3">
              {liveVideo}
              <p className="text-xs text-muted-foreground">
                Check that you&apos;re well lit and centered, and that the mic bar moves when you speak.
                {!speech.supported && " Live transcripts need Chrome, Edge or Safari — elsewhere you can type a summary for feedback."}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div>
                <Label className="text-xs mb-1.5 block">Target role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Marketing Manager" className="h-10 bg-muted" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Interview type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-10 bg-muted"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed (realistic)</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="general">General & fit</SelectItem>
                      <SelectItem value="tricky">Tricky questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Questions</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger className="h-10 bg-muted"><SelectValue /></SelectTrigger>
                    <SelectContent>{["3", "5", "8"].map((n) => <SelectItem key={n} value={n}>{n} questions</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Think time</Label>
                  <Select value={thinkTime} onValueChange={setThinkTime}>
                    <SelectTrigger className="h-10 bg-muted"><SelectValue /></SelectTrigger>
                    <SelectContent>{["15", "30", "60"].map((n) => <SelectItem key={n} value={n}>{n} seconds</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Answer time</Label>
                  <Select value={answerTime} onValueChange={setAnswerTime}>
                    <SelectTrigger className="h-10 bg-muted"><SelectValue /></SelectTrigger>
                    <SelectContent>{[["60", "1 minute"], ["120", "2 minutes"], ["180", "3 minutes"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Questions from</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([["bank", "Question bank"], ["ai", "AI — tailored to role"]] as const).map(([v, l]) => (
                    <button key={v} onClick={() => setSource(v)} className={`rounded-lg border-2 px-3 py-2 text-xs font-medium ${source === v ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}>
                      {l}
                    </button>
                  ))}
                </div>
                {source === "ai" && !role.trim() && <p className="text-[11px] text-amber-600 mt-1">Enter a role for tailored questions.</p>}
              </div>
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={speakQuestions} onChange={(e) => setSpeakQuestions(e.target.checked)} className="accent-[var(--primary)]" />
                <Volume2 className="w-3.5 h-3.5" /> Read questions aloud (interviewer voice)
              </label>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button className="w-full h-11 gap-2" onClick={startSession} disabled={preparing || !recordingSupported}>
                {preparing ? <Spinner className="w-4 h-4" /> : <Video className="w-4 h-4" />} {preparing ? "Preparing questions…" : "Start interview"}
              </Button>
            </div>
          </div>
        )}

        {(stage === "think" || stage === "record") && questions[index] && (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
            {liveVideo}
            <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
              <p className="text-xs text-muted-foreground">Question {index + 1} of {questions.length}</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{questions[index].question}</h2>
              {stage === "think" && (
                <p className="mt-3 text-xs text-muted-foreground">💡 {questions[index].tip}</p>
              )}
              <div className="mt-auto pt-6 space-y-2">
                {stage === "record" ? (
                  <Button variant="destructive" className="w-full gap-2" onClick={stopRecording}><Square className="w-4 h-4" /> Finish answer</Button>
                ) : (
                  <Button className="w-full gap-2" onClick={startRecording}><Play className="w-4 h-4" /> Start answering</Button>
                )}
                <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Timer className="w-3 h-3" /> {stage === "think" ? `Recording starts automatically in ${countdown}s` : `Stops automatically at ${fmt(Number(answerTime))}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {stage === "review" && questions[index] && (
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
            <div className="space-y-3">
              {take?.videoUrl ? (
                <video src={take.videoUrl} controls playsInline className="w-full aspect-video rounded-2xl bg-black border border-border" />
              ) : (
                <div className="aspect-video rounded-2xl bg-muted flex items-center justify-center text-sm text-muted-foreground">No video captured for this answer</div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{fmt(take?.metrics.durationSec || 0)}</div>
                  <div className="text-[10px] text-muted-foreground">Length</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{take?.metrics.wordsPerMinute || "—"}</div>
                  <div className="text-[10px] text-muted-foreground">Words/min · {paceLabel(take?.metrics.wordsPerMinute || 0)}</div>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <div className={`text-lg font-bold ${(take?.metrics.fillerCount || 0) > 5 ? "text-amber-600" : "text-foreground"}`}>{take?.metrics.fillerCount ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground">Filler words</div>
                </div>
              </div>
              {take && Object.keys(take.metrics.fillers).length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Fillers: {Object.entries(take.metrics.fillers).map(([w, n]) => `“${w}” ×${n}`).join(", ")}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Question {index + 1} of {questions.length}</p>
                <h2 className="mt-1 font-semibold text-foreground">{questions[index].question}</h2>
              </div>
              {take?.transcript ? (
                <div>
                  <Label className="text-xs mb-1 block">Transcript</Label>
                  <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3 max-h-40 overflow-y-auto leading-relaxed">{take.transcript}</p>
                </div>
              ) : (
                <div>
                  <Label className="text-xs mb-1 block">No transcript captured — summarize what you said</Label>
                  <Textarea value={manualTranscript} onChange={(e) => setManualTranscript(e.target.value)} className="min-h-24 text-xs bg-muted" placeholder="Type the key points of your answer…" />
                </div>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
              {take?.feedback ? (
                <FeedbackCard feedback={take.feedback} compact />
              ) : (
                <Button className="w-full gap-2" onClick={getFeedback} disabled={loadingFeedback}>
                  {loadingFeedback ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />} {loadingFeedback ? "Analyzing your answer…" : "Get AI feedback"}
                </Button>
              )}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-1.5" onClick={() => beginQuestion(index)}><RotateCcw className="w-4 h-4" /> Retake</Button>
                <Button className="flex-1 gap-1.5" onClick={next}>
                  {index + 1 < questions.length ? <>Next question <ArrowRight className="w-4 h-4" /></> : <>Finish <CheckCircle2 className="w-4 h-4" /></>}
                </Button>
              </div>
              {!take?.feedback && (
                <button onClick={next} className="w-full text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1">
                  <SkipForward className="w-3 h-3" /> Skip feedback
                </button>
              )}
            </div>
          </div>
        )}

        {stage === "report" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Questions answered", `${answered.length}/${questions.length}`],
                ["Average score", scored.length ? `${avgScore.toFixed(1)}/10` : "—"],
                ["Average pace", avgWpm ? `${avgWpm} wpm` : "—"],
                ["Filler words", String(totalFillers)],
              ].map(([l, v]) => (
                <div key={l} className="rounded-2xl border border-border bg-card p-4">
                  <div className="text-2xl font-bold text-foreground">{v}</div>
                  <div className="text-xs text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => {
                const t = takes[i]
                return (
                  <div key={i} className="rounded-2xl border border-border bg-card p-4 flex flex-col md:flex-row gap-4">
                    {t?.videoUrl && <video src={t.videoUrl} controls playsInline className="md:w-64 aspect-video rounded-xl bg-black" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-foreground">{i + 1}. {q.question}</p>
                        {t?.feedback && <span className={`text-lg font-bold ${scoreColor(t.feedback.score)}`}>{t.feedback.score.toFixed(1)}</span>}
                      </div>
                      {t ? (
                        <>
                          <p className="text-xs text-muted-foreground mt-1">
                            {fmt(t.metrics.durationSec)} · {t.metrics.wordsPerMinute || "—"} wpm · {t.metrics.fillerCount} fillers
                          </p>
                          {t.feedback && <p className="text-xs text-foreground mt-2">{t.feedback.verdict}</p>}
                          {t.feedback?.improvements?.[0] && <p className="text-xs text-muted-foreground mt-1">Next time: {t.feedback.improvements[0]}</p>}
                          {t.videoUrl && (
                            <button onClick={() => download(t, i)} className="mt-2 text-xs text-primary inline-flex items-center gap-1"><Download className="w-3 h-3" /> Download recording</button>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">Skipped</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Button onClick={reset} className="gap-1.5"><RotateCcw className="w-4 h-4" /> New interview</Button>
              <Button variant="outline" onClick={stopCamera}>Turn off camera</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
