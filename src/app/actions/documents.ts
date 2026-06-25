'use server'

import supabaseAdmin from '@/lib/supabaseAdmin'

const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const isConfigured = !!SERVICE_KEY && SERVICE_KEY !== 'your_service_role_key_here'

// ─── Combined: upload file to storage + insert DB row in one server call ─────
export async function uploadAndInsertDocument(
  file: File,
  userId: string
): Promise<{ pdfUrl: string; docId: string; error: string | null }> {
  if (!isConfigured) {
    return { pdfUrl: '', docId: '', error: 'Service role key not configured' }
  }

  try {
    const safeName = file.name.replace(/\s+/g, '_')
    const storagePath = `pdfs/${Date.now()}_${safeName}`

    // Step 1 — Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, file, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('[SERVER] Storage upload error:', uploadError)
      return { pdfUrl: '', docId: '', error: uploadError.message }
    }

    // Step 2 — Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(uploadData.path)
    const pdfUrl = urlData?.publicUrl || ''

    // Step 3 — Insert metadata row
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert([{
        filename: file.name,
        file_url: pdfUrl,
        document_type: 'pdf',
        uploaded_by: userId,
        uploaded_at: new Date().toISOString(),
      }])
      .select('id')
      .single()

    if (dbError) {
      // File is in storage — still return the URL so the user can view it
      console.warn('[SERVER] DB insert error (non-fatal, file saved):', dbError.message)
      return { pdfUrl, docId: `temp-${Date.now()}`, error: null }
    }

    return { pdfUrl, docId: dbData.id, error: null }
  } catch (err: any) {
    console.error('[SERVER] uploadAndInsertDocument threw:', err)
    return { pdfUrl: '', docId: '', error: err?.message || 'Upload failed' }
  }
}

// ─── Legacy: insert only ──────────────────────────────────────────────────────
export async function insertDocumentAsServer(metadata: {
  filename: string
  file_url: string
  document_type: string
  uploaded_by: string
  uploaded_at: string
}) {
  if (!isConfigured) {
    return {
      error: { message: 'Service role key not configured' },
      data: null,
    }
  }

  try {
    const res = await supabaseAdmin.from('documents').insert([metadata]).select('id').single()
    return res
  } catch (err: any) {
    console.warn('[SERVER] insertDocumentAsServer error (non-fatal):', err?.message)
    return {
      error: null,
      data: { id: `temp-${Date.now()}`, ...metadata },
    }
  }
}

// ─── Legacy: upload only ──────────────────────────────────────────────────────
export async function uploadDocumentAsServer(file: File, path: string) {
  if (!isConfigured) {
    return { error: { message: 'Service role key not configured' }, data: null }
  }

  try {
    const res = await supabaseAdmin.storage.from('documents').upload(path, file)
    return res
  } catch (err: any) {
    return { error: { message: err?.message || 'Server storage upload failed' }, data: null }
  }
}
