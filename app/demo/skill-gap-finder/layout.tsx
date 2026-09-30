import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Skill Gap Finder — What's Missing for Your Target Job" },
  description: "Find the skills you need for your target role and how to close the gap. Free AI demo.",
  alternates: { canonical: "/demo/skill-gap-finder" },
  openGraph: { url: "/demo/skill-gap-finder", title: "Skill Gap Finder — What's Missing for Your Target Job", description: "Find the skills you need for your target role and how to close the gap. Free AI demo.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
