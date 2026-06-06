'use client'

import { useState } from 'react'
import {
  Building2,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Sprout,
  Stethoscope,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TrendChart } from '@/components/trend-chart'
import { EMOTION_COLORS } from '@/components/emotion-map'

const SECTORS = [
  {
    key: 'universities',
    icon: GraduationCap,
    label: 'Universities',
    headline: 'See student wellbeing before exam season breaks it',
    body: 'Map emotional climate across campuses, halls, and faculties. Spot stress spikes around deadlines and direct support where it lands hardest.',
    metrics: [
      ['Campus wellbeing', '74'],
      ['Exam-week stress', '−18%'],
      ['Support reach', '3.2×'],
    ],
    color: EMOTION_COLORS.calm,
    trend: [60, 58, 55, 50, 48, 53, 61, 66, 70, 74],
  },
  {
    key: 'companies',
    icon: Building2,
    label: 'Companies & HR',
    headline: 'Catch team burnout before it costs you people',
    body: 'Give HR leaders an ethical, aggregate view of team energy and burnout risk — with early-warnings that open a window to act.',
    metrics: [
      ['Team energy', '68'],
      ['Burnout alerts', '2 zones'],
      ['Attrition risk', '−24%'],
    ],
    color: EMOTION_COLORS.energy,
    trend: [70, 66, 64, 60, 55, 52, 50, 54, 58, 62],
  },
  {
    key: 'ngos',
    icon: HeartHandshake,
    label: 'NGOs',
    headline: 'Send support exactly where it is needed most',
    body: 'Target limited resources with precision. Emotional heatmaps reveal which communities are straining and where care will do the most good.',
    metrics: [
      ['Communities mapped', '46'],
      ['Targeting accuracy', '+31%'],
      ['Response time', '−2 days'],
    ],
    color: EMOTION_COLORS.warm,
    trend: [40, 44, 50, 48, 52, 58, 63, 67, 70, 73],
  },
  {
    key: 'cities',
    icon: Landmark,
    label: 'Cities',
    headline: 'A resilience layer for the whole city',
    body: 'Understand the emotional climate block by block. Plan public space, services, and interventions around how citizens actually feel.',
    metrics: [
      ['Districts live', '12'],
      ['City wellbeing', '72'],
      ['Early warnings', 'Real-time'],
    ],
    color: EMOTION_COLORS.amber,
    trend: [55, 57, 60, 62, 65, 64, 68, 70, 71, 72],
  },
  {
    key: 'wellness',
    icon: Stethoscope,
    label: 'Wellness',
    headline: 'Measure outcomes, not just attendance',
    body: 'Wellness institutions can finally show real, population-level emotional change over time — with privacy fully intact.',
    metrics: [
      ['Outcome lift', '+22%'],
      ['Programs tracked', '38'],
      ['Privacy', '100%'],
    ],
    color: EMOTION_COLORS.calm,
    trend: [48, 50, 53, 57, 60, 63, 66, 68, 71, 73],
  },
  {
    key: 'agriculture',
    icon: Sprout,
    label: 'Agriculture',
    headline: 'Sense seasonal stress across cooperatives',
    body: 'Help agricultural communities and cooperatives understand the emotional weight of harvest cycles, drought, and market swings.',
    metrics: [
      ['Cooperatives', '24'],
      ['Seasonal stress', 'Tracked'],
      ['Support windows', '+4'],
    ],
    color: EMOTION_COLORS.energy,
    trend: [62, 60, 56, 52, 49, 47, 50, 55, 60, 64],
  },
]

export function SolutionsExplorer() {
  const [active, setActive] = useState(SECTORS[0].key)
  const sector = SECTORS.find((s) => s.key === active)!

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="flex flex-wrap gap-2">
        {SECTORS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors',
              active === s.key
                ? 'border-primary/40 bg-primary/10 text-foreground'
                : 'border-border/70 bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            <s.icon className="size-4" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-border/70 bg-card p-8 sm:p-10">
          <span
            className="flex size-12 items-center justify-center rounded-2xl"
            style={{
              background: `color-mix(in oklab, ${sector.color} 18%, white)`,
            }}
          >
            <sector.icon className="size-6" style={{ color: sector.color }} />
          </span>
          <h3 className="mt-6 text-balance font-serif text-3xl leading-snug text-foreground">
            {sector.headline}
          </h3>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            {sector.body}
          </p>
          <ul className="mt-7 grid grid-cols-3 gap-3">
            {sector.metrics.map(([label, value]) => (
              <li
                key={label}
                className="rounded-2xl border border-border/70 bg-secondary/40 p-4"
              >
                <p className="font-serif text-2xl text-foreground">{value}</p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {label}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-3xl border border-border/70 bg-card p-7">
            <p className="text-sm font-medium text-foreground">
              90-day wellbeing trend
            </p>
            <div className="mt-5">
              <TrendChart points={sector.trend} color={sector.color} height={140} />
            </div>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card p-7">
            <p className="text-sm font-medium text-foreground">
              What you get
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
              {[
                'Aggregate heatmaps & dashboards',
                'Burnout forecasting & early warnings',
                'Exportable reports & trend analytics',
                'Privacy-first, anonymous by design',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: sector.color }}
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
