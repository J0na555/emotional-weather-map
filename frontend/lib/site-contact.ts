import { getSupabase } from '@/lib/supabase'

export const PARTNERS_EMAIL =
  process.env.NEXT_PUBLIC_PARTNERS_EMAIL?.trim() ||
  'partners@emotionalweathermap.com'

export type ContactIntent = 'demo' | 'pilot' | 'partner' | 'data'

export type ContactInquiryPayload = {
  intent: ContactIntent
  name: string
  email: string
  organization?: string
  message?: string
}

export function partnersMailto(subject?: string, body?: string): string {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return `mailto:${PARTNERS_EMAIL}${query ? `?${query}` : ''}`
}

export async function submitContactInquiry(
  payload: ContactInquiryPayload,
): Promise<{ ok: true } | { ok: false; reason: 'offline' | 'error'; message?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { ok: false, reason: 'offline' }

  const { error } = await supabase.from('contact_inquiries').insert({
    intent: payload.intent,
    name: payload.name.trim(),
    email: payload.email.trim(),
    organization: payload.organization?.trim() || null,
    message: payload.message?.trim() || null,
  })

  if (error) {
    return { ok: false, reason: 'error', message: error.message }
  }

  return { ok: true }
}
