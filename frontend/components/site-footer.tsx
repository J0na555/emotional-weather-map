import Link from 'next/link'

const groups = [
  {
    title: 'Platform',
    links: [
      { href: '/map', label: 'Emotional Map' },
      { href: '/check-in', label: 'Anonymous Check-in' },
      { href: '/intelligence', label: 'AI Intelligence' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { href: '/solutions', label: 'Universities' },
      { href: '/solutions', label: 'Companies & HR' },
      { href: '/solutions', label: 'Cities & NGOs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'Vision' },
      { href: '/contact', label: 'Partnerships' },
      { href: '/contact', label: 'Pilot programs' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-7 items-center justify-center">
                <span className="absolute size-7 rounded-full bg-primary/25 animate-breathe" />
                <span className="size-3 rounded-full bg-primary" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight">
                Emotional Weather
              </span>
            </div>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
              The emotional pulse layer for society. Privacy-first emotional
              climate intelligence for cities, campuses, and communities.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Anonymous by design. Built for collective wellbeing.
            </p>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-medium text-foreground">{g.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Emotional Weather Map. A new layer of emotional infrastructure.</p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="hover:text-foreground">Privacy philosophy</Link>
            <Link href="/about" className="hover:text-foreground">Ethics</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
