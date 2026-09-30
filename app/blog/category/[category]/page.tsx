import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BLOG_CATEGORIES, getCategory, postsInCategory } from "@/lib/blog"
import { PostCard } from "@/components/site/post-card"
import { JsonLd, breadcrumbLd } from "@/lib/seo/json-ld"
import { DEFAULT_OG_IMAGE } from "@/lib/site"

type Params = { params: Promise<{ category: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params
  const c = getCategory(category)
  if (!c) return {}
  return {
    title: `${c.name}: Guides, Tips & Examples`,
    description: `${c.description} Free, practical ${c.name.toLowerCase()} guides from the Applyo career team.`,
    alternates: { canonical: `/blog/category/${c.slug}` },
    openGraph: { url: `/blog/category/${c.slug}`, title: `${c.name} — Applyo Blog`, description: c.description, images: [DEFAULT_OG_IMAGE] },
  }
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params
  const c = getCategory(category)
  if (!c) notFound()
  const posts = postsInCategory(c.slug)
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: c.name, path: `/blog/category/${c.slug}` },
        ])}
      />
      <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/blog" className="hover:text-foreground">Blog</Link> <span className="mx-1">/</span> {c.name}
      </nav>
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{c.name}</h1>
      <p className="mt-3 text-lg text-muted-foreground max-w-2xl">{c.description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {BLOG_CATEGORIES.filter((x) => x.slug !== c.slug).map((x) => (
          <Link key={x.slug} href={`/blog/category/${x.slug}`} className="px-3 py-1 rounded-full border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/40">
            {x.name}
          </Link>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
    </div>
  )
}
