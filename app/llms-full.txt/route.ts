import { ALL_POSTS, getCategory } from "@/lib/blog"
import { SITE, absoluteUrl } from "@/lib/site"

export const dynamic = "force-static"

/** Full plain-text export of the blog for LLMs and answer engines. */
export function GET() {
  const body = [
    `# ${SITE.name} Career Blog — full text`,
    `> ${SITE.description}`,
    ...ALL_POSTS.map(
      (p) =>
        `\n---\n\n# ${p.title}\n\nURL: ${absoluteUrl(`/blog/${p.slug}`)}\nCategory: ${getCategory(p.category)?.name}\nPublished: ${p.date}\n\n> ${p.description}\n\n${p.body.trim()}${
          p.faqs?.length ? `\n\n## FAQ\n\n${p.faqs.map((f) => `**${f.q}**\n${f.a}`).join("\n\n")}` : ""
        }`,
    ),
  ].join("\n")
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
