import { type NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/gemini"
import { parseJsonLoose } from "@/lib/jobs/parse-job"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobTitle, location } = await req.json()

    if (!resumeText || !jobTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const prompt = `Based on this resume and job search criteria, suggest 5-10 job opportunities.

Resume:
${resumeText}

Job Title: ${jobTitle}
Location: ${location || "Any"}

Return JSON with opportunities array containing: title, company, location, match_score (0-100)
Return ONLY valid JSON.`

    const responseText = await callGemini(prompt)
    const result = parseJsonLoose(responseText)

    await supabase.from("generated_items").insert({
      user_id: user.id,
      feature: "job_finder",
      prompt,
      input_data: { resumeText, jobTitle, location },
      result,
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Failed to find jobs" }, { status: 500 })
  }
}
