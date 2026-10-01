import { type NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/gemini"
import { parseJsonLoose } from "@/lib/jobs/parse-job"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const prompt = `Analyze the following resume and job description to identify skill gaps.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide a JSON response with:
- missing_skills: array of skills required but not in resume
- matching_skills: array of skills that match
- recommendations: string with actionable recommendations

Return ONLY valid JSON.`

    const responseText = await callGemini(prompt)
    const result = parseJsonLoose(responseText)

    await supabase.from("generated_items").insert({
      user_id: user.id,
      feature: "skill_gap_finder",
      prompt,
      input_data: { resumeText, jobDescription },
      result,
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 })
  }
}
