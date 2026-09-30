import type { BlogCategory, BlogPost } from "./types"
import { resumePosts } from "./posts/resumes"
import { interviewPosts } from "./posts/interviews"
import { jobSearchPosts } from "./posts/job-search"
import { coverLetterPosts } from "./posts/cover-letters"
import { careerPosts } from "./posts/career-growth"
import { salaryPosts } from "./posts/salary"

export type { BlogPost, BlogCategory }

export const BLOG_AUTHOR = { name: "Applyo Career Team", url: "/blog" }

export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: "resumes", name: "Resumes & ATS", description: "Write resumes that pass applicant tracking systems and impress recruiters." },
  { slug: "interviews", name: "Interview Prep", description: "Answer frameworks, question banks and practice strategies for every interview format." },
  { slug: "job-search", name: "Job Search Strategy", description: "Find better roles faster with smarter search, networking and application tactics." },
  { slug: "cover-letters", name: "Cover Letters", description: "Cover letters and outreach messages that actually get read." },
  { slug: "career-growth", name: "Career Growth", description: "Switch careers, grow in your role and plan the next move with confidence." },
  { slug: "salary-negotiation", name: "Salary & Offers", description: "Research, negotiate and evaluate offers so you get paid what you're worth." },
]

export const ALL_POSTS: BlogPost[] = [
  ...resumePosts,
  ...interviewPosts,
  ...jobSearchPosts,
  ...coverLetterPosts,
  ...careerPosts,
  ...salaryPosts,
].sort((a, b) => (a.date < b.date ? 1 : -1))

export function getPost(slug: string) {
  return ALL_POSTS.find((p) => p.slug === slug)
}

export function getCategory(slug: string) {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)
}

export function postsInCategory(slug: string) {
  return ALL_POSTS.filter((p) => p.category === slug)
}

export function readingMinutes(post: BlogPost) {
  return Math.max(3, Math.round(post.body.split(/\s+/).length / 220))
}

/** Related posts: same category first, then shared tags. */
export function relatedPosts(post: BlogPost, count = 3) {
  return ALL_POSTS.filter((p) => p.slug !== post.slug)
    .map((p) => ({
      p,
      score: (p.category === post.category ? 3 : 0) + p.tags.filter((t) => post.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((x) => x.p)
}
