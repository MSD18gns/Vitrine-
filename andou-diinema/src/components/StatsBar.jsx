import { Link } from 'react-router-dom'
import { Flame, Gem, Sun } from 'lucide-react'

// Barre compacte : série, XP, lumière du jour (énergie positive, jamais retirée)
export default function StatsBar({ stats, sobre, className = '' }) {
  if (sobre) return null
  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <Link to="/recompenses" className="tap flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 font-bold text-orange-500" aria-label={`Série : ${stats.serie} jours`}>
        <Flame size={22} className={stats.actifAujourdhui ? 'fill-orange-400' : 'opacity-60'} />{stats.serie}
      </Link>
      <Link to="/recompenses" className="tap flex min-h-[44px] items-center gap-1.5 rounded-xl px-2 font-bold text-brand" aria-label={`${stats.xp} points d'expérience`}>
        <Gem size={21} className="fill-brand-light" />{stats.xp} XP
      </Link>
      <Link to="/recompenses" className="tap flex min-h-[44px] items-center gap-1 rounded-xl px-2" aria-label={`Lumière du jour : ${stats.lumiere} sur 5`}>
        {Array.from({ length: 5 }, (_, i) => <Sun key={i} size={17} className={i < stats.lumiere ? 'fill-amber-300 text-amber-500' : 'text-slate-300'} />)}
      </Link>
      <Link to="/recompenses" className="tap grid h-10 min-w-10 place-items-center rounded-xl bg-brand-deep px-2 text-sm font-extrabold text-white" aria-label={`Niveau ${stats.niveau.niveau}`}>
        Niv. {stats.niveau.niveau}
      </Link>
    </div>
  )
}

export function DailyGoal({ stats, compact = false }) {
  const pct = Math.min(100, Math.round((stats.xpJour / stats.objectif) * 100))
  return (
    <div className={compact ? '' : 'card p-4'}>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-800">Objectif du jour</span>
        <span className="font-bold text-brand">{Math.min(stats.xpJour, stats.objectif)} / {stats.objectif} XP</span>
      </div>
      <div className="bar"><span style={{ width: `${pct}%` }} /></div>
      <p className="mt-2 text-xs text-slate-500">{stats.objectifAtteint ? 'Objectif atteint, ma sha Allah ! Tout ce que tu fais en plus est un bonus.' : 'Une étape du parcours, une mission ou ton bilan suffisent à avancer.'}</p>
    </div>
  )
}
