import type { Metadata } from 'next'
import { PageHero } from '@/components/page-hero'
import { MapExperience } from '@/components/map/map-experience'

export const metadata: Metadata = {
  title: 'Emotional Map — Emotional Weather Map',
  description:
    'Explore live emotional heatmaps. Switch between mood, stress, energy, burnout, and sleep layers with live regional summaries.',
}

export default function MapPage() {
  return (
    <main>
      <PageHero
        label="The heart of the product"
        title="The living emotional map"
        description="Watch how a community feels in real time. Toggle emotional layers, read live regional summaries, and follow the forecast — as polished as a premium navigation product."
      />
      <div className="pt-10">
        <MapExperience />
      </div>
    </main>
  )
}
