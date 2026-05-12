import { t, type Lang } from '@/lib/i18n'

interface Props {
  lang: Lang
}

export default function DialInGuide({ lang }: Props) {
  const tr = t[lang]

  const cards = [
    {
      type: 'sour',
      title: tr.sourTitle,
      diagnosis: tr.sourDiag,
      fixes: [tr.sourFix1, tr.sourFix2, tr.sourFix3, tr.sourFix4],
    },
    {
      type: 'bitter',
      title: tr.bitterTitle,
      diagnosis: tr.bitterDiag,
      fixes: [tr.bitterFix1, tr.bitterFix2, tr.bitterFix3, tr.bitterFix4],
    },
    {
      type: 'weak',
      title: tr.weakTitle,
      diagnosis: tr.weakDiag,
      fixes: [tr.weakFix1, tr.weakFix2, tr.weakFix3],
    },
    {
      type: 'strong',
      title: tr.strongTitle,
      diagnosis: tr.strongDiag,
      fixes: [tr.strongFix1, tr.strongFix2, tr.strongFix3],
    },
  ]

  const iconMap: Record<string, string> = {
    sour: '🟡', bitter: '🔴', weak: '🔵', strong: '🟢',
  }

  return (
    <section className="troubleshoot-section">
      <h2 className="panel-title" style={{ marginBottom: '1.25rem' }}>{tr.dialInTitle}</h2>
      <div className="troubleshoot-grid">
        {cards.map(card => (
          <div key={card.type} className="troubleshoot-card">
            <div className={`troubleshoot-icon ${card.type}`}>
              <span style={{ fontSize: '1.4rem' }}>{iconMap[card.type]}</span>
            </div>
            <h3>{card.title}</h3>
            <p className="troubleshoot-diagnosis">{card.diagnosis}</p>
            <ul>
              {card.fixes.map((fix, i) => <li key={i}>{fix}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
