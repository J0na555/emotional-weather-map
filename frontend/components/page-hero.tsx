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
    <section className="relative overflow-hidden bg-background border-b border-foreground/10 py-16 lg:py-24">
      {/* Subtle ambient light highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--color-secondary),transparent_50%)] opacity-30 pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl animate-rise">
          <SectionLabel className="border-foreground/15 bg-card/65">{label}</SectionLabel>
          <h1 className="mt-6 font-serif text-5xl font-light leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <div className="w-12 h-px bg-muted-foreground/30 mt-6 mb-6" />
          <p className="max-w-2xl text-pretty text-lg sm:text-xl font-light leading-relaxed text-muted-foreground">
            {description}
          </p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  )
}
