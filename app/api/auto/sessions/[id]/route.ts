import { NextResponse } from "next/server"
import { getSteelSession, releaseSteelSession } from "@/lib/auto-apply/steel"
import { loadTask, requireUser, updateTask } from "@/lib/auto-apply/tasks"

export const runtime = "nodejs"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const task = await loadTask(id, user.id)
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 })

  let browserStatus: string = "unknown"
  if (task.steel_session_id) {
    browserStatus = await getSteelSession(task.steel_session_id)
      .then((s) => s.status)
      .catch(() => "released")
  }
  return NextResponse.json({ task, browserStatus })
}

/** Stops the session and releases the cloud browser. */
export async function DELETE(_req: Request, { params }: Params) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const task = await loadTask(id, user.id)
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (task.steel_session_id) await releaseSteelSession(task.steel_session_id)
  const finalStatus = task.status === "applied" ? "applied" : "stopped"
  await updateTask(id, { status: finalStatus }, { kind: "stop", message: "Browser session closed" })
  return NextResponse.json({ ok: true, status: finalStatus })
}

/** navigator.sendBeacon can only POST — treat it as a release. */
export const POST = DELETE
