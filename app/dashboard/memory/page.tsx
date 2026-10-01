import { redirect } from "next/navigation"

// The Resume Vault now lives in the Resume Builder.
export default function ResumeVaultRedirect() {
  redirect("/dashboard/resumes")
}
