import { FileUp, MessageCircle, Sparkles } from "lucide-react"

const steps = [
  {
    icon: FileUp,
    title: "Upload your documents",
    description:
      "Admins upload PDFs, SOPs, policies, manuals, or FAQs. The system reads and indexes every page automatically.",
  },
  {
    icon: MessageCircle,
    title: "Ask a question",
    description:
      "Students, customers, or staff type any question in plain English, Hindi, or Kannada. No special commands needed.",
  },
  {
    icon: Sparkles,
    title: "Get cited answers",
    description:
      "The AI finds the most relevant information from your documents and returns an accurate answer — instantly.",
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
