import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { emptyResume, normalizeResume, resumeToText } from "@/lib/resume/types"

async function getContext() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

/** Lists the user's resumes (builder resumes and uploaded/pasted ones). */
export async function GET() {
  const { supabase, user } = await getContext()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("resumes")
    .select("id, title, word_count, metadata, created_at, updated_at, content")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    resumes: (data || []).map((r) => ({
      id: r.id,
      title: r.title || "Untitled resume",
      kind: r.metadata?.builder ? "builder" : "text",
      template: r.metadata?.builder?.settings?.template || null,
      wordCount: r.word_count || (r.content ? r.content.split(/\s+/).length : 0),
      preview: (r.content || "").slice(0, 160),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  })
}

/** Creates a builder resume: blank, from provided data, or as a copy of an existing resume. */
export async function POST(request: NextRequest) {
  const { supabase, user } = await getContext()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  let data = body.data ? normalizeResume(body.data) : emptyResume()
  let title = String(body.title || "").slice(0, 120)

  if (body.copyFrom) {
    const { data: src } = await supabase
      .from("resumes")
      .select("title, metadata")
      .eq("id", body.copyFrom)
      .eq("user_id", user.id)
      .maybeSingle()
    if (src?.metadata?.builder) data = normalizeResume(src.metadata.builder)
    title = title || `${src?.title || "Resume"} (copy)`
  }

  // New blank resumes start with the user's contact details where we know them.
  if (!body.data && !body.copyFrom) {
    const { data: profile } = await supabase.from("profiles").select("full_name, headline, application_profile").eq("id", user.id).maybeSingle()
    const ap = (profile?.application_profile || {}) as Record<string, string>
    data.basics = {
      ...data.basics,
      name: ap.full_name || profile?.full_name || "",
      title: profile?.headline || ap.current_title || "",
      email: ap.email || user.email || "",
      phone: ap.phone || "",
      location: ap.location || "",
      linkedin: ap.linkedin || "",
      github: ap.github || "",
      website: ap.portfolio || "",
    }
  }

  const content = resumeToText(data)
  const { data: row, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title: title || "My Resume",
      content,
      raw_text: content,
      word_count: content ? content.split(/\s+/).length : 0,
      metadata: { builder: data, source: "builder" },
    })
    .select("id")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: row.id }, { status: 201 })
}
