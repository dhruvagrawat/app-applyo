"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, Download, Sparkles, Plus, Trash2, ChevronUp, ChevronDown, Check, Cloud, CloudOff, Target, Wand2, X,
  User, Briefcase, GraduationCap, FolderGit2, Wrench, Award, AlignLeft, Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { JobLinkImporter } from "@/components/job-link-importer"
import { ResumePreview } from "@/components/resume/resume-preview"
import { setHandoff } from "@/lib/handoff"
import {
  ACCENTS, blankCertification, blankEducation, blankExperience, blankProject, blankSkill, normalizeResume,
  resumeCompleteness, resumeToText, type ResumeData, type ResumeTemplate,
} from "@/lib/resume/types"

type SaveState = "saved" | "saving" | "dirty" | "error"

const TEMPLATES: { id: ResumeTemplate; label: string }[] = [
  { id: "minimal", label: "Minimal" },
  { id: "classic", label: "Classic" },
  { id: "compact", label: "Compact" },
]

function Section({ icon: Icon, title, children, action }: { icon: React.ElementType; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="w-4 h-4 text-primary" /> {title}
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
        </button>
        {action}
      </div>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </section>
  )
}

function Field({ label, value, onChange, placeholder, className = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 text-sm bg-muted mt-1" />
    </label>
  )
}

function ItemControls({ onUp, onDown, onRemove }: { onUp?: () => void; onDown?: () => void; onRemove: () => void }) {
  return (
    <div className="flex gap-0.5">
      <button onClick={onUp} disabled={!onUp} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move up"><ChevronUp className="w-3.5 h-3.5" /></button>
      <button onClick={onDown} disabled={!onDown} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30" title="Move down"><ChevronDown className="w-3.5 h-3.5" /></button>
      <button onClick={onRemove} className="p-1 text-muted-foreground hover:text-destructive" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
  )
}

const move = <T,>(list: T[], i: number, dir: -1 | 1) => {
  const next = [...list]
  const j = i + dir
  if (j < 0 || j >= next.length) return list
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

/** One bullet with an AI rewrite button. */
function BulletEditor({ value, role, onChange, onRemove }: { value: string; role: string; onChange: (v: string) => void; onRemove: () => void }) {
  const [options, setOptions] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const improve = async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch("/api/resumes/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "bullet", bullet: value, role }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOptions(data.options)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div>
      <div className="flex gap-1.5 items-start">
        <span className="text-muted-foreground text-xs pt-2">•</span>
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} placeholder="Action verb + what you did + result (e.g. Cut onboarding time 40% by…)" className="text-xs bg-muted min-h-0 resize-y" />
        <div className="flex flex-col gap-0.5">
          <button onClick={improve} disabled={loading || value.trim().length < 5} title="Improve with AI" className="p-1.5 rounded-md text-primary hover:bg-primary/10 disabled:opacity-40">
            {loading ? <Spinner className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onRemove} title="Remove bullet" className="p-1.5 rounded-md text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {err && <p className="text-[11px] text-destructive ml-4 mt-1">{err}</p>}
      {options && (
        <div className="ml-4 mt-1.5 rounded-lg border border-primary/25 bg-primary/5 p-2 space-y-1">
          {options.map((o, i) => (
            <button key={i} onClick={() => { onChange(o); setOptions(null) }} className="block w-full text-left text-[11px] text-foreground rounded-md px-2 py-1.5 hover:bg-primary/10">
              {o}
            </button>
          ))}
          <button onClick={() => setOptions(null)} className="text-[10px] text-muted-foreground px-2">Dismiss</button>
        </div>
      )}
    </div>
  )
}

export default function ResumeEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<ResumeData | null>(null)
  const [title, setTitle] = useState("")
  const [notFound, setNotFound] = useState(false)
  const [save, setSave] = useState<SaveState>("saved")
  const [saveError, setSaveError] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [tailorOpen, setTailorOpen] = useState(false)
  const [jd, setJd] = useState("")
  const [tailoring, setTailoring] = useState(false)
  const [tailor, setTailor] = useState<{ match_score?: number; summary?: string; missing_keywords?: string[]; present_keywords?: string[]; tips?: string[] } | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const loaded = useRef(false)

  // Preview scaling
  const previewBox = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.7)
  const [pageHeight, setPageHeight] = useState(1056)
  useLayoutEffect(() => {
    const box = previewBox.current
    const page = pageRef.current
    if (!box || !page) return
    const ro = new ResizeObserver(() => {
      setScale(Math.min(1, box.clientWidth / 816))
      setPageHeight(page.offsetHeight)
    })
    ro.observe(box)
    ro.observe(page)
    return () => ro.disconnect()
  }, [data === null])

  useEffect(() => {
    fetch(`/api/resumes/${id}`)
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error)
        if (!d.resume.data) {
          router.replace("/dashboard/resumes")
          return
        }
        setData(normalizeResume(d.resume.data))
        setTitle(d.resume.title || "My Resume")
        loaded.current = true
      })
      .catch(() => setNotFound(true))
  }, [id, router])

  // Debounced autosave
  const persist = useCallback(async (payload: { data?: ResumeData; title?: string }) => {
    setSave("saving")
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || "Save failed")
      setSave("saved")
      setSaveError(null)
    } catch (e) {
      setSave("error")
      setSaveError(e instanceof Error ? e.message : "Save failed")
    }
  }, [id])

  useEffect(() => {
    if (!loaded.current || !data) return
    setSave("dirty")
    const t = setTimeout(() => persist({ data, title }), 900)
    return () => clearTimeout(t)
  }, [data, title, persist])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (save === "dirty" || save === "saving") e.preventDefault()
    }
    window.addEventListener("beforeunload", onLeave)
    return () => window.removeEventListener("beforeunload", onLeave)
  }, [save])

  if (notFound) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        Resume not found. <Link href="/dashboard/resumes" className="text-primary underline">Back to resumes</Link>
      </div>
    )
  }
  if (!data) return <div className="p-8"><Spinner className="w-6 h-6 text-primary" /></div>

  const update = (fn: (d: ResumeData) => ResumeData) => setData((d) => (d ? fn(structuredClone(d)) : d))
  const setBasics = (k: keyof ResumeData["basics"], v: string) => update((d) => ({ ...d, basics: { ...d.basics, [k]: v } }))
  const { score, tips } = resumeCompleteness(data)

  const writeSummary = async () => {
    setSummaryLoading(true)
    setAiError(null)
    try {
      const res = await fetch("/api/resumes/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "summary", data, target: data.basics.title }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      update((r) => ({ ...r, summary: d.summary }))
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Failed")
    } finally {
      setSummaryLoading(false)
    }
  }

  const runTailor = async () => {
    setTailoring(true)
    setAiError(null)
    try {
      const res = await fetch("/api/resumes/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "tailor", data, jobDescription: jd }) })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setTailor(d.result)
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Failed")
    } finally {
      setTailoring(false)
    }
  }

  const addSkill = (kw: string) =>
    update((d) => {
      const groups = d.skills.length ? d.skills : [{ ...blankSkill(), group: "Skills" }]
      const last = groups[groups.length - 1]
      last.items = last.items.trim() ? `${last.items}, ${kw}` : kw
      return { ...d, skills: groups }
    })

  const exportPdf = () => {
    const prev = document.title
    document.title = (data.basics.name ? `${data.basics.name} Resume` : title).replace(/[^\w\s-]/g, "")
    window.print()
    setTimeout(() => (document.title = prev), 500)
  }

  const sendTo = (path: string) => {
    setHandoff({ resumeText: resumeToText(data) })
    router.push(path)
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Toolbar */}
      <div className="no-print max-w-[1500px] mx-auto mb-4 flex flex-wrap items-center gap-2">
        <Link href="/dashboard/resumes" className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="All resumes"><ArrowLeft className="w-4 h-4" /></Link>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-9 w-56 text-sm font-medium bg-transparent border-transparent hover:border-border focus:border-border" aria-label="Resume name" />
        <span className="text-[11px] text-muted-foreground flex items-center gap-1 min-w-20" title={saveError || undefined}>
          {save === "saved" && <><Cloud className="w-3.5 h-3.5 text-emerald-500" /> Saved</>}
          {save === "saving" && <><Spinner className="w-3 h-3" /> Saving…</>}
          {save === "dirty" && <>Editing…</>}
          {save === "error" && <span className="text-destructive flex items-center gap-1"><CloudOff className="w-3.5 h-3.5" /> Not saved</span>}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5 bg-muted/40">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => update((d) => ({ ...d, settings: { ...d.settings, template: t.id } }))}
                className={`px-2.5 py-1 text-xs rounded-md ${data.settings.template === t.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {ACCENTS.map((c) => (
              <button key={c} onClick={() => update((d) => ({ ...d, settings: { ...d.settings, accent: c } }))} title={c}
                className={`w-5 h-5 rounded-full border-2 ${data.settings.accent === c ? "border-foreground" : "border-transparent"}`} style={{ background: c }} />
            ))}
          </div>
          <button onClick={() => update((d) => ({ ...d, settings: { ...d.settings, font: d.settings.font === "sans" ? "serif" : "sans" } }))}
            className="h-8 px-2.5 rounded-lg border border-border text-xs text-foreground" style={{ fontFamily: data.settings.font === "serif" ? "Georgia, serif" : "inherit" }}>
            {data.settings.font === "serif" ? "Serif" : "Sans"}
          </button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setTailorOpen(!tailorOpen)}><Target className="w-3.5 h-3.5" /> Tailor to job</Button>
          <Button size="sm" className="gap-1.5 h-8" onClick={exportPdf}><Download className="w-3.5 h-3.5" /> Download PDF</Button>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto grid xl:grid-cols-[minmax(420px,1fr)_minmax(0,1.1fr)] gap-6">
        {/* Editor */}
        <div className="no-print space-y-3 min-w-0">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-foreground">Resume strength</span>
              <span className={score >= 80 ? "text-emerald-600 font-semibold" : score >= 50 ? "text-amber-600 font-semibold" : "text-muted-foreground font-semibold"}>{score}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500" style={{ width: `${score}%` }} />
            </div>
            {tips[0] && <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5"><Lightbulb className="w-3 h-3 text-amber-500" /> Next: {tips[0]}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => sendTo("/dashboard/ats-checker")}>Check ATS score</Button>
              <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => sendTo("/dashboard/cover-letter")}>Write cover letter</Button>
              <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => sendTo("/dashboard/job-resume-compare")}>Compare to a job</Button>
            </div>
          </div>

          {tailorOpen && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-fade-in">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Tailor to a job</p>
              <JobLinkImporter onImported={(text) => setJd(text)} />
              <Textarea value={jd} onChange={(e) => setJd(e.target.value)} placeholder="…or paste the job description" className="min-h-24 text-xs bg-background" />
              <Button size="sm" onClick={runTailor} disabled={tailoring || jd.trim().split(/\s+/).length < 20} className="gap-1.5">
                {tailoring ? <Spinner className="w-3.5 h-3.5" /> : <Wand2 className="w-3.5 h-3.5" />} Analyze match
              </Button>
              {tailor && (
                <div className="space-y-3 text-xs">
                  {tailor.match_score != null && <p className="font-semibold text-foreground">Match score: {tailor.match_score}%</p>}
                  {!!tailor.missing_keywords?.length && (
                    <div>
                      <p className="text-muted-foreground mb-1">Missing keywords — click to add to skills <span className="italic">(only if you really have them)</span>:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {tailor.missing_keywords.map((k) => (
                          <button key={k} onClick={() => { addSkill(k); setTailor((t) => t && { ...t, missing_keywords: t.missing_keywords?.filter((x) => x !== k) }) }}
                            className="px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20">
                            + {k}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {tailor.summary && (
                    <div className="rounded-lg bg-background border border-border p-2.5">
                      <p className="text-muted-foreground mb-1">Tailored summary</p>
                      <p className="text-foreground">{tailor.summary}</p>
                      <button className="mt-1.5 text-primary font-medium" onClick={() => update((d) => ({ ...d, summary: tailor.summary || d.summary }))}>Use this summary</button>
                    </div>
                  )}
                  {!!tailor.tips?.length && <ul className="space-y-1 text-muted-foreground">{tailor.tips.map((t, i) => <li key={i}>• {t}</li>)}</ul>}
                </div>
              )}
            </div>
          )}
          {aiError && <p className="text-xs text-destructive">{aiError}</p>}
          {save === "error" && saveError && <p className="text-xs text-destructive">{saveError}</p>}

          <Section icon={User} title="Contact">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full name" value={data.basics.name} onChange={(v) => setBasics("name", v)} />
              <Field label="Headline" value={data.basics.title} onChange={(v) => setBasics("title", v)} placeholder="Senior Product Designer" />
              <Field label="Email" value={data.basics.email} onChange={(v) => setBasics("email", v)} />
              <Field label="Phone" value={data.basics.phone} onChange={(v) => setBasics("phone", v)} />
              <Field label="Location" value={data.basics.location} onChange={(v) => setBasics("location", v)} placeholder="City, Country" />
              <Field label="LinkedIn" value={data.basics.linkedin} onChange={(v) => setBasics("linkedin", v)} placeholder="linkedin.com/in/you" />
              <Field label="GitHub" value={data.basics.github} onChange={(v) => setBasics("github", v)} />
              <Field label="Website" value={data.basics.website} onChange={(v) => setBasics("website", v)} />
            </div>
          </Section>

          <Section icon={AlignLeft} title="Summary" action={
            <button onClick={writeSummary} disabled={summaryLoading} className="text-[11px] text-primary inline-flex items-center gap-1 disabled:opacity-50">
              {summaryLoading ? <Spinner className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />} Write with AI
            </button>
          }>
            <Textarea value={data.summary} onChange={(e) => update((d) => ({ ...d, summary: e.target.value }))} placeholder="2–3 sentences: who you are, what you're great at, a proof point." className="min-h-20 text-sm bg-muted" />
          </Section>

          <Section icon={Briefcase} title="Experience" action={
            <button onClick={() => update((d) => ({ ...d, experience: [...d.experience, blankExperience()] }))} className="text-[11px] text-primary inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add role</button>
          }>
            {data.experience.length === 0 && <p className="text-xs text-muted-foreground">No roles yet — add your most recent job first.</p>}
            {data.experience.map((e, i) => (
              <div key={e.id} className="rounded-xl border border-border p-3 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-foreground truncate">{e.role || e.company || `Role ${i + 1}`}</span>
                  <ItemControls
                    onUp={i > 0 ? () => update((d) => ({ ...d, experience: move(d.experience, i, -1) })) : undefined}
                    onDown={i < data.experience.length - 1 ? () => update((d) => ({ ...d, experience: move(d.experience, i, 1) })) : undefined}
                    onRemove={() => update((d) => ({ ...d, experience: d.experience.filter((x) => x.id !== e.id) }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Job title" value={e.role} onChange={(v) => update((d) => { d.experience[i].role = v; return d })} />
                  <Field label="Company" value={e.company} onChange={(v) => update((d) => { d.experience[i].company = v; return d })} />
                  <Field label="Start" value={e.start} onChange={(v) => update((d) => { d.experience[i].start = v; return d })} placeholder="Jan 2022" />
                  {e.current ? (
                    <div className="text-[11px] text-muted-foreground flex items-end pb-2">Present</div>
                  ) : (
                    <Field label="End" value={e.end} onChange={(v) => update((d) => { d.experience[i].end = v; return d })} placeholder="Mar 2024" />
                  )}
                  <Field label="Location" value={e.location} onChange={(v) => update((d) => { d.experience[i].location = v; return d })} />
                  <label className="flex items-end gap-2 pb-2 text-xs text-foreground">
                    <input type="checkbox" checked={e.current} onChange={(ev) => update((d) => { d.experience[i].current = ev.target.checked; return d })} className="accent-[var(--primary)]" />
                    I currently work here
                  </label>
                </div>
                <div className="space-y-2">
                  {e.bullets.map((b, bi) => (
                    <BulletEditor key={bi} value={b} role={e.role}
                      onChange={(v) => update((d) => { d.experience[i].bullets[bi] = v; return d })}
                      onRemove={() => update((d) => { d.experience[i].bullets.splice(bi, 1); return d })} />
                  ))}
                  <button onClick={() => update((d) => { d.experience[i].bullets.push(""); return d })} className="text-[11px] text-primary inline-flex items-center gap-1 ml-4"><Plus className="w-3 h-3" /> Add bullet</button>
                </div>
              </div>
            ))}
          </Section>

          <Section icon={GraduationCap} title="Education" action={
            <button onClick={() => update((d) => ({ ...d, education: [...d.education, blankEducation()] }))} className="text-[11px] text-primary inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
          }>
            {data.education.map((e, i) => (
              <div key={e.id} className="rounded-xl border border-border p-3 space-y-2.5">
                <div className="flex justify-end">
                  <ItemControls
                    onUp={i > 0 ? () => update((d) => ({ ...d, education: move(d.education, i, -1) })) : undefined}
                    onDown={i < data.education.length - 1 ? () => update((d) => ({ ...d, education: move(d.education, i, 1) })) : undefined}
                    onRemove={() => update((d) => ({ ...d, education: d.education.filter((x) => x.id !== e.id) }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="School" value={e.school} onChange={(v) => update((d) => { d.education[i].school = v; return d })} />
                  <Field label="Degree" value={e.degree} onChange={(v) => update((d) => { d.education[i].degree = v; return d })} placeholder="B.S. Computer Science" />
                  <Field label="Start" value={e.start} onChange={(v) => update((d) => { d.education[i].start = v; return d })} />
                  <Field label="End" value={e.end} onChange={(v) => update((d) => { d.education[i].end = v; return d })} />
                  <Field label="Details (GPA, honors, coursework)" value={e.details} onChange={(v) => update((d) => { d.education[i].details = v; return d })} className="col-span-2" />
                </div>
              </div>
            ))}
          </Section>

          <Section icon={Wrench} title="Skills" action={
            <button onClick={() => update((d) => ({ ...d, skills: [...d.skills, blankSkill()] }))} className="text-[11px] text-primary inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add group</button>
          }>
            {data.skills.map((g, i) => (
              <div key={g.id} className="flex gap-2 items-end">
                <Field label="Group" value={g.group} onChange={(v) => update((d) => { d.skills[i].group = v; return d })} placeholder="Languages" className="w-32 shrink-0" />
                <Field label="Skills (comma separated)" value={g.items} onChange={(v) => update((d) => { d.skills[i].items = v; return d })} placeholder="TypeScript, React, SQL" className="flex-1" />
                <button onClick={() => update((d) => ({ ...d, skills: d.skills.filter((x) => x.id !== g.id) }))} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </Section>

          <Section icon={FolderGit2} title="Projects" action={
            <button onClick={() => update((d) => ({ ...d, projects: [...d.projects, blankProject()] }))} className="text-[11px] text-primary inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
          }>
            {data.projects.map((p, i) => (
              <div key={p.id} className="rounded-xl border border-border p-3 space-y-2.5">
                <div className="flex justify-end">
                  <ItemControls
                    onUp={i > 0 ? () => update((d) => ({ ...d, projects: move(d.projects, i, -1) })) : undefined}
                    onDown={i < data.projects.length - 1 ? () => update((d) => ({ ...d, projects: move(d.projects, i, 1) })) : undefined}
                    onRemove={() => update((d) => ({ ...d, projects: d.projects.filter((x) => x.id !== p.id) }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <Field label="Name" value={p.name} onChange={(v) => update((d) => { d.projects[i].name = v; return d })} />
                  <Field label="Link" value={p.link} onChange={(v) => update((d) => { d.projects[i].link = v; return d })} />
                  <Field label="One-line description" value={p.description} onChange={(v) => update((d) => { d.projects[i].description = v; return d })} className="col-span-2" />
                </div>
                {p.bullets.map((b, bi) => (
                  <BulletEditor key={bi} value={b} role="" onChange={(v) => update((d) => { d.projects[i].bullets[bi] = v; return d })} onRemove={() => update((d) => { d.projects[i].bullets.splice(bi, 1); return d })} />
                ))}
                <button onClick={() => update((d) => { d.projects[i].bullets.push(""); return d })} className="text-[11px] text-primary inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add bullet</button>
              </div>
            ))}
          </Section>

          <Section icon={Award} title="Certifications" action={
            <button onClick={() => update((d) => ({ ...d, certifications: [...d.certifications, blankCertification()] }))} className="text-[11px] text-primary inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
          }>
            {data.certifications.map((c, i) => (
              <div key={c.id} className="flex gap-2 items-end">
                <Field label="Name" value={c.name} onChange={(v) => update((d) => { d.certifications[i].name = v; return d })} className="flex-1" />
                <Field label="Issuer" value={c.issuer} onChange={(v) => update((d) => { d.certifications[i].issuer = v; return d })} className="w-32" />
                <Field label="Date" value={c.date} onChange={(v) => update((d) => { d.certifications[i].date = v; return d })} className="w-24" />
                <button onClick={() => update((d) => ({ ...d, certifications: d.certifications.filter((x) => x.id !== c.id) }))} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </Section>

          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-500" /> Single-column layout with real text — ATS-safe.</p>
        </div>

        {/* Live preview */}
        <div className="min-w-0">
          <div className="xl:sticky xl:top-20">
            <div ref={previewBox} className="resume-preview-box w-full overflow-hidden rounded-xl border border-border bg-muted/40 shadow-inner" style={{ height: pageHeight * scale + 2 }}>
              <div ref={pageRef} className="resume-scale origin-top-left shadow-xl" style={{ transform: `scale(${scale})`, width: 816 }}>
                <ResumePreview data={data} id="resume-print" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
