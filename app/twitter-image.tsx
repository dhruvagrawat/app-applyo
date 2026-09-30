import { ogImage, OG_SIZE } from "@/lib/seo/og"

export const alt = "Applyo — AI resume, interview practice and job auto-applier"
export const size = OG_SIZE
export const contentType = "image/png"

export default function Image() {
  return ogImage({
    eyebrow: "AI Career Platform",
    title: "Land your next job faster with AI",
    subtitle: "Resumes, ATS checks, cover letters, video mock interviews, job tracking and auto-apply — in one place.",
  })
}
