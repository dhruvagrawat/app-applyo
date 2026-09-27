"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Briefcase, MapPin, Search, TrendingUp } from "lucide-react"
import { ResumeUploader } from "@/components/resume-uploader"
import { SavedResumeButtons } from "@/components/saved-resume-button"

export default function JobFinderPage() {
  const [resumeText, setResumeText] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      setError("Please provide your resume")
      return
    }
    if (!jobTitle.trim()) {
      setError("Please specify job title")
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
      const response = await fetch("/api/core/job-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobTitle, location }),
      })

      if (!response.ok) throw new Error("Failed to find jobs")
      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Job Finder</h1>
              <p className="text-sm text-muted-foreground">Discover job opportunities matching your profile</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.05s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Search Criteria
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Find matching opportunities</CardDescription>
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
                <Label htmlFor="title" className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                  Job Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Frontend Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="h-10 text-sm bg-muted border-border focus:border-primary smooth-hover"
                />
              </div>

              <div>
                <Label htmlFor="location" className="text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  Location <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Remote, New York, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 text-sm bg-muted border-border focus:border-primary smooth-hover"
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
                {isLoading ? "Searching..." : "Find Opportunities"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Job Matches
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Opportunities for you</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <Spinner className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <p className="text-sm text-muted-foreground">Finding jobs...</p>
                </div>
              ) : !result ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-14 h-14 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                    <Search className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1 text-sm">Results Will Appear Here</h3>
                    <p className="text-muted-foreground text-xs">Upload your resume and search for jobs</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-125 overflow-y-auto">
                  {result.opportunities?.map((job: any, i: number) => (
                    <div
                      key={i}
                      className="border border-border bg-muted/50 p-4 rounded-xl smooth-hover hover:border-primary/20 animate-fade-in"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <h4 className="text-sm font-medium text-foreground">{job.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.company}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </p>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {job.match_score}% match
                        </span>
                      </div>
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
