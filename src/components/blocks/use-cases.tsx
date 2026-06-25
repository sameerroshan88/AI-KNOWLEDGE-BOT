const useCases = [
  {
    emoji: "🎓",
    title: "Students",
    description:
      "Get instant answers about admissions, fees, hostel details, exam rules, and the academic calendar — without calling the admin office.",
  },
  {
    emoji: "🔬",
    title: "Researchers",
    description:
      "Query across multiple policy documents, guidelines, and research papers in seconds. Extract key information without reading every page.",
  },
  {
    emoji: "💼",
    title: "Professionals",
    description:
      "Instantly access company SOPs, service details, pricing, and technical support answers — without waiting for the support team.",
  },
]

export function UseCases() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
          Built for everyone who reads PDFs
        </h2>
        <p className="text-muted-foreground text-center text-lg mb-12 max-w-2xl mx-auto">
          Whether you&apos;re studying, researching, or working — AI Knowledge Base Bot has you covered.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="p-8 rounded-xl border border-border bg-card text-center hover:shadow-md transition-shadow"
            >
              <span className="text-4xl mb-4 block">{useCase.emoji}</span>
              <h3 className="font-semibold text-xl mb-3">{useCase.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
