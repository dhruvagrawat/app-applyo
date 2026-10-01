import { NextResponse, type NextRequest } from "next/server"
import { callGemini } from "@/lib/gemini"
import { parseJsonLoose } from "@/lib/jobs/parse-job"
import { createClient } from "@/lib/supabase/server"
import { normalizeResume, resumeToText } from "@/lib/resume/types"

export const maxDuration = 60

const NO_INVENT = "Never invent employers, dates, degrees, numbers or skills that are not in the input. Use [brackets] for a metric the user should fill in."

/**
 * Resume Builder AI assist.
 * - parse: resume text → structured resume
 * - bullet: rewrite one bullet (3 options)
 * - summary: write a summary from the resume
 * - tailor: compare to a job description → summary + keywords to add
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const action = String(body.action || "")

  try {
    if (action === "parse") {
      const text = String(body.text || "").slice(0, 15000)
      if (text.split(/\s+/).length < 30) return NextResponse.json({ error: "Paste more of your resume (at least a few lines)." }, { status: 400 })
      const prompt = `Convert this resume into structured JSON. Keep the person's wording; fix only obvious typos. ${NO_INVENT}

RESUME:
"""${text}"""

Return ONLY JSON:
{
  "basics": { "name": "", "title": "", "email": "", "phone": "", "location": "", "website": "", "linkedin": "", "github": "" },
  "summary": "",
  "experience": [{ "role": "", "company": "", "location": "", "start": "Mon YYYY", "end": "Mon YYYY or empty", "current": false, "bullets": [""] }],
  "education": [{ "school": "", "degree": "", "start": "", "end": "", "details": "" }],
  "projects": [{ "name": "", "link": "", "description": "", "bullets": [] }],
  "skills": [{ "group": "e.g. Languages", "items": "comma, separated" }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }]
}`
      const data = normalizeResume(parseJsonLoose(await callGemini(prompt, 7000)))
      return NextResponse.json({ data })
    }

    if (action === "bullet") {
      const bullet = String(body.bullet || "").slice(0, 600)
      const role = String(body.role || "").slice(0, 200)
      if (bullet.trim().length < 5) return NextResponse.json({ error: "Write a rough bullet first." }, { status: 400 })
      const prompt = `Rewrite this resume bullet${role ? ` for a ${role}` : ""} as 3 alternative versions. Each: starts with a strong action verb, shows impact, one line (max ~25 words). ${NO_INVENT}

BULLET: "${bullet}"

Return ONLY JSON: { "options": ["", "", ""] }`
      const out = parseJsonLoose<{ options: string[] }>(await callGemini(prompt, 800))
      return NextResponse.json({ options: (out.options || []).filter(Boolean).slice(0, 3) })
    }

    if (action === "summary") {
      const resume = normalizeResume(body.data)
      const text = resumeToText({ ...resume, summary: "" })
      if (text.split(/\s+/).length < 15) return NextResponse.json({ error: "Add some experience first so the summary has something to say." }, { status: 400 })
      const prompt = `Write a resume summary (2–3 sentences, max 60 words, no first-person "I", no clichés) for this person${body.target ? ` targeting: ${String(body.target).slice(0, 200)}` : ""}. Lead with title + experience, then strengths, then a proof point. ${NO_INVENT}

RESUME:
${text}

Return ONLY JSON: { "summary": "" }`
      const out = parseJsonLoose<{ summary: string }>(await callGemini(prompt, 600))
      return NextResponse.json({ summary: String(out.summary || "").trim() })
    }

    if (action === "tailor") {
      const resume = normalizeResume(body.data)
      const jd = String(body.jobDescription || "").slice(0, 8000)
      if (jd.split(/\s+/).length < 20) return NextResponse.json({ error: "Paste the job description (or import it from a link)." }, { status: 400 })
      const prompt = `You are a resume coach. Compare the resume with the job description.

RESUME:
${resumeToText(resume)}

JOB DESCRIPTION:
${jd}

Return ONLY JSON:
{
  "match_score": 0-100,
  "summary": "a tailored 2-3 sentence summary using only facts from the resume",
  "present_keywords": ["important job keywords already in the resume"],
  "missing_keywords": ["important job keywords/skills missing from the resume — only list ones a candidate could plausibly add if true"],
  "tips": ["3-5 specific edits to make, referencing their actual roles"]
}`
      const out = parseJsonLoose<Record<string, unknown>>(await callGemini(prompt, 2000))
      return NextResponse.json({ result: out })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err) {
    console.error("[resumes/ai]", err)
    return NextResponse.json({ error: "AI is unavailable right now. Please try again." }, { status: 500 })
  }
}
