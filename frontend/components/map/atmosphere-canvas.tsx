'use client'

import { useEffect, useRef } from 'react'

export type AtmosphereStop = {
  /** 0-100 horizontal position */
  x: number
  /** 0-100 vertical position */
  y: number
  /** influence radius 0-100 */
  r: number
  /** intensity 0-1, drives density + speed */
  intensity: number
  /** rgb string e.g. "120 180 255" */
  rgb: string
}

type Particle = {
  x: number
  y: number
  life: number
  maxLife: number
  speed: number
}

/**
 * A living emotional atmosphere rendered on canvas.
 * - Soft cloud formations bloom around each emotional zone.
 * - A flow field drives drifting particle "currents" whose color and
 *   density reflect the dominant emotion at each point.
 */
export function AtmosphereCanvas({
  stops,
  baseRgb = '210 225 235',
  motion = 1,
  className,
}: {
  stops: AtmosphereStop[]
  baseRgb?: string
  /** global motion multiplier; lower = calmer */
  motion?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stopsRef = useRef(stops)
  const motionRef = useRef(motion)
  const baseRef = useRef(baseRgb)

  // keep latest props without restarting the animation loop
  useEffect(() => {
    stopsRef.current = stops
    motionRef.current = motion
    baseRef.current = baseRgb
  }, [stops, motion, baseRgb])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    const particles: Particle[] = []
    const PARTICLE_COUNT = 90
    let t = 0

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    function resize() {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function spawn(p: Particle) {
      p.x = Math.random() * w
      p.y = Math.random() * h
      p.maxLife = 120 + Math.random() * 160
      p.life = Math.random() * p.maxLife
      p.speed = 0.4 + Math.random() * 0.9
    }
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p: Particle = { x: 0, y: 0, life: 0, maxLife: 0, speed: 0 }
      spawn(p)
      particles.push(p)
    }

    // sample dominant emotion influence at a point -> {r,g,b,weight,vx,vy}
    function sample(px: number, py: number) {
      const stops = stopsRef.current
      let rr = 0
      let gg = 0
      let bb = 0
      let wsum = 0
      let vx = 0
      let vy = 0
      const nx = (px / w) * 100
      const ny = (py / h) * 100
      for (const s of stops) {
        const dx = nx - s.x
        const dy = ny - s.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const reach = s.r
        if (dist > reach) continue
        const falloff = Math.pow(1 - dist / reach, 2)
        const weight = falloff * (0.3 + s.intensity)
        const [r, g, b] = s.rgb.split(' ').map(Number)
        rr += r * weight
        gg += g * weight
        bb += b * weight
        wsum += weight
        // swirl current around each zone center
        vx += (-dy / (dist + 6)) * weight * (0.5 + s.intensity)
        vy += (dx / (dist + 6)) * weight * (0.5 + s.intensity)
      }
      if (wsum === 0) return null
      return {
        r: rr / wsum,
        g: gg / wsum,
        b: bb / wsum,
        weight: Math.min(wsum, 1.2),
        vx,
        vy,
      }
    }

    function draw() {
      t += 1
      const stops = stopsRef.current
      const m = reduceMotion ? 0 : motionRef.current

      // fade previous frame for trailing currents
      ctx!.globalCompositeOperation = 'source-over'
      ctx!.fillStyle = 'rgba(255,255,255,0.06)'
      ctx!.clearRect(0, 0, w, h)

      // 1) soft emotional cloud formations
      ctx!.globalCompositeOperation = 'multiply'
      for (let i = 0; i < stops.length; i++) {
        const s = stops[i]
        const cx = (s.x / 100) * w
        const cy = (s.y / 100) * h
        // breathing drift
        const drift = Math.sin(t * 0.01 + i) * 8 * m
        const driftY = Math.cos(t * 0.008 + i * 1.3) * 6 * m
        const radius = (s.r / 100) * Math.min(w, h) * (1.1 + 0.12 * Math.sin(t * 0.012 + i))
        const grad = ctx!.createRadialGradient(
          cx + drift,
          cy + driftY,
          0,
          cx + drift,
          cy + driftY,
          radius,
        )
        const a = 0.16 + s.intensity * 0.32
        grad.addColorStop(0, `rgba(${s.rgb.split(' ').join(',')},${a})`)
        grad.addColorStop(0.55, `rgba(${s.rgb.split(' ').join(',')},${a * 0.4})`)
        grad.addColorStop(1, `rgba(${s.rgb.split(' ').join(',')},0)`)
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.arc(cx + drift, cy + driftY, radius, 0, Math.PI * 2)
        ctx!.fill()
      }

      // 2) flowing emotional currents (particles)
      ctx!.globalCompositeOperation = 'source-over'
      for (const p of particles) {
        const s = sample(p.x, p.y)
        p.life += 1
        if (p.life > p.maxLife || !s) {
          if (Math.random() < 0.04 || !s) spawn(p)
        }
        if (s) {
          const angle = Math.atan2(s.vy, s.vx)
          const flow = m * p.speed
          const px = p.x
          const py = p.y
          p.x += Math.cos(angle) * flow + Math.sin(t * 0.02 + py * 0.01) * 0.2 * m
          p.y += Math.sin(angle) * flow + Math.cos(t * 0.02 + px * 0.01) * 0.2 * m
          const alpha = Math.min(0.5, s.weight * 0.5) *
            (1 - Math.abs(p.life / p.maxLife - 0.5) * 2)
          ctx!.strokeStyle = `rgba(${Math.round(s.r)},${Math.round(s.g)},${Math.round(s.b)},${alpha})`
          ctx!.lineWidth = 1.1
          ctx!.beginPath()
          ctx!.moveTo(px, py)
          ctx!.lineTo(p.x, p.y)
          ctx!.stroke()
        }
        if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) spawn(p)
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  )
}
