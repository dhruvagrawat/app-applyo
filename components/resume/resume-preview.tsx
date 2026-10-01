import type React from "react"
import type { ResumeData } from "@/lib/resume/types"
import { dateRange } from "@/lib/resume/types"

/**
 * Printable resume page (US Letter width at 96dpi). Single column on purpose — it's what
 * applicant tracking systems parse most reliably.
 */
export function ResumePreview({ data, id }: { data: ResumeData; id?: string }) {
  const { basics: b, settings: s } = data
  const compact = s.template === "compact"
  const classic = s.template === "classic"
  const font = s.font === "serif" ? "Georgia, 'Times New Roman', serif" : "'Helvetica Neue', Arial, sans-serif"
  const base = compact ? 12.5 : 13.5

  const contact = [b.email, b.phone, b.location, b.linkedin, b.github, b.website].filter(Boolean)
  const exp = data.experience.filter((e) => e.role || e.company)
  const edu = data.education.filter((e) => e.school || e.degree)
  const projects = data.projects.filter((p) => p.name)
  const skills = data.skills.filter((g) => g.items.trim())
  const certs = data.certifications.filter((c) => c.name)

  const Heading = ({ children }: { children: string }) => (
    <h2
      style={{
        fontSize: base - 1.5,
        letterSpacing: classic ? "0.04em" : "0.14em",
        textTransform: "uppercase",
        fontWeight: 700,
        color: s.accent,
        margin: `${compact ? 12 : 18}px 0 ${compact ? 5 : 8}px`,
        paddingBottom: classic ? 3 : 0,
        borderBottom: classic ? `1px solid ${s.accent}` : "none",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {children}
      {!classic && <span style={{ flex: 1, height: 1, background: "#e5e7eb" }} />}
    </h2>
  )

  const Bullets = ({ items }: { items: string[] }) => {
    const list = items.filter((x) => x.trim())
    if (!list.length) return null
    return (
      <ul style={{ margin: "4px 0 0", paddingLeft: 16, listStyle: "disc" }}>
        {list.map((x, i) => (
          <li key={i} style={{ margin: compact ? "1px 0" : "2px 0" }}>{x}</li>
        ))}
      </ul>
    )
  }

  const Row = ({ left, right }: { left: React.ReactNode; right?: string }) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
      <div>{left}</div>
      {right && <div style={{ color: "#6b7280", whiteSpace: "nowrap", fontSize: base - 1 }}>{right}</div>}
    </div>
  )

  const empty = !b.name && !exp.length && !data.summary

  return (
    <div
      id={id}
      className="resume-page"
      style={{
        width: 816,
        minHeight: 1056,
        background: "#fff",
        color: "#111827",
        fontFamily: font,
        fontSize: base,
        lineHeight: compact ? 1.38 : 1.5,
        padding: compact ? "40px 48px" : "52px 60px",
        boxSizing: "border-box",
      }}
    >
      <header style={{ textAlign: classic ? "center" : "left" }}>
        <h1 style={{ fontSize: compact ? 24 : 30, fontWeight: 700, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.15 }}>
          {b.name || (empty ? "Your Name" : "")}
        </h1>
        {(b.title || empty) && (
          <p style={{ margin: "4px 0 0", fontSize: base + 1, color: s.accent, fontWeight: 500 }}>{b.title || "Your headline"}</p>
        )}
        {contact.length > 0 && (
          <p style={{ margin: "8px 0 0", color: "#4b5563", fontSize: base - 1 }}>{contact.join("  ·  ")}</p>
        )}
      </header>

      {data.summary.trim() && (
        <section>
          <Heading>Summary</Heading>
          <p style={{ margin: 0 }}>{data.summary}</p>
        </section>
      )}

      {exp.length > 0 && (
        <section>
          <Heading>Experience</Heading>
          {exp.map((e) => (
            <div key={e.id} style={{ marginBottom: compact ? 8 : 12 }}>
              <Row
                left={
                  <span>
                    <strong>{e.role}</strong>
                    {e.company && <span>{e.role ? " · " : ""}{e.company}</span>}
                    {e.location && <span style={{ color: "#6b7280" }}>, {e.location}</span>}
                  </span>
                }
                right={dateRange(e.start, e.end, e.current)}
              />
              <Bullets items={e.bullets} />
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <Heading>Projects</Heading>
          {projects.map((p) => (
            <div key={p.id} style={{ marginBottom: compact ? 6 : 10 }}>
              <Row left={<span><strong>{p.name}</strong>{p.description && <span> — {p.description}</span>}</span>} right={p.link} />
              <Bullets items={p.bullets} />
            </div>
          ))}
        </section>
      )}

      {edu.length > 0 && (
        <section>
          <Heading>Education</Heading>
          {edu.map((e) => (
            <div key={e.id} style={{ marginBottom: 6 }}>
              <Row left={<span><strong>{e.degree}</strong>{e.school && <span>{e.degree ? " · " : ""}{e.school}</span>}</span>} right={dateRange(e.start, e.end)} />
              {e.details && <p style={{ margin: "2px 0 0", color: "#374151" }}>{e.details}</p>}
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <Heading>Skills</Heading>
          {skills.map((g) => (
            <p key={g.id} style={{ margin: "2px 0" }}>
              {g.group && <strong>{g.group}: </strong>}
              {g.items}
            </p>
          ))}
        </section>
      )}

      {certs.length > 0 && (
        <section>
          <Heading>Certifications</Heading>
          {certs.map((c) => (
            <Row key={c.id} left={<span><strong>{c.name}</strong>{c.issuer && <span> · {c.issuer}</span>}</span>} right={c.date} />
          ))}
        </section>
      )}
    </div>
  )
}
