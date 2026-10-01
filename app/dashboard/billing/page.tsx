import Link from "next/link"
import { CheckCircle, CreditCard, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SITE } from "@/lib/site"

export const metadata = { title: "Plan & Billing" }

const PLANS = [
  { name: "Starter", price: "$0", current: true, features: ["Core AI tools", "Resume Builder", "Interview guide, question bank & tests", "Smart job tracker"] },
  { name: "Pro", price: "$15/mo", features: ["Higher AI limits", "AI video mock interviews", "Tailor Everything", "Priority AI"] },
  { name: "Business", price: "$29/mo", features: ["Unlimited AI", "Advanced analytics", "Follow-up sequences", "Priority support"] },
  { name: "Team", price: "$49/mo", features: ["AI Auto-Applier", "5 seats", "Bulk resume processing", "Dedicated support"] },
]

export default function BillingPage() {
  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Plan & Billing</h1>
            <p className="text-sm text-muted-foreground">You&apos;re on the free Starter plan.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Online checkout is coming soon</p>
            <p className="text-sm text-muted-foreground">Want early access to a paid plan or a team account? Email us and we&apos;ll set it up.</p>
          </div>
          <a href={`mailto:${SITE.email}?subject=Applyo%20plan%20upgrade`}>
            <Button className="gap-1.5"><Mail className="w-4 h-4" /> Contact us to upgrade</Button>
          </a>
        </div>

        <div id="upgrade" className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 scroll-mt-20">
          {PLANS.map((p) => (
            <div key={p.name} className={`rounded-2xl border-2 bg-card p-5 ${p.current ? "border-primary" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-wide text-foreground">{p.name}</p>
                {p.current && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">Current</span>}
              </div>
              <p className="text-2xl font-bold text-foreground mt-2">{p.price}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex gap-2 text-foreground"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">See the full comparison on the <Link href="/#pricing" className="text-primary underline">pricing page</Link>.</p>
      </div>
    </div>
  )
}
