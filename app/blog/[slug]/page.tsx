import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, Calendar, Sparkles, Video, Target } from "lucide-react"
import { ALL_POSTS, BLOG_AUTHOR, getCategory, getPost, readingMinutes, relatedPosts } from "@/lib/blog"
import { Markdown, extractToc } from "@/lib/blog/markdown"
import { PostCard } from "@/components/site/post-card"
import { JsonLd, breadcrumbLd, faqLd } from "@/lib/seo/json-ld"
import { SITE, absoluteUrl } from "@/lib/site"
import { Button } from "@/components/ui/button"

type Params = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return ALL_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: post.title.length > 50 ? { absolute: post.title } : post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    authors: [{ name: BLOG_AUTHOR.name }],
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      section: getCategory(post.category)?.name,
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  }
}

const formatDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const category = getCategory(post.category)!
  const toc = extractToc(post.body)
  const related = relatedPosts(post)
  const url = absoluteUrl(`/blog/${post.slug}`)

  const ld: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      mainEntityOfPage: url,
      url,
      image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
      author: { "@type": "Organization", name: BLOG_AUTHOR.name, url: absoluteUrl("/blog") },
      publisher: { "@id": `${SITE.url}/#organization` },
      articleSection: category.name,
      keywords: post.tags.join(", "),
      wordCount: post.body.split(/\s+/).length,
      inLanguage: "en",
    },
    breadcrumbLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: category.name, path: `/blog/category/${category.slug}` },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ]
  if (post.faqs?.length) ld.push(faqLd(post.faqs))

  return (
    <article className="relative">
      <JsonLd data={ld} />
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 gradient-hero" aria-hidden />
        <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link href="/blog" className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5" /> Blog
            </Link>
            <span>/</span>
            <Link href={`/blog/category/${category.slug}`} className="text-primary hover:underline">{category.name}</Link>
          </nav>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{BLOG_AUTHOR.name}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><time dateTime={post.date}>{formatDate(post.date)}</time></span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readingMinutes(post)} min read</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
        <div className="min-w-0">
          <div className="prose-blog">
            <Markdown source={post.body} />
          </div>

          {post.faqs && post.faqs.length > 0 && (
            <section className="mt-12 border-t border-border pt-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Frequently asked questions</h2>
              <div className="space-y-3">
                {post.faqs.map((f) => (
                  <details key={f.q} className="group rounded-xl border border-border bg-card p-4">
                    <summary className="cursor-pointer font-medium text-foreground list-none flex justify-between gap-4">
                      {f.q} <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">#{t}</span>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8">
            <h2 className="text-2xl font-bold text-foreground">Put this advice into practice</h2>
            <p className="mt-2 text-muted-foreground">
              Applyo turns these guides into action: improve your resume, practice interviews on video with AI feedback, and
              track every application — free to start.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/auth/sign-up"><Button className="gap-2"><Sparkles className="w-4 h-4" /> Create free account</Button></Link>
              <Link href="/demo"><Button variant="outline">Try the demo</Button></Link>
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 h-fit">
          {toc.length > 0 && (
            <nav className="rounded-2xl border border-border bg-card p-5" aria-label="Table of contents">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">On this page</p>
              <ol className="space-y-2 text-sm">
                {toc.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary transition-colors">{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="text-sm font-semibold text-foreground">Free tools</p>
            <Link href="/auth/sign-up" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Video className="w-4 h-4 text-primary" /> AI video mock interview
            </Link>
            <Link href="/demo/ats-checker" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Target className="w-4 h-4 text-primary" /> ATS resume checker
            </Link>
            <Link href="/demo/resume-improver" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <Sparkles className="w-4 h-4 text-primary" /> AI resume improver
            </Link>
          </div>
        </aside>
      </div>

      <section className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Keep reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
        </div>
      </section>
    </article>
  )
}
