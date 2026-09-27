"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Zap, AlertCircle, Target, FileText, TrendingUp, CheckCircle2 } from "lucide-react"
import { SavedResumeButtons } from "@/components/saved-resume-button"
import { JobLinkImporter } from "@/components/job-link-importer"
import { consumeHandoff } from "@/lib/handoff"

export default function ATSCheckerPage() {
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

  const handleCheck = async () => {
    if (!resumeText.trim()) {
      setError("Please enter resume text")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/core/ats-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription: jobDescription || undefined }),
      })

      if (!response.ok) throw new Error("Failed to check ATS")
      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400"
    if (score >= 60) return "text-amber-600 dark:text-amber-400"
    if (score >= 40) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return "border-emerald-300 dark:border-emerald-800"
    if (score >= 60) return "border-amber-300 dark:border-amber-800"
    if (score >= 40) return "border-orange-300 dark:border-orange-800"
    return "border-red-300 dark:border-red-800"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-amber-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">ATS Score Checker</h1>
              <p className="text-sm text-muted-foreground">Analyze your resume's ATS compatibility</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Check Your Resume
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Paste your resume and optional job description for ATS analysis
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
                <Label htmlFor="jd" className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  Job Description
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <JobLinkImporter className="mb-2" onImported={(text) => setJobDescription(text)} />
                <Textarea
                  id="jd"
                  placeholder="Paste the job description for targeted analysis..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-28 bg-muted border-border focus:border-primary resize-none placeholder:text-muted-foreground text-sm smooth-hover"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleCheck}
                disabled={isLoading}
                className="w-full h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 smooth-hover font-medium"
              >
                {isLoading ? (
                  <><Spinner className="mr-2" /> Analyzing Resume...</>
                ) : (
                  <><Zap className="mr-2 w-4 h-4" /> Check ATS Score</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                ATS Analysis
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Your resume's compatibility with applicant tracking systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <Target className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">Ready for Analysis</h3>
                    <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                      Fill in your resume and click "Check ATS Score" to see detailed analysis.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-fade-in">
                  {/* Score Display */}
                  <div className="text-center py-6">
                    <div className={`w-28 h-28 rounded-full flex items-center justify-center border-4 ${getScoreBorderColor(result.atsScore)} mx-auto relative`}>
                      <div className={`text-3xl font-bold ${getScoreColor(result.atsScore)}`}>{result.atsScore}%</div>
                    </div>
                    <p className="text-foreground mt-3 text-sm font-medium">ATS Compatibility Score</p>
                    <div className="w-full max-w-xs mx-auto mt-2 bg-muted rounded-full h-2 overflow-hidden">
                      <div className={`${getScoreBg(result.atsScore)} h-full rounded-full transition-all duration-700`} style={{ width: `${result.atsScore}%` }} />
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  {result.missingKeywords && result.missingKeywords.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Missing Keywords
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full">{result.missingKeywords.length}</span>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.map((keyword: string, i: number) => (
                          <span key={i} className="bg-card border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md text-xs">{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formatting Issues */}
                  {result.formattingIssues && result.formattingIssues.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                        Formatting Issues
                      </h3>
                      <ul className="space-y-1.5">
                        {result.formattingIssues.map((issue: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2 items-start">
                            <span className="text-red-500 mt-0.5">-</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Suggestions
                      </h3>
                      <ul className="space-y-1.5">
                        {result.suggestions.map((suggestion: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2 items-start">
                            <span className="text-emerald-500 mt-0.5">+</span>
                            <span>{suggestion}</span>
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
