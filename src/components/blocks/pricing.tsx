import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/ month",
    cta: "Get Started",
    ctaVariant: "outline" as const,
    popular: false,
    features: [
      "2 PDFs per day",
      "120 pages per PDF",
      "50 MB per PDF",
      "3 chats per PDF",
      "Standard processing speed",
    ],
  },
  {
    name: "Plus",
    price: "$5",
    period: "/ month",
    cta: "Start Free Trial",
    ctaVariant: "default" as const,
    popular: true,
    features: [
      "Unlimited PDFs",
      "2,000 pages per PDF",
      "32 MB per PDF",
      "Unlimited questions per PDF",
      "Faster processing",
      "Priority support",
      "GPT-4 powered answers",
    ],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-muted-foreground text-center text-lg mb-12">
          Start free. Upgrade when you need more.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-xl bg-white border shadow-sm ${
                plan.popular
                  ? "border-primary shadow-md ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                  plan.ctaVariant === "default"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border bg-background hover:bg-muted"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-8">
          Save 20% with annual billing
        </p>
      </div>
    </section>
  )
}
