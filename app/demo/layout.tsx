import type { Metadata } from "next"
import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { DemoBanner } from "@/components/demo-banner"
import { DemoTutorial, TutorialRestartButton } from "@/components/demo-tutorial"
import { ThemeCustomizer } from "@/components/theme-customizer"
import { HelpAssistant } from "@/components/help-assistant"
import { CommandPalette } from "@/components/command-palette"
import { DEMO_USER } from "@/lib/demo/data"

export const metadata: Metadata = {
  title: { default: "Interactive Demo — Try Every AI Career Tool Free", template: "%s — Demo | Applyo" },
  description:
    "Try Applyo's AI resume improver, ATS checker, cover letter maker, job tracker and more with sample data. No sign-up required.",
  alternates: { canonical: "/demo" },
}

function DemoTopbar() {
  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-6 animate-slide-down">
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <CommandPalette basePath="/demo" />
      </div>
      <div className="flex items-center gap-3">
        <TutorialRestartButton />
        <ThemeCustomizer />
        <div className="flex items-center gap-2 p-1.5 rounded-lg">
          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-semibold">{DEMO_USER.initials}</span>
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-xs font-medium text-foreground leading-tight">{DEMO_USER.name}</span>
            <span className="text-[10px] text-muted-foreground leading-tight">{DEMO_USER.email}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <DemoBanner />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar basePath="/demo" isDemo />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DemoTopbar />
          <main className="flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
      </div>
      <DemoTutorial />
      <HelpAssistant basePath="/demo" />
    </div>
  )
}
