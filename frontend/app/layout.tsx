import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Instrument_Serif, Geist } from 'next/font/google'
import './globals.css'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const instrumentSerif = Instrument_Serif({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'Emotional Weather Map — The emotional pulse of society',
  description:
    "Don't just track the weather. Track the feeling. Emotional Weather Map visualizes the emotional climate of cities, campuses, and communities through real-time emotional intelligence.",
  generator: 'v0.app',
}

export const viewport = {
  themeColor: '#f3f0e9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${instrumentSerif.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <SiteNav />
        {children}
        <SiteFooter />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
