import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "ATS Resume Improver — Raise Your Match Score" },
  description: "Automatically optimize your resume for applicant tracking systems and a target job. Try the free demo.",
  alternates: { canonical: "/demo/ats-improver" },
  openGraph: { url: "/demo/ats-improver", title: "ATS Resume Improver — Raise Your Match Score", description: "Automatically optimize your resume for applicant tracking systems and a target job. Try the free demo.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
