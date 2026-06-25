"use client"

import { useState } from "react"
import { X, MessageCircle, ShieldCheck, FileText } from "lucide-react"
import { FileUploadZone } from "./FileUploadZone"

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: File) => void
}

export function NewChatModal({ isOpen, onClose, onFileSelect }: NewChatModalProps) {
  const [activeTab, setActiveTab] = useState<"Chat" | "SOP" | "Policy">("Chat")
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal box */}
      <div
        className="relative z-10 w-full max-w-[720px] bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top row: chat label + close ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("Chat")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                activeTab === "Chat" ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/8"
              }`}
            >
              <MessageCircle size={14} />
              Chat
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SOP")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                activeTab === "SOP" ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/8"
              }`}
            >
              <ShieldCheck size={14} />
              SOP
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("Policy")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                activeTab === "Policy" ? "bg-white text-black" : "text-white/50 hover:text-white hover:bg-white/8"
              }`}
            >
              <FileText size={14} />
              Policy
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-white/40 hover:text-white transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Headline ── */}
        <p className="px-6 pb-5 text-center text-xl font-bold text-white tracking-tight">
          Chat with any 📄 file, 🎥 video or 🔗 website
        </p>

        {/* ── Two panels ── */}
        <div className="flex gap-3 px-6 pb-6">
          {/* Left: drop zone */}
          <div className="flex-1">
            <FileUploadZone onFileSelect={file => { onFileSelect(file); onClose() }} />
          </div>

          {/* Right: text / paste input */}
          <div className="flex-1 flex flex-col gap-3 rounded-xl border border-white/15 bg-white/3 p-4 min-h-[160px]">
            <textarea
              rows={5}
              placeholder="Ask to start a chat"
              className="flex-1 w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 outline-none leading-relaxed"
            />
            {/* Keyboard shortcut hint */}
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <kbd className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-white/20 bg-white/8 text-white/60 font-mono text-[11px] font-medium">
                CTRL
              </kbd>
              <span className="text-white/30">+</span>
              <kbd className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-white/20 bg-white/8 text-white/60 font-mono text-[11px] font-medium">
                V
              </kbd>
              <span>to paste text or links</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Plus } from "lucide-react"

interface NewButtonProps {
  onClick: () => void
}

export function NewButton({ onClick }: NewButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 py-1.5 text-xs font-semibold text-[#0f172a] shadow-sm shadow-black/10 transition hover:bg-slate-100"
    >
      <Plus size={14} />
      New
    </button>
  )
}
