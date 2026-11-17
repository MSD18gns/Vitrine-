import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check, Lock, Star, Trophy, X, Play, BookOpen, RotateCcw, DoorOpen } from 'lucide-react'
import { iconFor } from '../components/stepIcons'
import Seo from '../components/Seo'
import StatsBar from '../components/StatsBar'
import { Spinner, Alert } from '../components/ui'
import { ChapterArt, PathDecor } from '../components/Illustrations'
import { Confetti } from '../components/Celebration'
import { CHAPITRES, ETAPES } from '../content/parcours'
import { useJourney } from '../hooks/useJourney'
import { useContent } from '../hooks/useContent'

const OFFSETS = [0, 58, 86, 58, 0, -58, -86, -58]

function Sheet({ etape, etat, onClose }) {
  const nav = useNavigate()
  const { article } = useContent()
  const chap = CHAPITRES.find((c) => c.id === etape.chap)
  const a = etape.article ? article(etape.article) : null
  const locked = etat === 'verrouillee'
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/35 fade-in sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={etape.titre} onClick={(e) => e.stopPropagation()} className="sheet-up w-full max-w-md rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px]" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Chapitre {chap.id} · {chap.titre}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{etape.titre}</h2>
          </div>
          <button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100" aria-label="Fermer"><X size={20} /></button>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5 text-xs font-medium text-slate-600">
          {['Leçon', 'Verset', 'Hadith', 'Quiz', 'Réflexion', 'Mission', 'Invocation'].map((t) => <li key={t} className="rounded-full bg-brand-mist px-2.5 py-1">{t}</li>)}
        </ul>
        {locked ? (
          <>
            <p className="mt-4 flex gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600"><Lock size={17} className="mt-0.5 shrink-0" />Termine l'étape précédente pour débloquer celle-ci. Les enseignements restent toujours accessibles dans « Découvrir ».</p>
            {a && <Link to={`/article/${a.slug}`} className="btn-ghost mt-3 w-full"><BookOpen size={18} />Lire l'article maintenant</Link>}
          </>
        ) : (
          <button onClick={() => nav(`/parcours/etape/${etape.id}`)} className="btn-3d mt-5 w-full text-base">
            {etat === 'faite' ? <><RotateCcw size={19} />Revoir l'étape (+5 XP)</> : <><Play size={19} className="fill-white" />Commencer · +20 XP</>}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Parcours() {
  const { stats, etats, courante, prefs, loading, isGuest } = useJourney()
  const location = useLocation()
  const [sheet, setSheet] = useState(null)
  const justDone = location.state?.justDone
  const [celebrate, setCelebrate] = useState(false)
  const currentRef = useRef(null)
  const scrolled = useRef(false)

  useEffect(() => {
    if (loading || scrolled.current) return
    scrolled.current = true
    setTimeout(() => currentRef.current?.scrollIntoView({ behavior: justDone ? 'smooth' : 'auto', block: 'center' }), justDone ? 350 : 60)
    if (justDone) { setCelebrate(true); window.history.replaceState({}, '') }
  }, [loading, justDone])

  const idx = useMemo(() => Object.fromEntries(ETAPES.map((e, i) => [e.id, i])), [])
  if (loading) return <Spinner label="Chargement du parcours…" />
  const nextAfterDone = justDone ? ETAPES[idx[justDone] + 1]?.id : null

  return (
    <div className="bg-gradient-to-b from-white to-brand-mist">
      <Seo title="Mon parcours" description="Le chemin interactif d'ANDOU DIINEMA : 10 chapitres, 30 étapes pour ouvrir les yeux, purifier son cœur et se rapprocher d'Allah." />
      <Confetti fire={celebrate} pieces={70} />
      <div className="sticky top-16 z-30 border-b border-brand-deep/5 bg-white/90 backdrop-blur">
        <div className="container-ad max-w-xl py-1.5"><StatsBar stats={stats} sobre={prefs.sobre} /></div>
      </div>

      <div className="container-ad max-w-xl pb-10">
        <h1 className="sr-only">Mon parcours</h1>
        {isGuest && <Alert className="mt-4"><span>Ta progression est enregistrée sur cet appareil. <Link to="/inscription" className="font-semibold underline">Crée un compte</Link> pour la sauvegarder partout.</span></Alert>}

        {CHAPITRES.map((c) => {
          const etapes = ETAPES.filter((e) => e.chap === c.id)
          const nbFaites = etapes.filter((e) => stats.faites.has(e.id)).length
          const complet = nbFaites === etapes.length
          return (
            <section key={c.id} className="mt-6" aria-label={`Chapitre ${c.id} : ${c.titre}`}>
              <div className="relative overflow-hidden rounded-3xl p-4 text-white shadow-card" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                <div className="pattern-islamic absolute inset-0" aria-hidden="true" />
                <div className="relative flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-100">Chapitre {c.id}{c.toujoursOuvert ? ' · toujours ouvert' : ''}</p>
                    <h2 className="mt-0.5 text-xl font-extrabold text-white">{c.titre}</h2>
                    <p className="text-sm text-emerald-50/90">{c.sous}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${(nbFaites / etapes.length) * 100}%` }} /></div>
                      <span className="text-xs font-bold">{nbFaites}/{etapes.length}</span>
                    </div>
                  </div>
                  <ChapterArt motif={c.motif} className="h-20 w-20 shrink-0" />
                </div>
              </div>

              <ol className="relative mt-14 flex flex-col items-center gap-14">
                {etapes.map((e) => {
                  const i = idx[e.id]
                  const st = etats[e.id]
                  const I = iconFor(e.icon)
                  const isCur = e.id === courante
                  const cls = st === 'faite' ? 'node-done' : isCur ? 'node-current' : st === 'ouverte' ? 'node-open' : 'node-locked'
                  const anim = e.id === nextAfterDone ? 'unlock-pop' : e.id === justDone ? 'done-pop' : ''
                  return (
                    <li key={e.id} ref={isCur ? currentRef : undefined} className="relative flex flex-col items-center" style={{ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` }}>
                      {isCur && <span className="bob absolute -top-11 z-10 whitespace-nowrap rounded-xl border-2 border-brand-light bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-brand shadow-card">{stats.faites.size ? 'Continuer' : 'Commencer'}<span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-brand-light bg-white" /></span>}
                      <button onClick={() => setSheet(e)} className={`node-btn ${cls} ${isCur ? 'pulse-ring' : ''} ${anim}`} aria-label={`Étape ${i + 1} : ${e.titre} — ${st === 'faite' ? 'terminée' : st === 'verrouillee' ? 'verrouillée' : 'disponible'}`}>
                        {st === 'faite' ? <Check size={34} strokeWidth={3.2} /> : st === 'verrouillee' ? <Lock size={28} /> : <I size={32} strokeWidth={2.4} />}
                        {st === 'faite' && <Star size={18} className="absolute -right-1 -top-1 fill-amber-300 text-amber-500" />}
                      </button>
                      <span className={`mt-3 max-w-[9.5rem] text-center text-[13px] font-semibold leading-tight ${st === 'verrouillee' ? 'text-slate-400' : 'text-slate-700'}`}>{e.titre}</span>
                    </li>
                  )
                })}
                <li className="flex flex-col items-center">
                  <Link to={`/recompenses?chapitre=${c.id}`} className={`node-btn ${complet ? 'node-chest' : 'node-locked'} h-[68px] w-[68px] ${complet && justDone && etapes.some((e) => e.id === justDone) ? 'badge-pop' : ''}`} aria-label={`Récompense du chapitre ${c.id}${complet ? ' — obtenue' : ''}`}>
                    <Trophy size={30} className={complet ? 'fill-white/30' : ''} />
                  </Link>
                  <span className="mt-2 text-xs font-semibold text-slate-500">{complet ? 'Chapitre accompli' : 'Récompense du chapitre'}</span>
                </li>
              </ol>
              <div className={`mt-4 flex ${c.id % 2 ? 'justify-end' : 'justify-start'} px-6`}><PathDecor kind={c.id} /></div>
            </section>
          )
        })}

        <div className="mt-8 rounded-3xl bg-white p-5 text-center shadow-card">
          <DoorOpen className="mx-auto text-brand" size={30} />
          <p className="mt-2 font-semibold text-slate-900">La porte du repentir est toujours ouverte</p>
          <p className="mt-1 text-sm text-slate-600">Le chapitre 7 est accessible à tout moment, quelle que soit ta progression.</p>
          <Link to="/parcours/etape/tawbah" className="btn-secondary mt-3 w-full">Ouvrir « La tawbah »</Link>
        </div>
      </div>
      {sheet && <Sheet etape={sheet} etat={etats[sheet.id]} onClose={() => setSheet(null)} />}
    </div>
  )
}
