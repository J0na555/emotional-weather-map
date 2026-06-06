'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { ButtonLink } from '@/components/button-link'
import { EmotionMap, EMOTION_COLORS } from '@/components/emotion-map'

const cities = ['Addis Ababa', 'your campus', 'your city', 'your organization', 'Adama']

export function HomeHero() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % cities.length), 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative min-h-[90svh] lg:min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#2D1A12]">
      {/* Background Image with elegant overlay gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] scale-105"
        style={{ backgroundImage: `url('/images/home_hero_bg.png')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#2D1A12]/95 via-[#2D1A12]/80 to-[#2D1A12]/45" />

      {/* Hero Content Grid */}
      <div className="relative mx-auto grid max-w-7xl w-full gap-12 px-5 pb-20 pt-28 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pb-24 lg:pt-32">
        <div className="flex flex-col justify-center animate-rise">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-background/90 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-secondary animate-pulse" />
            Emotional infrastructure for society
          </span>

          <h1 className="mt-6 text-balance font-serif text-5xl font-light leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            What does{' '}
            <span className="relative inline-block text-secondary font-light italic min-w-[200px]">
              <span key={i} className="animate-rise inline-block">
                {cities[i]}
              </span>
            </span>{' '}
            feel like today?
          </h1>

          <p className="mt-6 max-w-lg text-pretty text-lg font-light leading-relaxed text-white/80">
            Don&apos;t just track the weather. Track the feeling. We visualize the
            emotional climate of communities in real time — anonymously, calmly,
            and beautifully.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink 
              href="/check-in" 
              size="lg" 
              className="rounded-full text-base font-medium bg-[#FAF5F2] text-[#2D1A12] hover:bg-[#FAF5F2]/90 hover:scale-105 active:scale-95 transition-all duration-300 px-8 py-4 shadow-lg"
            >
              Check in anonymously
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink
              href="/map"
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 bg-white/5 text-white hover:bg-white hover:text-[#2D1A12] hover:scale-105 active:scale-95 transition-all duration-300 px-8 py-4 backdrop-blur-xs"
            >
              Explore the map
            </ButtonLink>
          </div>

          {/* Social Proof Counters */}
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/15 pt-8 text-sm text-white/60">
            <span className="flex items-center gap-2.5">
              <span className="size-2 rounded-full" style={{ background: EMOTION_COLORS.energy }} />
              2.4M check-ins logged
            </span>
            <span className="flex items-center gap-2.5">
              <span className="size-2 rounded-full" style={{ background: EMOTION_COLORS.calm }} />
              140 communities active
            </span>
            <span className="flex items-center gap-2.5">
              <span className="size-2 rounded-full animate-pulse-ring" style={{ background: EMOTION_COLORS.warm }} />
              100% Anonymous by design
            </span>
          </div>
        </div>

        {/* Right side interactive glass map preview */}
        <div className="relative flex flex-col justify-center animate-float">
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-4 shadow-2xl backdrop-blur-md">
            <EmotionMap />
          </div>
          
          <div className="absolute -bottom-6 left-6 right-6 rounded-2xl border border-foreground/10 bg-background/95 p-5 shadow-xl backdrop-blur sm:left-auto sm:right-8 sm:w-72">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live community pulse</p>
            <p className="mt-1 font-serif text-2xl font-normal text-foreground">
              Calm &amp; hopeful
            </p>
            <div className="h-px bg-foreground/10 my-3" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              Community wellbeing score{' '}
              <span className="font-semibold text-foreground">72 / 100</span> · rising
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
