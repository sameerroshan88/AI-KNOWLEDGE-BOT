import { NextRequest, NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

// GET /api/chat/history?userId=xxx&documentId=yyy
// Fetches all chat messages for a document using the service role key (bypasses RLS)
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const documentId = request.nextUrl.searchParams.get('documentId')

    if (!userId || !documentId) {
      return NextResponse.json({ error: 'Missing userId or documentId' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .select('id, question, answer, created_at')
      .eq('user_id', userId)
      .eq('document_id', documentId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[API CHAT HISTORY] Fetch error:', error)
      // If error is about missing column (document_id not yet added), return empty gracefully
      if (error.message?.includes('document_id') || error.code === '42703') {
        return NextResponse.json({ data: [], warning: 'document_id column not yet added to chat_history' })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (err: any) {
    console.error('[API CHAT HISTORY] Exception:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
