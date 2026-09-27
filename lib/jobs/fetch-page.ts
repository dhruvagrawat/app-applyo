import { lookup } from "node:dns/promises"
import { isIP } from "node:net"

const MAX_BYTES = 2_000_000
const FETCH_TIMEOUT_MS = 12_000

export interface FetchedPage {
  url: string
  title: string
  metaDescription: string
  text: string
  jsonLdJob: Record<string, any> | null
}

function isPrivateAddress(ip: string): boolean {
  if (ip.includes(":")) {
    const lower = ip.toLowerCase()
    if (lower === "::1" || lower === "::") return true
    if (lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80")) return true
    const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    return mapped ? isPrivateAddress(mapped[1]) : false
  }
  const [a, b] = ip.split(".").map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

/** Rejects non-http(s) URLs and hosts that resolve to private/internal networks (SSRF guard). */
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    throw new Error("Invalid URL")
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only http(s) URLs are supported")
  const host = url.hostname.replace(/^\[|\]$/g, "")
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("That address is not allowed")
  }
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map((r) => r.address)
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) throw new Error("That address is not allowed")
  return url
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr)[^>]*>/gi, "\n")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim()
}

function findJobPosting(node: any): Record<string, any> | null {
  if (!node || typeof node !== "object") return null
  if (Array.isArray(node)) {
    for (const n of node) {
      const found = findJobPosting(n)
      if (found) return found
    }
    return null
  }
  const type = node["@type"]
  if (type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"))) return node
  if (node["@graph"]) return findJobPosting(node["@graph"])
  return null
}

function extractJsonLdJob(html: string): Record<string, any> | null {
  const blocks = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const [, body] of blocks) {
    try {
      const found = findJobPosting(JSON.parse(body.trim()))
      if (found) return found
    } catch {
      // ignore malformed JSON-LD
    }
  }
  return null
}

function metaContent(html: string, name: string): string {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i")
  const reAlt = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, "i")
  return decodeEntities(html.match(re)?.[1] || html.match(reAlt)?.[1] || "")
}

/** Fetches a public job page and extracts structured data + readable text. */
export async function fetchJobPage(rawUrl: string): Promise<FetchedPage> {
  let url = await assertPublicUrl(rawUrl)

  // Follow redirects manually so every hop passes the SSRF check.
  let res: Response | null = null
  for (let hop = 0; hop < 5; hop++) {
    res = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    })
    const location = res.headers.get("location")
    if (res.status >= 300 && res.status < 400 && location) {
      url = await assertPublicUrl(new URL(location, url).toString())
      continue
    }
    break
  }
  if (!res || !res.ok) throw new Error(`The site responded with ${res?.status ?? "no response"}`)

  const reader = res.body?.getReader()
  let html = ""
  if (reader) {
    const decoder = new TextDecoder()
    let received = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      received += value.byteLength
      html += decoder.decode(value, { stream: true })
      if (received > MAX_BYTES) {
        await reader.cancel()
        break
      }
    }
  }

  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "")
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
  return {
    url: url.toString(),
    title: metaContent(html, "og:title") || title,
    metaDescription: metaContent(html, "og:description") || metaContent(html, "description"),
    text: htmlToText(body).slice(0, 20_000),
    jsonLdJob: extractJsonLdJob(html),
  }
}
