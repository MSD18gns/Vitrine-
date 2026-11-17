import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Seo from '../components/Seo'
import { Alert } from '../components/ui'
import { LogoMark } from '../components/Logo'
import { signIn } from '../services/auth'
import { useAuth } from '../hooks/useAuth'

export function AuthShell({ title, subtitle, children }) {
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
  const { user, configured } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/parcours" replace />
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr(null)
    try { await signIn({ email, password }); nav('/parcours') } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }
  return (
    <AuthShell title="Connexion" subtitle="Retrouve ton parcours et ta progression.">
      <Seo title="Connexion" noindex />
      {!configured && <Alert type="warning" className="mb-4">Les comptes seront disponibles dès la configuration de la base de données. Tu peux utiliser le site en mode invité.</Alert>}
      <form onSubmit={submit} className="space-y-4">
        <div><label htmlFor="email" className="label">Adresse e-mail</label><input id="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></div>
        <div><label htmlFor="password" className="label">Mot de passe</label><PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        {err && <Alert type="error">{err}</Alert>}
        <button disabled={busy || !configured} className="btn-primary w-full">{busy ? 'Connexion…' : 'Se connecter'}</button>
      </form>
      <div className="mt-4 flex flex-col items-center gap-2 text-sm">
        <Link to="/mot-de-passe-oublie" className="min-h-[40px] py-2 font-medium text-brand">Mot de passe oublié ?</Link>
        <p className="text-slate-600">Pas encore de compte ? <Link to="/inscription" className="font-semibold text-brand">Créer un compte</Link></p>
      </div>
    </AuthShell>
  )
}
