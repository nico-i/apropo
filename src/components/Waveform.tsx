import { useEffect, useRef } from 'react'

export default function Waveform({
  playing,
  currentTime,
  getFrequencyData,
  getFrequencyDataAt,
  binCount,
}: {
  playing: boolean
  currentTime: number
  getFrequencyData: (target: Uint8Array<ArrayBuffer>) => boolean
  getFrequencyDataAt: (time: number, target: Uint8Array<ArrayBuffer>) => boolean
  binCount: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number>(0)
  const timeRef = useRef(currentTime)
  timeRef.current = currentTime

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = new Uint8Array(binCount)

    function syncSize(rect: DOMRect) {
      const dpr = window.devicePixelRatio || 1
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w
        canvas!.height = h
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const accent =
      getComputedStyle(canvas).getPropertyValue('color').trim() || '#6366f1'

    function draw() {
      const rect = canvas!.getBoundingClientRect()
      syncSize(rect)
      const width = rect.width
      const height = rect.height
      ctx!.clearRect(0, 0, width, height)

      const hasData = playing
        ? getFrequencyData(data)
        : getFrequencyDataAt(timeRef.current, data)
      const mid = height / 2

      const bars = 48
      const step = Math.floor(data.length / bars) || 1
      const gap = 2
      const barWidth = (width - gap * (bars - 1)) / bars
      const dashHeight = 2

      for (let i = 0; i < bars; i++) {
        let sum = 0
        for (let j = 0; j < step; j++) sum += data[i * step + j] ?? 0
        const value = hasData ? sum / step / 255 : 0

        const isFlat = value < 0.03
        const barHeight = isFlat ? dashHeight : value * height
        const x = i * (barWidth + gap)
        const y = mid - barHeight / 2
        ctx!.fillStyle = accent
        ctx!.globalAlpha = isFlat ? 0.25 : 0.35 + value * 0.65
        ctx!.beginPath()
        const r = Math.min(barWidth / 2, isFlat ? dashHeight / 2 : 3)
        roundRect(ctx!, x, y, barWidth, barHeight, r)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameRef.current)
    }
  }, [getFrequencyData, getFrequencyDataAt, binCount, playing])

  return <canvas ref={canvasRef} className="waveform" />
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
