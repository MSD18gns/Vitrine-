import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, X, Play, BookOpen, RotateCcw, HelpCircle } from 'lucide-react'
import Seo from '../components/Seo'
import { Spinner } from '../components/ui'
import { ChapterArt } from '../components/Illustrations'
import { Confetti } from '../components/Celebration'
import { CHAPITRES, ETAPES, EMOJIS } from '../content/parcours'
import { useJourney } from '../hooks/useJourney'
import { useContent } from '../hooks/useContent'
import { store } from '../lib/storage'
import { useT } from '../i18n'

// ---------------------------------------------------------------------------
//  LE PARCOURS EN ASCENSION
//  On part du camp de base (en bas) et on grimpe vers le sommet (en haut) :
//  chapitre 1 tout en bas, chapitre 10 tout en haut, chaque épisode au-dessus
//  du précédent.
// ---------------------------------------------------------------------------
const W = 340            // largeur du sentier
const STEP = 132         // écart vertical entre deux cases
const DX = [-70, 62, -40, 74, -66, 48]
const CX = W / 2

function Hud({ stats, sobre, onRules }) {
  const { t } = useT()
  return (
    <div className="sticky top-16 z-30 px-3 pt-2">
      <div className="glass mx-auto flex max-w-xl items-center justify-between gap-1 rounded-2xl px-2 py-1.5 text-white shadow-lg">
        {!sobre ? (
          <>
            <Link to="/recompenses" className="flex min-h-[44px] items-center gap-1 rounded-xl px-2 font-extrabold active:scale-90" aria-label={`Série : ${stats.serie} jours`}><span className={`emoji text-xl ${stats.actifAujourdhui ? 'heartbeat' : 'grayscale'}`}>🔥</span>{stats.serie}</Link>
            <Link to="/recompenses" className="flex min-h-[44px] items-center gap-1 rounded-xl px-2 font-extrabold active:scale-90" aria-label={`${stats.xp} points d'expérience`}><span className="emoji coin text-xl">💎</span>{stats.xp}</Link>
            <Link to="/recompenses" className="flex min-h-[44px] items-center rounded-xl px-1 active:scale-90" aria-label={`Lumière du jour : ${stats.lumiere} sur 5`}>
              {Array.from({ length: 5 }, (_, i) => <span key={i} className={`emoji text-[15px] ${i < stats.lumiere ? '' : 'opacity-25 grayscale'}`}>☀️</span>)}
            </Link>
            <Link to="/recompenses" className="grid h-10 min-w-[44px] place-items-center rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-2 text-sm font-black text-brand-night shadow-[0_3px_0_#B8891A] active:translate-y-0.5" aria-label={`Niveau ${stats.niveau.niveau}`}>⭐{stats.niveau.niveau}</Link>
          </>
        ) : <span className="px-2 text-sm font-semibold">{t('l.climb')}</span>}
        <button onClick={onRules} className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 active:scale-90" aria-label={t('path.rules')}><HelpCircle size={21} /></button>
      </div>
    </div>
  )
}

// Décor : étoiles qui scintillent, nuages qui passent, montagnes
function Sky({ height }) {
  const stars = useMemo(() => Array.from({ length: 46 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 61) % 100, s: 2 + (i % 3), d: (i % 7) * 0.4 })), [])
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" style={{ height }}>
      <div className="absolute inset-x-0 top-0 h-[900px] bg-gradient-to-b from-amber-200/25 via-emerald-400/10 to-transparent" />
      {stars.map((s, i) => <span key={i} className="twinkle absolute rounded-full bg-white" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }} />)}
      {[8, 26, 47, 68, 86].map((t, i) => <span key={t} className="drift emoji absolute text-5xl opacity-30" style={{ top: `${t}%`, animationDelay: `${-i * 7}s`, animationDuration: `${34 + i * 6}s` }}>☁️</span>)}
      {/* montagnes en arrière-plan, de part et d'autre du sentier */}
      {Array.from({ length: Math.ceil(height / 900) }, (_, i) => (
        <svg key={i} viewBox="0 0 400 300" className="absolute left-1/2 w-[760px] -translate-x-1/2 opacity-[.22]" style={{ top: i * 900 + 300 }}>
          <path d="M0 300 L70 150 L120 210 L190 90 L240 170 L290 120 L400 300 Z" fill="#0B6B47" />
          <path d="M190 90 L172 126 L190 116 L206 128 Z" fill="#fff" opacity=".6" />
        </svg>
      ))}
    </div>
  )
}

function Rules({ onClose }) {
  const { t } = useT()
  const R = ['🧗', '🎮', '💎', '🔥', '☀️', '🏆', '🤲', '🚪'].map((e, i) => [e, t(`rules.${i + 1}`), t(`rules.${i + 1}d`)])
  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center bg-brand-night/60 fade-in sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Comment jouer" onClick={(e) => e.stopPropagation()} className="sheet-up max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white p-5 sm:rounded-[28px]" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between"><h2 className="text-xl font-black text-brand-deep">🎯 {t('rules.title')}</h2><button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-xl text-slate-400" aria-label="Fermer"><X size={20} /></button></div>
        <ol className="mt-3 space-y-2.5">
          {R.map(([e, t, d], i) => (
            <li key={t} className="tilt-in flex gap-3 rounded-2xl bg-brand-mist p-3" style={{ animationDelay: `${i * 0.06}s` }}>
              <span className="emoji grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-2xl shadow-sm">{e}</span>
              <span><span className="block font-bold text-slate-900">{t}</span><span className="text-sm text-slate-600">{d}</span></span>
            </li>
          ))}
        </ol>
        <button onClick={onClose} className="btn-3d mt-4 w-full text-base">{t('rules.go')} 🚀</button>
      </div>
    </div>
  )
}

function Sheet({ etape, etat, onClose }) {
  const { t } = useT()
  const nav = useNavigate()
  const { article } = useContent()
  const chap = CHAPITRES.find((c) => c.id === etape.chap)
  const a = etape.article ? article(etape.article) : null
  const locked = etat === 'verrouillee'
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-brand-night/50 fade-in sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={etape.titre} onClick={(e) => e.stopPropagation()} className="sheet-up w-full max-w-md rounded-t-[28px] bg-white p-5 shadow-2xl sm:rounded-[28px]" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="flex items-start gap-3">
          <span className={`emoji grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl ${locked ? 'bg-slate-100 grayscale' : 'bg-brand-light float'}`}>{EMOJIS[etape.id]}</span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{t('path.camp')} {chap.id} · {chap.titre}</p>
            <h2 className="mt-0.5 text-xl font-black text-slate-900">{etape.titre}</h2>
          </div>
          <button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100" aria-label="Fermer"><X size={20} /></button>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5 text-xs font-semibold text-slate-600">
          {[['📘', 'step.lesson'], ['📖', 'step.verse'], ['📜', 'step.hadith'], ['❓', 'step.quiz'], ['✍️', 'step.reflection'], ['🎯', 'step.mission'], ['🤲', 'step.invocation']].map(([e, k]) => <li key={k} className="rounded-full bg-brand-mist px-2.5 py-1">{e} {t(k)}</li>)}
        </ul>
        {locked ? (
          <>
            <p className="mt-4 flex gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600"><Lock size={17} className="mt-0.5 shrink-0" />{t('path.locked')}</p>
            {a && <Link to={`/article/${a.slug}`} className="btn-ghost mt-3 w-full"><BookOpen size={18} />{t('path.readArticle')}</Link>}
          </>
        ) : (
          <button onClick={() => nav(`/parcours/etape/${etape.id}`)} className="btn-3d mt-5 w-full text-base">
            {etat === 'faite' ? <><RotateCcw size={19} />{t('path.replay')} · +5 💎</> : <><Play size={19} className="fill-white" />{t('path.play')} · +20 💎</>}
          </button>
        )}
      </div>
    </div>
  )
}

// Un camp = un chapitre : panneau en bas, 3 épisodes qui montent, coffre en haut
function Camp({ c, stats, etats, courante, idx, justDone, nextAfterDone, onOpen, currentRef }) {
  const { t } = useT()
  const etapes = ETAPES.filter((e) => e.chap === c.id)
  const nbFaites = etapes.filter((e) => stats.faites.has(e.id)).length
  const complet = nbFaites === etapes.length
  // points du sentier, de bas en haut : panneau → épisode 1 → 2 → 3 → coffre
  const n = etapes.length
  const H = (n + 1) * STEP + 40
  const pts = [{ x: CX, y: H - 10 }, ...etapes.map((e, k) => ({ x: CX + DX[(idx[e.id]) % DX.length], y: H - (k + 1) * STEP })), { x: CX, y: 46 }]
  const d = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `C${pts[i - 1].x},${pts[i - 1].y - STEP / 2} ${p.x},${p.y + STEP / 2} ${p.x},${p.y}`)).join(' ')
  const progress = nbFaites / n
  return (
    <section aria-label={`Camp ${c.id} : ${c.titre}`} className="relative">
      <div className="relative mx-auto" style={{ width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0" aria-hidden="true">
          <path d={d} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="14" strokeLinecap="round" />
          <path d={d} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
          {progress > 0 && <path d={d} fill="none" stroke="#F2C94C" strokeWidth="5" strokeLinecap="round" pathLength="1" strokeDasharray={`${progress * 0.86 + 0.07} 1`} style={{ transition: 'stroke-dasharray 1s ease' }} />}
        </svg>

        {/* coffre du camp (en haut) */}
        <Link to={`/recompenses?chapitre=${c.id}`} className={`node-btn absolute ${complet ? 'node-chest' : 'node-locked'}`} style={{ left: CX - 36, top: 46 - 36, width: 72, height: 72 }} aria-label={`Coffre du camp ${c.id}${complet ? ' — ouvert' : ''}`}>
          <span className={`emoji text-[34px] ${complet ? 'spin3d' : 'grayscale opacity-60'}`}>{complet ? '🏆' : '🎁'}</span>
        </Link>

        {etapes.map((e, k) => {
          const st = etats[e.id]
          const isCur = e.id === courante
          const x = CX + DX[idx[e.id] % DX.length]
          const y = H - (k + 1) * STEP
          const cls = st === 'faite' ? 'node-done' : isCur ? 'node-current' : st === 'ouverte' ? 'node-open' : 'node-locked'
          const anim = e.id === nextAfterDone ? 'unlock-pop' : e.id === justDone ? 'done-pop' : isCur ? 'float' : ''
          return (
            <div key={e.id} ref={isCur ? currentRef : undefined} className="absolute flex flex-col items-center" style={{ left: x - 60, top: y - 40, width: 120 }}>
              {isCur && <span className="absolute -top-12 z-10 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-xs font-black uppercase tracking-wide text-brand shadow-lg bob">{stats.faites.size ? `📍 ${t('path.here')}` : `🚀 ${t('path.departure')}`}<span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" /></span>}
              <button onClick={() => onOpen(e)} className={`node-btn ${cls} ${isCur ? 'pulse-ring' : ''} ${anim}`} style={{ width: 80, height: 80 }} aria-label={`Épisode ${idx[e.id] + 1} : ${e.titre} — ${st === 'faite' ? 'terminé' : st === 'verrouillee' ? 'verrouillé' : 'disponible'}`}>
                <span className={`emoji text-[34px] ${st === 'verrouillee' ? 'grayscale opacity-40' : ''}`}>{EMOJIS[e.id]}</span>
                {st === 'faite' && <span className="emoji absolute -right-1 -top-1 text-xl">⭐</span>}
                {st === 'verrouillee' && <Lock size={18} className="absolute bottom-1 right-1 rounded-full bg-white/80 p-0.5 text-slate-500" />}
              </button>
              <span className={`mt-2 rounded-lg px-2 py-0.5 text-center text-[12.5px] font-bold leading-tight ${st === 'verrouillee' ? 'text-emerald-100/50' : 'bg-brand-night/40 text-white'}`}>{e.titre}</span>
            </div>
          )
        })}
      </div>

      {/* panneau du camp (en bas) */}
      <div className="relative mx-auto -mt-2 max-w-md px-3">
        <div className="card-3d relative overflow-hidden rounded-3xl p-4 text-white shadow-[0_8px_0_rgba(3,42,29,.6)] ring-1 ring-white/15" style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
          <div className="pattern-islamic absolute inset-0" aria-hidden="true" />
          <div className="relative flex items-center gap-3">
            <span className="emoji float grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-3xl">{c.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black uppercase tracking-[.18em] text-emerald-100">{t('path.camp')} {c.id}{c.toujoursOuvert ? ` · ${t('path.alwaysOpen')}` : ''}</p>
              <h2 className="text-lg font-black leading-tight text-white">{c.titre}</h2>
              <p className="text-[13px] text-emerald-50/90">{c.sous}</p>
              <div className="mt-2 flex items-center gap-2"><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-700" style={{ width: `${progress * 100}%` }} /></div><span className="text-xs font-black">{nbFaites}/{n}</span></div>
            </div>
            <ChapterArt motif={c.motif} className="hidden h-16 w-16 shrink-0 sm:block" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Parcours() {
  const { stats, etats, courante, prefs, loading, isGuest } = useJourney()
  const { t } = useT()
  const location = useLocation()
  const [sheet, setSheet] = useState(null)
  const [rules, setRules] = useState(() => !store.get('ad:rules-seen', false))
  const justDone = location.state?.justDone
  const [celebrate, setCelebrate] = useState(false)
  const currentRef = useRef(null)
  const scrolled = useRef(false)
  const idx = useMemo(() => Object.fromEntries(ETAPES.map((e, i) => [e.id, i])), [])

  useEffect(() => {
    if (loading || scrolled.current) return
    scrolled.current = true
    setTimeout(() => currentRef.current?.scrollIntoView({ behavior: justDone ? 'smooth' : 'auto', block: 'center' }), justDone ? 350 : 60)
    if (justDone) { setCelebrate(true); window.history.replaceState({}, '') }
  }, [loading, justDone])

  if (loading) return <Spinner label="Préparation de l'ascension…" />
  const nextAfterDone = justDone ? ETAPES[idx[justDone] + 1]?.id : null
  const closeRules = () => { setRules(false); store.set('ad:rules-seen', true) }
  const pct = Math.round((stats.etapesFaites / ETAPES.length) * 100)
  const camps = [...CHAPITRES].reverse() // du sommet (haut) au camp de base (bas)

  return (
    <div className="relative min-h-screen overflow-x-clip pb-10">
      <Seo title="Mon parcours" description="L'ascension d'ANDOU DIINEMA : 10 camps, 30 épisodes, du camp de base jusqu'au sommet." />
      <Confetti fire={celebrate} pieces={80} />
      <Sky height={camps.length * ((3 + 1) * STEP + 180) + 900} />
      <Hud stats={stats} sobre={prefs.sobre} onRules={() => setRules(true)} />
      <h1 className="sr-only">Mon parcours — l'ascension</h1>

      {/* Sommet */}
      <div className="relative mx-auto mt-6 max-w-md px-4 text-center text-white">
        <span className="emoji float inline-block text-7xl">🏔️</span>
        <p className="mt-1 text-xs font-black uppercase tracking-[.2em] text-amber-200">{t('path.summit')}</p>
        <h2 className="text-2xl font-black text-white">{t('path.summitTitle')} 🤍</h2>
        <p className="mt-1 text-sm text-emerald-100/80">{t('path.summitSub', { pct })}</p>
        <div className="mx-auto mt-3 h-3 max-w-xs overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-amber-200 to-amber-400 transition-all duration-1000" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="relative mt-4 space-y-6">
        {camps.map((c) => <Camp key={c.id} c={c} stats={stats} etats={etats} courante={courante} idx={idx} justDone={justDone} nextAfterDone={nextAfterDone} onOpen={setSheet} currentRef={currentRef} />)}
      </div>

      {/* Camp de base */}
      <div className="relative mx-auto mt-8 max-w-md px-4 text-center text-white">
        <span className="emoji text-6xl">🏕️</span>
        <p className="mt-1 text-xs font-black uppercase tracking-[.2em] text-emerald-200">{t('path.base')}</p>
        <p className="mt-1 text-sm text-emerald-100/80">{t(stats.faites.size ? 'path.baseCont' : 'path.baseStart')} ⬆️</p>
        {isGuest && <p className="mx-auto mt-4 max-w-sm rounded-2xl bg-white/10 p-3 text-sm text-emerald-50">💾 {t('path.guest')} <Link to="/inscription" className="font-bold underline">{t('path.createAccount')}</Link> {t('path.guest2')}</p>}
        <Link to="/parcours/etape/tawbah" className="btn-gold mx-auto mt-4 max-w-sm">🚪 {t('path.repentOpen')}</Link>
      </div>

      {sheet && <Sheet etape={sheet} etat={etats[sheet.id]} onClose={() => setSheet(null)} />}
      {rules && <Rules onClose={closeRules} />}
    </div>
  )
}
