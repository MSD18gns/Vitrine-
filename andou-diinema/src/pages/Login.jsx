import { useEffect, useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, Mail, MailCheck } from 'lucide-react'
import Seo from '../components/Seo'
import { Alert } from '../components/ui'
import { LogoMark } from '../components/Logo'
import { signIn, sendMagicLink, resendConfirmation, validEmail } from '../services/auth'
import { useAuth } from '../hooks/useAuth'
import { store } from '../lib/storage'

export function AuthShell({ title, subtitle, children }) {
  const { warmUp } = useAuth()
  useEffect(() => { warmUp() }, [warmUp]) // précharge Supabase pendant la saisie
  return (
    <div className="container-ad flex max-w-md flex-col py-8">
      <div className="mb-6 text-center"><LogoMark className="mx-auto h-14 w-14" /><h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>{subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}</div>
      <div className="card p-5">{children}</div>
    </div>
  )
}

export function PasswordInput({ id, value, onChange, autoComplete }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} required autoComplete={autoComplete} className="input pr-12" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-slate-500" aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
    </div>
  )
}

export default function Login() {
  const { user, configured, loading } = useAuth()
  const nav = useNavigate()
  const [mode, setMode] = useState('password')
  const [email, setEmail] = useState(() => store.get('ad:last-email', ''))
  const [password, setPassword] = useState('')
  const [state, setState] = useState({})
  if (user && !loading) return <Navigate to="/parcours" replace />

  const submit = async (e) => {
    e.preventDefault()
    if (!validEmail(email)) return setState({ err: 'Adresse e-mail invalide.' })
    setState({ busy: true }); store.set('ad:last-email', email.trim())
    try {
      if (mode === 'password') { await signIn({ email, password }); nav('/parcours') }
      else { await sendMagicLink(email); setState({ sent: true }) }
    } catch (e2) { setState({ err: e2.message, notConfirmed: /pas encore confirmée/.test(e2.message) }) }
  }
  const resend = async () => {
    setState({ busy: true })
    try { await resendConfirmation(email); setState({ info: 'E-mail de confirmation renvoyé. Vérifie ta boîte de réception.' }) } catch (e2) { setState({ err: e2.message }) }
  }

  if (state.sent) return (
    <AuthShell title="Vérifie ta boîte e-mail">
      <div className="text-center"><MailCheck className="mx-auto mb-3 text-brand" size={40} /><p className="text-slate-700">Si un compte existe pour <b>{email}</b>, un lien de connexion vient d'être envoyé. Ouvre-le sur cet appareil.</p><p className="mt-3 text-sm text-slate-500">Pense à vérifier les courriers indésirables.</p><button onClick={() => setState({})} className="btn-ghost mt-5 w-full">Revenir</button></div>
    </AuthShell>
  )

  return (
    <AuthShell title="Connexion" subtitle="Retrouve ton parcours et ta progression.">
      <Seo title="Connexion" noindex />
      {!configured && <Alert type="warning" className="mb-4">Les comptes seront disponibles dès la configuration de la base de données. Tu peux utiliser le site en mode invité.</Alert>}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-brand-mist p-1" role="tablist">
        <button role="tab" aria-selected={mode === 'password'} onClick={() => { setMode('password'); setState({}) }} className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg text-sm font-semibold ${mode === 'password' ? 'bg-white text-brand-deep shadow-sm' : 'text-slate-500'}`}><KeyRound size={16} />Mot de passe</button>
        <button role="tab" aria-selected={mode === 'link'} onClick={() => { setMode('link'); setState({}) }} className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg text-sm font-semibold ${mode === 'link' ? 'bg-white text-brand-deep shadow-sm' : 'text-slate-500'}`}><Mail size={16} />Lien par e-mail</button>
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label htmlFor="email" className="label">Adresse e-mail</label><input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></div>
        {mode === 'password'
          ? <div><label htmlFor="password" className="label">Mot de passe</label><PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
          : <p className="text-sm text-slate-600">Reçois un lien sécurisé par e-mail pour te connecter sans mot de passe.</p>}
        {state.err && <Alert type="error">{state.err}{state.notConfirmed && <button type="button" onClick={resend} className="mt-2 block font-semibold underline">Renvoyer l'e-mail de confirmation</button>}</Alert>}
        {state.info && <Alert type="success">{state.info}</Alert>}
        <button disabled={state.busy || !configured} className="btn-primary w-full">{state.busy ? 'Patiente…' : mode === 'password' ? 'Se connecter' : 'Recevoir le lien'}</button>
      </form>
      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        <Link to="/mot-de-passe-oublie" className="min-h-[40px] py-2 font-medium text-brand">Mot de passe oublié ?</Link>
        <p className="text-slate-600">Pas encore de compte ? <Link to="/inscription" className="font-semibold text-brand">Créer un compte</Link></p>
      </div>
    </AuthShell>
  )
}
