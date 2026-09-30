import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import { getCategory, readingMinutes, type BlogPost } from "@/lib/blog"

const CATEGORY_TINT: Record<string, string> = {
  resumes: "from-orange-500/20 to-amber-500/10",
  interviews: "from-sky-500/20 to-indigo-500/10",
  "job-search": "from-emerald-500/20 to-teal-500/10",
  "cover-letters": "from-rose-500/20 to-pink-500/10",
  "career-growth": "from-violet-500/20 to-purple-500/10",
  "salary-negotiation": "from-yellow-500/20 to-lime-500/10",
}

export function PostCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const category = getCategory(post.category)
  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover-lift">
      <div className={`h-2 bg-gradient-to-r ${CATEGORY_TINT[post.category] || "from-primary/20 to-primary/5"}`} />
      <div className={`flex flex-col flex-1 p-6 ${featured ? "md:p-8" : ""}`}>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <Link href={`/blog/category/${post.category}`} className="font-medium text-primary hover:underline relative z-10">
            {category?.name}
          </Link>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readingMinutes(post)} min read</span>
        </div>
        <h3 className={`font-semibold text-foreground leading-snug ${featured ? "text-xl md:text-2xl" : "text-base"}`}>
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3 flex-1">{post.description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Read article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </article>
  )
}
