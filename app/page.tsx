'use client'

import { useState, useCallback } from 'react'
import BrewForm from '@/components/BrewForm'
import BrewResult from '@/components/BrewResult'
import SavedProfiles from '@/components/SavedProfiles'
import SaveModal from '@/components/SaveModal'
import DialInGuide from '@/components/DialInGuide'
import { generateProfile, type BrewInput, type BrewProfile } from '@/lib/engine'
import { saveProfile, deleteProfile, getLocalProfiles, type SavedProfile } from '@/lib/profiles'
import { type TempUnit } from '@/lib/tempUtils'
import { t, type Lang } from '@/lib/i18n'

export default function HomePage() {
  const [profile, setProfile] = useState<BrewProfile | null>(null)
  const [currentInput, setCurrentInput] = useState<BrewInput | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>(() => getLocalProfiles())
  const [toast, setToast] = useState<string | null>(null)
  const [unit, setUnit] = useState<TempUnit>('C')
  const [lang, setLang] = useState<Lang>('en')

  const tr = t[lang]

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const handleGenerate = useCallback((input: BrewInput) => {
    setProfile(generateProfile(input, lang))
    setCurrentInput(input)
  }, [lang])

  const handleReset = useCallback(() => {
    setProfile(null)
    setCurrentInput(null)
  }, [])

  async function handleSave(name: string) {
    if (!currentInput || !profile) return
    const saved = await saveProfile(name, currentInput, profile)
    setSavedProfiles(prev => [saved, ...prev])
    setShowSaveModal(false)
    showToast(`"${name}" ${tr.saved}`)
  }

  async function handleDelete(id: string) {
    await deleteProfile(id)
    setSavedProfiles(prev => prev.filter(p => p.id !== id))
  }

  function handleLoad(saved: SavedProfile) {
    setCurrentInput(saved.input)
    setProfile(saved.output)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">☕</span>
            <span className="logo-text">{tr.appName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="header-subtitle">{tr.appSubtitle}</span>
            <div className="temp-toggle">
              <button
                type="button"
                className={`temp-toggle-btn${lang === 'en' ? ' active' : ''}`}
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                title="English"
              >
                ENG
              </button>
              <button
                type="button"
                className={`temp-toggle-btn${lang === 'cs' ? ' active' : ''}`}
                onClick={() => setLang('cs')}
                aria-pressed={lang === 'cs'}
                title="Čeština"
              >
                CZ
              </button>
            </div>
            <div className="temp-toggle">
              <button
                type="button"
                className={`temp-toggle-btn${unit === 'C' ? ' active' : ''}`}
                onClick={() => setUnit('C')}
                aria-pressed={unit === 'C'}
              >
                °C
              </button>
              <button
                type="button"
                className={`temp-toggle-btn${unit === 'F' ? ' active' : ''}`}
                onClick={() => setUnit('F')}
                aria-pressed={unit === 'F'}
              >
                °F
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <p className="hero-subtitle">{tr.heroSubtitle}</p>
          <h1>{tr.heroTitle}</h1>
          <p>{tr.heroDesc}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
            <a href="https://buymeacoffee.com/jarek.lacina" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>
              ☕ {tr.buyMeCoffee}
            </a>
          </p>
        </div>

        <div className="app-container">
          <BrewForm onGenerate={handleGenerate} lang={lang} />

          <div className="output-panel">
            {profile ? (
              <BrewResult
                profile={profile}
                unit={unit}
                lang={lang}
                onSave={() => setShowSaveModal(true)}
                onReset={handleReset}
              />
            ) : (
              <div className="panel output-placeholder">
                <span style={{ fontSize: '3rem' }}>☕</span>
                <p>{tr.placeholderText} <strong>{tr.placeholderBtn}</strong> {tr.placeholderTo}</p>
              </div>
            )}
          </div>
        </div>

        <SavedProfiles
          profiles={savedProfiles}
          unit={unit}
          lang={lang}
          onLoad={handleLoad}
          onDelete={handleDelete}
        />

        <DialInGuide lang={lang} />

        <footer style={{ textAlign: 'center', padding: '2.5rem 1.5rem', borderTop: '1px solid var(--color-border-light)', maxWidth: '600px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {tr.footerDisclaimer}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
            {tr.footerInspired}{' '}
            <a href="https://brewcommons.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
              Brew Commons
            </a>.
            {' '}{tr.footerTagline}
          </p>
        </footer>
      </main>

      {showSaveModal && currentInput && (
        <SaveModal
          input={currentInput}
          lang={lang}
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {toast && (
        <div className="toast visible">{toast}</div>
      )}
    </>
  )
}
