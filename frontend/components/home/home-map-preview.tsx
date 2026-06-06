'use client'

import { useEffect, useMemo, useState } from 'react'
import { AddisMap } from '@/components/map/addis-map'
import {
  buildDistricts,
  LAYER_COLORS,
} from '@/components/map/map-experience'
import {
  cityAggregateInsights,
  fetchAllAreaInsights,
  type AreaInsights,
} from '@/lib/emotional-data'

const LAYER = 'mood' as const

export function HomeMapPreview() {
  const [byArea, setByArea] = useState<Partial<Record<string, AreaInsights>>>({})
  const [cityInsights, setCityInsights] = useState<AreaInsights | null>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchAllAreaInsights()
      .then((data) => {
        if (cancelled) return
        setByArea(data)
        setCityInsights(cityAggregateInsights(data))
        setLive(Object.keys(data).length > 0)
      })
      .catch(() => {
        if (!cancelled) setLive(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const districts = useMemo(
    () => buildDistricts(LAYER, byArea, cityInsights, live),
    [byArea, cityInsights, live],
  )

  return (
    <AddisMap
      districts={districts}
      layerLabel="Mood"
      layerColor={LAYER_COLORS[LAYER].base}
      className="aspect-[4/5] border-0 sm:aspect-[16/11]"
    />
  )
}
