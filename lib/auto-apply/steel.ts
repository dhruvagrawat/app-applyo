/**
 * Minimal Steel.dev REST client (https://steel.dev) — cloud browsers we can
 * embed live in the dashboard and drive over CDP.
 */
const STEEL_API = process.env.STEEL_BASE_URL || "https://api.steel.dev"

export interface SteelSession {
  id: string
  status: "live" | "released" | "failed"
  debugUrl: string
  sessionViewerUrl: string
  websocketUrl: string
  timeout: number
  createdAt: string
}

export function getSteelApiKey(): string | null {
  return process.env.STEEL_API_KEY?.trim() || null
}

export function isSteelConfigured(): boolean {
  return !!getSteelApiKey()
}

async function steelFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = getSteelApiKey()
  if (!key) throw new Error("STEEL_API_KEY is not configured on the server")

  const res = await fetch(`${STEEL_API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "steel-api-key": key, ...(init.headers || {}) },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Steel API ${res.status}: ${body.slice(0, 300) || res.statusText}`)
  }
  return (await res.json()) as T
}

export function createSteelSession(opts: { timeoutMs?: number } = {}) {
  return steelFetch<SteelSession>("/v1/sessions", {
    method: "POST",
    body: JSON.stringify({
      timeout: opts.timeoutMs ?? 15 * 60 * 1000,
      solveCaptcha: true,
      blockAds: true,
      dimensions: { width: 1280, height: 800 },
      debugConfig: { interactive: true },
    }),
  })
}

export function getSteelSession(id: string) {
  return steelFetch<SteelSession>(`/v1/sessions/${encodeURIComponent(id)}`)
}

export async function releaseSteelSession(id: string) {
  try {
    await steelFetch(`/v1/sessions/${encodeURIComponent(id)}/release`, { method: "POST", body: "{}" })
  } catch (err) {
    // Already released / expired sessions are fine to ignore.
    console.warn("[steel] release failed:", err instanceof Error ? err.message : err)
  }
}

/** CDP websocket endpoint for driving the session with Playwright. */
export function steelCdpUrl(sessionId: string): string {
  const key = getSteelApiKey()
  if (!key) throw new Error("STEEL_API_KEY is not configured on the server")
  return `wss://connect.steel.dev?apiKey=${encodeURIComponent(key)}&sessionId=${encodeURIComponent(sessionId)}`
}

/** Embeddable live view the user can watch *and* control. */
export function steelLiveViewUrl(session: Pick<SteelSession, "debugUrl">): string {
  const url = new URL(session.debugUrl)
  url.searchParams.set("interactive", "true")
  url.searchParams.set("showControls", "true")
  return url.toString()
}
