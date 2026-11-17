import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import Seo from '../components/Seo'
import { Alert } from '../components/ui'
import { AuthShell, PasswordInput } from './Login'
import { signUp, validatePassword, validEmail } from '../services/auth'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { user, configured, loading } = useAuth()
  const [f, setF] = useState({ displayName: '', email: '', password: '', accept: false })
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  if (user && !loading) return <Navigate to="/parcours" replace />
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    if (!validEmail(f.email)) return setErr('Adresse e-mail invalide.')
    const pw = validatePassword(f.password)
    if (pw) return setErr(pw)
    if (!f.accept) return setErr("Merci d'accepter les conditions d'utilisation et la politique de confidentialité.")
    setBusy(true)
    try {
      const data = await signUp(f)
      if (data?.session) return // connecté directement (confirmation e-mail désactivée)
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return setErr('Un compte existe déjà avec cette adresse e-mail. Connecte-toi ou utilise « Mot de passe oublié ».')
      setDone(true)
    } catch (e2) { setErr(e2.message) } finally { setBusy(false) }
  }
  if (done) return (
    <AuthShell title="Vérifie ta boîte e-mail">
      <div className="text-center"><MailCheck className="mx-auto mb-3 text-brand" size={40} /><p className="text-slate-700">Un e-mail de confirmation a été envoyé à <b>{f.email}</b>. Clique sur le lien pour activer ton compte.</p><p className="mt-3 text-sm text-slate-500">Pense à vérifier les courriers indésirables.</p><Link to="/connexion" className="btn-primary mt-5 w-full">Aller à la connexion</Link></div>
    </AuthShell>
  )
  return (
    <AuthShell title="Créer un compte" subtitle="Sauvegarde ta progression et retrouve-la sur tous tes appareils.">
      <Seo title="Inscription" noindex />
      {!configured && <Alert type="warning" className="mb-4">Les comptes seront disponibles dès la configuration de la base de données.</Alert>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div><label htmlFor="name" className="label">Prénom ou pseudo <span className="font-normal text-slate-400">(facultatif)</span></label><input id="name" maxLength={60} autoComplete="nickname" value={f.displayName} onChange={set('displayName')} className="input" /></div>
        <div><label htmlFor="email" className="label">Adresse e-mail</label><input id="email" type="email" inputMode="email" autoComplete="email" required value={f.email} onChange={set('email')} className="input" /></div>
        <div><label htmlFor="password" className="label">Mot de passe</label><PasswordInput id="password" value={f.password} onChange={set('password')} autoComplete="new-password" /><p className="mt-1.5 text-xs text-slate-500">Au moins 8 caractères, avec des lettres et des chiffres.</p></div>
        <label className="flex min-h-[44px] items-start gap-3 text-sm text-slate-600"><input type="checkbox" checked={f.accept} onChange={set('accept')} className="mt-1 h-5 w-5 rounded accent-brand-deep" /><span>J'accepte les <Link to="/conditions" className="font-medium text-brand underline">conditions d'utilisation</Link> et la <Link to="/confidentialite" className="font-medium text-brand underline">politique de confidentialité</Link>.</span></label>
        {err && <Alert type="error">{err}</Alert>}
        <button disabled={busy || !configured} className="btn-primary w-full">{busy ? 'Création…' : 'Créer mon compte'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">Déjà inscrit ? <Link to="/connexion" className="font-semibold text-brand">Se connecter</Link></p>
    </AuthShell>
  )
}
