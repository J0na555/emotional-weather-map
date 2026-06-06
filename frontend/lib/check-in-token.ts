const TOKEN_KEY = 'ew_checkin_token'
const LAST_CHECKIN_KEY = 'ew_last_checkin_at'
export const CHECK_IN_COOLDOWN_SECONDS = 60 * 60

export function getCheckInToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

export function recordCheckInTime(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LAST_CHECKIN_KEY, String(Date.now()))
}

export function localCooldownSeconds(): number {
  if (typeof window === 'undefined') return 0
  const raw = localStorage.getItem(LAST_CHECKIN_KEY)
  if (!raw) return 0
  const remaining = CHECK_IN_COOLDOWN_SECONDS - (Date.now() - Number(raw)) / 1000
  return remaining > 0 ? Math.ceil(remaining) : 0
}

export function formatCooldown(seconds: number): string {
  if (seconds <= 0) return ''
  const mins = Math.ceil(seconds / 60)
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  if (remMins === 0) return `${hours} hour${hours === 1 ? '' : 's'}`
  return `${hours}h ${remMins}m`
}
