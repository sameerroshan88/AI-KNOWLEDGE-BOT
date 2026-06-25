import { NextRequest, NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

export async function DELETE(request: NextRequest) {
  try {
    const { documentId, userId } = await request.json()

    if (!documentId || !userId) {
      return NextResponse.json({ error: 'Missing documentId or userId' }, { status: 400 })
    }

    // Step 1: Get document record to find the storage file path
    const { data: doc, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('uploaded_by', userId)
      .single()

    if (fetchError || !doc) {
      console.error('Document fetch error:', fetchError)
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 })
    }

    // Step 2: Extract storage path from file_url
    // file_url looks like: https://xxx.supabase.co/storage/v1/object/public/documents/pdfs/userId/filename.pdf
    let storagePath: string | null = null
    if (doc.file_url) {
      try {
        const url = new URL(doc.file_url)
        const marker = '/storage/v1/object/public/documents/'
        const idx = url.pathname.indexOf(marker)
        if (idx !== -1) {
          storagePath = url.pathname.substring(idx + marker.length)
        }
      } catch (urlErr) {
        console.error('Failed to parse file_url:', urlErr)
      }
    }

    // Step 3: Delete file from Supabase Storage
    if (storagePath) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('documents')
        .remove([storagePath])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        // Continue anyway to clean up database records
      } else {
        console.log('[DELETE] Storage file removed:', storagePath)
      }
    }

    // Step 4: Delete document_embeddings for this document (cascade should handle this,
    // but we do it explicitly to be safe)
    const { error: embeddingsError } = await supabaseAdmin
      .from('document_embeddings')
      .delete()
      .eq('document_id', documentId)

    if (embeddingsError) {
      console.error('Embeddings delete error:', embeddingsError)
      // Continue — embeddings are secondary
    }

    // Step 5: Delete chat_history linked to this document
    // Try with document_id column first
    const { error: chatHistoryError } = await supabaseAdmin
      .from('chat_history')
      .delete()
      .eq('user_id', userId)
      .eq('document_id', documentId)

    if (chatHistoryError) {
      // document_id column may not exist yet — fall back to deleting all user chat history
      console.warn('chat_history delete with document_id failed (column may not exist):', chatHistoryError.message)
      // Attempt fallback without document_id filter — only if document_id column doesn't exist
      if (chatHistoryError.message?.includes('document_id') || chatHistoryError.code === '42703') {
        await supabaseAdmin
          .from('chat_history')
          .delete()
          .eq('user_id', userId)
        console.log('[DELETE] Fallback: deleted all chat_history for user')
      }
    }

    // Step 6: Delete the document record itself
    const { error: docDeleteError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('uploaded_by', userId)

    if (docDeleteError) {
      console.error('Document delete error:', docDeleteError)
      return NextResponse.json({ error: docDeleteError.message }, { status: 500 })
    }

    console.log('[DELETE] Successfully deleted document:', documentId)
    return NextResponse.json({ success: true, message: 'Chat and document deleted permanently' })

  } catch (err: any) {
    console.error('Delete API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Keep POST for backward compatibility but redirect to DELETE logic
export async function POST(request: NextRequest) {
  return DELETE(request)
}
