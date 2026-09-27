import { NextResponse, type NextRequest } from "next/server"
import { runAgentStep, withSessionPage, type ResumeFile } from "@/lib/auto-apply/agent"
import { loadCandidate, loadTask, requireUser, updateTask } from "@/lib/auto-apply/tasks"

export const runtime = "nodejs"
export const maxDuration = 90

const MAX_RESUME_BYTES = 5 * 1024 * 1024

/**
 * Runs one AI step in the live browser: read the page, fill what it can, click through
 * to the next page. In "submit" mode (explicit user approval) it may click the final submit.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const task = await loadTask(id, user.id)
  if (!task?.steel_session_id) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (["stopped", "applied"].includes(task.status)) {
    return NextResponse.json({ error: "This session has ended. Start a new one." }, { status: 409 })
  }

  const body = await request.json().catch(() => ({}))
  const mode: "fill" | "submit" = body.mode === "submit" ? "submit" : "fill"
  let resumeFile: ResumeFile | null = null
  if (body.resumeFile?.base64 && body.resumeFile?.name) {
    if ((body.resumeFile.base64.length * 3) / 4 > MAX_RESUME_BYTES) {
      return NextResponse.json({ error: "Resume file must be under 5MB" }, { status: 413 })
    }
    resumeFile = {
      name: String(body.resumeFile.name).slice(0, 120),
      mimeType: String(body.resumeFile.mimeType || "application/pdf"),
      base64: String(body.resumeFile.base64),
    }
  }

  const candidate = await loadCandidate(user.id, user.email)
  if (typeof body.resumeText === "string" && body.resumeText.trim()) candidate.resumeText = body.resumeText

  try {
    const result = await withSessionPage(task.steel_session_id, (page) =>
      runAgentStep(
        page,
        {
          ...candidate,
          resumeFile,
          jobHint: task.rules?.job_hint,
          instructions: typeof body.instructions === "string" ? body.instructions.slice(0, 1000) : undefined,
        },
        mode,
      ),
    )

    const job = result.plan?.job
    await updateTask(
      id,
      {
        current_url: result.url,
        status: result.status === "done" ? "submitted" : "running",
        ...(job?.title ? { job_title: job.title } : {}),
        ...(job?.company ? { company_name: job.company } : {}),
      },
      {
        kind: mode,
        status: result.status,
        message: result.message,
        actions: result.actions.length,
        failed: result.actions.filter((a) => !a.ok).length,
      },
    )

    return NextResponse.json({ result })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[auto] step failed:", message)
    await updateTask(id, {}, { kind: "error", message: message.slice(0, 300) })
    const expired = /closed|not found|404|ECONNREFUSED|Target page/i.test(message)
    return NextResponse.json(
      { error: expired ? "The browser session has ended or is unreachable. Start a new session." : message },
      { status: expired ? 410 : 500 },
    )
  }
}
