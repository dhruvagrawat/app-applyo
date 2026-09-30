import { NextResponse, type NextRequest } from "next/server"
import { callGemini } from "@/lib/gemini"
import { parseJsonLoose } from "@/lib/jobs/parse-job"
import { createAdminClient } from "@/lib/supabase/admin"
import { logInterviewItem, requireUser } from "@/lib/interview/server"
import type { AnswerFeedback } from "@/lib/interview/types"

export const maxDuration = 60

/** Scores an interview answer (typed or transcribed from video) and suggests a stronger version. */
export async function POST(request: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const question = String(body.question || "").slice(0, 600)
  const answer = String(body.answer || "").slice(0, 8000)
  const role = String(body.role || "").slice(0, 200)
  const mode = body.mode === "video" ? "video" : "text"
  const metrics = body.metrics && typeof body.metrics === "object" ? body.metrics : null
  if (!question || answer.trim().split(/\s+/).length < 5) {
    return NextResponse.json({ error: "Write (or say) at least a sentence or two so there's something to review." }, { status: 400 })
  }

  const prompt = `You are an experienced, candid interview coach. Evaluate the candidate's answer.

QUESTION: ${question}
${role ? `TARGET ROLE: ${role}` : ""}
ANSWER MODE: ${mode === "video" ? "spoken on video (auto-transcribed — ignore small transcription errors and missing punctuation)" : "written"}
${metrics ? `DELIVERY METRICS: ${JSON.stringify(metrics)}` : ""}

CANDIDATE ANSWER:
"""${answer}"""

Scoring guide (0-10): 9-10 exceptional, specific, structured, clear impact; 7-8 strong with minor gaps; 5-6 adequate but generic or missing results; 3-4 weak/vague; 0-2 off-topic.
Be honest — do not inflate scores. Base feedback strictly on what the candidate said. Never invent facts about the candidate.
For behavioral questions ("tell me about a time", "describe a situation"…) evaluate STAR components; otherwise set "star" to null.
The improved answer must keep the candidate's real details, only restructuring and tightening them; use [brackets] for any detail the candidate should fill in (like a missing metric).

Return ONLY valid JSON:
{
  "score": 0-10 number (one decimal allowed),
  "verdict": "one-sentence overall assessment",
  "strengths": ["2-4 specific strengths"],
  "improvements": ["2-4 specific, actionable improvements"],
  "star": { "situation": bool, "task": bool, "action": bool, "result": bool } | null,
  "improved_answer": "a stronger version of their answer, 90-180 words",
  "follow_up_question": "a likely follow-up question an interviewer would ask",
  "delivery_tips": ["0-3 tips about pace, filler words, length or clarity${mode === "video" ? " based on the metrics" : ""}"]
}`

  try {
    const feedback = parseJsonLoose<AnswerFeedback>(await callGemini(prompt, 3000))
    feedback.score = Math.max(0, Math.min(10, Number(feedback.score) || 0))

    // Best-effort history (table from scripts/schema_v4_additions.sql)
    try {
      const admin = createAdminClient()
      await admin.from("interview_attempts").insert({
        user_id: user.id,
        question,
        answer,
        mode,
        role: role || null,
        category: typeof body.category === "string" ? body.category.slice(0, 60) : null,
        score: feedback.score,
        feedback,
        metrics,
      })
    } catch {}
    await logInterviewItem(user.id, "interview_feedback", { question, mode, role }, feedback, { score: feedback.score })

    return NextResponse.json({ feedback })
  } catch (err) {
    console.error("[interview/feedback]", err)
    return NextResponse.json({ error: "Couldn't generate feedback right now. Please try again." }, { status: 500 })
  }
}
