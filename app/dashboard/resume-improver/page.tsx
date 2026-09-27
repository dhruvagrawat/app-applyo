"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Brain, Copy, Check, FileText, Sparkles, Target } from "lucide-react"
import { SavedResumeButtons } from "@/components/saved-resume-button"

export default function ResumeImproverPage() {
  const [resumeText, setResumeText] = useState("")
  const [tone, setTone] = useState("formal")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [wordCount, setWordCount] = useState(0)

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      setError("Please enter resume text")
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
    setLoadingStep(0)

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev))
    }, 1000)

    try {
      const response = await fetch("/api/core/resume-improver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, tone }),
      })

      clearInterval(stepInterval)

      if (!response.ok) throw new Error("Failed to generate")
      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      clearInterval(stepInterval)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
      setLoadingStep(0)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateWordCount = (text: string) => {
    setResumeText(text)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
    setWordCount(words)
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/50 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">AI Resume Improver</h1>
              <p className="text-sm text-muted-foreground">Enhance your resume with AI-powered suggestions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Your Resume
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Paste your resume text and choose your preferred tone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume" className="text-xs font-medium text-foreground flex items-center gap-2 mb-1.5">
                  Resume Text
                  <span className="text-muted-foreground font-normal">
                    ({wordCount} {wordCount === 1 ? 'word' : 'words'})
                  </span>
                </Label>
                <div className="flex justify-end -mt-1 mb-1.5">
                  <SavedResumeButtons resumeText={resumeText} onLoad={updateWordCount} />
                </div>
                <Textarea
                  id="resume"
                  placeholder="Paste your resume content here... Include your experience, skills, education, and achievements. Minimum 100 words required."
                  value={resumeText}
                  onChange={(e) => updateWordCount(e.target.value)}
                  className="min-h-48 bg-muted border-border focus:border-primary resize-none placeholder:text-muted-foreground text-sm smooth-hover"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-xs text-muted-foreground">
                    {wordCount >= 100 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Minimum word count met</span>
                    ) : (
                      <span>{100 - wordCount} more words needed</span>
                    )}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="tone" className="text-xs font-medium text-foreground flex items-center gap-2 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-muted-foreground" />
                  Writing Tone
                </Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-10 bg-muted border-border focus:border-primary text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal & Professional</SelectItem>
                    <SelectItem value="conversational">Conversational & Engaging</SelectItem>
                    <SelectItem value="persuasive">Persuasive & Impactful</SelectItem>
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
                disabled={isLoading || wordCount < 100}
                className="w-full h-10 text-sm bg-primary text-primary-foreground hover:bg-primary/90 smooth-hover font-medium"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Generating Improvements...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-4 h-4" />
                    Improve My Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Improved Resume
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Your enhanced resume with professional improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-6 py-4">
                  <div className="text-center space-y-4">
                    <Spinner className="w-8 h-8 mx-auto text-primary" />
                    <div>
                      <p className="font-medium text-foreground text-sm mb-3">
                        {["Analyzing resume content...", "Identifying improvement areas...", "Generating enhanced version...", "Finalizing suggestions..."][loadingStep]}
                      </p>
                      <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-500 ease-out rounded-full"
                          style={{ width: `${((loadingStep + 1) / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 opacity-60">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-32 mb-2" />
                        <div className="h-16 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : !result ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">Your Improved Resume Awaits</h3>
                    <p className="text-muted-foreground text-xs max-w-sm mx-auto">
                      Fill in your resume on the left and click "Improve My Resume" to see AI-powered enhancements.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* Summary */}
                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                      <Brain className="w-3.5 h-3.5 text-primary" />
                      AI Analysis Summary
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{result.summary}</p>
                  </div>

                  {/* Improved Resume */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-foreground">Improved Resume</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(result.improved_resume)}
                        className="gap-1.5 h-7 text-xs border-border hover:bg-muted smooth-hover"
                      >
                        {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </Button>
                    </div>
                    <div className="bg-muted border border-border rounded-xl p-4 max-h-72 overflow-y-auto">
                      <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{result.improved_resume}</p>
                    </div>
                  </div>

                  {/* Key Changes */}
                  {result.edits && result.edits.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                        <Target className="w-3.5 h-3.5 text-primary" />
                        Key Improvements Made
                      </h3>
                      <div className="space-y-2">
                        {result.edits.slice(0, 3).map((edit: any, i: number) => (
                          <div key={i} className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg p-3 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-1.5">{edit.reason}</p>
                            <div className="space-y-1">
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] text-destructive mt-0.5 font-medium">Before:</span>
                                <p className="text-[11px] text-muted-foreground line-through flex-1">{edit.line_before}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">After:</span>
                                <p className="text-[11px] text-foreground font-medium flex-1">{edit.line_after}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
