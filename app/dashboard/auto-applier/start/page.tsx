"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Zap,
  AlertCircle,
  CheckCircle2,
  Globe,
  Play,
  Square,
  Send,
  FileUp,
  UserCog,
  ChevronDown,
  ArrowRight,
  Bot,
  MousePointerClick,
  XCircle,
  History,
  ExternalLink,
} from "lucide-react"

const JOB_PRESETS = [
  { name: "LinkedIn", url: "https://www.linkedin.com/jobs", icon: "💼" },
  { name: "Indeed", url: "https://www.indeed.com", icon: "🔍" },
  { name: "Wellfound", url: "https://wellfound.com/jobs", icon: "🚀" },
  { name: "Glassdoor", url: "https://www.glassdoor.com/Job", icon: "🏢" },
  { name: "Greenhouse", url: "https://boards.greenhouse.io", icon: "🌱" },
  { name: "Lever", url: "https://jobs.lever.co", icon: "⚙️" },
]

const PROFILE_FIELDS: { key: string; label: string; placeholder?: string; wide?: boolean }[] = [
  { key: "full_name", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone", placeholder: "+1 555 123 4567" },
  { key: "location", label: "Location", placeholder: "City, Country" },
  { key: "linkedin", label: "LinkedIn URL" },
  { key: "github", label: "GitHub URL" },
  { key: "portfolio", label: "Portfolio / website" },
  { key: "current_company", label: "Current company" },
  { key: "current_title", label: "Current title" },
  { key: "years_experience", label: "Years of experience" },
  { key: "work_authorization", label: "Work authorization", placeholder: "e.g. US citizen / H-1B / EU citizen" },
  { key: "requires_sponsorship", label: "Needs visa sponsorship?", placeholder: "Yes / No" },
  { key: "willing_to_relocate", label: "Willing to relocate?", placeholder: "Yes / No" },
  { key: "notice_period", label: "Notice period", placeholder: "e.g. 2 weeks" },
  { key: "salary_expectation", label: "Salary expectation" },
  { key: "pronouns", label: "Pronouns (optional)" },
  { key: "gender", label: "Gender (optional, EEO)", placeholder: "Leave blank to decline" },
  { key: "race_ethnicity", label: "Race / ethnicity (optional, EEO)", placeholder: "Leave blank to decline" },
  { key: "veteran_status", label: "Veteran status (optional, EEO)", placeholder: "Leave blank to decline" },
  { key: "disability_status", label: "Disability status (optional, EEO)", placeholder: "Leave blank to decline" },
  {
    key: "extra_notes",
    label: "Anything else the agent should know",
    placeholder: "e.g. Available to start in March. Prefer remote. Always answer 'How did you hear about us' with LinkedIn.",
    wide: true,
  },
]

type AgentStatus = "continue" | "ready_to_submit" | "needs_user" | "done"

interface StepAction {
  kind: string
  target?: string
  value?: string
  ok: boolean
  error?: string
}

interface StepResult {
  url: string
  title: string
  plan: { page_type: string; job?: { title?: string; company?: string }; submit_id: string | null } | null
  actions: StepAction[]
  status: AgentStatus
  message: string
  unanswered: string[]
}

interface LogEntry {
  id: number
  at: Date
  kind: "info" | "step" | "error" | "success"
  message: string
  actions?: StepAction[]
}

interface Session {
  taskId: string
  liveViewUrl: string
}

const MAX_AUTO_STEPS = 8

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "")
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export default function AutoApplierPage() {
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [targetUrl, setTargetUrl] = useState("")
  const [session, setSession] = useState<Session | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null)
  const [unanswered, setUnanswered] = useState<string[]>([])
  const [instructions, setInstructions] = useState("")
  const [navUrl, setNavUrl] = useState("")
  const [job, setJob] = useState<{ title: string; company: string }>({ title: "", company: "" })
  const [applied, setApplied] = useState(false)

  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [hasSavedResume, setHasSavedResume] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<Record<string, string>>({})
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [recent, setRecent] = useState<any[]>([])

  const stopRequested = useRef(false)
  const appliedRef = useRef(false)
  const logId = useRef(0)

  const addLog = useCallback((entry: Omit<LogEntry, "id" | "at">) => {
    setLog((prev) => [{ ...entry, id: ++logId.current, at: new Date() }, ...prev].slice(0, 60))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const url = params.get("url")
    if (url) setTargetUrl(url)

    fetch("/api/auto/sessions")
      .then((r) => r.json())
      .then((d) => {
        setConfigured(!!d.configured)
        setRecent(d.tasks || [])
      })
      .catch(() => setConfigured(false))
    fetch("/api/profile/application")
      .then((r) => r.json())
      .then((d) => setProfile(d.profile || {}))
      .catch(() => {})
    fetch("/api/resumes/latest")
      .then((r) => r.json())
      .then((d) => setHasSavedResume(!!d.resume?.text))
      .catch(() => setHasSavedResume(false))
  }, [])

  const profileMissing = ["full_name", "email", "phone"].filter((k) => !profile[k]?.trim())

  const saveProfile = async () => {
    const res = await fetch("/api/profile/application", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    })
    if (res.ok) {
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error || "Failed to save profile")
    }
  }

  const startSession = async (url: string) => {
    if (!url.trim()) {
      setError("Enter a job URL or pick a job site")
      return
    }
    setIsStarting(true)
    setError(null)
    setLog([])
    setAgentStatus(null)
    setUnanswered([])
    setApplied(false)
    appliedRef.current = false
    setJob({ title: "", company: "" })
    try {
      const res = await fetch("/api/auto/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to start browser")
      setSession({ taskId: data.taskId, liveViewUrl: data.liveViewUrl })
      setNavUrl(url.trim())
      addLog({ kind: "info", message: `Browser started and opened ${new URL(url.trim()).hostname}` })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start")
    } finally {
      setIsStarting(false)
    }
  }

  const runStep = async (mode: "fill" | "submit"): Promise<StepResult | null> => {
    if (!session) return null
    const payload: Record<string, unknown> = { mode, instructions: instructions || undefined }
    if (resumeFile) {
      payload.resumeFile = {
        name: resumeFile.name,
        mimeType: resumeFile.type || "application/pdf",
        base64: await fileToBase64(resumeFile),
      }
    }
    const res = await fetch(`/api/auto/sessions/${session.taskId}/step`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Agent step failed")
    return data.result as StepResult
  }

  const runAgent = async (mode: "fill" | "submit" = "fill") => {
    if (!session || isRunning) return
    setIsRunning(true)
    setError(null)
    stopRequested.current = false
    let currentMode = mode
    try {
      for (let i = 0; i < MAX_AUTO_STEPS && !stopRequested.current; i++) {
        addLog({ kind: "info", message: i === 0 ? "Agent is reading the page…" : "Reading the next page…" })
        const result = await runStep(currentMode)
        if (!result) break
        currentMode = "fill"
        if (result.plan?.job?.title || result.plan?.job?.company) {
          setJob((prev) => ({
            title: result.plan?.job?.title || prev.title,
            company: result.plan?.job?.company || prev.company,
          }))
        }
        setNavUrl(result.url)
        setAgentStatus(result.status)
        setUnanswered(result.unanswered)
        addLog({
          kind: result.status === "done" ? "success" : "step",
          message: result.message || `Page: ${result.title}`,
          actions: result.actions,
        })
        if (result.status === "done") {
          await markApplied()
          break
        }
        if (result.status !== "continue") break
      }
      if (stopRequested.current) addLog({ kind: "info", message: "Paused. You have control." })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Agent failed"
      setError(message)
      addLog({ kind: "error", message })
    } finally {
      setIsRunning(false)
    }
  }

  const submitApplication = async () => {
    if (!window.confirm("Submit this application now? Review the form in the browser first.")) return
    await runAgent("submit")
  }

  const goTo = async () => {
    if (!session || !navUrl.trim()) return
    setError(null)
    const res = await fetch(`/api/auto/sessions/${session.taskId}/navigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: navUrl.trim() }),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error || "Navigation failed")
    else {
      setAgentStatus(null)
      addLog({ kind: "info", message: `Navigated to ${data.url}` })
    }
  }

  const markApplied = async () => {
    if (!session || appliedRef.current) return
    appliedRef.current = true
    const res = await fetch(`/api/auto/sessions/${session.taskId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobTitle: job.title, company: job.company, release: false }),
    })
    if (res.ok) {
      setApplied(true)
      addLog({ kind: "success", message: "Logged in your Job Tracker 🎉" })
    } else {
      appliedRef.current = false
      const d = await res.json().catch(() => ({}))
      setError(d.error || "Failed to log application")
    }
  }

  const endSession = async () => {
    stopRequested.current = true
    if (session) await fetch(`/api/auto/sessions/${session.taskId}`, { method: "DELETE" }).catch(() => {})
    setSession(null)
    setAgentStatus(null)
    fetch("/api/auto/sessions")
      .then((r) => r.json())
      .then((d) => setRecent(d.tasks || []))
      .catch(() => {})
  }

  // Release the cloud browser if the user closes the tab or leaves this page.
  const sessionRef = useRef<Session | null>(null)
  sessionRef.current = session
  useEffect(() => {
    const release = () => {
      if (sessionRef.current) navigator.sendBeacon?.(`/api/auto/sessions/${sessionRef.current.taskId}`)
    }
    window.addEventListener("pagehide", release)
    return () => {
      window.removeEventListener("pagehide", release)
      release()
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Live session view
  // ---------------------------------------------------------------------------
  if (session) {
    return (
      <div className="p-4 md:p-6 animate-fade-in">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4">
          {/* Browser */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/40">
              <div className="flex gap-1.5 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <Input
                value={navUrl}
                onChange={(e) => setNavUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goTo()}
                className="h-8 text-xs bg-background"
                placeholder="https://…"
              />
              <Button size="sm" variant="outline" className="h-8" onClick={goTo} disabled={isRunning}>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <span className="hidden md:flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap px-2">
                <MousePointerClick className="w-3.5 h-3.5" /> You can click & type in the browser
              </span>
            </div>
            <div className="relative w-full bg-black" style={{ aspectRatio: "1280 / 800" }}>
              <iframe
                src={session.liveViewUrl}
                className="absolute inset-0 w-full h-full border-0"
                title="Applyo live browser"
                allow="clipboard-read; clipboard-write; fullscreen"
              />
              {isRunning && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                  <Spinner className="w-3 h-3" /> AI is working — hands off for a moment
                </div>
              )}
            </div>
          </Card>

          {/* Agent panel */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" /> Application Agent
                </CardTitle>
                <CardDescription className="text-xs">
                  The agent fills forms and clicks through steps. It never submits without your approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Job title"
                    value={job.title}
                    onChange={(e) => setJob({ ...job, title: e.target.value })}
                    className="h-8 text-xs bg-muted"
                  />
                  <Input
                    placeholder="Company"
                    value={job.company}
                    onChange={(e) => setJob({ ...job, company: e.target.value })}
                    className="h-8 text-xs bg-muted"
                  />
                </div>

                <Textarea
                  placeholder="Optional instructions, e.g. 'Answer yes to relocation' or 'Apply to the first Senior Frontend role on this page'"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-16 text-xs bg-muted resize-none"
                />

                {isRunning ? (
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    onClick={() => {
                      stopRequested.current = true
                    }}
                  >
                    <Square className="w-4 h-4 mr-2" /> Pause after this step
                  </Button>
                ) : (
                  <Button className="w-full h-10" onClick={() => runAgent("fill")}>
                    <Play className="w-4 h-4 mr-2" />
                    {agentStatus ? "Continue with AI" : "Let AI fill this application"}
                  </Button>
                )}

                {agentStatus === "ready_to_submit" && !isRunning && (
                  <div className="rounded-lg border border-emerald-300/50 bg-emerald-50 dark:bg-emerald-950/20 p-3 space-y-2">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      Form is filled. Review it in the browser, then submit.
                    </p>
                    <Button className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={submitApplication}>
                      <Send className="w-4 h-4 mr-2" /> Submit application
                    </Button>
                  </div>
                )}

                {unanswered.length > 0 && !isRunning && (
                  <div className="rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-3">
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">Needs your attention</p>
                    <ul className="space-y-1">
                      {unanswered.map((u, i) => (
                        <li key={i} className="text-[11px] text-amber-700 dark:text-amber-400">
                          • {u}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Handle it directly in the browser, then press “Continue with AI”.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-xs text-destructive">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="h-9 text-xs"
                    onClick={markApplied}
                    disabled={applied || isRunning}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    {applied ? "Logged" : "Mark as applied"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 text-xs text-destructive hover:text-destructive"
                    onClick={endSession}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> End session
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Activity</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[420px] overflow-y-auto space-y-2">
                {log.length === 0 && <p className="text-xs text-muted-foreground">No activity yet.</p>}
                {log.map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-lg border p-2.5 text-xs ${
                      entry.kind === "error"
                        ? "border-destructive/30 bg-destructive/5"
                        : entry.kind === "success"
                          ? "border-emerald-300/50 bg-emerald-50 dark:bg-emerald-950/20"
                          : "border-border bg-muted/40"
                    }`}
                  >
                    <div className="flex justify-between gap-2">
                      <span className="text-foreground">{entry.message}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {entry.at.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>
                    {entry.actions && entry.actions.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {entry.actions.map((a, i) => (
                          <li key={i} className={`text-[11px] ${a.ok ? "text-muted-foreground" : "text-destructive"}`}>
                            {a.ok ? "✓" : "✗"} {a.kind} <span className="font-medium">{a.target}</span>
                            {a.value ? ` → ${a.value}` : ""}
                            {a.error ? ` (${a.error})` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Setup view
  // ---------------------------------------------------------------------------
  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="animate-slide-up flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/50 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">AI Auto-Applier</h1>
            <p className="text-sm text-muted-foreground">
              A live cloud browser inside Applyo. AI fills the application, you stay in control.
            </p>
          </div>
        </div>

        {configured === false && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-300/50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              The browser backend isn’t configured. Add <code className="font-mono">STEEL_API_KEY</code> (from
              steel.dev) to the server environment and restart.
            </p>
          </div>
        )}

        {/* Readiness */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCog className="w-4 h-4 text-primary" /> What the agent will use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs">
                <p className="font-medium text-foreground mb-1">Resume text</p>
                {hasSavedResume === null ? (
                  <p className="text-muted-foreground">Checking…</p>
                ) : hasSavedResume ? (
                  <p className="text-emerald-600 dark:text-emerald-400">✓ Using your latest saved resume</p>
                ) : (
                  <p className="text-amber-600">
                    No saved resume — upload one in the Resume Improver (or any tool’s “Save resume”) first.
                  </p>
                )}
              </div>
              <label className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs cursor-pointer hover:border-primary/40 block">
                <p className="font-medium text-foreground mb-1 flex items-center gap-1.5">
                  <FileUp className="w-3.5 h-3.5" /> Resume file for uploads
                </p>
                <p className="text-muted-foreground truncate">
                  {resumeFile ? `✓ ${resumeFile.name}` : "Click to attach a PDF/DOCX (kept only in this tab)"}
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3 text-xs hover:border-primary/30"
            >
              <span className="font-medium text-foreground">
                Application profile{" "}
                {profileMissing.length > 0 ? (
                  <span className="text-amber-600 font-normal">— missing {profileMissing.join(", ")}</span>
                ) : (
                  <span className="text-emerald-600 font-normal">— ready</span>
                )}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PROFILE_FIELDS.map((f) => (
                    <div key={f.key} className={f.wide ? "md:col-span-2" : ""}>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">{f.label}</Label>
                      {f.wide ? (
                        <Textarea
                          value={profile[f.key] || ""}
                          placeholder={f.placeholder}
                          onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                          className="min-h-16 text-xs bg-muted resize-none"
                        />
                      ) : (
                        <Input
                          value={profile[f.key] || ""}
                          placeholder={f.placeholder}
                          onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
                          className="h-9 text-xs bg-muted"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button size="sm" onClick={saveProfile}>
                  {profileSaved ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : null}
                  {profileSaved ? "Saved" : "Save profile"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Start */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Open a job
            </CardTitle>
            <CardDescription className="text-xs">
              Paste a job posting or application link (Greenhouse, Lever, Ashby, Workday, company careers pages work
              best) — or open a job board and browse yourself.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://boards.greenhouse.io/company/jobs/123"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startSession(targetUrl)}
                disabled={isStarting}
                className="h-10 text-sm bg-muted"
              />
              <Button onClick={() => startSession(targetUrl)} disabled={isStarting || configured === false} className="h-10">
                {isStarting ? <Spinner className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isStarting ? "Starting…" : "Open"}
              </Button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {JOB_PRESETS.map((p) => (
                <button
                  key={p.url}
                  onClick={() => startSession(p.url)}
                  disabled={isStarting || configured === false}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border bg-muted/50 hover:border-primary/30 hover:bg-primary/5 smooth-hover disabled:opacity-50"
                >
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-[11px] font-medium text-foreground">{p.name}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/15">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs text-muted-foreground">
            <p><span className="text-primary font-semibold">1.</span> Applyo opens a real Chrome browser in the cloud and streams it here — you can click and type in it.</p>
            <p><span className="text-primary font-semibold">2.</span> Log in to job sites yourself if needed (the agent never sees your passwords).</p>
            <p><span className="text-primary font-semibold">3.</span> Press “Let AI fill this application” — it clicks Apply, fills fields from your profile & resume, uploads your CV and walks through multi-step forms.</p>
            <p><span className="text-primary font-semibold">4.</span> Review, then approve submission. The application is logged in your Job Tracker.</p>
          </CardContent>
        </Card>

        {recent.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Recent sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {recent.slice(0, 8).map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 text-xs border border-border rounded-lg p-2.5">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {t.job_title ? `${t.job_title}${t.company_name ? ` @ ${t.company_name}` : ""}` : t.target_url}
                    </p>
                    <p className="text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="capitalize px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t.status}</span>
                    <a href={t.target_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
