'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'

export function AuthListener() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Create user profile on signup
          try {
            await fetch('/api/auth/create-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: session.user.id,
                email: session.user.email,
                fullName: session.user.user_metadata?.full_name || ''
              })
            })
          } catch (err) {
            console.error('Failed to create user profile:', err)
          }
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return null
}
