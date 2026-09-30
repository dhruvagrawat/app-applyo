import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "AI Cover Letter Generator — Tailored in Seconds" },
  description: "Generate a tailored cover letter from your resume and any job description. Try Applyo's free AI cover letter demo.",
  alternates: { canonical: "/demo/cover-letter" },
  openGraph: { url: "/demo/cover-letter", title: "AI Cover Letter Generator — Tailored in Seconds", description: "Generate a tailored cover letter from your resume and any job description. Try Applyo's free AI cover letter demo.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
