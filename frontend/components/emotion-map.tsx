'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { AtmosphereEngine, type Weather } from '@/components/map/atmosphere-engine'

type Zone = {
  x: number
  y: number
  r: number
  color: string
  label?: string
  value?: string
}

const DEFAULT_WEATHER: Weather = {
  speed: 0.6,
  turbulence: 1,
  windAngle: 0.4,
  density: 0.6,
}

const EMOTION_COLORS = {
  calm: 'oklch(0.62 0.14 200)',
  energy: 'oklch(0.7 0.14 160)',
  warm: 'oklch(0.82 0.14 90)',
  amber: 'oklch(0.74 0.16 50)',
  stress: 'oklch(0.64 0.19 25)',
} as const

const DEFAULT_ZONES: Zone[] = [
  { x: 28, y: 32, r: 22, color: EMOTION_COLORS.calm, label: 'Bole', value: 'Calm · 78' },
  { x: 62, y: 26, r: 18, color: EMOTION_COLORS.warm, label: 'Piassa', value: 'Hopeful · 71' },
  { x: 74, y: 58, r: 20, color: EMOTION_COLORS.energy, label: 'Kazanchis', value: 'Energized · 82' },
  { x: 40, y: 64, r: 24, color: EMOTION_COLORS.amber, label: 'Mexico', value: 'Steady · 64' },
  { x: 18, y: 70, r: 16, color: EMOTION_COLORS.stress, label: 'Merkato', value: 'Tense · 41' },
  { x: 55, y: 48, r: 14, color: EMOTION_COLORS.calm, label: 'Sarbet', value: 'Calm · 69' },
]

export function EmotionMap({
  zones = DEFAULT_ZONES,
  className,
  showLabels = true,
  weather = DEFAULT_WEATHER,
}: {
  zones?: Zone[]
  className?: string
  showLabels?: boolean
  weather?: Weather
}) {
  const grid = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ((i + 1) / 9) * 100),
    [],
  )

  return (
    <div
      className={cn(
        'relative aspect-[16/11] w-full overflow-hidden rounded-3xl border border-border/70 bg-card',
        className,
      )}
    >
      {/* living atmosphere — flow-field particle currents */}
      <AtmosphereEngine
        zones={zones}
        weather={weather}
        className="absolute inset-0 size-full"
      />

      {/* subtle terrain grid */}
      <svg className="absolute inset-0 size-full" aria-hidden="true">
        {grid.map((p) => (
          <line
            key={`v${p}`}
            x1={`${p}%`}
            y1="0"
            x2={`${p}%`}
            y2="100%"
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />
        ))}
        {grid.map((p) => (
          <line
            key={`h${p}`}
            x1="0"
            y1={`${p}%`}
            x2="100%"
            y2={`${p}%`}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* emotional heat blobs */}
      {zones.map((z, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-breathe mix-blend-multiply"
          style={{
            left: `${z.x}%`,
            top: `${z.y}%`,
            width: `${z.r * 2}%`,
            height: `${z.r * 2}%`,
            background: z.color,
            opacity: 0.42,
            animationDelay: `${i * 0.6}s`,
          }}
        />
      ))}

      {/* labels */}
      {showLabels &&
        zones.map((z, i) => (
          <div
            key={`l${i}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${z.x}%`, top: `${z.y}%` }}
          >
            <div className="flex flex-col items-center gap-1.5">
              <span
                className="size-2.5 rounded-full ring-4 ring-background/60"
                style={{ background: z.color }}
              />
              <div className="hidden whitespace-nowrap rounded-full border border-border/70 bg-background/85 px-2.5 py-1 text-[11px] font-medium shadow-sm backdrop-blur sm:block">
                <span className="text-foreground">{z.label}</span>
                <span className="ml-1.5 text-muted-foreground">{z.value}</span>
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}

export { EMOTION_COLORS }
