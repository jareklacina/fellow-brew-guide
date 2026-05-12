'use client'

import { useState } from 'react'
import type { BrewProfile } from '@/lib/engine'
import { formatTemp, convertTempsInText, type TempUnit } from '@/lib/tempUtils'
import { t, type Lang } from '@/lib/i18n'
import PulseBars from './PulseBars'

interface Props {
  profile: BrewProfile
  unit: TempUnit
  lang: Lang
  onSave: () => void
  onReset: () => void
}

type Tab = 'tips' | 'explanation'

export default function BrewResult({ profile, unit, lang, onSave, onReset }: Props) {
  const [tab, setTab] = useState<Tab>('tips')
  const tr = t[lang]

  return (
    <div className="panel">
      <h2 className="panel-title">{tr.yourBrewProfile}</h2>

      {/* Ode 2 */}
      <div className="result-section">
        <h3 className="result-title">
          <span>⚙️</span> {tr.ode2Grind.replace('⚙️ ', '')}
        </h3>
        <div className="settings-grid">
          <div className="setting-card">
            <span className="setting-value">{profile.grindDisplay}</span>
            <span className="setting-label">{tr.grindSetting}</span>
            <span className="setting-sublabel">{tr.grindSubLabel}</span>
          </div>
          <div className="setting-card">
            <span className="setting-value">~{profile.microns}μm</span>
            <span className="setting-label">{tr.particleSize}</span>
          </div>
          <div className="setting-card">
            <span className="setting-value">{profile.doseG}g</span>
            <span className="setting-label">{tr.coffeeDose}</span>
            <span className="setting-sublabel">→ {profile.waterMl}ml water</span>
          </div>
        </div>
      </div>

      {/* Aiden */}
      <div className="result-section">
        <h3 className="result-title">
          <span>☕</span> {tr.aidenSettings.replace('☕ ', '')}
        </h3>
        <div className="settings-grid">
          <div className="setting-card">
            <span className="setting-value">{formatTemp(profile.brewTempC, unit)}</span>
            <span className="setting-label">{tr.brewTemp}</span>
          </div>
          <div className="setting-card">
            <span className="setting-value">1:{profile.ratio.toFixed(1)}</span>
            <span className="setting-label">{tr.ratio}</span>
          </div>
          <div className="setting-card">
            <span className="setting-value">{formatTemp(profile.bloomTempC, unit)}</span>
            <span className="setting-label">{tr.bloomTemp}</span>
            <span className="setting-sublabel">1:{profile.bloomRatio} · {profile.bloomDuration}{tr.seconds}</span>
          </div>
          <div className="setting-card">
            <span className="setting-value">{profile.pulseCount}</span>
            <span className="setting-label">{tr.pulses}</span>
            <span className="setting-sublabel">{tr.every} {profile.pulseInterval}{tr.seconds}</span>
          </div>
        </div>

        <div className="pulse-profile">
          <p className="pulse-title">{tr.pulseTempProfile}</p>
          <PulseBars
            bloomTempC={profile.bloomTempC}
            pulseTempListC={profile.pulseTempListC}
            unit={unit}
            bloomLabel={tr.bloom}
            pulseLabel={tr.pulse}
          />
        </div>
      </div>

      {/* Tabs: Tips / Explanation */}
      <div className="tabs-container">
        <nav className="tabs-nav">
          <button
            type="button"
            className={`tab-btn${tab === 'tips' ? ' active' : ''}`}
            onClick={() => setTab('tips')}
            aria-selected={tab === 'tips'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {tr.tips}
          </button>
          <button
            type="button"
            className={`tab-btn${tab === 'explanation' ? ' active' : ''}`}
            onClick={() => setTab('explanation')}
            aria-selected={tab === 'explanation'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {tr.whySettings}
          </button>
        </nav>

        {tab === 'tips' && (
          <div className="tab-panel active">
            <div className="tips-content">
              {profile.tips.map((tip, i) => (
                <div key={i} className="tip-item">
                  <span className="tip-icon">{tip.icon}</span>
                  <span className="tip-text">{convertTempsInText(tip.text, unit)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'explanation' && (
          <div className="tab-panel active">
            <div className="explanation-content">
              {profile.explanation.map((exp, i) => (
                <div key={i} className="explanation-block">
                  <div className="explanation-header">
                    <span className="explanation-param">{exp.param}</span>
                    <span className="explanation-value">{convertTempsInText(exp.value, unit)}</span>
                  </div>
                  <p className="explanation-summary">{convertTempsInText(exp.summary, unit)}</p>
                  <ul className="explanation-reasons">
                    {exp.reasons.map((r, j) => (
                      <li key={j}>{convertTempsInText(r, unit)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="result-actions" style={{ marginTop: '1.25rem' }}>
        <button type="button" className="action-btn" onClick={onSave}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {tr.saveProfile}
        </button>
        <button type="button" className="action-btn secondary" onClick={onReset}>
          {tr.reset}
        </button>
      </div>
    </div>
  )
}
