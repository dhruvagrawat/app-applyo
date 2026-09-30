"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, GraduationCap, MessageSquare, ListChecks, Video } from "lucide-react"

const TABS = [
  { href: "/dashboard/interview", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/dashboard/interview/guide", label: "Guide", icon: GraduationCap },
  { href: "/dashboard/interview/practice", label: "Question Bank", icon: MessageSquare },
  { href: "/dashboard/interview/tests", label: "Tests", icon: ListChecks },
  { href: "/dashboard/interview/video", label: "Video Interview", icon: Video },
]

export function InterviewNav() {
  const path = usePathname()
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/40 p-1 mb-6" aria-label="Interview Studio">
      {TABS.map((t) => {
        const active = t.exact ? path === t.href : path.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs md:text-sm font-medium transition-colors ${
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
