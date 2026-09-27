import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("resumes")
    .select("id, title, content, raw_text, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ resume: null })

  return NextResponse.json({
    resume: { id: data.id, title: data.title, text: data.content || data.raw_text || "", created_at: data.created_at },
  })
}

/** Saves resume text so every tool (and the auto-applier) can reuse it. */
export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { text, title } = await request.json()
  if (!text?.trim() || text.trim().split(/\s+/).length < 50) {
    return NextResponse.json({ error: "Resume text is too short to save" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("resumes")
    .insert({ user_id: user.id, title: title || "Saved Resume", content: text.trim(), raw_text: text.trim() })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
