import type { Metadata } from 'next'
import { Compass, Heart, Lock, Microscope, Sparkles } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { SectionLabel } from '@/components/section-label'
import { ButtonLink } from '@/components/button-link'

export const metadata: Metadata = {
  title: 'Our Vision — Emotional Weather Map',
  description:
    'We are building the emotional pulse layer for society — privacy-first, research-backed, and deeply human.',
}

const roadmap = [
  {
    phase: 'Now',
    title: 'The living map',
    body: 'Anonymous check-ins and real-time emotional heatmaps for early cities and campuses.',
  },
  {
    phase: 'Next',
    title: 'Forecasting at scale',
    body: 'Reliable emotional forecasts and burnout early-warnings across whole regions.',
  },
  {
    phase: 'Soon',
    title: 'Civic intelligence',
    body: 'An open emotional climate layer that cities and institutions plan around.',
  },
  {
    phase: 'Vision',
    title: 'A kinder society',
    body: 'A world that can see how it feels — and choose to respond with care.',
  },
]

const principles = [
  {
    icon: Lock,
    title: 'Privacy is the foundation',
    body: 'No accounts, no individual tracking, no surveillance. Only the collective signal.',
  },
  {
    icon: Microscope,
    title: 'Research-backed',
    body: 'Grounded in affective science, ecological momentary assessment, and emotion research.',
  },
  {
    icon: Heart,
    title: 'Human before data',
    body: 'Every interaction should leave a person feeling a little more cared for.',
  },
]

export default function AboutPage() {
  return (
    <main>
      <PageHero
        label="Our vision"
        title="The emotional pulse layer for society"
        description="We measure the weather, the markets, and the traffic. We have never measured how we feel — together, in real time. We are building the missing layer."
      />

      {/* the insight */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <SectionLabel>The core insight</SectionLabel>
            <h2 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
              Emotions behave like weather
            </h2>
          </div>
          <div className="space-y-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            <p>
              They build and break. They move through neighbourhoods and
              workplaces. They have fronts, pressure, and seasons. And like
              weather, they are far easier to navigate once you can see them
              coming.
            </p>
            <p>
              It started with a simple question — &ldquo;what does Addis feel
              like today?&rdquo; — and a belief that a community that can sense
              its own emotional climate is a community that can care for itself.
            </p>
            <p>
              This is not a mental health app, a therapy platform, or a wellness
              dashboard. It is a new category:{' '}
              <span className="font-medium text-foreground">
                emotional infrastructure
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* principles */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <SectionLabel>Our principles</SectionLabel>
            <h2 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
              Ethics we will not compromise
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
        </div>
      </section>

      {/* roadmap */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-2xl">
          <SectionLabel>Where we are going</SectionLabel>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            The road to a society that can feel itself
          </h2>
        </div>
        <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {roadmap.map((r, i) => (
            <li
              key={r.title}
              className="relative rounded-3xl border border-border/70 bg-card p-7"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {i + 1}
              </span>
              <p className="mt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {r.phase}
              </p>
              <h3 className="mt-1 text-lg font-medium text-foreground">
                {r.title}
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {r.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* closing */}
      <section className="px-5 pb-24 sm:px-8">
        <div className="ew-grain relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border/70 bg-card px-6 py-20 text-center sm:px-12">
          <Sparkles className="mx-auto size-6 text-primary" />
          <h2 className="mx-auto mt-5 max-w-2xl text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            Help us build the emotional pulse of society
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Whether you lead a campus, a company, or a city — there is a place
            for you in this.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/contact" size="lg" className="rounded-full text-base">
              Become a partner
            </ButtonLink>
            <ButtonLink
              href="/check-in"
              size="lg"
              variant="outline"
              className="rounded-full border-border bg-background text-base"
            >
              Try a check-in
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  )
}
