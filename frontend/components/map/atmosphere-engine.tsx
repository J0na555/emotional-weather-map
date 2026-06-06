'use client'

import { useEffect, useRef } from 'react'

export type AtmosphereZone = {
  /** 0–100 position */
  x: number
  y: number
  /** radius in % of width */
  r: number
  /** any CSS color (oklch supported) */
  color: string
}

export type Weather = {
  /** base drift speed multiplier */
  speed: number
  /** how chaotic the flow field is */
  turbulence: number
  /** wind direction in radians (bias applied to the flow) */
  windAngle: number
  /** density of cloud/particle field, 0–1 */
  density: number
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  r: number
  g: number
  b: number
}

// Parse an oklch(L C H) string into an approximate sRGB triplet so we can
// blend particle colors smoothly on the canvas.
function oklchToRgb(input: string): [number, number, number] {
  const m = input.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/i)
  if (!m) return [120, 160, 200]
  const L = parseFloat(m[1])
  const C = parseFloat(m[2])
  const Hdeg = parseFloat(m[3])
  const h = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ * l_ * l_
  const mm = m_ * m_ * m_
  const s = s_ * s_ * s_

  let R = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s
  let G = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s
  let B = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s

  const toSrgb = (c: number) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
    return Math.max(0, Math.min(255, Math.round(v * 255)))
  }
  return [toSrgb(R), toSrgb(G), toSrgb(B)]
}

export function AtmosphereEngine({
  zones,
  weather,
  className,
}: {
  zones: AtmosphereZone[]
  weather: Weather
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // refs let the animation loop read latest values without restarting
  const zonesRef = useRef(zones)
  const weatherRef = useRef(weather)
  const rgbZonesRef = useRef<(AtmosphereZone & { rgb: [number, number, number] })[]>([])

  useEffect(() => {
    zonesRef.current = zones
    rgbZonesRef.current = zones.map((z) => ({ ...z, rgb: oklchToRgb(z.color) }))
  }, [zones])
  useEffect(() => {
    weatherRef.current = weather
  }, [weather])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = 1
    const parent = canvas.parentElement!

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    // Flow field driven by layered sine noise — cheap, smooth, organic.
    let t = 0
    const flowAngle = (px: number, py: number, time: number, turbulence: number) => {
      const nx = px / width
      const ny = py / height
      const scale = 2.6 * turbulence
      return (
        Math.sin(nx * scale + time) * 1.3 +
        Math.cos(ny * scale - time * 0.8) * 1.3 +
        Math.sin((nx + ny) * scale * 0.7 + time * 0.5) * 0.9
      )
    }

    // color of the field at a point = weighted blend of nearby zones
    const colorAt = (px: number, py: number): [number, number, number, number] => {
      const zs = rgbZonesRef.current
      let r = 0
      let g = 0
      let b = 0
      let wsum = 0
      let strength = 0
      for (const z of zs) {
        const zx = (z.x / 100) * width
        const zy = (z.y / 100) * height
        const rad = (z.r / 100) * width * 1.5
        const dx = px - zx
        const dy = py - zy
        const d2 = dx * dx + dy * dy
        const w = Math.exp(-d2 / (2 * rad * rad))
        r += z.rgb[0] * w
        g += z.rgb[1] * w
        b += z.rgb[2] * w
        wsum += w
        strength = Math.max(strength, w)
      }
      if (wsum === 0) return [120, 160, 200, 0]
      return [r / wsum, g / wsum, b / wsum, strength]
    }

    const spawn = (p: Particle) => {
      p.x = Math.random() * width
      p.y = Math.random() * height
      p.maxLife = 80 + Math.random() * 160
      p.life = Math.random() * p.maxLife
      p.size = 0.6 + Math.random() * 2.4
      const c = colorAt(p.x, p.y)
      p.r = c[0]
      p.g = c[1]
      p.b = c[2]
      p.vx = 0
      p.vy = 0
    }

    let particles: Particle[] = []
    const rebuildParticles = () => {
      const density = weatherRef.current.density
      const area = width * height
      const count = prefersReduced
        ? 0
        : Math.min(900, Math.floor((area / 6000) * (0.5 + density)))
      particles = Array.from({ length: count }, () => {
        const p: Particle = {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          life: 0,
          maxLife: 0,
          size: 1,
          r: 120,
          g: 160,
          b: 200,
        }
        spawn(p)
        return p
      })
    }
    rebuildParticles()
    const roCount = setInterval(rebuildParticles, 1200)

    let raf = 0
    const render = () => {
      const w = weatherRef.current
      t += 0.0016 * (0.4 + w.speed)

      // trail fade — leaves soft flowing streaks
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(252, 251, 247, 0.085)'
      ctx.fillRect(0, 0, width, height)

      ctx.globalCompositeOperation = 'lighter'

      const speed = 0.5 + w.speed * 1.6
      const wind = w.windAngle
      const windForce = 0.18 * w.speed

      for (const p of particles) {
        const a = flowAngle(p.x, p.y, t, w.turbulence)
        p.vx += Math.cos(a) * 0.12 + Math.cos(wind) * windForce
        p.vy += Math.sin(a) * 0.12 + Math.sin(wind) * windForce
        p.vx *= 0.92
        p.vy *= 0.92
        p.x += p.vx * speed
        p.y += p.vy * speed
        p.life += 1

        if (
          p.life > p.maxLife ||
          p.x < -20 ||
          p.x > width + 20 ||
          p.y < -20 ||
          p.y > height + 20
        ) {
          spawn(p)
          continue
        }

        const fade = Math.sin((p.life / p.maxLife) * Math.PI)
        const alpha = 0.14 * fade
        ctx.fillStyle = `rgba(${p.r | 0}, ${p.g | 0}, ${p.b | 0}, ${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(render)
    }

    if (prefersReduced) {
      // Static painterly snapshot for reduced-motion users.
      ctx.fillStyle = 'rgb(252, 251, 247)'
      ctx.fillRect(0, 0, width, height)
    } else {
      raf = requestAnimationFrame(render)
    }

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(roCount)
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
