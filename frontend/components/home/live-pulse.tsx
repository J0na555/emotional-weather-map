'use client'

import { useEffect, useState } from 'react'
import {
  cityAggregateInsights,
  fetchAllAreaInsights,
  forecastCopy,
  wellbeingScore,
} from '@/lib/emotional-data'

export function LivePulse() {
  const [label, setLabel] = useState('Calm & hopeful')
  const [score, setScore] = useState<number | null>(null)
  const [count, setCount] = useState<number | null>(null)
  const [delta, setDelta] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAllAreaInsights()
      .then((byArea) => {
        if (cancelled) return
        const city = cityAggregateInsights(byArea)
        if (!city?.last_24h?.check_in_count) return
        const wellbeing = wellbeingScore(city.last_24h)
        const stress = city.last_24h.avg_stress
        setScore(wellbeing)
        setCount(city.last_24h.check_in_count)
        setDelta(city.trend.delta_pct)
        if (stress != null) {
          const copy = forecastCopy(stress)
          setLabel(copy.split('—')[0].replace(/^Addis is /, '').trim() || 'Calm & hopeful')
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-border/70 bg-background/90 p-4 shadow-lg backdrop-blur sm:left-auto sm:right-6 sm:w-64">
      <p className="text-xs text-muted-foreground">Live emotional pulse</p>
      <p className="mt-1 font-serif text-2xl text-foreground capitalize">
        {label}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        City wellbeing score{' '}
        <span className="font-medium text-foreground">
          {score ?? 72} / 100
        </span>
        {count != null && ` · ${count} check-ins`}
        {delta != null && delta !== 0 && (
          <span>
            {' '}
            · stress {delta > 0 ? 'up' : 'down'} {Math.abs(delta)}%
          </span>
        )}
      </p>
    </div>
  )
}
