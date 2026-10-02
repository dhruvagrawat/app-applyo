import { type NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/gemini"
import { parseJsonLoose } from "@/lib/jobs/parse-job"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, resumeText } = await req.json()

    if (!jobDescription || !resumeText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const prompt = `Analyze this job listing for legitimacy and fit with the provided resume.

Job Description:
${jobDescription}

Resume:
${resumeText}

Provide JSON with:
- legitimacy_score: 0-100 score for how legitimate the job seems
- red_flags: array of potential red flags or concerns
- fit_analysis: string explaining how well the job fits the resume
- recommendation: string with advice on whether to apply

Return ONLY valid JSON.`

    const responseText = await callGemini(prompt)
    const result = parseJsonLoose(responseText)

    await supabase.from("generated_items").insert({
      user_id: user.id,
      feature: "job_validity",
      prompt,
      input_data: { jobDescription, resumeText },
      result,
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 })
  }
}
