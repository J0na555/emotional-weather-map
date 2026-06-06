'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Calendar,
  Check,
  Database,
  Handshake,
  Mail,
  Rocket,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  PARTNERS_EMAIL,
  partnersMailto,
  submitContactInquiry,
  type ContactIntent,
} from '@/lib/site-contact'

const INTENTS: {
  key: ContactIntent
  icon: typeof Calendar
  title: string
  body: string
}[] = [
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
    key: 'data',
    icon: Database,
    title: 'Request data access',
    body: 'Aggregate reports, exports, or research partnerships — never individual records.',
  },
  {
    key: 'partner',
    icon: Handshake,
    title: 'Partnership',
    body: 'Research, civic, or institutional collaboration.',
  },
]

const INTENT_SUCCESS: Record<ContactIntent, string> = {
  demo: 'schedule your demo',
  pilot: 'discuss your pilot',
  data: 'discuss aggregate data access',
  partner: 'explore a partnership',
}

export function ContactConcierge() {
  const [intent, setIntent] = useState<ContactIntent>('demo')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usedMailto, setUsedMailto] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    org: '',
    message: '',
  })

  const field =
    'w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30'

  function resetForm() {
    setSubmitted(false)
    setError(null)
    setUsedMailto(false)
    setForm({ name: '', email: '', org: '', message: '' })
  }

  function mailtoFallback() {
    const subject = `[${intent}] ${form.org || form.name || 'Institutional inquiry'}`
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.org ? `Organization: ${form.org}` : null,
      '',
      form.message || '(No message provided)',
    ]
      .filter(Boolean)
      .join('\n')
    window.location.href = partnersMailto(subject, body)
    setUsedMailto(true)
    setSubmitted(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = await submitContactInquiry({
      intent,
      name: form.name,
      email: form.email,
      organization: form.org,
      message: form.message,
    })

    setSubmitting(false)

    if (result.ok) {
      setSubmitted(true)
      return
    }

    if (result.reason === 'offline') {
      mailtoFallback()
      return
    }

    setError(
      result.message ??
        'Something went wrong saving your message. Try again or email us directly.',
    )
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-10 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Check className="size-7 text-primary" />
        </span>
        <h3 className="mt-6 font-serif text-3xl text-foreground">
          {usedMailto ? 'Opening your email app' : "We'll be in touch personally"}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
          {usedMailto ? (
            <>
              Supabase is not configured, so we opened a draft to{' '}
              <a
                href={partnersMailto()}
                className="font-medium text-foreground underline underline-offset-2"
              >
                {PARTNERS_EMAIL}
              </a>
              . Send it when ready and we will reply within one working day.
            </>
          ) : (
            <>
              Thank you, {form.name || 'friend'}. A member of our team will reach
              out within one working day to {INTENT_SUCCESS[intent]}.
            </>
          )}
        </p>
        <Button
          variant="outline"
          onClick={resetForm}
          className="mt-7 rounded-full border-border bg-background"
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col gap-3">
        {INTENTS.map((it) => (
          <button
            key={it.key}
            type="button"
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
        <p className="rounded-2xl border border-border/70 bg-secondary/40 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
          Prefer email? Write to{' '}
          <a
            href={partnersMailto('Institutional inquiry')}
            className="font-medium text-foreground underline underline-offset-2"
          >
            {PARTNERS_EMAIL}
          </a>
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
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
            placeholder="Tell us about your community and what you're hoping to understand."
            className={cn(field, 'mt-2 resize-none')}
          />
        </div>
        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}{' '}
            <a
              href={partnersMailto(
                `[${intent}] ${form.org || form.name}`,
                form.message,
              )}
              className="font-medium underline underline-offset-2"
            >
              Email us instead
            </a>
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-6 w-full rounded-full text-base"
        >
          {submitting ? 'Sending…' : 'Send to our team'}
          {!submitting && <ArrowRight className="size-4" />}
        </Button>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-1 text-center text-xs text-muted-foreground">
          <Mail className="size-3.5" />
          A real person reads every message · or{' '}
          <a
            href={partnersMailto()}
            className="font-medium text-foreground underline underline-offset-2"
          >
            {PARTNERS_EMAIL}
          </a>
        </p>
      </form>
    </div>
  )
}
