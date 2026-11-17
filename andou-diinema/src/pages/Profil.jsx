import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Bell, Trash2, ShieldCheck, UserRound, Download, Smartphone, LogIn, Trophy, Activity, EyeOff, ChevronRight } from 'lucide-react'
import Seo from '../components/Seo'
import { PageHeader, Alert, Section } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'
import { signOut, updateProfile, deleteAccount } from '../services/auth'
import { DEFAULT_PREFS, askPermission, permission, testNotification, notificationsSupported } from '../services/notifications'

const LABELS = { programme: 'Prochaine étape du parcours', dhikr: 'Moment de dhikr', bilan: 'Bilan du soir' }

function ModeSobre() {
  const { api, bump } = useProgress()
  const [sobre, setSobre] = useState(false)
  useEffect(() => { api.gamePrefs().then((p) => setSobre(p.sobre)) }, [api])
  const toggle = async () => { const v = !sobre; setSobre(v); await api.setGamePrefs({ sobre: v }); bump() }
  return (
    <label className="card flex cursor-pointer items-center gap-3 p-4">
      <EyeOff size={20} className="shrink-0 text-brand" />
      <span className="flex-1"><span className="block font-semibold text-slate-900">Mode sobre</span><span className="text-sm text-slate-500">Masquer XP, niveaux et séries. Le parcours reste identique.</span></span>
      <input type="checkbox" checked={sobre} onChange={toggle} className="h-6 w-6 accent-brand-deep" />
    </label>
  )
}

function Reminders() {
  const { api } = useProgress()
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [perm, setPerm] = useState(permission())
  const [saved, setSaved] = useState(false)
  useEffect(() => { api.reminderPrefs().then((p) => setPrefs({ ...DEFAULT_PREFS, ...p })) }, [api])
  const update = async (k, patch) => {
    const next = { ...prefs, [k]: { ...prefs[k], ...patch } }
    setPrefs(next)
    if (patch.actif && perm !== 'granted') setPerm(await askPermission())
    await api.setReminderPrefs(next); setSaved(true); setTimeout(() => setSaved(false), 1500)
  }
  return (
    <div className="card p-4">
      {!notificationsSupported() ? <Alert type="warning">Ton navigateur ne prend pas en charge les notifications. Sur iPhone, installe d'abord le site sur l'écran d'accueil.</Alert>
        : perm === 'denied' ? <Alert type="warning">Les notifications sont bloquées pour ce site dans les réglages de ton navigateur.</Alert> : null}
      <ul className="mt-2 divide-y divide-slate-100">
        {Object.keys(DEFAULT_PREFS).map((k) => (
          <li key={k} className="flex items-center gap-3 py-3">
            <label className="flex flex-1 items-center gap-3"><input type="checkbox" checked={!!prefs[k]?.actif} onChange={(e) => update(k, { actif: e.target.checked })} className="h-5 w-5 accent-brand-deep" /><span className="text-[15px] text-slate-800">{LABELS[k]}</span></label>
            <input type="time" value={prefs[k]?.heure || '08:00'} onChange={(e) => update(k, { heure: e.target.value })} className="input min-h-[44px] w-28 py-2" aria-label={`Heure du rappel ${LABELS[k]}`} />
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-slate-500">Les rappels s'affichent lorsque le site ou l'application installée est ouvert(e) après l'heure choisie. {saved && <span className="font-semibold text-brand">Enregistré ✓</span>}</p>
      {perm === 'granted' && <button onClick={testNotification} className="btn-ghost btn-sm mt-3">Tester une notification</button>}
    </div>
  )
}

export default function Profil() {
  const { user, profile, roles, isStaff, refreshProfile, configured } = useAuth()
  const { api } = useProgress()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [msg, setMsg] = useState(null)
  const [confirmDel, setConfirmDel] = useState('')
  const [installEvt, setInstallEvt] = useState(null)
  useEffect(() => { setName(profile?.display_name || '') }, [profile])
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setInstallEvt(e) }
    window.addEventListener('beforeinstallprompt', h)
    return () => window.removeEventListener('beforeinstallprompt', h)
  }, [])

  const saveName = async (e) => {
    e.preventDefault()
    try { await updateProfile(user.id, { display_name: name.trim() }); await refreshProfile(); setMsg({ type: 'success', t: 'Profil mis à jour.' }) } catch (e2) { setMsg({ type: 'error', t: e2.message }) }
  }
  const exportData = async () => {
    const [programme, prayers, dhikr, goals, reviews, bookmarks] = await Promise.all([api.programme(), api.prayers(), api.dhikr(), api.goals(), api.listReviews(1000), api.listBookmarks()])
    const blob = new Blob([JSON.stringify({ exporte_le: new Date().toISOString(), profil: profile, programme, prayers, dhikr, goals, reviews, bookmarks }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'andou-diinema-mes-donnees.json'; a.click(); URL.revokeObjectURL(a.href)
  }
  const del = async () => {
    try { await deleteAccount(); nav('/') } catch (e) { setMsg({ type: 'error', t: e.message }) }
  }

  return (
    <>
      <Seo title="Profil" noindex />
      <PageHeader emoji="👤" eyebrow="Profil" title={user ? (profile?.display_name || 'Mon profil') : 'Profil'} subtitle={user ? user.email : 'Connecte-toi pour sauvegarder ta progression sur tous tes appareils.'} />
      <div className="container-ad max-w-2xl">
        {msg && <Alert type={msg.type} className="mt-4">{msg.t}</Alert>}
        {!user && (
          <div className="card mt-5 p-5 text-center">
            <UserRound className="mx-auto mb-2 text-brand" size={36} />
            <p className="text-slate-700">Tu utilises ANDOU DIINEMA en mode invité. Ta progression est enregistrée sur cet appareil.</p>
            {configured ? <div className="mt-4 grid gap-2 sm:grid-cols-2"><Link to="/inscription" className="btn-primary">Créer un compte</Link><Link to="/connexion" className="btn-ghost"><LogIn size={18} />Se connecter</Link></div>
              : <p className="mt-3 text-sm text-slate-500">Les comptes seront activés prochainement.</p>}
          </div>
        )}

        {user && (
          <Section title="Mes informations">
            <form onSubmit={saveName} className="card space-y-3 p-4">
              <div><label htmlFor="dn" className="label">Prénom ou pseudo</label><input id="dn" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className="input" /></div>
              <button className="btn-primary btn-sm">Enregistrer</button>
            </form>
            {isStaff && <Link to="/admin" className="card mt-3 flex items-center gap-3 p-4 hover:shadow-lg"><ShieldCheck className="text-brand" /><span className="flex-1 font-semibold">Administration</span><span className="badge bg-brand-light text-brand-deep">{roles.join(', ')}</span></Link>}
          </Section>
        )}

        <Section title="Ma progression">
          <div className="grid gap-2">
            {[['/recompenses', 'Mes récompenses', 'Niveau, badges, historique', Trophy], ['/suivi', 'Mon suivi', 'Prières, dhikr, objectifs, bilans', Activity]].map(([to, t, d, I]) => <Link key={to} to={to} className="tap card flex items-center gap-3 p-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-light text-brand-deep"><I size={20} /></span><span className="flex-1"><span className="block font-semibold text-slate-900">{t}</span><span className="text-sm text-slate-500">{d}</span></span><ChevronRight size={18} className="text-slate-400" /></Link>)}
            <ModeSobre />
          </div>
        </Section>

        <Section title={<span className="flex items-center gap-2"><Bell size={22} />Rappels</span>}><Reminders /></Section>

        {installEvt && <Section title="Application"><button onClick={() => installEvt.prompt()} className="btn-secondary w-full"><Smartphone size={18} />Installer ANDOU DIINEMA sur mon téléphone</button></Section>}

        <Section title="Mes données">
          <div className="card space-y-3 p-4">
            <p className="text-sm text-slate-600">Tes réponses, bilans et habitudes sont strictement privés : ils ne sont jamais affichés publiquement ni accessibles à l'équipe. <Link to="/confidentialite" className="font-medium text-brand underline">En savoir plus</Link></p>
            <button onClick={exportData} className="btn-ghost btn-sm"><Download size={16} />Télécharger mes données</button>
          </div>
        </Section>

        {user && (
          <Section title="Compte">
            <div className="card space-y-4 p-4">
              <button onClick={async () => { await signOut(); nav('/') }} className="btn-ghost w-full"><LogOut size={18} />Se déconnecter</button>
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">Supprimer mes données ANDOU DIINEMA</p>
                <p className="mt-1 text-sm text-red-700">Toute ta progression, tes bilans, objectifs et favoris seront définitivement effacés, et tu seras déconnecté(e).</p>
                <label htmlFor="del" className="mt-3 block text-sm text-red-800">Tape <b>SUPPRIMER</b> pour confirmer</label>
                <input id="del" value={confirmDel} onChange={(e) => setConfirmDel(e.target.value)} className="input mt-1" autoComplete="off" />
                <button onClick={del} disabled={confirmDel !== 'SUPPRIMER'} className="btn mt-3 w-full bg-red-600 text-white hover:bg-red-700"><Trash2 size={18} />Supprimer définitivement</button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </>
  )
}
