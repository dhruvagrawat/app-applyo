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

// The mobile app (and its Expo web build) calls the API with a bearer token. Wildcard CORS is safe
// here because credentials (cookies) are never allowed cross-origin.
const API_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith("/api/")) {
    if (request.method === "OPTIONS") return new NextResponse(null, { status: 204, headers: API_CORS })
    const response = request.headers.get("authorization") ? NextResponse.next() : await updateSession(request)
    Object.entries(API_CORS).forEach(([k, v]) => response.headers.set(k, v))
    return response
  }

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
