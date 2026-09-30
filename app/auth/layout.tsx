import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: true },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
