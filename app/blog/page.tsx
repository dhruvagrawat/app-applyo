import type { Metadata } from "next"
import Link from "next/link"
import { ALL_POSTS, BLOG_CATEGORIES } from "@/lib/blog"
import { PostCard } from "@/components/site/post-card"
import { JsonLd, breadcrumbLd } from "@/lib/seo/json-ld"
import { DEFAULT_OG_IMAGE, SITE, absoluteUrl } from "@/lib/site"

export const metadata: Metadata = {
  title: "Career Blog — Resume, Interview & Job Search Advice",
  description:
    "Free, practical guides on resumes, ATS, interviews, cover letters, job search strategy, career growth and salary negotiation from the Applyo career team.",
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { type: "website", url: "/blog", title: "The Applyo Career Blog", images: [DEFAULT_OG_IMAGE] },
}

export default function BlogIndexPage() {
  const [featured, ...rest] = ALL_POSTS
  return (
    <div className="relative">
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${SITE.name} Career Blog`,
            url: absoluteUrl("/blog"),
            blogPost: ALL_POSTS.slice(0, 20).map((p) => ({
              "@type": "BlogPosting",
              headline: p.title,
              url: absoluteUrl(`/blog/${p.slug}`),
              datePublished: p.date,
            })),
          },
        ]}
      />
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 gradient-hero" aria-hidden />
        <div className="absolute -top-24 right-0 w-[480px] h-[480px] rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <p className="text-sm font-semibold text-primary mb-3">The Applyo Career Blog</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-3xl leading-[1.05]">
            Advice that actually gets you hired.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            {ALL_POSTS.length} in-depth guides on resumes, interviews, job search strategy and negotiation — free, practical and
            up to date.
          </p>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Blog categories">
            {BLOG_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/blog/category/${c.slug}`}
                className="px-3.5 py-1.5 rounded-full border border-border bg-background/70 text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PostCard post={featured} featured />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rest.slice(0, 4).map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </div>

        {BLOG_CATEGORIES.map((c) => {
          const posts = ALL_POSTS.filter((p) => p.category === c.slug)
          return (
            <div key={c.slug}>
              <div className="flex items-end justify-between mb-5 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{c.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                </div>
                <Link href={`/blog/category/${c.slug}`} className="text-sm font-medium text-primary whitespace-nowrap hover:underline">
                  View all {posts.length} →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.slice(0, 3).map((p) => <PostCard key={p.slug} post={p} />)}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
