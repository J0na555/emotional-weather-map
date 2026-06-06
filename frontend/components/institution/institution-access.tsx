import {
  Ban,
  BarChart3,
  Bell,
  FileBarChart,
  Mail,
  Map,
  ShieldCheck,
} from 'lucide-react'
import { ButtonLink } from '@/components/button-link'
import { SectionLabel } from '@/components/section-label'
import { PARTNERS_EMAIL, partnersMailto } from '@/lib/site-contact'

const INCLUDES = [
  {
    icon: Map,
    title: 'Aggregate heatmaps',
    body: 'District- or campus-level emotional climate, updated from anonymous check-ins.',
  },
  {
    icon: FileBarChart,
    title: 'Trend reports & exports',
    body: 'Weekly summaries leaders can share — stress, energy, burnout patterns over time.',
  },
  {
    icon: Bell,
    title: 'Burnout early-warnings',
    body: 'Population-level alerts when collective strain rises, before crisis.',
  },
  {
    icon: BarChart3,
    title: 'Forecast & intelligence',
    body: 'Human-readable outlooks and recommendations from aggregate signals.',
  },
]

const NEVER = [
  'Individual identities or accounts',
  'Raw check-in rows tied to a person',
  'Cross-institution tracking or profiling',
  'Surveillance-style employee scoring',
]

const PROCESS = [
  {
    step: '1',
    title: 'Discovery call',
    body: 'Tell us about your campus, company, or city and what you want to understand.',
  },
  {
    step: '2',
    title: 'Scoped pilot',
    body: 'We configure anonymous check-ins, dashboards, and aggregate reports for your community.',
  },
  {
    step: '3',
    title: 'Ongoing access',
    body: 'Dashboard, exports, and optional API access — aggregate intelligence only.',
  },
]

type InstitutionAccessProps = {
  showProcess?: boolean
  className?: string
}

export function InstitutionAccess({
  showProcess = false,
  className,
}: InstitutionAccessProps) {
  return (
    <div className={className}>
      <div className="rounded-[2rem] border border-border/70 bg-card px-6 py-10 sm:px-10 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <SectionLabel>For institutions</SectionLabel>
            <h2 className="mt-5 text-balance font-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
              Aggregate emotional climate intelligence
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Universities, companies, cities, and NGOs use Emotional Weather Map
              to sense collective wellbeing early — through anonymous,
              population-level signals, not individual surveillance.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href="/contact" className="rounded-full">
                Request a pilot
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="outline"
                className="rounded-full border-border bg-background"
              >
                Book a demo
              </ButtonLink>
            </div>
            <a
              href={partnersMailto('Institutional inquiry')}
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <Mail className="size-4" />
              {PARTNERS_EMAIL}
            </a>
          </div>

          <div className="grid w-full max-w-md gap-3 sm:grid-cols-2 lg:max-w-lg">
            <div className="rounded-2xl border border-border/70 bg-secondary/40 p-5 sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                What you get
              </div>
              <ul className="mt-4 flex flex-col gap-3">
                {INCLUDES.map((item) => (
                  <li key={item.title} className="flex gap-3 text-sm">
                    <item.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="font-medium text-foreground">
                        {item.title}
                      </span>
                      <span className="text-muted-foreground"> — {item.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border/70 bg-secondary/40 p-5 sm:col-span-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Ban className="size-4 text-[oklch(0.64_0.19_25)]" />
                What we never share
              </div>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                {NEVER.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {showProcess && (
          <div className="mt-10 border-t border-border/60 pt-10">
            <p className="text-sm font-medium text-foreground">How it works</p>
            <ol className="mt-5 grid gap-4 md:grid-cols-3">
              {PROCESS.map((step) => (
                <li
                  key={step.step}
                  className="rounded-2xl border border-border/70 bg-background/80 p-5"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {step.step}
                  </span>
                  <h3 className="mt-4 font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
