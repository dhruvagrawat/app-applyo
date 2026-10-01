"use client"

import { useEffect, useState } from "react"
import { Mail, Copy, Check, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { consumeHandoff } from "@/lib/handoff"

const TYPES = [
  { value: "followup", label: "Follow-up after interview" },
  { value: "thank_you", label: "Thank-you after interview" },
  { value: "cold", label: "Cold outreach to recruiter / manager" },
  { value: "referral", label: "Referral request" },
  { value: "status", label: "Application status check" },
  { value: "networking", label: "Informational chat request" },
  { value: "negotiation", label: "Offer negotiation" },
  { value: "decline", label: "Decline an offer" },
]

export default function EmailMakerPage() {
  const [type, setType] = useState("followup")
  const [tone, setTone] = useState("professional")
  const [context, setContext] = useState("")
  const [senderName, setSenderName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const h = consumeHandoff()
    if (h?.jobDescription) setContext(h.jobDescription.slice(0, 1500))
    fetch("/api/profile/application").then((r) => r.json()).then((d) => setSenderName(d.profile?.full_name || "")).catch(() => {})
  }, [])

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/core/email-maker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, tone, context, senderName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed")
    } finally {
      setLoading(false)
    }
  }

  const full = result ? `Subject: ${result.subject}\n\n${result.body}` : ""

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-950/50 rounded-xl flex items-center justify-center"><Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Email Maker</h1>
            <p className="text-sm text-muted-foreground">Follow-ups, thank-yous, outreach and offer emails — written in seconds.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">What do you need?</CardTitle>
              <CardDescription className="text-xs">The more specific the context, the better the email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Email type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="h-10 bg-muted"><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="h-10 bg-muted"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["professional", "warm", "confident", "concise", "enthusiastic"].map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Context</Label>
                <Textarea value={context} onChange={(e) => setContext(e.target.value)} className="min-h-36 text-sm bg-muted"
                  placeholder="e.g. Interviewed for Senior Frontend Engineer at Acme last Tuesday with Sarah (Eng Manager). We discussed their design system migration. Haven't heard back in a week." />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Your name (sign-off)</Label>
                <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} className="h-10 bg-muted" />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button onClick={generate} disabled={loading} className="w-full gap-1.5">
                {loading ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />} {loading ? "Writing…" : "Write email"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Your email</CardTitle>
              {result && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => { navigator.clipboard.writeText(full); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied" : "Copy"}
                  </Button>
                  <a href={`mailto:?subject=${encodeURIComponent(result.subject)}&body=${encodeURIComponent(result.body)}`}>
                    <Button size="sm" className="h-8 gap-1.5"><Send className="w-3.5 h-3.5" /> Open in mail</Button>
                  </a>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-3">
                  <Input value={result.subject} onChange={(e) => setResult({ ...result, subject: e.target.value })} className="font-medium bg-muted" />
                  <Textarea value={result.body} onChange={(e) => setResult({ ...result, body: e.target.value })} className="min-h-80 text-sm bg-muted leading-relaxed" />
                </div>
              ) : (
                <div className="py-20 text-center text-sm text-muted-foreground">
                  <Mail className="w-8 h-8 mx-auto mb-3 opacity-50" /> Your email will appear here — fully editable.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
