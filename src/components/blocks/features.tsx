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
    title: "Cited Sources",
    date: "Source-backed",
    content:
      "Every answer is pulled directly from your uploaded documents. No hallucinations — just accurate, source-backed responses.",
    category: "Quality",
    icon: Bookmark,
    relatedIds: [3, 6],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 2,
    title: "Any Language",
    date: "Multilingual",
    content:
      "Ask questions in English, Hindi, or Kannada. AIKB understands and responds in the language you prefer.",
    category: "Localization",
    icon: Globe,
    relatedIds: [1, 4],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "Instant Answers",
    date: "24×7",
    content:
      "No waiting for a support team. Get accurate answers from PDFs, SOPs, and policies in seconds — 24×7.",
    category: "Speed",
    icon: Zap,
    relatedIds: [2, 4],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 4,
    title: "Multiple Documents",
    date: "All-in-one",
    content:
      "Upload PDFs, SOPs, manuals, policies, and FAQs all at once. AIKB searches across all of them simultaneously.",
    category: "Multi-doc",
    icon: Files,
    relatedIds: [2, 5],
    status: "in-progress" as const,
    energy: 75,
  },
  {
    id: 5,
    title: "Privacy & Security",
    date: "Protected",
    content:
      "Your documents stay private. Encrypted storage, role-based access, and secure user authentication — always.",
    category: "Security",
    icon: Shield,
    relatedIds: [4, 6],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 6,
    title: "Developer API",
    date: "Built for devs",
    content:
      "Built on FastAPI with LangChain and Gemini AI. Easily integrate AIKB into any website or internal tool via API.",
    category: "Integration",
    icon: Code,
    relatedIds: [3, 5],
    status: "in-progress" as const,
    energy: 60,
  },
]

export function Features() {
  return (
    <section
      id="features"
      className="h-screen scroll-mt-0 bg-black overflow-visible border-t-0 flex flex-col"
    >
      <div className="container mx-auto px-4 max-w-6xl text-center relative z-20 pt-4 pb-0 flex-shrink-0">
        <h2 className="text-2xl md:text-4xl font-normal tracking-tight text-white mb-3">
          Intelligent features built for students, researchers, and professionals
        </h2>
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

