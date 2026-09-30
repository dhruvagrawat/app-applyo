import type { MetadataRoute } from "next"
import { SITE } from "@/lib/site"

const PRIVATE = ["/dashboard", "/api/", "/auth/login", "/auth/sign-up-success"]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // AI crawlers and answer engines: welcome on public content, kept out of private areas.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"],
        allow: "/",
        disallow: PRIVATE,
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
