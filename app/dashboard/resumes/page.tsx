"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText, Plus, Copy, Trash2, PenLine, Upload, Sparkles, Clock, LayoutTemplate } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { extractTextFromPdf } from "@/lib/utils/pdf-parser"

interface ResumeRow {
  id: string
  title: string
  kind: "builder" | "text"
  template: string | null
  wordCount: number
  preview: string
  updatedAt: string
}

export default function ResumeVaultPage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState("")

  const load = async () => {
    try {
      const res = await fetch("/api/resumes")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load resumes")
      setResumes(data.resumes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resumes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async (body: Record<string, unknown>, key: string) => {
    setBusy(key)
    setError(null)
    try {
      const res = await fetch("/api/resumes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Couldn't create resume")
      router.push(`/dashboard/resumes/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create resume")
      setBusy(null)
    }
  }

  const importResume = async (text: string) => {
    setBusy("import")
    setError(null)
    try {
      const res = await fetch("/api/resumes/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "parse", text }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Couldn't read that resume")
      await create({ data: data.data, title: data.data.basics?.name ? `${data.data.basics.name} — Resume` : "Imported resume" }, "import")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed")
      setBusy(null)
    }
  }

  const onPdf = async (file: File) => {
    setBusy("import")
    setError(null)
    try {
      const text = await extractTextFromPdf(file)
      await importResume(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that PDF")
      setBusy(null)
    }
  }

  const remove = async (id: string) => {
    if (!window.confirm("Delete this resume? This can't be undone.")) return
    const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" })
    if (res.ok) setResumes((r) => r.filter((x) => x.id !== id))
    else setError((await res.json().catch(() => ({}))).error || "Couldn't delete")
  }

  // Text-only resumes (uploaded in other tools) can be converted into editable builder resumes.
  const convert = async (r: ResumeRow) => {
    setBusy(r.id)
    const res = await fetch(`/api/resumes/${r.id}`)
    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      setBusy(null)
      return
    }
    await importResume(data.resume.content)
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Resumes</h1>
            <p className="text-sm text-muted-foreground">Build clean, ATS-friendly resumes and keep every version in one place.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5" onClick={() => setImportOpen(!importOpen)} disabled={!!busy}>
              <Upload className="w-4 h-4" /> Import existing
            </Button>
            <Button className="gap-1.5" onClick={() => create({}, "new")} disabled={!!busy}>
              {busy === "new" ? <Spinner className="w-4 h-4" /> : <Plus className="w-4 h-4" />} New resume
            </Button>
          </div>
        </div>

        {importOpen && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-fade-in">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Import with AI</p>
            <p className="text-xs text-muted-foreground">Upload a PDF or paste your resume — AI turns it into an editable resume. Nothing is invented.</p>
            <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground cursor-pointer hover:border-primary/40">
              <Upload className="w-4 h-4" /> Choose a PDF
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onPdf(e.target.files[0])} />
            </label>
            <Textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="…or paste your resume text here" className="min-h-32 text-xs bg-muted" />
            <Button onClick={() => importResume(importText)} disabled={!!busy || importText.trim().length < 100} className="gap-1.5">
              {busy === "import" ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />} {busy === "import" ? "Reading your resume…" : "Import"}
            </Button>
          </div>
        )}

        {error && <p className="text-xs text-destructive rounded-lg border border-destructive/30 bg-destructive/10 p-3">{error}</p>}

        {loading ? (
          <div className="py-16 text-center"><Spinner className="w-6 h-6 mx-auto text-primary" /></div>
        ) : resumes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <LayoutTemplate className="w-10 h-10 text-muted-foreground mx-auto" />
            <h2 className="mt-3 font-semibold text-foreground">No resumes yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Start from scratch or import the resume you already have.</p>
            <div className="mt-5 flex justify-center gap-2">
              <Button onClick={() => create({}, "new")} className="gap-1.5"><Plus className="w-4 h-4" /> New resume</Button>
              <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5"><Upload className="w-4 h-4" /> Import</Button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((r, i) => (
              <div key={r.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover-lift flex flex-col">
                <Link href={r.kind === "builder" ? `/dashboard/resumes/${r.id}` : "#"} onClick={(e) => r.kind !== "builder" && e.preventDefault()} className="block">
                  <div className="h-36 bg-muted/60 p-4 border-b border-border overflow-hidden">
                    <div className="bg-white rounded shadow-sm h-full p-3 space-y-1.5">
                      <div className="h-2 w-1/2 bg-stone-800 rounded" />
                      <div className="h-1.5 w-1/3 bg-stone-300 rounded" />
                      <p className="text-[7px] leading-tight text-stone-500 line-clamp-5 pt-1">{r.preview || "Empty resume"}</p>
                    </div>
                  </div>
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground text-sm truncate">{r.title}</p>
                    {i === 0 && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">Used by tools</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(r.updatedAt).toLocaleDateString()} · {r.wordCount} words · {r.kind === "builder" ? (r.template || "minimal") : "text only"}
                  </p>
                  <div className="flex gap-1.5 mt-auto pt-3">
                    {r.kind === "builder" ? (
                      <Link href={`/dashboard/resumes/${r.id}`} className="flex-1"><Button size="sm" className="w-full gap-1 h-8 text-xs"><PenLine className="w-3.5 h-3.5" /> Edit</Button></Link>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1 gap-1 h-8 text-xs" onClick={() => convert(r)} disabled={!!busy}>
                        {busy === r.id ? <Spinner className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />} Make editable
                      </Button>
                    )}
                    {r.kind === "builder" && (
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0" title="Duplicate" onClick={() => create({ copyFrom: r.id }, `copy-${r.id}`)} disabled={!!busy}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" title="Delete" onClick={() => remove(r.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Your most recently edited resume is what “Use saved resume”, the Auto-Applier and fit scoring use.
        </p>
      </div>
    </div>
  )
}
