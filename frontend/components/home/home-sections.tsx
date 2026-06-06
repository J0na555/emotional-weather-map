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
} from 'lucide-react'
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
    <section className="border-y border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-5 py-12 sm:px-8 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-2 text-center sm:px-6">
            <p className="font-serif text-4xl text-foreground sm:text-5xl">
              {s.value}
            </p>
            <p className="mt-2 text-sm text-muted-foreground text-balance">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeProblem() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="max-w-2xl">
        <SectionLabel>The invisible climate</SectionLabel>
        <h2 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          We measure air quality, traffic, and rainfall. We&apos;ve never
          measured how we feel.
        </h2>
        <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
          Emotions move through communities like weather systems — building,
          spreading, and breaking. When that signal is invisible, burnout goes
          unseen and care arrives too late. We make the emotional climate
          visible, so communities can respond with compassion.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {[
          {
            icon: CloudSun,
            title: 'Emotions are infrastructure',
            body: 'How a city feels shapes how it works, heals, and grows. That signal deserves to be measured.',
            color: EMOTION_COLORS.warm,
          },
          {
            icon: Activity,
            title: 'Real-time, not retrospective',
            body: 'Surveys arrive months late. Emotional weather updates continuously, like a living forecast.',
            color: EMOTION_COLORS.energy,
          },
          {
            icon: ShieldCheck,
            title: 'Anonymous by design',
            body: 'No accounts, no tracking, no surveillance. Only the aggregate pulse of a community.',
            color: EMOTION_COLORS.calm,
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-3xl border border-border/70 bg-card p-7"
          >
            <span
              className="flex size-11 items-center justify-center rounded-2xl"
              style={{ background: `color-mix(in oklab, ${c.color} 18%, white)` }}
            >
              <c.icon className="size-5" style={{ color: c.color }} />
            </span>
            <h3 className="mt-5 text-lg font-medium text-foreground">
              {c.title}
            </h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
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
      body: 'Daily forecasts, burnout early-warnings, and gentle recommendations. A guide, never a surveillance system.',
      href: '/intelligence',
      cta: 'See the intelligence',
    },
    {
      icon: Heart,
      title: 'A healing moment after every check-in',
      body: 'Grounding audio, breathing guidance, and community encouragement. The reward is immediate and human.',
      href: '/check-in',
      cta: 'Try a check-in',
    },
  ]
  return (
    <section className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionLabel>The platform</SectionLabel>
            <h2 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
              One calm system for the emotional pulse of a community
            </h2>
          </div>
          <p className="max-w-sm text-pretty text-muted-foreground">
            From a single anonymous check-in to a regional forecast — every
            layer is designed to feel safe, intelligent, and human.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group flex flex-col rounded-3xl border border-border/70 bg-card p-8 transition-shadow hover:shadow-lg"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                <f.icon className="size-6 text-primary" />
              </span>
              <h3 className="mt-6 text-xl font-medium text-foreground">
                {f.title}
              </h3>
              <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
              <Link
                href={f.href}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors group-hover:gap-2.5"
              >
                {f.cta}
                <Wind className="size-4" />
              </Link>
            </div>
          ))}
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
          <SectionLabel>Built for institutions</SectionLabel>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Trusted to sense what surveys cannot
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            The same emotional intelligence powering individual check-ins gives
            leaders an early, ethical, population-level view of wellbeing.
          </p>
          <ButtonLink href="/solutions" size="lg" className="mt-8 rounded-full">
            See institutional solutions
            <LineChart className="size-4" />
          </ButtonLink>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {cases.map((c) => (
            <li
              key={c}
              className="rounded-2xl border border-border/70 bg-card p-5 text-sm leading-relaxed text-foreground"
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
      <div className="ew-grain relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border/70 bg-card px-6 py-20 text-center sm:px-12">
        <h2 className="mx-auto max-w-2xl text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
          Help your community understand how it feels
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Start with a single anonymous check-in, or bring emotional weather to
          your campus, company, or city.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/check-in" size="lg" className="rounded-full text-base">
            Check in now
          </ButtonLink>
          <ButtonLink
            href="/contact"
            size="lg"
            variant="outline"
            className="rounded-full border-border bg-background text-base"
          >
            Book a demo
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
