import { NextResponse, type NextRequest } from "next/server"
import { assertPublicUrl } from "@/lib/jobs/fetch-page"
import { navigate, withSessionPage } from "@/lib/auto-apply/agent"
import { loadTask, requireUser, updateTask } from "@/lib/auto-apply/tasks"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const task = await loadTask(id, user.id)
  if (!task?.steel_session_id) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { url } = await request.json()
  let target: URL
  try {
    target = await assertPublicUrl(String(url || ""))
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }

  try {
    await withSessionPage(task.steel_session_id, (page) => navigate(page, target.toString()))
    await updateTask(id, { current_url: target.toString() }, { kind: "navigate", message: target.toString() })
    return NextResponse.json({ ok: true, url: target.toString() })
  } catch (err) {
    return NextResponse.json({ error: `Navigation failed: ${(err as Error).message}` }, { status: 502 })
  }
}
