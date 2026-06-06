'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ButtonLink } from '@/components/button-link'

const links = [
  { href: '/map', label: 'Emotional Map' },
  { href: '/check-in', label: 'Check-in' },
  { href: '/intelligence', label: 'Forecasts' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/about', label: 'Vision' },
]

export function SiteNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-foreground/10 bg-background/95 shadow-sm backdrop-blur-md py-3'
          : 'border-b border-transparent bg-background/40 backdrop-blur-xs py-5'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={() => setOpen(false)}
        >
          <span className="relative flex size-7 items-center justify-center">
            <span className="absolute size-7 rounded-full bg-primary/20 animate-breathe" />
            <span className="size-3 rounded-full bg-primary transition-transform duration-300 group-hover:scale-125" />
          </span>
          <span className="font-serif text-xl font-normal tracking-tight text-foreground transition-colors duration-300">
            emotional weather <em>map</em>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 relative',
                pathname === l.href
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ButtonLink
            href="/contact"
            variant="ghost"
            className="rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 px-5 py-2"
          >
            Talk to us
          </ButtonLink>
          <ButtonLink
            href="/check-in"
            className="rounded-full text-sm font-medium bg-foreground text-background hover:bg-muted-foreground hover:text-background px-6 py-2 transition-all duration-300 shadow-sm hover:shadow"
          >
            Check in
          </ButtonLink>
        </div>

        <button
          className="inline-flex size-10 items-center justify-center rounded-full text-foreground border border-foreground/15 hover:bg-secondary/30 transition-colors md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-foreground/10 bg-background px-5 pb-6 pt-3 md:hidden animate-rise">
          <div className="flex flex-col gap-1.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-2xl px-4 py-3 text-base font-medium transition-colors',
                  pathname === l.href
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/35'
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="h-px bg-foreground/10 my-2" />
            <ButtonLink
              href="/contact"
              onClick={() => setOpen(false)}
              variant="outline"
              className="rounded-full justify-center py-2.5 text-base border-foreground/30 text-foreground"
            >
              Talk to us
            </ButtonLink>
            <ButtonLink
              href="/check-in"
              onClick={() => setOpen(false)}
              className="rounded-full justify-center py-2.5 text-base bg-foreground text-background"
            >
              Check in
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  )
}
