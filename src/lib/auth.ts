import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export type { User, Session }

export interface Profile {
  id: string
  dealership_id: string
  email: string
  full_name: string
  role: 'owner' | 'manager' | 'rep'
  created_at: string
  updated_at: string
}

export async function signInWithMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/owner`,
    },
  })
}

export async function getSession() {
  return supabase.auth.getSession()
}

export async function getProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return data as Profile | null
}

export async function signOut() {
  return supabase.auth.signOut()
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}
