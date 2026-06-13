"use client";

import {
  Globe,
  Copy,
  BookMarked,
  Code,
  Zap,
  Lock,
} from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Any Language",
    date: "Feature",
    content:
      "Support documents in any language. Our AI KB Bot automatically detects and processes multiple language formats for seamless communication across global teams.",
    category: "Languages",
    icon: Globe,
    relatedIds: [2, 3],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Multiple PDFs",
    date: "Feature",
    content:
      "Process multiple PDF documents simultaneously. Upload, index, and query across thousands of documents with lightning-fast retrieval and accurate responses.",
    category: "Documents",
    icon: Copy,
    relatedIds: [1, 4],
    status: "completed" as const,
    energy: 95,
  },
  {
    id: 3,
    title: "Cited Sources",
    date: "Feature",
    content:
      "Every response includes citations and references. Verify information by tracing back to the exact source documents and pages for complete transparency.",
    category: "Transparency",
    icon: BookMarked,
    relatedIds: [1, 5],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 4,
    title: "Developer API",
    date: "Feature",
    content:
      "Build custom applications with our comprehensive REST API. Integrate PDF querying capabilities directly into your platforms and services.",
    category: "Integration",
    icon: Code,
    relatedIds: [2, 6],
    status: "in-progress" as const,
    energy: 80,
  },
  {
    id: 5,
    title: "Instant Answers",
    date: "Feature",
    content:
      "Get results in milliseconds. Our optimized search and retrieval system delivers instant, accurate answers from your document repository.",
    category: "Performance",
    icon: Zap,
    relatedIds: [3, 6],
    status: "in-progress" as const,
    energy: 85,
  },
  {
    id: 6,
    title: "Privacy/Security",
    date: "Feature",
    content:
      "Enterprise-grade security with end-to-end encryption. Your documents are encrypted, secure, and never shared with unauthorized parties.",
    category: "Security",
    icon: Lock,
    relatedIds: [4, 5],
    status: "completed" as const,
    energy: 100,
  },
];

export function TimelineDemo() {
  return <RadialOrbitalTimeline timelineData={timelineData} />;
}

export default TimelineDemo;
