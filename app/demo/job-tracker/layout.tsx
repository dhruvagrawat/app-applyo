import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Smart Job Application Tracker" },
  description: "Track every job application in one place — paste a link and AI extracts the company, salary, skills and red flags. Free demo.",
  alternates: { canonical: "/demo/job-tracker" },
  openGraph: { url: "/demo/job-tracker", title: "Smart Job Application Tracker", description: "Track every job application in one place — paste a link and AI extracts the company, salary, skills and red flags. Free demo.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
