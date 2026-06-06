import Link from 'next/link'

const groups = [
  {
    title: 'Platform',
    links: [
      { href: '/map', label: 'Emotional Heatmap' },
      { href: '/check-in', label: 'Anonymous Check-in' },
      { href: '/intelligence', label: 'Weather Forecast' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { href: '/solutions', label: 'For Universities' },
      { href: '/solutions', label: 'For Companies & HR' },
      { href: '/solutions', label: 'For Cities & NGOs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'Our Philosophy' },
      { href: '/about', label: 'Ethics & Privacy' },
      { href: '/contact', label: 'Pilot Programs' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background border-t border-foreground/5 pt-20 pb-8 px-5 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.8fr_1fr_1fr_1fr] pb-16 border-b border-background/15">
          <div className="max-w-md flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-normal leading-tight tracking-tight text-background">
                emotional weather <em>map</em>
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-background/70 font-light max-w-sm">
                We believe that a community that can see its own emotional climate is one that can respond with active care and compassion. Building a new layer of emotional infrastructure for society.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-background/20 px-3.5 py-1 text-xs text-background/60">
                <span className="size-1.5 rounded-full bg-chart-1" />
                Anonymous by design
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-background/20 px-3.5 py-1 text-xs text-background/60">
                <span className="size-1.5 rounded-full bg-chart-2" />
                Population-level signal
              </span>
            </div>
          </div>

          {groups.map((g) => (
            <div key={g.title} className="flex flex-col">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-background/40">
                {g.title}
              </h4>
              <ul className="mt-5 flex flex-col gap-3.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[15px] font-medium text-background/80 transition-all duration-300 hover:text-background hover:underline decoration-background/30 underline-offset-4"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 pt-4 text-xs text-background/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Emotional Weather Map. All rights reserved. Made with love for community wellbeing.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-background transition-colors">Privacy Philosophy</Link>
            <Link href="/about" className="hover:text-background transition-colors">Ethics Charter</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
