import Link from "next/link"
import { ArrowRight, Play, Sparkles, Target, Video, CheckCircle2, Zap, Briefcase, Mic } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Parallax, Tilt } from "@/components/landing/motion"

function FloatingCard({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <div className={`absolute hidden lg:block rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-2xl shadow-black/10 p-4 ${className}`}>
      {children}
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Layer 1 — slow background */}
      <Parallax speed={-0.15} className="absolute inset-0 -z-30">
        <div className="absolute inset-0 bg-grid" />
      </Parallax>
      {/* Layer 2 — color blobs at different depths */}
      <Parallax speed={0.35} className="absolute -top-40 left-1/2 -translate-x-1/2 -z-20">
        <div className="w-[900px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
      </Parallax>
      <Parallax speed={0.6} className="absolute top-40 -left-40 -z-20">
        <div className="w-[420px] h-[420px] rounded-full bg-pink-500/15 blur-[100px]" />
      </Parallax>
      <Parallax speed={0.45} className="absolute top-20 -right-32 -z-20">
        <div className="w-[380px] h-[380px] rounded-full bg-amber-400/20 blur-[100px]" />
      </Parallax>

      {/* Layer 3 — floating product cards (fastest) */}
      <Parallax speed={0.25} className="absolute inset-0 -z-10 pointer-events-none">
        <FloatingCard className="top-40 left-[4%] w-60 rotate-[-6deg] animate-float">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Target className="w-4 h-4 text-primary" /> ATS match score
          </div>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-bold text-emerald-500">92</span>
            <span className="text-xs text-muted-foreground mb-1.5">/ 100 · was 61</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[92%] bg-gradient-to-r from-primary to-emerald-500 rounded-full" />
          </div>
        </FloatingCard>
        <FloatingCard className="top-[26rem] left-[7%] w-64 rotate-[4deg] animate-float-slow">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Mic className="w-4 h-4 text-sky-500" /> Interview feedback
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
            “Strong STAR structure. Add the result: how much did onboarding time drop?”
          </p>
          <div className="mt-2 flex gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">Clarity 8/10</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">2 filler words</span>
          </div>
        </FloatingCard>
      </Parallax>
      <Parallax speed={0.4} className="absolute inset-0 -z-10 pointer-events-none">
        <FloatingCard className="top-36 right-[5%] w-64 rotate-[5deg] animate-float-slow">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Zap className="w-4 h-4 text-orange-500" /> Auto-Applier
          </div>
          <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Filled 14 fields</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Uploaded resume.pdf</li>
            <li className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" /> Waiting for your approval</li>
          </ul>
        </FloatingCard>
        <FloatingCard className="top-[25rem] right-[8%] w-56 rotate-[-4deg] animate-float">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Briefcase className="w-4 h-4 text-violet-500" /> Job tracker
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
            {[["12", "Applied"], ["4", "Interview"], ["1", "Offer"]].map(([n, l]) => (
              <div key={l} className="rounded-lg bg-muted py-1.5">
                <div className="text-sm font-bold text-foreground">{n}</div>
                <div className="text-[9px] text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </FloatingCard>
      </Parallax>

      <div className="relative max-w-5xl mx-auto px-4 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 backdrop-blur px-4 py-1.5 text-xs md:text-sm text-muted-foreground hover:text-foreground animate-pop-in"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          New: AI video mock interviews + {50} free career guides
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[0.98] animate-slide-up">
          Your whole job search.
          <br />
          <span className="text-shimmer">One AI co-pilot.</span>
        </h1>

        <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Build an ATS-proof resume, practice interviews on camera with instant AI feedback, track every application and let
          AI fill out job forms for you — all in one place.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "0.18s" }}>
          <Link href="/auth/sign-up">
            <Button size="lg" className="h-13 px-8 text-base font-semibold gap-2 shadow-xl shadow-primary/30 hover-lift">
              Start free — no card needed <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="h-13 px-8 text-base gap-2 bg-background/60 backdrop-blur">
              <Play className="w-4 h-4 text-primary" /> Try the live demo
            </Button>
          </Link>
        </div>

        {/* Product preview */}
        <Parallax speed={-0.08} className="mt-16 md:mt-20">
          <Tilt className="mx-auto max-w-4xl" max={5}>
            <div className="glow-border rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10 overflow-hidden text-left">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-muted-foreground">applyo.app/dashboard/interview/video</span>
              </div>
              <div className="grid md:grid-cols-[1.3fr_1fr]">
                <div className="relative aspect-video bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center">
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-medium text-white bg-black/40 rounded-full px-2.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 rec-dot" /> REC 01:12
                  </div>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-300 to-rose-400 opacity-90" />
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-[11px] text-white/90 leading-relaxed">
                      “…so I split the release into two phases, which got the client the critical piece three weeks sooner…”
                    </p>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Question 3 of 5</p>
                  <p className="text-sm font-semibold text-foreground">Tell me about a time you handled a difficult stakeholder.</p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[["142", "words/min"], ["1", "filler"], ["8.5", "score"]].map(([n, l]) => (
                      <div key={l} className="rounded-xl bg-muted p-2 text-center">
                        <div className="text-base font-bold text-foreground">{n}</div>
                        <div className="text-[10px] text-muted-foreground">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-[11px] text-emerald-700 dark:text-emerald-300">
                    <Video className="inline w-3 h-3 mr-1" /> Great ownership and a clear result. Try trimming the context.
                  </div>
                </div>
              </div>
            </div>
          </Tilt>
        </Parallax>
      </div>
    </section>
  )
}
