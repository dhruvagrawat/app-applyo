import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Tailor Everything — Resume, Cover Letter & ATS in One Click" },
  description: "Tailor your resume and cover letter to a job and get an ATS report in one step. Free demo.",
  alternates: { canonical: "/demo/tailor" },
  openGraph: { url: "/demo/tailor", title: "Tailor Everything — Resume, Cover Letter & ATS in One Click", description: "Tailor your resume and cover letter to a job and get an ATS report in one step. Free demo.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
