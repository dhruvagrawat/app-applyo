import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Free ATS Resume Checker — Score Your Resume" },
  description: "Check your resume against a job description: ATS match score, missing keywords and formatting issues. Free demo, no sign-up.",
  alternates: { canonical: "/demo/ats-checker" },
  openGraph: { url: "/demo/ats-checker", title: "Free ATS Resume Checker — Score Your Resume", description: "Check your resume against a job description: ATS match score, missing keywords and formatting issues. Free demo, no sign-up.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
