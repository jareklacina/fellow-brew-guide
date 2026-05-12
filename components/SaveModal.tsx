'use client'

import { useEffect, useRef, useState } from 'react'
import type { BrewInput } from '@/lib/engine'
import { t, type Lang } from '@/lib/i18n'

interface Props {
  input: BrewInput
  lang: Lang
  onSave: (name: string) => void
  onClose: () => void
}

const ORIGIN_LABELS: Record<string, string> = {
  ethiopia: 'Ethiopia', kenya: 'Kenya', rwanda: 'Rwanda',
  colombia: 'Colombia', guatemala: 'Guatemala', 'costa-rica': 'Costa Rica',
  honduras: 'Honduras', panama: 'Panama', peru: 'Peru', mexico: 'Mexico',
  brazil: 'Brazil', yemen: 'Yemen', indonesia: 'Indonesia', blend: 'Blend',
}

function buildSuggestedName(input: BrewInput, lang: Lang): string {
  const tr = t[lang]
  const roastLabels: Record<BrewInput['roast'], string> = {
    light: tr.light, 'medium-light': tr.medLight, medium: tr.medium,
    'medium-dark': tr.medDark, dark: tr.dark,
  }
  const parts = [ORIGIN_LABELS[input.origin] ?? input.origin]
  if (input.peaberry) parts.push(tr.peaberry)
  if (input.decaf)    parts.push(tr.decaf)
  parts.push(roastLabels[input.roast])
  return parts.join(' — ')
}

export default function SaveModal({ input, lang, onSave, onClose }: Props) {
  const tr = t[lang]
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(buildSuggestedName(input, lang))
    setTimeout(() => inputRef.current?.select(), 80)
  }, [input, lang])

  function handleSave() {
    const trimmed = name.trim()
    if (trimmed) onSave(trimmed)
  }

  return (
    <div className="modal-overlay visible" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{tr.saveTitle}</h3>
        <p>{tr.saveDesc}</p>
        <input
          ref={inputRef}
          type="text"
          className="modal-input"
          value={name}
          maxLength={60}
          placeholder={tr.savePlaceholder}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn-secondary" onClick={onClose}>{tr.cancel}</button>
          <button type="button" className="modal-btn modal-btn-primary" onClick={handleSave}>{tr.save}</button>
        </div>
      </div>
    </div>
  )
}
