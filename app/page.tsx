import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight, Brain, FileText, Target, Mail, Search, ClipboardList, BarChart3, ShieldCheck, Zap,
  Video, MessageSquare, GraduationCap, ListChecks, CheckCircle, Lock, Shield, Users, Cpu, Sparkles, Mic, Timer,
  MousePointerClick, Link2, Wand2, Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site/site-header"
import { SiteFooter } from "@/components/site/site-footer"
import { PostCard } from "@/components/site/post-card"
import { Hero } from "@/components/landing/hero"
import { CountUp, Parallax, Reveal, Tilt } from "@/components/landing/motion"
import { ALL_POSTS } from "@/lib/blog"
import { QUESTION_BANK } from "@/lib/interview/questions"
import { QUIZZES } from "@/lib/interview/quizzes"
import { JsonLd, faqLd } from "@/lib/seo/json-ld"
import { FEATURES } from "@/lib/seo/features"
import { SITE, absoluteUrl } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: SITE.title },
  description: SITE.description,
  alternates: { canonical: "/" },
}

const WORKS_WITH = ["Greenhouse", "Lever", "Workday", "Ashby", "LinkedIn", "Indeed", "SmartRecruiters", "Wellfound", "iCIMS", "Company career pages"]

const BENTO = [
  { icon: Brain, title: "AI Resume Improver", desc: "Stronger verbs, real metrics and the right keywords — rewritten in seconds.", href: "/demo/resume-improver", span: "md:col-span-2", tint: "from-orange-500/15" },
  { icon: Target, title: "ATS Checker & Improver", desc: "See your match score and fix exactly what's missing.", href: "/demo/ats-checker", span: "", tint: "from-amber-500/15" },
  { icon: FileText, title: "Cover Letters", desc: "Tailored to the job link you paste, in your voice.", href: "/demo/cover-letter", span: "", tint: "from-emerald-500/15" },
  { icon: Wand2, title: "Tailor Everything", desc: "Resume, cover letter and ATS report for one job — one click.", href: "/demo/tailor", span: "", tint: "from-pink-500/15" },
  { icon: ClipboardList, title: "Smart Job Tracker", desc: "Paste a link; AI extracts company, salary, skills and red flags, then nudges your follow-ups.", href: "/demo/job-tracker", span: "md:col-span-2", tint: "from-violet-500/15" },
  { icon: Mail, title: "Email Maker", desc: "Follow-ups, thank-yous and cold outreach.", href: "/demo/email-maker", span: "", tint: "from-teal-500/15" },
  { icon: BarChart3, title: "Skill Gap Finder", desc: "Know exactly what to learn for your target role.", href: "/demo/skill-gap-finder", span: "", tint: "from-indigo-500/15" },
  { icon: Search, title: "Job Finder & Match", desc: "Find roles and score your fit before applying.", href: "/demo/job-finder", span: "", tint: "from-sky-500/15" },
  { icon: ShieldCheck, title: "Job Validity Checker", desc: "Spot fake postings and recruiter scams.", href: "/demo/job-validity", span: "", tint: "from-rose-500/15" },
]

const FAQS = [
  { q: "Is Applyo free to use?", a: "Yes. You can create a free account and use the core tools, the Interview Studio guide and question bank, and all 50 blog guides. Paid plans add higher AI limits and advanced features like the Auto-Applier." },
  { q: "How does the AI video mock interview work?", a: "Pick a role and interview type, allow camera and microphone access, and answer questions on video. Applyo shows a live transcript, measures your pace and filler words, and gives AI feedback on each answer's structure and content. Recordings stay in your browser unless you download them." },
  { q: "Will my resume pass applicant tracking systems (ATS)?", a: "The ATS Checker scores your resume against a real job description, lists missing keywords and flags formatting that commonly breaks ATS parsing, so you can fix issues before you apply." },
  { q: "Does the Auto-Applier submit applications without me?", a: "No. The AI fills forms in a live browser you can watch and control, but it never clicks the final submit button until you approve it." },
  { q: "Which job sites does Applyo work with?", a: "Job link parsing and the Auto-Applier work best with Greenhouse, Lever, Ashby, Workday and company career pages. Sites that require login, like LinkedIn, work when you log in yourself inside the live browser." },
  { q: "Is my data private?", a: "Your data is stored with row-level security so only you can access it. We don't sell your personal information." },
]

const PLANS = [
  { name: "Starter", price: "$0", period: "", desc: "Everything you need to get started.", cta: "Start free", href: "/auth/sign-up", features: ["Core AI tools with monthly limits", "Interview guide + question bank", "Skill tests & quizzes", "Smart job tracker", "All 50 career guides"] },
  { name: "Pro", price: "$15", period: "/mo", desc: "For an active job search.", cta: "Go Pro", href: "/auth/sign-up", highlight: true, features: ["300 AI generations / month", "Unlimited AI answer feedback", "AI video mock interviews", "Tailor Everything", "Resume Vault & PDF parsing"] },
  { name: "Business", price: "$29", period: "/mo", desc: "Unlimited AI and insights.", cta: "Get Business", href: "/auth/sign-up", features: ["Unlimited AI generations", "Everything in Pro", "Advanced analytics", "Follow-up email sequences", "Priority support"] },
  { name: "Team", price: "$49", period: "/mo", desc: "Full automation for power users & coaches.", cta: "Get Team", href: "/auth/sign-up", features: ["Everything in Business", "AI Auto-Applier (live browser)", "5 team seats", "Bulk resume processing", "Dedicated support"] },
]

export default function LandingPage() {
  const latestPosts = ALL_POSTS.slice(0, 3)
  const questionCount = QUESTION_BANK.length
  const quizCount = QUIZZES.length

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: SITE.name,
            url: SITE.url,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            description: SITE.description,
            image: absoluteUrl("/opengraph-image"),
            offers: PLANS.map((p) => ({
              "@type": "Offer",
              name: p.name,
              price: p.price.replace("$", ""),
              priceCurrency: "USD",
            })),
            featureList: FEATURES.map((f) => f.name),
          },
          faqLd(FAQS),
        ]}
      />
      <SiteHeader />
      <main className="overflow-x-hidden">
        <Hero />

        {/* Works with */}
        <section aria-label="Compatible job platforms" className="border-y border-border bg-muted/30 py-6 overflow-hidden">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Parses & fills applications on</p>
          <div className="relative [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="marquee gap-12 pr-12">
              {[...WORKS_WITH, ...WORKS_WITH].map((w, i) => (
                <span key={i} className="text-lg md:text-xl font-semibold text-muted-foreground/70 whitespace-nowrap">{w}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Numbers */}
        <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: FEATURES.length, s: "", l: "AI career tools" },
            { n: questionCount, s: "+", l: "interview questions" },
            { n: quizCount, s: "", l: "skill tests" },
            { n: ALL_POSTS.length, s: "", l: "free career guides" },
          ].map((x, i) => (
            <Reveal key={x.l} delay={i * 0.08}>
              <div className="text-4xl md:text-5xl font-bold text-foreground tracking-tight"><CountUp to={x.n} suffix={x.s} /></div>
              <div className="text-sm text-muted-foreground mt-1">{x.l}</div>
            </Reveal>
          ))}
        </section>

        {/* Bento features */}
        <section id="features" className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 scroll-mt-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-primary mb-3">Everything in one workspace</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">Stop juggling ten tabs to find one job.</h2>
            <p className="mt-4 text-muted-foreground text-lg">Every tool shares your resume, your profile and your saved jobs — so each step makes the next one faster.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {BENTO.map((f, i) => (
              <Reveal key={f.title} delay={(i % 4) * 0.06} className={f.span}>
                <Link href={f.href} className="group block h-full">
                  <div className={`h-full rounded-3xl border border-border bg-gradient-to-br ${f.tint} to-card p-6 hover-lift`}>
                    <div className="w-11 h-11 rounded-2xl bg-background/80 border border-border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Try it <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Interview Studio */}
        <section id="interview-studio" className="relative py-20 md:py-32 overflow-hidden scroll-mt-16 bg-stone-950 text-stone-100">
          <Parallax speed={0.3} className="absolute -top-20 -left-20">
            <div className="w-[520px] h-[520px] rounded-full bg-primary/25 blur-[120px]" />
          </Parallax>
          <Parallax speed={0.5} className="absolute bottom-0 right-0">
            <div className="w-[460px] h-[460px] rounded-full bg-sky-500/20 blur-[120px]" />
          </Parallax>
          <div className="relative max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-14 items-center">
            <Reveal from="left">
              <p className="text-sm font-semibold text-orange-300 mb-3">Interview Studio</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Walk into every interview like you&apos;ve done it before.</h2>
              <p className="mt-5 text-lg text-stone-300 leading-relaxed">
                A complete interview coach: learn the frameworks, practice real questions, test your knowledge and rehearse on
                camera with AI feedback after every answer.
              </p>
              <ul className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  { icon: GraduationCap, t: "Interview guide", d: "STAR, research, video etiquette, negotiation — step by step." },
                  { icon: MessageSquare, t: `${questionCount}+ question bank`, d: "Answer freely; AI scores and rewrites your answer." },
                  { icon: ListChecks, t: `${quizCount} skill tests`, d: "Timed quizzes with explanations, or generate one for any role." },
                  { icon: Video, t: "Video mock interviews", d: "Think time, recording, live transcript, pace & filler-word stats." },
                ].map((x) => (
                  <li key={x.t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <x.icon className="w-5 h-5 text-orange-300" />
                    <p className="mt-2 font-semibold">{x.t}</p>
                    <p className="text-sm text-stone-400 mt-1">{x.d}</p>
                  </li>
                ))}
              </ul>
              <Link href="/auth/sign-up" className="inline-block mt-8">
                <Button size="lg" className="gap-2 shadow-xl shadow-primary/30">Start practicing free <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            </Reveal>

            <Reveal from="right">
              <Tilt max={6}>
                <div className="rounded-3xl border border-white/10 bg-stone-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div className="relative aspect-video bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center">
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-medium bg-black/50 rounded-full px-2.5 py-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 rec-dot" /> Recording
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] bg-black/50 rounded-full px-2.5 py-1">
                      <Timer className="w-3 h-3" /> 01:48 left
                    </div>
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 to-orange-500" />
                    <div className="absolute bottom-3 inset-x-3 rounded-xl bg-black/60 p-3 text-xs text-stone-200">
                      <Mic className="inline w-3 h-3 mr-1 text-orange-300" /> Live transcript: “My biggest weakness used to be delegation. When I first…”
                    </div>
                  </div>
                  <div className="p-5 grid grid-cols-4 gap-2 text-center">
                    {[["Structure", "9"], ["Relevance", "8"], ["Pace", "138 wpm"], ["Fillers", "2"]].map(([l, v]) => (
                      <div key={l} className="rounded-xl bg-white/5 p-2.5">
                        <div className="text-sm font-bold">{v}</div>
                        <div className="text-[10px] text-stone-400">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </section>

        {/* Auto-apply */}
        <section id="auto-apply" className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32 grid lg:grid-cols-2 gap-14 items-center scroll-mt-16">
          <Reveal from="left" className="order-2 lg:order-1">
            <Tilt max={5}>
              <div className="rounded-3xl border border-border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 flex-1 rounded-md bg-background text-[11px] text-muted-foreground px-2 py-1">boards.greenhouse.io/acme/jobs/senior-engineer</span>
                </div>
                <div className="grid grid-cols-[1fr_160px]">
                  <div className="p-5 space-y-3">
                    {[["First name", "Jane"], ["Email", "jane@example.com"], ["LinkedIn", "linkedin.com/in/jane"], ["Years of experience", "6–10"], ["Require sponsorship?", "No"]].map(([l, v], i) => (
                      <div key={l}>
                        <p className="text-[10px] text-muted-foreground">{l}</p>
                        <div className="mt-0.5 rounded-md border border-primary/30 bg-primary/5 px-2 py-1.5 text-xs text-foreground" style={{ animation: `fadeIn 0.5s ${i * 0.25}s both` }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-l border-border bg-muted/40 p-3 space-y-2 text-[10px]">
                    <p className="font-semibold text-foreground flex items-center gap-1"><Cpu className="w-3 h-3 text-primary" /> Agent</p>
                    <p className="text-muted-foreground">✓ Clicked “Apply”</p>
                    <p className="text-muted-foreground">✓ Filled 14 fields</p>
                    <p className="text-muted-foreground">✓ Uploaded CV</p>
                    <div className="rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 p-1.5">Ready — review & submit</div>
                  </div>
                </div>
              </div>
            </Tilt>
          </Reveal>
          <Reveal from="right" className="order-1 lg:order-2">
            <p className="text-sm font-semibold text-primary mb-3">AI Auto-Applier</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">The boring part of applying, done for you.</h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              A real browser streams right inside Applyo. The AI clicks Apply, fills every field from your profile, uploads your
              resume and answers screening questions — you watch, take over anytime, and approve the final submit.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: MousePointerClick, t: "You stay in control — click and type in the live browser any time" },
                { icon: ShieldCheck, t: "Never submits without your approval" },
                { icon: Link2, t: "Every application lands in your job tracker automatically" },
              ].map((x) => (
                <li key={x.t} className="flex items-start gap-3 text-foreground">
                  <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><x.icon className="w-4 h-4 text-primary" /></span>
                  <span className="pt-1">{x.t}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* How it works */}
        <section className="relative border-y border-border bg-muted/30 py-20 md:py-28 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4">
            <Reveal className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">From resume to offer in four steps</h2>
            </Reveal>
            <div className="grid md:grid-cols-4 gap-6 relative">
              <div className="hidden md:block absolute top-8 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              {[
                { icon: FileText, t: "Upload your resume", d: "We parse it once; every tool reuses it." },
                { icon: Target, t: "Target a job", d: "Paste a link — AI extracts the details and your fit." },
                { icon: Mic, t: "Prepare & practice", d: "Tailor materials and rehearse the interview on video." },
                { icon: Zap, t: "Apply & track", d: "Auto-fill applications and follow up on time." },
              ].map((s, i) => (
                <Reveal key={s.t} delay={i * 0.1} className="text-center">
                  <div className="relative mx-auto w-16 h-16 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center">
                    <s.icon className="w-6 h-6 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-semibold text-foreground">{s.t}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5">{s.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 scroll-mt-16">
          <Reveal className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">Simple pricing. Start free.</h2>
            <p className="mt-4 text-muted-foreground text-lg">Upgrade when your search heats up. Cancel anytime.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {PLANS.map((p, i) => (
              <Reveal key={p.name} delay={i * 0.07}>
                <div className={`relative h-full rounded-3xl border-2 p-6 flex flex-col gap-5 bg-card ${p.highlight ? "border-primary shadow-2xl shadow-primary/15" : "border-border hover-lift"}`}>
                  {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">Most popular</span>}
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-foreground">{p.name}</p>
                    <p className="mt-2"><span className="text-4xl font-bold text-foreground">{p.price}</span><span className="text-muted-foreground">{p.period}</span></p>
                    <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                  </div>
                  <Link href={p.href}><Button className="w-full" variant={p.highlight ? "default" : "outline"}>{p.cta}</Button></Link>
                  <ul className="space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2 text-foreground"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{f}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Lock, t: "Encrypted in transit & at rest" },
              { icon: Shield, t: "Row-level security on all data" },
              { icon: Users, t: "We never sell your data" },
              { icon: Sparkles, t: "Powered by Google Gemini" },
            ].map((x) => (
              <div key={x.t} className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                <x.icon className="w-5 h-5 text-primary" /> {x.t}
              </div>
            ))}
          </div>
        </section>

        {/* Blog */}
        <section className="border-t border-border bg-muted/30 py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-sm font-semibold text-primary mb-2">Free career guides</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Learn from the Applyo blog</h2>
              </div>
              <Link href="/blog" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
                Browse all {ALL_POSTS.length} articles <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {latestPosts.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.08}><PostCard post={p} /></Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-4 py-20 md:py-28 scroll-mt-16">
          <Reveal className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Frequently asked questions</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card p-5 open:shadow-lg transition-shadow">
                <summary className="cursor-pointer list-none flex justify-between gap-4 font-medium text-foreground">
                  {f.q}
                  <span className="text-primary text-xl leading-none group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <Parallax speed={0.25} className="absolute -inset-y-40 inset-x-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-orange-600 to-rose-600" />
            <div className="absolute inset-0 bg-grid opacity-30" />
          </Parallax>
          <Reveal className="relative max-w-3xl mx-auto px-4 text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Your next offer starts today.</h2>
            <p className="mt-5 text-lg text-white/85">Create a free account in 30 seconds. No credit card, no catch.</p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="h-13 px-8 text-base bg-white text-stone-900 hover:bg-white/90 gap-2">
                  Get started free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="h-13 px-8 text-base border-white/40 bg-white/10 text-white hover:bg-white/20 gap-2">
                  <Play className="w-4 h-4" /> Watch the demo
                </Button>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
