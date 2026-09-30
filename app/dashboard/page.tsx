"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Briefcase, FileText, Zap, ArrowRight, Target, BookOpen, Shield, Sparkles } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [stats, setStats] = useState({ items: 0, resumes: 0, letters: 0 })
  const [userName, setUserName] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUserName(user.email?.split("@")[0] || "there")

      const [itemsRes, resumesRes, lettersRes] = await Promise.all([
        supabase.from("generated_items").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("resumes").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("cover_letters").select("id", { count: "exact" }).eq("user_id", user.id),
      ])

      setStats({
        items: itemsRes.count || 0,
        resumes: resumesRes.count || 0,
        letters: lettersRes.count || 0,
      })
    }

    fetchStats()
  }, [supabase])

  const quickLinks = [
    { href: "/dashboard/resume-improver", icon: Brain, label: "AI Resume Improver", desc: "Enhance your resume with AI", color: "bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400" },
    { href: "/dashboard/ats-checker", icon: Target, label: "ATS Score Checker", desc: "Check ATS compatibility", color: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400" },
    { href: "/dashboard/cover-letter", icon: FileText, label: "Cover Letter Maker", desc: "Create compelling cover letters", color: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400" },
    { href: "/dashboard/interview", icon: Brain, label: "Interview Studio", desc: "Guide, question bank, tests & video mock interviews", color: "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" },
    { href: "/dashboard/job-finder", icon: Briefcase, label: "Job Finder", desc: "Discover matching opportunities", color: "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400" },
    { href: "/dashboard/job-tracker", icon: BookOpen, label: "Job Tracker", desc: "Track your applications", color: "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400" },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 tracking-tight">
          Welcome back, {userName}
        </h1>
        <p className="text-muted-foreground text-sm">
          Empower your job search with AI-driven insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <Card className="bg-card border-border smooth-hover hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Generated Items
            </CardTitle>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-950/50 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.items}</div>
            <p className="text-xs text-muted-foreground mt-1">Total AI generations</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border smooth-hover hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Resumes Saved
            </CardTitle>
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/50 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.resumes}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to use</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border smooth-hover hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Cover Letters
            </CardTitle>
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.letters}</div>
            <p className="text-xs text-muted-foreground mt-1">Created</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <Card className="bg-card border-border smooth-hover hover:border-primary/30 hover:-translate-y-0.5 cursor-pointer h-full hover:shadow-md">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${link.color}`}>
                        <link.icon className="w-4 h-4" />
                      </div>
                      <span className="text-foreground">{link.label}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground smooth-hover group-hover:translate-x-0.5 group-hover:text-primary" />
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground ml-11">
                    {link.desc}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">Pro Tip</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For the best results, always upload your latest resume and include the full job description when using our AI tools. The more context you provide, the better the output.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
