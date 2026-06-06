import type { Metadata } from 'next'
import {
  AlertTriangle,
  CalendarClock,
  Eye,
  Leaf,
  LineChart,
  Lock,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { SectionLabel } from '@/components/section-label'
import { TrendChart } from '@/components/trend-chart'
import { ButtonLink } from '@/components/button-link'
import { EMOTION_COLORS } from '@/components/emotion-map'

export const metadata: Metadata = {
  title: 'AI Emotional Intelligence — Emotional Weather Map',
  description:
    'Daily emotional forecasts, burnout early-warnings, trend analysis, and gentle recommendations. A guide, never a surveillance system.',
}

const capabilities = [
  {
    icon: CalendarClock,
    title: 'Daily emotional forecast',
    body: 'A clear, human forecast for the day ahead — like a weather report for how a community is likely to feel.',
  },
  {
    icon: TrendingUp,
    title: 'Trend prediction',
    body: 'Surface emerging emotional patterns days before they peak, with confidence intervals you can trust.',
  },
  {
    icon: AlertTriangle,
    title: 'Burnout early-warnings',
    body: 'Gentle, aggregate alerts that open a window for care — never naming or targeting individuals.',
  },
  {
    icon: Leaf,
    title: 'Wellness recommendations',
    body: 'Context-aware suggestions: lighter scheduling, green-space breaks, or community moments of rest.',
  },
]

const principles = [
  {
    icon: Eye,
    title: 'Transparent, not opaque',
    body: 'Every forecast explains the why behind it in plain language.',
  },
  {
    icon: Lock,
    title: 'Anonymous, always',
    body: 'The AI only ever sees aggregate signals — never a single person.',
  },
  {
    icon: Sparkles,
    title: 'A guide, not a watcher',
    body: 'Built to help communities care, never to score or surveil people.',
  },
]

export default function IntelligencePage() {
  return (
    <main>
      <PageHero
        label="AI emotional intelligence"
        title="A forecast for how we feel"
        description="Our intelligence reads the emotional climate the way meteorologists read the sky — finding patterns, predicting shifts, and offering gentle guidance. It is designed to help, not to watch."
      >
        <ButtonLink href="/check-in" className="rounded-full">
          See it after a check-in
        </ButtonLink>
      </PageHero>

      {/* forecast showcase */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-border/70 bg-card p-7 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <p className="text-sm font-medium text-foreground">
                Today&apos;s emotional forecast · Addis Ababa
              </p>
            </div>
            <p className="mt-4 text-pretty font-serif text-2xl leading-snug text-foreground">
              &ldquo;A calm, hopeful morning easing into a busier afternoon.
              Energy stays high in the east; watch for rising stress downtown
              after 3pm.&rdquo;
            </p>
            <div className="mt-6">
              <TrendChart
                points={[52, 58, 55, 63, 67, 64, 70, 72, 69, 74]}
                color={EMOTION_COLORS.calm}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              7-day collective mood · confidence 86%
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-3xl border border-border/70 bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="size-4 text-[oklch(0.64_0.19_25)]" />
                Burnout watch
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                2 districts entering an early-warning window. A gentle
                intervention now can prevent a harder week.
              </p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-card p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Leaf className="size-4 text-[oklch(0.7_0.13_160)]" />
                Recommendation
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Encourage outdoor breaks between 3–5pm downtown. Communities
                that did this last week recovered 18% faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* capabilities */}
      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <SectionLabel>What it does</SectionLabel>
            <h2 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
              Emotional intelligence that reads like a forecast
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="flex gap-4 rounded-3xl border border-border/70 bg-card p-7"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <c.icon className="size-5 text-primary" />
                </span>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* principles */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <SectionLabel>How we think about AI</SectionLabel>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Powerful, because it is trustworthy
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded-3xl border border-border/70 bg-card p-7"
            >
              <p.icon className="size-6 text-primary" />
              <h3 className="mt-5 text-lg font-medium text-foreground">
                {p.title}
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <ButtonLink href="/map" size="lg" className="rounded-full">
            Explore the live map
            <LineChart className="size-4" />
          </ButtonLink>
          <ButtonLink
            href="/contact"
            size="lg"
            variant="outline"
            className="rounded-full border-border bg-card"
          >
            Talk to our team
          </ButtonLink>
        </div>
      </section>
    </main>
  )
}
