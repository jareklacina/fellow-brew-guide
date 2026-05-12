import type { BrewInput, BrewProfile } from './engine'

export interface SavedProfile {
  id: string
  name: string
  date: string
  input: BrewInput
  output: BrewProfile
}

const STORAGE_KEY = 'brewProfiles_saved_v2'

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

export async function saveProfile(name: string, input: BrewInput, output: BrewProfile): Promise<SavedProfile> {
  const profile: SavedProfile = {
    id:     crypto.randomUUID(),
    name,
    date:   new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    input,
    output,
  }
  setLocalProfiles([profile, ...getLocalProfiles()])
  return profile
}

export async function deleteProfile(id: string): Promise<void> {
  setLocalProfiles(getLocalProfiles().filter(p => p.id !== id))
}
