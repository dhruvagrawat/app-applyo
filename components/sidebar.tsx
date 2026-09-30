"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown, ChevronLeft, ChevronRight, Brain, Briefcase, User, LogOut, Sparkles,
  Zap, CreditCard, BarChart2, FolderOpen, Search, Mail, Users, Video,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type BadgeType = "new" | "pro" | "team" | "soon" | "ent"

type ChildItem = {
  id: string
  title: string
  href: string
  badge?: BadgeType
}

type SidebarGroup = {
  id: string
  title: string
  icon: string
  children: ChildItem[]
}

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  User: <User className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
  BarChart2: <BarChart2 className="w-4 h-4" />,
  FolderOpen: <FolderOpen className="w-4 h-4" />,
  Search: <Search className="w-4 h-4" />,
  Mail: <Mail className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Video: <Video className="w-4 h-4" />,
}

const BADGE_STYLES: Record<BadgeType, string> = {
  new:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  pro:  "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400",
  team: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400",
  ent:  "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400",
  soon: "bg-muted text-muted-foreground",
}

const BADGE_LABELS: Record<BadgeType, string> = {
  new: "NEW", pro: "PRO", team: "TEAM", ent: "ENT", soon: "SOON",
}

function getSidebarData(basePath: string): SidebarGroup[] {
  return [
    {
      id: "ai_tools",
      title: "AI Tools",
      icon: "Brain",
      children: [
        { id: "tailor", title: "Tailor Everything", href: `${basePath}/tailor`, badge: "new" },
        { id: "resume_improver", title: "Resume Improver",   href: `${basePath}/resume-improver` },
        { id: "cover_letter",    title: "Cover Letter",      href: `${basePath}/cover-letter` },
        { id: "ats_checker",     title: "ATS Checker",       href: `${basePath}/ats-checker` },
        { id: "ats_improver",    title: "ATS Improver",      href: `${basePath}/ats-improver` },
        { id: "email_maker",     title: "Email Maker",       href: `${basePath}/email-maker`, badge: "new" },
        { id: "interview_q",     title: "Interview Prep",    href: `${basePath}/interview-questions` },
      ],
    },
    {
      id: "interview_studio",
      title: "Interview Studio",
      icon: "Video",
      children: [
        { id: "iv_overview", title: "Overview",           href: `${basePath}/interview` },
        { id: "iv_guide",    title: "Interview Guide",    href: `${basePath}/interview/guide` },
        { id: "iv_practice", title: "Question Bank",      href: `${basePath}/interview/practice`, badge: "new" },
        { id: "iv_tests",    title: "Skill Tests",        href: `${basePath}/interview/tests`, badge: "new" },
        { id: "iv_video",    title: "Video Mock Interview", href: `${basePath}/interview/video`, badge: "new" },
      ],
    },
    {
      id: "job_intel",
      title: "Job Intelligence",
      icon: "Search",
      children: [
        { id: "job_finder",         title: "Job Finder",         href: `${basePath}/job-finder` },
        { id: "job_tracker",        title: "Job Tracker",        href: `${basePath}/job-tracker` },
        { id: "job_resume_compare", title: "Job-Resume Match",   href: `${basePath}/job-resume-compare` },
        { id: "skill_gap",          title: "Skill Gap Finder",   href: `${basePath}/skill-gap-finder` },
        { id: "validity_checker",   title: "Job Validity",       href: `${basePath}/job-validity` },
      ],
    },
    {
      id: "auto_applier",
      title: "Auto-Applier",
      icon: "Zap",
      children: [
        { id: "start_auto_apply", title: "Start Auto-Apply", href: `${basePath}/auto-applier/start`, badge: "team" },
      ],
    },
    {
      id: "recruiter",
      title: "Recruiter Hub",
      icon: "Users",
      children: [
        { id: "rec_dashboard", title: "Talent Dashboard",  href: `${basePath}/recruiter`, badge: "ent" },
        { id: "rec_candidates", title: "Browse Candidates", href: `${basePath}/recruiter/candidates`, badge: "ent" },
        { id: "rec_applications", title: "Vet Applications", href: `${basePath}/recruiter/applications`, badge: "ent" },
        { id: "rec_portfolio", title: "Recruiter Portfolio", href: `${basePath}/recruiter/portfolio`, badge: "ent" },
      ],
    },
    {
      id: "workspace",
      title: "Workspace",
      icon: "FolderOpen",
      children: [
        { id: "memory",       title: "Resume Vault",       href: `${basePath}/memory`, badge: "new" },
        { id: "saved_items",  title: "Saved Items",        href: `${basePath}/saved`, badge: "soon" },
      ],
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: "BarChart2",
      children: [
        { id: "usage_stats",  title: "Usage Stats",        href: `${basePath}/analytics`, badge: "pro" },
        { id: "insights",     title: "Insights",           href: `${basePath}/insights`, badge: "soon" },
      ],
    },
    {
      id: "billing",
      title: "Billing & Plans",
      icon: "CreditCard",
      children: [
        { id: "my_plan",  title: "My Plan",   href: `${basePath}/billing` },
        { id: "upgrade",  title: "Upgrade",   href: `${basePath}/billing#upgrade` },
      ],
    },
    {
      id: "account",
      title: "Account",
      icon: "User",
      children: [
        { id: "profile",   title: "Profile",       href: `${basePath}/profile` },
        { id: "activity",  title: "Activity Log",  href: `${basePath}/activity` },
        { id: "settings",  title: "Settings",      href: `${basePath}/settings` },
      ],
    },
  ]
}

interface SidebarProps {
  basePath?: string
  isDemo?: boolean
}

export function Sidebar({ basePath = "/dashboard", isDemo = false }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["ai_tools", "job_intel"])
  )
  const pathname = usePathname()
  const router = useRouter()
  const supabase = !isDemo ? createClient() : null

  // Recruiter Hub pages currently exist only in demo — hide the group in the real dashboard.
  const sidebarData = getSidebarData(basePath).filter((g) => (g.id !== "recruiter" || isDemo) && (g.id !== "interview_studio" || !isDemo))

  const toggleGroup = (id: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedGroups(newExpanded)
  }

  const handleLogout = async () => {
    if (isDemo) { router.push("/"); return }
    await supabase!.auth.signOut()
    router.push("/")
  }

  return (
    <aside
      className={`h-screen bg-card border-r border-border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col shrink-0 ${
        isCollapsed ? "w-16" : "w-64"
      } animate-fade-in`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">Applyo</span>
            {isDemo && (
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                DEMO
              </span>
            )}
          </div>
        )}
        {isCollapsed && (
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted smooth-hover shrink-0"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {sidebarData.map((group, groupIndex) => (
          <div key={group.id} className="animate-slide-up" style={{ animationDelay: `${groupIndex * 0.04}s` }}>
            <button
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-sm transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isCollapsed ? "justify-center" : ""
              } ${
                expandedGroups.has(group.id)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={isCollapsed ? group.title : ""}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {iconMap[group.icon] ?? <Brain className="w-4 h-4" />}
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">{group.title}</span>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${
                    expandedGroups.has(group.id) ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {expandedGroups.has(group.id) && !isCollapsed && (
              <div className="ml-3 space-y-0.5 mt-0.5 animate-slide-down">
                {group.children.map((child, childIndex) => {
                  const isActive = pathname === child.href || pathname.startsWith(child.href + "/")
                  const isSoon = child.badge === "soon"
                  const Item = (
                    <div
                      key={child.id}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-all duration-200 animate-fade-in ${
                        isSoon
                          ? "opacity-50 cursor-not-allowed text-muted-foreground"
                          : isActive
                          ? "bg-secondary text-secondary-foreground font-medium border border-primary/20"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5 cursor-pointer"
                      }`}
                      style={{ animationDelay: `${childIndex * 0.02}s` }}
                    >
                      <span className="truncate">{child.title}</span>
                      {child.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ml-1.5 ${BADGE_STYLES[child.badge]}`}>
                          {BADGE_LABELS[child.badge]}
                        </span>
                      )}
                    </div>
                  )
                  return isSoon ? (
                    <div key={child.id}>{Item}</div>
                  ) : (
                    <Link key={child.id} href={child.href}>{Item}</Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-3 space-y-1">
        {!isCollapsed && !isDemo && (
          <div className="px-2.5 py-1.5 mb-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Free Plan</span>
              <Link href={`${basePath}/billing`}>
                <span className="text-[10px] text-primary font-semibold hover:underline">Upgrade →</span>
              </Link>
            </div>
            <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "24%" }} />
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">6 / 25 generations used</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start gap-2 smooth-hover text-sm"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && (isDemo ? "Exit Demo" : "Logout")}
        </Button>
      </div>
    </aside>
  )
}
