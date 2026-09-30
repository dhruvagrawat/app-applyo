import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions that govern your use of Applyo, its AI career tools, subscriptions and content.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 md:px-12">
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground smooth-hover">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-base text-foreground">Applyo</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Effective date: June 1, 2026 · Last updated: June 1, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">1. Acceptance</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By creating an account or using Applyo, you agree to these Terms of Service. If you don&apos;t agree, please do not use the platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">2. Description of Service</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Applyo is an AI-powered job application assistant that helps users improve resumes, generate cover letters and emails, prepare for interviews, track job applications, and discover job opportunities. Features vary by plan (Starter, Pro, Business, Team).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">3. Account Responsibilities</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
              <li>You must provide accurate account information</li>
              <li>You are responsible for keeping your credentials secure</li>
              <li>You must be at least 16 years old to use Applyo</li>
              <li>One account per person; sharing accounts is not permitted</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">4. Acceptable Use</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">You agree not to:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
              <li>Use Applyo to create fraudulent or misleading job applications</li>
              <li>Attempt to bypass plan limits through technical means</li>
              <li>Reverse engineer, scrape, or abuse our API</li>
              <li>Use AI-generated content without appropriate review and personalization</li>
              <li>Upload content that violates third-party rights</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">5. AI-Generated Content</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI outputs are provided as starting points only. You are responsible for reviewing, verifying, and personalizing all AI-generated content before submitting it in job applications. Applyo does not guarantee the accuracy, completeness, or suitability of any generated content.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">6. Subscriptions & Billing</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
              <li>Paid plans are billed monthly and renew automatically</li>
              <li>All paid plans include a 14-day free trial</li>
              <li>You may cancel at any time; access continues until the end of the billing period</li>
              <li>Refunds are available within 7 days of the start of a new billing period, if requested</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">7. Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You retain ownership of content you upload (resumes, cover letters). You grant Applyo a limited license to process that content solely for delivering the service. AI-generated outputs are yours to use commercially.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">8. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Applyo is provided &ldquo;as is&rdquo;. We do not guarantee employment outcomes or the effectiveness of AI-generated content. Our liability is limited to the amount you paid for the service in the past 12 months.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">9. Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may suspend or terminate accounts that violate these terms. You may delete your account at any time from Settings.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">10. Contact</h2>
            <p className="text-sm text-muted-foreground">
              Questions? Email us at <a href="mailto:legal@applyo.app" className="text-primary hover:underline">legal@applyo.app</a>.
            </p>
          </section>
        </div>

        <div className="border-t border-border pt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground smooth-hover">Privacy Policy</Link>
          <Link href="/" className="hover:text-foreground smooth-hover">Home</Link>
        </div>
      </div>
    </main>
  )
}
