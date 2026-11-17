import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Flame, Target, CalendarCheck, Sparkles, Plus, Trash2, Minus, RotateCcw, History, Trophy, LogIn } from 'lucide-react'
import Seo from '../components/Seo'
import ProgressCard from '../components/ProgressCard'
import { PageHeader, Alert, Section } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useProgress, useProgressData } from '../hooks/useProgress'
import { useContent } from '../hooks/useContent'
import { PRIERES, DHIKRS } from '../services/progress'
import { dayKey, lastDays, formatDay, streak } from '../lib/dates'

function Prayers({ day, rows, onToggle }) {
  const done = new Set(rows.filter((r) => r.day === day).map((r) => r.ref))
  return (
    <div className="grid grid-cols-5 gap-2">
      {PRIERES.map((p) => (
        <button key={p.id} onClick={() => onToggle(p.id, !done.has(p.id))} aria-pressed={done.has(p.id)} className={`flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold ring-1 transition ${done.has(p.id) ? 'bg-brand-deep text-white ring-brand-deep' : 'bg-white text-slate-600 ring-slate-200'}`}>
          <span className={`grid h-7 w-7 place-items-center rounded-full ${done.has(p.id) ? 'bg-white/20' : 'bg-brand-light text-brand-deep'}`}>{done.has(p.id) ? <Check size={16} /> : null}</span>{p.nom}
        </button>
      ))}
    </div>
  )
}

function Dhikr({ rows, onSet }) {
  const today = dayKey()
  const [sel, setSel] = useState(DHIKRS[0].id)
  const d = DHIKRS.find((x) => x.id === sel)
  const count = rows.find((r) => r.day === today && r.ref === sel)?.value || 0
  return (
    <div className="card p-4">
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">{DHIKRS.map((x) => <button key={x.id} onClick={() => setSel(x.id)} className={`chip ${sel === x.id ? 'chip-active' : ''}`}>{x.nom}</button>)}</div>
      <p className="arabic mt-2 text-center text-2xl">{d.ar}</p>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button onClick={() => onSet(sel, Math.max(0, count - 1))} className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-600" aria-label="Retirer un"><Minus size={20} /></button>
        <button onClick={() => { onSet(sel, count + 1); if (count + 1 === d.objectif) navigator.vibrate?.(120) }} className={`grid h-32 w-32 place-items-center rounded-full text-white shadow-lg transition active:scale-95 ${count >= d.objectif ? 'bg-brand' : 'bg-brand-deep'}`} aria-label={`Compter ${d.nom}`}>
          <span className="text-center leading-none"><span className="block text-4xl font-bold">{count}</span><span className="text-xs opacity-80">/ {d.objectif}</span></span>
        </button>
        <button onClick={() => onSet(sel, 0)} className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-600" aria-label="Remettre à zéro"><RotateCcw size={18} /></button>
      </div>
      {count >= d.objectif && <p className="mt-3 text-center text-sm font-medium text-brand">Objectif atteint, qu'Allah accepte !</p>}
    </div>
  )
}

function Goals({ goals, api, bump }) {
  const [titre, setTitre] = useState('')
  const add = async (e) => { e.preventDefault(); if (!titre.trim()) return; await api.saveGoal({ titre: titre.trim() }); setTitre(''); bump() }
  return (
    <div className="card p-4">
      <form onSubmit={add} className="flex gap-2">
        <input value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={140} className="input" placeholder="Ex. : prier le Fajr à l'heure" aria-label="Nouvel objectif" />
        <button className="btn-primary shrink-0 px-4" aria-label="Ajouter l'objectif"><Plus size={20} /></button>
      </form>
      <ul className="mt-3 space-y-2">
        {goals.map((g) => (
          <li key={g.id} className="flex items-center gap-2 rounded-xl bg-brand-mist p-2">
            <button onClick={async () => { await api.saveGoal({ ...g, done: !g.done }); bump() }} aria-pressed={g.done} className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-2 ${g.done ? 'bg-brand text-white ring-brand' : 'bg-white ring-slate-300'}`} aria-label={g.done ? 'Marquer non atteint' : 'Marquer atteint'}>{g.done && <Check size={18} />}</button>
            <span className={`flex-1 text-[15px] ${g.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{g.titre}</span>
            <button onClick={async () => { await api.deleteGoal(g); bump() }} className="grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:text-red-600" aria-label="Supprimer l'objectif"><Trash2 size={17} /></button>
          </li>
        ))}
        {!goals.length && <li className="py-2 text-center text-sm text-slate-500">Ajoute ton premier objectif.</li>}
      </ul>
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, configured } = useAuth()
  const { api, bump, isGuest } = useProgress()
  const { programme } = useContent()
  const today = dayKey()
  const week = lastDays(7)
  const [err, setErr] = useState(null)
  const prog = useProgressData((a) => a.programme())
  const prayers = useProgressData((a) => a.prayers(week[0], today))
  const dhikr = useProgressData((a) => a.dhikr(week[0], today))
  const goals = useProgressData((a) => a.goals())
  const reviews = useProgressData((a) => a.listReviews(30))
  const run = (fn) => async (...args) => { setErr(null); try { await fn(...args); bump() } catch (e) { setErr(e.message) } }

  const pRows = prayers.data || []
  const dRows = dhikr.data || []
  const doneCount = Object.keys(prog.data?.done || {}).length
  const next = programme.find((d) => !prog.data?.done?.[d.jour])
  const prayToday = pRows.filter((r) => r.day === today).length
  const prayWeek = pRows.length
  const dhikrWeek = dRows.reduce((s, r) => s + r.value, 0)
  const activeDays = new Set([...pRows.map((r) => r.day), ...(reviews.data || []).map((r) => r.day), ...(prog.data?.historique || []).map((h) => h.day)])
  const serie = streak(activeDays)
  const reviewToday = (reviews.data || []).some((r) => r.day === today)
  const name = profile?.display_name || user?.email?.split('@')[0]

  return (
    <>
      <Seo title="Mon parcours" noindex />
      <PageHeader eyebrow="Mon parcours" title={name ? `Assalamou alaykoum, ${name}` : 'Mon parcours'} subtitle={formatDay(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
      <div className="container-ad">
        {isGuest && (
          <Alert className="mt-5">
            <span>Mode invité : ta progression est enregistrée sur cet appareil. {configured && <><Link to="/inscription" className="font-semibold underline">Crée un compte</Link> pour la sauvegarder et la synchroniser (elle sera transférée automatiquement).</>}</span>
          </Alert>
        )}
        {err && <Alert type="error" className="mt-4">{err}</Alert>}

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ProgressCard icon={Sparkles} label="Programme" value={doneCount} total={30} hint={`Cycle ${prog.data?.cycle || 1}`} />
          <ProgressCard icon={Check} label="Prières aujourd'hui" value={prayToday} total={5} hint={`${prayWeek} cette semaine`} />
          <ProgressCard icon={Flame} label="Série active" value={serie} hint={serie > 1 ? 'jours consécutifs' : 'jour'} />
          <ProgressCard icon={Trophy} label="Encouragements" value={prog.data?.encouragements || 0} hint={`${dhikrWeek} dhikr cette semaine`} />
        </div>

        {next && (
          <Link to={`/programme/jour/${next.jour}`} className="card mt-4 flex items-center gap-3 p-4 ring-2 ring-brand hover:shadow-lg">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-deep font-bold text-white">J{next.jour}</span>
            <span className="flex-1"><span className="eyebrow">Mission du jour</span><span className="block font-semibold text-slate-900">{next.mission}</span></span>
          </Link>
        )}
        {!reviewToday && (
          <Link to="/bilan" className="card mt-3 flex items-center gap-3 p-4 hover:shadow-lg">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-deep"><CalendarCheck size={22} /></span>
            <span className="flex-1"><span className="block font-semibold text-slate-900">Fais le bilan de ta journée</span><span className="text-sm text-slate-500">Pas encore fait aujourd'hui</span></span>
          </Link>
        )}

        <Section title="Suivi des prières">
          <div className="card p-4">
            <p className="mb-3 text-sm text-slate-600">Coche les prières accomplies aujourd'hui.</p>
            <Prayers day={today} rows={pRows} onToggle={run((id, v) => api.setPrayer(today, id, v))} />
            <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label="Prières des 7 derniers jours">
              {week.map((d) => { const n = pRows.filter((r) => r.day === d).length; return (
                <div key={d} className="text-center"><div className="mx-auto flex h-16 w-full max-w-[38px] items-end overflow-hidden rounded-lg bg-brand-light"><div className="w-full rounded-lg bg-brand" style={{ height: `${(n / 5) * 100}%` }} /></div><span className="mt-1 block text-[11px] capitalize text-slate-500">{formatDay(d, { weekday: 'short' }).slice(0, 3)}</span></div>
              ) })}
            </div>
          </div>
        </Section>

        <Section title="Dhikr du jour"><Dhikr rows={dRows} onSet={run((id, v) => api.setDhikr(today, id, v))} /></Section>

        <Section title="Mes objectifs"><Goals goals={goals.data || []} api={api} bump={bump} /></Section>

        <Section title="Historique des missions" action={<Link to="/programme" className="text-sm font-semibold text-brand">Programme</Link>}>
          <div className="card divide-y divide-slate-100">
            {(prog.data?.historique || []).slice(0, 10).map((h) => {
              const d = programme.find((x) => x.jour === h.jour)
              return <div key={`${h.cycle}-${h.jour}`} className="flex items-center gap-3 p-3.5"><History size={17} className="shrink-0 text-brand" /><span className="flex-1 text-sm"><span className="font-medium text-slate-900">Jour {h.jour}</span> — {d?.mission}<span className="block text-xs text-slate-500">Cycle {h.cycle} · {formatDay(h.day, { day: 'numeric', month: 'short' })}</span></span></div>
            })}
            {!prog.data?.historique?.length && <p className="p-4 text-center text-sm text-slate-500">Aucune mission accomplie pour l'instant. <Link to="/programme" className="font-semibold text-brand">Commencer</Link></p>}
          </div>
        </Section>

        <Section title="Bilans récents">
          <div className="card divide-y divide-slate-100">
            {(reviews.data || []).slice(0, 7).map((r) => <div key={r.day} className="flex items-center justify-between p-3.5"><span className="text-sm capitalize text-slate-700">{formatDay(r.day)}</span><span className="badge bg-brand-light text-brand-deep">{r.score ?? '–'} / 6</span></div>)}
            {!reviews.data?.length && <p className="p-4 text-center text-sm text-slate-500">Aucun bilan pour l'instant. <Link to="/bilan" className="font-semibold text-brand">Faire mon premier bilan</Link></p>}
          </div>
        </Section>

        {isGuest && configured && <div className="mt-8 grid gap-2 sm:grid-cols-2"><Link to="/inscription" className="btn-primary"><Target size={18} />Créer mon compte</Link><Link to="/connexion" className="btn-ghost"><LogIn size={18} />J'ai déjà un compte</Link></div>}
      </div>
    </>
  )
}
