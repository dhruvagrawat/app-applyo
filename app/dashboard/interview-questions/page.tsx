"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Brain, Copy, Check, MessageSquare } from "lucide-react"
import { SavedResumeButtons } from "@/components/saved-resume-button"
import { JobLinkImporter } from "@/components/job-link-importer"
import { consumeHandoff } from "@/lib/handoff"

export default function InterviewQuestionsPage() {
  const [jobDescription, setJobDescription] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [isLoading, setIsLoading] = useState(false)

  // Pre-fill from Job Tracker / other tools
  useEffect(() => {
    const handoff = consumeHandoff()
    if (handoff?.jobDescription) setJobDescription(handoff.jobDescription)
    if (handoff?.resumeText) setResumeText(handoff.resumeText)
  }, [])
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError("Job description is required")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/core/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeText: resumeText || undefined,
          difficulty,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate questions")
      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Interview Question Generator</h1>
              <p className="text-sm text-muted-foreground">Prepare for interviews with AI-generated questions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border lg:h-fit animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Generate Questions
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Prepare for your interview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jd" className="text-xs font-medium text-foreground mb-1.5 block">Job Description</Label>
                <JobLinkImporter className="mb-2" onImported={(text) => setJobDescription(text)} />
                <Textarea
                  id="jd"
                  placeholder="Paste the job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-36 bg-muted border-border resize-none focus:border-primary text-sm smooth-hover"
                />
              </div>

              <div>
                <Label htmlFor="resume" className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  Your Resume <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="flex justify-end -mt-1 mb-1.5">
                  <SavedResumeButtons resumeText={resumeText} onLoad={setResumeText} />
                </div>
                <Textarea
                  id="resume"
                  placeholder="Paste your resume for personalized questions..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-28 bg-muted border-border resize-none focus:border-primary text-sm smooth-hover"
                />
              </div>

              <div>
                <Label htmlFor="difficulty" className="text-xs font-medium text-foreground mb-1.5 block">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="h-10 bg-muted border-border focus:border-primary text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
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
                {isLoading && <Spinner className="mr-2" />}
                {isLoading ? "Generating..." : "Generate Questions"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                Interview Prep
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Practice with these questions</CardDescription>
            </CardHeader>
            <CardContent>
              {!result || !result.questions ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">Questions Will Appear Here</h3>
                    <p className="text-muted-foreground text-xs max-w-sm mx-auto">Generate questions to start practicing</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-150 overflow-y-auto">
                  {result.questions.map((q: any, i: number) => (
                    <div key={i} className="bg-muted border border-border p-4 rounded-xl animate-fade-in smooth-hover hover:border-primary/20" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-foreground text-sm leading-snug">
                          <span className="text-primary font-semibold">Q{i + 1}:</span> {q.question || q}
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(typeof q === "string" ? q : JSON.stringify(q), i)}
                          className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-primary"
                        >
                          {copiedIndex === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                      {q.suggested_answer && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-medium text-foreground">Suggested answer:</span> {q.suggested_answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
