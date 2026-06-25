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
    question: "How does AI Knowledge Base Bot work?",
    answer:
      "AIKB uses a RAG (Retrieval-Augmented Generation) approach. Documents are uploaded and indexed into a knowledge base. When a user asks a question, the AI searches for the most relevant information and uses Gemini AI to generate an accurate, document-backed answer.",
  },
  {
    id: "faq-2",
    question: "What types of PDFs can I upload?",
    answer:
      "You can upload PDFs, SOPs (Standard Operating Procedures), policy documents, user manuals, guidelines, and FAQ documents. Admins manage all uploads through a secure document management panel.",
  },
  {
    id: "faq-3",
    question: "Is my data secure?",
    answer:
      "Yes. All user data, documents, and chat history are stored securely with encrypted passwords and role-based access control. Only authorised admins can upload or manage documents.",
  },
  {
    id: "faq-4",
    question: "What languages are supported?",
    answer:
      "AIKB currently supports English, Hindi, and Kannada. Additional regional languages are planned for future versions to serve a wider user base.",
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
