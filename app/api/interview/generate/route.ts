import { NextResponse, type NextRequest } from "next/server"
import { callGemini } from "@/lib/gemini"
import { parseJsonLoose } from "@/lib/jobs/parse-job"
import { logInterviewItem, requireUser } from "@/lib/interview/server"

export const maxDuration = 60

/** Generates a tailored set of interview questions for a role / job description. */
export async function POST(request: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const role = String(body.role || "").slice(0, 200)
  const level = String(body.level || "mid-level").slice(0, 40)
  const type = String(body.type || "mixed").slice(0, 40)
  const count = Math.min(10, Math.max(1, Number(body.count) || 5))
  const jobDescription = String(body.jobDescription || "").slice(0, 6000)
  if (!role && !jobDescription) return NextResponse.json({ error: "Enter a role or paste a job description" }, { status: 400 })

  const prompt = `You are a hiring manager preparing a ${type} interview for a ${level} ${role || "candidate"}.
${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ""}
Write ${count} realistic interview questions a real interviewer would ask, ordered from warm-up to hardest.
Mix of types for "mixed": general fit, behavioral (STAR), situational and role-specific skills.
Each question must be answerable verbally in about 2 minutes (no whiteboard coding).

Return ONLY valid JSON:
{ "questions": [ { "question": "…", "category": "general|behavioral|situational|technical|role", "tip": "one-line tip on what a great answer includes" } ] }`

  try {
    const data = parseJsonLoose<{ questions: { question: string; category: string; tip: string }[] }>(await callGemini(prompt, 2500))
    const questions = (data.questions || []).filter((q) => q?.question).slice(0, count)
    if (!questions.length) throw new Error("empty")
    await logInterviewItem(user.id, "interview_generate", { role, level, type, count }, { questions })
    return NextResponse.json({ questions })
  } catch (err) {
    console.error("[interview/generate]", err)
    return NextResponse.json({ error: "Couldn't generate questions right now. Please try again." }, { status: 500 })
  }
}
