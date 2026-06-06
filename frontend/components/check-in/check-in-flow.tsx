'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Pause, Play, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/button-link'
import { EMOTION_COLORS } from '@/components/emotion-map'
import {
  formatCooldown,
  getCheckInToken,
  localCooldownSeconds,
} from '@/lib/check-in-token'
import {
  areaLabel,
  CheckInCooldownError,
  fetchCheckInCooldown,
  fetchSimilarCount,
  mapLocationToArea,
  submitCheckIn,
} from '@/lib/emotional-data'
import { isSupabaseConfigured } from '@/lib/supabase'

const EMOTIONS = [
  { key: 'calm', label: 'Calm', color: EMOTION_COLORS.calm },
  { key: 'hopeful', label: 'Hopeful', color: EMOTION_COLORS.warm },
  { key: 'energized', label: 'Energized', color: EMOTION_COLORS.energy },
  { key: 'tired', label: 'Tired', color: EMOTION_COLORS.amber },
  { key: 'anxious', label: 'Anxious', color: EMOTION_COLORS.stress },
  { key: 'low', label: 'Low', color: 'oklch(0.55 0.08 280)' },
]

function Slider({
  label,
  value,
  onChange,
  color,
  low,
  high,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  color: string
  low: string
  high: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm tabular-nums text-muted-foreground">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:shadow"
        style={{
          background: `linear-gradient(90deg, ${color} ${value}%, oklch(0.9 0.012 90) ${value}%)`,
        }}
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

function BreathingHealing() {
  const [playing, setPlaying] = useState(false)
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')
  const audioRef = useRef<{
    ctx: AudioContext
    osc: OscillatorNode
    gain: GainNode
  } | null>(null)

  useEffect(() => {
    const phases: { name: 'in' | 'hold' | 'out'; ms: number }[] = [
      { name: 'in', ms: 4000 },
      { name: 'hold', ms: 4000 },
      { name: 'out', ms: 6000 },
    ]
    let idx = 0
    setPhase('in')
    const tick = () => {
      idx = (idx + 1) % phases.length
      setPhase(phases[idx].name)
    }
    const id = setInterval(tick, phases[0].ms)
    return () => clearInterval(id)
  }, [])

  function toggleAudio() {
    if (playing) {
      audioRef.current?.osc.stop()
      audioRef.current?.ctx.close()
      audioRef.current = null
      setPlaying(false)
      return
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 110
    gain.gain.value = 0.04
    // gentle low-pass via second oscillator detune for warmth
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    audioRef.current = { ctx, osc, gain }
    setPlaying(true)
  }

  useEffect(() => {
    return () => {
      audioRef.current?.osc.stop()
      audioRef.current?.ctx.close()
    }
  }, [])

  const phaseLabel =
    phase === 'in' ? 'Breathe in' : phase === 'hold' ? 'Hold' : 'Breathe out'

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex h-64 w-full items-center justify-center">
        <span className="absolute size-44 rounded-full bg-primary/10 animate-pulse-ring" />
        <span
          className={cn(
            'flex size-40 items-center justify-center rounded-full transition-transform duration-[4000ms] ease-in-out',
            phase === 'in' && 'scale-110',
            phase === 'hold' && 'scale-110',
            phase === 'out' && 'scale-90',
          )}
          style={{
            background: `radial-gradient(circle, color-mix(in oklab, ${EMOTION_COLORS.calm} 35%, white), color-mix(in oklab, ${EMOTION_COLORS.energy} 25%, white))`,
          }}
        >
          <span className="font-serif text-2xl text-foreground/80">
            {phaseLabel}
          </span>
        </span>
      </div>

      <Button
        variant="outline"
        onClick={toggleAudio}
        className="mt-4 rounded-full border-border bg-card"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        {playing ? 'Pause grounding sound' : 'Play grounding sound'}
      </Button>
    </div>
  )
}

export function CheckInFlow() {
  const [step, setStep] = useState(0)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [stress, setStress] = useState(40)
  const [energy, setEnergy] = useState(60)
  const [sleep, setSleep] = useState(55)
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [similarCount, setSimilarCount] = useState<number | null>(null)
  const [submittedArea, setSubmittedArea] = useState<string>('Lideta')
  const [isOpen, setIsOpen] = useState(false)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const total = 4
  const canNext = step !== 0 || emotion !== null
  const onCooldown = cooldownSeconds > 0

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    let cancelled = false

    async function refreshCooldown() {
      const local = localCooldownSeconds()
      let server = 0
      if (getCheckInToken()) {
        try {
          server = await fetchCheckInCooldown()
        } catch {
          server = local
        }
      }
      if (!cancelled) setCooldownSeconds(Math.max(local, server))
    }

    refreshCooldown()
    const id = setInterval(refreshCooldown, 30_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [step])

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const id = setInterval(() => {
      setCooldownSeconds((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [cooldownSeconds > 0])

  function reset() {
    setStep(0)
    setEmotion(null)
    setStress(40)
    setEnergy(60)
    setSleep(55)
    setLocation('')
    setSubmitting(false)
    setSubmitError(null)
    setSimilarCount(null)
    setSubmittedArea('Lideta')
    setIsOpen(false)
  }

  async function handleSubmit() {
    if (!emotion) return
    const area = mapLocationToArea(location)
    const displayLocation = (location === 'Prefer not to say' || !location) ? 'your community' : location
    setSubmittedArea(displayLocation)
    setSubmitting(true)
    setSubmitError(null)

    // Save to localStorage for map page use
    try {
      localStorage.setItem(
        'last_checkin',
        JSON.stringify({
          location,
          emotion,
          stress,
          energy,
          sleep,
          timestamp: Date.now(),
        })
      )
    } catch (e) {
      console.error('Failed to save check-in locally:', e)
    }

    if (!isSupabaseConfigured()) {
      setSubmitting(false)
      setStep(4)
      return
    }

    try {
      await submitCheckIn({ area, emotion, stress, energy, sleep })
      const count = await fetchSimilarCount(area, emotion)
      setSimilarCount(count)
      setCooldownSeconds(60 * 60)
      setStep(4)
    } catch (err) {
      if (err instanceof CheckInCooldownError) {
        setCooldownSeconds(err.secondsRemaining)
        setSubmitError(
          `You can check in again in ${formatCooldown(err.secondsRemaining)}.`,
        )
        return
      }
      setSubmitError('Could not save your check-in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {onCooldown && step < 4 && (
        <div className="mb-4 rounded-2xl border border-border/70 bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
          You checked in recently. You can share again in{' '}
          <span className="font-medium text-foreground">
            {formatCooldown(cooldownSeconds)}
          </span>
          .
        </div>
      )}

      {/* progress */}
      {step < total && (
        <div className="mb-8 flex items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                i <= step ? 'bg-primary' : 'bg-secondary',
              )}
            />
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-border/70 bg-card p-7 sm:p-10">
        {step === 0 && (
          <div className="animate-rise">
            <h2 className="font-serif text-3xl text-foreground">
              How are you feeling right now?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no wrong answers. Pick what feels closest.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {EMOTIONS.map((e) => (
                <button
                  key={e.key}
                  onClick={() => setEmotion(e.key)}
                  className={cn(
                    'flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all',
                    emotion === e.key
                      ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border/70 hover:bg-secondary/60',
                  )}
                >
                  <span
                    className="size-9 rounded-full"
                    style={{ background: e.color }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {e.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-rise space-y-8">
            <div>
              <h2 className="font-serif text-3xl text-foreground">
                A few gentle sliders
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Slide to wherever feels true. This takes seconds.
              </p>
            </div>
            <Slider
              label="Stress"
              value={stress}
              onChange={setStress}
              color={EMOTION_COLORS.stress}
              low="At ease"
              high="Overwhelmed"
            />
            <Slider
              label="Energy"
              value={energy}
              onChange={setEnergy}
              color={EMOTION_COLORS.energy}
              low="Drained"
              high="Vibrant"
            />
            <Slider
              label="Sleep quality"
              value={sleep}
              onChange={setSleep}
              color={EMOTION_COLORS.calm}
              low="Restless"
              high="Rested"
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-rise relative" ref={autocompleteRef}>
            <h2 className="font-serif text-3xl text-foreground">
              Add a location?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground mb-6">
              Search or type a general area within Addis Ababa.
            </p>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value)
                  setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Type your area (e.g. Bole, Lideta...)"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/30"
              />
              {isOpen && (
                <div className="absolute left-0 right-0 mt-2 z-10 rounded-2xl border border-border/70 bg-card p-2 shadow-lg max-h-[220px] overflow-y-auto">
                  {(() => {
                    const filtered = [
                      'Bole',
                      'Lideta',
                      'Arada',
                      'Kirkos',
                      'Yeka',
                      'Nifas Silk–Lafto',
                      'Kolfe Keranio',
                      'Gullele',
                      'Prefer not to say',
                    ].filter((loc) =>
                      loc.toLowerCase().includes(location.toLowerCase())
                    )
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                          No matching areas found
                        </div>
                      )
                    }
                    
                    return filtered.map((loc) => {
                      const isSelected = location.toLowerCase() === loc.toLowerCase()
                      return (
                        <button
                          key={loc}
                          onClick={() => {
                            setLocation(loc)
                            setIsOpen(false)
                          }}
                          className={cn(
                            'w-full text-left rounded-xl px-4 py-2.5 text-sm transition-all cursor-pointer flex items-center justify-between',
                            isSelected
                              ? 'bg-primary/10 text-foreground font-semibold'
                              : 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <span>{loc}</span>
                          {isSelected && <span className="size-2 rounded-full bg-primary" />}
                        </button>
                      )
                    })
                  })()}
                </div>
              )}
            </div>
            <p className="mt-6 text-xs text-muted-foreground text-center italic">
              “We only collect your general area. Your exact location is never stored or displayed.”
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="animate-rise text-center">
            <h2 className="font-serif text-3xl text-foreground">
              Ready when you are
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your check-in is anonymous and adds to the collective pulse.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2 text-sm">
              <span className="rounded-full bg-secondary px-3 py-1.5 capitalize text-foreground">
                {emotion}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1.5 text-foreground">
                Stress {stress}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1.5 text-foreground">
                Energy {energy}
              </span>
              <span className="rounded-full bg-secondary px-3 py-1.5 text-foreground">
                Sleep {sleep}
              </span>
              {location && (
                <span className="rounded-full bg-secondary px-3 py-1.5 text-foreground">
                  {location}
                </span>
              )}
            </div>
            {submitError && (
              <p className="mt-4 text-sm text-[oklch(0.64_0.19_25)]">
                {submitError}
              </p>
            )}
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || onCooldown}
              className="mt-8 w-full rounded-full text-base"
            >
              {submitting
                ? 'Saving…'
                : onCooldown
                  ? `Available in ${formatCooldown(cooldownSeconds)}`
                  : 'Submit check-in'}
              <Check className="size-4" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-rise">
            <div className="text-center">
              <p className="text-sm font-medium text-primary">
                Thank you for checking in
              </p>
              <h2 className="mt-2 font-serif text-3xl text-foreground">
                Take a moment for yourself
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Your feeling is now part of your community&apos;s weather. Here
                is a small moment of calm in return.
              </p>
            </div>
            <div className="mt-6">
              <BreathingHealing />
            </div>
            <div className="mt-6 rounded-2xl border border-border/70 bg-secondary/40 p-5 text-center">
              <p className="text-pretty text-sm leading-relaxed text-foreground">
                {similarCount != null && similarCount > 0 ? (
                  <>
                    &ldquo;You&apos;re not alone. {similarCount} people in{' '}
                    {submittedArea} felt similarly in the last 24 hours.&rdquo;
                  </>
                ) : (
                  <>
                    &ldquo;Your check-in is part of {submittedArea}&apos;s
                    emotional weather. Thank you for adding your voice.&rdquo;
                  </>
                )}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={reset}
                disabled={onCooldown}
                className="flex-1 rounded-full border-border bg-card"
              >
                <RotateCcw className="size-4" />
                {onCooldown
                  ? `Again in ${formatCooldown(cooldownSeconds)}`
                  : 'Check in again'}
              </Button>
              <ButtonLink href="/map" className="flex-1 rounded-full">
                See your city&apos;s map
              </ButtonLink>
            </div>
          </div>
        )}

        {/* nav */}
        {step < 3 && (
          <div className="mt-9 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-full text-muted-foreground disabled:opacity-0"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="rounded-full"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
