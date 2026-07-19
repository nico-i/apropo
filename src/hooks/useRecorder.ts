import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderResult = {
  blob: Blob
  mimeType: string
  durationMs: number
}

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTicking = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => stopTicking, [stopTicking])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      // Timeslice forces periodic dataavailable events; without it Brave/Chromium
      // can deliver only the header chunk, yielding an unplayable ~110-byte blob.
      recorder.start(1000)
      recorderRef.current = recorder
      startedAtRef.current = Date.now()
      setElapsedMs(0)
      intervalRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current)
      }, 200)
      setIsRecording(true)
    } catch {
      setError('Microphone access was denied or is unavailable.')
    }
  }, [])

  const stop = useCallback((): Promise<RecorderResult | null> => {
    const recorder = recorderRef.current
    if (!recorder) return Promise.resolve(null)

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        recorder.stream.getTracks().forEach((track) => track.stop())
        recorderRef.current = null
        stopTicking()
        setIsRecording(false)
        if (blob.size === 0) {
          setError('Recording was empty. Please try again.')
          resolve(null)
          return
        }
        resolve({ blob, mimeType, durationMs: Date.now() - startedAtRef.current })
      }
      recorder.stop()
    })
  }, [stopTicking])

  return { isRecording, elapsedMs, error, start, stop }
}
