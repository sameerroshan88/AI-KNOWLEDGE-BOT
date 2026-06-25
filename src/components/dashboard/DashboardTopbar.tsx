"use client"

import { useState } from "react"
import {
  Plus,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  MoreHorizontal,
  FileText,
  Edit2,
  FolderOpen,
  Share2,
  Download,
  RotateCcw,
  Trash2,
  Columns,
  Eye,
  MessageSquare,
  Folder as FolderIcon,
  Pencil
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SUPPORT_EMAILS } from "@/lib/constants"
import { PdfItem } from "./DashboardSidebar"
import { NewButton } from "./NewChatModal"

export interface Folder {
  id: string
  name: string
  pdfIds: string[]
}

interface DashboardTopbarProps {
  onNewChat: () => void
  onOpenSettings: () => void
  onOpenUpgrade: () => void
  onSignOut: () => void
  userName: string
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  activePdf: PdfItem | null
  folders: Folder[]
  onRenameChat: (id: string) => void
  onMoveChat: (id: string, folderId: string | null) => void
  onShareChat: (id: string) => void
  onExportChat: (id: string) => void
  onResetChat: (id: string) => void
  onDeleteChat: (id: string) => void
  viewMode: "split" | "pdf" | "chat"
  onChangeViewMode: (mode: "split" | "pdf" | "chat") => void
  activeFolderId: string | null
  onRenameFolder: (id: string) => void
  onResetFolderChat: (id: string) => void
  onDeleteFolder: (id: string) => void
}

export function DashboardTopbar({
  onNewChat,
  onOpenSettings,
  onOpenUpgrade,
  onSignOut,
  userName,
  isSidebarCollapsed,
  onToggleSidebar,
  activePdf,
  folders,
  onRenameChat,
  onMoveChat,
  onShareChat,
  onExportChat,
  onResetChat,
  onDeleteChat,
  viewMode,
  onChangeViewMode,
  activeFolderId,
  onRenameFolder,
  onResetFolderChat,
  onDeleteFolder,
}: DashboardTopbarProps) {
  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const [isSupportOpen, setIsSupportOpen] = useState(false)

  const handleOpenRawFile = () => {
    if (!activePdf) return
    if (activePdf.fileUrl) {
      window.open(activePdf.fileUrl, "_blank")
    } else {
      // Mock alert for simulated files
      alert(`Opening raw file for "${activePdf.title}" (simulated download/view)`)
    }
  }

  // Helper to render the options dropdown content
  const renderPdfOptionsContent = (pdf: PdfItem) => {
    return (
      <>
        <DropdownMenuItem
          onClick={() => onRenameChat(pdf.id)}
          className="rounded-xl px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
        >
          <Pencil size={14} className="text-[#a0a0a0]" />
          <span>Rename chat</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer flex items-center gap-2">
            <FolderOpen size={14} className="text-[#a0a0a0]" />
            <span>Move to folder</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="rounded-2xl border border-white/10 bg-[#050505] p-2 shadow-2xl min-w-[160px] z-[110]">
            {folders.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[#7c7c7c] cursor-not-allowed select-none">No folders created</div>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={() => onMoveChat(pdf.id, null)}
                  className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer"
                >
                  Uncategorized (None)
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-white/10" />
                {folders.map((f) => (
                  <DropdownMenuItem
                    key={f.id}
                    onClick={() => onMoveChat(pdf.id, f.id)}
                    className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer"
                  >
                    {f.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem
          onClick={() => onShareChat(pdf.id)}
          className="rounded-xl px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
        >
          <Share2 size={14} className="text-[#a0a0a0]" />
          <span>Share chat</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onExportChat(pdf.id)}
          className="rounded-xl px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
        >
          <Download size={14} className="text-[#a0a0a0]" />
          <span>Export chat</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onResetChat(pdf.id)}
          className="rounded-xl px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
        >
          <RotateCcw size={14} className="text-[#a0a0a0]" />
          <span>Reset chat</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-white/10" />

        <DropdownMenuItem
          onClick={() => onDeleteChat(pdf.id)}
          className="rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center gap-2"
        >
          <Trash2 size={14} className="text-red-400" />
          <span>Delete chat</span>
        </DropdownMenuItem>
      </>
    )
  }

  const isAnyWorkspaceActive = !!(activePdf || activeFolderId)

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#1A1A1A] shadow-[0_2px_12px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <div className="relative flex h-[52px] w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#111827] text-[#7C3AED] font-bold">
              A
            </div>
            <div className="text-sm font-semibold text-white select-none">AIKB Bot</div>
          </div>

          {/* Toggle Sidebar Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-[#050505] text-[#94a3b8] transition hover:bg-[#111111] hover:text-white cursor-pointer"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>

          {/* Dashboard Controls */}
          <div className="ml-2 flex items-center gap-2 border-l border-white/10 pl-3">
            <NewButton onClick={onNewChat} />
          </div>
        </div>

        {/* Center Panel (Active PDF or Active Folder Information and Controls) */}
        {activePdf ? (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#050505] border border-white/15 px-3 py-1 rounded-2xl">
            {/* Filename with chevron dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-xl px-2 py-1 hover:bg-white/5 text-xs font-medium text-white transition-all outline-none border border-transparent hover:border-white/10 cursor-pointer">
                  <FileText size={14} className="text-[#7C3AED]" />
                  <span className="max-w-[120px] sm:max-w-[180px] truncate text-left">{activePdf.title}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={8} className="w-56 rounded-3xl border border-white/10 bg-[#050505] p-2 shadow-2xl">
                {renderPdfOptionsContent(activePdf)}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Options trigger (three dots) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  title="Document actions"
                  className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5 text-[#94a3b8] hover:text-white transition cursor-pointer"
                >
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={8} className="w-56 rounded-3xl border border-white/10 bg-[#050505] p-2 shadow-2xl">
                {renderPdfOptionsContent(activePdf)}
              </DropdownMenuContent>
            </DropdownMenu>


          </div>
        ) : activeFolderId ? (() => {
          const folder = folders.find(f => f.id === activeFolderId)
          if (!folder) return null

          const renderFolderOptions = () => (
            <>
              <DropdownMenuItem
                onClick={() => onRenameFolder(folder.id)}
                className="rounded-xl px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
              >
                <Pencil size={14} className="text-[#a0a0a0]" />
                <span>Rename folder</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onResetFolderChat(folder.id)}
                className="rounded-xl px-3 py-2 text-sm text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
              >
                <RotateCcw size={14} className="text-[#a0a0a0]" />
                <span>Reset chat</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-white/10" />

              <DropdownMenuItem
                onClick={() => onDeleteFolder(folder.id)}
                className="rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center gap-2"
              >
                <Trash2 size={14} className="text-red-400" />
                <span>Delete folder</span>
              </DropdownMenuItem>
            </>
          )

          return (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#050505] border border-white/15 px-3 py-1 rounded-2xl">
              {/* Folder name with chevron dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 rounded-xl px-2 py-1 hover:bg-white/5 text-xs font-medium text-white transition-all outline-none border border-transparent hover:border-white/10 cursor-pointer">
                    <FolderIcon size={14} className="text-[#7C3AED]" />
                    <span className="max-w-[120px] sm:max-w-[180px] truncate text-left">{folder.name}</span>
                    <ChevronDown size={12} className="text-[#7c7c7c]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} className="w-56 rounded-3xl border border-white/10 bg-[#050505] p-2 shadow-2xl">
                  {renderFolderOptions()}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Options trigger (three dots) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    title="Folder actions"
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/5 text-[#94a3b8] hover:text-white transition cursor-pointer"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} className="w-56 rounded-3xl border border-white/10 bg-[#050505] p-2 shadow-2xl">
                  {renderFolderOptions()}
                </DropdownMenuContent>
              </DropdownMenu>


            </div>
          )
        })() : null}

        {/* Right Panel */}
        <div className="flex items-center gap-3">
          {/* View-mode toggles — always visible when a workspace is active */}
          {isAnyWorkspaceActive && (
            <div className="flex items-center gap-0.5 rounded-lg bg-[#0D0D0D] p-0.5 border border-white/5">
              <button
                type="button"
                title="Split view (PDF + Chat)"
                onClick={() => onChangeViewMode("split")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "split" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
              >
                <Columns size={13} />
              </button>
              <button
                type="button"
                title="PDF view only"
                onClick={() => onChangeViewMode("pdf")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "pdf" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
              >
                <Eye size={13} />
              </button>
              <button
                type="button"
                title="Chat view only"
                onClick={() => onChangeViewMode("chat")}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "chat" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}
              >
                <MessageSquare size={13} />
              </button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black font-semibold transition hover:ring-2 hover:ring-white/10 cursor-pointer">
                {initials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent sideOffset={8} className="w-60 rounded-3xl border border-white/10 bg-[#050505] p-2 shadow-2xl">
              <DropdownMenuItem onClick={onOpenSettings} className="rounded-xl px-3 py-3 text-sm text-white hover:bg-white/5 cursor-pointer">
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsSupportOpen(true)}
                className="rounded-xl px-3 py-3 text-sm text-white hover:bg-white/5 cursor-pointer"
              >
                Contact support
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2 bg-white/10" />
              <DropdownMenuItem onClick={onSignOut} className="rounded-xl px-3 py-3 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent>
          <DialogTitle className="text-xl font-semibold text-white">Contact support</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-[#A0A0A0]">
            For questions about each organization, please use the email address below.
          </DialogDescription>
          <div className="mt-5 space-y-4">
            {SUPPORT_EMAILS.map((support) => (
              <div key={support.organization} className="rounded-3xl border border-white/10 bg-[#0b0b11] p-4">
                <div className="text-sm font-semibold text-white">{support.organization}</div>
                <a
                  href={`mailto:${support.email}`}
                  className="mt-1 block text-sm text-[#7C3FF5] underline-offset-2 hover:text-white"
                >
                  {support.email}
                </a>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
