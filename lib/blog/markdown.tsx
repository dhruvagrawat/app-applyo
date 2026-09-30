import Link from "next/link"
import type { ReactNode } from "react"

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function extractToc(body: string) {
  return body
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = l.slice(3).trim()
      return { id: slugifyHeading(text), text }
    })
}

/** Inline formatting: **bold**, *italic*, `code`, [text](href). */
function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let i = 0
  for (const m of text.matchAll(re)) {
    if (m.index! > last) nodes.push(text.slice(last, m.index))
    const tok = m[0]
    const key = `${keyBase}-${i++}`
    if (tok.startsWith("**")) nodes.push(<strong key={key}>{tok.slice(2, -2)}</strong>)
    else if (tok.startsWith("`")) nodes.push(<code key={key}>{tok.slice(1, -1)}</code>)
    else if (tok.startsWith("[")) {
      const [, label, href] = tok.match(/\[([^\]]+)\]\(([^)]+)\)/)!
      nodes.push(
        href.startsWith("/") ? (
          <Link key={key} href={href}>{label}</Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        ),
      )
    } else nodes.push(<em key={key}>{tok.slice(1, -1)}</em>)
    last = m.index! + tok.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/** Renders the small markdown subset used by blog posts. */
export function Markdown({ source }: { source: string }) {
  // Headings always form their own block, even without surrounding blank lines.
  const blocks = source
    .replace(/^(#{2,3} .*)$/gm, "\n$1\n")
    .trim()
    .split(/\n\s*\n/)
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split("\n").map((l) => l.trimEnd())
        const first = lines[0]
        const k = `b${bi}`
        if (first.startsWith("### ")) return <h3 key={k} id={slugifyHeading(first.slice(4))}>{renderInline(first.slice(4), k)}</h3>
        if (first.startsWith("## ")) return <h2 key={k} id={slugifyHeading(first.slice(3))}>{renderInline(first.slice(3), k)}</h2>
        if (lines.every((l) => /^[-*] /.test(l.trim())))
          return <ul key={k}>{lines.map((l, i) => <li key={i}>{renderInline(l.trim().slice(2), `${k}-${i}`)}</li>)}</ul>
        if (lines.every((l) => /^\d+\. /.test(l.trim())))
          return <ol key={k}>{lines.map((l, i) => <li key={i}>{renderInline(l.trim().replace(/^\d+\. /, ""), `${k}-${i}`)}</li>)}</ol>
        if (lines.every((l) => l.startsWith(">")))
          return <blockquote key={k}>{renderInline(lines.map((l) => l.replace(/^>\s?/, "")).join(" "), k)}</blockquote>
        // Consecutive "**Label:** text" lines (e.g. STAR examples) stay on their own lines.
        if (lines.length > 1 && lines.every((l) => l.startsWith("**")))
          return <div key={k} className="space-y-2">{lines.map((l, i) => <p key={i}>{renderInline(l, `${k}-${i}`)}</p>)}</div>
        return <p key={k}>{renderInline(lines.join(" "), k)}</p>
      })}
    </>
  )
}
