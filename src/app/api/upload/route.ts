import { NextRequest, NextResponse, after } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { indexDocument } from '@/lib/indexer'

const sanitizeForPath = (value: string, allowDot = false) => {
  const pattern = allowDot ? /[^a-zA-Z0-9_.-]+/g : /[^a-zA-Z0-9_-]+/g
  return value
    .replace(pattern, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API UPLOAD] Starting upload...')
    console.log('[API UPLOAD] Content-Length:', request.headers.get('content-length'))

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const userEmail = (formData.get('userEmail') as string | null) ?? null

    console.log('[API UPLOAD] FormData parsed:', {
      hasFile: !!file,
      userId,
      userEmail,
      fileName: file?.name,
      fileSize: file?.size,
    })

    if (!file || !userId) {
      console.error('[API UPLOAD] Missing file or userId')
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 })
    }

    // Step 1: Upload file to Supabase Storage
    const safeUploaderFolder = userEmail?.trim()
      ? sanitizeForPath(userEmail)
      : sanitizeForPath(userId)
    // Use a UUID subfolder for uniqueness — keep the original filename as-is
    // Storage path: pdfs/{userFolder}/{uuid}/{original_filename.pdf}
    const uniqueFolder = crypto.randomUUID()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `pdfs/${safeUploaderFolder}/${uniqueFolder}/${safeFileName}`

    console.log('[API UPLOAD] Starting file upload to storage:', filePath)

    const fileBuffer = await file.arrayBuffer()
    console.log('[API UPLOAD] File buffer size:', fileBuffer.byteLength, 'bytes')

    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (storageError) {
      console.error('[API UPLOAD] Storage error:', storageError)
      return NextResponse.json({ error: `Storage error: ${storageError.message}` }, { status: 500 })
    }

    console.log('[API UPLOAD] File uploaded successfully:', storageData)

    // Step 2: Get permanent public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(filePath)

    const permanentUrl = urlData.publicUrl
    console.log('[API UPLOAD] Public URL:', permanentUrl)

    // Step 3: Save document metadata to documents table
    console.log('[API UPLOAD] Inserting document record...')

    const insertData: Record<string, any> = {
      filename: file.name,
      file_url: permanentUrl,
      document_type: 'pdf',
      uploaded_by: userId,
      uploaded_at: new Date().toISOString(),
      indexing_status: 'pending'
    }

    console.log('[API UPLOAD] Insert data:', insertData)

    let { data: docData, error: docError } = await supabaseAdmin
      .from('documents')
      .insert([insertData])
      .select()
      .single()

    if (docError && docError.message.includes('indexing_status')) {
      console.warn('[API UPLOAD] indexing_status column not found. Falling back to insert without indexing_status. Please run schema.sql!')
      const fallbackInsertData = { ...insertData }
      delete fallbackInsertData.indexing_status
      
      const fallbackResult = await supabaseAdmin
        .from('documents')
        .insert([fallbackInsertData])
        .select()
        .single()
        
      docData = fallbackResult.data
      docError = fallbackResult.error
    }

    if (docError) {
      console.error('[API UPLOAD] Document insert error:', docError)
      return NextResponse.json({ error: `Database error: ${docError.message}` }, { status: 500 })
    }

    console.log('[API UPLOAD] Success:', { documentId: docData.id, fileUrl: permanentUrl })

    // Trigger indexing asynchronously in the background after the response is sent
    after(async () => {
      try {
        console.log(`[API UPLOAD] [BACKGROUND] Starting indexing for document ${docData.id}`)
        await indexDocument(docData.id)
      } catch (err) {
        console.error(`[API UPLOAD] [BACKGROUND] Failed indexing document ${docData.id}:`, err)
      }
    })

    return NextResponse.json({
      success: true,
      documentId: docData.id,
      fileUrl: permanentUrl,
      filename: file.name
    })

  } catch (err: any) {
    console.error('[API UPLOAD] Exception:', err)
    return NextResponse.json({ error: `Upload error: ${err.message}` }, { status: 500 })
  }
}


