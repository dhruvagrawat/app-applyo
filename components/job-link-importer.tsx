"use client"

import { useState } from "react"
import { Link2, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { jobToDescription } from "@/lib/handoff"
import type { ParsedJob } from "@/lib/jobs/parse-job"

interface JobLinkImporterProps {
  /** Called with the parsed job and a ready-to-use job description text. */
  onImported: (description: string, job: ParsedJob) => void
  className?: string
}

/** "Paste a job link" row that fetches and parses the posting with AI. */
export function JobLinkImporter({ onImported, className }: JobLinkImporterProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const importJob = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)
    setDone(null)
    try {
      const res = await fetch("/api/jobs/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Couldn't import that link")
      const job = data.job as ParsedJob
      onImported(jobToDescription(job), job)
      setDone(`${job.job_title} @ ${job.company_name}`)
      setUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), importJob())}
            placeholder="Paste a job link to auto-fill…"
            className="h-9 pl-8 text-xs bg-muted border-border"
            disabled={loading}
          />
        </div>
        <Button type="button" size="sm" variant="outline" className="h-9 text-xs" onClick={importJob} disabled={loading || !url.trim()}>
          {loading ? <Spinner className="w-3.5 h-3.5 mr-1.5" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          {loading ? "Reading…" : "Import"}
        </Button>
      </div>
      {error && <p className="text-[11px] text-destructive mt-1.5">{error}</p>}
      {done && <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5">✓ Imported {done}</p>}
    </div>
  )
}
