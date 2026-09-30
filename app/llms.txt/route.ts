import { ALL_POSTS, BLOG_CATEGORIES } from "@/lib/blog"
import { FEATURES } from "@/lib/seo/features"
import { SITE, absoluteUrl } from "@/lib/site"

export const dynamic = "force-static"

/** llms.txt — a concise, LLM-readable map of the site (https://llmstxt.org). */
export function GET() {
  const body = `# ${SITE.name}

> ${SITE.description}

Applyo is a web app for job seekers. Public content (blog, demo) is free to read; the full toolset requires a free account.

## Product
${FEATURES.map((f) => `- [${f.name}](${absoluteUrl(f.path)}): ${f.desc}`).join("\n")}

## Key pages
- [Home](${absoluteUrl("/")}): overview, pricing and FAQ
- [Live demo](${absoluteUrl("/demo")}): try every tool with sample data, no sign-up
- [Career blog](${absoluteUrl("/blog")}): ${ALL_POSTS.length} guides on resumes, interviews, job search and salary
- [Sign up](${absoluteUrl("/auth/sign-up")})

## Blog categories
${BLOG_CATEGORIES.map((c) => `- [${c.name}](${absoluteUrl(`/blog/category/${c.slug}`)}): ${c.description}`).join("\n")}

## Blog articles
${ALL_POSTS.map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.description}`).join("\n")}

## Optional
- [Full text of all articles](${absoluteUrl("/llms-full.txt")})
- [Privacy policy](${absoluteUrl("/privacy")})
- [Terms of service](${absoluteUrl("/terms")})
`
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
