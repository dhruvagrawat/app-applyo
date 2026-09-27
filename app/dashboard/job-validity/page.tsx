"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react"
import { ResumeUploader } from "@/components/resume-uploader"
import { SavedResumeButtons } from "@/components/saved-resume-button"
import { JobLinkImporter } from "@/components/job-link-importer"
import { consumeHandoff } from "@/lib/handoff"

export default function JobValidityPage() {
  const [jobDescription, setJobDescription] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Pre-fill from Job Tracker / other tools
  useEffect(() => {
    const handoff = consumeHandoff()
    if (handoff?.jobDescription) setJobDescription(handoff.jobDescription)
    if (handoff?.resumeText) setResumeText(handoff.resumeText)
  }, [])
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Please provide the job listing")
      return
    }
    if (!resumeText.trim()) {
      setError("Please provide your resume")
      return
    }

    const words = resumeText.trim().split(/\s+/).length
    if (words < 100) {
      setError(`Resume must be at least 100 words. Current: ${words} words`)
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/core/job-validity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resumeText }),
      })

      if (!response.ok) throw new Error("Failed to analyze")
      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score > 70) return "bg-emerald-500"
    if (score > 40) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Job Listing Validity Checker</h1>
              <p className="text-sm text-muted-foreground">Verify if job listings are legitimate and suitable</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Input
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Provide job listing and your resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-foreground mb-1.5 block">Your Resume</Label>
                <div className="flex justify-end -mt-1 mb-1.5">
                  <SavedResumeButtons resumeText={resumeText} onLoad={setResumeText} />
                </div>
                <ResumeUploader
                  onSuccess={(text) => {
                    setResumeText(text)
                    setError(null)
                  }}
                  onError={(msg) => setError(msg)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="job" className="text-xs font-medium text-foreground mb-1.5 block">Job Description</Label>
                <JobLinkImporter className="mb-2" onImported={(text) => setJobDescription(text)} />
                <Textarea
                  id="job"
                  placeholder="Paste the entire job listing here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-36 text-sm bg-muted border-border focus:border-primary resize-none smooth-hover"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 smooth-hover font-medium"
              >
                {isLoading && <Spinner className="mr-2 w-3.5 h-3.5" />}
                {isLoading ? "Analyzing..." : "Check Validity"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Analysis
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Job listing assessment</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Spinner className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing job listing...</p>
                </div>
              ) : !result ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <Shield className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">Results Will Appear Here</h3>
                    <p className="text-muted-foreground text-xs">Upload your resume and provide a job listing</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h3 className="text-xs font-medium text-foreground mb-2">Legitimacy Score</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-700 ${getScoreColor(result.legitimacy_score)}`}
                          style={{ width: `${result.legitimacy_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-foreground">{result.legitimacy_score}%</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Red Flags
                    </h3>
                    <div className="space-y-1.5">
                      {result.red_flags?.length > 0 ? (
                        result.red_flags.map((flag: string, i: number) => (
                          <div key={i} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-2.5 rounded-lg text-xs text-red-700 dark:text-red-300">
                            {flag}
                          </div>
                        ))
                      ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-2.5 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          No red flags detected
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-muted border border-border rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-foreground mb-1.5">Fit Analysis</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.fit_analysis}</p>
                  </div>

                  <div className={`p-3 rounded-lg border text-xs font-medium ${
                    result.recommendation?.includes("Good fit")
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-300"
                  }`}>
                    {result.recommendation}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
