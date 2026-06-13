"use client"

import { AppSidebar } from "@/components/blocks/whatsapp-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/blocks/sidebar"
import { MessageCircle, Sparkles } from "lucide-react"

export function ProductDemo() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            See how AI Knowledge Base Bot works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload a document, ask questions, and get instant answers with
            cited sources — all in one simple interface.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-white shadow-lg overflow-hidden min-h-[480px]">
          <SidebarProvider defaultOpen={true} className="min-h-0">
            <AppSidebar />
            <SidebarInset className="min-h-[480px]">
              <div className="flex flex-col h-full min-h-[480px]">
                <div className="border-b border-border px-6 py-4 flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Research Paper.pdf</p>
                    <p className="text-xs text-muted-foreground">
                      24 pages · 3 chats
                    </p>
                  </div>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                      <p className="text-sm">
                        The study found a 34% improvement in comprehension
                        scores when participants used AI-assisted document
                        review.{" "}
                        <span className="text-primary text-xs">
                          (p. 12, ¶ 3)
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-lg">
                      <p className="text-sm">
                        What was the main finding of this research?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                      <p className="text-sm">
                        The researchers concluded that interactive Q&A with PDF
                        documents significantly reduces time spent on manual
                        review.{" "}
                        <span className="text-primary text-xs">
                          (p. 18, ¶ 1)
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border p-4">
                  <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-2">
                    <input
                      type="text"
                      placeholder="Ask a question about your PDF..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      readOnly
                    />
                    <button
                      type="button"
                      className="bg-primary text-primary-foreground rounded-full p-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </div>
    </section>
  )
}
