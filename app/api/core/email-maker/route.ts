import { NextResponse, type NextRequest } from "next/server"
import { callGemini } from "@/lib/gemini"
import { parseJsonLoose } from "@/lib/jobs/parse-job"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 60

const TYPES: Record<string, string> = {
  followup: "a follow-up after an interview, checking on next steps",
  cold: "a cold outreach email to a recruiter or hiring manager about a role",
  thank_you: "a thank-you email sent within 24 hours after an interview",
  referral: "a request to a contact for a referral to a role at their company",
  status: "a polite check-in on the status of a submitted application",
  negotiation: "a professional salary/offer negotiation email",
  decline: "a gracious email declining a job offer while keeping the door open",
  networking: "a request for a short informational chat",
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const type = TYPES[body.type] ? body.type : "followup"
  const context = String(body.context || "").slice(0, 4000)
  const tone = String(body.tone || "professional").slice(0, 40)
  const senderName = String(body.senderName || "").slice(0, 120)
  if (context.trim().length < 15) {
    return NextResponse.json({ error: "Add a bit of context: the role, company, who you're writing to and anything they should know." }, { status: 400 })
  }

  const prompt = `Write ${TYPES[type]}.
Tone: ${tone}. Keep it concise (90–170 words), specific and human — no clichés, no placeholders unless a detail is genuinely unknown (then use [brackets]).
Use only facts from the context; never invent names, dates or achievements.
${senderName ? `Sign off as: ${senderName}` : "Sign off with [Your name]."}

CONTEXT:
${context}

Return ONLY JSON: { "subject": "short subject line", "body": "the email body with line breaks" }`

  try {
    const out = parseJsonLoose<{ subject: string; body: string }>(await callGemini(prompt, 1500))
    const result = { subject: String(out.subject || "").trim(), body: String(out.body || "").trim() }
    if (!result.body) throw new Error("empty")
    try {
      const admin = createAdminClient()
      await admin.from("generated_items").insert({
        user_id: user.id, feature: "email_maker", prompt: type, input_data: { type, tone, context }, result, status: "done", provider: "gemini",
      })
    } catch {}
    return NextResponse.json({ result })
  } catch (err) {
    console.error("[email-maker]", err)
    return NextResponse.json({ error: "Couldn't write the email right now. Please try again." }, { status: 500 })
  }
}
