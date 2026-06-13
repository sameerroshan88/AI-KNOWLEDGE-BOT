import { SiteNav } from "@/components/blocks/site-nav"
import { HeroSection } from "@/components/blocks/hero-section"
import { StatsStrip } from "@/components/blocks/stats-strip"
import { TrustedBy } from "@/components/blocks/trusted-by"
import { HowItWorks } from "@/components/blocks/how-it-works"
import { Features } from "@/components/blocks/features"
import { UseCases } from "@/components/blocks/use-cases"
import { Faq3 } from "@/components/ui/faq3"
import { CtaBanner } from "@/components/blocks/cta-banner"
import { CinematicFooter } from "@/components/ui/motion-footer"

export default function Home() {
  return (
    <div className="relative w-full bg-background min-h-screen">
      <SiteNav />
      <div className="fixed top-6 right-6 z-50 hidden md:block">
        <a
          href="#hero"
          className="inline-flex items-center justify-center rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 shadow-md hover:shadow-lg transition-all duration-200"
        >
          Try AIKB
        </a>
      </div>

      <main className="relative z-10 w-full">
        <HeroSection />
        <StatsStrip />
        <TrustedBy />
        <HowItWorks />
        <Features />
        <UseCases />
        <Faq3
          heading="Frequently asked questions"
          description="Find answers to common questions about AI Knowledge Base Bot. Can't find what you're looking for? Contact our support team."
        />

        {/* Full-width sections — no sidebar gap */}
        <CtaBanner />
      </main>

      <CinematicFooter />
    </div>
  )
}
