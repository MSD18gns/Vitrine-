import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import { Alert, Spinner } from '../components/ui'
import { AuthShell, PasswordInput } from './Login'
import { updatePassword, validatePassword } from '../services/auth'
import { useAuth } from '../hooks/useAuth'

export default function Reinitialiser() {
  const { user, loading } = useAuth()
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [state, setState] = useState({})
  if (loading) return <Spinner />
  const submit = async (e) => {
    e.preventDefault()
    const v = validatePassword(pw); if (v) return setState({ err: v })
    setState({ busy: true })
    try { await updatePassword(pw); setState({ ok: true }); setTimeout(() => nav('/parcours'), 1500) } catch (e2) { setState({ err: e2.message }) }
  }
  return (
    <AuthShell title="Nouveau mot de passe">
      <Seo title="Réinitialiser le mot de passe" noindex />
      {!user ? <Alert type="warning">Ce lien est invalide ou a expiré. Demande un nouveau lien de réinitialisation.</Alert> : state.ok ? <Alert type="success">Mot de passe mis à jour. Redirection…</Alert> : (
        <form onSubmit={submit} className="space-y-4">
          <div><label htmlFor="pw" className="label">Nouveau mot de passe</label><PasswordInput id="pw" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
          {state.err && <Alert type="error">{state.err}</Alert>}
          <button disabled={state.busy} className="btn-primary w-full">Enregistrer</button>
        </form>
      )}
    </AuthShell>
  )
}
