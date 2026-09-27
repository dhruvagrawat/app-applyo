import { createClient } from "@/lib/supabase/server"
import { parseJob } from "@/lib/jobs/parse-job"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { url, text } = await request.json()
    if (!url?.trim() && !text?.trim()) {
      return NextResponse.json({ error: "Provide a job link or job description text" }, { status: 400 })
    }

    const job = await parseJob({ url, text })
    return NextResponse.json({ job })
  } catch (error) {
    console.error("[jobs/parse] error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse job" },
      { status: 422 },
    )
  }
}
