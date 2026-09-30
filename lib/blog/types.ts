export interface BlogPost {
  slug: string
  title: string
  description: string
  category: string
  tags: string[]
  date: string // YYYY-MM-DD
  updated?: string
  /** Markdown subset: ## / ### headings, paragraphs, - and 1. lists, > quotes, **bold**, *italic*, `code`, [links](/path) */
  body: string
  faqs?: { q: string; a: string }[]
}

export interface BlogCategory {
  slug: string
  name: string
  description: string
}
