import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Your Free Account",
  description:
    "Sign up free for Applyo: AI resume improvement, ATS checks, cover letters, video mock interviews with AI feedback, a smart job tracker and auto-apply.",
  alternates: { canonical: "/auth/sign-up" },
  robots: { index: true, follow: true },
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children
}
