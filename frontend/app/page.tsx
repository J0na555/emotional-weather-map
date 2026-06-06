import { HomeHero } from '@/components/home/home-hero'
import {
  HomeStats,
  HomeProblem,
  HomeFeatures,
  HomeReflections,
  HomeUseCases,
  HomeCTA,
} from '@/components/home/home-sections'

export default function Page() {
  return (
    <main>
      <HomeHero />
      <HomeStats />
      <HomeProblem />
      <HomeFeatures />
      <HomeReflections />
      <HomeUseCases />
      <HomeCTA />
    </main>
  )
}
