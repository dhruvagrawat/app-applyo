import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import "./globals.css"
import { SITE } from "@/lib/site"
import { JsonLd, organizationLd, websiteLd } from "@/lib/seo/json-ld"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s | ${SITE.name}` },
  description: SITE.description,
  keywords: SITE.keywords,
  applicationName: SITE.name,
  authors: [{ name: "Applyo", url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "Career",
  alternates: { types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: "/",
    title: SITE.title,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image", site: SITE.twitter, title: SITE.title, description: SITE.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffaf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
  width: "device-width",
  initialScale: 1,
}

const themeScript = `(function(){try{var t=localStorage.getItem('applyo-theme')||'mocha';var d=document.documentElement;d.setAttribute('data-theme',t);if(t==='custom'){var h=localStorage.getItem('applyo-theme-custom'),f=localStorage.getItem('applyo-theme-customfg')||'#fff';if(h){var s=d.style;s.setProperty('--primary',h);s.setProperty('--primary-foreground',f);s.setProperty('--ring',h);s.setProperty('--sidebar-primary',h);s.setProperty('--sidebar-ring',h);s.setProperty('--secondary','color-mix(in srgb, '+h+' 16%, var(--background))');s.setProperty('--secondary-foreground',h);s.setProperty('--accent','color-mix(in srgb, '+h+' 14%, var(--background))');s.setProperty('--accent-foreground',h);s.setProperty('--sidebar-accent','color-mix(in srgb, '+h+' 14%, var(--background))');s.setProperty('--sidebar-accent-foreground',h);}}}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`} data-theme="mocha">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={[organizationLd, websiteLd]} />
      </head>
      <body className="font-sans bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
