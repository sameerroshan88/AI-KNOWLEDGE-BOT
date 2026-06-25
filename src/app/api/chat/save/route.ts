import { NextRequest, NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { userId, question, answer, documentId } = await request.json()

    if (!userId || !question || !answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const chatRow: Record<string, any> = {
      user_id: userId,
      question: question,
      answer: answer,
      created_at: new Date().toISOString()
    }

    if (documentId) {
      chatRow.document_id = documentId
    }

    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .insert([chatRow])
      .select()
      .single()

    if (error) {
      console.error('Chat history insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, chatId: data.id })

  } catch (err: any) {
    console.error('Chat save API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
