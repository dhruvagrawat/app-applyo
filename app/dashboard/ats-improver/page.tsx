"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Copy, Check, Zap, Sparkles, FileText, Target } from "lucide-react"
import { SavedResumeButtons } from "@/components/saved-resume-button"

export default function ATSImproverPage() {
  const [resumeText, setResumeText] = useState("")
  const [missingKeywords, setMissingKeywords] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleImprove = async () => {
    if (!resumeText.trim()) {
      setError("Please enter resume text")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const keywords = missingKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k)

      const response = await fetch("/api/core/ats-improver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, missingKeywords: keywords }),
      })

      if (!response.ok) throw new Error("Failed to improve")
      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/50 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">ATS Score Improver</h1>
              <p className="text-sm text-muted-foreground">Optimize your resume for applicant tracking systems</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Improve Your Resume
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Add your resume and missing keywords for ATS optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume" className="text-xs font-medium text-foreground mb-1.5 block">Resume Text</Label>
                <div className="flex justify-end -mt-1 mb-1.5">
                  <SavedResumeButtons resumeText={resumeText} onLoad={setResumeText} />
                </div>
                <Textarea
                  id="resume"
                  placeholder="Paste your resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-44 bg-muted border-border focus:border-primary resize-none placeholder:text-muted-foreground text-sm smooth-hover"
                />
              </div>

              <div>
                <Label htmlFor="keywords" className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-muted-foreground" />
                  Missing Keywords
                  <span className="text-muted-foreground font-normal">(comma-separated)</span>
                </Label>
                <Textarea
                  id="keywords"
                  placeholder="e.g., Python, React, AWS, Project Management, Leadership..."
                  value={missingKeywords}
                  onChange={(e) => setMissingKeywords(e.target.value)}
                  className="min-h-28 bg-muted border-border focus:border-primary resize-none placeholder:text-muted-foreground text-sm smooth-hover"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Add keywords from the job description that are missing from your resume
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleImprove}
                disabled={isLoading}
                className="w-full h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 smooth-hover font-medium"
              >
                {isLoading ? (
                  <><Spinner className="mr-2" /> Optimizing...</>
                ) : (
                  <><Sparkles className="mr-2 w-4 h-4" /> Improve Resume & Boost ATS Score</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Optimized Resume
                </CardTitle>
                {result && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(result.improved_resume)}
                    className="gap-1.5 h-7 text-xs border-border hover:bg-muted smooth-hover"
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </Button>
                )}
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                Your ATS-optimized version with improved keyword density
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">Your Optimized Resume Awaits</h3>
                    <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                      Fill in your resume and keywords, then click "Improve Resume" to see the optimized version.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-muted border border-border rounded-xl p-4 max-h-80 overflow-y-auto">
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{result.improved_resume}</p>
                  </div>

                  {result.changes && result.changes.length > 0 && (
                    <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        Key Improvements Made
                      </h3>
                      <ul className="space-y-1.5">
                        {result.changes.map((change: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2 items-start">
                            <span className="text-primary mt-0.5">+</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
