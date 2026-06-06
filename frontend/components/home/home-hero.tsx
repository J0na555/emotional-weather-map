'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ButtonLink } from '@/components/button-link'
import { EmotionMap, EMOTION_COLORS } from '@/components/emotion-map'
import { LivePulse } from '@/components/home/live-pulse'

const cities = ['Addis', 'your campus', 'your city', 'your team', 'Adama']

export function HomeHero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % cities.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative overflow-hidden ew-grain">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24 lg:pt-24">
        <div className="flex flex-col justify-center animate-rise">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Emotional infrastructure for society
          </span>

          <h1 className="mt-6 text-pretty font-serif text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            What does{' '}
            <span className="relative inline-block text-primary">
              <span key={i} className="animate-rise">
                {cities[i]}
              </span>
            </span>{' '}
            feel like today?
          </h1>

          <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            Don&apos;t just track the weather. Track the feeling. We visualize the
            emotional climate of communities in real time — anonymously, calmly,
            and beautifully.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="/check-in" size="lg" className="rounded-full text-base">
              Check in anonymously
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="/map"
              size="lg"
              variant="outline"
              className="rounded-full border-border bg-card text-base"
            >
              Explore the map
            </ButtonLink>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: EMOTION_COLORS.energy }} />
              2.4M check-ins
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: EMOTION_COLORS.calm }} />
              140 communities
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full" style={{ background: EMOTION_COLORS.warm }} />
              Anonymous by design
            </span>
          </div>
        </div>

        <div className="relative animate-float">
          <EmotionMap />
          <LivePulse />
        </div>
      </div>
    </section>
  )
}
