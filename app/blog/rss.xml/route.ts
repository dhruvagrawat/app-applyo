import { ALL_POSTS } from "@/lib/blog"
import { SITE, absoluteUrl } from "@/lib/site"

export const dynamic = "force-static"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export function GET() {
  const items = ALL_POSTS.map(
    (p) => `<item>
  <title>${esc(p.title)}</title>
  <link>${absoluteUrl(`/blog/${p.slug}`)}</link>
  <guid isPermaLink="true">${absoluteUrl(`/blog/${p.slug}`)}</guid>
  <pubDate>${new Date(`${p.date}T09:00:00Z`).toUTCString()}</pubDate>
  <category>${esc(p.category)}</category>
  <description>${esc(p.description)}</description>
</item>`,
  ).join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(SITE.name)} Career Blog</title>
  <link>${absoluteUrl("/blog")}</link>
  <description>${esc(SITE.description)}</description>
  <language>en</language>
  <atom:link href="${absoluteUrl("/blog/rss.xml")}" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } })
}
