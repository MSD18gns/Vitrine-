import { useState } from 'react'
import Seo from '../components/Seo'
import { Alert } from '../components/ui'
import { AuthShell } from './Login'
import { sendPasswordReset } from '../services/auth'

export default function MotDePasse() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState({})
  const submit = async (e) => {
    e.preventDefault(); setState({ busy: true })
    try { await sendPasswordReset(email); setState({ ok: true }) } catch (e2) { setState({ err: e2.message }) }
  }
  return (
    <AuthShell title="Mot de passe oublié" subtitle="Reçois un lien pour choisir un nouveau mot de passe.">
      <Seo title="Mot de passe oublié" noindex />
      {state.ok ? <Alert type="success">Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d'être envoyé.</Alert> : (
        <form onSubmit={submit} className="space-y-4">
          <div><label htmlFor="email" className="label">Adresse e-mail</label><input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></div>
          {state.err && <Alert type="error">{state.err}</Alert>}
          <button disabled={state.busy} className="btn-primary w-full">{state.busy ? 'Envoi…' : 'Envoyer le lien'}</button>
        </form>
      )}
    </AuthShell>
  )
}
