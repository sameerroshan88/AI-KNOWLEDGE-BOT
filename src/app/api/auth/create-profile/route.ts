import { NextRequest, NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName } = await request.json()

    const { error } = await supabaseAdmin
      .from('users')
      .upsert([{
        id: userId,
        email: email,
        full_name: fullName || email.split('@')[0],
        role: 'student',
        created_at: new Date().toISOString()
      }], { onConflict: 'id' })

    if (error) {
      console.error('Profile create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
