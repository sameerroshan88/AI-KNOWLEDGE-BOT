import { NextRequest, NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

// GET /api/documents?userId=xxx
// Fetches all documents for a user using the service role key (bypasses RLS)
// This is safe: server-side only, service key never sent to client
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    let { data, error } = await supabaseAdmin
      .from('documents')
      .select('id, filename, file_url, uploaded_at, document_type, indexing_status, indexing_error')
      .eq('uploaded_by', userId)
      .order('uploaded_at', { ascending: false })

    if (error && error.message.includes('indexing_status')) {
      console.warn('[API DOCUMENTS] indexing_status column not found. Falling back to query without indexing fields. Please run schema.sql in Supabase!')
      const fallbackQuery = await supabaseAdmin
        .from('documents')
        .select('id, filename, file_url, uploaded_at, document_type')
        .eq('uploaded_by', userId)
        .order('uploaded_at', { ascending: false })

      if (fallbackQuery.error) {
        console.error('[API DOCUMENTS] Fallback fetch error:', fallbackQuery.error)
        return NextResponse.json({ error: fallbackQuery.error.message }, { status: 500 })
      }

      data = (fallbackQuery.data ?? []).map((doc: any) => ({
        ...doc,
        indexing_status: 'completed',
        indexing_error: null
      }))
      error = null
    }

    if (error) {
      console.error('[API DOCUMENTS] Fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (err: any) {
    console.error('[API DOCUMENTS] Exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
