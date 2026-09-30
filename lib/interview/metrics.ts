/** Delivery metrics computed from a transcript — shared by client and server. */
// "like" is left out on purpose: it is too often a real word to count reliably from a transcript.
const FILLERS = ["um", "uh", "erm", "er", "ah", "hmm", "you know", "i mean", "sort of", "kind of", "basically", "actually", "literally", "so yeah"]

export interface DeliveryMetrics {
  words: number
  durationSec: number
  wordsPerMinute: number
  fillerCount: number
  fillers: Record<string, number>
}

export function analyzeDelivery(transcript: string, durationSec: number): DeliveryMetrics {
  const text = ` ${transcript.toLowerCase().replace(/[^a-z'\s]/g, " ").replace(/\s+/g, " ")} `
  const words = text.trim() ? text.trim().split(" ").length : 0
  const fillers: Record<string, number> = {}
  for (const f of FILLERS) {
    const matches = text.match(new RegExp(`(?<= )${f}(?= )`, "g"))
    if (matches?.length) fillers[f] = matches.length
  }
  const fillerCount = Object.values(fillers).reduce((a, b) => a + b, 0)
  return {
    words,
    durationSec: Math.round(durationSec),
    wordsPerMinute: durationSec > 5 ? Math.round((words / durationSec) * 60) : 0,
    fillerCount,
    fillers,
  }
}

export function paceLabel(wpm: number) {
  if (!wpm) return "—"
  if (wpm < 110) return "A bit slow"
  if (wpm <= 165) return "Great pace"
  if (wpm <= 190) return "A bit fast"
  return "Too fast"
}
