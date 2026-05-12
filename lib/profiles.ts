import { getSupabase, getSessionId } from './supabase'
import type { BrewInput, BrewProfile } from './engine'

export interface SavedProfile {
  id: string
  name: string
  date: string
  input: BrewInput
  output: BrewProfile
}

const STORAGE_KEY = 'brewProfiles_saved_v2'

// ── localStorage helpers ───────────────────────────────────────────────────

export function getLocalProfiles(): SavedProfile[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SavedProfile[]
  } catch {
    return []
  }
}

function setLocalProfiles(profiles: SavedProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

// ── Supabase helpers ───────────────────────────────────────────────────────

export async function syncToSupabase(profile: SavedProfile) {
  const sb = getSupabase()
  if (!sb) return
  await sb.from('brew_profiles').insert({
    id:         profile.id,
    session_id: getSessionId(),
    name:       profile.name,
    input:      profile.input,
    output:     profile.output,
  })
}

export async function deleteFromSupabase(id: string) {
  const sb = getSupabase()
  if (!sb) return
  await sb.from('brew_profiles').delete().eq('id', id).eq('session_id', getSessionId())
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function saveProfile(name: string, input: BrewInput, output: BrewProfile): Promise<SavedProfile> {
  const profile: SavedProfile = {
    id:     crypto.randomUUID(),
    name,
    date:   new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    input,
    output,
  }
  const existing = getLocalProfiles()
  setLocalProfiles([profile, ...existing])
  syncToSupabase(profile).catch(console.error)
  return profile
}

export async function deleteProfile(id: string): Promise<void> {
  setLocalProfiles(getLocalProfiles().filter(p => p.id !== id))
  deleteFromSupabase(id).catch(console.error)
}
