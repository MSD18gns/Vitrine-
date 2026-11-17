import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Check, X, Minus } from 'lucide-react'
import Seo from '../components/Seo'
import { PageHeader, Alert, Spinner } from '../components/ui'
import InvocationCard from '../components/InvocationCard'
import { useProgress, useProgressData } from '../hooks/useProgress'
import { dayKey, formatDay } from '../lib/dates'

export const QUESTIONS = [
  { id: 'prieres', q: 'Ai-je accompli mes prières ?', positif: true },
  { id: 'dhikr', q: "Ai-je consacré du temps au rappel d'Allah ?", positif: true },
  { id: 'interdits', q: 'Ai-je évité les contenus interdits ?', positif: true },
  { id: 'blesse', q: "Ai-je blessé quelqu'un avec mes paroles ?", positif: false },
  { id: 'bonne_action', q: 'Ai-je fait une bonne action ?', positif: true },
  { id: 'pardon', q: 'Ai-je demandé pardon à Allah ?', positif: true },
]

// Message bienveillant selon les réponses — jamais culpabilisant
function message(answers) {
  const pts = QUESTIONS.reduce((s, x) => s + ((x.positif ? answers[x.id] === 'oui' : answers[x.id] === 'non') ? 1 : 0), 0)
  const conseils = []
  if (answers.prieres === 'non') conseils.push("Demain, essaie de poser ton téléphone dès l'appel à la prière. Allah t'attend.")
  if (answers.dhikr === 'non') conseils.push('Deux minutes de dhikr après une prière suffisent pour commencer.')
  if (answers.interdits === 'non') conseils.push("Ce n'est pas la fin : renouvelle ta tawbah ce soir et ferme une porte de tentation demain.")
  if (answers.blesse === 'oui') conseils.push("Un message d'excuse sincère peut réparer beaucoup. Le pardon élève.")
  if (answers.bonne_action === 'non') conseils.push('Un sourire, un service, une petite aumône : demain, choisis un bien facile.')
  if (answers.pardon === 'non') conseils.push('Il n\'est pas trop tard : dis « Astaghfirullah » avant de dormir.')
  const titre = pts >= 5 ? 'Ma sha Allah, belle journée !' : pts >= 3 ? 'Tu avances, continue !' : 'Chaque jour est une nouvelle chance.'
  const texte = pts >= 5 ? "Remercie Allah pour cette journée et demande-Lui la constance. Les actions les plus aimées d'Allah sont les plus régulières."
    : pts >= 3 ? 'Tu as fait de vrais efforts aujourd\'hui. Concentre-toi demain sur un seul point à améliorer.'
    : "Allah tend Sa main la nuit pour accueillir le repentir de celui qui a mal agi le jour. Le simple fait de faire ce bilan montre que ton cœur est vivant."
  return { pts, titre, texte, conseils }
}

const Choice = ({ value, current, onClick, children, icon: Icon }) => (
  <button type="button" onClick={onClick} aria-pressed={current === value} className={`flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold ring-1 transition ${current === value ? 'bg-brand-deep text-white ring-brand-deep' : 'bg-white text-slate-600 ring-slate-200'}`}><Icon size={16} />{children}</button>
)

export default function BilanQuotidien() {
  const { api, bump, isGuest } = useProgress()
  const today = dayKey()
  const { data: existing, loading } = useProgressData((a) => a.getReview(today))
  const { data: history } = useProgressData((a) => a.listReviews(7))
  const [answers, setAnswers] = useState({})
  const [note, setNote] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  // Le bilan enregistré n'est chargé qu'une fois : un rechargement des données
  // ne doit jamais écraser des réponses que l'utilisateur est en train de modifier.
  const loaded = useRef(false)
  useEffect(() => {
    if (existing && !loaded.current) { loaded.current = true; setAnswers(existing.answers || {}); setNote(existing.note || ''); setResult(message(existing.answers || {})) }
  }, [existing])

  const set = (id, v) => setAnswers((a) => ({ ...a, [id]: v }))
  const complete = QUESTIONS.every((x) => answers[x.id])
  const save = async (e) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const r = message(answers)
      await api.saveReview({ day: today, answers, note: note.trim(), score: r.pts })
      setResult(r); bump()
      setTimeout(() => document.getElementById('resultat')?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }

  if (loading && !existing) return <Spinner />
  return (
    <>
      <Seo title="Bilan quotidien" description="Fais le bilan de ta journée en quelques questions, sans culpabiliser, pour avancer chaque jour." noindex />
      <PageHeader emoji="📝" eyebrow={formatDay(today)} title="Fais le bilan de ta journée" subtitle="Quelques questions honnêtes, entre toi et Allah. Personne d'autre ne verra tes réponses." />
      <div className="container-ad max-w-2xl">
        <p className="mt-5 flex items-center gap-2 text-sm text-slate-600"><Lock size={15} className="text-brand" />{isGuest ? 'Tes réponses restent sur cet appareil.' : 'Tes réponses sont privées et protégées dans ton compte.'}</p>
        <form onSubmit={save} className="mt-4 space-y-3">
          {QUESTIONS.map((x, i) => (
            <fieldset key={x.id} className="card p-4">
              <legend className="sr-only">{x.q}</legend>
              <p className="mb-3 font-medium text-slate-900">{i + 1}. {x.q}</p>
              <div className="flex gap-2">
                <Choice value="oui" current={answers[x.id]} onClick={() => set(x.id, 'oui')} icon={Check}>Oui</Choice>
                <Choice value="partiellement" current={answers[x.id]} onClick={() => set(x.id, 'partiellement')} icon={Minus}>En partie</Choice>
                <Choice value="non" current={answers[x.id]} onClick={() => set(x.id, 'non')} icon={X}>Non</Choice>
              </div>
            </fieldset>
          ))}
          <div className="card p-4">
            <label htmlFor="note" className="mb-2 block font-medium text-slate-900">7. Quelle habitude dois-je améliorer demain ?</label>
            <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={3} className="input" placeholder="Ex. : poser mon téléphone à l'heure du Fajr" />
          </div>
          {err && <Alert type="error">{err}</Alert>}
          <button disabled={!complete || busy} className="btn-primary w-full">{busy ? 'Enregistrement…' : existing ? 'Mettre à jour mon bilan' : 'Enregistrer mon bilan'}</button>
          {!complete && <p className="text-center text-xs text-slate-500">Réponds aux 6 questions pour enregistrer.</p>}
        </form>

        {result && (
          <section id="resultat" className="mt-6 space-y-3">
            <div className="rounded-3xl bg-gradient-to-br from-brand-deep to-brand p-5 text-white">
              <h2 className="font-display text-2xl font-bold text-white">{result.titre}</h2>
              <p className="mt-2 leading-relaxed text-emerald-50">{result.texte}</p>
            </div>
            {result.conseils.length > 0 && <div className="card p-4"><h3 className="mb-2 font-semibold">Pour demain, avec douceur</h3><ul className="space-y-2 text-[15px] text-slate-700">{result.conseils.map((c) => <li key={c}>✦ {c}</li>)}</ul></div>}
            <InvocationCard id="kaffara-majlis" />
          </section>
        )}

        {history?.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold">Mes derniers bilans</h2>
            <ul className="space-y-2">{history.map((h) => <li key={h.day} className="card flex items-center justify-between p-3.5"><span className="text-sm capitalize text-slate-700">{formatDay(h.day)}</span><span className="badge bg-brand-light text-brand-deep">{h.score ?? '–'} / 6</span></li>)}</ul>
            <Link to="/suivi" className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-brand">Voir mon suivi complet →</Link>
          </section>
        )}
      </div>
    </>
  )
}
