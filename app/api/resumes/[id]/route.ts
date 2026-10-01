import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { normalizeResume, resumeToText } from "@/lib/resume/types"

type Params = { params: Promise<{ id: string }> }

async function getContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { supabase, user } = await getContext()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const { data, error } = await supabase
    .from("resumes")
    .select("id, title, content, metadata, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({
    resume: {
      id: data.id,
      title: data.title,
      content: data.content || "",
      data: data.metadata?.builder ? normalizeResume(data.metadata.builder) : null,
      updatedAt: data.updated_at,
    },
  })
}

/** Saves builder data (and keeps the plain-text copy in sync for the other AI tools). */
export async function PUT(request: NextRequest, { params }: Params) {
  const { supabase, user } = await getContext()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.title === "string") patch.title = body.title.slice(0, 120) || "Untitled resume"
  if (body.data) {
    const data = normalizeResume(body.data)
    const content = resumeToText(data)
    patch.metadata = { builder: data, source: "builder" }
    patch.content = content
    patch.raw_text = content
    patch.word_count = content ? content.split(/\s+/).length : 0
  } else if (typeof body.content === "string") {
    patch.content = body.content.slice(0, 50000)
    patch.raw_text = patch.content
    patch.word_count = body.content.split(/\s+/).filter(Boolean).length
  }

  const { data, error } = await supabase
    .from("resumes")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, updated_at")
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) {
    return NextResponse.json(
      { error: "Couldn't save — resume not found, or the database is missing the update policy (run scripts/schema_v5_additions.sql)." },
      { status: 404 },
    )
  }
  return NextResponse.json({ ok: true, updatedAt: data.updated_at })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { supabase, user } = await getContext()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const { data, error } = await supabase.from("resumes").delete().eq("id", id).eq("user_id", user.id).select("id")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ok: true })
}
