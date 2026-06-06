import { SectionLabel } from '@/components/section-label'

export function PageHero({
  label,
  title,
  description,
  children,
}: {
  label: string
  title: React.ReactNode
  description: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section className="ew-grain border-b border-border/60">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-3xl animate-rise">
          <SectionLabel>{label}</SectionLabel>
          <h1 className="mt-5 text-balance font-serif text-5xl leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  )
}
