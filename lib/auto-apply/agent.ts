import { chromium, type Frame, type Page } from "playwright-core"
import { callGemini } from "@/lib/gemini"
import { parseJsonLoose } from "@/lib/jobs/parse-job"
import { steelCdpUrl } from "@/lib/auto-apply/steel"
import type { ApplicationProfile } from "@/lib/auto-apply/profile"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SnapshotField {
  id: string
  tag: string
  type: string
  label: string
  name: string
  required: boolean
  value: string
  checked?: boolean
  options?: string[]
}

export interface SnapshotButton {
  id: string
  text: string
  kind: "button" | "link" | "submit"
  href?: string
}

export interface PageSnapshot {
  url: string
  title: string
  text: string
  fields: SnapshotField[]
  buttons: SnapshotButton[]
}

export type AgentStatus = "continue" | "ready_to_submit" | "needs_user" | "done"

export interface AgentPlan {
  page_type: string
  job?: { title?: string; company?: string; location?: string }
  summary: string
  fills: { id: string; value: string }[]
  upload_resume_ids: string[]
  click: { id: string; reason: string } | null
  submit_id: string | null
  needs_user: string | null
  status: AgentStatus
}

export interface StepAction {
  kind: "fill" | "upload" | "click" | "submit" | "navigate" | "info"
  target?: string
  value?: string
  ok: boolean
  error?: string
}

export interface StepResult {
  url: string
  title: string
  plan: AgentPlan | null
  actions: StepAction[]
  status: AgentStatus
  message: string
  unanswered: string[]
}

export interface ResumeFile {
  name: string
  mimeType: string
  base64: string
}

export interface AgentContext {
  profile: ApplicationProfile
  resumeText: string
  resumeFile?: ResumeFile | null
  jobHint?: string
  instructions?: string
}

// ---------------------------------------------------------------------------
// Browser connection
// ---------------------------------------------------------------------------

/** Connects to the Steel session over CDP, runs `fn` on the active tab, then disconnects (session stays alive). */
export async function withSessionPage<T>(steelSessionId: string, fn: (page: Page) => Promise<T>): Promise<T> {
  const browser = await chromium.connectOverCDP(steelCdpUrl(steelSessionId), { timeout: 20_000 })
  try {
    const context = browser.contexts()[0] ?? (await browser.newContext())
    const pages = context.pages().filter((p) => !p.isClosed())
    const page = pages[pages.length - 1] ?? (await context.newPage())
    page.setDefaultTimeout(8_000)
    return await fn(page)
  } finally {
    // For CDP connections this only closes the websocket — the Steel browser keeps running.
    await browser.close().catch(() => {})
  }
}

export async function navigate(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 })
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => {})
}

// ---------------------------------------------------------------------------
// Page snapshot (runs inside the browser)
// ---------------------------------------------------------------------------

/**
 * Runs inside each frame. Kept as a plain JS string (not a TS function) so bundler
 * transforms (e.g. injected helpers) can never leak into the browser context.
 */
const SNAPSHOT_SCRIPT = `(framePrefix) => {
  const w = window
  w.__applyoCounter = w.__applyoCounter || 0
  const assignId = (el) => {
    let id = el.getAttribute("data-applyo-id")
    if (!id) {
      id = \`\${framePrefix}\${++w.__applyoCounter}\`
      el.setAttribute("data-applyo-id", id)
    }
    return id
  }
  const clean = (s) => (s || "").replace(/\\s+/g, " ").trim()
  const visible = (el) => {
    const he = el
    const style = getComputedStyle(he)
    if (style.display === "none" || style.visibility === "hidden") return false
    const r = he.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }
  const labelFor = (el) => {
    const aria = el.getAttribute("aria-label")
    if (aria) return clean(aria)
    const labelledBy = el.getAttribute("aria-labelledby")
    if (labelledBy) {
      const t = labelledBy
        .split(/\\s+/)
        .map((i) => document.getElementById(i)?.textContent || "")
        .join(" ")
      if (clean(t)) return clean(t)
    }
    if (el.id) {
      const l = document.querySelector(\`label[for="\${CSS.escape(el.id)}"]\`)
      if (l && clean(l.textContent)) return clean(l.textContent)
    }
    const wrap = el.closest("label")
    if (wrap && clean(wrap.textContent)) return clean(wrap.textContent)
    // Walk up a few levels looking for question text (common in Greenhouse/Lever/Workday).
    let node = el.parentElement
    for (let i = 0; i < 4 && node; i++, node = node.parentElement) {
      const lab = node.querySelector("label, legend, [class*='label'], [class*='question']")
      if (lab && !lab.contains(el) && clean(lab.textContent)) return clean(lab.textContent).slice(0, 200)
    }
    return clean(el.getAttribute("placeholder") || el.getAttribute("name") || "")
  }

  // Radios/checkboxes: prefix the option label with its question ("Need sponsorship? — No").
  const groupLabel = (el, type) => {
    if (type !== "radio" && type !== "checkbox") return ""
    const fs = el.closest("fieldset, [role='radiogroup'], [role='group']")
    if (!fs) return ""
    const q = fs.querySelector("legend, [class*='label'], [class*='question']")
    const text = clean(q ? q.textContent : fs.getAttribute("aria-label"))
    return text && !(el.closest("label") && el.closest("label").contains(q)) ? text.slice(0, 150) + " — " : ""
  }

  const fields = []
  const els = Array.from(
    document.querySelectorAll("input, textarea, select, [role='combobox'], [contenteditable='true']"),
  )
  for (const el of els) {
    if (fields.length >= 120) break
    const tag = el.tagName.toLowerCase()
    const type = (el.getAttribute("type") || (tag === "input" ? "text" : tag)).toLowerCase()
    if (["hidden", "submit", "button", "image", "reset"].includes(type)) continue
    // File inputs are often visually hidden behind a styled button — keep them.
    if (type !== "file" && !visible(el)) continue
    if (tag === "input" && el.closest("[role='combobox']") && el.getAttribute("role") !== "combobox") continue
    const f = {
      id: assignId(el),
      tag,
      type,
      label: groupLabel(el, type) + labelFor(el).slice(0, 200),
      name: el.getAttribute("name") || "",
      required: (el).required || el.getAttribute("aria-required") === "true",
      value: "",
    }
    if (tag === "select") {
      const s = el
      f.options = Array.from(s.options)
        .map((o) => clean(o.textContent))
        .filter(Boolean)
        .slice(0, 60)
      f.value = clean(s.selectedOptions[0]?.textContent)
    } else if (type === "checkbox" || type === "radio") {
      f.checked = (el).checked
      f.value = (el).value
    } else if (type === "file") {
      f.value = (el).files?.length ? "(file attached)" : ""
    } else if (el.getAttribute("contenteditable") === "true") {
      f.value = clean(el.textContent).slice(0, 200)
    } else {
      f.value = ((el).value || "").slice(0, 200)
    }
    fields.push(f)
  }

  const buttons = []
  const clickables = Array.from(
    document.querySelectorAll("button, a[href], [role='button'], input[type='submit'], input[type='button']"),
  )
  const scored = clickables
    .filter(visible)
    .map((el) => {
      const text = clean(el.innerText || (el).value || el.getAttribute("aria-label") || "")
      const score = /apply|submit|next|continue|review|easy apply|save and continue/i.test(text) ? 0 : 1
      return { el, text, score }
    })
    .filter((b) => b.text && b.text.length < 80)
    .sort((a, b) => a.score - b.score)
    .slice(0, 50)
  for (const { el, text } of scored) {
    const tag = el.tagName.toLowerCase()
    const isSubmit = (el).type === "submit" || el.getAttribute("type") === "submit"
    buttons.push({
      id: assignId(el),
      text,
      kind: isSubmit ? "submit" : tag === "a" ? "link" : "button",
      href: tag === "a" ? (el).href : undefined,
    })
  }

  return {
    url: location.href,
    title: document.title,
    text: clean(document.body?.innerText || "").slice(0, 3500),
    fields,
    buttons,
  }
}`

function snapshotExpression(prefix: string): string {
  return `(${SNAPSHOT_SCRIPT})(${JSON.stringify(prefix)})`
}

export async function snapshotPage(page: Page): Promise<PageSnapshot> {
  await page.waitForLoadState("domcontentloaded").catch(() => {})
  const frames = page.frames().slice(0, 6)
  const main = await page.mainFrame().evaluate<PageSnapshot>(snapshotExpression("m"))
  const snapshot: PageSnapshot = { ...main }
  // Many ATS (e.g. embedded Greenhouse) render the form inside an iframe.
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]
    if (frame === page.mainFrame()) continue
    try {
      const sub = await frame.evaluate<PageSnapshot>(snapshotExpression(`f${i}_`))
      snapshot.fields.push(...sub.fields)
      snapshot.buttons.push(...sub.buttons)
      if (sub.fields.length > 2) snapshot.text += `\n[iframe ${sub.url}]\n${sub.text.slice(0, 1500)}`
    } catch {
      // cross-origin or detached frame — skip
    }
  }
  snapshot.fields = snapshot.fields.slice(0, 150)
  snapshot.buttons = snapshot.buttons.slice(0, 70)
  return snapshot
}

async function locate(page: Page, id: string) {
  const selector = `[data-applyo-id="${id.replace(/"/g, "")}"]`
  for (const frame of page.frames()) {
    const loc = (frame as Frame).locator(selector)
    if ((await loc.count().catch(() => 0)) > 0) return loc.first()
  }
  throw new Error(`Element ${id} not found (the page may have changed)`)
}

// ---------------------------------------------------------------------------
// Planning (Gemini)
// ---------------------------------------------------------------------------

function buildPlanPrompt(snapshot: PageSnapshot, ctx: AgentContext, mode: "fill" | "submit"): string {
  const profile = Object.entries(ctx.profile)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")

  return `You are Applyo's job application agent, operating a real web browser on behalf of the candidate.
You see a snapshot of the current page (form fields and clickable elements, each with an "id").
Decide what to do on THIS page only.

GOALS
- If this is a job listing, find the button/link that starts the application ("Apply", "Easy Apply", "Apply now", "I'm interested") and click it.
- If this is an application form, fill every field you can using the candidate profile and resume.
- For multi-step forms, fill the current step, then click "Next"/"Continue"/"Save and continue" via "click".
- NEVER click the FINAL submit button yourself — report it in "submit_id" and set status "ready_to_submit".
  (Final submit = "Submit application", "Submit", "Send application", "Apply" on the last step.)
- If login/signup, CAPTCHA, email verification or a question you can't answer truthfully blocks progress, set status "needs_user" and explain in "needs_user".
- If the page confirms the application was sent, set status "done".

RULES
- Never invent facts (employers, degrees, dates, numbers). Use only the profile & resume. Leave unknown fields out and list them in "needs_user".
- Open-ended questions ("Why do you want to work here?", "Cover letter") may be answered in 2-5 honest sentences grounded in the resume and the job.
- For select fields, "value" must be one of the listed options, exactly.
- For checkboxes/radios, include the id of the option to select with value "true". Only check consent/terms boxes that are clearly required for applying.
- For demographic (EEO) questions use the profile value if given; otherwise choose the "Decline to self-identify"/"Prefer not to say" style option.
- Put file inputs meant for a resume/CV in "upload_resume_ids". Skip non-resume file inputs.
- Skip fields that already hold the correct value.
${mode === "submit" ? "- The user has APPROVED submission. Put the final submit button's id in \"click\" and set status \"continue\"." : ""}
${ctx.instructions ? `\nUSER INSTRUCTIONS: ${ctx.instructions}` : ""}
${ctx.jobHint ? `\nTARGET JOB: ${ctx.jobHint}` : ""}

CANDIDATE PROFILE
${profile || "(empty — rely on resume)"}

RESUME
${ctx.resumeText.slice(0, 7000) || "(no resume provided)"}
${ctx.resumeFile ? `\nA resume file "${ctx.resumeFile.name}" is available for upload.` : "\nNo resume file is available for upload — mention this in needs_user if a resume upload is required."}

CURRENT PAGE
URL: ${snapshot.url}
TITLE: ${snapshot.title}
TEXT (truncated): ${snapshot.text.slice(0, 3000)}

FIELDS
${JSON.stringify(snapshot.fields)}

CLICKABLE ELEMENTS
${JSON.stringify(snapshot.buttons)}

Return ONLY valid JSON:
{
  "page_type": "job_listing" | "application_form" | "login" | "search_results" | "confirmation" | "captcha" | "other",
  "job": { "title": "", "company": "", "location": "" },
  "summary": "one or two sentences: what this page is and what you are doing",
  "fills": [{ "id": "m12", "value": "text / exact option / true" }],
  "upload_resume_ids": [],
  "click": { "id": "m40", "reason": "Open the application form" } | null,
  "submit_id": "m55" | null,
  "needs_user": "what the user must do or answer" | null,
  "status": "continue" | "ready_to_submit" | "needs_user" | "done"
}`
}

export async function planStep(snapshot: PageSnapshot, ctx: AgentContext, mode: "fill" | "submit"): Promise<AgentPlan> {
  const raw = await callGemini(buildPlanPrompt(snapshot, ctx, mode), 6000)
  const plan = parseJsonLoose<Partial<AgentPlan>>(raw)
  const status: AgentStatus = ["continue", "ready_to_submit", "needs_user", "done"].includes(plan.status as string)
    ? (plan.status as AgentStatus)
    : "needs_user"
  return {
    page_type: plan.page_type || "other",
    job: plan.job,
    summary: plan.summary || "",
    fills: Array.isArray(plan.fills) ? plan.fills.filter((f) => f && f.id && f.value != null) : [],
    upload_resume_ids: Array.isArray(plan.upload_resume_ids) ? plan.upload_resume_ids : [],
    click: plan.click && plan.click.id ? plan.click : null,
    submit_id: plan.submit_id || null,
    needs_user: plan.needs_user || null,
    status,
  }
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

function matchOption(options: string[], wanted: string): string | null {
  const w = wanted.trim().toLowerCase()
  return (
    options.find((o) => o.toLowerCase() === w) ||
    options.find((o) => o.toLowerCase().startsWith(w)) ||
    options.find((o) => o.toLowerCase().includes(w)) ||
    options.find((o) => w.includes(o.toLowerCase()) && o.length > 1) ||
    null
  )
}

async function applyFill(page: Page, field: SnapshotField | undefined, id: string, value: string) {
  const loc = await locate(page, id)
  const type = field?.type || "text"
  const truthy = /^(true|yes|1|checked)$/i.test(value.trim())

  if (field?.tag === "select") {
    const option = matchOption(field.options || [], value) || value
    await loc.selectOption({ label: option }).catch(async () => {
      await loc.selectOption(value)
    })
    return
  }
  if (type === "checkbox" || type === "radio") {
    if (truthy) await loc.check({ force: true })
    else if (type === "checkbox") await loc.uncheck({ force: true })
    return
  }
  if (type === "combobox" || field?.tag === "div" || (await loc.getAttribute("role")) === "combobox") {
    // Custom dropdowns (react-select etc.): type then pick the highlighted option.
    await loc.click()
    await loc.pressSequentially(value, { delay: 20 }).catch(() => page.keyboard.type(value, { delay: 20 }))
    await page.waitForTimeout(600)
    await page.keyboard.press("Enter")
    return
  }
  if ((await loc.getAttribute("contenteditable")) === "true") {
    await loc.click()
    await page.keyboard.type(value, { delay: 5 })
    return
  }
  await loc.fill(value)
  // Location/autocomplete inputs often need a suggestion picked.
  if (/location|city|address/i.test(field?.label || "")) {
    await page.waitForTimeout(700)
    const option = page.locator("[role='option']").first()
    if (await option.isVisible().catch(() => false)) await option.click().catch(() => {})
  }
}

async function clickAndSettle(page: Page, id: string): Promise<Page> {
  const loc = await locate(page, id)
  const context = page.context()
  const before = context.pages().length
  await loc.scrollIntoViewIfNeeded().catch(() => {})
  await loc.click()
  await page.waitForLoadState("domcontentloaded", { timeout: 10_000 }).catch(() => {})
  await page.waitForTimeout(1_500)
  const pages = context.pages()
  if (pages.length > before) {
    // "Apply" opened a new tab — follow it.
    const newest = pages[pages.length - 1]
    await newest.waitForLoadState("domcontentloaded", { timeout: 15_000 }).catch(() => {})
    await newest.bringToFront().catch(() => {})
    return newest
  }
  return page
}

/**
 * One agent step: snapshot the page, ask Gemini for a plan, execute fills/uploads,
 * and optionally click through to the next page. Never clicks final submit unless mode === "submit".
 */
export async function runAgentStep(page: Page, ctx: AgentContext, mode: "fill" | "submit"): Promise<StepResult> {
  const snapshot = await snapshotPage(page)
  const plan = await planStep(snapshot, ctx, mode)
  return executePlan(page, snapshot, plan, ctx, mode)
}

/** Applies a plan to the page. Separate from planning so it can be tested without the model. */
export async function executePlan(
  page: Page,
  snapshot: PageSnapshot,
  plan: AgentPlan,
  ctx: Pick<AgentContext, "resumeFile">,
  mode: "fill" | "submit",
): Promise<StepResult> {
  const actions: StepAction[] = []
  const fieldById = new Map(snapshot.fields.map((f) => [f.id, f]))
  const buttonById = new Map(snapshot.buttons.map((b) => [b.id, b]))

  for (const { id, value } of plan.fills) {
    const field = fieldById.get(id)
    if (field?.type === "file") continue
    try {
      await applyFill(page, field, id, String(value))
      actions.push({ kind: "fill", target: field?.label || id, value: String(value).slice(0, 120), ok: true })
    } catch (err) {
      actions.push({ kind: "fill", target: field?.label || id, ok: false, error: (err as Error).message.slice(0, 160) })
    }
  }

  for (const id of plan.upload_resume_ids) {
    const field = fieldById.get(id)
    if (!ctx.resumeFile) {
      actions.push({ kind: "upload", target: field?.label || id, ok: false, error: "No resume file attached" })
      continue
    }
    try {
      const loc = await locate(page, id)
      await loc.setInputFiles({
        name: ctx.resumeFile.name,
        mimeType: ctx.resumeFile.mimeType,
        buffer: Buffer.from(ctx.resumeFile.base64, "base64"),
      })
      actions.push({ kind: "upload", target: field?.label || id, value: ctx.resumeFile.name, ok: true })
    } catch (err) {
      actions.push({ kind: "upload", target: field?.label || id, ok: false, error: (err as Error).message.slice(0, 160) })
    }
  }

  let status = plan.status
  let activePage = page
  // In approved-submit mode, fall back to the detected submit button if the model didn't pick one.
  const clickTarget = plan.click ?? (mode === "submit" && plan.submit_id ? { id: plan.submit_id, reason: "Submit" } : null)
  // Guard: in fill mode, refuse to click what the model itself flagged as the final submit.
  const clickIsSubmit = !!clickTarget && mode === "fill" && clickTarget.id === plan.submit_id
  if (clickTarget && !clickIsSubmit && (status === "continue" || mode === "submit")) {
    const btn = buttonById.get(clickTarget.id)
    try {
      activePage = await clickAndSettle(page, clickTarget.id)
      actions.push({ kind: mode === "submit" ? "submit" : "click", target: btn?.text || clickTarget.id, ok: true })
    } catch (err) {
      actions.push({ kind: "click", target: btn?.text || clickTarget.id, ok: false, error: (err as Error).message.slice(0, 160) })
      status = "needs_user"
    }
  } else if (status === "continue") {
    // Nothing left to click on this page — hand back to the user for review.
    status = plan.submit_id ? "ready_to_submit" : "needs_user"
  }

  const failed = actions.filter((a) => !a.ok).map((a) => `${a.target}: ${a.error}`)
  const unanswered = [plan.needs_user, ...failed].filter(Boolean) as string[]

  return {
    url: activePage.url(),
    title: await activePage.title().catch(() => ""),
    plan,
    actions,
    status,
    message: plan.summary,
    unanswered,
  }
}
