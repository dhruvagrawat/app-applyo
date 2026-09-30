"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/* Minimal typings for the Web Speech API (not in lib.dom for all TS versions). */
interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as (new () => SpeechRecognitionLike) | null
}

/**
 * Live speech-to-text via the browser's Web Speech API (Chrome, Edge, Safari).
 * Automatically restarts after pauses while `listening` is true.
 */
export function useSpeechRecognition(lang = "en-US") {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interim, setInterim] = useState("")
  const [error, setError] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  const wantRef = useRef(false)

  useEffect(() => {
    setSupported(!!getRecognitionCtor())
    return () => {
      wantRef.current = false
      recRef.current?.abort()
    }
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return
    setError(null)
    wantRef.current = true
    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = lang
    rec.onresult = (e) => {
      let finalText = ""
      let interimText = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalText += r[0].transcript
        else interimText += r[0].transcript
      }
      if (finalText) setTranscript((t) => `${t} ${finalText}`.replace(/\s+/g, " ").trim())
      setInterim(interimText)
    }
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantRef.current = false
        setError("Microphone access for speech recognition was blocked.")
      }
    }
    rec.onend = () => {
      setInterim("")
      if (wantRef.current) {
        try {
          rec.start()
        } catch {
          // already started
        }
      } else setListening(false)
    }
    recRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      setError("Couldn't start speech recognition.")
    }
  }, [lang])

  const stop = useCallback(() => {
    wantRef.current = false
    recRef.current?.stop()
    setListening(false)
  }, [])

  const reset = useCallback(() => {
    setTranscript("")
    setInterim("")
  }, [])

  return { supported, listening, transcript, interim, error, start, stop, reset, setTranscript }
}
