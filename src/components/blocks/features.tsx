"use client"

import {
  Zap,
  Bookmark,
  Globe,
  Files,
  Code,
  Shield,
} from "lucide-react"
import dynamic from "next/dynamic"

const RadialOrbitalTimeline = dynamic(
  () => import("@/components/ui/radial-orbital-timeline"),
  { ssr: false }
)

const timelineData = [
  {
    id: 1,
    title: "Instant Answers",
    date: "Real-time",
    content: "Ask any question about your PDF and get a clear, sourced answer immediately. No more manual searching.",
    category: "Core",
    icon: Zap,
    relatedIds: [2, 6],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Cited Sources",
    date: "Verification",
    content: "Every answer links back to the exact page and paragraph in the original document — so you can verify at a glance.",
    category: "Quality",
    icon: Bookmark,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 3,
    title: "Any Language",
    date: "Global",
    content: "Upload PDFs in any language and ask questions in your own language. AI Knowledge Base Bot handles translation automatically.",
    category: "Localization",
    icon: Globe,
    relatedIds: [2, 4],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 4,
    title: "Multiple PDFs",
    date: "Pro Feature",
    content: "Compare contracts, merge research notes, or cross-reference documents — all in one conversation.",
    category: "Multi-doc",
    icon: Files,
    relatedIds: [3, 5],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 5,
    title: "Developer API",
    date: "Integration",
    content: "Integrate AI Knowledge Base Bot's document Q&A capabilities directly into your own apps via a clean REST API.",
    category: "Integration",
    icon: Code,
    relatedIds: [4, 6],
    status: "in-progress" as const,
    energy: 60,
  },
  {
    id: 6,
    title: "Privacy/Security",
    date: "Encryption",
    content: "Files are encrypted and never shared. You control your data and private configuration.",
    category: "Security",
    icon: Shield,
    relatedIds: [5, 1],
    status: "completed" as const,
    energy: 100,
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="h-screen scroll-mt-0 bg-black overflow-visible border-t-0 flex flex-col"
    >
      <div className="container mx-auto px-4 max-w-6xl text-center relative z-20 pt-6 pb-0 flex-shrink-0">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Everything you need to understand any PDF
        </h2>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto mb-3">
          Interactive features built for students, researchers, and professionals.
        </p>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/15 animate-pulse">
          <Zap size={12} className="text-teal-400" />
          Click on orbital nodes to explore details & connections
        </span>
      </div>
      <div className="w-full flex-1 relative pb-6">
        <RadialOrbitalTimeline timelineData={timelineData} />
      </div>
    </section>
  )
}

