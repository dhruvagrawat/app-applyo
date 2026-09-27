/**
 * Hand a job (and optionally resume text) from one tool to another, e.g.
 * "Cover letter" from a Job Tracker entry. Stored in sessionStorage and consumed once.
 */
const KEY = "applyo:handoff"

export interface Handoff {
  jobDescription?: string
  resumeText?: string
  jobUrl?: string
}

export function setHandoff(data: Handoff) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // storage unavailable — the tool just opens empty
  }
}

export function consumeHandoff(): Handoff | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    sessionStorage.removeItem(KEY)
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export interface JobLike {
  job_title?: string | null
  company_name?: string | null
  location?: string | null
  work_mode?: string | null
  employment_type?: string | null
  salary?: string | null
  skills?: string[] | null
  requirements?: string[] | null
  description?: string | null
  summary?: string | null
}

/** Formats parsed job data as a job-description block for the AI tools. */
export function jobToDescription(job: JobLike): string {
  const header = [
    job.job_title && job.company_name ? `${job.job_title} — ${job.company_name}` : job.job_title || job.company_name,
    [job.location, job.work_mode, job.employment_type].filter(Boolean).join(" · "),
    job.salary && `Compensation: ${job.salary}`,
  ]
    .filter(Boolean)
    .join("\n")
  const body =
    job.description?.trim() ||
    [
      job.summary,
      job.requirements?.length ? `Requirements:\n${job.requirements.map((r) => `• ${r}`).join("\n")}` : "",
      job.skills?.length ? `Skills: ${job.skills.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n")
  return `${header}\n\n${body}`.trim()
}
