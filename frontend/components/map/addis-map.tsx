'use client'

import { useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EMOTION_COLORS } from '@/components/emotion-map'

export type District = {
  id: string
  name: string
  lat: number
  lng: number
  state: string
  score: number
  color: string
}

// Real Addis Ababa districts at true coordinates.
export const ADDIS_CENTER: [number, number] = [9.0108, 38.7613]

type LeafletNS = typeof import('leaflet')

function colorWithState(state: string, score: number, color: string) {
  return { state, score, color }
}

export function AddisMap({
  districts,
  summary,
  layerLabel,
  layerColor,
  className,
}: {
  districts: District[]
  summary?: string
  layerLabel?: string
  layerColor?: string
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const LRef = useRef<LeafletNS | null>(null)
  const layerGroupRef = useRef<import('leaflet').LayerGroup | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [ready, setReady] = useState(false)

  // Initialize Leaflet map once.
  useEffect(() => {
    let cancelled = false
    async function init() {
      const L = (await import('leaflet')).default ?? (await import('leaflet'))
      // load CSS once
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      if (cancelled || !containerRef.current || mapRef.current) return
      LRef.current = L as unknown as LeafletNS

      const map = L.map(containerRef.current, {
        center: ADDIS_CENTER,
        zoom: 12,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: true,
      })
      mapRef.current = map

      // Esri World Imagery — free satellite tiles, no API key.
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution:
            'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
        },
      ).addTo(map)

      // Labels overlay (roads / place names) for the Google-Maps feel.
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19, opacity: 0.9 },
      ).addTo(map)

      layerGroupRef.current = L.layerGroup().addTo(map)
      setReady(true)
    }
    init()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  // Render / update district markers when data changes.
  useEffect(() => {
    const L = LRef.current
    const group = layerGroupRef.current
    if (!L || !group || !ready) return
    group.clearLayers()

    districts.forEach((d) => {
      const html = `
        <div class="addis-pin" style="--pin:${d.color}">
          <span class="addis-pin-glow"></span>
          <span class="addis-pin-dot"></span>
          <span class="addis-pin-label">
            <span class="addis-pin-name" style="color:${d.color}">${d.name}</span>
            <span class="addis-pin-state">${d.state} · ${d.score}</span>
          </span>
        </div>`
      const icon = L.divIcon({
        html,
        className: 'addis-pin-wrap',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })
      L.marker([d.lat, d.lng], { icon }).addTo(group)

      // soft emotional halo on the map itself
      L.circle([d.lat, d.lng], {
        radius: 1100 + d.score * 8,
        color: d.color,
        weight: 0,
        fillColor: d.color,
        fillOpacity: 0.16,
      }).addTo(group)
    })
  }, [districts, ready])

  // Keep Leaflet sized correctly on fullscreen toggle.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const t = setTimeout(() => map.invalidateSize(), 220)
    return () => clearTimeout(t)
  }, [fullscreen])

  // Esc closes fullscreen.
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFullscreen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fullscreen])

  return (
    <div
      className={cn(
        fullscreen
          ? 'fixed inset-0 z-50 bg-background'
          : 'relative aspect-[16/11] w-full overflow-hidden rounded-3xl border border-border/70',
        className,
      )}
    >
      <div ref={containerRef} className="size-full" />

      {/* top control bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-3.5 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          <span
            className="size-2 animate-pulse rounded-full"
            style={{ backgroundColor: layerColor ?? 'var(--color-primary)' }}
          />
          Addis Ababa · {layerLabel ?? 'Mood'} layer
        </div>
        <button
          onClick={() => setFullscreen((v) => !v)}
          aria-label={fullscreen ? 'Exit full screen' : 'Open full screen'}
          className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-secondary"
        >
          {fullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </button>
      </div>

      {/* fullscreen summary + close */}
      {fullscreen && (
        <>
          <button
            onClick={() => setFullscreen(false)}
            aria-label="Close full screen"
            className="absolute right-4 top-16 z-[1000] flex size-9 items-center justify-center rounded-full border border-border/70 bg-background/85 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-secondary"
          >
            <X className="size-4" />
          </button>
          {summary && (
            <div className="absolute inset-x-4 bottom-4 z-[1000] mx-auto max-w-xl rounded-2xl border border-border/70 bg-background/90 p-4 shadow-lg backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Live regional summary · {layerLabel}
              </p>
              <p className="mt-1.5 text-pretty text-sm leading-relaxed text-foreground">
                {summary}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { colorWithState }
