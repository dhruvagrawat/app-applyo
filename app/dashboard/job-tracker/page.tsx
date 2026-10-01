"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Link2,
  Sparkles,
  MapPin,
  DollarSign,
  ExternalLink,
  ChevronDown,
  Search,
  Zap,
  FileText,
  MessageSquare,
  BarChart3,
  AlertTriangle,
  Target,
  LayoutList,
  Columns3,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { jobToDescription, setHandoff } from "@/lib/handoff"
import type { ParsedJob } from "@/lib/jobs/parse-job"

const STATUSES = [
  { value: "saved", label: "Saved", style: "bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
  { value: "applied", label: "Applied", style: "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  { value: "interviewing", label: "Interviewing", style: "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { value: "offer", label: "Offer", style: "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  { value: "rejected", label: "Rejected", style: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800" },
]

const statusStyle = (s: string) => STATUSES.find((x) => x.value === s)?.style || STATUSES[1].style

interface Job {
  id: string
  company_name: string
  job_title: string
  status: string
  applied_date: string | null
  created_at: string
  job_url?: string | null
  location?: string | null
  work_mode?: string | null
  employment_type?: string | null
  salary?: string | null
  seniority?: string | null
  summary?: string | null
  description?: string | null
  skills?: string[] | null
  requirements?: string[] | null
  red_flags?: string[] | null
  deadline?: string | null
  source?: string | null
  notes?: string | null
  match_score?: number | null
  next_action?: string | null
  next_action_date?: string | null
}

type Draft = Partial<ParsedJob> & { status: string; applied_date: string; notes?: string }

const today = () => new Date().toISOString().split("T")[0]

function daysSince(date: string | null) {
  if (!date) return null
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
}

export default function JobTrackerPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Smart add
  const [link, setLink] = useState("")
  const [pasteText, setPasteText] = useState("")
  const [showPaste, setShowPaste] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // List
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [view, setView] = useState<"list" | "board">("list")
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem("applyo:tracker-view") === "board") setView("board")
    } catch {}
  }, [])
  const switchView = (v: "list" | "board") => {
    setView(v)
    try {
      localStorage.setItem("applyo:tracker-view", v)
    } catch {}
  }
  const [scoring, setScoring] = useState<string | null>(null)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (error) throw error
      setJobs((data as Job[]) || [])
    } catch (err) {
      setError("Failed to load applications")
    } finally {
      setIsLoading(false)
    }
  }

  const parseLink = async () => {
    if (!link.trim() && !pasteText.trim()) return
    setIsParsing(true)
    setError(null)
    try {
      const res = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.trim() || undefined, text: pasteText.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Most common reason: LinkedIn/Indeed login walls — offer paste fallback.
        setShowPaste(true)
        throw new Error(data.error || "Couldn't read that job")
      }
      setDraft({ ...(data.job as ParsedJob), status: "saved", applied_date: today() })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parsing failed")
    } finally {
      setIsParsing(false)
    }
  }

  const startManual = () =>
    setDraft({ job_title: "", company_name: "", status: "applied", applied_date: today(), job_url: link.trim() || null })

  const saveDraft = async () => {
    if (!draft?.job_title?.trim() || !draft.company_name?.trim()) {
      setError("Job title and company are required")
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const row = {
        user_id: user.id,
        company_name: draft.company_name.trim(),
        job_title: draft.job_title.trim(),
        status: draft.status,
        applied_date: draft.status === "saved" ? null : draft.applied_date,
        job_url: draft.job_url || null,
        location: draft.location || null,
        work_mode: draft.work_mode || null,
        employment_type: draft.employment_type || null,
        salary: draft.salary || null,
        seniority: draft.seniority || null,
        summary: draft.summary || null,
        description: draft.description || null,
        skills: draft.skills || [],
        requirements: draft.requirements || [],
        red_flags: draft.red_flags || [],
        deadline: draft.deadline || null,
        source: draft.source || null,
        notes: draft.notes || null,
      }
      const { data, error } = await supabase.from("job_applications").insert([row]).select()
      if (error) throw error
      setJobs([data[0] as Job, ...jobs])
      setDraft(null)
      setLink("")
      setPasteText("")
      setShowPaste(false)
      setExpanded((data[0] as Job).id)
    } catch (err: any) {
      setError(
        err?.message?.includes("column")
          ? "Database needs updating — run scripts/schema_v3_additions.sql in Supabase."
          : err?.message || "Failed to save",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const updateJob = async (id: string, patch: Partial<Job>) => {
    const prev = jobs
    setJobs(jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)))
    const { error } = await supabase
      .from("job_applications")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
    if (error) {
      setJobs(prev)
      setError(error.message)
    }
  }

  const changeStatus = (job: Job, status: string) => {
    const patch: Partial<Job> = { status }
    if (status !== "saved" && !job.applied_date) patch.applied_date = today()
    updateJob(job.id, patch)
  }

  const deleteJob = async (id: string) => {
    if (!window.confirm("Delete this application?")) return
    await supabase.from("job_applications").delete().eq("id", id)
    setJobs(jobs.filter((j) => j.id !== id))
  }

  const scoreFit = async (job: Job) => {
    setScoring(job.id)
    setError(null)
    try {
      const r = await fetch("/api/resumes/latest").then((r) => r.json())
      if (!r.resume?.text) throw new Error("Save a resume first (use “Save” next to any resume box).")
      const res = await fetch("/api/core/job-resume-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: r.resume.text, jobDescription: jobToDescription(job) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Scoring failed")
      const score = Math.round(Number(data.result?.match_score) || 0)
      const gaps: string[] = data.result?.gaps || []
      await updateJob(job.id, {
        match_score: score,
        notes: job.notes || (gaps.length ? `Gaps to address:\n${gaps.map((g) => `• ${g}`).join("\n")}` : job.notes),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scoring failed")
    } finally {
      setScoring(null)
    }
  }

  const openTool = (job: Job, path: string) => {
    setHandoff({ jobDescription: jobToDescription(job), jobUrl: job.job_url || undefined })
    router.push(path)
  }

  const counts = STATUSES.reduce<Record<string, number>>(
    (acc, s) => ({ ...acc, [s.value]: jobs.filter((j) => j.status === s.value).length }),
    {},
  )
  const responseRate = (() => {
    const sent = jobs.filter((j) => j.status !== "saved").length
    const responded = jobs.filter((j) => ["interviewing", "offer"].includes(j.status)).length
    return sent ? Math.round((responded / sent) * 100) : 0
  })()

  const followUps = jobs.filter((j) => {
    const d = daysSince(j.applied_date)
    return j.status === "applied" && d !== null && d >= 7
  })

  const visible = jobs.filter((j) => {
    if (filter !== "all" && j.status !== filter) return false
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return [j.job_title, j.company_name, j.location, ...(j.skills || [])].some((v) => v?.toLowerCase().includes(q))
  })

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Job Tracker</h1>
            <p className="text-sm text-muted-foreground">Paste a job link — AI fills in the rest</p>
          </div>
        </div>

        {/* Stats */}
        {jobs.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 animate-slide-up">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setFilter(filter === s.value ? "all" : s.value)}
                className={`rounded-xl p-3 text-center border smooth-hover ${s.style} ${filter === s.value ? "ring-2 ring-primary" : ""}`}
              >
                <div className="text-lg font-bold">{counts[s.value]}</div>
                <div className="text-[10px] font-medium uppercase tracking-wide">{s.label}</div>
              </button>
            ))}
            <div className="rounded-xl p-3 text-center border border-border bg-muted/40">
              <div className="text-lg font-bold text-foreground">{responseRate}%</div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Response rate</div>
            </div>
          </div>
        )}

        {followUps.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {followUps.length} application{followUps.length > 1 ? "s have" : " has"} had no update for 7+ days — consider a
              follow-up: {followUps.slice(0, 3).map((j) => j.company_name).join(", ")}
              {followUps.length > 3 ? "…" : ""}
            </span>
          </div>
        )}

        {/* Smart add */}
        <Card className="bg-card border-border animate-slide-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Add a job
            </CardTitle>
            <CardDescription className="text-xs">
              Works with Greenhouse, Lever, Ashby, Workday, company career pages and most job boards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!draft && (
              <>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://jobs.lever.co/company/…"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && parseLink()}
                      className="h-10 pl-9 text-sm bg-muted border-border"
                      disabled={isParsing}
                    />
                  </div>
                  <Button onClick={parseLink} disabled={isParsing || (!link.trim() && !pasteText.trim())} className="h-10">
                    {isParsing ? <Spinner className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    {isParsing ? "Reading job…" : "Parse"}
                  </Button>
                </div>
                {showPaste && (
                  <Textarea
                    placeholder="Paste the job description here (useful for LinkedIn or pages behind a login)"
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    className="min-h-28 text-xs bg-muted border-border resize-none"
                  />
                )}
                <div className="flex gap-4 text-xs">
                  <button className="text-primary hover:underline" onClick={() => setShowPaste(!showPaste)}>
                    {showPaste ? "Hide text box" : "Paste description instead"}
                  </button>
                  <button className="text-muted-foreground hover:text-foreground hover:underline" onClick={startManual}>
                    Add manually
                  </button>
                </div>
              </>
            )}

            {draft && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">Job title</Label>
                    <Input value={draft.job_title || ""} onChange={(e) => setDraft({ ...draft, job_title: e.target.value })} className="h-9 text-sm bg-muted" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">Company</Label>
                    <Input value={draft.company_name || ""} onChange={(e) => setDraft({ ...draft, company_name: e.target.value })} className="h-9 text-sm bg-muted" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">Location</Label>
                    <Input value={draft.location || ""} onChange={(e) => setDraft({ ...draft, location: e.target.value })} className="h-9 text-sm bg-muted" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">Salary</Label>
                    <Input value={draft.salary || ""} onChange={(e) => setDraft({ ...draft, salary: e.target.value })} className="h-9 text-sm bg-muted" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">Status</Label>
                    <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                      <SelectTrigger className="h-9 text-sm bg-muted"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {draft.status !== "saved" && (
                    <div>
                      <Label className="text-[11px] text-muted-foreground mb-1 block">Applied on</Label>
                      <Input type="date" value={draft.applied_date} onChange={(e) => setDraft({ ...draft, applied_date: e.target.value })} className="h-9 text-sm bg-muted" />
                    </div>
                  )}
                </div>
                {draft.summary && <p className="text-xs text-muted-foreground">{draft.summary}</p>}
                {!!draft.skills?.length && (
                  <div className="flex flex-wrap gap-1.5">
                    {draft.skills.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s}</span>
                    ))}
                  </div>
                )}
                {!!draft.red_flags?.length && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">
                    ⚠ {draft.red_flags.join(" · ")}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={saveDraft} disabled={isSaving}>
                    {isSaving ? <Spinner className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Save to tracker
                  </Button>
                  <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">{error}</div>
            )}
          </CardContent>
        </Card>

        {/* List */}
        <Card className="bg-card border-border animate-slide-up">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base text-foreground">Applications</CardTitle>
                <CardDescription className="text-xs">
                  {visible.length} of {jobs.length} {filter !== "all" && `· ${filter}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative md:w-64 flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search title, company, skill…" value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-8 text-xs bg-muted" />
                </div>
                <div className="flex rounded-lg border border-border p-0.5 bg-muted/40" role="group" aria-label="View">
                  <button onClick={() => switchView("list")} title="List view" aria-pressed={view === "list"} className={`p-1.5 rounded-md ${view === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}><LayoutList className="w-4 h-4" /></button>
                  <button onClick={() => switchView("board")} title="Board view" aria-pressed={view === "board"} className={`p-1.5 rounded-md ${view === "board" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}><Columns3 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isLoading && view === "board" && jobs.length > 0 ? (
              <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-3 overflow-x-auto pb-2">
                {STATUSES.map((col) => {
                  const colJobs = visible.filter((j) => j.status === col.value)
                  return (
                    <div
                      key={col.value}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(col.value) }}
                      onDragLeave={() => setDragOver((d) => (d === col.value ? null : d))}
                      onDrop={(e) => {
                        e.preventDefault()
                        const job = jobs.find((j) => j.id === (dragId || e.dataTransfer.getData("text/plain")))
                        if (job && job.status !== col.value) changeStatus(job, col.value)
                        setDragId(null)
                        setDragOver(null)
                      }}
                      className={`rounded-xl border p-2 min-h-64 transition-colors ${dragOver === col.value ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}
                    >
                      <div className="flex items-center justify-between px-1.5 py-1 mb-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${col.style}`}>{col.label}</span>
                        <span className="text-[11px] text-muted-foreground">{colJobs.length}</span>
                      </div>
                      <div className="space-y-2">
                        {colJobs.map((job) => (
                          <div
                            key={job.id}
                            draggable
                            onDragStart={(e) => { setDragId(job.id); e.dataTransfer.setData("text/plain", job.id) }}
                            onDragEnd={() => { setDragId(null); setDragOver(null) }}
                            onClick={() => { switchView("list"); setExpanded(job.id) }}
                            className={`rounded-lg border border-border bg-card p-2.5 cursor-grab active:cursor-grabbing hover:border-primary/30 ${dragId === job.id ? "opacity-50" : ""}`}
                          >
                            <p className="text-xs font-medium text-foreground leading-snug">{job.job_title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{job.company_name}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                              {job.match_score != null && <span className="font-semibold text-foreground">{job.match_score}% fit</span>}
                              {job.location && <span className="truncate">{job.location}</span>}
                            </div>
                          </div>
                        ))}
                        {colJobs.length === 0 && <p className="text-[11px] text-muted-foreground text-center py-6">Drop here</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : isLoading ? (
              <div className="text-center py-12"><Spinner className="w-8 h-8 mx-auto text-primary" /></div>
            ) : visible.length === 0 ? (
              <div className="text-center py-14">
                <BookOpen className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">{jobs.length ? "No matches" : "No applications yet"}</p>
                <p className="text-xs text-muted-foreground">{jobs.length ? "Try a different filter" : "Paste a job link above to get started"}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visible.map((job) => {
                  const open = expanded === job.id
                  const age = daysSince(job.applied_date)
                  return (
                    <div key={job.id} className="border border-border bg-muted/40 rounded-xl smooth-hover hover:border-primary/20">
                      <div className="p-4 flex items-start gap-3">
                        <button className="min-w-0 flex-1 text-left" onClick={() => setExpanded(open ? null : job.id)}>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-foreground truncate">{job.job_title}</h4>
                            {job.match_score != null && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${job.match_score >= 75 ? "bg-emerald-500/15 text-emerald-600" : job.match_score >= 50 ? "bg-amber-500/15 text-amber-600" : "bg-red-500/15 text-red-600"}`}>
                                {job.match_score}% fit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {job.company_name}
                            {job.location && <> · <MapPin className="inline w-3 h-3" /> {job.location}</>}
                            {job.work_mode && <> · <span className="capitalize">{job.work_mode}</span></>}
                            {job.salary && <> · <DollarSign className="inline w-3 h-3" />{job.salary}</>}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                            {job.applied_date ? (
                              <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" />{new Date(job.applied_date).toLocaleDateString()}{age !== null && age > 0 && ` · ${age}d ago`}</span>
                            ) : (
                              <span>Saved {new Date(job.created_at).toLocaleDateString()}</span>
                            )}
                            {job.source && <span>· {job.source}</span>}
                            {job.deadline && <span className="text-amber-600">· Deadline {new Date(job.deadline).toLocaleDateString()}</span>}
                          </div>
                        </button>
                        <Select value={job.status} onValueChange={(v) => changeStatus(job, v)}>
                          <SelectTrigger className={`h-7 w-[124px] text-[11px] font-medium border ${statusStyle(job.status)}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <button onClick={() => setExpanded(open ? null : job.id)} className="h-7 w-7 flex items-center justify-center text-muted-foreground">
                          <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                      </div>

                      {open && (
                        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3 animate-fade-in">
                          {job.summary && <p className="text-xs text-muted-foreground">{job.summary}</p>}
                          {!!job.skills?.length && (
                            <div className="flex flex-wrap gap-1.5">
                              {job.skills.map((s) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{s}</span>)}
                            </div>
                          )}
                          {!!job.requirements?.length && (
                            <ul className="text-[11px] text-muted-foreground space-y-0.5">
                              {job.requirements.map((r, i) => <li key={i}>• {r}</li>)}
                            </ul>
                          )}
                          {!!job.red_flags?.length && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-400">⚠ {job.red_flags.join(" · ")}</p>
                          )}

                          <div>
                            <Label className="text-[11px] text-muted-foreground mb-1 block">Notes</Label>
                            <Textarea
                              defaultValue={job.notes || ""}
                              onBlur={(e) => e.target.value !== (job.notes || "") && updateJob(job.id, { notes: e.target.value })}
                              placeholder="Recruiter name, interview dates, thoughts…"
                              className="min-h-16 text-xs bg-background resize-none"
                            />
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => scoreFit(job)} disabled={scoring === job.id}>
                              {scoring === job.id ? <Spinner className="w-3.5 h-3.5 mr-1.5" /> : <Target className="w-3.5 h-3.5 mr-1.5" />}
                              {job.match_score != null ? "Re-score fit" : "Score my fit"}
                            </Button>
                            {job.job_url && (
                              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => router.push(`/dashboard/auto-applier/start?url=${encodeURIComponent(job.job_url!)}`)}>
                                <Zap className="w-3.5 h-3.5 mr-1.5" /> Auto-apply
                              </Button>
                            )}
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openTool(job, "/dashboard/cover-letter")}>
                              <FileText className="w-3.5 h-3.5 mr-1.5" /> Cover letter
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openTool(job, "/dashboard/interview-questions")}>
                              <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Interview prep
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openTool(job, "/dashboard/ats-checker")}>
                              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> ATS check
                            </Button>
                            {job.job_url && (
                              <a href={job.job_url} target="_blank" rel="noreferrer" className="inline-flex items-center h-8 px-3 text-xs rounded-md border border-border hover:bg-muted">
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Posting
                              </a>
                            )}
                            <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-destructive ml-auto" onClick={() => deleteJob(job.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
