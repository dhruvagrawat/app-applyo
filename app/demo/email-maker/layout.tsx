import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "AI Job Email Writer — Follow-Ups & Thank-Yous" },
  description: "Write interview thank-you notes, follow-ups and cold outreach emails with AI. Free demo, no sign-up.",
  alternates: { canonical: "/demo/email-maker" },
  openGraph: { url: "/demo/email-maker", title: "AI Job Email Writer — Follow-Ups & Thank-Yous", description: "Write interview thank-you notes, follow-ups and cold outreach emails with AI. Free demo, no sign-up.", images: ["/opengraph-image"] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
