export interface AnswerFeedback {
  score: number
  verdict: string
  strengths: string[]
  improvements: string[]
  star: { situation: boolean; task: boolean; action: boolean; result: boolean } | null
  improved_answer: string
  follow_up_question: string
  delivery_tips: string[]
}
