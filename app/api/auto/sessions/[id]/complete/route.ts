import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { releaseSteelSession } from "@/lib/auto-apply/steel"
import { loadTask, requireUser, updateTask } from "@/lib/auto-apply/tasks"

export const runtime = "nodejs"

/** Marks the application as sent, logs it in the Job Tracker and releases the browser. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const task = await loadTask(id, user.id)
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const jobTitle = String(body.jobTitle || task.job_title || "Untitled role").slice(0, 200)
  const company = String(body.company || task.company_name || "Unknown company").slice(0, 200)
  const jobUrl = String(task.current_url || task.target_url)

  const admin = createAdminClient()
  const { data: application, error } = await admin
    .from("job_applications")
    .insert({
      user_id: user.id,
      company_name: company,
      job_title: jobTitle,
      status: "applied",
      applied_date: new Date().toISOString().split("T")[0],
      job_url: task.target_url,
      source: "Auto-Applier",
      notes: `Applied via Applyo Auto-Applier (${jobUrl})`,
    })
    .select("id")
    .single()
  if (error) console.error("[auto] tracker insert failed:", error)

  if (task.steel_session_id && body.release !== false) await releaseSteelSession(task.steel_session_id)
  await updateTask(
    id,
    { status: "applied", job_title: jobTitle, company_name: company },
    { kind: "applied", message: `Logged ${jobTitle} @ ${company} in Job Tracker` },
  )
  await admin.from("activity_log").insert({
    user_id: user.id,
    action: "auto_apply_submitted",
    payload: { task_id: id, job_title: jobTitle, company, application_id: application?.id },
  })

  return NextResponse.json({ ok: true, applicationId: application?.id || null })
}
