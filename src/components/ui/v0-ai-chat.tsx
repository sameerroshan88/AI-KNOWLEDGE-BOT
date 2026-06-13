"use client"

import { useEffect, useRef, useCallback } from "react"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  ArrowUpIcon,
  FileUp,
  Paperclip,
} from "lucide-react"

interface UseAutoResizeTextareaProps {
  minHeight: number
  maxHeight?: number
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current
      if (!textarea) return

      if (reset) {
        textarea.style.height = `${minHeight}px`
        return
      }

      textarea.style.height = `${minHeight}px`

      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      )

      textarea.style.height = `${newHeight}px`
    },
    [minHeight, maxHeight]
  )

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${minHeight}px`
    }
  }, [minHeight])

  useEffect(() => {
    const handleResize = () => adjustHeight()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

export function ChatPdfHero() {
  const [value, setValue] = useState("")
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        setValue("")
        adjustHeight(true)
      }
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
          Chat with any PDF
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Join millions of people using AI Knowledge Base Bot. Students use it to understand
          textbook problems. Researchers use it to get the gist of papers.
          Professionals use it to review legal and financial documents.
        </p>
      </div>

      <div className="w-full">
        <div className="relative bg-white rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors shadow-sm">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 text-sm text-muted-foreground">
            <FileUp className="w-4 h-4 text-primary" />
            <span>Drop your PDF here or click to upload</span>
          </div>
          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                adjustHeight()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your PDF..."
              className={cn(
                "w-full px-4 py-3",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-foreground text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground placeholder:text-sm",
                "min-h-[60px]"
              )}
              style={{
                overflow: "hidden",
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 border-t border-border">
            <button
              type="button"
              className="group p-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-1"
            >
              <Paperclip className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground hidden group-hover:inline transition-opacity">
                Attach PDF
              </span>
            </button>
            <button
              type="button"
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                value.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <ArrowUpIcon className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started — it&apos;s free
          </a>
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Learn more
          </a>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          No credit card required · Free forever for basic use
        </p>
      </div>
    </div>
  )
}
