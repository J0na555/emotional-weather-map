import type { Metadata } from 'next'
import { CheckInFlow } from '@/components/check-in/check-in-flow'

export const metadata: Metadata = {
  title: 'Anonymous Check-in — Emotional Weather Map',
  description:
    'A calm, anonymous emotional check-in in under 15 seconds. Followed by a gentle healing moment of breathing and grounding sound.',
}

export default function CheckInPage() {
  return (
    <main className="ew-grain min-h-[calc(100vh-4rem)]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto mb-10 max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            Anonymous · under 15 seconds
          </span>
          <h1 className="mt-5 text-balance font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            A quiet moment to share how you feel
          </h1>
        </div>
        <CheckInFlow />
      </div>
    </main>
  )
}
