import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FaqItem {
  id: string
  question: string
  answer: string
}

interface Faq3Props {
  heading: string
  description: string
  items?: FaqItem[]
}

const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    question: "Is AI Knowledge Base Bot free?",
    answer:
      "Yes! AI Knowledge Base Bot offers a free plan that lets you upload 2 PDFs per day with up to 120 pages each. No credit card is required to get started.",
  },
  {
    id: "faq-2",
    question: "How does AI Knowledge Base Bot work?",
    answer:
      "Upload any PDF, and AI Knowledge Base Bot uses AI to read and understand the document. You can then ask questions in plain English and get instant answers with citations pointing to the exact page and paragraph.",
  },
  {
    id: "faq-3",
    question: "What types of PDFs can I upload?",
    answer:
      "AI Knowledge Base Bot works with textbooks, research papers, contracts, financial reports, lecture notes, and virtually any text-based PDF document up to 50 MB on the free plan.",
  },
  {
    id: "faq-4",
    question: "Is my data secure?",
    answer:
      "Your documents are encrypted and never shared with third parties. You control your data and can delete your files at any time.",
  },
  {
    id: "faq-5",
    question: "Can I use AI Knowledge Base Bot on mobile?",
    answer:
      "Yes, AI Knowledge Base Bot works in any modern web browser on desktop, tablet, and mobile devices — no app download required.",
  },
  {
    id: "faq-6",
    question: "What languages are supported?",
    answer:
      "Upload PDFs in any language and ask questions in your own language. AI Knowledge Base Bot handles translation automatically.",
  },
]

const Faq3 = ({
  heading = "Frequently asked questions",
  description = "Find answers to common questions about AI Knowledge Base Bot. Can't find what you're looking for? Contact our support team.",
  items = faqItems,
}: Faq3Props) => {
  return (
    <section id="faq" className="py-24 bg-card">
      <div id="support" className="container mx-auto px-4 max-w-6xl space-y-16 scroll-mt-28">
        <div className="mx-auto flex max-w-3xl flex-col text-left md:text-center">
          <h2 className="mb-3 text-3xl font-semibold md:mb-4 lg:mb-6 lg:text-4xl">
            {heading}
          </h2>
          <p className="text-muted-foreground lg:text-lg">{description}</p>
        </div>
        <Accordion
          type="single"
          collapsible
          className="mx-auto w-full lg:max-w-3xl"
        >
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="w-full text-left font-medium sm:py-1 lg:py-2 lg:text-lg transition-opacity duration-200 hover:no-underline hover:opacity-60">
                <span className="pointer-events-none select-none">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="sm:mb-1 lg:mb-2">
                <div className="text-muted-foreground lg:text-lg">
                  {item.answer}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

export { Faq3 }
