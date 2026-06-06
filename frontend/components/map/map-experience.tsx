'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Battery, Flame, Moon, Sparkles, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EMOTION_COLORS } from '@/components/emotion-map'
import { AddisMap, type District } from '@/components/map/addis-map'
import {
  cityAggregateInsights,
  fetchAllAreaInsights,
  layerScore,
  layerSummary,
  PLACE_TO_AREA,
  wellbeingScore,
  type AreaInsights,
  type LayerKey,
} from '@/lib/emotional-data'

const LAYERS: {
  key: LayerKey
  label: string
  icon: React.ElementType
  desc: string
}[] = [
  { key: 'mood', label: 'Mood', icon: Sparkles, desc: 'Overall emotional tone' },
  { key: 'stress', label: 'Stress', icon: Flame, desc: 'Tension & pressure' },
  { key: 'energy', label: 'Energy', icon: Battery, desc: 'Collective vitality' },
  { key: 'burnout', label: 'Burnout', icon: Activity, desc: 'Sustained depletion' },
  { key: 'sleep', label: 'Sleep', icon: Moon, desc: 'Rest & recovery' },
]

const PLACES: { id: string; name: string; lat: number; lng: number }[] = [
  { id: 'bole', name: 'Bole', lat: 8.9806, lng: 38.7992 },
  { id: 'merkato', name: 'Merkato', lat: 9.0339, lng: 38.7406 },
  { id: 'piassa', name: 'Piassa', lat: 9.0357, lng: 38.7503 },
  { id: 'kazanchis', name: 'Kazanchis', lat: 9.0157, lng: 38.766 },
  { id: 'megenagna', name: 'Megenagna', lat: 9.0202, lng: 38.8 },
  { id: 'cmc', name: 'CMC', lat: 9.0227, lng: 38.835 },
  { id: 'mexico', name: 'Mexico', lat: 9.0084, lng: 38.748 },
  { id: 'saris', name: 'Saris', lat: 8.962, lng: 38.762 },
  { id: 'gullele', name: 'Gullele', lat: 9.062, lng: 38.742 },
]

const FALLBACK_SCORES: Record<LayerKey, Record<string, number>> = {
  mood: { bole: 78, merkato: 41, piassa: 71, kazanchis: 82, megenagna: 66, cmc: 74, mexico: 64, saris: 58, gullele: 52 },
  stress: { bole: 28, merkato: 81, piassa: 58, kazanchis: 44, megenagna: 62, cmc: 35, mexico: 73, saris: 66, gullele: 70 },
  energy: { bole: 79, merkato: 38, piassa: 84, kazanchis: 62, megenagna: 71, cmc: 68, mexico: 55, saris: 49, gullele: 44 },
  burnout: { bole: 22, merkato: 70, piassa: 51, kazanchis: 68, megenagna: 47, cmc: 33, mexico: 43, saris: 59, gullele: 64 },
  sleep: { bole: 74, merkato: 39, piassa: 57, kazanchis: 69, megenagna: 60, cmc: 71, mexico: 60, saris: 48, gullele: 51 },
}

const LAYER_KIND: Record<LayerKey, 'pos' | 'neg'> = {
  mood: 'pos',
  stress: 'neg',
  energy: 'pos',
  burnout: 'neg',
  sleep: 'pos',
}

function state(score: number, kind: 'pos' | 'neg') {
  const good = kind === 'pos' ? score : 100 - score
  if (good >= 75) return { state: kind === 'pos' ? 'Thriving' : 'Easy', color: EMOTION_COLORS.energy }
  if (good >= 60) return { state: 'Calm', color: EMOTION_COLORS.calm }
  if (good >= 48) return { state: 'Steady', color: EMOTION_COLORS.warm }
  if (good >= 36) return { state: 'Watch', color: EMOTION_COLORS.amber }
  return { state: 'Tense', color: EMOTION_COLORS.stress }
}

function buildDistricts(
  layer: LayerKey,
  byArea: Partial<Record<string, AreaInsights>>,
  cityInsights: AreaInsights | null,
  live: boolean,
): District[] {
  const kind = LAYER_KIND[layer]
  return PLACES.map((p) => {
    const areaKey = PLACE_TO_AREA[p.id]
    const insights = areaKey ? byArea[areaKey] : cityInsights
    const liveScore = insights
      ? layerScore(layer, insights.last_24h, insights.emotion_breakdown_24h)
      : null
    const score =
      live && liveScore != null ? liveScore : FALLBACK_SCORES[layer][p.id]
    const s = state(score, kind)
    return {
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      score,
      state: s.state,
      color: s.color,
    }
  })
}

export function MapExperience() {
  const [layer, setLayer] = useState<LayerKey>('mood')
  const [byArea, setByArea] = useState<Partial<Record<string, AreaInsights>>>({})
  const [cityInsights, setCityInsights] = useState<AreaInsights | null>(null)
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchAllAreaInsights()
      .then((data) => {
        if (cancelled) return
        const hasData = Object.keys(data).length > 0
        setByArea(data)
        setCityInsights(cityAggregateInsights(data))
        setLive(hasData)
      })
      .catch(() => {
        if (!cancelled) setLive(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const active = LAYERS.find((l) => l.key === layer)!
  const districts = useMemo(
    () => buildDistricts(layer, byArea, cityInsights, live),
    [layer, byArea, cityInsights, live],
  )
  const summary = useMemo(() => {
    if (live && cityInsights) return layerSummary(layer, cityInsights)
    const fallback: Record<LayerKey, string> = {
      mood: 'The city leans calm and hopeful today. Bole and Kazanchis feel notably brighter, while Merkato carries a heavier tone.',
      stress: 'Stress is concentrated in the dense western core. Mexico and Merkato are running hot.',
      energy: 'Energy is high across the north and east. Piassa and Bole are vibrant.',
      burnout: 'Two early-warning zones detected. Kazanchis and Merkato show sustained depletion.',
      sleep: 'Rest is healthiest in residential Bole and CMC. Central districts report shorter, lighter sleep.',
    }
    return fallback[layer]
  }, [layer, live, cityInsights])

  const wellbeing = wellbeingScore(cityInsights?.last_24h) ?? 72
  const delta = cityInsights?.trend?.delta_pct
  const checkInCount = cityInsights?.last_24h?.check_in_count

  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-2">
          <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Emotion layers
            {loading && <span className="ml-1 normal-case">· loading</span>}
          </p>
          {LAYERS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLayer(l.key)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors',
                layer === l.key
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border/70 bg-card hover:bg-secondary/60',
              )}
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl',
                  layer === l.key ? 'bg-primary/15' : 'bg-secondary',
                )}
              >
                <l.icon
                  className={cn(
                    'size-4',
                    layer === l.key ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {l.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {l.desc}
                </span>
              </span>
            </button>
          ))}

          <div className="mt-3 rounded-2xl border border-border/70 bg-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Legend
            </p>
            <div className="mt-3 flex flex-col gap-2 text-xs text-foreground">
              {[
                ['Thriving', EMOTION_COLORS.energy],
                ['Calm', EMOTION_COLORS.calm],
                ['Steady', EMOTION_COLORS.warm],
                ['Watch', EMOTION_COLORS.amber],
                ['Tense', EMOTION_COLORS.stress],
              ].map(([label, color]) => (
                <span key={label} className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ background: color }}
                  />
                  {label}
                </span>
              ))}
            </div>
            {live && (
              <p className="mt-3 text-xs text-muted-foreground">
                Live data for Bole, Kazanchis &amp; Lideta. Other districts use city average.
              </p>
            )}
          </div>
        </aside>

        <div className="flex flex-col gap-5">
          <AddisMap
            districts={districts}
            summary={summary}
            layerLabel={active.label}
          />

          <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-border/70 bg-card p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Live regional summary · {active.label}
                </p>
              </div>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {summary}
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Wind className="size-3.5" />
                {live && checkInCount
                  ? `${checkInCount} check-ins · last 24h`
                  : 'Demo data · connect Supabase for live insights'}
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6">
              <p className="text-sm font-medium text-foreground">
                City wellbeing score
              </p>
              <p className="mt-2 font-serif text-5xl text-foreground">
                {wellbeing}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                out of 100
                {delta != null && delta !== 0 && (
                  <>
                    {' '}
                    · stress {delta > 0 ? 'up' : 'down'} {Math.abs(delta)}%
                    vs yesterday
                  </>
                )}
              </p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${wellbeing}%`,
                    background: `linear-gradient(90deg, ${EMOTION_COLORS.calm}, ${EMOTION_COLORS.energy})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
