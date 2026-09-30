"use client"

import { useState } from "react"
import { CheckCircle2, AlertCircle, Sparkles, Copy, Check, MessageCircleQuestion, Mic } from "lucide-react"
import type { AnswerFeedback } from "@/lib/interview/types"

export function scoreColor(score: number) {
  if (score >= 8) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 6) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

export function FeedbackCard({ feedback, compact = false }: { feedback: AnswerFeedback; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const pct = Math.round(feedback.score * 10)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" strokeLinecap="round"
              className={`${scoreColor(feedback.score)} stroke-current transition-all duration-700`}
              strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${scoreColor(feedback.score)}`}>
            {feedback.score.toFixed(1).replace(/\.0$/, "")}
          </span>
        </div>
        <p className="text-sm text-foreground font-medium">{feedback.verdict}</p>
      </div>

      {feedback.star && (
        <div className="flex flex-wrap gap-1.5">
          {(["situation", "task", "action", "result"] as const).map((k) => (
            <span
              key={k}
              className={`text-[11px] px-2 py-0.5 rounded-full capitalize border ${
                feedback.star![k]
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
              }`}
            >
              {feedback.star![k] ? "✓" : "✗"} {k}
            </span>
          ))}
        </div>
      )}

      <div className={`grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> What worked
          </p>
          <ul className="space-y-1">{feedback.strengths.map((s, i) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}</ul>
        </div>
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Improve
          </p>
          <ul className="space-y-1">{feedback.improvements.map((s, i) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}</ul>
        </div>
      </div>

      {feedback.delivery_tips?.length > 0 && (
        <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-3">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
            <Mic className="w-3.5 h-3.5 text-sky-500" /> Delivery
          </p>
          <ul className="space-y-1">{feedback.delivery_tips.map((s, i) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}</ul>
        </div>
      )}

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Stronger version
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(feedback.improved_answer)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
            className="text-[11px] text-primary inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">{feedback.improved_answer}</p>
      </div>

      {feedback.follow_up_question && (
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <MessageCircleQuestion className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <span><span className="font-medium text-foreground">Likely follow-up:</span> {feedback.follow_up_question}</span>
        </p>
      )}
    </div>
  )
}
