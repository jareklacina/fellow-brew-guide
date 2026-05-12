export type TempUnit = 'C' | 'F'

export function cToF(c: number): number {
  return Math.round(c * 9 / 5 + 32)
}

export function formatTemp(c: number, unit: TempUnit): string {
  return unit === 'C' ? `${c}°C` : `${cToF(c)}°F`
}

// Converts all "XX°C" occurrences in a string to °F when unit is F.
// Used for tip texts and explanation reasons that have temperatures embedded.
export function convertTempsInText(text: string, unit: TempUnit): string {
  if (unit === 'C') return text
  return text.replace(/(\d+(?:\.\d+)?)°C/g, (_, c) => `${Math.round(parseFloat(c) * 9 / 5 + 32)}°F`)
}
