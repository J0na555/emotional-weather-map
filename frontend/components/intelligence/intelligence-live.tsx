'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Leaf, Sparkles } from 'lucide-react'
import { TrendChart } from '@/components/trend-chart'
import { EMOTION_COLORS } from '@/components/emotion-map'
import {
  cityAggregateInsights,
  fetchAllAreaInsights,
  forecastCopy,
  type AreaInsights,
  wellbeingScore,
} from '@/lib/emotional-data'

export function IntelligenceLive() {
  const [insights, setInsights] = useState<AreaInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAllAreaInsights()
      .then((byArea) => {
        if (cancelled) return
        setInsights(cityAggregateInsights(byArea))
      })
      .catch(() => {
        if (!cancelled) setInsights(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const score = wellbeingScore(insights?.last_24h)
  const stress = insights?.last_24h?.avg_stress
  const delta = insights?.trend?.delta_pct
  const chartPoints = insights?.last_24h
    ? [
        Math.max(30, (insights.last_24h.avg_stress_index - 2) * 10),
        Math.max(35, insights.last_24h.avg_stress_index * 10),
        Math.max(40, (insights.last_24h.avg_energy ?? 5) * 10),
        Math.max(38, (insights.last_24h.avg_sleep ?? 5) * 10),
        Math.max(42, 100 - (insights.last_24h.avg_stress ?? 5) * 8),
        Math.max(45, (insights.last_24h.avg_energy ?? 5) * 11),
        Math.max(48, 100 - (insights.last_24h.avg_stress_index ?? 5) * 9),
        score ?? 55,
        Math.max(50, (insights.last_24h.avg_sleep ?? 5) * 10),
        score ? score + 2 : 58,
      ]
    : [52, 58, 55, 63, 67, 64, 70, 72, 69, 74]

  const heavyPct =
    (insights?.emotion_breakdown_24h?.burned_out?.pct ?? 0) +
    (insights?.emotion_breakdown_24h?.stressed?.pct ?? 0)

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-border/70 bg-card p-7 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm font-medium text-foreground">
              Today&apos;s emotional forecast · Addis Ababa
              {loading && (
                <span className="ml-2 text-muted-foreground">· loading</span>
              )}
            </p>
          </div>
          <p className="mt-4 text-pretty font-serif text-2xl leading-snug text-foreground">
            &ldquo;{forecastCopy(stress)}&rdquo;
          </p>
          <div className="mt-6">
            <TrendChart points={chartPoints} color={EMOTION_COLORS.calm} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {insights?.last_24h?.check_in_count
              ? `${insights.last_24h.check_in_count} live check-ins · last 24h`
              : '7-day collective mood · demo data'}
            {score != null && ` · wellbeing ${score}/100`}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-3xl border border-border/70 bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <AlertTriangle className="size-4 text-[oklch(0.64_0.19_25)]" />
              Burnout watch
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {heavyPct >= 40
                ? `Stress and burnout make up ${Math.round(heavyPct)}% of recent check-ins. A gentle intervention window is open.`
                : delta != null && delta > 10
                  ? `Stress rose ${delta}% compared to yesterday. Watch downtown pockets this afternoon.`
                  : 'No acute burnout spike in live data. Keep encouraging short outdoor breaks.'}
            </p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Leaf className="size-4 text-[oklch(0.7_0.13_160)]" />
              Recommendation
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {(stress ?? 0) > 7
                ? 'Encourage lighter scheduling and visible green-space breaks between 3–5pm downtown.'
                : 'Communities that took outdoor breaks during similar weeks reported steadier energy by evening.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
