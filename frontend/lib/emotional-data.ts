import {
  CHECK_IN_COOLDOWN_SECONDS,
  getCheckInToken,
  recordCheckInTime,
} from '@/lib/check-in-token'
import { getSupabase } from '@/lib/supabase'

export class CheckInCooldownError extends Error {
  secondsRemaining: number

  constructor(secondsRemaining: number) {
    super('CHECK_IN_COOLDOWN')
    this.name = 'CheckInCooldownError'
    this.secondsRemaining = secondsRemaining
  }
}

export type BackendArea = 'lideta' | 'bole' | 'kazanchis'
export type BackendEmotion =
  | 'stressed'
  | 'calm'
  | 'anxious'
  | 'energized'
  | 'lonely'
  | 'burned_out'
  | 'motivated'

export type AreaSnapshot = {
  check_in_count: number
  avg_stress: number
  avg_stress_index: number
  avg_energy: number
  avg_sleep: number
}

export type EmotionBreakdown = Record<
  string,
  { count: number; pct: number }
>

export type AreaInsights = {
  area: string
  last_24h: AreaSnapshot | null
  last_7d: AreaSnapshot | null
  emotion_breakdown_24h: EmotionBreakdown
  emotion_breakdown_7d: EmotionBreakdown
  trend: {
    today_avg_stress: number | null
    yesterday_avg_stress: number | null
    delta_pct: number | null
  }
}

export type LayerKey = 'mood' | 'stress' | 'energy' | 'burnout' | 'sleep'

const FRONTEND_TO_BACKEND_EMOTION: Record<string, BackendEmotion> = {
  calm: 'calm',
  hopeful: 'motivated',
  energized: 'energized',
  tired: 'burned_out',
  anxious: 'anxious',
  low: 'lonely',
}

const AREA_ALIASES: Record<string, BackendArea> = {
  bole: 'bole',
  kazanchis: 'kazanchis',
  lideta: 'lideta',
  mexico: 'lideta',
  arada: 'lideta',
  kirkos: 'kazanchis',
  yeka: 'bole',
  'nifas silk–lafto': 'lideta',
  'nifas silk-lafto': 'lideta',
  'kolfe keranio': 'lideta',
  gullele: 'lideta',
  'addis ababa': 'lideta',
  addis: 'lideta',
  'my campus': 'lideta',
}

export const BACKEND_AREAS: BackendArea[] = ['lideta', 'bole', 'kazanchis']

/** Map UI district ids to Supabase area column (others use city aggregate). */
export const PLACE_TO_AREA: Partial<Record<string, BackendArea>> = {
  bole: 'bole',
  kazanchis: 'kazanchis',
  mexico: 'lideta',
  lideta: 'lideta',
  arada: 'lideta',
  kirkos: 'kazanchis',
  yeka: 'bole',
  nifas_silk_lafto: 'lideta',
  kolfe_keranio: 'lideta',
  gullele: 'lideta',
}

export function mapFrontendEmotion(emotion: string): BackendEmotion {
  return FRONTEND_TO_BACKEND_EMOTION[emotion] ?? 'stressed'
}

export function mapLocationToArea(location: string): BackendArea {
  const key = location.trim().toLowerCase()
  if (!key || key === 'prefer not to say') return 'lideta'
  return AREA_ALIASES[key] ?? 'lideta'
}

export function sliderToLevel(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value / 10) || 1))
}

export function areaLabel(area: BackendArea): string {
  const labels: Record<BackendArea, string> = {
    lideta: 'Lideta',
    bole: 'Bole',
    kazanchis: 'Kazanchis',
  }
  return labels[area]
}

export async function fetchCheckInCooldown(): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) return 0

  const token = getCheckInToken()
  if (!token) return 0

  const { data, error } = await supabase.rpc('get_check_in_cooldown', {
    p_client_token: token,
  })

  if (error) throw error
  return typeof data === 'number' ? data : 0
}

export async function submitCheckIn(payload: {
  area: BackendArea
  emotion: string
  stress: number
  energy: number
  sleep: number
}) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase is not configured')

  const clientToken = getCheckInToken()
  const { data, error } = await supabase
    .from('check_ins')
    .insert({
      area: payload.area,
      emotion: mapFrontendEmotion(payload.emotion),
      stress_level: sliderToLevel(payload.stress),
      energy_level: sliderToLevel(payload.energy),
      sleep_quality: sliderToLevel(payload.sleep),
      client_token: clientToken || null,
    })
    .select('id')
    .single()

  if (error) {
    const message = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`
    if (message.includes('CHECK_IN_COOLDOWN')) {
      const seconds = await fetchCheckInCooldown().catch(() => CHECK_IN_COOLDOWN_SECONDS)
      throw new CheckInCooldownError(seconds)
    }
    throw error
  }

  recordCheckInTime()
  return data
}

export async function fetchSimilarCount(
  area: BackendArea,
  emotion: string,
): Promise<number> {
  const supabase = getSupabase()
  if (!supabase) return 0

  const { data, error } = await supabase.rpc('get_similar_feeling_count', {
    p_area: area,
    p_emotion: mapFrontendEmotion(emotion),
  })

  if (error) throw error
  return typeof data === 'number' ? data : 0
}

export async function fetchAreaInsights(
  area: BackendArea,
): Promise<AreaInsights | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase.rpc('get_area_insights', {
    p_area: area,
  })

  if (error) throw error
  return data as AreaInsights
}

export async function fetchAllAreaInsights(): Promise<
  Partial<Record<BackendArea, AreaInsights>>
> {
  const results = await Promise.all(
    BACKEND_AREAS.map(async (area) => {
      try {
        const insights = await fetchAreaInsights(area)
        return [area, insights] as const
      } catch {
        return [area, null] as const
      }
    }),
  )

  const map: Partial<Record<BackendArea, AreaInsights>> = {}
  for (const [area, insights] of results) {
    if (insights) map[area] = insights
  }
  return map
}

export function layerScore(
  layer: LayerKey,
  snapshot: AreaSnapshot | null | undefined,
  breakdown?: EmotionBreakdown,
): number | null {
  if (!snapshot?.check_in_count) return null

  switch (layer) {
    case 'stress':
      return Math.round((snapshot.avg_stress ?? 5) * 10)
    case 'energy':
      return Math.round((snapshot.avg_energy ?? 5) * 10)
    case 'sleep':
      return Math.round((snapshot.avg_sleep ?? 5) * 10)
    case 'mood':
      return Math.round(100 - (snapshot.avg_stress_index ?? 5) * 10)
    case 'burnout': {
      const burned = breakdown?.burned_out?.pct ?? 0
      const stressed = breakdown?.stressed?.pct ?? 0
      const anxious = breakdown?.anxious?.pct ?? 0
      return Math.min(100, Math.round(burned + stressed * 0.4 + anxious * 0.3))
    }
    default:
      return null
  }
}

export function wellbeingScore(snapshot: AreaSnapshot | null | undefined): number | null {
  if (!snapshot?.check_in_count) return null
  return Math.max(
    0,
    Math.min(100, Math.round(100 - (snapshot.avg_stress_index ?? 5) * 10)),
  )
}

export function forecastCopy(avgStress: number | null | undefined): string {
  const stress = avgStress ?? 5
  if (stress > 7) {
    return 'Addis is running hot today — stress is elevated across the area. Energy may dip this afternoon; plan lighter moments where you can.'
  }
  if (stress >= 5) {
    return 'Moderate emotional strain across Addis this afternoon. The city holds steady, with pockets of tension downtown.'
  }
  return 'Addis feels relatively calm right now. A hopeful morning with room to breathe.'
}

export function layerSummary(
  layer: LayerKey,
  insights: AreaInsights | null,
): string {
  if (!insights?.last_24h?.check_in_count) {
    return 'Live community data is loading. Check-ins from the last 24 hours will shape this summary.'
  }

  const stress = insights.last_24h.avg_stress
  const delta = insights.trend.delta_pct
  const top = Object.entries(insights.emotion_breakdown_24h).sort(
    (a, b) => b[1].pct - a[1].pct,
  )[0]

  const trendLine =
    delta != null && delta > 0
      ? ` Stress is up ${delta}% compared to yesterday.`
      : delta != null && delta < 0
        ? ` Stress eased ${Math.abs(delta)}% since yesterday.`
        : ''

  switch (layer) {
    case 'stress':
      return `Stress averages ${stress?.toFixed(1) ?? '—'} / 10 in live check-ins.${trendLine} Mexico and Lideta mirror the densest signals.`
    case 'energy':
      return `Collective energy sits at ${insights.last_24h.avg_energy?.toFixed(1) ?? '—'} / 10. Bole and Kazanchis lead when the city feels brighter.`
    case 'sleep':
      return `Sleep quality averages ${insights.last_24h.avg_sleep?.toFixed(1) ?? '—'} / 10, tracking closely with stress downtown.`
    case 'burnout':
      return `Burnout signals cluster where ${top?.[0]?.replace('_', ' ') ?? 'stress'} leads the emotion mix.${trendLine}`
    case 'mood':
    default:
      return forecastCopy(insights.last_24h.avg_stress_index ?? stress)
  }
}

export function cityAggregateInsights(
  byArea: Partial<Record<BackendArea, AreaInsights>>,
): AreaInsights | null {
  const entries = Object.values(byArea).filter(Boolean) as AreaInsights[]
  if (!entries.length) return null

  const sum = (fn: (s: AreaSnapshot) => number) => {
    let total = 0
    let weight = 0
    for (const e of entries) {
      const snap = e.last_24h
      if (!snap?.check_in_count) continue
      total += fn(snap) * snap.check_in_count
      weight += snap.check_in_count
    }
    return weight ? total / weight : null
  }

  const check_in_count = entries.reduce(
    (n, e) => n + (e.last_24h?.check_in_count ?? 0),
    0,
  )

  if (!check_in_count) return null

  const breakdown: EmotionBreakdown = {}
  for (const e of entries) {
    for (const [emotion, val] of Object.entries(e.emotion_breakdown_24h)) {
      breakdown[emotion] = breakdown[emotion] ?? { count: 0, pct: 0 }
      breakdown[emotion].count += val.count
    }
  }
  for (const emotion of Object.keys(breakdown)) {
    breakdown[emotion].pct =
      Math.round((breakdown[emotion].count / check_in_count) * 1000) / 10
  }

  const deltas = entries
    .map((e) => e.trend.delta_pct)
    .filter((d): d is number => d != null)
  const delta_pct = deltas.length
    ? Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length)
    : null

  return {
    area: 'addis',
    last_24h: {
      check_in_count,
      avg_stress: sum((s) => s.avg_stress) ?? 5,
      avg_stress_index: sum((s) => s.avg_stress_index) ?? 5,
      avg_energy: sum((s) => s.avg_energy) ?? 5,
      avg_sleep: sum((s) => s.avg_sleep) ?? 5,
    },
    last_7d: null,
    emotion_breakdown_24h: breakdown,
    emotion_breakdown_7d: {},
    trend: {
      today_avg_stress: sum((s) => s.avg_stress),
      yesterday_avg_stress: null,
      delta_pct,
    },
  }
}
