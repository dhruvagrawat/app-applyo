import { NextResponse, type NextRequest } from "next/server"
import { callGemini } from "@/lib/gemini"
import { parseJsonLoose } from "@/lib/jobs/parse-job"
import { logInterviewItem, requireUser } from "@/lib/interview/server"
import type { QuizQuestion } from "@/lib/interview/quizzes"

export const maxDuration = 60

/** Generates a multiple-choice skills quiz for any topic or role. */
export async function POST(request: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const topic = String(body.topic || "").slice(0, 200)
  const level = String(body.level || "intermediate").slice(0, 40)
  const count = Math.min(15, Math.max(5, Number(body.count) || 10))
  if (!topic.trim()) return NextResponse.json({ error: "Enter a topic or role" }, { status: 400 })

  const prompt = `Create a ${count}-question multiple-choice quiz to help a job candidate prepare for interviews on: "${topic}" (${level} level).
Questions should test practical, interview-relevant knowledge. Each has exactly 4 options and exactly one correct answer.
Double-check every answer is factually correct. Vary the position of the correct answer.

Return ONLY valid JSON:
{ "title": "short quiz title", "questions": [ { "q": "question", "options": ["A","B","C","D"], "answer": 0-3, "explain": "one-sentence explanation of the correct answer" } ] }`

  try {
    const data = parseJsonLoose<{ title: string; questions: QuizQuestion[] }>(await callGemini(prompt, 5000))
    const questions = (data.questions || [])
      .filter((q) => q?.q && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4)
      .slice(0, count)
    if (questions.length < 3) throw new Error("not enough valid questions")
    const quiz = { id: "ai", title: data.title || `${topic} quiz`, description: `AI-generated · ${level}`, category: "Technical", minutes: Math.ceil(questions.length * 0.8), questions }
    await logInterviewItem(user.id, "interview_quiz", { topic, level, count }, { title: quiz.title, count: questions.length })
    return NextResponse.json({ quiz })
  } catch (err) {
    console.error("[interview/quiz]", err)
    return NextResponse.json({ error: "Couldn't generate a quiz right now. Please try again." }, { status: 500 })
  }
}
