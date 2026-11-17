import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Target, Lightbulb, Footprints } from 'lucide-react'
import Seo from '../components/Seo'
import { PageHeader, Spinner, Alert } from '../components/ui'
import VerseCard from '../components/VerseCard'
import HadithCard from '../components/HadithCard'
import InvocationCard from '../components/InvocationCard'
import { PHASES } from '../content/programme'
import { useContent } from '../hooks/useContent'
import { useProgress, useProgressData } from '../hooks/useProgress'
import NotFound from './NotFound'

const ENCOURAGEMENTS = ["Ma sha Allah, qu'Allah accepte ton effort !", 'Chaque pas compte auprès d\'Allah.', 'Continue, tu es sur le bon chemin.', 'Les actions les plus aimées d\'Allah sont les plus régulières.', 'Bravo ! Ton cœur te remerciera.']

export default function JourProgramme() {
  const { jour: j } = useParams()
  const jour = Number(j)
  const nav = useNavigate()
  const { programme } = useContent()
  const { api, bump } = useProgress()
  const { data, loading } = useProgressData((a) => a.programme())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const d = programme.find((x) => x.jour === jour)
  if (!d) return <NotFound />
  if (loading && !data) return <Spinner />
  const phase = PHASES.find((p) => p.id === d.phase)
  const isDone = !!data?.done?.[jour]

  const toggle = async () => {
    setBusy(true); setErr(null)
    try {
      await api.setMission(data.cycle, jour, !isDone)
      setMsg(!isDone ? ENCOURAGEMENTS[jour % ENCOURAGEMENTS.length] : null)
      bump()
    } catch (e) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <>
      <Seo title={`Jour ${jour} — ${d.mission}`} description={d.explication} />
      <PageHeader emoji="🎯" back={['/programme', 'Programme']} eyebrow={`Jour ${jour} / 30 · ${phase?.titre}`} title={d.mission} subtitle={d.enseignement} />
      <div className="container-ad max-w-3xl">
        <section className="card mt-6 p-4"><h2 className="mb-2 flex items-center gap-2 font-semibold"><Target size={18} className="text-brand" />Mission</h2><p className="text-slate-700">{d.mission}</p></section>
        <section className="mt-4"><h2 className="mb-2 font-semibold">Verset</h2><VerseCard id={d.verset} /></section>
        <section className="mt-4"><h2 className="mb-2 font-semibold">Hadith authentique</h2><HadithCard id={d.hadith} /></section>
        <section className="card mt-4 p-4"><h2 className="mb-2 flex items-center gap-2 font-semibold"><Lightbulb size={18} className="text-brand" />Explication</h2><p className="leading-relaxed text-slate-700">{d.explication}</p></section>
        <section className="mt-4 rounded-2xl bg-brand-deep p-4 text-white"><h2 className="mb-2 flex items-center gap-2 font-semibold text-white"><Footprints size={18} />Action concrète du jour</h2><p className="leading-relaxed text-emerald-50">{d.action}</p></section>
        <section className="mt-4"><h2 className="mb-2 font-semibold">Invocation</h2><InvocationCard id={d.invocation} /></section>

        {err && <Alert type="error" className="mt-4">{err}</Alert>}
        {msg && <Alert type="success" className="mt-4">{msg}</Alert>}
        <label className={`card mt-6 flex cursor-pointer items-center gap-4 p-4 ring-2 ${isDone ? 'bg-brand-light ring-brand' : 'ring-transparent'}`}>
          <input type="checkbox" checked={isDone} onChange={toggle} disabled={busy} className="peer sr-only" />
          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-2 transition peer-focus-visible:ring-4 ${isDone ? 'bg-brand text-white ring-brand' : 'bg-white ring-slate-300'}`}>{isDone && <Check size={20} />}</span>
          <span className="font-semibold text-slate-900">{isDone ? 'Mission accomplie' : "J'ai accompli la mission du jour"}</span>
        </label>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={() => nav(`/programme/jour/${jour - 1}`)} disabled={jour <= 1} className="btn-ghost"><ChevronLeft size={18} />Jour {jour - 1 || ''}</button>
          {jour < 30 ? <button onClick={() => nav(`/programme/jour/${jour + 1}`)} className="btn-primary">Jour {jour + 1}<ChevronRight size={18} /></button> : <Link to="/programme" className="btn-primary">Terminer</Link>}
        </div>
      </div>
    </>
  )
}
