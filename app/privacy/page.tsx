import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Applyo collects, uses, stores and protects your personal data, and the choices and rights you have over it.",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Effective date: June 1, 2026 · Last updated: June 1, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">1. Introduction</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Applyo (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and share your data when you use our AI-powered job application platform.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">2. Information We Collect</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
              <li><strong>Account information:</strong> email address and password (hashed) stored via Supabase Auth</li>
              <li><strong>Profile data:</strong> name, professional headline, and job preferences you enter voluntarily</li>
              <li><strong>Resume content:</strong> text or PDF resumes you upload, stored in Supabase Storage</li>
              <li><strong>Generated outputs:</strong> AI-generated resumes, cover letters, emails, and interview questions</li>
              <li><strong>Job tracker data:</strong> job applications, statuses, and notes you add</li>
              <li><strong>Usage data:</strong> feature usage counts, timestamps, and activity logs</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">3. How We Use Your Information</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
              <li>To provide and improve our AI-powered job application tools</li>
              <li>To pre-fill your data across all tools for a seamless experience</li>
              <li>To send service-related emails (account verification, important updates)</li>
              <li>To display usage analytics on your dashboard</li>
              <li>To improve Applyo&apos;s features and AI quality</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">4. Data Storage & Security</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All data is stored in <strong>Supabase</strong> with row-level security (RLS) enabled on every table. This means only you can access your own data — even our internal systems cannot read your rows without your authentication token. Resume files are stored in encrypted Supabase Storage with private bucket access.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">5. AI Processing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your resume and job descriptions are sent to <strong>Google Gemini API</strong> to generate AI outputs. We send only the data necessary for each request. We do not use your data to train Google&apos;s models. Please review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google&apos;s Privacy Policy</a> for their data handling practices.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">6. Data Sharing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We <strong>do not sell</strong> your personal data. We do not share your information with third parties for marketing purposes. We share data only with service providers necessary to operate Applyo (Supabase for database/storage, Google for AI processing).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">7. Your Rights</h2>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
              <li><strong>Access:</strong> request a copy of all data we hold about you</li>
              <li><strong>Deletion:</strong> request deletion of your account and all associated data</li>
              <li><strong>Correction:</strong> update your profile and personal information at any time via Settings</li>
              <li><strong>Export:</strong> download your generated outputs in PDF format (Pro plan)</li>
            </ul>
            <p className="text-sm text-muted-foreground">To exercise any of these rights, contact us at <a href="mailto:privacy@applyo.app" className="text-primary hover:underline">privacy@applyo.app</a>.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">8. Cookies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Applyo uses cookies only for authentication (Supabase session management). We do not use advertising or tracking cookies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">9. Contact</h2>
            <p className="text-sm text-muted-foreground">
              Questions? Email us at <a href="mailto:privacy@applyo.app" className="text-primary hover:underline">privacy@applyo.app</a>.
            </p>
          </section>
        </div>

        <div className="border-t border-border pt-6 flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground smooth-hover">Terms of Service</Link>
          <Link href="/" className="hover:text-foreground smooth-hover">Home</Link>
        </div>
      </div>
    </main>
  )
}
