export function StatsStrip() {
  const stats = [
    { value: "2", label: "Organisations Integrated" },
    { value: "RAG-Powered", label: "AI Architecture" },
    { value: "24×7", label: "Always Available" },
  ]

  return (
    <section className="py-12 bg-background border-y border-border">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
