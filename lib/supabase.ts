import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  if (!_client) _client = createClient(url, key)
  return _client
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('brew_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('brew_session_id', id)
  }
  return id
}
