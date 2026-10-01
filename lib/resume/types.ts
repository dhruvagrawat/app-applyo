/** Structured resume used by the Resume Builder. Stored in `resumes.metadata.builder`. */

export interface ResumeBasics {
  name: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
}

export interface ResumeExperience {
  id: string
  role: string
  company: string
  location: string
  start: string
  end: string
  current: boolean
  bullets: string[]
}

export interface ResumeEducation {
  id: string
  school: string
  degree: string
  start: string
  end: string
  details: string
}

export interface ResumeProject {
  id: string
  name: string
  link: string
  description: string
  bullets: string[]
}

export interface ResumeSkillGroup {
  id: string
  group: string
  items: string
}

export interface ResumeCertification {
  id: string
  name: string
  issuer: string
  date: string
}

export type ResumeTemplate = "minimal" | "classic" | "compact"

export interface ResumeSettings {
  template: ResumeTemplate
  accent: string
  font: "sans" | "serif"
}

export interface ResumeData {
  basics: ResumeBasics
  summary: string
  experience: ResumeExperience[]
  education: ResumeEducation[]
  projects: ResumeProject[]
  skills: ResumeSkillGroup[]
  certifications: ResumeCertification[]
  settings: ResumeSettings
}

export const newId = () => Math.random().toString(36).slice(2, 10)

export const ACCENTS = ["#111827", "#c2410c", "#2563eb", "#047857", "#7c3aed", "#be123c"]

export function emptyResume(): ResumeData {
  return {
    basics: { name: "", title: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "" },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    settings: { template: "minimal", accent: ACCENTS[0], font: "sans" },
  }
}

export const blankExperience = (): ResumeExperience => ({
  id: newId(), role: "", company: "", location: "", start: "", end: "", current: false, bullets: [""],
})
export const blankEducation = (): ResumeEducation => ({ id: newId(), school: "", degree: "", start: "", end: "", details: "" })
export const blankProject = (): ResumeProject => ({ id: newId(), name: "", link: "", description: "", bullets: [] })
export const blankSkill = (): ResumeSkillGroup => ({ id: newId(), group: "", items: "" })
export const blankCertification = (): ResumeCertification => ({ id: newId(), name: "", issuer: "", date: "" })

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "")
const arr = <T>(v: unknown, map: (x: any) => T, max = 30): T[] => (Array.isArray(v) ? v.slice(0, max).map(map) : [])
const bullets = (v: unknown) => arr(v, (b) => str(b, 600), 15)

/** Coerces untrusted JSON (from the DB, the client or the AI) into a valid ResumeData. */
export function normalizeResume(input: any): ResumeData {
  const base = emptyResume()
  if (!input || typeof input !== "object") return base
  const b = input.basics || {}
  const s = input.settings || {}
  return {
    basics: {
      name: str(b.name, 120), title: str(b.title, 160), email: str(b.email, 160), phone: str(b.phone, 60),
      location: str(b.location, 120), website: str(b.website, 200), linkedin: str(b.linkedin, 200), github: str(b.github, 200),
    },
    summary: str(input.summary, 1500),
    experience: arr(input.experience, (e) => ({
      id: str(e?.id, 20) || newId(), role: str(e?.role, 160), company: str(e?.company, 160), location: str(e?.location, 120),
      start: str(e?.start, 40), end: str(e?.end, 40), current: !!e?.current, bullets: bullets(e?.bullets),
    })),
    education: arr(input.education, (e) => ({
      id: str(e?.id, 20) || newId(), school: str(e?.school, 200), degree: str(e?.degree, 200),
      start: str(e?.start, 40), end: str(e?.end, 40), details: str(e?.details, 600),
    })),
    projects: arr(input.projects, (p) => ({
      id: str(p?.id, 20) || newId(), name: str(p?.name, 160), link: str(p?.link, 200),
      description: str(p?.description, 600), bullets: bullets(p?.bullets),
    })),
    skills: arr(input.skills, (g) => ({ id: str(g?.id, 20) || newId(), group: str(g?.group, 80), items: str(g?.items, 600) })),
    certifications: arr(input.certifications, (c) => ({
      id: str(c?.id, 20) || newId(), name: str(c?.name, 200), issuer: str(c?.issuer, 160), date: str(c?.date, 40),
    })),
    settings: {
      template: ["minimal", "classic", "compact"].includes(s.template) ? s.template : base.settings.template,
      accent: /^#[0-9a-f]{6}$/i.test(s.accent || "") ? s.accent : base.settings.accent,
      font: s.font === "serif" ? "serif" : "sans",
    },
  }
}

export const dateRange = (start: string, end: string, current = false) =>
  [start, current ? "Present" : end].filter(Boolean).join(" – ")

/** Plain-text version — saved as `resumes.content` so every AI tool (ATS checker, cover letter…) can use it. */
export function resumeToText(r: ResumeData): string {
  const lines: string[] = []
  const b = r.basics
  if (b.name) lines.push(b.name)
  if (b.title) lines.push(b.title)
  const contact = [b.email, b.phone, b.location, b.linkedin, b.github, b.website].filter(Boolean).join(" | ")
  if (contact) lines.push(contact)
  const section = (title: string) => lines.push("", title.toUpperCase())
  if (r.summary.trim()) {
    section("Summary")
    lines.push(r.summary.trim())
  }
  const exp = r.experience.filter((e) => e.role || e.company)
  if (exp.length) {
    section("Experience")
    for (const e of exp) {
      lines.push(`${[e.role, e.company].filter(Boolean).join(" — ")}${e.location ? `, ${e.location}` : ""} (${dateRange(e.start, e.end, e.current)})`)
      e.bullets.filter((x) => x.trim()).forEach((x) => lines.push(`• ${x.trim()}`))
    }
  }
  const proj = r.projects.filter((p) => p.name)
  if (proj.length) {
    section("Projects")
    for (const p of proj) {
      lines.push(`${p.name}${p.link ? ` (${p.link})` : ""}${p.description ? ` — ${p.description}` : ""}`)
      p.bullets.filter((x) => x.trim()).forEach((x) => lines.push(`• ${x.trim()}`))
    }
  }
  const edu = r.education.filter((e) => e.school || e.degree)
  if (edu.length) {
    section("Education")
    for (const e of edu) {
      lines.push(`${[e.degree, e.school].filter(Boolean).join(" — ")} (${dateRange(e.start, e.end)})`)
      if (e.details) lines.push(e.details)
    }
  }
  const skills = r.skills.filter((s) => s.items.trim())
  if (skills.length) {
    section("Skills")
    skills.forEach((s) => lines.push(s.group ? `${s.group}: ${s.items}` : s.items))
  }
  const certs = r.certifications.filter((c) => c.name)
  if (certs.length) {
    section("Certifications")
    certs.forEach((c) => lines.push([c.name, c.issuer, c.date].filter(Boolean).join(" — ")))
  }
  return lines.join("\n").trim()
}

/** 0–100 completeness score with the most useful next step. */
export function resumeCompleteness(r: ResumeData): { score: number; tips: string[] } {
  const checks: [boolean, number, string][] = [
    [!!r.basics.name && !!r.basics.email, 15, "Add your name and email"],
    [!!r.basics.title, 5, "Add a headline title (e.g. “Product Designer”)"],
    [!!r.basics.phone || !!r.basics.linkedin, 5, "Add a phone number or LinkedIn"],
    [r.summary.trim().split(/\s+/).length >= 20, 10, "Write a 2–3 sentence summary"],
    [r.experience.some((e) => e.role && e.company), 20, "Add at least one role in Experience"],
    [r.experience.flatMap((e) => e.bullets).filter((b) => b.trim()).length >= 3, 15, "Add 3+ achievement bullets"],
    [r.experience.flatMap((e) => e.bullets).some((b) => /\d/.test(b)), 10, "Quantify a bullet with a number (%, $, time, scale)"],
    [r.education.some((e) => e.school), 10, "Add your education"],
    [r.skills.some((s) => s.items.split(",").filter((x) => x.trim()).length >= 4), 10, "List at least 4 skills"],
  ]
  let score = 0
  const tips: string[] = []
  for (const [ok, pts, tip] of checks) ok ? (score += pts) : tips.push(tip)
  return { score, tips }
}
