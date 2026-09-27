import { callGemini } from "@/lib/gemini"
import { fetchJobPage, htmlToText } from "@/lib/jobs/fetch-page"

export interface ParsedJob {
  job_title: string
  company_name: string
  location: string | null
  work_mode: "remote" | "hybrid" | "onsite" | null
  employment_type: string | null
  salary: string | null
  seniority: string | null
  summary: string
  skills: string[]
  requirements: string[]
  responsibilities: string[]
  deadline: string | null
  apply_url: string | null
  job_url: string | null
  source: string | null
  description: string
  red_flags: string[]
}

/** Extracts the first JSON object from a model response. */
export function parseJsonLoose<T = any>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("AI response did not contain JSON")
  return JSON.parse(match[0]) as T
}

function sourceFromUrl(url: string | null): string | null {
  if (!url) return null
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    const known: Record<string, string> = {
      "linkedin.com": "LinkedIn",
      "indeed.com": "Indeed",
      "greenhouse.io": "Greenhouse",
      "lever.co": "Lever",
      "myworkdayjobs.com": "Workday",
      "ashbyhq.com": "Ashby",
      "wellfound.com": "Wellfound",
      "glassdoor.com": "Glassdoor",
      "smartrecruiters.com": "SmartRecruiters",
    }
    for (const [domain, name] of Object.entries(known)) if (host.endsWith(domain)) return name
    return host
  } catch {
    return null
  }
}

function jsonLdSummary(job: Record<string, any>): string {
  const org = typeof job.hiringOrganization === "object" ? job.hiringOrganization?.name : job.hiringOrganization
  const loc = [job.jobLocation].flat().filter(Boolean).map((l: any) => {
    const a = l?.address || {}
    return [a.addressLocality, a.addressRegion, a.addressCountry?.name || a.addressCountry].filter(Boolean).join(", ")
  })
  const salary = job.baseSalary?.value
    ? `${job.baseSalary.currency || ""} ${job.baseSalary.value.minValue ?? job.baseSalary.value.value ?? ""}-${job.baseSalary.value.maxValue ?? ""} ${job.baseSalary.value.unitText || ""}`
    : ""
  return [
    `Title: ${job.title || ""}`,
    `Company: ${org || ""}`,
    `Location: ${loc.join(" | ")}${job.jobLocationType ? ` (${job.jobLocationType})` : ""}`,
    `Employment type: ${[job.employmentType].flat().join(", ")}`,
    salary && `Salary: ${salary}`,
    job.validThrough && `Valid through: ${job.validThrough}`,
    `Date posted: ${job.datePosted || ""}`,
    `Description:\n${htmlToText(String(job.description || ""))}`,
  ]
    .filter(Boolean)
    .join("\n")
}

/**
 * Turns a job URL and/or pasted job text into structured job data.
 * If the URL can't be fetched (e.g. login wall) and no text is given, throws a helpful error.
 */
export async function parseJob({ url, text }: { url?: string; text?: string }): Promise<ParsedJob> {
  let context = ""
  let finalUrl: string | null = url?.trim() || null
  let fetchError: string | null = null

  if (finalUrl) {
    try {
      const page = await fetchJobPage(finalUrl)
      finalUrl = page.url
      context = page.jsonLdJob
        ? `STRUCTURED JOB DATA (schema.org JobPosting):\n${jsonLdSummary(page.jsonLdJob)}\n\nPAGE TEXT:\n${page.text.slice(0, 6000)}`
        : `PAGE TITLE: ${page.title}\nMETA: ${page.metaDescription}\n\nPAGE TEXT:\n${page.text.slice(0, 14000)}`
    } catch (err) {
      fetchError = err instanceof Error ? err.message : String(err)
    }
  }

  if (text?.trim()) context = `${context}\n\nUSER-PROVIDED JOB TEXT:\n${text.trim().slice(0, 14000)}`.trim()

  if (context.replace(/\s/g, "").length < 80) {
    throw new Error(
      fetchError
        ? `Couldn't read that page (${fetchError}). Some sites like LinkedIn block bots — paste the job description text instead.`
        : "Not enough job information. Paste the job description text.",
    )
  }

  const prompt = `You are Applyo's job posting parser. Extract structured information about the job posting below.
If the content is a login page, search results page or not a job posting, set "job_title" to "" .

${finalUrl ? `JOB URL: ${finalUrl}\n` : ""}
${context}

Return ONLY valid JSON with exactly these keys:
{
  "job_title": "string",
  "company_name": "string",
  "location": "string or null",
  "work_mode": "remote" | "hybrid" | "onsite" | null,
  "employment_type": "Full-time/Part-time/Contract/Internship or null",
  "salary": "human readable salary range or null",
  "seniority": "Intern/Junior/Mid/Senior/Lead/Manager or null",
  "summary": "2-3 sentence plain-English summary of the role",
  "skills": ["up to 15 key skills/technologies"],
  "requirements": ["up to 8 key requirements"],
  "responsibilities": ["up to 8 key responsibilities"],
  "deadline": "YYYY-MM-DD or null",
  "apply_url": "direct application URL if present, else null",
  "description": "the full job description as clean plain text (keep all requirements; max ~6000 chars)",
  "red_flags": ["possible scam or quality concerns; empty if none"]
}`

  const job = parseJsonLoose<ParsedJob>(await callGemini(prompt, 6000))
  if (!job.job_title?.trim()) {
    throw new Error(
      "That page doesn't look like a job posting (it may require login). Paste the job description text instead.",
    )
  }

  return {
    job_title: job.job_title.trim(),
    company_name: job.company_name?.trim() || "Unknown company",
    location: job.location || null,
    work_mode: job.work_mode || null,
    employment_type: job.employment_type || null,
    salary: job.salary || null,
    seniority: job.seniority || null,
    summary: job.summary || "",
    skills: Array.isArray(job.skills) ? job.skills.slice(0, 15) : [],
    requirements: Array.isArray(job.requirements) ? job.requirements.slice(0, 8) : [],
    responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.slice(0, 8) : [],
    deadline: job.deadline || null,
    apply_url: job.apply_url || finalUrl,
    job_url: finalUrl,
    source: sourceFromUrl(finalUrl),
    description: job.description || text?.trim() || "",
    red_flags: Array.isArray(job.red_flags) ? job.red_flags : [],
  }
}
