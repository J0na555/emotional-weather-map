'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Battery, Flame, Moon, Sparkles, Wind } from 'lucide-react'
import { cn } from '@/lib/utils'
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
  { id: 'lideta', name: 'Lideta', lat: 9.0120, lng: 38.7480 },
  { id: 'arada', name: 'Arada', lat: 9.0333, lng: 38.7500 },
  { id: 'kirkos', name: 'Kirkos', lat: 9.0100, lng: 38.7680 },
  { id: 'yeka', name: 'Yeka', lat: 9.0280, lng: 38.8120 },
  { id: 'nifas_silk_lafto', name: 'Nifas Silk–Lafto', lat: 8.9700, lng: 38.7300 },
  { id: 'kolfe_keranio', name: 'Kolfe Keranio', lat: 9.0150, lng: 38.7000 },
  { id: 'gullele', name: 'Gullele', lat: 9.062, lng: 38.742 },
  { id: 'merkato', name: 'Merkato', lat: 9.0339, lng: 38.7406 },
  { id: 'piassa', name: 'Piassa', lat: 9.0357, lng: 38.7503 },
  { id: 'kazanchis', name: 'Kazanchis', lat: 9.0157, lng: 38.766 },
  { id: 'megenagna', name: 'Megenagna', lat: 9.0202, lng: 38.8 },
  { id: 'cmc', name: 'CMC', lat: 9.0227, lng: 38.835 },
  { id: 'mexico', name: 'Mexico', lat: 9.0084, lng: 38.748 },
  { id: 'saris', name: 'Saris', lat: 8.962, lng: 38.762 },
]

const FALLBACK_SCORES: Record<LayerKey, Record<string, number>> = {
  mood: {
    bole: 78, lideta: 64, arada: 71, kirkos: 82, yeka: 66, nifas_silk_lafto: 58, kolfe_keranio: 52, gullele: 52,
    merkato: 41, piassa: 71, kazanchis: 82, megenagna: 66, cmc: 74, mexico: 64, saris: 58
  },
  stress: {
    bole: 28, lideta: 73, arada: 58, kirkos: 44, yeka: 62, nifas_silk_lafto: 66, kolfe_keranio: 70, gullele: 70,
    merkato: 81, piassa: 58, kazanchis: 44, megenagna: 62, cmc: 35, mexico: 73, saris: 66
  },
  energy: {
    bole: 79, lideta: 55, arada: 84, kirkos: 62, yeka: 71, nifas_silk_lafto: 49, kolfe_keranio: 44, gullele: 44,
    merkato: 38, piassa: 84, kazanchis: 62, megenagna: 71, cmc: 68, mexico: 55, saris: 49
  },
  burnout: {
    bole: 22, lideta: 43, arada: 51, kirkos: 68, yeka: 47, nifas_silk_lafto: 59, kolfe_keranio: 64, gullele: 64,
    merkato: 70, piassa: 51, kazanchis: 68, megenagna: 47, cmc: 33, mexico: 43, saris: 59
  },
  sleep: {
    bole: 74, lideta: 60, arada: 57, kirkos: 69, yeka: 60, nifas_silk_lafto: 48, kolfe_keranio: 51, gullele: 51,
    merkato: 39, piassa: 57, kazanchis: 69, megenagna: 60, cmc: 71, mexico: 60, saris: 48
  },
}

const LAYER_KIND: Record<LayerKey, 'pos' | 'neg'> = {
  mood: 'pos',
  stress: 'neg',
  energy: 'pos',
  burnout: 'neg',
  sleep: 'pos',
}

const LAYER_COLORS: Record<
  LayerKey,
  {
    base: string
    bg: string
    border: string
    iconBg: string
    text: string
    shades: Record<string, string>
  }
> = {
  mood: {
    base: 'oklch(0.70 0.06 140)', // muted sage green
    bg: 'oklch(0.70 0.06 140 / 8%)',
    border: 'oklch(0.70 0.06 140 / 40%)',
    iconBg: 'oklch(0.70 0.06 140 / 15%)',
    text: 'oklch(0.50 0.05 140)',
    shades: {
      Thriving: 'oklch(0.62 0.07 140)',
      Calm: 'oklch(0.70 0.06 140)',
      Steady: 'oklch(0.78 0.05 140)',
      Watch: 'oklch(0.85 0.04 140)',
      Tense: 'oklch(0.92 0.03 140)',
    }
  },
  stress: {
    base: 'oklch(0.68 0.12 30)', // soft terracotta
    bg: 'oklch(0.68 0.12 30 / 8%)',
    border: 'oklch(0.68 0.12 30 / 40%)',
    iconBg: 'oklch(0.68 0.12 30 / 15%)',
    text: 'oklch(0.53 0.11 30)',
    shades: {
      Thriving: 'oklch(0.90 0.05 30)',
      Calm: 'oklch(0.83 0.07 30)',
      Steady: 'oklch(0.75 0.09 30)',
      Watch: 'oklch(0.68 0.12 30)',
      Tense: 'oklch(0.58 0.13 30)',
    }
  },
  energy: {
    base: 'oklch(0.78 0.11 85)', // warm mustard
    bg: 'oklch(0.78 0.11 85 / 8%)',
    border: 'oklch(0.78 0.11 85 / 40%)',
    iconBg: 'oklch(0.78 0.11 85 / 15%)',
    text: 'oklch(0.58 0.09 85)',
    shades: {
      Thriving: 'oklch(0.68 0.12 85)',
      Calm: 'oklch(0.75 0.11 85)',
      Steady: 'oklch(0.82 0.10 85)',
      Watch: 'oklch(0.88 0.08 85)',
      Tense: 'oklch(0.93 0.05 85)',
    }
  },
  burnout: {
    base: 'oklch(0.60 0.09 340)', // muted plum
    bg: 'oklch(0.60 0.09 340 / 8%)',
    border: 'oklch(0.60 0.09 340 / 40%)',
    iconBg: 'oklch(0.60 0.09 340 / 15%)',
    text: 'oklch(0.48 0.08 340)',
    shades: {
      Thriving: 'oklch(0.88 0.04 340)',
      Calm: 'oklch(0.80 0.06 340)',
      Steady: 'oklch(0.72 0.07 340)',
      Watch: 'oklch(0.64 0.09 340)',
      Tense: 'oklch(0.54 0.10 340)',
    }
  },
  sleep: {
    base: 'oklch(0.68 0.08 230)', // dusty blue
    bg: 'oklch(0.68 0.08 230 / 8%)',
    border: 'oklch(0.68 0.08 230 / 40%)',
    iconBg: 'oklch(0.68 0.08 230 / 15%)',
    text: 'oklch(0.52 0.07 230)',
    shades: {
      Thriving: 'oklch(0.56 0.09 230)',
      Calm: 'oklch(0.66 0.08 230)',
      Steady: 'oklch(0.75 0.06 230)',
      Watch: 'oklch(0.83 0.05 230)',
      Tense: 'oklch(0.90 0.03 230)',
    }
  }
}

function state(score: number, kind: 'pos' | 'neg') {
  const good = kind === 'pos' ? score : 100 - score
  if (good >= 75) return { state: kind === 'pos' ? 'Thriving' : 'Easy' }
  if (good >= 60) return { state: 'Calm' }
  if (good >= 48) return { state: 'Steady' }
  if (good >= 36) return { state: 'Watch' }
  return { state: 'Tense' }
}

function buildDistricts(
  layer: LayerKey,
  byArea: Partial<Record<string, AreaInsights>>,
  cityInsights: AreaInsights | null,
  live: boolean,
  userCheckIn?: {
    location: string
    emotion: string
    stress: number
    energy: number
    sleep: number
  } | null,
): District[] {
  const kind = LAYER_KIND[layer]
  return PLACES.map((p) => {
    const areaKey = PLACE_TO_AREA[p.id]
    const insights = areaKey ? byArea[areaKey] : cityInsights
    const liveScore = insights
      ? layerScore(layer, insights.last_24h, insights.emotion_breakdown_24h)
      : null
    
    let score = live && liveScore != null ? liveScore : FALLBACK_SCORES[layer][p.id]
    let isUserCheckIn = false
    
    if (
      userCheckIn &&
      userCheckIn.location &&
      (userCheckIn.location.toLowerCase() === p.name.toLowerCase() ||
       userCheckIn.location.toLowerCase() === p.id.toLowerCase())
    ) {
      isUserCheckIn = true
      if (layer === 'stress') {
        score = userCheckIn.stress
      } else if (layer === 'energy') {
        score = userCheckIn.energy
      } else if (layer === 'sleep') {
        score = userCheckIn.sleep
      } else if (layer === 'mood') {
        const emotionScores: Record<string, number> = {
          calm: 75, hopeful: 80, energized: 90, tired: 40, anxious: 30, low: 25
        }
        score = emotionScores[userCheckIn.emotion] ?? 50
      } else if (layer === 'burnout') {
        score = Math.round(userCheckIn.stress * 0.7 + (100 - userCheckIn.energy) * 0.3)
      }
    }

    const s = state(score, kind)
    const color = LAYER_COLORS[layer].shades[s.state] || LAYER_COLORS[layer].base
    
    return {
      id: p.id,
      name: isUserCheckIn ? `${p.name} (Your check-in)` : p.name,
      lat: p.lat,
      lng: p.lng,
      score,
      state: s.state,
      color,
    }
  })
}

export function MapExperience() {
  const [layer, setLayer] = useState<LayerKey>('mood')
  const [byArea, setByArea] = useState<Partial<Record<string, AreaInsights>>>({})
  const [cityInsights, setCityInsights] = useState<AreaInsights | null>(null)
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userCheckIn, setUserCheckIn] = useState<{
    location: string
    emotion: string
    stress: number
    energy: number
    sleep: number
    timestamp: number
  } | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('last_checkin')
      if (stored) {
        const parsed = JSON.parse(stored)
        // Check if within 24h
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setUserCheckIn(parsed)
        }
      }
    } catch (e) {
      console.error('Failed to load check-in:', e)
    }
  }, [])

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
    () => buildDistricts(layer, byArea, cityInsights, live, userCheckIn),
    [layer, byArea, cityInsights, live, userCheckIn],
  )

  const summary = useMemo(() => {
    let text = ''
    if (live && cityInsights) {
      text = layerSummary(layer, cityInsights)
    } else {
      const fallback: Record<LayerKey, string> = {
        mood: 'The city leans calm and hopeful today. Bole and Kazanchis feel notably brighter, while Merkato carries a heavier tone.',
        stress: 'Stress is concentrated in the dense western core. Mexico and Merkato are running hot.',
        energy: 'Energy is high across the north and east. Piassa and Bole are vibrant.',
        burnout: 'Two early-warning zones detected. Kazanchis and Merkato show sustained depletion.',
        sleep: 'Rest is healthiest in residential Bole and CMC. Central districts report shorter, lighter sleep.',
      }
      text = fallback[layer]
    }

    // Append user check-in info to community summary if it matches
    if (userCheckIn && userCheckIn.location && userCheckIn.location !== 'Prefer not to say') {
      const stateLabel = (val: number, kind: 'pos' | 'neg') => {
        const good = kind === 'pos' ? val : 100 - val
        if (good >= 75) return kind === 'pos' ? 'Thriving' : 'Easy'
        if (good >= 60) return 'Calm'
        if (good >= 48) return 'Steady'
        if (good >= 36) return 'Watch'
        return 'Tense'
      }
      
      const kind = LAYER_KIND[layer]
      let val = 50
      if (layer === 'stress') val = userCheckIn.stress
      else if (layer === 'energy') val = userCheckIn.energy
      else if (layer === 'sleep') val = userCheckIn.sleep
      else if (layer === 'mood') {
        const emotionScores: Record<string, number> = {
          calm: 75, hopeful: 80, energized: 90, tired: 40, anxious: 30, low: 25
        }
        val = emotionScores[userCheckIn.emotion] ?? 50
      } else if (layer === 'burnout') {
        val = Math.round(userCheckIn.stress * 0.7 + (100 - userCheckIn.energy) * 0.3)
      }
      
      const st = stateLabel(val, kind)
      text += ` Your check-in in ${userCheckIn.location} contributed to the collective weather, reporting ${st} levels (${val}/100) for this layer.`
    }
    return text
  }, [layer, live, cityInsights, userCheckIn])

  const wellbeing = wellbeingScore(cityInsights?.last_24h) ?? 72
  const delta = cityInsights?.trend?.delta_pct
  const checkInCount = cityInsights?.last_24h?.check_in_count

  return (
    <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside
          className="flex flex-col gap-3 rounded-3xl border p-4 transition-all duration-300"
          style={{
            backgroundColor: LAYER_COLORS[layer].bg,
            borderColor: LAYER_COLORS[layer].border,
          }}
        >
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Emotion layers
            {loading && <span className="ml-1 normal-case">· loading</span>}
          </p>
          <div className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0 snap-x scrollbar-none">
            {LAYERS.map((l) => {
              const isActive = layer === l.key
              const colorInfo = LAYER_COLORS[l.key]
              return (
                <button
                  key={l.key}
                  onClick={() => setLayer(l.key)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all flex-shrink-0 snap-start select-none w-[170px] lg:w-full cursor-pointer',
                    isActive
                      ? 'border-2 bg-background shadow-md'
                      : 'border-border/40 bg-background/40 hover:bg-background/80',
                  )}
                  style={
                    isActive
                      ? {
                          borderColor: colorInfo.base,
                        }
                      : undefined
                  }
                >
                  <span
                    className="flex size-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: isActive ? colorInfo.iconBg : 'var(--color-secondary)',
                    }}
                  >
                    <l.icon
                      className="size-4"
                      style={{
                        color: isActive ? colorInfo.base : 'var(--color-muted-foreground)',
                      }}
                    />
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block text-sm font-semibold truncate"
                      style={{
                        color: isActive ? colorInfo.text : 'var(--color-foreground)',
                      }}
                    >
                      {l.label}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate lg:whitespace-normal lg:line-clamp-2">
                      {l.desc}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Legend
            </p>
            <div className="mt-3 flex flex-col gap-2 text-xs text-foreground">
              {[
                ['Thriving', 'Thriving'],
                ['Calm', 'Calm'],
                ['Steady', 'Steady'],
                ['Watch', 'Watch'],
                ['Tense', 'Tense'],
              ].map(([label, stateKey]) => {
                const shadeColor = LAYER_COLORS[layer].shades[stateKey]
                return (
                  <span key={label} className="flex items-center gap-2 font-medium">
                    <span
                      className="size-3 rounded-full border border-black/5"
                      style={{ background: shadeColor }}
                    />
                    {label}
                  </span>
                )
              })}
            </div>
            {live && (
              <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
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
            layerColor={LAYER_COLORS[layer].base}
          />

          <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-border/70 bg-card p-6">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="size-4"
                  style={{ color: LAYER_COLORS[layer].base }}
                />
                <p className="text-sm font-medium text-foreground">
                  AI regional summary · {active.label}
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
                    backgroundColor: LAYER_COLORS[layer].base,
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
