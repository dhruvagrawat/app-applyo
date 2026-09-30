import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Best-effort logging — never fails the request if a table is missing. */
export async function logInterviewItem(userId: string, feature: string, input: unknown, result: unknown, meta: Record<string, unknown> = {}) {
  try {
    const admin = createAdminClient()
    await admin.from("generated_items").insert({
      user_id: userId,
      feature,
      prompt: feature,
      input_data: input,
      result,
      meta,
      status: "done",
      provider: "gemini",
    })
  } catch (err) {
    console.warn("[interview] log failed:", (err as Error).message)
  }
}
