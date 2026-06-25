"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  ZoomOut,
  ZoomIn,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react"

interface PdfViewerProps {
  /** Supabase public storage URL — persistent across sessions */
  pdfUrl?: string
  title: string
  totalPages: number
  /** In-memory File object — fallback for the current session only */
  fileObj?: File
}

// ─── PDF.js CDN loader (idempotent) ──────────────────────────────────────────
const PDFJS_VERSION = "3.4.120"
let pdfjsLoadPromise: Promise<any> | null = null

function loadPdfJs(): Promise<any> {
  if ((window as any).pdfjsLib) return Promise.resolve((window as any).pdfjsLib)
  if (pdfjsLoadPromise) return pdfjsLoadPromise

  pdfjsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`
    script.async = true
    script.onload = () => {
      const lib = (window as any).pdfjsLib
      lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`
      resolve(lib)
    }
    script.onerror = () => {
      pdfjsLoadPromise = null
      reject(new Error("Failed to load PDF.js from CDN"))
    }
    document.head.appendChild(script)
  })

  return pdfjsLoadPromise
}

// ─── Component ────────────────────────────────────────────────────────────────
export function PdfViewer({ pdfUrl, title, totalPages, fileObj }: PdfViewerProps) {
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(totalPages || 1)
  const [scale, setScale] = useState(1.0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [pageInputVal, setPageInputVal] = useState("1")

  // Search state
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<any>(null)
  // Track the blob URL we create so we can revoke it on cleanup / new file
  const blobUrlRef = useRef<string | null>(null)

  // ── Load PDF document whenever source changes ──────────────────────────────
  useEffect(() => {
    let cancelled = false

    // Clean up previous blob URL before creating a new one
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }

    // Resolve source: prefer persistent Supabase URL, fall back to in-memory File
    let sourceUrl: string | null = null
    if (pdfUrl && pdfUrl.trim() !== "") {
      sourceUrl = pdfUrl
    } else if (fileObj) {
      const blob = URL.createObjectURL(fileObj)
      blobUrlRef.current = blob
      sourceUrl = blob
    }

    if (!sourceUrl) {
      setLoading(false)
      setError(null)
      setPdfDoc(null)
      return
    }

    setLoading(true)
    setError(null)
    setPdfDoc(null)
    setPageNumber(1)
    setPageInputVal("1")

    const run = async () => {
      try {
        const pdfjsLib = await loadPdfJs()
        if (cancelled) return

        const loadingTask = pdfjsLib.getDocument(sourceUrl!)
        const pdf = await loadingTask.promise
        if (cancelled) return

        setPdfDoc(pdf)
        setNumPages(pdf.numPages)
        setLoading(false)
      } catch (err: any) {
        if (cancelled) return
        console.error("[PdfViewer] load error:", err)
        setError(err?.message || "Could not load PDF")
        setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
      // Do NOT revoke blobUrlRef here — the next render will do it above.
      // Revoking here while PDF.js may still be reading causes fetch errors.
    }
  }, [pdfUrl, fileObj]) // eslint-disable-line react-hooks/exhaustive-deps

  // Revoke blob URL when component is truly unmounted (chat switch via key prop)
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [])

  // ── Render the current page onto canvas ────────────────────────────────────
  useEffect(() => {
    if (!pdfDoc) return

    let cancelled = false

    const renderPage = async () => {
      // Cancel any in-progress render first
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel() } catch (_) {}
        renderTaskRef.current = null
      }

      try {
        const page = await pdfDoc.getPage(pageNumber)
        if (cancelled) return

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const viewport = page.getViewport({ scale })
        canvas.width = viewport.width
        canvas.height = viewport.height

        const task = page.render({ canvasContext: ctx, viewport })
        renderTaskRef.current = task
        await task.promise
        renderTaskRef.current = null
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("[PdfViewer] render error:", err)
        }
      }
    }

    renderPage()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel() } catch (_) {}
        renderTaskRef.current = null
      }
    }
  }, [pdfDoc, pageNumber, scale])

  // ── Controls ───────────────────────────────────────────────────────────────
  const zoomOut = () => setScale(s => Math.max(0.4, parseFloat((s - 0.2).toFixed(1))))
  const zoomIn  = () => setScale(s => Math.min(3.0, parseFloat((s + 0.2).toFixed(1))))

  const fitWidth = async () => {
    if (!pdfDoc || !containerRef.current) return
    const page = await pdfDoc.getPage(pageNumber)
    const vp = page.getViewport({ scale: 1 })
    const containerW = containerRef.current.clientWidth - 32
    setScale(parseFloat((containerW / vp.width).toFixed(2)))
  }

  const prevPage = () => {
    const p = Math.max(1, pageNumber - 1)
    setPageNumber(p)
    setPageInputVal(String(p))
  }
  const nextPage = () => {
    const p = Math.min(numPages, pageNumber + 1)
    setPageNumber(p)
    setPageInputVal(String(p))
  }

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputVal(e.target.value)
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v) && v >= 1 && v <= numPages) setPageNumber(v)
  }

  const handleDownload = () => {
    if (pdfUrl && pdfUrl.trim()) {
      const a = document.createElement("a")
      a.href = pdfUrl
      a.download = title
      a.target = "_blank"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else if (fileObj) {
      const url = URL.createObjectURL(fileObj)
      const a = document.createElement("a")
      a.href = url
      a.download = title
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  }

  // Derive display size
  const displaySize = fileObj
    ? `${(fileObj.size / (1024 * 1024)).toFixed(2)} MB`
    : "N/A"

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col bg-[#141414] rounded-[28px] overflow-hidden border border-white/5 relative"
    >
      {/* Search overlay */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 bg-[#0a0a0a] border border-white/10 p-3 rounded-2xl z-30 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white">Find in document</span>
            <button
              onClick={() => { setShowSearch(false); setSearchQuery("") }}
              className="text-[#7c7c7c] hover:text-white p-1 rounded-md"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#7C3AED]"
            />
            <button className="bg-[#7C3AED] hover:bg-[#6d28d9] px-3 py-1.5 rounded-lg text-xs font-semibold text-white">
              Search
            </button>
          </div>
        </div>
      )}

      {/* ── Main viewer area ── */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
            <p className="text-xs">Loading document…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3 text-center px-8">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <p className="text-sm font-semibold text-red-300">Failed to load PDF</p>
            <p className="text-xs text-neutral-500 max-w-xs">{error}</p>
            {!pdfUrl && (
              <p className="text-xs text-neutral-600 max-w-xs mt-2">
                The document was not saved to cloud storage. Re-upload the PDF to view it again.
              </p>
            )}
          </div>
        ) : pdfDoc ? (
          <div className="shadow-2xl border border-white/5 rounded-lg overflow-hidden bg-white">
            <canvas ref={canvasRef} className="block" />
          </div>
        ) : (
          /* No source at all */
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-3 text-center px-8">
            <AlertCircle className="w-10 h-10 text-neutral-600" />
            <p className="text-sm font-semibold">No document available</p>
            <p className="text-xs text-neutral-600 max-w-xs">
              Upload a PDF to view it here, or re-upload if the session expired.
            </p>
          </div>
        )}
      </div>

      {/* ── Bottom toolbar ── */}
      <div className="h-14 border-t border-white/5 bg-[#0D0D0D] px-4 flex items-center justify-between select-none flex-shrink-0">
        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            title="Zoom out"
            className="p-2 hover:bg-white/5 rounded-lg text-[#7c7c7c] hover:text-white transition"
          >
            <ZoomOut size={15} />
          </button>
          <button
            onClick={fitWidth}
            title="Fit width"
            className="p-2 hover:bg-white/5 rounded-lg text-[#7c7c7c] hover:text-white transition"
          >
            <Maximize2 size={14} />
          </button>
          <button
            onClick={zoomIn}
            title="Zoom in"
            className="p-2 hover:bg-white/5 rounded-lg text-[#7c7c7c] hover:text-white transition"
          >
            <ZoomIn size={15} />
          </button>
          <span className="text-[10px] text-[#7c7c7c] ml-1 tabular-nums">
            {(scale * 100).toFixed(0)}%
          </span>
          {fileObj && (
            <span className="text-[10px] text-[#7c7c7c] ml-3 hidden sm:block">
              {displaySize}
            </span>
          )}
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={pageNumber <= 1 || !pdfDoc}
            className="p-1.5 hover:bg-white/5 disabled:opacity-30 rounded-lg text-[#7c7c7c] hover:text-white transition"
          >
            <ChevronLeft size={15} />
          </button>
          <div className="flex items-center gap-1 text-xs text-[#cbd5e1]">
            <input
              type="text"
              value={pageInputVal}
              onChange={handlePageInput}
              disabled={!pdfDoc}
              className="w-8 h-7 bg-[#1A1A1A] border border-white/10 rounded-md text-center text-white text-xs outline-none focus:border-[#7C3AED] disabled:opacity-40"
            />
            <span className="text-[#7c7c7c]">of</span>
            <span>{numPages}</span>
          </div>
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages || !pdfDoc}
            className="p-1.5 hover:bg-white/5 disabled:opacity-30 rounded-lg text-[#7c7c7c] hover:text-white transition"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSearch(s => !s)}
            title="Search"
            className="p-2 hover:bg-white/5 rounded-lg text-[#7c7c7c] hover:text-white transition"
          >
            <Search size={15} />
          </button>
          <button
            onClick={handleDownload}
            disabled={!pdfUrl && !fileObj}
            title="Download"
            className="p-2 hover:bg-white/5 rounded-lg text-[#7c7c7c] hover:text-white transition disabled:opacity-30"
          >
            <Download size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
