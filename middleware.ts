import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

// SEO / crawler files must never redirect to the login page.
const PUBLIC_FILES = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
  "/llms.txt",
  "/llms-full.txt",
  "/ai.txt",
  "/humans.txt",
])

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public routes — no auth required
  if (
    path.startsWith("/demo") ||
    path.startsWith("/blog") ||
    path === "/privacy" ||
    path === "/terms" ||
    PUBLIC_FILES.has(path) ||
    path.startsWith("/.well-known/") ||
    path.startsWith("/opengraph-image") ||
    path.startsWith("/twitter-image")
  ) {
    return NextResponse.next()
  }
  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
