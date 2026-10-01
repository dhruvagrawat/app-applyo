import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Resume Builder" }

export default function ResumesLayout({ children }: { children: React.ReactNode }) {
  return children
}
