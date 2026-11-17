import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { X, Check, BookOpen, ScrollText, HelpCircle, PenLine, Target, HandHeart, Smile, ExternalLink, Gem, Flame, Trophy, ArrowRight, Heart } from 'lucide-react'
import Seo from '../components/Seo'
import { Spinner, Alert } from '../components/ui'
import InvocationCard from '../components/InvocationCard'
import { Confetti, CountUp } from '../components/Celebration'
import { Lantern, ChapterArt } from '../components/Illustrations'
import { iconFor } from '../components/stepIcons'
import { CHAPITRES, ETAPES, etapeById, indexEtape } from '../content/parcours'
import { THEMES } from '../content/themes'
import { quranLink, sunnahLink, verseRef } from '../content/sources'
import { BADGES, XP } from '../services/gamification'
import { useJourney } from '../hooks/useJourney'
import { useContent } from '../hooks/useContent'
import NotFound from './NotFound'

// mélange stable des réponses du quiz
const shuffle = (arr, seed) => {
  const a = arr.map((v, i) => ({ v, i, k: Math.sin(seed * 9301 + i * 49297) }))
  return a.sort((x, y) => x.k - y.k)
}

function buildLecture(e, article) {
  if (e.lecture) return { paragraphes: e.lecture }
  if (e.article && article) return { paragraphes: [article.intro, article.explication], danger: article.danger, hukm: article.hukm, lien: `/article/${article.slug}` }
  if (e.theme) {
    const t = THEMES[e.theme[0]]; const it = t.items[e.theme[1]]
    return { paragraphes: [it.texte], encadre: it.protection || it.action, lien: { pieges: '/pieges-shaytan', repentir: '/repentir', reconstruction: '/reconstruire' }[e.theme[0]] }
  }
  return { paragraphes: [] }
}

const Head = ({ icon: I, label }) => <p className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.16em] text-brand"><I size={16} />{label}</p>

export default function Etape() {
  const { id } = useParams()
  const nav = useNavigate()
  const etape = etapeById(id)
  const { article, versets, hadiths } = useContent()
  const { stats, etats, loading, api, bump, prefs } = useJourney()
  const [step, setStep] = useState(0)
  const [choix, setChoix] = useState(null)
  const [verdict, setVerdict] = useState(null) // 'ok' | 'ko'
  const [essais, setEssais] = useState(0)
  const [reflexion, setReflexion] = useState('')
  const [engage, setEngage] = useState(false)
  const [ressenti, setRessenti] = useState('')
  const [fin, setFin] = useState(null)
  const [err, setErr] = useState(null)
  const before = useRef(null)

  const seed = useMemo(() => (etape ? indexEtape(etape.id) + 1 : 1), [etape])
  useEffect(() => { if (!loading && !before.current) before.current = { badges: new Set(stats.badges), faites: new Set(stats.faites) } }, [loading, stats])

  if (!etape) return <NotFound />
  if (loading) return <Spinner label="Préparation de l'étape…" />
  if (etats[etape.id] === 'verrouillee' && !fin) {
    return (
      <div className="container-ad max-w-md py-12 text-center">
        <Seo title={etape.titre} noindex />
        <h1 className="text-xl font-bold">Étape pas encore débloquée</h1>
        <p className="mt-2 text-slate-600">Termine l'étape précédente pour l'ouvrir. Les enseignements restent accessibles dans « Découvrir ».</p>
        <Link to="/parcours" className="btn-primary mt-6 w-full">Retour au parcours</Link>
      </div>
    )
  }

  const chap = CHAPITRES.find((c) => c.id === etape.chap)
  const art = etape.article ? article(etape.article) : null
  const lecture = buildLecture(etape, art)
  const v = versets[etape.verset]
  const h = hadiths[etape.hadith]
  const options = shuffle(etape.quiz.o, seed)
  const I = iconFor(etape.icon)

  const STEPS = ['lecture', 'verset', 'hadith', 'quiz', 'reflexion', 'mission', 'invocation', 'bilan']
  const cur = STEPS[step]
  const pct = fin ? 100 : Math.round((step / STEPS.length) * 100)

  const suivant = () => { setStep((s) => Math.min(s + 1, STEPS.length - 1)); window.scrollTo({ top: 0 }) }
  const verifier = () => {
    const ok = choix === 0
    setVerdict(ok ? 'ok' : 'ko'); setEssais((n) => n + 1)
    if (navigator.vibrate) navigator.vibrate(ok ? 30 : [20, 40, 20])
  }
  const terminer = async () => {
    setErr(null)
    const premiere = !before.current.faites.has(etape.id)
    const parfait = essais === 1 && verdict === 'ok'
    try {
      await api.completeLesson(etape.id, { parfait, reflexion: reflexion.trim(), ressenti })
      setFin({ xp: premiere ? XP.etape + (parfait ? XP.quizParfait : 0) : XP.revision, premiere, parfait })
      bump()
    } catch (e) { setErr(e.message) }
  }

  // ------------------------------------------------------------- écran de fin
  if (fin) {
    const nouveaux = BADGES.filter((b) => stats.badges.includes(b.id) && !before.current.badges.has(b.id))
    const chapitreFini = stats.chapitresFaits.includes(etape.chap) && !CHAPITRES.find((c) => c.id === etape.chap && ETAPES.filter((e) => e.chap === c.id).every((e) => before.current.faites.has(e.id)))
    const suivante = ETAPES[indexEtape(etape.id) + 1]
    return (
      <div className="min-h-[85vh] bg-gradient-to-b from-white to-brand-light/60">
        <Seo title="Étape terminée" noindex />
        <Confetti fire pieces={chapitreFini ? 160 : 100} />
        <div className="container-ad flex max-w-md flex-col items-center py-10 text-center">
          {chapitreFini ? <div className="badge-pop rounded-[32px] p-4 shadow-card" style={{ background: `linear-gradient(135deg, ${chap.from}, ${chap.to})` }}><ChapterArt motif={chap.motif} className="h-28 w-28" /></div> : <Lantern className="rise h-36 w-36" />}
          <h1 className="rise mt-4 font-display text-3xl font-bold text-brand-deep">{chapitreFini ? `Chapitre « ${chap.titre} » accompli !` : 'Étape terminée !'}</h1>
          <p className="rise mt-2 text-slate-600">{chapitreFini ? "Qu'Allah accepte tes efforts et affermisse ton cœur." : "Ma sha Allah ! Chaque pas compte auprès d'Allah."}</p>
          {!prefs.sobre && (
            <div className="rise mt-6 grid w-full grid-cols-3 gap-3">
              <div className="rounded-2xl border-2 border-amber-300 bg-white p-3"><p className="text-xs font-bold uppercase text-amber-600">XP</p><p className="flex items-center justify-center gap-1 text-2xl font-extrabold text-amber-600"><Gem size={20} />+<CountUp to={fin.xp} /></p></div>
              <div className="rounded-2xl border-2 border-orange-300 bg-white p-3"><p className="text-xs font-bold uppercase text-orange-500">Série</p><p className="flex items-center justify-center gap-1 text-2xl font-extrabold text-orange-500"><Flame size={20} />{stats.serie}</p></div>
              <div className="rounded-2xl border-2 border-emerald-300 bg-white p-3"><p className="text-xs font-bold uppercase text-emerald-700">Niveau</p><p className="text-2xl font-extrabold text-emerald-700">{stats.niveau.niveau}</p></div>
            </div>
          )}
          {fin.parfait && fin.premiere && !prefs.sobre && <p className="rise mt-3 text-sm font-semibold text-brand">Quiz réussi du premier coup : +5 XP bonus</p>}
          {nouveaux.length > 0 && (
            <div className="mt-6 w-full">
              <p className="mb-2 text-sm font-bold text-slate-700">Nouveau{nouveaux.length > 1 ? 'x' : ''} badge{nouveaux.length > 1 ? 's' : ''} !</p>
              <div className="flex flex-wrap justify-center gap-3">{nouveaux.map((b, i) => { const B = iconFor(b.icon); return <div key={b.id} className="badge-pop flex w-28 flex-col items-center rounded-2xl bg-white p-3 shadow-card" style={{ animationDelay: `${0.3 + i * 0.15}s` }}><span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md"><B size={26} /></span><span className="mt-2 text-xs font-bold text-slate-800">{b.titre}</span></div> })}</div>
            </div>
          )}
          {ressenti === 'difficile' && <Alert className="mt-6 text-left">Tu as dit traverser un moment difficile. Allah est proche : « Ne désespérez pas de la miséricorde d'Allah ». Le chapitre du repentir est toujours ouvert pour toi.</Alert>}
          <div className="mt-8 grid w-full gap-3">
            <button onClick={() => nav('/parcours', { state: { justDone: etape.id } })} className="btn-3d w-full text-base">Continuer mon parcours <ArrowRight size={19} /></button>
            {suivante && <Link to={`/parcours/etape/${suivante.id}`} replace className="btn-ghost w-full">Étape suivante : {suivante.titre}</Link>}
          </div>
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------- lecteur
  const canNext = cur !== 'quiz' || verdict === 'ok'
  return (
    <div className="min-h-[85vh] bg-white">
      <Seo title={etape.titre} noindex />
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur">
        <div className="container-ad flex max-w-xl items-center gap-3 py-3">
          <button onClick={() => nav('/parcours')} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-400 hover:bg-slate-100" aria-label="Quitter l'étape"><X size={24} /></button>
          <div className="bar flex-1" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label="Progression de l'étape"><span style={{ width: `${Math.max(pct, 4)}%` }} /></div>
          <span className="w-10 text-right text-xs font-bold text-slate-400">{step + 1}/{STEPS.length}</span>
        </div>
      </div>

      <div key={cur} className="container-ad slide-in max-w-xl pb-40 pt-2">
        {cur === 'lecture' && (
          <section>
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${chap.from}, ${chap.to})` }}><I size={28} /></span>
              <div><p className="eyebrow">Chapitre {chap.id} · Leçon</p><h1 className="text-2xl font-extrabold text-slate-900">{etape.titre}</h1></div>
            </div>
            {lecture.hukm && <p className="mb-3 inline-block rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-deep">{lecture.hukm}</p>}
            {lecture.paragraphes.map((p, i) => <p key={i} className="mb-4 text-[17px] leading-relaxed text-slate-700">{p}</p>)}
            {lecture.danger && <div className="rounded-2xl bg-amber-50 p-4 text-[15px] leading-relaxed text-amber-950 ring-1 ring-amber-200"><b>Pourquoi est-ce dangereux ?</b> {lecture.danger}</div>}
            {lecture.encadre && <div className="rounded-2xl bg-brand-light p-4 text-[15px] text-brand-deep">{lecture.encadre}</div>}
            {lecture.lien && <Link to={lecture.lien} className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-brand"><BookOpen size={16} />Approfondir</Link>}
          </section>
        )}

        {cur === 'verset' && v && (
          <section>
            <Head icon={BookOpen} label="Découvrir un verset" />
            <div className="rounded-3xl bg-gradient-to-br from-brand-light to-white p-5 ring-1 ring-brand/15">
              {v.ar && <p className="arabic mb-4 text-[26px]">{v.ar}</p>}
              <p className="font-display text-[19px] leading-relaxed text-slate-800">{v.fr}</p>
              <p className="mt-4 text-sm font-bold text-brand-deep">{verseRef(v)}</p>
              <a href={quranLink(v)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-[40px] items-center gap-1 text-sm font-medium text-brand">Vérifier sur quran.com <ExternalLink size={14} /></a>
            </div>
            <p className="mt-4 text-sm text-slate-500">Prends le temps de relire lentement ce verset. Que te dit-il, à toi, aujourd'hui ?</p>
          </section>
        )}

        {cur === 'hadith' && h && (
          <section>
            <Head icon={ScrollText} label="Comprendre un hadith" />
            <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-slate-100">
              {h.ar && <p className="arabic mb-3 text-2xl">{h.ar}</p>}
              <p className="text-[17px] leading-relaxed text-slate-800">« {h.fr} »</p>
              <p className="mt-4 text-sm font-bold text-brand-deep">{h.ref}</p>
              <p className="text-sm text-slate-600">Authenticité : {h.grade}</p>
              <a href={sunnahLink(h)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-[40px] items-center gap-1 text-sm font-medium text-brand">Vérifier la source <ExternalLink size={14} /></a>
            </div>
            {h.contexte && <div className="mt-4 rounded-2xl bg-brand-mist p-4 text-[15px] leading-relaxed text-slate-700"><b className="text-brand-deep">Explication :</b> {h.contexte}</div>}
          </section>
        )}

        {cur === 'quiz' && (
          <section>
            <Head icon={HelpCircle} label="Petit quiz" />
            <h1 className="text-xl font-extrabold leading-snug text-slate-900">{etape.quiz.q}</h1>
            <div className={`mt-5 space-y-3 ${verdict === 'ko' ? 'shake' : ''}`} role="radiogroup">
              {options.map(({ v: label, i }) => {
                const sel = choix === i
                const cls = verdict && sel ? (verdict === 'ok' ? 'choice-correct' : 'choice-wrong') : sel ? 'choice-selected' : ''
                return <button key={i} role="radio" aria-checked={sel} disabled={verdict === 'ok'} onClick={() => { setChoix(i); if (verdict === 'ko') setVerdict(null) }} className={`choice ${cls}`}>{label}</button>
              })}
            </div>
            <p className="mt-4 text-xs text-slate-400">Pas de pénalité : tu peux réessayer autant que tu veux.</p>
          </section>
        )}

        {cur === 'reflexion' && (
          <section>
            <Head icon={PenLine} label="Question de réflexion" />
            <h1 className="text-xl font-extrabold leading-snug text-slate-900">{etape.reflexion}</h1>
            <textarea value={reflexion} onChange={(e) => setReflexion(e.target.value)} maxLength={600} rows={5} className="input mt-5" placeholder="Écris librement… (facultatif)" aria-label="Ta réflexion" />
            <p className="mt-2 text-xs text-slate-500">Ta réponse est strictement privée : elle n'est jamais publiée ni visible par l'équipe.</p>
          </section>
        )}

        {cur === 'mission' && (
          <section>
            <Head icon={Target} label="Mission du jour" />
            <div className="rounded-3xl bg-gradient-to-br from-brand-deep to-brand p-5 text-white">
              <p className="text-lg font-bold leading-snug">{etape.mission}</p>
            </div>
            <button onClick={() => setEngage(!engage)} aria-pressed={engage} className={`choice mt-4 flex items-center gap-3 ${engage ? 'choice-correct' : ''}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 ${engage ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>{engage && <Check size={18} strokeWidth={3} />}</span>
              Je m'engage à la réaliser aujourd'hui, in sha Allah
            </button>
            <Link to="/suivi" className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-brand">Ajouter un objectif dans mon suivi →</Link>
          </section>
        )}

        {cur === 'invocation' && (
          <section>
            <Head icon={HandHeart} label="Invocation à apprendre" />
            <InvocationCard id={etape.invocation} />
            <p className="mt-3 text-sm text-slate-500">Récite-la lentement, trois fois, en comprenant son sens.</p>
          </section>
        )}

        {cur === 'bilan' && (
          <section>
            <Head icon={Smile} label="Bilan de l'étape" />
            <h1 className="text-xl font-extrabold text-slate-900">Comment te sens-tu après cette étape ?</h1>
            <div className="mt-5 grid gap-3">
              {[['motive', 'Motivé(e) pour changer', '💪'], ['apaise', 'Apaisé(e)', '🌿'], ['reflexion', 'En pleine réflexion', '💭'], ['difficile', 'Je traverse un moment difficile', '🤲']].map(([k, l, e]) => (
                <button key={k} onClick={() => setRessenti(k)} aria-pressed={ressenti === k} className={`choice flex items-center gap-3 ${ressenti === k ? 'choice-selected' : ''}`}><span className="text-2xl" aria-hidden="true">{e}</span>{l}</button>
              ))}
            </div>
            <ul className="mt-6 space-y-2 rounded-2xl bg-brand-mist p-4 text-sm text-slate-700">
              <li className="flex gap-2"><Check size={17} className="shrink-0 text-brand" />Leçon, verset et hadith découverts</li>
              <li className="flex gap-2"><Check size={17} className="shrink-0 text-brand" />Quiz réussi{essais === 1 ? ' du premier coup' : ''}</li>
              <li className="flex gap-2"><Check size={17} className="shrink-0 text-brand" />{reflexion.trim() ? 'Réflexion écrite' : 'Réflexion (passée)'}</li>
              <li className="flex gap-2"><Check size={17} className="shrink-0 text-brand" />{engage ? 'Mission acceptée' : 'Mission à faire quand tu peux'}</li>
            </ul>
            {err && <Alert type="error" className="mt-4">{err}</Alert>}
          </section>
        )}
      </div>

      {/* Barre d'action fixe (pouce) */}
      <div className={`fixed inset-x-0 bottom-0 z-[60] border-t-2 ${verdict === 'ok' && cur === 'quiz' ? 'border-emerald-200 bg-emerald-50' : verdict === 'ko' && cur === 'quiz' ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-white'}`} style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <div className="container-ad max-w-xl pt-3">
          {cur === 'quiz' && verdict === 'ok' && <div className="rise mb-3 flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Check size={22} strokeWidth={3} /></span><div><p className="font-extrabold text-emerald-800">{essais === 1 ? 'Excellent, du premier coup !' : 'Bravo, c\'est la bonne réponse !'}</p><p className="text-sm text-emerald-900/80">{etape.quiz.e}</p></div></div>}
          {cur === 'quiz' && verdict === 'ko' && <div className="rise mb-3 flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-400 text-white"><Heart size={20} /></span><div><p className="font-extrabold text-amber-800">Pas tout à fait…</p><p className="text-sm text-amber-900/80">Relis tranquillement et choisis une autre réponse. Aucune pénalité.</p></div></div>}
          {cur === 'quiz' && verdict !== 'ok'
            ? <button onClick={verifier} disabled={choix === null || verdict === 'ko'} className="btn-3d w-full text-base">Vérifier</button>
            : cur === 'bilan'
              ? <button onClick={terminer} className="btn-3d w-full text-base"><Trophy size={19} />Terminer cette étape</button>
              : <div className="flex gap-2">
                  {(cur === 'reflexion' && !reflexion.trim()) && <button onClick={suivant} className="btn-ghost flex-1">Passer</button>}
                  <button onClick={suivant} disabled={!canNext} className="btn-3d flex-[2] text-base">Continuer</button>
                </div>}
        </div>
      </div>
    </div>
  )
}
