"use client"

import { useRef, useState } from "react"
import { Upload } from "lucide-react"

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
}

export function FileUploadZone({ onFileSelect }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
    e.target.value = ""
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-4 h-[160px] w-full rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none ${
        isDragging
          ? "border-[#7C3AED] bg-[#7C3AED]/10"
          : "border-white/20 bg-white/3 hover:border-white/35 hover:bg-white/5"
      }`}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />

      <p className="text-sm text-white/50">
        Drop a file or
      </p>

      {/* Upload button */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
        className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 hover:border-white/40"
      >
        <Upload size={15} />
        upload
      </button>
    </div>
  )
}
