'use client'

import { useEffect, useState } from 'react'
import { formatTemp, type TempUnit } from '@/lib/tempUtils'

interface Props {
  bloomTempC: number
  pulseTempListC: number[]
  unit: TempUnit
  bloomLabel: string
  pulseLabel: string
}

export default function PulseBars({ bloomTempC, pulseTempListC, unit, bloomLabel, pulseLabel }: Props) {
  const [mounted, setMounted] = useState(false)
  const allTemps = [bloomTempC, ...pulseTempListC]
  const maxTemp = Math.max(...allTemps)
  const minTemp = Math.min(...allTemps) - 10
  const range = maxTemp - minTemp || 1

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [bloomTempC, pulseTempListC])

  function heightPct(temp: number) {
    return ((temp - minTemp) / range) * 70 + 30
  }

  const bars = [
    { temp: bloomTempC, label: bloomLabel, isBloom: true },
    ...pulseTempListC.map((temp, i) => ({ temp, label: `${pulseLabel} ${i + 1}`, isBloom: false })),
  ]

  return (
    <div className="pulse-bars">
      {bars.map(({ temp, label, isBloom }) => (
        <div key={label} className="pulse-bar-wrapper">
          <span className="pulse-bar-temp">{formatTemp(temp, unit)}</span>
          <div
            className={`pulse-bar ${isBloom ? 'pulse-bar-bloom' : 'pulse-bar-pulse'}`}
            style={{ height: mounted ? `${heightPct(temp)}%` : '0%' }}
          />
          <span className="pulse-bar-label">{label}</span>
        </div>
      ))}
    </div>
  )
}
