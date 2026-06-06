import { cn } from '@/lib/utils'

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-primary" />
      {children}
    </span>
  )
}
