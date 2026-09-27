import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { type NextRequest, NextResponse } from "next/server"
import { APPLICATION_PROFILE_FIELDS, type ApplicationProfile } from "@/lib/auto-apply/profile"

async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin.from("profiles").select("full_name, application_profile").eq("id", user.id).maybeSingle()
  const profile: ApplicationProfile = {
    full_name: data?.full_name || "",
    email: user.email || "",
    ...(data?.application_profile || {}),
  }
  return NextResponse.json({ profile })
}

export async function PUT(request: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const clean: ApplicationProfile = {}
  for (const key of APPLICATION_PROFILE_FIELDS) {
    if (typeof body?.[key] === "string") clean[key] = body[key].slice(0, 2000)
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from("profiles")
    .upsert({ id: user.id, application_profile: clean, updated_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: clean })
}
