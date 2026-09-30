import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "AI Interview Question Generator" },
  description: "Generate likely interview questions and answer tips for any role and job description. Free demo.",
  alternates: { canonical: "/demo/interview-questions" },
  openGraph: { url: "/demo/interview-questions", title: "AI Interview Question Generator", description: "Generate likely interview questions and answer tips for any role and job description. Free demo.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
