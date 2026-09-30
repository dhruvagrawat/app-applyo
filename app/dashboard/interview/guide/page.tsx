"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Circle, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InterviewNav } from "@/components/interview/interview-nav"
import { GUIDE_CHAPTERS } from "@/lib/interview/guide"
import { Markdown } from "@/lib/blog/markdown"

const STORAGE_KEY = "applyo:interview-guide"

function loadProgress(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

export default function InterviewGuidePage() {
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setDone(loadProgress())
    const hash = window.location.hash.slice(1)
    const i = GUIDE_CHAPTERS.findIndex((c) => c.slug === hash)
    if (i >= 0) setIndex(i)
  }, [])

  const toggle = (key: string) => {
    const next = { ...done, [key]: !done[key] }
    setDone(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const go = (i: number) => {
    setIndex(i)
    history.replaceState(null, "", `#${GUIDE_CHAPTERS[i].slug}`)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const chapter = GUIDE_CHAPTERS[index]
  const chapterDone = (slug: string) => {
    const c = GUIDE_CHAPTERS.find((x) => x.slug === slug)!
    return c.checklist.every((_, i) => done[`${slug}:${i}`])
  }
  const completed = GUIDE_CHAPTERS.filter((c) => chapterDone(c.slug)).length

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Interview Guide</h1>
          <p className="text-sm text-muted-foreground">Everything you need to know, in the order you need it.</p>
        </div>
        <InterviewNav />

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="space-y-3 lg:sticky lg:top-20 h-fit">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progress</span><span>{completed}/{GUIDE_CHAPTERS.length} chapters</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completed / GUIDE_CHAPTERS.length) * 100}%` }} />
              </div>
            </div>
            <ol className="rounded-xl border border-border bg-card p-2 space-y-0.5">
              {GUIDE_CHAPTERS.map((c, i) => (
                <li key={c.slug}>
                  <button
                    onClick={() => go(i)}
                    className={`w-full flex items-start gap-2 text-left rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      i === index ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {chapterDone(c.slug) ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> : <span className="w-4 text-xs mt-0.5 shrink-0 text-center">{i + 1}</span>}
                    <span>{c.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <article className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
              Chapter {index + 1} · <Clock className="w-3 h-3" /> {chapter.minutes} min read
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{chapter.title}</h2>
            <p className="text-muted-foreground mt-2">{chapter.summary}</p>
            <div className="prose-blog mt-6 text-[15px]">
              <Markdown source={chapter.body} />
            </div>

            <div className="mt-8 rounded-xl border border-border bg-muted/40 p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Checklist</p>
              <ul className="space-y-2">
                {chapter.checklist.map((item, i) => {
                  const key = `${chapter.slug}:${i}`
                  return (
                    <li key={key}>
                      <button onClick={() => toggle(key)} className="flex items-start gap-2 text-sm text-left">
                        {done[key] ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" /> : <Circle className="w-4 h-4 text-muted-foreground mt-0.5" />}
                        <span className={done[key] ? "text-muted-foreground line-through" : "text-foreground"}>{item}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              {chapter.practice && (
                <Link href={chapter.practice.href} className="inline-block mt-4">
                  <Button size="sm" className="gap-1.5">{chapter.practice.label} <ArrowRight className="w-3.5 h-3.5" /></Button>
                </Link>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" size="sm" disabled={index === 0} onClick={() => go(index - 1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button size="sm" disabled={index === GUIDE_CHAPTERS.length - 1} onClick={() => go(index + 1)}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
