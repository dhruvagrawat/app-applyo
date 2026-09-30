import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "AI Job Finder — Roles That Match Your Resume" },
  description: "Discover job titles and roles that fit your resume and skills with AI. Free demo.",
  alternates: { canonical: "/demo/job-finder" },
  openGraph: { url: "/demo/job-finder", title: "AI Job Finder — Roles That Match Your Resume", description: "Discover job titles and roles that fit your resume and skills with AI. Free demo.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
