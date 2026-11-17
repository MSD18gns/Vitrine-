// Illustrations originales ANDOU DIINEMA (SVG, géométrie islamique, non figuratives)

const Star8 = ({ cx: x, cy: y, r: rad, fill = '#fff', opacity = 1 }) => {
  const cx = Number(x), cy = Number(y), r = Number(rad)
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI / 8) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.55 : r
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`
  }).join(' ')
  return <polygon points={pts} fill={fill} opacity={opacity} />
}

const MOTIFS = {
  eye: (
    <>
      <path d="M14 50 Q50 16 86 50 Q50 84 14 50 Z" fill="#fff" />
      <circle cx="50" cy="50" r="17" fill="#13865B" />
      <circle cx="56" cy="45" r="13" fill="#fff" />
      <Star8 cx="58" cy="47" r="5" fill="#075B40" />
    </>
  ),
  clock: (
    <>
      <path d="M32 18 h36 M32 82 h36" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <path d="M36 20 Q36 46 50 50 Q36 54 36 80 M64 20 Q64 46 50 50 Q64 54 64 80" stroke="#fff" strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M42 70 Q50 60 58 70 Z" fill="#E8F5ED" />
      <circle cx="50" cy="40" r="3" fill="#E8F5ED" />
    </>
  ),
  people: (
    <>
      <circle cx="36" cy="38" r="10" fill="#fff" />
      <circle cx="64" cy="38" r="10" fill="#E8F5ED" />
      <path d="M18 78 Q36 52 54 78 Z" fill="#fff" />
      <path d="M46 78 Q64 52 82 78 Z" fill="#E8F5ED" />
    </>
  ),
  shield: (
    <>
      <path d="M50 14 L80 26 V48 Q80 72 50 86 Q20 72 20 48 V26 Z" fill="#fff" />
      <Star8 cx="50" cy="50" r="15" fill="#13865B" />
    </>
  ),
  heart: (
    <>
      <path d="M50 82 C22 62 14 46 22 32 C30 18 46 22 50 34 C54 22 70 18 78 32 C86 46 78 62 50 82 Z" fill="#fff" />
      <path d="M50 66 C38 57 34 50 37 44 C40 38 47 40 50 45 C53 40 60 38 63 44 C66 50 62 57 50 66 Z" fill="#E8F5ED" />
    </>
  ),
  door: (
    <>
      <path d="M26 86 V44 Q26 16 50 14 Q74 16 74 44 V86 Z" fill="#fff" />
      <path d="M36 86 V48 Q36 28 50 26 Q64 28 64 48 V86 Z" fill="#13865B" />
      <path d="M50 30 Q60 40 56 60 L50 86 L44 60 Q40 40 50 30 Z" fill="#F7E7B4" opacity=".9" />
    </>
  ),
  moon: (
    <>
      <circle cx="46" cy="50" r="30" fill="#fff" />
      <circle cx="58" cy="42" r="26" fill="url(#mg)" />
      <Star8 cx="72" cy="30" r="8" fill="#fff" />
    </>
  ),
  tree: (
    <>
      <rect x="46" y="54" width="8" height="30" rx="3" fill="#fff" />
      <circle cx="50" cy="40" r="22" fill="#fff" />
      <circle cx="36" cy="52" r="13" fill="#E8F5ED" />
      <circle cx="64" cy="52" r="13" fill="#E8F5ED" />
      <circle cx="44" cy="36" r="3" fill="#13865B" /><circle cx="57" cy="42" r="3" fill="#13865B" />
    </>
  ),
  star: (
    <>
      <Star8 cx="50" cy="50" r="34" fill="#fff" />
      <Star8 cx="50" cy="50" r="18" fill="#13865B" />
      <circle cx="50" cy="50" r="6" fill="#fff" />
    </>
  ),
}

export function ChapterArt({ motif = 'star', className = 'h-20 w-20' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0B6B4C" /><stop offset="1" stopColor="#13865B" /></linearGradient></defs>
      <circle cx="50" cy="50" r="48" fill="#fff" opacity=".12" />
      {MOTIFS[motif] || MOTIFS.star}
    </svg>
  )
}

// Lanterne lumineuse (accueil, célébrations)
export function Lantern({ className = 'h-32 w-32', glow = true }) {
  return (
    <svg viewBox="0 0 120 160" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="lg" cx="50%" cy="58%" r="50%"><stop offset="0" stopColor="#FFF6D6" /><stop offset=".55" stopColor="#F7E7B4" stopOpacity=".7" /><stop offset="1" stopColor="#F7E7B4" stopOpacity="0" /></radialGradient>
        <linearGradient id="lb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#13865B" /><stop offset="1" stopColor="#075B40" /></linearGradient>
      </defs>
      {glow && <circle cx="60" cy="92" r="58" fill="url(#lg)" className="lantern-glow" />}
      <path d="M60 6 v14" stroke="#075B40" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="8" r="5" fill="none" stroke="#075B40" strokeWidth="3" />
      <path d="M40 34 Q60 16 80 34 Z" fill="url(#lb)" />
      <rect x="36" y="34" width="48" height="6" rx="3" fill="#075B40" />
      <path d="M38 40 H82 L90 100 Q60 116 30 100 Z" fill="url(#lb)" />
      <path d="M46 46 H74 L80 98 Q60 108 40 98 Z" fill="#FFF6D6" />
      <path d="M60 52 Q70 66 64 82 Q60 92 56 82 Q50 66 60 52 Z" fill="#F2C94C" className="lantern-flame" />
      <path d="M60 46 V104 M48 46 L43 99 M72 46 L77 99" stroke="#13865B" strokeWidth="2.5" opacity=".55" />
      <path d="M30 100 Q60 122 90 100 L84 112 Q60 128 36 112 Z" fill="#075B40" />
      <Star8 cx="60" cy="140" r="9" fill="#13865B" />
    </svg>
  )
}

// Petit décor qui ponctue le chemin
export function PathDecor({ kind = 0 }) {
  const k = kind % 3
  return (
    <svg viewBox="0 0 80 80" className="h-16 w-16 opacity-80" aria-hidden="true">
      {k === 0 && <><Star8 cx="40" cy="40" r="22" fill="#E8F5ED" /><Star8 cx="40" cy="40" r="10" fill="#13865B" opacity=".5" /></>}
      {k === 1 && <><path d="M40 10 Q58 30 40 70 Q22 30 40 10 Z" fill="#E8F5ED" /><path d="M40 70 V78" stroke="#13865B" strokeWidth="3" /></>}
      {k === 2 && <><circle cx="34" cy="40" r="22" fill="#E8F5ED" /><circle cx="44" cy="34" r="19" fill="#F7FAF8" /><Star8 cx="58" cy="24" r="6" fill="#13865B" opacity=".5" /></>}
    </svg>
  )
}
