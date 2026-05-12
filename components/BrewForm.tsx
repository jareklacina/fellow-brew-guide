'use client'

import { useState } from 'react'
import type { BrewInput } from '@/lib/engine'
import { t, type Lang } from '@/lib/i18n'

const ORIGINS = [
  { value: 'ethiopia',    label: 'Ethiopia' },
  { value: 'kenya',       label: 'Kenya' },
  { value: 'rwanda',      label: 'Rwanda' },
  { value: 'colombia',    label: 'Colombia' },
  { value: 'guatemala',   label: 'Guatemala' },
  { value: 'costa-rica',  label: 'Costa Rica' },
  { value: 'honduras',    label: 'Honduras' },
  { value: 'panama',      label: 'Panama' },
  { value: 'peru',        label: 'Peru' },
  { value: 'mexico',      label: 'Mexico' },
  { value: 'brazil',      label: 'Brazil' },
  { value: 'yemen',       label: 'Yemen' },
  { value: 'indonesia',   label: 'Indonesia' },
  { value: 'blend',       label: 'Blend' },
]

const ROASTS: { value: BrewInput['roast']; color: string }[] = [
  { value: 'light',        color: '#d4a574' },
  { value: 'medium-light', color: '#b8875a' },
  { value: 'medium',       color: '#8b5e3c' },
  { value: 'medium-dark',  color: '#5c3a24' },
  { value: 'dark',         color: '#2c1810' },
]

const PROCESSING: { value: BrewInput['processing'] }[] = [
  { value: 'washed' }, { value: 'natural' }, { value: 'honey' }, { value: 'anaerobic' },
]

const ELEVATION_PRESETS = [
  { value: 800,  label: '800m' },
  { value: 1400, label: '1400m' },
  { value: 1800, label: '1800m' },
  { value: 2100, label: '2100m' },
]

const VARIETY_GROUP_KEYS = [
  'vgEthiopianLandrace', 'vgBourbon', 'vgTypica', 'vgGeshaSL',
  'vgCatuai', 'vgCatimor', 'vgF1', 'vgOther',
] as const

type VgKey = typeof VARIETY_GROUP_KEYS[number]

const VARIETY_GROUPS_DATA: { key: VgKey; options: { value: string; label: string }[] }[] = [
  { key: 'vgEthiopianLandrace', options: [
    { value: 'ethiopian-landrace', label: 'Ethiopian Landrace (general)' },
    { value: 'jarc-74158',  label: 'JARC 74158' },
    { value: 'jarc-74110',  label: 'JARC 74110' },
    { value: 'jarc-74112',  label: 'JARC 74112' },
    { value: 'kurume',      label: 'Kurume' },
    { value: 'dega',        label: 'Dega' },
    { value: 'wush-wush',   label: 'Wush Wush' },
  ]},
  { key: 'vgBourbon', options: [
    { value: 'red-bourbon',    label: 'Red Bourbon' },
    { value: 'yellow-bourbon', label: 'Yellow Bourbon' },
    { value: 'pink-bourbon',   label: 'Pink Bourbon' },
    { value: 'orange-bourbon', label: 'Orange Bourbon' },
    { value: 'caturra',        label: 'Caturra' },
    { value: 'villa-sarchi',   label: 'Villa Sarchi' },
    { value: 'pacas',          label: 'Pacas' },
  ]},
  { key: 'vgTypica', options: [
    { value: 'typica',        label: 'Typica' },
    { value: 'kona',          label: 'Kona' },
    { value: 'blue-mountain', label: 'Blue Mountain' },
    { value: 'maragogipe',    label: 'Maragogipe' },
    { value: 'mundo-novo',    label: 'Mundo Novo' },
    { value: 'java',          label: 'Java' },
  ]},
  { key: 'vgGeshaSL', options: [
    { value: 'gesha', label: 'Gesha / Geisha' },
    { value: 'sl28',  label: 'SL28' },
    { value: 'sl34',  label: 'SL34' },
  ]},
  { key: 'vgCatuai', options: [
    { value: 'red-catuai',    label: 'Red Catuai' },
    { value: 'yellow-catuai', label: 'Yellow Catuai' },
    { value: 'pacamara',      label: 'Pacamara' },
    { value: 'maracaturra',   label: 'Maracaturra' },
  ]},
  { key: 'vgCatimor', options: [
    { value: 'catimor',    label: 'Catimor' },
    { value: 'sarchimor',  label: 'Sarchimor' },
    { value: 'castillo',   label: 'Castillo' },
    { value: 'parainema',  label: 'Parainema' },
    { value: 'ruiru-11',   label: 'Ruiru 11' },
    { value: 'obata',      label: 'Obatã' },
    { value: 'marsellesa', label: 'Marsellesa' },
  ]},
  { key: 'vgF1', options: [
    { value: 'centroamericano', label: 'Centroamericano' },
    { value: 'starmaya',        label: 'Starmaya' },
    { value: 'batian',          label: 'Batian' },
    { value: 'tabi',            label: 'Tabi' },
  ]},
  { key: 'vgOther', options: [
    { value: 'not-listed', label: '' },
  ]},
]

const DEFAULT_INPUT: BrewInput = {
  roast: 'medium', origin: 'ethiopia', varieties: [],
  peaberry: false, decaf: false,
  processing: 'washed', elevation: 1400, brewSize: 'single',
  sliders: { fruit: 50, body: 50, acidity: 50, floral: 50, strength: 50 },
}

interface Props {
  onGenerate: (input: BrewInput) => void
  lang: Lang
}

export default function BrewForm({ onGenerate, lang }: Props) {
  const [input, setInput] = useState<BrewInput>(DEFAULT_INPUT)
  const tr = t[lang]

  function set<K extends keyof BrewInput>(key: K, value: BrewInput[K]) {
    setInput(prev => ({ ...prev, [key]: value }))
  }

  function setSlider(key: keyof BrewInput['sliders'], value: number) {
    setInput(prev => ({ ...prev, sliders: { ...prev.sliders, [key]: value } }))
  }

  function toggleVariety(value: string) {
    setInput(prev => ({
      ...prev,
      varieties: prev.varieties.includes(value)
        ? prev.varieties.filter(v => v !== value)
        : [...prev.varieties, value],
    }))
  }

  function getElevationPresetActive(preset: number) {
    const v = input.elevation
    if (preset === 800  && v < 1000)  return true
    if (preset === 1400 && v >= 1000 && v < 1600) return true
    if (preset === 1800 && v >= 1600 && v < 1950) return true
    if (preset === 2100 && v >= 1950) return true
    return false
  }

  function getVarietyLabel(value: string) {
    for (const g of VARIETY_GROUPS_DATA)
      for (const o of g.options)
        if (o.value === value) return value === 'not-listed' ? tr.notListed : o.label
    return value
  }

  const roastLabels: Record<BrewInput['roast'], string> = {
    light: tr.light, 'medium-light': tr.medLight, medium: tr.medium,
    'medium-dark': tr.medDark, dark: tr.dark,
  }

  const processLabels: Record<BrewInput['processing'], string> = {
    washed: tr.washed, natural: tr.natural, honey: tr.honey, anaerobic: tr.anaerobic,
  }

  const sliders: { key: keyof BrewInput['sliders']; left: string; right: string }[] = [
    { key: 'fruit',    left: tr.fruity,     right: tr.chocolatey },
    { key: 'body',     left: tr.lightBody,  right: tr.fullBody },
    { key: 'acidity',  left: tr.bright,     right: tr.smooth },
    { key: 'floral',   left: tr.floral,     right: tr.nutty },
    { key: 'strength', left: tr.delicate,   right: tr.bold },
  ]

  return (
    <div className="panel">
      <h2 className="panel-title">{tr.yourCoffee}</h2>

      {/* Roast */}
      <div className="field-group">
        <span className="field-label">{tr.roastLevel}</span>
        <div className="roast-selector">
          {ROASTS.map(r => (
            <button
              key={r.value}
              type="button"
              className={`roast-btn${input.roast === r.value ? ' active' : ''}`}
              onClick={() => set('roast', r.value)}
            >
              <span className="roast-dot" style={{ background: r.color }} />
              {roastLabels[r.value]}
            </button>
          ))}
        </div>
      </div>

      {/* Origin */}
      <div className="field-group">
        <label className="field-label" htmlFor="beanOrigin">{tr.origin}</label>
        <select
          id="beanOrigin"
          className="select-field"
          value={input.origin}
          onChange={e => set('origin', e.target.value)}
        >
          {ORIGINS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Variety */}
      <div className="field-group">
        <span className="field-label">
          {tr.variety} <span className="field-hint">{tr.varietyHint}</span>
        </span>
        <select
          className="select-field select-multi"
          multiple
          value={input.varieties}
          onChange={e => {
            const selected = Array.from(e.target.selectedOptions).map(o => o.value)
            set('varieties', selected)
          }}
        >
          {VARIETY_GROUPS_DATA.map(g => (
            <optgroup key={g.key} label={tr[g.key]}>
              {g.options.map(o => (
                <option key={o.value} value={o.value}>
                  {o.value === 'not-listed' ? tr.notListed : o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {input.varieties.length > 0 && (
          <div className="variety-tags">
            {input.varieties.map(v => (
              <span key={v} className="variety-tag">
                <span className="variety-tag-text">{getVarietyLabel(v)}</span>
                <button
                  type="button"
                  className="variety-tag-remove"
                  aria-label={`Remove ${getVarietyLabel(v)}`}
                  onClick={() => toggleVariety(v)}
                >×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Peaberry + Decaf */}
      <div className="field-group">
        <div className="field-group-inline">
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={input.peaberry}
              onChange={e => set('peaberry', e.target.checked)}
            />
            <span className="checkbox-custom" />
            <span className="checkbox-text">{tr.peaberry}</span>
          </label>
          <span className="field-hint-inline">{tr.peaberryHint}</span>

          <label className="checkbox-label" style={{ marginLeft: '1rem' }}>
            <input
              type="checkbox"
              className="checkbox-input"
              checked={input.decaf}
              onChange={e => set('decaf', e.target.checked)}
            />
            <span className="checkbox-custom" />
            <span className="checkbox-text">{tr.decaf}</span>
          </label>
          <span className="field-hint-inline">{tr.decafHint}</span>
        </div>
      </div>

      {/* Processing */}
      <div className="field-group">
        <span className="field-label">{tr.processing}</span>
        <div className="pill-selector">
          {PROCESSING.map(p => (
            <button
              key={p.value}
              type="button"
              className={`pill-btn${input.processing === p.value ? ' active' : ''}`}
              onClick={() => set('processing', p.value)}
            >
              {processLabels[p.value]}
            </button>
          ))}
        </div>
      </div>

      {/* Elevation */}
      <div className="field-group">
        <span className="field-label">{tr.elevation}</span>
        <div className="elevation-row">
          <input
            type="number"
            className="elevation-input"
            value={input.elevation}
            min={0}
            max={3000}
            onChange={e => set('elevation', parseInt(e.target.value, 10) || 0)}
          />
          <span className="elevation-unit">MASL</span>
        </div>
        <div className="elevation-presets">
          {ELEVATION_PRESETS.map(p => (
            <button
              key={p.value}
              type="button"
              className={`elevation-preset-btn${getElevationPresetActive(p.value) ? ' active' : ''}`}
              onClick={() => set('elevation', p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brew Size */}
      <div className="field-group">
        <span className="field-label">{tr.brewSize}</span>
        <div className="pill-selector">
          <button
            type="button"
            className={`pill-btn${input.brewSize === 'single' ? ' active' : ''}`}
            onClick={() => set('brewSize', 'single')}
          >
            {tr.singleServe}
          </button>
          <button
            type="button"
            className={`pill-btn${input.brewSize === 'batch' ? ' active' : ''}`}
            onClick={() => set('brewSize', 'batch')}
          >
            {tr.batchBrew}
          </button>
        </div>
      </div>

      {/* Taste Sliders */}
      <div className="field-group">
        <span className="field-label">{tr.tastePrefs}</span>
        <div className="sliders-container">
          {sliders.map(s => (
            <div key={s.key} className="slider-row">
              <span className="slider-label-left">{s.left}</span>
              <input
                type="range"
                className="taste-slider"
                min={0}
                max={100}
                value={input.sliders[s.key]}
                onChange={e => setSlider(s.key, parseInt(e.target.value, 10))}
              />
              <span className="slider-label-right">{s.right}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="generate-btn"
        onClick={() => onGenerate(input)}
      >
        {tr.generateBtn}
      </button>
    </div>
  )
}
