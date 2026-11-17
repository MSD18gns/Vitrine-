import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Check, RotateCcw, Trophy, Sparkles, ChevronRight, Info } from 'lucide-react'
import Seo from '../components/Seo'
import { PageHeader, Spinner, Alert } from '../components/ui'
import { PHASES } from '../content/programme'
import { useContent } from '../hooks/useContent'
import { useProgress, useProgressData } from '../hooks/useProgress'

export default function Programme30Jours() {
  const { programme } = useContent()
  const { api, bump, isGuest } = useProgress()
  const { data, loading, error } = useProgressData((a) => a.programme())
  const [confirm, setConfirm] = useState(false)

  if (loading && !data) return <Spinner />
  const done = data?.done || {}
  const count = Object.keys(done).length
  const next = programme.find((d) => !done[d.jour])
  const restart = async () => { await api.restartProgramme(); setConfirm(false); bump() }

  return (
    <>
      <Seo title="Programme de transformation de 30 jours" description="30 jours, 30 missions : prendre conscience, éloigner les tentations, se repentir, renforcer la prière et consolider de nouvelles habitudes." />
      <PageHeader emoji="📅" eyebrow={`Cycle ${data?.cycle || 1}`} title="Programme de transformation — 30 jours" subtitle="Chaque jour : une mission, un enseignement, un verset, un hadith, une action concrète et une invocation.">
        <div className="mt-6 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
          <div className="flex items-center justify-between text-sm"><span>{count} / 30 missions accomplies</span><span className="font-semibold">{Math.round((count / 30) * 100)} %</span></div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${(count / 30) * 100}%` }} /></div>
          <p className="mt-3 flex items-center gap-2 text-sm text-emerald-50"><Trophy size={16} />{data?.encouragements || 0} encouragement{(data?.encouragements || 0) > 1 ? "s" : ""} gagné{(data?.encouragements || 0) > 1 ? "s" : ""} au total</p>
        </div>
      </PageHeader>

      <div className="container-ad">
        {error && <Alert type="error" className="mt-4">{error}</Alert>}
        {isGuest && <Alert className="mt-4"><span>Ta progression est enregistrée sur cet appareil. <Link to="/inscription" className="font-semibold underline">Crée un compte</Link> pour la sauvegarder et la retrouver partout.</span></Alert>}

        {next ? (
          <Link to={`/programme/jour/${next.jour}`} className="card mt-5 flex items-center gap-4 p-4 ring-2 ring-brand hover:shadow-lg">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-deep text-white"><span className="text-center leading-none"><span className="block text-[10px] uppercase">Jour</span><span className="text-xl font-bold">{next.jour}</span></span></span>
            <span className="min-w-0 flex-1"><span className="eyebrow">Ta prochaine mission</span><span className="block font-semibold text-slate-900">{next.mission}</span></span>
            <ChevronRight className="shrink-0 text-slate-400" />
          </Link>
        ) : (
          <div className="card mt-5 p-5 text-center">
            <Sparkles className="mx-auto mb-2 text-brand" size={32} />
            <h2 className="text-xl font-bold">Ma sha Allah, tu as terminé les 30 jours !</h2>
            <p className="mt-1 text-slate-600">Qu'Allah accepte tes efforts. Tu peux recommencer un nouveau cycle pour aller encore plus loin.</p>
          </div>
        )}

        {PHASES.map((ph) => (
          <section key={ph.id} className="mt-8">
            <h2 className="text-lg font-bold">{ph.id}. {ph.titre}</h2>
            <p className="mb-3 text-sm text-slate-600">Jours {ph.jours[0]} à {ph.jours[1]} — {ph.texte}</p>
            <div className="grid gap-2">
              {programme.filter((d) => d.phase === ph.id).map((d) => (
                <Link key={d.jour} to={`/programme/jour/${d.jour}`} className={`card flex items-center gap-3 p-3.5 hover:shadow-lg ${done[d.jour] ? 'bg-brand-light/50' : ''}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${done[d.jour] ? 'bg-brand text-white' : 'bg-brand-light text-brand-deep'}`}>{done[d.jour] ? <Check size={18} /> : d.jour}</span>
                  <span className="min-w-0 flex-1"><span className="block text-xs text-slate-500">Jour {d.jour}</span><span className="block font-medium leading-snug text-slate-900">{d.mission}</span></span>
                  <ChevronRight size={18} className="shrink-0 text-slate-400" />
                </Link>
              ))}
            </div>
          </section>
        ))}

        <div className="card mt-10 p-4">
          <h2 className="flex items-center gap-2 font-semibold"><RotateCcw size={18} className="text-brand" />Recommencer le programme</h2>
          <p className="mt-1 text-sm text-slate-600">Un nouveau cycle commence à zéro. Tes encouragements et l'historique de tes missions sont conservés.</p>
          {confirm ? (
            <div className="mt-3 flex gap-2"><button onClick={restart} className="btn-primary btn-sm flex-1">Oui, recommencer</button><button onClick={() => setConfirm(false)} className="btn-ghost btn-sm flex-1">Annuler</button></div>
          ) : <button onClick={() => setConfirm(true)} className="btn-ghost btn-sm mt-3">Commencer un nouveau cycle</button>}
        </div>
        <p className="mt-4 flex gap-2 text-xs text-slate-500"><Info size={14} className="shrink-0" />Tu avances à ton rythme : une mission peut être validée n'importe quel jour.</p>
      </div>
    </>
  )
}
