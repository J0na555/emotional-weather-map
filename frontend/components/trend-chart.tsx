import { useId } from 'react'
import { EMOTION_COLORS } from '@/components/emotion-map'

export function TrendChart({
  points,
  color = EMOTION_COLORS.calm,
  height = 120,
}: {
  points: number[]
  color?: string
  height?: number
}) {
  const reactId = useId()
  const gradientId = `trend-grad-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const w = 320
  const h = height
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const step = w / (points.length - 1)

  const coords = points.map((p, i) => {
    const x = i * step
    const y = h - 8 - ((p - min) / range) * (h - 24)
    return [x, y] as const
  })

  const line = coords
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const area = `${line} L ${w} ${h} L 0 ${h} Z`

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === coords.length - 1 ? 4 : 0} fill={color} />
      ))}
    </svg>
  )
}
