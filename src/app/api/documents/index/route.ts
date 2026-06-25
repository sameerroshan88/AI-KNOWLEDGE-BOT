import { NextRequest, NextResponse, after } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'
import { indexDocument } from '@/lib/indexer'

/**
 * POST /api/documents/index
 * Re-triggers the indexing pipeline for a specific document.
 * Body: { documentId: string, userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { documentId, userId } = await request.json()

    if (!documentId || !userId) {
      return NextResponse.json({ error: 'Missing documentId or userId' }, { status: 400 })
    }

    // 1. Verify that the document exists and is owned by the requesting user
    const { data: doc, error: fetchError } = await supabaseAdmin
      .from('documents')
      .select('id, uploaded_by')
      .eq('id', documentId)
      .eq('uploaded_by', userId)
      .single()

    if (fetchError || !doc) {
      console.error('[API INDEX] Document fetch error or unauthorized:', fetchError)
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 })
    }

    // 2. Set status to processing immediately (improves client UI response latency)
    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({ indexing_status: 'processing', indexing_error: null })
      .eq('id', documentId)

    if (updateError) {
      if (updateError.message.includes('indexing_status')) {
        console.warn('[API INDEX] indexing_status column not found. Skipping status update. Please run schema.sql!')
      } else {
        console.error('[API INDEX] Failed to set status to processing:', updateError)
        return NextResponse.json({ error: `Database update error: ${updateError.message}` }, { status: 500 })
      }
    }

    // 3. Trigger indexing asynchronously via Next.js 'after' API
    after(async () => {
      try {
        console.log(`[API INDEX] [BACKGROUND] Starting indexing for document ${documentId}`)
        await indexDocument(documentId, { force: true })
      } catch (err) {
        console.error(`[API INDEX] [BACKGROUND] Exception indexing document ${documentId}:`, err)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Indexing pipeline triggered successfully',
      status: 'processing',
    })
  } catch (err: any) {
    console.error('[API INDEX] Handler error:', err)
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 })
  }
}
