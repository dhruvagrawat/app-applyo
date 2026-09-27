"use client"

import { useState } from "react"
import { FileText, Save } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface SavedResumeButtonsProps {
  resumeText: string
  onLoad: (text: string) => void
}

/** Small "Use saved resume" / "Save" links shown next to a resume textarea label. */
export function SavedResumeButtons({ resumeText, onLoad }: SavedResumeButtonsProps) {
  const [busy, setBusy] = useState<"load" | "save" | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const flash = (msg: string) => {
    setNote(msg)
    setTimeout(() => setNote(null), 2500)
  }

  const load = async () => {
    setBusy("load")
    try {
      const res = await fetch("/api/resumes/latest")
      const data = await res.json()
      if (data.resume?.text) {
        onLoad(data.resume.text)
        flash("Loaded")
      } else flash("No saved resume yet")
    } catch {
      flash("Failed to load")
    } finally {
      setBusy(null)
    }
  }

  const save = async () => {
    setBusy("save")
    try {
      const res = await fetch("/api/resumes/latest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      })
      const data = await res.json()
      flash(res.ok ? "Saved" : data.error || "Failed to save")
    } catch {
      flash("Failed to save")
    } finally {
      setBusy(null)
    }
  }

  return (
    <span className="inline-flex items-center gap-3 text-[11px] font-normal">
      {note && <span className="text-muted-foreground">{note}</span>}
      <button type="button" onClick={load} disabled={!!busy} className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50">
        {busy === "load" ? <Spinner className="w-3 h-3" /> : <FileText className="w-3 h-3" />} Use saved
      </button>
      {resumeText.trim().length > 200 && (
        <button type="button" onClick={save} disabled={!!busy} className="inline-flex items-center gap-1 text-primary hover:underline disabled:opacity-50">
          {busy === "save" ? <Spinner className="w-3 h-3" /> : <Save className="w-3 h-3" />} Save
        </button>
      )}
    </span>
  )
}
