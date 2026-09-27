"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Zap, Copy, Check, Target, AlertCircle, CheckCircle2 } from "lucide-react"
import { ResumeUploader } from "@/components/resume-uploader"
import { SavedResumeButtons } from "@/components/saved-resume-button"
import { JobLinkImporter } from "@/components/job-link-importer"
import { consumeHandoff } from "@/lib/handoff"

export default function SkillGapFinderPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  // Pre-fill from Job Tracker / other tools
  useEffect(() => {
    const handoff = consumeHandoff()
    if (handoff?.jobDescription) setJobDescription(handoff.jobDescription)
    if (handoff?.resumeText) setResumeText(handoff.resumeText)
  }, [])

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      setError("Please provide your resume")
      return
    }
    if (!jobDescription.trim()) {
      setError("Please provide the job description")
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
      const response = await fetch("/api/core/skill-gap-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
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
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-950/50 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Skill Gap Finder</h1>
              <p className="text-sm text-muted-foreground">Identify skills you need to develop</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Input
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Provide your resume and job description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-foreground mb-1.5 block">Your Resume</Label>
                <div className="flex justify-end -mt-1 mb-1.5">
                  <SavedResumeButtons resumeText={resumeText} onLoad={setResumeText} />
                </div>
                <ResumeUploader
                  onSuccess={(text, wCount) => {
                    setResumeText(text)
                    setWordCount(wCount)
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
                  placeholder="Paste the job description here..."
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
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 smooth-hover font-medium"
              >
                {isLoading && <Spinner className="mr-2 w-3.5 h-3.5" />}
                {isLoading ? "Analyzing..." : "Find Skill Gaps"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Gap Analysis
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Skills you need to develop</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Spinner className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground">Analyzing gaps...</p>
                </div>
              ) : !result ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <Target className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">Results Will Appear Here</h3>
                    <p className="text-muted-foreground text-xs">Upload your resume and provide a job description</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      Missing Skills
                    </h3>
                    <div className="space-y-1.5">
                      {result.missing_skills?.map((skill: string, i: number) => (
                        <div key={i} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-2.5 rounded-lg text-xs text-red-700 dark:text-red-300">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Matching Skills
                    </h3>
                    <div className="space-y-1.5">
                      {result.matching_skills?.map((skill: string, i: number) => (
                        <div key={i} className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-2.5 rounded-lg text-xs text-emerald-700 dark:text-emerald-300">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-foreground mb-2">Recommendations</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.recommendations}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                    className="w-full gap-1.5 h-8 text-xs border-border hover:bg-muted smooth-hover"
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Results</>}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
