"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { DashboardSidebar, PdfItem } from "@/components/dashboard/DashboardSidebar"
import { DashboardTopbar, Folder } from "@/components/dashboard/DashboardTopbar"
import { DashboardTabs } from "@/components/dashboard/DashboardTabs"
import { PdfViewer } from "@/components/dashboard/PdfViewer"
import { NewChatModal } from "@/components/dashboard/NewChatModal"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  MessageCircle,
  Sparkles,
  Send,
  Paperclip,
  FileText,
  X,
  Settings,
  User2,
  Mail,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  HelpCircle,
  Presentation,
  BookOpen,
  Folder as FolderIcon,
  MessageSquare,
  ChevronDown
} from "lucide-react"

interface Message {
  id: string
  sender: "user" | "bot"
  text: string
  timestamp: string
  citations?: string[]
}

const DEFAULT_PDFS: PdfItem[] = []

const INITIAL_CHAT_HISTORIES: Record<string, Message[]> = {}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id?: string; email: string; name: string } | null>(null)

  // PDFs are loaded exclusively from Supabase — NOT from localStorage (which caused reappearance after delete)
  const [pdfs, setPdfs] = useState<PdfItem[]>([])

  // Chat messages are loaded from Supabase on demand — NOT from localStorage
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({})

  const [folders, setFolders] = useState<Folder[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aikb_folders")
      if (saved) return JSON.parse(saved)
    }
    return []
  })

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aikb_sidebar_collapsed")
      return saved === "true"
    }
    return false
  })

  const [activePdfId, setActivePdfId] = useState<string | null>(null)
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null)
  const [activeModal, setActiveModal] = useState<"rename_chat" | "rename_folder" | "create_folder" | "share_chat" | "delete_chat" | "delete_folder" | null>(null)
  const [modalTargetId, setModalTargetId] = useState<string | null>(null)
  const [modalInputValue, setModalInputValue] = useState<string>("")
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "info" | "error" }>({ show: false, message: "", type: "success" })

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ show: true, message, type })
  }

  // Auto-dismiss toast effect
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [toast.show])



  const [viewMode, setViewMode] = useState<"split" | "pdf" | "chat">("split")
  const [isFastModel, setIsFastModel] = useState(true)

  // Document binary files (non-serialized runtime cache)
  const [pdfFiles, setPdfFiles] = useState<Record<string, File>>({})

  // New chat modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false)

  // Modals state
  const [showSettings, setShowSettings] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isPlus, setIsPlus] = useState(false)
  const [settingsLang, setSettingsLang] = useState("English")

  // Card input states
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCVC, setCardCVC] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Interactive extras state
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [showSlides, setShowSlides] = useState(false)
  const [currentCardIdx, setCurrentCardIdx] = useState(0)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0)

  // Speech Synthesizer state
  const [speechActiveId, setSpeechActiveId] = useState<string | null>(null)

  // Thumbs likes state
  const [msgLikes, setMsgLikes] = useState<Record<string, "like" | "dislike" | null>>({})

  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState("Chat")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Sync folder structure only to localStorage (pdfs + chat messages come from DB)
  useEffect(() => {
    localStorage.setItem("aikb_folders", JSON.stringify(folders))
  }, [folders])

  // Listen for paste event when in empty/new chat state
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (activePdfId !== null || activeFolderId !== null) return

      const activeEl = document.activeElement
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return
      }

      const pastedText = e.clipboardData?.getData("text")
      if (!pastedText) return

      const title = pastedText.startsWith("http")
        ? pastedText.slice(0, 40)
        : (pastedText.split("\n")[0].slice(0, 30) || "Pasted Text")

      const newId = `pdf-${Date.now()}`
      const newPdf: PdfItem = {
        id: newId,
        title: title.endsWith("...") ? title : `${title}...`,
        pages: 1,
        size: `${(pastedText.length / 1024).toFixed(1)} KB`,
        fileUrl: ""
      }

      setPdfs(prev => [...prev, newPdf])
      setChatHistories(prev => ({
        ...prev,
        [newId]: [
          {
            id: `m-init-${Date.now()}`,
            sender: "bot",
            text: `Successfully created a new chat from your pasted content:\n\n"${pastedText.slice(0, 300)}${pastedText.length > 300 ? "..." : ""}"\n\nAsk me any questions about this content!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]
      }))
      setActivePdfId(newId)
      showToast("Pasted content loaded", "success")
    }

    window.addEventListener("paste", handlePaste)
    return () => {
      window.removeEventListener("paste", handlePaste)
    }
  }, [activePdfId, activeFolderId, settingsLang])

  // Auth redirect check — support Supabase sessions as well as localStorage fallback
  useEffect(() => {
    let mounted = true
    const checkAuth = async () => {
      const sessionUser = localStorage.getItem("user")
      if (sessionUser) {
        if (mounted) setUser(JSON.parse(sessionUser))
        return
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (session && session.user) {
          const u = session.user
          const userObj = {
            id: u.id,
            email: u.email || "",
            name: (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || u.email || "User"
          }
          if (mounted) {
            setUser(userObj)
            try { localStorage.setItem("user", JSON.stringify(userObj)) } catch (e) { /* ignore */ }
          }
          return
        }
        if (mounted) router.push("/")
      } catch (err) {
        if (mounted) router.push("/")
      }
    }

    const authSubscription = supabase.auth.onAuthStateChange((event: string, session: any) => {
      console.log("Auth Event:", event, session)
      if (!session) {
        localStorage.removeItem("user")
        if (mounted) router.push("/")
        return
      }
      if (session.user && mounted) {
        const u = session.user
        const userObj = {
          id: u.id,
          email: u.email || "",
          name: (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || u.email || "User"
        }
        setUser(userObj)
        try { localStorage.setItem("user", JSON.stringify(userObj)) } catch (e) { /* ignore */ }
      }
    })

    checkAuth()
    return () => {
      mounted = false
      if (authSubscription?.data?.subscription?.unsubscribe) {
        authSubscription.data.subscription.unsubscribe()
      }
    }
  }, [router])

  // Fetch user PDFs via API route (uses admin key server-side — works without RLS policies)
  const fetchUserPdfs = async (userId: string) => {
    try {
      console.log('=== LOADING PDFS FROM API ===', userId)
      const res = await fetch(`/api/documents?userId=${encodeURIComponent(userId)}`)
      const json = await res.json()
      if (!res.ok) {
        console.error('[LOAD PDFS] API error:', json.error)
        return
      }
      const dbPdfs: PdfItem[] = (json.data || []).map((doc: any) => ({
        id: doc.id,
        title: doc.filename,
        pages: 1,
        size: 'N/A',
        fileUrl: doc.file_url,
        indexingStatus: doc.indexing_status,
        indexingError: doc.indexing_error
      }))
      console.log('[LOAD PDFS] Loaded', dbPdfs.length, 'documents')
      // REPLACE — not merge — so deleted items don't re-appear
      setPdfs(dbPdfs)
    } catch (err) {
      console.error('[LOAD PDFS] Fetch failed:', err)
    }
  }

  // Poll for document indexing status if any document is pending/processing
  useEffect(() => {
    if (!user?.id) return

    const hasIndexingDocs = pdfs.some(p => p.indexingStatus === 'pending' || p.indexingStatus === 'processing')
    if (!hasIndexingDocs) return

    console.log('[DASHBOARD] Found pending/processing PDFs, setting up status polling...')
    const interval = setInterval(() => {
      fetchUserPdfs(user.id!)
    }, 4000)

    return () => clearInterval(interval)
  }, [pdfs, user?.id])

  const handleReindexChat = async (pdfId: string) => {
    if (!user?.id) return
    console.log('[DASHBOARD] Re-indexing pdf:', pdfId)

    // Set local status to processing immediately for visual feedback
    setPdfs(prevPdfs => prevPdfs.map(p => p.id === pdfId ? { ...p, indexingStatus: 'processing', indexingError: undefined } : p))
    showToast("Re-triggering indexing...", "info")

    try {
      const res = await fetch('/api/documents/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: pdfId,
          userId: user.id
        })
      })

      const result = await res.json()
      if (!res.ok || result.error) {
        showToast(result.error || "Failed to trigger indexing", "error")
        fetchUserPdfs(user.id)
      } else {
        showToast("Indexing task started in background", "success")
        fetchUserPdfs(user.id)
      }
    } catch (err: any) {
      showToast(err.message || "Failed to contact indexing service", "error")
      fetchUserPdfs(user.id)
    }
  }

  // Load chat message history from Supabase for a given document via API route
  // (uses admin key server-side — works without RLS policies)
  const fetchChatHistoryForDoc = async (documentId: string, docTitle?: string) => {
    if (!user?.id) return
    try {
      const res = await fetch(
        `/api/chat/history?userId=${encodeURIComponent(user.id)}&documentId=${encodeURIComponent(documentId)}`
      )
      const json = await res.json()

      if (!res.ok) {
        console.error('[CHAT HISTORY] API error:', json.error)
        return
      }

      const messages: Message[] = []
      if (json.data && json.data.length > 0) {
        // Reconstruct message pairs from DB rows (each row = 1 user msg + 1 bot msg)
        json.data.forEach((row: any) => {
          const timeStr = new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          messages.push({
            id: `m-u-${row.id}`,
            sender: "user",
            text: row.question,
            timestamp: timeStr
          })
          messages.push({
            id: `m-b-${row.id}`,
            sender: "bot",
            text: row.answer,
            timestamp: timeStr,
            citations: []
          })
        })
      } else {
        // No exchanges yet — show a default greeting
        messages.push({
          id: `m-init-${documentId}`,
          sender: "bot",
          text: `"${docTitle || 'Document'}" is ready! Ask me any questions about it.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        })
      }

      setChatHistories(prev => ({ ...prev, [documentId]: messages }))
    } catch (err) {
      console.error('[CHAT HISTORY] Fetch failed:', err)
    }
  }

  // Load user PDFs from Supabase when user becomes available
  useEffect(() => {
    let mounted = true
    if (!user?.id) return
    if (mounted) fetchUserPdfs(user.id)
    return () => { mounted = false }
  }, [user])

  // Lazy-load chat messages from Supabase when a PDF is selected
  // Only fetches if the UI has no messages yet for this doc (avoids overwriting active chats)
  useEffect(() => {
    if (!activePdfId || !user?.id) return
    const hasMessages = (chatHistories[activePdfId]?.length ?? 0) > 0
    if (!hasMessages) {
      const pdf = pdfs.find(p => p.id === activePdfId)
      fetchChatHistoryForDoc(activePdfId, pdf?.title)
    }
  }, [activePdfId, user?.id])

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistories, activePdfId, isTyping])

  if (!user) return null

  const activePdf = pdfs.find(p => p.id === activePdfId) || null
  const currentMessages = activePdfId
    ? (chatHistories[activePdfId] || [])
    : (activeFolderId ? (chatHistories[activeFolderId] || []) : [])

  const handleSelectPdf = (id: string) => {
    setActivePdfId(id)
  }

  const handleSelectFolder = (id: string | null) => {
    setActiveFolderId(id)
    setActivePdfId(null)
  }

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem("aikb_sidebar_collapsed", String(next))
      return next
    })
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const openNewChatModal = () => {
    setActivePdfId(null)
    setActiveFolderId(null)
    setActiveTab("Chat")
    setIsNewChatModalOpen(true)
  }

  const closeNewChatModal = () => {
    setIsNewChatModalOpen(false)
  }

  const handleModalFileSelect = (file: File) => {
    uploadPdfToSupabaseAndLocal(file)
    closeNewChatModal()
  }

  const uploadPdfToSupabaseAndLocal = async (file: File) => {
    const newId = `pdf-${Date.now()}`
    const sizeMB = `${(file.size / (1024 * 1024)).toFixed(1)} MB`

    // Optimistically add PDF to sidebar immediately so the user sees it right away
    setPdfFiles(prev => ({ ...prev, [newId]: file }))
    setPdfs(prev => [...prev, {
      id: newId,
      title: file.name,
      pages: 1,
      size: sizeMB,
      fileUrl: ""   // will be updated once upload completes
    }])
    setChatHistories(prev => ({
      ...prev,
      [newId]: [{
        id: `m-init-${Date.now()}`,
        sender: "bot",
        text: `Uploading "${file.name}"… please wait.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]
    }))
    setActivePdfId(newId)

    try {
      // Get current user
      const userRes = await supabase.auth.getUser()
      const sessionRes = await supabase.auth.getSession()
      const currentUser = userRes?.data?.user || sessionRes?.data?.session?.user

      let pdfUrl = ""

      if (currentUser?.id) {
        // ── Use API route for file upload (handles large files) ──
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('userId', currentUser.id)
          if (currentUser.email) {
            formData.append('userEmail', currentUser.email)
          }

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          const result = await response.json()
          if (response.ok && result.fileUrl && result.documentId) {
            pdfUrl = result.fileUrl
            const realDocId: string = result.documentId
            console.log('[UPLOAD] API success:', { pdfUrl, realDocId })

            // Directly promote the optimistic entry to the real DB document
            // (no re-fetch needed — avoids RLS permission issues with anon key)
            setPdfs(prev => prev.map(p =>
              p.id === newId
                ? { ...p, id: realDocId, title: file.name, fileUrl: pdfUrl }
                : p
            ))
            // Move chat history from temp ID to real document ID
            setChatHistories(prev => {
              const next = { ...prev }
              next[realDocId] = [{
                id: `m-init-${Date.now()}`,
                sender: 'bot' as const,
                text: `“${file.name}” uploaded successfully!\n• Ask me any questions about this document.\n• Your conversation history is saved automatically.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]
              delete next[newId]
              return next
            })
            // Also move the stored File object
            setPdfFiles(prev => {
              const next = { ...prev }
              next[realDocId] = next[newId]
              delete next[newId]
              return next
            })
            setActivePdfId(realDocId)
          } else {
            console.warn('[UPLOAD] API failed:', result.error || 'Unknown error')
          }
        } catch (apiErr: any) {
          console.warn('[UPLOAD] API call failed:', apiErr?.message, '— using local-only mode')
        }
      } else {
        console.warn('[UPLOAD] No authenticated user — local-only mode')
      }

      // Update the PdfItem with the real URL (even if empty, fileObj is in pdfFiles)
      setPdfs(prev => prev.map(p =>
        p.id === newId ? { ...p, fileUrl: pdfUrl, size: sizeMB } : p
      ))

      // Fallback: update placeholder message on the temp ID (only reached if DB refresh didn't run)
      setChatHistories(prev => ({
        ...prev,
        [newId]: [{
          id: `m-init-${Date.now()}`,
          sender: "bot",
          text: `${pdfUrl ? `"${file.name}" uploaded! Your conversation will be saved automatically.` : `"${file.name}" loaded locally. Connect to the internet to save your chat history.`}\n\nAsk me any questions about this document.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]
      }))

      showToast(pdfUrl ? "PDF uploaded & saved" : "PDF loaded (local only)", "success")
    } catch (err: any) {
      console.warn('[UPLOAD] Error (non-fatal):', err?.message)
      // Keep the optimistic entry — viewer will use fileObj
      setChatHistories(prev => ({
        ...prev,
        [newId]: [{
          id: `m-init-${Date.now()}`,
          sender: "bot",
          text: `Loaded "${file.name}" locally. You can chat with it now.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]
      }))
      showToast("PDF loaded (local only)", "success")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    uploadPdfToSupabaseAndLocal(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Only PDF files are supported", "info")
      return
    }
    uploadPdfToSupabaseAndLocal(file)
  }

  // Common messaging sender function — real RAG pipeline via Ollama
  const handleSendQueryText = async (text: string) => {
    const contextId = activePdfId || activeFolderId
    if (!text.trim() || !contextId || isTyping) return

    const userMessageText = text.trim()
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsg: Message = {
      id: `m-u-${Date.now()}`,
      sender: "user",
      text: userMessageText,
      timestamp: timeStr
    }

    setChatHistories(prev => ({
      ...prev,
      [contextId]: [...(prev[contextId] || []), userMsg]
    }))

    setIsTyping(true)

    let botReply = ""
    let citations: string[] = []

    if (activePdfId) {
      // ── Real RAG: embed → pgvector → llama3 via /api/chat/rag ──────────────
      try {
        const userRes = await supabase.auth.getUser()
        const currentUser = userRes?.data?.user

        if (!currentUser) {
          botReply = "⚠️ You must be signed in to chat with documents."
        } else {
          const ragRes = await fetch('/api/chat/rag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question:   userMessageText,
              documentId: activePdfId,
              userId:     currentUser.id,
            }),
          })

          const ragJson = await ragRes.json()

          if (!ragRes.ok || ragJson.error) {
            botReply = `⚠️ ${ragJson.error || 'The AI pipeline returned an error. Please try again.'}`
          } else {
            botReply  = ragJson.answer  || "No answer returned."
            citations = ragJson.citations || []
          }
        }
      } catch (err: any) {
        console.error('[CHAT RAG] Network error:', err)
        botReply = "⚠️ Could not reach the AI pipeline. Make sure Ollama is running locally (run: ollama serve)."
      }
    } else if (activeFolderId) {
      const folder     = folders.find(f => f.id === activeFolderId)
      const folderName = folder ? folder.name : "Folder"
      const filesCount = folder ? folder.pdfIds.length : 0
      botReply = `Folder-level chat is not yet supported. Please select an individual document from the sidebar. The folder "${folderName}" contains ${filesCount} file(s).`
    }

    const botMsg: Message = {
      id: `m-b-${Date.now()}`,
      sender: "bot",
      text: botReply,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      citations
    }

    setChatHistories(prev => ({
      ...prev,
      [contextId]: [...(prev[contextId] || []), botMsg]
    }))

    setIsTyping(false)

    // Persist Q&A to chat_history table via server-side API
    const saveChat = async () => {
      try {
        const userRes = await supabase.auth.getUser()
        const currentUser = userRes?.data?.user
        if (currentUser && activePdfId) {
          await fetch('/api/chat/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId:     currentUser.id,
              question:   userMessageText,
              answer:     botReply,
              documentId: activePdfId
            })
          })
        }
      } catch (err) {
        console.error('[CHAT SAVE] Failed to save to database:', err)
      }
    }
    saveChat()
  }

  const deleteChatHistoryFromDatabase = async (documentId: string) => {
    if (!user?.id) return

    try {
      const response = await fetch('/api/chat/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          documentId
        })
      })

      const result = await response.json()
      if (!response.ok || result.error) {
        console.warn('Chat delete API failed:', result.error || 'Unknown error')
        showToast('Chat removed locally, but failed to delete server history', 'error')
      } else {
        console.log('Deleted chat history from database:', result)
      }
    } catch (err) {
      console.warn('Failed to delete chat history from database:', err)
      showToast('Chat removed locally, but failed to delete server history', 'error')
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return
    const text = inputValue
    setInputValue("")
    handleSendQueryText(text)
  }

  // Sidebar Folders Add Trigger
  const handleAddFolder = () => {
    setModalInputValue("My folder")
    setActiveModal("create_folder")
  }

  // Folder Move
  const handleMoveChat = (pdfId: string, folderId: string | null) => {
    setFolders(prev => prev.map(f => {
      // Clean PDF ID from all folders
      const cleanPdfIds = f.pdfIds.filter(id => id !== pdfId)
      if (f.id === folderId) {
        return { ...f, pdfIds: [...cleanPdfIds, pdfId] }
      }
      return { ...f, pdfIds: cleanPdfIds }
    }))
    showToast("Chat moved to folder", "success")
  }

  // Options Menu: Rename Chat
  const handleRenameChat = (pdfId: string) => {
    const pdf = pdfs.find(p => p.id === pdfId)
    if (!pdf) return
    setModalTargetId(pdfId)
    setModalInputValue(pdf.title)
    setActiveModal("rename_chat")
  }

  // Options Menu: Share Chat
  const handleShareChat = (pdfId: string) => {
    const pdf = pdfs.find(p => p.id === pdfId)
    if (!pdf) return
    setModalTargetId(pdfId)
    setActiveModal("share_chat")
  }

  // Options Menu: Export Chat
  const handleExportChat = (pdfId: string) => {
    const pdf = pdfs.find(p => p.id === pdfId)
    if (!pdf) return
    const messagesList = chatHistories[pdfId] || []

    const transcript = messagesList.map((m) => {
      const role = m.sender === "user" ? "User" : "AIKB Bot"
      return `[${role} - ${m.timestamp}]\n${m.text}`
    }).join("\n\n")

    const blob = new Blob([transcript], { type: "text/plain" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${pdf.title.replace(/\.[^/.]+$/, "")}_chat.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Options Menu: Reset Chat
  const handleResetChat = (pdfId: string) => {
    const pdf = pdfs.find(p => p.id === pdfId)
    if (!pdf) return

    let defaultGreeting = `Successfully indexed "${pdf.title}"! Ask me any questions.`
    if (pdfId === "pdf-1") {
      defaultGreeting = "Hi! I am AIKB, your interactive research assistant. Here is a brief summary of the Research Paper:\n• Investigates cognitive enhancement via interactive vector search chatbots.\n• Employs a double-blind trial with 120 students.\n• Finds a 34% increase in recall speed and 42% decrease in manual search times.\n\nAsk me about the methodologies, results, or specific page citations."
    } else if (pdfId === "pdf-2") {
      defaultGreeting = "Hello! I've scanned the 'Contract Draft.pdf'. Here is a brief summary of the contract:\n• Mutual Non-Disclosure Agreement dated June 20, 2026.\n• Defines rules for disclosing and protecting confidential information.\n• Restricts use for 5 years post-termination, governed by local laws.\n\nWhat specific terms would you like me to find or explain?"
    } else if (pdfId === "pdf-3") {
      defaultGreeting = "Welcome to Chapter 4: Neural Networks. Here is a brief summary of this chapter:\n• Explains the structure and layers of Artificial Neural Networks.\n• Introduces non-linear activations including Sigmoid, Tanh, and ReLU.\n• Details backpropagation and stochastic gradient descent updates.\n\nI can explain backpropagation algorithms, activation functions, and solve the chapter exercises. Let me know what concept you'd like to dive into!"
    }

    setChatHistories(prev => ({
      ...prev,
      [pdfId]: [
        {
          id: `m-init-${Date.now()}`,
          sender: "bot",
          text: defaultGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]
    }))
    showToast("Chat cleared", "success")
  }

  // Options Menu: Delete Chat
  const handleDeleteChat = (pdfId: string) => {
    setModalTargetId(pdfId)
    setActiveModal("delete_chat")
  }

  // Options Menu: Rename Folder
  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId)
    if (!folder) return
    setModalTargetId(folderId)
    setModalInputValue(folder.name)
    setActiveModal("rename_folder")
  }

  // Options Menu: Reset Folder Chat
  const handleResetFolderChat = (folderId: string) => {
    setChatHistories(prev => ({
      ...prev,
      [folderId]: []
    }))
    showToast("Chat cleared", "success")
  }

  // Options Menu: Delete Folder
  const handleDeleteFolder = (folderId: string) => {
    setModalTargetId(folderId)
    setActiveModal("delete_folder")
  }

  const handleRenameChatSubmit = () => {
    if (!modalTargetId || !modalInputValue.trim()) return
    setPdfs(prev => prev.map(p => p.id === modalTargetId ? { ...p, title: modalInputValue.trim() } : p))
    setActiveModal(null)
    setModalTargetId(null)
    showToast("Chat renamed", "success")
  }

  const handleCreateFolderSubmit = () => {
    if (!modalInputValue.trim()) return
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: modalInputValue.trim(),
      pdfIds: []
    }
    setFolders(prev => [...prev, newFolder])
    setActiveModal(null)
    showToast("Folder created", "success")
  }

  const handleRenameFolderSubmit = () => {
    if (!modalTargetId || !modalInputValue.trim()) return
    setFolders(prev => prev.map(f => f.id === modalTargetId ? { ...f, name: modalInputValue.trim() } : f))
    setActiveModal(null)
    setModalTargetId(null)
    showToast("Folder renamed", "success")
  }

  const handleDeleteChatConfirm = async () => {
    if (!modalTargetId) return

    const targetId = modalTargetId

    // Optimistically remove from UI immediately
    setPdfs(prev => prev.filter(p => p.id !== targetId))
    setFolders(prev => prev.map(f => ({ ...f, pdfIds: f.pdfIds.filter(id => id !== targetId) })))
    setChatHistories(prev => {
      const next = { ...prev }
      delete next[targetId]
      return next
    })
    if (activePdfId === targetId) {
      setActivePdfId(null)
    }
    setActiveModal(null)
    setModalTargetId(null)
    showToast("Chat deleted", "success")

    // Always call the full delete API to remove from Supabase Storage + DB
    if (user?.id) {
      try {
        const response = await fetch('/api/chat/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: targetId, userId: user.id })
        })
        const result = await response.json()
        if (!result.success) {
          console.error('Server delete failed:', result.error)
          showToast('Deleted locally, but server delete failed: ' + result.error, 'error')
          // Re-fetch to ensure UI matches DB state
          if (user.id) fetchUserPdfs(user.id)
        } else {
          console.log('[DELETE] Permanently deleted from Supabase:', targetId)
        }
      } catch (err: any) {
        console.error('Delete API call failed:', err)
        showToast('Deleted locally, but server delete failed', 'error')
      }
    }
  }

  const handleDeleteFolderConfirm = () => {
    if (!modalTargetId) return
    setFolders(prev => prev.filter(f => f.id !== modalTargetId))
    if (activeFolderId === modalTargetId) {
      setActiveFolderId(null)
    }
    setActiveModal(null)
    setModalTargetId(null)
    showToast("Folder deleted", "success")
  }

  // Audio Speech Reader
  const handleListenMessage = (msgId: string, text: string) => {
    if (typeof window === "undefined") return

    if (speechActiveId === msgId) {
      window.speechSynthesis.cancel()
      setSpeechActiveId(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/•/g, "")
    const utterance = new SpeechSynthesisUtterance(cleanText)

    utterance.onend = () => setSpeechActiveId(null)
    utterance.onerror = () => setSpeechActiveId(null)

    setSpeechActiveId(msgId)
    window.speechSynthesis.speak(utterance)
  }

  // Message Up/Down Ratings
  const handleLikeMessage = (msgId: string, val: "like" | "dislike") => {
    setMsgLikes(prev => ({
      ...prev,
      [msgId]: prev[msgId] === val ? null : val
    }))
  }

  const handleLogout = async () => {
    try {
      const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.warn("Logout error:", err)
    }

    // Clear ALL local state so deleted chats don't reappear
    setPdfs([])
    setActivePdfId(null)
    setActiveFolderId(null)
    setChatHistories({})

    // Clear all localStorage keys
    localStorage.removeItem("user")
    localStorage.removeItem("aikb_pdfs")
    localStorage.removeItem("aikb_chat_histories")  // legacy key — no longer written but clean up if present
    localStorage.removeItem("aikb_folders")
    localStorage.removeItem("aikb_sidebar_collapsed")
    localStorage.removeItem("currentChat")
    localStorage.removeItem("pdfUrl")

    router.push("/")
  }

  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardNumber || !cardExpiry || !cardCVC) return

    setIsPaying(true)
    setTimeout(() => {
      setIsPaying(false)
      setPaymentSuccess(true)
      setIsPlus(true)
      // Update local storage user details to include Plus
      const updatedUser = { ...user, isPlus: true }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setTimeout(() => {
        setShowUpgrade(false)
        setPaymentSuccess(false)
        setCardNumber("")
        setCardExpiry("")
        setCardCVC("")
      }, 1500)
    }, 2000)
  }

  // dynamic lists for interactive flashcards & slides
  const getFlashcards = () => {
    if (activePdfId === "pdf-1") {
      return [
        { front: "What was the main focus of this research?", back: "The paper evaluates cognitive enhancements using interactive chatbot interfaces for documents." },
        { front: "What was the study's participant count?", back: "120 undergraduate students participated in a dual-blind control test." },
        { front: "What speed improvement did the study find?", back: "Participants isolated target variables 34% faster and reduced manual read times by 42%." }
      ]
    } else if (activePdfId === "pdf-2") {
      return [
        { front: "What type of agreement is this document?", back: "A Mutual Non-Disclosure Agreement (NDA)." },
        { front: "What are the standard payment terms?", back: "Invoices are sent monthly on the 1st, payable Net-30." },
        { front: "What is the duration of confidentiality?", back: "Strict confidentiality must be maintained for 5 years after agreement termination." }
      ]
    } else {
      return [
        { front: "What is the function of ReLU in deep learning?", back: "It introduces non-linearities and avoids vanishing gradients by outputting max(0, x)." },
        { front: "Define Backpropagation.", back: "An algorithm that computes loss gradients by working backwards using the calculus chain rule." },
        { front: "How is weight optimization performed?", back: "By multiplying the learning rate η by the computed gradients and subtracting from current weights." }
      ]
    }
  }

  const getSlides = () => {
    if (activePdfId === "pdf-1") {
      return [
        { title: "Cognitive Enhancements Research Study", bullets: ["• Analyzes interactive Q&A interfaces.", "• Replaces static reading habits.", "• Aims for zero retention degradation."] },
        { title: "Methodology & Setup", bullets: ["• 120 undergraduate participants.", "• Random split into control and test groups.", "• 15-minute conceptual queries test."] },
        { title: "Key Findings & Data", bullets: ["• 34% recall speed boost.", "• 42% reduction in search time.", "• Strong positive feedback on citation references."] }
      ]
    } else if (activePdfId === "pdf-2") {
      return [
        { title: "Mutual NDA Overview", bullets: ["• Confidentiality agreement for business relations.", "• Strict definition of proprietary information.", "• Governed by local transaction laws."] },
        { title: "Obligations & SLA Details", bullets: ["• Recipient restricts access to essential employees only.", "• Net-30 payment clauses.", "• 1.5% interest rate on late payments."] },
        { title: "Termination & Survival", bullets: ["• 60 days written notice to terminate.", "• NDA provisions survive 5 years past termination.", "• Immediate termination for uncured breach."] }
      ]
    } else {
      return [
        { title: "Deep Neural Networks (Chapter 4)", bullets: ["• Nodes represent neurons with biases.", "• Weighted inputs passed through activations.", "• Layer chaining captures abstract hierarchies."] },
        { title: "Activation Non-Linearities", bullets: ["• Standard activations: Sigmoid, Tanh, ReLU.", "• Avoids collapsing deep layers into a single linear map.", "• ReLU outputs zero for negative inputs."] },
        { title: "Optimization & Backpropagation", bullets: ["• Calculus chain rule application.", "• Stochastic Gradient Descent updates.", "• Backwards flow of gradients to minimize loss."] }
      ]
    }
  }

  const getSuggestedQuestions = () => {
    if (activePdfId === "pdf-1") {
      return [
        "What methodologies were used in the research?",
        "What were the key results of the trial?",
        "How many participants were in the test?"
      ]
    } else if (activePdfId === "pdf-2") {
      return [
        "What are the contract payment terms?",
        "How can this NDA agreement be terminated?",
        "What is the duration of the confidentiality obligations?"
      ]
    } else if (activePdfId === "pdf-3") {
      return [
        "Explain backpropagation.",
        "What is the role of the ReLU activation?",
        "How does weights update process work?"
      ]
    } else {
      return [
        "Summarize the main points of this document.",
        "List the key dates or deadlines mentioned.",
        "What are the main findings in this file?"
      ]
    }
  }

  const flashcardsList = getFlashcards()
  const slidesList = getSlides()
  const suggestedPills = getSuggestedQuestions()

  const activeFolder = folders.find(f => f.id === activeFolderId) || null
  const folderPdfs = activeFolder ? pdfs.filter(p => activeFolder.pdfIds.includes(p.id)) : []

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col">
      <DashboardTopbar
        onNewChat={openNewChatModal}
        onOpenSettings={() => setShowSettings(true)}
        onOpenUpgrade={() => setShowUpgrade(true)}
        onSignOut={handleLogout}
        userName={user.name}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        activePdf={activePdf}
        folders={folders}
        onRenameChat={handleRenameChat}
        onMoveChat={handleMoveChat}
        onShareChat={handleShareChat}
        onExportChat={handleExportChat}
        onResetChat={handleResetChat}
        onDeleteChat={handleDeleteChat}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        activeFolderId={activeFolderId}
        onRenameFolder={handleRenameFolder}
        onResetFolderChat={handleResetFolderChat}
        onDeleteFolder={handleDeleteFolder}
      />

      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={closeNewChatModal}
        onFileSelect={handleModalFileSelect}
      />
      <div className={`flex flex-1 min-h-0 w-full ${activePdfId || activeFolderId ? "max-w-none px-2" : "mx-auto max-w-[1440px]"}`}>
        <DashboardSidebar
          pdfs={pdfs}
          activePdfId={activePdfId}
          onSelectPdf={handleSelectPdf}
          onUploadPdfClick={handleUploadClick}
          onSignOut={handleLogout}
          onOpenSettings={() => setShowSettings(true)}
          userName={user.name}
          userEmail={user.email}
          isSidebarCollapsed={isSidebarCollapsed}
          folders={folders}
          onAddFolder={handleAddFolder}
          onMoveChat={handleMoveChat}
          onRenameChat={handleRenameChat}
          onShareChat={handleShareChat}
          onExportChat={handleExportChat}
          onResetChat={handleResetChat}
          onDeleteChat={handleDeleteChat}
          onReindexChat={handleReindexChat}
          activeFolderId={activeFolderId}
          onSelectFolder={handleSelectFolder}
          onRenameFolder={handleRenameFolder}
          onResetFolderChat={handleResetFolderChat}
          onDeleteFolder={handleDeleteFolder}
        />

        <main className={`flex-1 flex flex-col min-w-0 ${activePdfId || activeFolderId ? "h-[calc(100vh-72px)] p-2 overflow-hidden" : "overflow-auto px-4 py-6 sm:px-6 lg:px-8"}`}>
          {activePdfId || activeFolderId ? (
            /* Switch to 3-column / 2-column workspace based on viewMode */
            <div className="flex-1 flex gap-4 h-full min-h-0 w-full overflow-hidden">
              {/* CENTER: PDF Viewer panel */}
              {(viewMode === "split" || viewMode === "pdf") && (
                <div className={`h-full min-w-0 flex flex-col ${viewMode === "split" ? "w-1/2" : "w-full"}`}>
                  {activePdfId ? (
                    <PdfViewer
                      key={activePdfId}
                      pdfUrl={activePdf?.fileUrl}
                      title={activePdf?.title || "Document"}
                      totalPages={activePdf?.pages || 1}
                      fileObj={pdfFiles[activePdfId]}
                    />
                  ) : activeFolderId ? (
                    <div className="bg-[#050505] rounded-[28px] border border-white/5 flex flex-col items-center justify-center p-8 h-full text-center select-none">
                      <div className="h-16 w-16 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] mb-4">
                        <FolderIcon size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{activeFolder?.name || "Folder"}</h3>
                      <p className="text-xs text-neutral-400 max-w-sm mb-6">
                        Folder with {folderPdfs.length} file{folderPdfs.length === 1 ? "" : "s"}
                      </p>
                      {folderPdfs.length > 0 ? (
                        <div className="w-full max-w-md space-y-2 text-left">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-2">Files in this folder</p>
                          <div className="grid gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                            {folderPdfs.map(pdf => (
                              <button
                                key={pdf.id}
                                onClick={() => handleSelectPdf(pdf.id)}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#111] hover:bg-[#1f1f1f] border border-white/5 text-left text-xs font-semibold text-white transition cursor-pointer"
                              >
                                <FileText size={14} className="text-[#7C3AED]" />
                                <span className="truncate flex-1">{pdf.title}</span>
                                <span className="text-[10px] text-neutral-500">{pdf.size}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-500">No files in this folder.</p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* RIGHT: Chat panel */}
              {(viewMode === "split" || viewMode === "chat") && (
                <div className={`h-full flex flex-col bg-[#050505] rounded-[28px] border border-white/5 overflow-hidden ${viewMode === "split" ? "w-1/2" : "w-full max-w-[760px] mx-auto"
                  }`}>
                  {/* Create extra buttons row: Flashcards & Slides OR Folder context header */}
                  {activePdfId ? (
                    <div className="h-12 border-b border-white/5 px-4 flex items-center justify-between select-none flex-shrink-0 bg-[#0d0d0d]">
                      <span className="text-xs font-semibold text-white/90">Interactive Tools</span>
                      <div className="flex gap-2" />
                    </div>
                  ) : activeFolderId ? (
                    <div className="h-12 border-b border-white/5 px-4 flex items-center justify-between select-none flex-shrink-0 bg-[#0d0d0d]">
                      <span className="text-xs font-semibold text-white/90">You are chatting with the folder</span>
                      {folderPdfs.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#111] hover:bg-[#1f1f1f] text-[11px] font-semibold text-white rounded-lg border border-white/5 transition outline-none cursor-pointer">
                              <span>Chat with file</span>
                              <ChevronDown size={10} className="ml-1 text-neutral-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent sideOffset={4} className="w-52 rounded-2xl border border-white/10 bg-[#050505] p-2 shadow-2xl z-[100]">
                            <DropdownMenuItem
                              onClick={() => handleSelectFolder(activeFolderId)}
                              className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer font-semibold"
                            >
                              Chat with folder (All files)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 bg-white/10" />
                            {folderPdfs.map(pdf => (
                              <DropdownMenuItem
                                key={pdf.id}
                                onClick={() => handleSelectPdf(pdf.id)}
                                className="rounded-xl px-3 py-2 text-xs text-white hover:bg-white/5 cursor-pointer flex items-center gap-2"
                              >
                                <FileText size={12} className="text-[#a0a0a0]" />
                                <span className="truncate">{pdf.title}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ) : null}

                  {/* Messages container list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
                    {currentMessages.length > 0 ? (
                      currentMessages.map((msg) => {
                        const isBot = msg.sender === "bot"
                        return (
                          <div key={msg.id} className={`flex flex-col ${isBot ? "items-start" : "items-end"}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${isBot
                              ? "bg-[#111111] text-white border border-white/5"
                              : "bg-[#7C3AED] text-white"
                              }`}>
                              <p className="whitespace-pre-wrap select-text">{msg.text}</p>

                              {/* Rendering Citations */}
                              {isBot && msg.citations && msg.citations.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1 border-t border-white/5 pt-2">
                                  {msg.citations.map((c, i) => (
                                    <span key={i} className="text-[10px] bg-black px-2 py-0.5 rounded text-[#7C3AED] border border-[#7C3AED]/20">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Action toolbar per message */}
                            <div className="flex items-center gap-2.5 mt-1 px-1 text-[10px] text-[#7c7c7c]">
                              <span>{msg.timestamp}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.text)
                                  showToast("Message text copied!", "success")
                                }}
                                className="hover:text-white transition p-0.5"
                                title="Copy"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                              </button>
                              <button
                                onClick={() => handleLikeMessage(msg.id, "like")}
                                className={`hover:text-emerald-400 transition p-0.5 ${msgLikes[msg.id] === "like" ? "text-emerald-400" : ""}`}
                                title="Thumbs Up"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3l3.15-6.3a2.6 2.6 0 0 1 3.85 2.18Z" /></svg>
                              </button>
                              <button
                                onClick={() => handleLikeMessage(msg.id, "dislike")}
                                className={`hover:text-red-400 transition p-0.5 ${msgLikes[msg.id] === "dislike" ? "text-red-400" : ""}`}
                                title="Thumbs Down"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3l-3.15 6.3a2.6 2.6 0 0 1-3.85-2.18Z" /></svg>
                              </button>
                              <button
                                onClick={() => handleListenMessage(msg.id, msg.text)}
                                className={`hover:text-[#7C3AED] transition p-0.5 ${speechActiveId === msg.id ? "text-[#7C3AED] animate-pulse" : ""}`}
                                title="Listen"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                              </button>
                              <button
                                onClick={() => {
                                  const cite = msg.citations ? msg.citations.join(", ") : "No specific references indexed."
                                  showToast(`Citations list: ${cite}`, "info")
                                }}
                                className="hover:text-white transition"
                                title="More actions"
                              >
                                •••
                              </button>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      activeFolderId && !activePdfId ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
                          <MessageSquare size={36} className="text-neutral-600 mb-2" />
                          <p className="text-xs font-semibold">No messages yet</p>
                          <p className="text-[10px] text-[#7c7c7c] mt-1">Send a message to start chatting with files in this folder.</p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
                          <MessageSquare size={36} className="text-neutral-600 mb-2" />
                          <p className="text-xs font-semibold">No messages yet</p>
                        </div>
                      )
                    )}

                    {/* Auto-greeting suggested question pills */}
                    {activePdfId && currentMessages.length === 1 && (
                      <div className="space-y-2 mt-4 max-w-[85%] border-t border-white/5 pt-4">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-[#7c7c7c]">Suggested Questions:</p>
                        <div className="flex flex-col gap-2">
                          {suggestedPills.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendQueryText(q)}
                              className="text-left text-xs bg-[#111111] hover:bg-[#1A1A1A] text-[#cbd5e1] border border-white/5 px-3 py-2.5 rounded-xl transition"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {isTyping && (
                      <div className="flex items-center gap-1.5 text-xs text-[#7c7c7c]">
                        <span className="h-1.5 w-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 bg-[#7C3AED] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        <span>AIKB Bot indexing context...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* BOTTOM INPUT BAR */}
                  <div className="p-4 border-t border-white/5 bg-[#0D0D0D] flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs text-[#7c7c7c]"></div>

                      <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/10 rounded-2xl px-3 py-2">
                        {/* Attachment (+) icon */}
                        <button
                          type="button"
                          onClick={handleUploadClick}
                          title="Attach document file"
                          className="p-1.5 hover:bg-white/5 rounded-lg text-[#cbd5e1] hover:text-white transition cursor-pointer"
                        >
                          <Paperclip size={16} />
                        </button>

                        <input
                          type="text"
                          placeholder="Ask any question..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          disabled={isTyping}
                          className="flex-1 bg-transparent border-none text-xs text-white outline-none placeholder:text-[#7c7c7c]"
                        />

                        {/* Bookmark icon */}
                        <button
                          type="button"
                          title="Bookmark conversation"
                          onClick={() => showToast("Added conversation bookmark successfully!", "success")}
                          className="p-1.5 hover:bg-white/5 rounded-lg text-[#cbd5e1] hover:text-white transition cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                        </button>

                        {/* Send button */}
                        <button
                          type="submit"
                          disabled={isTyping || !inputValue.trim()}
                          className="h-8 w-8 bg-[#7C3AED] text-white rounded-xl flex items-center justify-center hover:bg-[#6d28d9] disabled:bg-neutral-800 disabled:text-[#7c7c7c]/50 transition cursor-pointer"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

          ) : (
            /* ── Empty Dashboard ── */
            <div className="mx-auto w-full max-w-[760px] space-y-8">

              {/* Original heading — kept as-is */}
              <div className="space-y-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A0A0A0]">AI KNOWLEDGE BASE BOT</p>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">AI Knowledge Base Bot</h1>
                <p className="mx-auto max-w-2xl text-base leading-8 text-[#A0A0A0]">
                  Upload PDFs and instantly chat with your university knowledge base.
                </p>
              </div>

              {/* New ChatPDF-style box */}
              <div className="w-full bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden">

                {/* Tabs row */}
                <div className="flex items-center gap-2 px-6 pt-5 pb-4">
                  {(["Chat", "SOP", "Policy"] as const).map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${activeTab === tab
                        ? "bg-white text-black"
                        : "text-white/50 hover:text-white"
                        }`}
                    >
                      {tab === "Chat" && <MessageCircle size={14} />}
                      {tab === "SOP" && <ShieldCheck size={14} />}
                      {tab === "Policy" && <FileText size={14} />}
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Two panels */}
                <div className="flex gap-3 px-6 pb-6">

                  {/* Left — drop zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                    className="flex-1 flex flex-col items-center justify-center gap-4 h-[180px] rounded-xl border-2 border-dashed border-white/20 bg-white/3 hover:border-white/40 hover:bg-white/5 cursor-pointer transition-all duration-200"
                  >
                    <p className="text-sm text-white/50">Drop a file or</p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleUploadClick() }}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
                    >
                      <Paperclip size={15} />
                      upload
                    </button>
                  </div>

                  {/* Right — paste / text input */}
                  <div className="flex-1 flex flex-col gap-3 rounded-xl border border-white/15 bg-white/3 p-4 min-h-[180px]">
                    <textarea
                      rows={5}
                      placeholder="Ask to start a chat"
                      className="flex-1 w-full resize-none bg-transparent text-sm text-white placeholder:text-white/30 outline-none leading-relaxed"
                    />
                    <div className="flex items-center gap-1.5 text-xs text-white/40">
                      <kbd className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-white/20 bg-white/8 text-white/60 font-mono text-[11px] font-medium">CTRL</kbd>
                      <span className="text-white/30">+</span>
                      <kbd className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-white/20 bg-white/8 text-white/60 font-mono text-[11px] font-medium">V</kbd>
                      <span>to paste text or links</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          )}
        </main>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />

      {/* Account Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#050505] rounded-[32px] w-full max-w-[520px] shadow-2xl overflow-hidden text-left border border-white/10 relative">
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              aria-label="Close account modal"
              title="Close"
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-shadow shadow-lg"
            >
              <X className="w-4 h-4 stroke-[2]" />
            </button>
            <div className="flex items-start justify-between gap-4 px-6 py-5 pr-14 border-b border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-white">My account</h3>
                <p className="mt-1 text-sm text-slate-400">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/10 bg-[#111827] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/5"
              >
                Sign out
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-[28px] border border-white/10 bg-[#0A0A0A] p-6 text-center text-white">
                <p className="font-semibold">My account</p>
                <p className="text-sm text-slate-400 mt-2">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Subscription Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#141417] border border-border/10 rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/10">
              <h3 className="font-bold text-base flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                <span>Upgrade to AIKB Plus</span>
              </h3>
              <button onClick={() => setShowUpgrade(false)} className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">Payment Successful!</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Welcome to AIKB Plus! You now have unlimited uploads and faster GPT-4 powered indexing.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpgradeSubmit}>
                <div className="p-6 space-y-6">
                  {/* Features panel */}
                  <div className="space-y-3 bg-[#6C3FF5]/5 border border-[#6C3FF5]/10 p-4 rounded-xl">
                    <div className="flex justify-between items-center border-b border-[#6C3FF5]/10 pb-2">
                      <span className="font-bold text-[#bfaeff] text-sm">Plus Subscription</span>
                      <span className="font-black text-white text-base">$5 / month</span>
                    </div>
                    <ul className="space-y-2.5 text-xs text-muted-foreground">
                      <li className="flex items-center gap-2 text-foreground font-medium">
                        <CheckCircle size={14} className="text-[#6C3FF5]" />
                        <span>Unlimited document uploads</span>
                      </li>
                      <li className="flex items-center gap-2 text-foreground font-medium">
                        <CheckCircle size={14} className="text-[#6C3FF5]" />
                        <span>Up to 2,000 pages per document</span>
                      </li>
                      <li className="flex items-center gap-2 text-foreground font-medium">
                        <CheckCircle size={14} className="text-[#6C3FF5]" />
                        <span>Priority GPT-4 parsing & answer models</span>
                      </li>
                      <li className="flex items-center gap-2 text-foreground font-medium">
                        <CheckCircle size={14} className="text-[#6C3FF5]" />
                        <span>Priority chat & customer support access</span>
                      </li>
                    </ul>
                  </div>

                  {/* Card Payment Fields */}
                  <div className="space-y-4">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span>Card Details</span>
                    </label>

                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Card Number (e.g. 4242 4242 4242 4242)"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          maxLength={19}
                          className="w-full px-4 py-3 text-sm rounded-xl bg-[#18181b] border border-white/5 focus:border-[#6C3FF5] text-white outline-none placeholder:text-muted-foreground transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          maxLength={5}
                          className="px-4 py-3 text-sm rounded-xl bg-[#18181b] border border-white/5 focus:border-[#6C3FF5] text-white outline-none placeholder:text-muted-foreground transition-all"
                        />
                        <input
                          type="text"
                          required
                          placeholder="CVC"
                          value={cardCVC}
                          onChange={(e) => setCardCVC(e.target.value)}
                          maxLength={3}
                          className="px-4 py-3 text-sm rounded-xl bg-[#18181b] border border-white/5 focus:border-[#6C3FF5] text-white outline-none placeholder:text-muted-foreground transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#0d0d0f] border-t border-border/10 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Secure Stripe checkouts</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUpgrade(false)}
                      className="py-2 px-4 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPaying || !cardNumber || !cardExpiry || !cardCVC}
                      className="py-2 px-5 bg-[#6C3FF5] hover:bg-[#6C3FF5]/90 disabled:bg-neutral-800 disabled:text-muted-foreground/30 font-bold text-xs text-white rounded-lg transition-all shadow-md flex items-center gap-1.5"
                    >
                      {isPaying ? "Processing..." : "Subscribe Now"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* INTERACTIVE FLASHCARDS MODAL */}
      {showFlashcards && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] rounded-[32px] w-full max-w-[480px] border border-white/10 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowFlashcards(false)}
              className="absolute right-6 top-6 text-neutral-400 hover:text-white transition outline-none"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles size={18} className="text-[#7C3AED]" />
              <span>Interactive Flashcards</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-6">Generated from "{activePdf?.title}"</p>

            {/* Card view with 3D Flip */}
            <div className="h-56 w-full relative" style={{ perspective: "1000px" }}>
              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className="relative w-full h-full text-center transition-transform duration-500 cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                }}
              >
                {/* Front Side */}
                <div
                  className="absolute inset-0 bg-[#111111] border border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
                  style={{
                    backfaceVisibility: "hidden"
                  }}
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C3AED] mb-3">Question</span>
                  <p className="text-sm font-medium text-[#cbd5e1]">{flashcardsList[currentCardIdx]?.front}</p>
                  <span className="text-[10px] text-neutral-500 mt-6 select-none">(Click card to flip)</span>
                </div>

                {/* Back Side */}
                <div
                  className="absolute inset-0 bg-[#161320] border border-[#7C3AED]/20 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)"
                  }}
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mb-3">Answer</span>
                  <p className="text-sm text-white leading-relaxed">{flashcardsList[currentCardIdx]?.back}</p>
                  <span className="text-[10px] text-neutral-500 mt-6 select-none">(Click card to flip)</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsCardFlipped(false)
                  setCurrentCardIdx(prev => Math.max(0, prev - 1))
                }}
                disabled={currentCardIdx === 0}
                className="px-3 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-20 text-xs text-neutral-400 font-semibold transition"
              >
                Previous
              </button>
              <span className="text-xs text-neutral-500">
                {currentCardIdx + 1} of {flashcardsList.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCardFlipped(false)
                  setCurrentCardIdx(prev => Math.min(flashcardsList.length - 1, prev + 1))
                }}
                disabled={currentCardIdx === flashcardsList.length - 1}
                className="px-3 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-20 text-xs text-[#7C3AED] font-semibold transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE SLIDES DECK MODAL */}
      {showSlides && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] rounded-[32px] w-full max-w-[580px] border border-white/10 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowSlides(false)}
              className="absolute right-6 top-6 text-neutral-400 hover:text-white transition outline-none"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Presentation size={18} className="text-[#7C3AED]" />
              <span>Interactive Slides Deck</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-6">Slides overview of "{activePdf?.title}"</p>

            {/* Slide screen */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 min-h-[220px] flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#7C3AED] mb-4 uppercase tracking-wider">
                  {slidesList[currentSlideIdx]?.title}
                </h4>
                <ul className="space-y-3.5 text-xs text-[#cbd5e1] leading-relaxed">
                  {slidesList[currentSlideIdx]?.bullets.map((b, idx) => (
                    <li key={idx} className="list-none pl-1">{b}</li>
                  ))}
                </ul>
              </div>
              <span className="text-[10px] text-neutral-500 text-right mt-6 select-none">
                Slide {currentSlideIdx + 1} of {slidesList.length}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => setCurrentSlideIdx(prev => Math.max(0, prev - 1))}
                disabled={currentSlideIdx === 0}
                className="px-3 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-20 text-xs text-neutral-400 font-semibold transition"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlideIdx(prev => Math.min(slidesList.length - 1, prev + 1))}
                disabled={currentSlideIdx === slidesList.length - 1}
                className="px-3 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-20 text-xs text-[#7C3AED] font-semibold transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME CHAT MODAL */}
      {activeModal === "rename_chat" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] rounded-[32px] w-full max-w-[440px] border border-white/10 shadow-2xl p-6 relative text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-6 top-6 text-neutral-400 hover:text-white transition outline-none cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Rename chat</h3>
            <div className="space-y-4">
              <input
                type="text"
                autoFocus
                onFocus={(e) => e.target.select()}
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl bg-[#111] border border-white/5 focus:border-[#7C3AED] text-white outline-none transition"
                placeholder="Enter chat name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameChatSubmit()
                }}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleRenameChatSubmit}
                  disabled={!modalInputValue.trim()}
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6d28d9] disabled:bg-neutral-800 disabled:text-[#7c7c7c]/50 text-xs font-bold text-white rounded-xl transition cursor-pointer"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW FOLDER MODAL */}
      {activeModal === "create_folder" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] rounded-[32px] w-full max-w-[440px] border border-white/10 shadow-2xl p-6 relative text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-6 top-6 text-neutral-400 hover:text-white transition outline-none cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Create new folder</h3>
            <div className="space-y-4">
              <input
                type="text"
                autoFocus
                onFocus={(e) => e.target.select()}
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl bg-[#111] border border-white/5 focus:border-[#7C3AED] text-white outline-none transition"
                placeholder="Enter folder name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolderSubmit()
                }}
              />

              <div className="bg-[#111] border border-white/5 rounded-xl p-4 space-y-2">
                <h4 className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Use folders to</h4>
                <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
                  <li>Organize your files</li>
                  <li>Chat with multiple files at the same time</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCreateFolderSubmit}
                  disabled={!modalInputValue.trim()}
                  className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6d28d9] disabled:bg-neutral-800 disabled:text-[#7c7c7c]/50 text-xs font-bold text-white rounded-xl transition cursor-pointer"
                >
                  Create new folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENAME FOLDER MODAL */}
      {activeModal === "rename_folder" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] rounded-[32px] w-full max-w-[440px] border border-white/10 shadow-2xl p-6 relative text-left">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-6 top-6 text-neutral-400 hover:text-white transition outline-none cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Rename folder</h3>
            <div className="space-y-4">
              <input
                type="text"
                autoFocus
                onFocus={(e) => e.target.select()}
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl bg-[#111] border border-white/5 focus:border-[#7C3AED] text-white outline-none transition"
                placeholder="Enter folder name..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameFolderSubmit()
                }}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleRenameFolderSubmit}
                  disabled={!modalInputValue.trim()}
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6d28d9] disabled:bg-neutral-800 disabled:text-[#7c7c7c]/50 text-xs font-bold text-white rounded-xl transition cursor-pointer"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE CHAT MODAL */}
      {activeModal === "share_chat" && (() => {
        const targetPdf = pdfs.find(p => p.id === modalTargetId)
        const mockUrl = typeof window !== "undefined" ? `${window.location.origin}/share/bot/${modalTargetId}` : ""
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-[#0A0A0A] rounded-[32px] w-full max-w-[480px] border border-white/10 shadow-2xl p-6 relative text-left">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-6 top-6 text-neutral-400 hover:text-white transition outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
              <h3 className="text-base font-bold text-white mb-1">Share this chat</h3>
              <p className="text-xs text-neutral-400 mb-4">Anyone with this link can chat with the PDF file.</p>

              <div className="flex gap-2 mb-4 bg-[#111] p-1.5 rounded-2xl border border-white/5">
                <input
                  type="text"
                  readOnly
                  value={mockUrl}
                  className="flex-1 bg-transparent border-none text-xs text-neutral-300 outline-none px-3 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(mockUrl)
                    showToast("Link copied to clipboard", "success")
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#111] hover:bg-[#1f1f1f] text-xs font-semibold text-white border border-white/5 transition cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                  Copy link
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: targetPdf ? targetPdf.title : "AIKB Chat Share",
                        url: mockUrl
                      }).catch(() => {
                        navigator.clipboard.writeText(mockUrl)
                        showToast("Link copied to clipboard", "success")
                      })
                    } else {
                      navigator.clipboard.writeText(mockUrl)
                      showToast("Link copied to clipboard", "success")
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6d28d9] text-xs font-semibold text-white transition cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>
                  Share
                </button>
              </div>

              <p className="text-[10px] text-neutral-500 leading-normal">
                Every visitor will start a new conversation, chat messages are not shared.
              </p>
            </div>
          </div>
        )
      })()}

      {/* DELETE CHAT CONFIRMATION MODAL */}
      {activeModal === "delete_chat" && (() => {
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-[#0A0A0A] rounded-[32px] w-full max-w-[440px] border border-white/10 shadow-2xl p-6 relative text-left">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-6 top-6 text-neutral-400 hover:text-white transition outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
              <h3 className="text-base font-bold text-white mb-2">Delete chat</h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-1">
                Do you really want to delete this chat?
              </p>
              <p className="text-[11px] text-neutral-500 mb-6">
                This will permanently delete the chat and all its messages from [AIKB Bot].
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-white/5 hover:border-white/10 text-xs font-semibold text-white rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteChatConfirm}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* DELETE FOLDER CONFIRMATION MODAL */}
      {activeModal === "delete_folder" && (() => {
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-[#0A0A0A] rounded-[32px] w-full max-w-[440px] border border-white/10 shadow-2xl p-6 relative text-left">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-6 top-6 text-neutral-400 hover:text-white transition outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
              <h3 className="text-base font-bold text-white mb-2">Delete folder</h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-1">
                Do you really want to delete this folder?
              </p>
              <p className="text-[11px] text-neutral-500 mb-6">
                This will permanently delete the folder. The chats inside will be moved to Uncategorized.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 bg-transparent hover:bg-white/5 border border-white/5 hover:border-white/10 text-xs font-semibold text-white rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteFolderConfirm}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* TOAST NOTIFICATION CONTAINER */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 bg-[#0d0d0d] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl text-xs font-medium text-white select-none">
            {toast.type === "success" ? (
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : toast.type === "error" ? (
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            ) : (
              <svg className="w-4 h-4 text-[#7C3AED] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
