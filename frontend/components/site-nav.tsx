'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ButtonLink } from '@/components/button-link'

const links = [
  { href: '/map', label: 'Emotional Map' },
  { href: '/check-in', label: 'Check-in' },
  { href: '/intelligence', label: 'AI Intelligence' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/about', label: 'Vision' },
]

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="relative flex size-7 items-center justify-center">
            <span className="absolute size-7 rounded-full bg-primary/25 animate-breathe" />
            <span className="size-3 rounded-full bg-primary" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Emotional Weather
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-full px-3.5 py-2 text-sm transition-colors',
                pathname === l.href
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink
            href="/contact"
            variant="ghost"
            className="rounded-full text-sm text-muted-foreground hover:text-foreground"
          >
            Talk to us
          </ButtonLink>
          <ButtonLink href="/check-in" className="rounded-full text-sm">
            Check in
          </ButtonLink>
        </div>

        <button
          className="inline-flex size-9 items-center justify-center rounded-full text-foreground md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border/60 bg-background px-5 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-3 py-3 text-base',
                  pathname === l.href
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {l.label}
              </Link>
            ))}
            <ButtonLink
              href="/check-in"
              onClick={() => setOpen(false)}
              className="mt-3 rounded-full"
            >
              Check in
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  )
}
