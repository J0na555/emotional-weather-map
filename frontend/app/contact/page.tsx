import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { ContactConcierge } from '@/components/contact/contact-concierge'

export const metadata: Metadata = {
  title: 'Partnership & Contact — Emotional Weather Map',
  description:
    'Book a demo, apply for a pilot program, or start a partnership. A concierge-style, personal experience.',
}

export default function ContactPage() {
  return (
    <main>
      <PageHero
        label="Let's talk"
        title="Bring emotional weather to your community"
        description="No generic forms. Tell us about your campus, company, or city and a real member of our team will design the right next step with you."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <ContactConcierge />
      </section>
    </main>
  )
}
