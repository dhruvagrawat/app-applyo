import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Resume vs Job Description Match Score" },
  description: "Compare your resume to any job description and get a match score, strengths and gaps. Free demo.",
  alternates: { canonical: "/demo/job-resume-compare" },
  openGraph: { url: "/demo/job-resume-compare", title: "Resume vs Job Description Match Score", description: "Compare your resume to any job description and get a match score, strengths and gaps. Free demo.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
