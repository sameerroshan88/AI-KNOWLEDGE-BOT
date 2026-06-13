import { FileUp, MessageCircle, Sparkles } from "lucide-react"

const steps = [
  {
    icon: FileUp,
    title: "Upload your PDF",
    description:
      "Drag and drop any PDF — textbooks, research papers, contracts, or reports.",
  },
  {
    icon: MessageCircle,
    title: "Ask a question",
    description:
      "Type your question in plain English. AI Knowledge Base Bot reads and understands the document.",
  },
  {
    icon: Sparkles,
    title: "Get cited answers",
    description:
      "Receive instant answers with links to the exact page and paragraph in your PDF.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
          How it works
        </h2>
        <p className="text-muted-foreground text-center text-lg mb-12 max-w-2xl mx-auto">
          Three simple steps to understand any document in seconds.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="text-center p-6 rounded-xl border border-border bg-background"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Step {i + 1}
              </span>
              <h3 className="text-lg font-semibold mt-2 mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
