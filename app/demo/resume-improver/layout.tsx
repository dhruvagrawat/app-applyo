import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "AI Resume Improver — Rewrite Your Resume Free" },
  description: "Paste your resume and get AI-rewritten bullet points with stronger action verbs, metrics and ATS keywords. Free demo, no sign-up.",
  alternates: { canonical: "/demo/resume-improver" },
  openGraph: { url: "/demo/resume-improver", title: "AI Resume Improver — Rewrite Your Resume Free", description: "Paste your resume and get AI-rewritten bullet points with stronger action verbs, metrics and ATS keywords. Free demo, no sign-up.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
