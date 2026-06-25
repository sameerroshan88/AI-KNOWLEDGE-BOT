import { NextRequest, NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    console.log('[TEST API] Testing database connection...')

    // Test if we can query the documents table
    const { data, error } = await supabaseAdmin
      .from('documents')
      .select('count', { count: 'exact' })
      .limit(1)

    if (error) {
      console.error('[TEST API] Database error:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      }, { status: 500 })
    }

    console.log('[TEST API] Database connection successful')
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection works',
      data
    })

  } catch (err: any) {
    console.error('[TEST API] Exception:', err)
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      stack: err.stack
    }, { status: 500 })
  }
}
