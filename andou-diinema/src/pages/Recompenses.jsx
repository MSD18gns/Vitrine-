import { useSearchParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Gem, Flame, Sun, Trophy, Lock, History, Info } from 'lucide-react'
import Seo from '../components/Seo'
import { PageHeader, Section, Spinner } from '../components/ui'
import { DailyGoal } from '../components/StatsBar'
import { ChapterArt } from '../components/Illustrations'
import { iconFor } from '../components/stepIcons'
import { BADGES, OBJECTIFS, NIVEAUX } from '../services/gamification'
import { CHAPITRES, ETAPES, etapeById } from '../content/parcours'
import { useJourney } from '../hooks/useJourney'
import { formatDay, lastDays } from '../lib/dates'

export default function Recompenses() {
  const { stats, prefs, loading, api, bump } = useJourney()
  const [params] = useSearchParams()
  const focus = Number(params.get('chapitre')) || null
  const [saving, setSaving] = useState(false)
  if (loading) return <Spinner />
  const setGoal = async (xp) => { setSaving(true); await api.setGamePrefs({ objectif: xp }); bump(); setSaving(false) }
  const week = lastDays(7)
  const max = Math.max(stats.objectif, ...week.map((d) => stats.xpByDay[d] || 0))

  return (
    <>
      <Seo title="Mes récompenses" noindex />
      <PageHeader emoji="🏅" eyebrow="Progression" title={`Niveau ${stats.niveau.niveau} · ${stats.niveau.nom}`} subtitle="Des repères pour t'encourager. Ils ne mesurent ni ta foi ni ta valeur auprès d'Allah : seul Allah connaît les cœurs.">
        <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
          <div className="flex justify-between text-sm"><span>{stats.niveau.dansNiveau} / {stats.niveau.requis} XP</span><span>Niveau {stats.niveau.niveau + 1} : {NIVEAUX[Math.min(stats.niveau.niveau, NIVEAUX.length - 1)]}</span></div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${(stats.niveau.dansNiveau / stats.niveau.requis) * 100}%` }} /></div>
        </div>
      </PageHeader>
      <div className="container-ad max-w-2xl">
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="card p-3 text-center"><Flame className="mx-auto fill-orange-400 text-orange-500" /><p className="mt-1 text-xl font-extrabold">{stats.serie}</p><p className="text-xs text-slate-500">jours d'affilée</p></div>
          <div className="card p-3 text-center"><Gem className="mx-auto fill-brand-light text-brand" /><p className="mt-1 text-xl font-extrabold">{stats.xp}</p><p className="text-xs text-slate-500">XP au total</p></div>
          <div className="card p-3 text-center"><Trophy className="mx-auto text-amber-500" /><p className="mt-1 text-xl font-extrabold">{stats.badges.length}</p><p className="text-xs text-slate-500">badges</p></div>
        </div>
        <p className="mt-3 text-center text-sm text-slate-600">Meilleure série : {stats.meilleureSerie} jour{stats.meilleureSerie > 1 ? 's' : ''} · {stats.joursActifs} jour{stats.joursActifs > 1 ? 's' : ''} de progression</p>

        <Section title="Objectif du jour">
          <DailyGoal stats={stats} />
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {OBJECTIFS.map((o) => <button key={o.xp} disabled={saving} onClick={() => setGoal(o.xp)} className={`tap rounded-2xl border-2 p-3 text-left ${prefs.objectif === o.xp ? 'border-brand bg-brand-light' : 'border-slate-200 bg-white'}`}><span className="block font-bold text-slate-900">{o.label}</span><span className="text-xs text-slate-500">{o.xp} XP · {o.texte}</span></button>)}
          </div>
          <div className="card mt-3 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Sun size={17} className="text-amber-500" />Lumière des 7 derniers jours</p>
            <div className="flex h-28 items-end gap-2">
              {week.map((d) => { const x = stats.xpByDay[d] || 0; return <div key={d} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-lg bg-brand-light" style={{ height: '88px', display: 'flex', alignItems: 'flex-end' }}><div className={`w-full rounded-lg ${x >= stats.objectif ? 'bg-brand' : 'bg-emerald-300'} transition-all duration-700`} style={{ height: `${(x / max) * 100}%` }} /></div><span className="text-[11px] capitalize text-slate-500">{formatDay(d, { weekday: 'short' }).slice(0, 3)}</span></div> })}
            </div>
          </div>
        </Section>

        <Section title="Chapitres">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CHAPITRES.map((c) => {
              const ok = stats.chapitresFaits.includes(c.id)
              const n = ETAPES.filter((e) => e.chap === c.id && stats.faites.has(e.id)).length
              return (
                <div key={c.id} className={`relative overflow-hidden rounded-2xl p-3 text-white ${focus === c.id ? 'ring-4 ring-amber-300' : ''} ${ok ? 'badge-pop' : 'opacity-60 grayscale'}`} style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                  <ChapterArt motif={c.motif} className="h-14 w-14" />
                  <p className="mt-1 text-xs opacity-80">Chapitre {c.id}</p>
                  <p className="font-bold leading-tight">{c.titre}</p>
                  <p className="mt-1 text-xs">{ok ? 'Accompli ✓' : `${n}/3 étapes`}</p>
                </div>
              )
            })}
          </div>
        </Section>

        <Section title="Badges">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {BADGES.filter((b) => !b.chapitre).map((b) => {
              const ok = stats.badges.includes(b.id); const B = iconFor(b.icon)
              return (
                <div key={b.id} className="card flex flex-col items-center p-3 text-center">
                  <span className={`grid h-14 w-14 place-items-center rounded-full ${ok ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>{ok ? <B size={26} /> : <Lock size={22} />}</span>
                  <p className={`mt-2 text-xs font-bold ${ok ? 'text-slate-900' : 'text-slate-500'}`}>{b.titre}</p>
                  <p className="text-[11px] leading-tight text-slate-500">{b.texte}</p>
                </div>
              )
            })}
          </div>
        </Section>

        <Section title="Étapes accomplies">
          <div className="card divide-y divide-slate-100">
            {stats.historique.slice(0, 20).map((h, i) => {
              const e = etapeById(h.ref)
              return <div key={i} className="flex items-center gap-3 p-3.5"><History size={17} className="shrink-0 text-brand" /><span className="flex-1 text-sm"><span className="font-medium text-slate-900">{e?.titre || h.ref}</span><span className="block text-xs text-slate-500">{formatDay(h.day, { day: 'numeric', month: 'short' })} · {h.premiere ? 'première fois' : 'révision'}</span></span><span className="text-sm font-bold text-amber-600">+{h.xp}</span></div>
            })}
            {!stats.historique.length && <p className="p-4 text-center text-sm text-slate-500">Aucune étape pour l'instant. <Link to="/parcours" className="font-semibold text-brand">Commencer le parcours</Link></p>}
          </div>
        </Section>

        <p className="mt-6 flex gap-2 rounded-2xl bg-slate-100 p-4 text-sm text-slate-600"><Info size={18} className="shrink-0 text-brand" />On ne perd jamais d'XP ni de badge. Une journée manquée ne retire rien : reviens simplement quand tu peux. Tu peux masquer ces éléments en activant le « mode sobre » dans ton profil.</p>
      </div>
    </>
  )
}
