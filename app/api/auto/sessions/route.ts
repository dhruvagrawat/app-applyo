import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { assertPublicUrl } from "@/lib/jobs/fetch-page"
import { createSteelSession, isSteelConfigured, releaseSteelSession, steelLiveViewUrl } from "@/lib/auto-apply/steel"
import { navigate, withSessionPage } from "@/lib/auto-apply/agent"
import { requireUser } from "@/lib/auto-apply/tasks"

export const runtime = "nodejs"
export const maxDuration = 60

/** Lists the user's recent auto-apply sessions. */
export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin
    .from("auto_tasks")
    .select("id, target_url, status, job_title, company_name, current_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)
  return NextResponse.json({ tasks: data || [], configured: isSteelConfigured() })
}

/** Starts a cloud browser, opens the target URL and returns an embeddable live view. */
export async function POST(request: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!isSteelConfigured()) {
    return NextResponse.json(
      { error: "Auto-apply browser is not configured. Add STEEL_API_KEY to the server environment." },
      { status: 503 },
    )
  }

  const { url, jobHint } = await request.json()
  let target: URL
  try {
    target = await assertPublicUrl(String(url || ""))
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }

  const admin = createAdminClient()
  const session = await createSteelSession()

  try {
    await withSessionPage(session.id, (page) => navigate(page, target.toString()))
  } catch (err) {
    // The page may still be loading — the user can see it in the live view either way.
    console.warn("[auto] initial navigation:", (err as Error).message)
  }

  const liveViewUrl = steelLiveViewUrl(session)
  const { data: task, error } = await admin
    .from("auto_tasks")
    .insert({
      user_id: user.id,
      target_url: target.toString(),
      status: "running",
      steel_session_id: session.id,
      live_view_url: liveViewUrl,
      current_url: target.toString(),
      rules: jobHint ? { job_hint: String(jobHint).slice(0, 500) } : {},
      logs: [{ at: new Date().toISOString(), kind: "start", message: `Opened ${target.hostname}` }],
    })
    .select("id")
    .single()

  if (error || !task) {
    await releaseSteelSession(session.id)
    console.error("[auto] task insert failed:", error)
    return NextResponse.json({ error: "Failed to create task — did you run scripts/schema_v3_additions.sql?" }, { status: 500 })
  }

  await admin.from("activity_log").insert({
    user_id: user.id,
    action: "auto_apply_started",
    payload: { task_id: task.id, target_url: target.toString() },
  })

  return NextResponse.json({ taskId: task.id, liveViewUrl, steelSessionId: session.id }, { status: 201 })
}
