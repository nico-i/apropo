import { useCallback, useEffect, useRef, useState } from 'react'
import { getRecordingBlob } from '../db'

type PlayerState = {
  ready: boolean
  playing: boolean
  currentTime: number
  duration: number
  error: string | null
}

export function useAudioPlayer(id: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const contextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const frameRef = useRef<number | null>(null)

  const [state, setState] = useState<PlayerState>({
    ready: false,
    playing: false,
    currentTime: 0,
    duration: 0,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    let localUrl: string | null = null
    let localAudio: HTMLAudioElement | null = null

    async function load() {
      try {
        const blob = await getRecordingBlob(id)
        if (!blob) {
          if (!cancelled) setState((s) => ({ ...s, error: 'Recording not found.' }))
          return
        }
        if (cancelled) return

        const url = URL.createObjectURL(blob)
        localUrl = url
        urlRef.current = url
        const audio = new Audio(url)
        audio.preload = 'metadata'
        localAudio = audio
        audioRef.current = audio

        audio.onerror = () => {
          const code = audio.error?.code
          const detail =
            code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
              ? `This audio format isn't supported (${blob.type || 'unknown type'}).`
              : audio.error?.message || 'Playback failed.'
          setState((s) => ({ ...s, playing: false, error: detail }))
        }
        audio.onplay = () => {
          setState((s) => ({ ...s, playing: true }))
          const tick = () => {
            setState((s) => ({ ...s, currentTime: audio.currentTime }))
            frameRef.current = requestAnimationFrame(tick)
          }
          frameRef.current = requestAnimationFrame(tick)
        }
        const stopTicking = () => {
          if (frameRef.current !== null) {
            cancelAnimationFrame(frameRef.current)
            frameRef.current = null
          }
        }
        audio.onpause = () => {
          stopTicking()
          setState((s) => ({ ...s, playing: false }))
        }
        audio.onended = () => {
          stopTicking()
          setState((s) => ({ ...s, playing: false, currentTime: 0 }))
        }
        audio.ondurationchange = () =>
          setState((s) => ({
            ...s,
            duration: Number.isFinite(audio.duration) ? audio.duration : 0,
          }))

        setState((s) => ({ ...s, ready: true }))
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Playback failed.' }))
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      localAudio?.pause()
      if (audioRef.current === localAudio) audioRef.current = null
      if (localUrl) {
        URL.revokeObjectURL(localUrl)
        if (urlRef.current === localUrl) urlRef.current = null
      }
      void contextRef.current?.close()
      contextRef.current = null
      analyserRef.current = null
    }
  }, [id])

  function ensureAnalyser() {
    const audio = audioRef.current
    if (!audio || analyserRef.current) return
    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return
    const context = new AudioContextCtor()
    const source = context.createMediaElementSource(audio)
    const analyser = context.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)
    analyser.connect(context.destination)
    contextRef.current = context
    analyserRef.current = analyser
  }

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (state.playing) {
      audio.pause()
      return
    }
    try {
      ensureAnalyser()
      await contextRef.current?.resume()
    } catch {
      // Waveform visualization is optional; never block playback on it.
    }
    try {
      await audio.play()
    } catch (err) {
      setState((s) => ({
        ...s,
        playing: false,
        error: err instanceof Error ? err.message : 'Playback failed.',
      }))
    }
  }, [state.playing])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setState((s) => ({ ...s, currentTime: time }))
  }, [])

  const getFrequencyData = useCallback((target: Uint8Array<ArrayBuffer>) => {
    const analyser = analyserRef.current
    if (!analyser) return false
    analyser.getByteFrequencyData(target)
    return true
  }, [])

  const frequencyBinCount = () => analyserRef.current?.frequencyBinCount ?? 128

  return {
    ...state,
    toggle,
    seek,
    getFrequencyData,
    frequencyBinCount,
  }
}
