"use client"

import { useState } from "react"
import {
  MessageSquare,
  Folder as FolderIcon,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  FolderPlus,
  Share2,
  Download,
  RotateCcw,
  Trash2,
  Plus,
  Loader2,
  AlertTriangle
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
import { Folder } from "./DashboardTopbar"

export interface PdfItem {
  id: string
  title: string
  pages: number
  size: string
  file?: File
  fileUrl?: string
  indexingStatus?: 'pending' | 'processing' | 'completed' | 'failed'
  indexingError?: string
}

interface DashboardSidebarProps {
  pdfs: PdfItem[]
  activePdfId: string | null
  onSelectPdf: (id: string) => void
  onUploadPdfClick: () => void
  onSignOut: () => void
  onOpenSettings: () => void
  userName: string
  userEmail: string
  isSidebarCollapsed: boolean
  folders: Folder[]
  onAddFolder: () => void
  onMoveChat: (pdfId: string, folderId: string | null) => void
  onRenameChat: (id: string) => void
  onShareChat: (id: string) => void
  onExportChat: (id: string) => void
  onResetChat: (id: string) => void
  onDeleteChat: (id: string) => void
  onReindexChat?: (id: string) => void
  activeFolderId: string | null
  onSelectFolder: (id: string | null) => void
  onRenameFolder: (id: string) => void
  onResetFolderChat: (id: string) => void
  onDeleteFolder: (id: string) => void
}

export function DashboardSidebar({
  pdfs,
  activePdfId,
  onSelectPdf,
  onUploadPdfClick,
  onSignOut,
  onOpenSettings,
  userName,
  userEmail,
  isSidebarCollapsed,
  folders,
  onAddFolder,
  onMoveChat,
  onRenameChat,
  onShareChat,
  onExportChat,
  onResetChat,
  onDeleteChat,
  onReindexChat,
  activeFolderId,
  onSelectFolder,
  onRenameFolder,
  onResetFolderChat,
  onDeleteFolder,
}: DashboardSidebarProps) {
  // Local state to track which folders are collapsed/expanded
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }))
  }

  const handleCreateFolder = () => {
    onAddFolder()
  }

  // Filter pdfs in folders
  const pdfsInFolders = new Set(folders.flatMap((f) => f.pdfIds))
  const uncategorizedPdfs = pdfs.filter((pdf) => !pdfsInFolders.has(pdf.id))

  const renderPdfItem = (pdf: PdfItem, indented = false) => {
    const isActive = pdf.id === activePdfId
    return (
      <div
        key={pdf.id}
        className={`relative group flex items-center justify-between rounded-lg px-3 py-2 text-left transition select-none ${indented ? "ml-4" : ""} ${isActive
          ? "bg-white/10 text-white font-medium"
          : "text-[#9ca3af] hover:bg-white/5 hover:text-white"
          }`}
      >
        {/* White left indicator bar */}
        {isActive && (
          <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-white" />
        )}
        <button
          type="button"
          disabled={pdf.indexingStatus === 'pending' || pdf.indexingStatus === 'processing'}
          onClick={() => {
            // Find if this PDF belongs to a folder and set it active
            const folder = folders.find(f => f.pdfIds.includes(pdf.id))
            if (folder) {
              onSelectFolder(folder.id)
            } else {
              onSelectFolder(null)
            }
            onSelectPdf(pdf.id)
          }}
          className="flex-1 truncate text-xs text-left outline-none mr-2 flex items-center gap-1.5 disabled:cursor-not-allowed select-none"
        >
          {(pdf.indexingStatus === 'pending' || pdf.indexingStatus === 'processing') ? (
            <Loader2 size={12} className="animate-spin text-purple-500 flex-shrink-0" />
          ) : pdf.indexingStatus === 'failed' ? (
            <span title={pdf.indexingError || "Indexing failed"} className="flex-shrink-0 flex items-center">
              <AlertTriangle size={12} className="text-red-400" />
            </span>
          ) : null}
          <span className="truncate">{pdf.title}</span>
        </button>

        {/* Action dropdown for this chat */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded hover:bg-white/10 text-[#9ca3af] hover:text-white transition outline-none cursor-pointer"
            >
              <MoreHorizontal size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            onClick={(e) => e.stopPropagation()}
            sideOffset={4}
            className="w-52 rounded-3xl border border-white/10 bg-[#050505] p-2 shadow-2xl z-[100]"
          >
            <DropdownMenuItem
              onClick={() => onRenameChat(pdf.id)}
              className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
            >
              <Pencil size={12} className="text-[#a0a0a0]" />
              <span>Rename chat</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2">
                <FolderIcon size={12} className="text-[#a0a0a0]" />
                <span>Move to folder</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="rounded-2xl border border-white/10 bg-[#050505] p-2 shadow-2xl min-w-[170px] z-[110]">
                <DropdownMenuItem
                  onClick={() => onAddFolder()}
                  className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
                >
                  <FolderPlus size={12} className="text-[#a0a0a0]" />
                  <span>Create new folder</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-white/10" />

                <DropdownMenuItem
                  onClick={() => onMoveChat(pdf.id, null)}
                  className="rounded-xl px-3 py-1.5 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
                >
                  <FolderIcon size={12} className="text-neutral-600" />
                  <span>Uncategorized (None)</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-white/10" />

                {folders.length === 0 ? (
                  <div className="px-3 py-2 text-[10px] text-[#7c7c7c] cursor-not-allowed select-none">No folders available</div>
                ) : (
                  folders.map((f) => (
                    <DropdownMenuItem
                      key={f.id}
                      onClick={() => onMoveChat(pdf.id, f.id)}
                      className="rounded-xl px-3 py-1.5 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
                    >
                      <FolderIcon size={12} className="text-[#a0a0a0]" />
                      <span>{f.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              onClick={() => onShareChat(pdf.id)}
              className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
            >
              <Share2 size={12} className="text-[#a0a0a0]" />
              <span>Share chat</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onExportChat(pdf.id)}
              className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
            >
              <Download size={12} className="text-[#a0a0a0]" />
              <span>Export chat</span>
            </DropdownMenuItem>

            {pdf.indexingStatus === 'failed' && onReindexChat && (
              <DropdownMenuItem
                onClick={() => onReindexChat(pdf.id)}
                className="rounded-xl px-3 py-2 text-xs text-purple-400 hover:bg-purple-500/10 cursor-pointer flex items-center gap-2"
              >
                <RotateCcw size={12} className="text-purple-400" />
                <span>Retry indexing</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => onResetChat(pdf.id)}
              className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
            >
              <RotateCcw size={12} className="text-[#a0a0a0]" />
              <span>Reset chat</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-white/10" />

            <DropdownMenuItem
              onClick={() => onDeleteChat(pdf.id)}
              className="rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center gap-2"
            >
              <Trash2 size={12} className="text-red-400" />
              <span>Delete chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <aside
      className={`flex h-[calc(100vh-52px)] flex-col border-r-4 border-transparent hover:border-white bg-[#000000] text-white transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "w-0 opacity-0 overflow-hidden pointer-events-none" : "w-[260px] opacity-100"
        }`}
    >
      <div className="flex h-full flex-col overflow-y-auto px-4 py-6 custom-scrollbar space-y-6">
        {/* Chats Section */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7c7c7c] px-3 mb-2 select-none">
            <MessageSquare size={14} className="text-[#cbd5e1]" />
            <span>Chats</span>
          </div>
          <div className="space-y-1">
            {uncategorizedPdfs.length === 0 ? (
              <p className="text-[11px] text-[#7c7c7c] py-4 px-3 select-none">No active chats</p>
            ) : (
              uncategorizedPdfs.map((pdf) => renderPdfItem(pdf))
            )}
          </div>
        </div>

        {/* Folders Section */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7c7c7c] px-3 mb-2 select-none">
            <FolderIcon size={14} className="text-[#cbd5e1]" />
            <span>Folders</span>
          </div>

          <div className="space-y-1">
            {folders.length === 0 ? (
              <p className="text-[11px] text-[#7c7c7c] py-2 px-3 select-none">No folders created</p>
            ) : (
              folders.map((folder) => {
                const isExpanded = !!expandedFolders[folder.id]
                const folderPdfs = pdfs.filter((pdf) => folder.pdfIds.includes(pdf.id))
                const isFolderActive = folder.id === activeFolderId

                return (
                  <div key={folder.id} className="flex flex-col">
                    {/* Folder Header Container */}
                    <div
                      onClick={() => onSelectFolder(folder.id)}
                      className={`relative group flex items-center justify-between rounded-lg px-3 py-2 text-left transition select-none cursor-pointer ${isFolderActive
                        ? "bg-white/10 text-white font-medium"
                        : "text-[#9ca3af] hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      {isFolderActive && (
                        <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-white" />
                      )}
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        {/* Chevron collapse control */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFolder(folder.id)
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded hover:bg-white/10 text-[#7c7c7c] hover:text-white transition outline-none cursor-pointer flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown size={12} />
                          ) : (
                            <ChevronRight size={12} />
                          )}
                        </button>
                        <FolderIcon size={13} className="text-[#cbd5e1] flex-shrink-0" />
                        <span className="truncate text-xs">{folder.name}</span>
                        <span className="text-[10px] text-[#7c7c7c] flex-shrink-0">({folderPdfs.length})</span>
                      </div>

                      {/* Folder Options Menu Trigger */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded hover:bg-white/10 text-[#9ca3af] hover:text-white transition outline-none cursor-pointer"
                          >
                            <MoreHorizontal size={12} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          onClick={(e) => e.stopPropagation()}
                          sideOffset={4}
                          className="w-52 rounded-3xl border border-white/10 bg-[#050505] p-2 shadow-2xl z-[100]"
                        >
                          <DropdownMenuItem
                            onClick={() => onRenameFolder(folder.id)}
                            className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
                          >
                            <Pencil size={12} className="text-[#a0a0a0]" />
                            <span>Rename folder</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onResetFolderChat(folder.id)}
                            className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
                          >
                            <RotateCcw size={12} className="text-[#a0a0a0]" />
                            <span>Reset chat</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1 bg-white/10" />

                          <DropdownMenuItem
                            onClick={() => onDeleteFolder(folder.id)}
                            className="rounded-xl px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 cursor-pointer flex items-center gap-2"
                          >
                            <Trash2 size={12} className="text-red-400" />
                            <span>Delete folder</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Folder Contents */}
                    {isExpanded && (
                      <div className="space-y-0.5 mt-0.5">
                        {folderPdfs.length === 0 ? (
                          <p className="text-[10px] text-[#7c7c7c] py-1.5 pl-7 select-none">Folder is empty</p>
                        ) : (
                          folderPdfs.map((pdf) => renderPdfItem(pdf, true))
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCreateFolder}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#cbd5e1] hover:text-white transition outline-none cursor-pointer self-start"
            >
              <Plus size={14} />
              <span>New folder</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
