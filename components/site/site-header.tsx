"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, Sparkles, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV = [
  { href: "/#features", label: "Features" },
  { href: "/#interview-studio", label: "Interview Studio" },
  { href: "/#auto-apply", label: "Auto-Apply" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16" aria-label="Main">
        <Link href="/" className="flex items-center gap-2" aria-label="Applyo home">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/30">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">Applyo</span>
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-foreground transition-colors">
              {n.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/demo">
            <Button variant="ghost" size="sm" className="h-9 gap-1.5">
              <Play className="w-3.5 h-3.5 text-primary" /> Demo
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="h-9">Log in</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="sm" className="h-9 shadow-md shadow-primary/25">Get started free</Button>
          </Link>
        </div>

        <button
          className="lg:hidden md:ml-2 p-2 -mr-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 pb-6 pt-2 space-y-1 animate-fade-in">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block py-2.5 text-sm text-foreground">
              {n.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3">
            <Link href="/auth/login" className="flex-1"><Button variant="outline" className="w-full">Log in</Button></Link>
            <Link href="/auth/sign-up" className="flex-1"><Button className="w-full">Sign up</Button></Link>
          </div>
        </div>
      )}
    </header>
  )
}
