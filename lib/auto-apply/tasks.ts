import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ApplicationProfile } from "@/lib/auto-apply/profile"

export interface AutoTask {
  id: string
  user_id: string
  target_url: string
  status: string
  steel_session_id: string | null
  live_view_url: string | null
  current_url: string | null
  job_title: string | null
  company_name: string | null
  logs: any[]
  rules: Record<string, any>
  created_at: string
}

export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** Loads a task only if it belongs to the user. */
export async function loadTask(taskId: string, userId: string): Promise<AutoTask | null> {
  const admin = createAdminClient()
  const { data } = await admin.from("auto_tasks").select("*").eq("id", taskId).eq("user_id", userId).maybeSingle()
  return (data as AutoTask) || null
}

export async function updateTask(taskId: string, patch: Partial<AutoTask>, appendLog?: Record<string, any>) {
  const admin = createAdminClient()
  let logs: any[] | undefined
  if (appendLog) {
    const { data } = await admin.from("auto_tasks").select("logs").eq("id", taskId).single()
    logs = [...((data?.logs as any[]) || []), { at: new Date().toISOString(), ...appendLog }].slice(-100)
  }
  await admin
    .from("auto_tasks")
    .update({ ...patch, ...(logs ? { logs } : {}), updated_at: new Date().toISOString() })
    .eq("id", taskId)
}

/** Everything the agent knows about the candidate. */
export async function loadCandidate(userId: string, email?: string | null) {
  const admin = createAdminClient()
  const [{ data: profileRow }, { data: resume }] = await Promise.all([
    admin.from("profiles").select("full_name, headline, application_profile").eq("id", userId).maybeSingle(),
    admin
      .from("resumes")
      .select("content, raw_text")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])
  const profile: ApplicationProfile = {
    full_name: profileRow?.full_name || "",
    email: email || "",
    current_title: profileRow?.headline || "",
    ...(profileRow?.application_profile || {}),
  }
  return { profile, resumeText: resume?.content || resume?.raw_text || "" }
}
