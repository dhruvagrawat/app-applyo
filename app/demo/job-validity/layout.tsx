import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Fake Job Posting Checker — Spot Job Scams" },
  description: "Paste a job posting to check for scam red flags and legitimacy concerns with AI. Free demo.",
  alternates: { canonical: "/demo/job-validity" },
  openGraph: { url: "/demo/job-validity", title: "Fake Job Posting Checker — Spot Job Scams", description: "Paste a job posting to check for scam red flags and legitimacy concerns with AI. Free demo.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
