import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/interview/server"

/** Recent practice attempts + quiz results for the Interview Studio dashboard. */
export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const admin = createAdminClient()
  const [attempts, quizzes] = await Promise.all([
    admin.from("interview_attempts").select("id, question, mode, score, category, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    admin.from("quiz_results").select("id, quiz_id, quiz_title, score, total, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
  ])
  return NextResponse.json({
    attempts: attempts.data || [],
    quizzes: quizzes.data || [],
    needsMigration: !!(attempts.error || quizzes.error),
  })
}

/** Saves a quiz result. */
export async function POST(request: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const score = Number(body.score)
  const total = Number(body.total)
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return NextResponse.json({ error: "Invalid result" }, { status: 400 })
  const admin = createAdminClient()
  const { error } = await admin.from("quiz_results").insert({
    user_id: user.id,
    quiz_id: String(body.quizId || "custom").slice(0, 80),
    quiz_title: String(body.title || "Quiz").slice(0, 200),
    score,
    total,
    duration_sec: Number(body.durationSec) || null,
  })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 200 })
  return NextResponse.json({ ok: true })
}
