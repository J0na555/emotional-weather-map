'use client'

import { useState } from 'react'
import { ArrowRight, Calendar, Check, Handshake, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const INTENTS = [
  {
    key: 'demo',
    icon: Calendar,
    title: 'Book a demo',
    body: 'See the live map and dashboards walked through by our team.',
  },
  {
    key: 'pilot',
    icon: Rocket,
    title: 'Apply for a pilot',
    body: 'Bring emotional weather to your campus, company, or city.',
  },
  {
    key: 'partner',
    icon: Handshake,
    title: 'Partnership',
    body: 'Research, civic, or institutional collaboration.',
  },
]

export function ContactConcierge() {
  const [intent, setIntent] = useState('demo')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    org: '',
    message: '',
  })

  const field =
    'w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30'

  if (submitted) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-10 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Check className="size-7 text-primary" />
        </span>
        <h3 className="mt-6 font-serif text-3xl text-foreground">
          We&apos;ll be in touch personally
        </h3>
        <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
          Thank you, {form.name || 'friend'}. A member of our team will reach
          out within one working day to {intent === 'demo' ? 'schedule your demo' : intent === 'pilot' ? 'discuss your pilot' : 'explore a partnership'}.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false)
            setForm({ name: '', email: '', org: '', message: '' })
          }}
          className="mt-7 rounded-full border-border bg-background"
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      {/* intent picker */}
      <div className="flex flex-col gap-3">
        {INTENTS.map((it) => (
          <button
            key={it.key}
            onClick={() => setIntent(it.key)}
            className={cn(
              'flex items-start gap-4 rounded-3xl border p-6 text-left transition-colors',
              intent === it.key
                ? 'border-primary/40 bg-primary/5'
                : 'border-border/70 bg-card hover:bg-secondary/60',
            )}
          >
            <span
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-2xl',
                intent === it.key ? 'bg-primary/15' : 'bg-secondary',
              )}
            >
              <it.icon
                className={cn(
                  'size-5',
                  intent === it.key ? 'text-primary' : 'text-muted-foreground',
                )}
              />
            </span>
            <span>
              <span className="block font-medium text-foreground">
                {it.title}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {it.body}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(true)
        }}
        className="rounded-3xl border border-border/70 bg-card p-7 sm:p-9"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className={cn(field, 'mt-2')}
            />
          </div>
          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Organization
            </label>
            <input
              value={form.org}
              onChange={(e) => setForm({ ...form, org: e.target.value })}
              placeholder="Campus, company, city…"
              className={cn(field, 'mt-2')}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@organization.org"
            className={cn(field, 'mt-2')}
          />
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium text-foreground">
            How can we help?
          </label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us a little about your community and what you're hoping to understand."
            className={cn(field, 'mt-2 resize-none')}
          />
        </div>
        <Button type="submit" size="lg" className="mt-6 w-full rounded-full text-base">
          Send to our team
          <ArrowRight className="size-4" />
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          A real person reads every message. No bots, no sales sequences.
        </p>
      </form>
    </div>
  )
}
