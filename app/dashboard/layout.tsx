import type { Metadata } from "next"
import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { HelpAssistant } from "@/components/help-assistant"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Applyo" },
  robots: { index: false, follow: false },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
      <HelpAssistant basePath="/dashboard" />
      <OnboardingWizard basePath="/dashboard" />
    </div>
  )
}
