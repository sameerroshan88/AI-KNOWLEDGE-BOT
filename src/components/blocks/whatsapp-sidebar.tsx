"use client"

import React from "react"
import {
  ChevronUp,
  FileText,
  Menu,
  Plus,
  Settings,
  User2,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/blocks/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface PdfItem {
  id: string
  title: string
  pages: number
  size: string
}

const DEFAULT_MOCK_PDFS: PdfItem[] = [
  { id: "pdf-1", title: "Research Paper.pdf", pages: 24, size: "2.4 MB" },
  { id: "pdf-2", title: "Contract Draft.pdf", pages: 12, size: "1.2 MB" },
  { id: "pdf-3", title: "Textbook Ch.4.pdf", pages: 48, size: "4.8 MB" },
]

interface AppSidebarProps {
  pdfs?: PdfItem[]
  activePdfId?: string | null
  onSelectPdf?: (id: string) => void
  onUploadPdfClick?: () => void
  onSignOut?: () => void
  onOpenSettings?: () => void
  onOpenUpgrade?: () => void
  userName?: string
}

export function AppSidebar({
  pdfs = DEFAULT_MOCK_PDFS,
  activePdfId = "pdf-1",
  onSelectPdf = () => {},
  onUploadPdfClick = () => {},
  onSignOut = () => {},
  onOpenSettings = () => {},
  onOpenUpgrade = () => {},
  userName = "Guest",
}: AppSidebarProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar
      variant="sidebar"
      collapsible="none"
      className="border-r border-border shrink-0 bg-sidebar"
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-4 mb-2">
            <SidebarGroupLabel className="text-sm font-bold text-foreground">My Knowledge Base</SidebarGroupLabel>
            <SidebarMenuButton onClick={toggleSidebar} className="w-8 h-8 rounded-lg md:hidden">
              <Menu size={16} />
            </SidebarMenuButton>
          </div>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {pdfs.map((pdf) => {
                const isActive = pdf.id === activePdfId
                return (
                  <SidebarMenuItem key={pdf.id}>
                    <SidebarMenuButton 
                      isActive={isActive} 
                      onClick={() => onSelectPdf(pdf.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                        isActive 
                          ? "bg-[#6C3FF5]/10 text-[#6C3FF5]" 
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText size={16} className={isActive ? "text-[#6C3FF5]" : "text-muted-foreground"} />
                        <span className="truncate text-left">{pdf.title}</span>
                      </div>
                      <span className="text-[10px] opacity-60 ml-2 shrink-0">{pdf.pages}p</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
              <SidebarMenuItem className="pt-2">
                <SidebarMenuButton 
                  onClick={onUploadPdfClick}
                  className="w-full flex items-center justify-center gap-2 border border-dashed border-[#6C3FF5]/30 hover:border-[#6C3FF5]/60 hover:bg-[#6C3FF5]/5 text-[#6C3FF5] bg-[#6C3FF5]/3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                  <Plus size={16} />
                  <span>Upload PDF</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 p-3 bg-sidebar/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm font-medium"
            >
              <Settings size={16} />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm font-medium">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#6C3FF5] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{userName}</span>
                  </div>
                  <ChevronUp size={16} className="opacity-60 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-52 bg-white text-black border border-border rounded-xl shadow-lg p-1 z-50 animate-in slide-in-from-bottom-2 duration-150"
              >
                <DropdownMenuItem onClick={onOpenSettings} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer text-sm font-medium">
                  <User2 size={16} />
                  <span>Account Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenUpgrade} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#6C3FF5]/10 text-[#6C3FF5] hover:text-[#6C3FF5] cursor-pointer text-sm font-semibold">
                  <Sparkles size={16} className="text-[#6C3FF5]" />
                  <span>Upgrade to Plus</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSignOut} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 cursor-pointer text-sm font-medium">
                  <LogOut size={16} />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
