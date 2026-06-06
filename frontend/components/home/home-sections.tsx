'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  Brain,
  CloudSun,
  Heart,
  LineChart,
  MapPin,
  ShieldCheck,
  Wind,
  ChevronLeft,
  ChevronRight,
  Quote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ButtonLink } from '@/components/button-link'
import { SectionLabel } from '@/components/section-label'
import { EMOTION_COLORS } from '@/components/emotion-map'

export function HomeStats() {
  const stats = [
    { value: '2.4M', label: 'Anonymous check-ins logged' },
    { value: '15s', label: 'Average time to check in' },
    { value: '140+', label: 'Cities, campuses & teams' },
    { value: '94%', label: 'Say they feel more understood' },
  ]
  return (
    <section className="border-y border-foreground/10 bg-card">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:gap-y-0">
          {stats.map((s, idx) => (
            <div 
              key={s.label} 
              className={cn(
                "px-4 text-center flex flex-col items-center justify-center",
                idx > 0 && "lg:border-l lg:border-foreground/10"
              )}
            >
              <p className="font-serif text-5xl font-light text-foreground sm:text-6xl tracking-tight">
                {s.value}
              </p>
              <p className="mt-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground max-w-[180px] text-balance">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeProblem() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      {/* Side-by-Side Editorial Layout */}
      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="flex flex-col justify-center animate-rise">
          <SectionLabel className="border-foreground/15 bg-card/65">The invisible climate</SectionLabel>
          <h2 className="mt-6 text-balance font-serif text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            We measure air quality, traffic, and rainfall. We&apos;ve never measured how we <em>feel</em>.
          </h2>
          <div className="w-16 h-px bg-muted-foreground/30 mt-8 mb-6" />
          <p className="text-pretty text-lg font-light leading-relaxed text-muted-foreground">
            Emotions move through communities like weather systems — building,
            spreading, and breaking. When that signal is invisible, burnout goes
            unseen and care arrives too late. We make the emotional climate
            visible, so communities can respond with compassion and understanding.
          </p>
        </div>

        {/* Custom Generated Photo Column */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-foreground/10 shadow-lg">
          <img 
            src="/images/home_insight_side.png" 
            alt="Person meditating in a warm light-filled studio" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2D1A12]/30 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Grid of Highlight Cards */}
      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          {
            icon: CloudSun,
            title: 'Emotions are infrastructure',
            body: 'How a city feels shapes how it works, heals, and grows. That collective signal deserves to be understood.',
            color: EMOTION_COLORS.warm,
          },
          {
            icon: Activity,
            title: 'Real-time, not retrospective',
            body: 'Traditional surveys arrive months late. Emotional weather updates continuously, like a living forecast.',
            color: EMOTION_COLORS.energy,
          },
          {
            icon: ShieldCheck,
            title: 'Anonymous by design',
            body: 'No accounts, no individual tracking, no surveillance. Only the aggregate, trusted pulse of the community.',
            color: EMOTION_COLORS.calm,
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-[2rem] border border-foreground/10 bg-card p-8 transition-all duration-300 hover:border-foreground/20 hover:shadow-sm"
          >
            <span
              className="flex size-12 items-center justify-center rounded-2xl"
              style={{ background: `color-mix(in oklab, ${c.color} 12%, white)` }}
            >
              <c.icon className="size-5.5" style={{ color: c.color }} />
            </span>
            <h3 className="mt-6 text-xl font-medium text-foreground">
              {c.title}
            </h3>
            <p className="mt-3 text-pretty text-sm font-light leading-relaxed text-muted-foreground">
              {c.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeFeatures() {
  const features = [
    {
      icon: MapPin,
      title: 'Live emotional heatmaps',
      body: 'Watch calm, energy, stress, and burnout move across a city in real time — as polished as a premium navigation product.',
      href: '/map',
      cta: 'Explore the map',
    },
    {
      icon: Brain,
      title: 'AI emotional forecasts',
      body: 'Daily forecasts, burnout early-warnings, and gentle recommendations. A supportive guide, never a surveillance system.',
      href: '/intelligence',
      cta: 'See the forecast',
    },
    {
      icon: Heart,
      title: 'A healing moment after check-in',
      body: 'Grounding audio, breathing guidance, and community encouragement. The reward for checking in is immediate and human.',
      href: '/check-in',
      cta: 'Try a check-in',
    },
  ]
  return (
    <section className="border-t border-foreground/10 bg-secondary/35">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <SectionLabel className="border-foreground/15 bg-card/65">The platform</SectionLabel>
            <h2 className="mt-6 text-balance font-serif text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              One calm system for the emotional pulse of a community
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-base font-light text-muted-foreground">
            From a single anonymous check-in to a regional forecast — every
            layer is designed to feel safe, intelligent, and deeply human.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group flex flex-col rounded-[2.25rem] border border-foreground/10 bg-card p-8 transition-all duration-500 hover:shadow-lg hover:border-foreground/20"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-foreground/5 text-foreground transition-transform duration-300 group-hover:scale-110">
                <f.icon className="size-6 text-foreground" />
              </span>
              <h3 className="mt-6 text-2xl font-normal text-foreground">
                {f.title}
              </h3>
              <p className="mt-3 flex-1 text-pretty text-sm font-light leading-relaxed text-muted-foreground">
                {f.body}
              </p>
              <Link
                href={f.href}
                className="mt-8 inline-flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground border border-foreground/15 rounded-full py-2.5 px-5 transition-all duration-300 hover:bg-foreground hover:text-background w-fit"
              >
                {f.cta}
                <Wind className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const reflections = [
  {
    quote: "Amazing group mapping experience! Because the data is kept strictly anonymous and summarized on district levels, checking in feels completely safe and has become a grounding daily habit.",
    author: "Wai Ling T. (District Resident)",
  },
  {
    quote: "Our campus wellbeing team was able to spot student stress spikes early during exams and target drop-in support. A privacy-first breakthrough for student support.",
    author: "Dr. David L. (VP Student Affairs)",
  },
  {
    quote: "The interface is absolutely beautiful and calming, a massive contrast to other social platforms. Reading the daily AI weather forecast gives me a gentle sense of connection to my neighbors.",
    author: "Yi Mon T. (Community Organizer)",
  },
  {
    quote: "I highly recommend this for municipal leaders. It has helped us target mental health resources block-by-block and measure the actual outcome of our community support programs.",
    author: "Standlee W. (City Resilience Director)",
  },
  {
    quote: "The grounding breathing exercises after each check-in are rigorous yet so enjoyable. It gives you immediate personal reward while contributing to the collective community signal.",
    author: "Li Mei T. (HR Wellness Lead)",
  },
]

export function HomeReflections() {
  const [active, setActive] = useState(0)

  const handleNext = () => {
    setActive((prev) => (prev + 1) % reflections.length)
  }

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + reflections.length) % reflections.length)
  }

  return (
    <section className="bg-foreground text-background py-20 lg:py-28 px-5 sm:px-8 border-y border-foreground/5">
      <div className="mx-auto max-w-4xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-secondary/70">
          {active + 1} of {reflections.length} reflections
        </span>
        
        <div className="relative mt-12 min-h-[160px] flex items-center justify-center">
          <Quote className="absolute size-20 text-background/5 -top-6 left-1/2 -translate-x-1/2" />
          
          <div key={active} className="relative z-10 animate-rise max-w-3xl">
            <h4 className="font-serif text-2xl font-light leading-relaxed tracking-tight text-background sm:text-3xl lg:text-4xl text-pretty">
              &ldquo;{reflections[active].quote}&rdquo;
            </h4>
            <p className="mt-8 font-serif text-lg text-secondary italic font-light">
              — {reflections[active].author}
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          <button 
            onClick={handlePrev}
            className="flex size-12 items-center justify-center rounded-full border border-background/25 text-background transition-all duration-300 hover:bg-background hover:text-foreground active:scale-95"
            aria-label="Previous reflection"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button 
            onClick={handleNext}
            className="flex size-12 items-center justify-center rounded-full border border-background/25 text-background transition-all duration-300 hover:bg-background hover:text-foreground active:scale-95"
            aria-label="Next reflection"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export function HomeUseCases() {
  const cases = [
    'Universities tracking student wellbeing across exam season',
    'Companies spotting team burnout before it breaks',
    'Cities mapping community resilience block by block',
    'NGOs targeting support where it is needed most',
    'Agricultural cooperatives sensing seasonal stress',
    'Wellness institutions measuring real outcomes',
  ]
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <SectionLabel className="border-foreground/15 bg-card/65">Built for institutions</SectionLabel>
          <h2 className="mt-6 text-balance font-serif text-4xl font-light leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Trusted to sense what surveys cannot
          </h2>
          <p className="mt-6 text-pretty text-lg font-light leading-relaxed text-muted-foreground">
            The same emotional intelligence powering individual check-ins gives
            leaders an early, ethical, population-level view of collective wellbeing.
          </p>
          <ButtonLink 
            href="/solutions" 
            size="lg" 
            className="mt-8 rounded-full text-sm font-semibold uppercase tracking-wider bg-foreground text-background hover:bg-muted-foreground transition-all duration-300 px-6 py-3"
          >
            See institutional solutions
            <LineChart className="size-4" />
          </ButtonLink>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {cases.map((c) => (
            <li
              key={c}
              className="rounded-3xl border border-foreground/10 bg-card p-6 text-[15px] font-light leading-relaxed text-foreground shadow-xs hover:border-foreground/20 hover:shadow-sm transition-all"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function HomeCTA() {
  return (
    <section className="px-5 pb-24 sm:px-8">
      {/* Immersive Column CTA Layout inspired by Core Atelier */}
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-foreground/10 shadow-lg grid lg:grid-cols-2 bg-card">
        {/* Left Side: Generated Image Column */}
        <div className="relative h-64 lg:h-auto min-h-[350px] w-full overflow-hidden">
          <img 
            src="/images/home_cta_side.png" 
            alt="Supportive community wellness circle session" 
            className="w-full h-full object-cover transition-transform duration-[10000ms] hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2D1A12]/20 to-transparent pointer-events-none" />
        </div>

        {/* Right Side: Editorial Form Block */}
        <div className="flex flex-col justify-center bg-secondary/40 px-6 py-16 sm:px-12 lg:px-16">
          <h2 className="font-serif text-4xl sm:text-5xl font-light leading-tight tracking-tight text-foreground lg:text-6xl">
            begin your <em>journey</em>
          </h2>
          <p className="mt-4 max-w-md text-pretty text-[15px] font-light leading-relaxed text-muted-foreground">
            Start with a single anonymous check-in, or discover our offerings to bring emotional weather intelligence to your campus, company, or city.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink 
              href="/check-in" 
              size="lg" 
              className="rounded-full text-sm font-semibold uppercase tracking-wider bg-foreground text-background hover:bg-muted-foreground px-7 py-3 transition-all duration-300"
            >
              Check in now
            </ButtonLink>
            <ButtonLink
              href="/contact"
              size="lg"
              variant="outline"
              className="rounded-full text-sm font-semibold uppercase tracking-wider border-foreground/30 text-foreground hover:bg-foreground hover:text-background px-7 py-3 backdrop-blur-xs"
            >
              Book a demo
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
