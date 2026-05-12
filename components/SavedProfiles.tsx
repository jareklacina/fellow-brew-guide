'use client'

import type { SavedProfile } from '@/lib/profiles'
import type { BrewInput } from '@/lib/engine'
import { formatTemp, type TempUnit } from '@/lib/tempUtils'
import { t, type Lang } from '@/lib/i18n'

interface Props {
  profiles: SavedProfile[]
  unit: TempUnit
  lang: Lang
  onLoad: (profile: SavedProfile) => void
  onDelete: (id: string) => void
}

const ORIGIN_LABELS: Record<string, string> = {
  ethiopia: 'Ethiopia', kenya: 'Kenya', rwanda: 'Rwanda',
  colombia: 'Colombia', guatemala: 'Guatemala', 'costa-rica': 'Costa Rica',
  honduras: 'Honduras', panama: 'Panama', peru: 'Peru', mexico: 'Mexico',
  brazil: 'Brazil', yemen: 'Yemen', indonesia: 'Indonesia', blend: 'Blend',
}

export default function SavedProfiles({ profiles, unit, lang, onLoad, onDelete }: Props) {
  if (profiles.length === 0) return null

  const tr = t[lang]

  const roastLabels: Record<BrewInput['roast'], string> = {
    light: tr.light, 'medium-light': tr.medLight, medium: tr.medium,
    'medium-dark': tr.medDark, dark: tr.dark,
  }

  const processLabels: Record<BrewInput['processing'], string> = {
    washed: tr.washed, natural: tr.natural, honey: tr.honey, anaerobic: tr.anaerobic,
  }

  return (
    <section className="saved-section panel" style={{ marginTop: '2rem' }}>
      <h2 className="panel-title">{tr.savedProfiles}</h2>
      <div className="saved-grid">
        {profiles.map(p => (
          <div key={p.id} className="saved-card" onClick={() => onLoad(p)}>
            <div className="saved-card-header">
              <span className="saved-card-name">{p.name}</span>
              <span className="saved-card-date">{p.date}</span>
            </div>
            <div className="saved-card-tags">
              <span className="saved-tag">{roastLabels[p.input.roast]}</span>
              <span className="saved-tag">{ORIGIN_LABELS[p.input.origin] ?? p.input.origin}</span>
              <span className="saved-tag">{processLabels[p.input.processing]}</span>
              <span className="saved-tag">{p.input.brewSize === 'batch' ? tr.batchBrew : tr.singleServe}</span>
              {p.input.peaberry && <span className="saved-tag">{tr.peaberry}</span>}
              {p.input.decaf    && <span className="saved-tag">{tr.decaf}</span>}
            </div>
            <div className="saved-card-summary">
              Ode 2: {p.output.grindDisplay} · {formatTemp(p.output.brewTempC, unit)} · 1:{p.output.ratio.toFixed(1)} · {p.output.pulseCount} {lang === 'cs' ? 'pulsy' : 'pulses'}
            </div>
            <button
              type="button"
              className="saved-card-delete"
              aria-label="Delete profile"
              onClick={e => { e.stopPropagation(); onDelete(p.id) }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
