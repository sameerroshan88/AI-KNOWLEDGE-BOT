"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { supabase } from "@/lib/supabase"

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploads, setUploads] = useState<Array<any>>([])

  useEffect(() => {
    let mounted = true
    const loadUser = async () => {
      try {
        console.log('=== LOADING AUTHENTICATED USER ===')
        console.log('Supabase env available:', {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        })
        const { data: { user }, error } = await supabase.auth.getUser()
        console.log('getUser response:', { user, error })
        if (error) {
          console.error('getUser error:', error)
        }
        if (!user) {
          console.warn('No authenticated user found, redirecting to login')
          router.push("/")
          return
        }
        if (mounted) setUser(user)
        console.log('Authenticated User:', { id: user.id, email: user.email })
        const res = await supabase.db.fetchDocumentsByUser(user.id)
        console.log('fetchDocumentsByUser response:', res)
        if (res?.data) setUploads(res.data)
      } catch (err) {
        console.error('Error loading user or uploads:', err)
        router.push("/")
      }
    }
    loadUser()
    return () => { mounted = false }
  }, [router])

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    console.log('=== PDF FILE DROP EVENT ===', { acceptedFiles, fileRejections })
    setError(null)
    setSuccess(null)
    if (fileRejections && fileRejections.length > 0) {
      console.error('File rejection reason:', fileRejections)
      setError('Only PDF files are accepted')
      return
    }
    const f = acceptedFiles[0]
    if (!f) {
      console.error('No file selected after drop')
      setError('No file selected')
      return
    }
    if (f.type !== 'application/pdf') {
      console.error('Invalid file type selected:', f.type)
      setError('Only PDF files are accepted')
      return
    }
    console.log('Selected File:', f)
    setFile(f)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] }
  })

  const handleUpload = async () => {
    console.log("===== PDF UPLOAD START =====")
    setError(null)
    setSuccess(null)

    if (!file) {
      const errMsg = "Please choose a PDF to upload"
      console.error("Upload aborted:", errMsg)
      setError(errMsg)
      return
    }

    try {
      // Get current user
      const userRes = await supabase.auth.getUser()
      const currentUser = userRes?.data?.user || user

      if (!currentUser) {
        const errMsg = "Authentication required"
        console.error("Upload aborted:", errMsg)
        setError(errMsg)
        router.push('/')
        return
      }

      setLoading(true)
      setProgress(5)

      const ticker = setInterval(() => {
        setProgress((p) => Math.min(90, p + Math.floor(Math.random() * 10) + 5))
      }, 400)

      // Use the new /api/upload route
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', currentUser.id)
      formData.append('userEmail', currentUser.email || '')

      console.log("Uploading to /api/upload...")
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      console.log("Upload API response:", result)

      if (!response.ok || result.error) {
        clearInterval(ticker)
        throw new Error(result.error || 'Upload failed')
      }

      console.log("Upload successful:", result)

      clearInterval(ticker)
      setProgress(100)
      setSuccess('Upload successful - file stored securely')

      // Refresh upload list
      try {
        const listRes = await supabase.db.fetchDocumentsByUser(currentUser.id)
        console.log('REFRESH UPLOAD LIST RESPONSE:', listRes)
        if (listRes?.data) setUploads(listRes.data)
      } catch (listErr) {
        console.warn('Could not refresh upload list, but file was uploaded:', listErr)
      }

      setFile(null)
    } catch (err: any) {
      const errMsg = err?.message || String(err)
      console.error('Upload error:', err)
      setError(errMsg)
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 800)
    }
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Upload PDF</h1>
        {user?.email && (
          <p className="text-sm text-slate-400 mb-4">Logged in as <span className="font-medium">{user.email}</span></p>
        )}

        <div {...getRootProps()} className={`border-2 border-dashed p-6 rounded-lg text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-border bg-transparent'}`}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the PDF here ...</p>
          ) : (
            <p>Drag & drop a PDF here, or click to select a file</p>
          )}
        </div>

        {file && (
          <div className="mt-4 p-3 border rounded-lg bg-[#0f0f10] flex items-center justify-between">
            <div>
              <div className="font-medium">{file.name}</div>
              <div className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
            </div>
            <div>
              <button onClick={() => setFile(null)} className="text-sm text-muted-foreground hover:text-foreground">Remove</button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleUpload} disabled={loading} className="px-4 py-2 rounded-lg bg-[#6C3FF5] text-white disabled:opacity-60">{loading ? 'Uploading...' : 'Upload'}</button>
          {progress > 0 && (
            <div className="w-full bg-white/5 rounded overflow-hidden">
              <div style={{ width: `${progress}%` }} className="h-2 bg-[#6C3FF5] transition-all" />
            </div>
          )}
        </div>

        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        {success && <div className="mt-3 text-sm text-green-400">{success}</div>}

        {/* Uploaded files list */}
        <div className="mt-6">
          <h2 className="font-semibold text-sm mb-2">Your uploads</h2>
          <div className="space-y-2">
            {uploads.length === 0 && <div className="text-sm text-muted-foreground">No uploads yet.</div>}
            {uploads.map((u: any) => (
              <div key={u.id || u.filename} className="p-2 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.filename}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(u.uploaded_at).toLocaleString()}
                    {u.uploaded_by_email ? ` • ${u.uploaded_by_email}` : ''}
                  </div>
                </div>
                <a href={u.file_url} target="_blank" rel="noreferrer" className="text-sm text-[#6C3FF5]">View</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
