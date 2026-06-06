import type { Metadata } from 'next'
import { Bell, FileBarChart, Map, ShieldCheck } from 'lucide-react'
import { PageHero } from '@/components/page-hero'
import { SectionLabel } from '@/components/section-label'
import { SolutionsExplorer } from '@/components/solutions/solutions-explorer'
import { InstitutionAccess } from '@/components/institution/institution-access'
import { ButtonLink } from '@/components/button-link'

export const metadata: Metadata = {
  title: 'Institutional Solutions — Emotional Weather Map',
  description:
    'Emotional climate intelligence for universities, companies, NGOs, cities, wellness organizations, and agricultural communities.',
}

const platform = [
  {
    icon: Map,
    title: 'Population heatmaps',
    body: 'Aggregate emotional climate across your whole population, in real time.',
  },
  {
    icon: FileBarChart,
    title: 'Reports & analytics',
    body: 'Exportable trend reports leaders can act on and share with confidence.',
  },
  {
    icon: Bell,
    title: 'Early-warning systems',
    body: 'Burnout forecasting that opens an intervention window before crisis.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy by architecture',
    body: 'No individuals, no tracking — only the collective signal, always anonymous.',
  },
]

export default function SolutionsPage() {
  return (
    <main>
      <PageHero
        label="Institutional solutions"
        title="Emotional climate intelligence for every institution"
        description="The same calm intelligence behind individual check-ins gives leaders an early, ethical, population-level view of wellbeing — for campuses, companies, cities, and communities."
      >
        <ButtonLink href="/contact" className="rounded-full">
          Start a pilot program
        </ButtonLink>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 pb-4 sm:px-8">
        <InstitutionAccess />
      </section>

      <SolutionsExplorer />

      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <SectionLabel>Built into every plan</SectionLabel>
            <h2 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
              Commercial-grade, human-centered
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {platform.map((p) => (
              <div
                key={p.title}
                className="rounded-3xl border border-border/70 bg-card p-7"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
                  <p.icon className="size-5 text-primary" />
                </span>
                <h3 className="mt-5 text-base font-medium text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <ButtonLink href="/contact" size="lg" className="rounded-full">
              Book an institutional demo
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  )
}
