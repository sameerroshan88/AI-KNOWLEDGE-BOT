"use client"

import { useEffect, useState } from "react"
import { Folder, MessageCircle, PanelLeft, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export const SIDEBAR_BOUNDARY_ID = "sidebar-boundary"

function SidebarContent() {
  return (
    <>
      <div className="flex items-center justify-between gap-2 px-4 py-4 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-[#7c5cfc] flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M6 4h12a2 2 0 012 2v14l-4-3-4 3-4-3-4 3V6a2 2 0 012-2z" />
            </svg>
          </div>
          <span className="font-semibold text-foreground text-sm truncate">AI Knowledge Base Bot</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            className="p-1.5 rounded-md text-muted-foreground hover:bg-white/80 hover:text-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-foreground">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            Chats
          </div>
          <button
            type="button"
            className="mt-1 w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/60"
          >
            + Start your first chat
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-foreground">
            <Folder className="w-4 h-4 text-muted-foreground" />
            Folders
          </div>
          <button
            type="button"
            className="mt-1 w-full text-left px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/60"
          >
            + New folder
          </button>
        </div>
      </nav>

      <div className="shrink-0 px-4 py-4 border-t border-border/60">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xs font-semibold text-primary-foreground">U</span>
        </div>
      </div>
    </>
  )
}

export function HeroSidebar() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const updateVisibility = () => {
      const boundary = document.getElementById(SIDEBAR_BOUNDARY_ID)
      if (!boundary) {
        setVisible(true)
        return
      }

      const rect = boundary.getBoundingClientRect()
      setVisible(rect.bottom > 0)
    }

    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })
    window.addEventListener("resize", updateVisibility)

    return () => {
      window.removeEventListener("scroll", updateVisibility)
      window.removeEventListener("resize", updateVisibility)
    }
  }, [])

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-[#f3f3f4] transition-opacity duration-200 lg:flex",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <SidebarContent />
    </aside>
  )
}
