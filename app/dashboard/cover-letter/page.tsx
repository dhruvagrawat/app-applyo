"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { FileText, Copy, Check, Sparkles } from "lucide-react"
import { SavedResumeButtons } from "@/components/saved-resume-button"
import { JobLinkImporter } from "@/components/job-link-importer"
import { consumeHandoff } from "@/lib/handoff"

export default function CoverLetterPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [tone, setTone] = useState("professional")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Pre-fill from Job Tracker / other tools
  useEffect(() => {
    const handoff = consumeHandoff()
    if (handoff?.jobDescription) setJobDescription(handoff.jobDescription)
    if (handoff?.resumeText) setResumeText(handoff.resumeText)
  }, [])

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter job description")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/core/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText || undefined,
          jobDescription,
          tone,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate cover letter")
      const data = await response.json()
      setResult(data.result.cover_letter)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Cover Letter Maker</h1>
              <p className="text-sm text-muted-foreground">Generate tailored cover letters with AI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="bg-card border-border lg:h-fit animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Create Cover Letter
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Provide your resume and job details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume" className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  Resume
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="flex justify-end -mt-1 mb-1.5">
                  <SavedResumeButtons resumeText={resumeText} onLoad={setResumeText} />
                </div>
                <Textarea
                  id="resume"
                  placeholder="Paste your resume to personalize the letter..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-28 text-sm bg-muted border-border resize-none focus:border-primary smooth-hover"
                />
              </div>

              <div>
                <Label htmlFor="jd" className="text-xs font-medium text-foreground mb-1.5 block">
                  Job Description
                </Label>
                <JobLinkImporter className="mb-2" onImported={(text) => setJobDescription(text)} />
                <Textarea
                  id="jd"
                  placeholder="Paste the job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-28 text-sm bg-muted border-border resize-none focus:border-primary smooth-hover"
                />
              </div>

              <div>
                <Label htmlFor="tone" className="text-xs font-medium text-foreground mb-1.5 block">Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-10 text-sm bg-muted border-border focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 smooth-hover font-medium"
              >
                {isLoading && <Spinner className="mr-2 w-3.5 h-3.5" />}
                {isLoading ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Your Cover Letter
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Ready to customize and send
                  </CardDescription>
                </div>
                {result && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-1.5 h-7 text-xs border-border hover:bg-muted smooth-hover"
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">Your Cover Letter Awaits</h3>
                    <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                      Generate a cover letter to see results here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted border border-border p-4 rounded-xl max-h-125 overflow-y-auto animate-fade-in">
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{result}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
