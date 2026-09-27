"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { BarChart3, FileText, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { SavedResumeButtons } from "@/components/saved-resume-button"
import { JobLinkImporter } from "@/components/job-link-importer"
import { consumeHandoff } from "@/lib/handoff"

export default function JobResumeComparePage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Pre-fill from Job Tracker / other tools
  useEffect(() => {
    const handoff = consumeHandoff()
    if (handoff?.jobDescription) setJobDescription(handoff.jobDescription)
    if (handoff?.resumeText) setResumeText(handoff.resumeText)
  }, [])
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCompare = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Both resume and job description are required")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/core/job-resume-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      })

      if (!response.ok) throw new Error("Failed to compare")
      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getMatchColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 50) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const getMatchBg = (score: number) => {
    if (score >= 75) return "bg-emerald-500"
    if (score >= 50) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Job-to-Resume Comparison</h1>
              <p className="text-sm text-muted-foreground">See how well your resume matches the job</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border lg:h-fit animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Compare
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Enter your resume and target job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume" className="text-xs font-medium text-foreground mb-1.5 block">Resume</Label>
                <div className="flex justify-end -mt-1 mb-1.5">
                  <SavedResumeButtons resumeText={resumeText} onLoad={setResumeText} />
                </div>
                <Textarea
                  id="resume"
                  placeholder="Paste your resume..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-40 bg-muted border-border resize-none focus:border-primary text-sm smooth-hover"
                />
              </div>

              <div>
                <Label htmlFor="jd" className="text-xs font-medium text-foreground mb-1.5 block">Job Description</Label>
                <JobLinkImporter className="mb-2" onImported={(text) => setJobDescription(text)} />
                <Textarea
                  id="jd"
                  placeholder="Paste job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-40 bg-muted border-border resize-none focus:border-primary text-sm smooth-hover"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleCompare}
                disabled={isLoading}
                className="w-full h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 smooth-hover font-medium"
              >
                {isLoading && <Spinner className="mr-2" />}
                {isLoading ? "Analyzing..." : "Compare"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Match Analysis
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Your compatibility score</CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">Ready for Comparison</h3>
                    <p className="text-muted-foreground text-xs max-w-sm mx-auto">Compare to see match analysis</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-fade-in">
                  <div className="text-center py-4">
                    <div className={`text-5xl font-bold ${getMatchColor(result.match_score)}`}>{result.match_score}%</div>
                    <p className="text-muted-foreground text-sm mt-2">Match Score</p>
                    <div className="w-full max-w-xs mx-auto mt-3 bg-muted rounded-full h-2 overflow-hidden">
                      <div className={`${getMatchBg(result.match_score)} h-full rounded-full transition-all duration-700`} style={{ width: `${result.match_score}%` }} />
                    </div>
                  </div>

                  {result.strengths && result.strengths.length > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Your Strengths
                      </h3>
                      <ul className="space-y-1.5">
                        {result.strengths.map((strength: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-emerald-500">+</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.gaps && result.gaps.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Gaps to Address
                      </h3>
                      <ul className="space-y-1.5">
                        {result.gaps.map((gap: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-amber-500">-</span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        Recommendations
                      </h3>
                      <ul className="space-y-1.5">
                        {result.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary">-</span>
                            {rec}
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
