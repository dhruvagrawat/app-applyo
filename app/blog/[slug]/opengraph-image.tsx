import { ogImage, OG_SIZE } from "@/lib/seo/og"
import { ALL_POSTS, getCategory, getPost } from "@/lib/blog"

export const alt = "Applyo blog article"
export const size = OG_SIZE
export const contentType = "image/png"

export function generateStaticParams() {
  return ALL_POSTS.map((p) => ({ slug: p.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  return ogImage({
    eyebrow: post ? getCategory(post.category)?.name || "Blog" : "Blog",
    title: post?.title || "Applyo Career Blog",
  })
}
