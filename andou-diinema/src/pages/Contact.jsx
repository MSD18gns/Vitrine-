import { useState } from 'react'
import { Mail } from 'lucide-react'
import Seo from '../components/Seo'
import { PageHeader, Alert } from '../components/ui'
import { sendContactMessage } from '../services/articles'

const EMAIL = import.meta.env.VITE_CONTACT_EMAIL

export default function Contact() {
  const [f, setF] = useState({ nom: '', email: '', message: '', site: '' })
  const [state, setState] = useState({})
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const submit = async (e) => {
    e.preventDefault()
    if (f.site) return setState({ ok: true }) // piège anti-robots
    if (f.message.trim().length < 5) return setState({ err: 'Ton message est trop court.' })
    setState({ busy: true })
    try { await sendContactMessage(f); setState({ ok: true }); setF({ nom: '', email: '', message: '', site: '' }) } catch (e2) { setState({ err: e2.message }) }
  }
  return (
    <>
      <Seo title="Contact" description="Contacter l'équipe ANDOU DIINEMA : question, suggestion, signalement d'une erreur dans une référence." />
      <PageHeader emoji="✉️" eyebrow="Contact" title="Nous écrire" subtitle="Une question, une suggestion, une erreur à signaler dans une référence ? Nous lisons chaque message." />
      <div className="container-ad max-w-xl">
        {state.ok ? <Alert type="success" className="mt-6">Merci, ton message a bien été envoyé. Qu'Allah te récompense.</Alert> : (
          <form onSubmit={submit} className="card mt-6 space-y-4 p-5">
            <div><label htmlFor="nom" className="label">Nom</label><input id="nom" required maxLength={100} autoComplete="name" value={f.nom} onChange={set('nom')} className="input" /></div>
            <div><label htmlFor="em" className="label">E-mail</label><input id="em" type="email" required maxLength={200} autoComplete="email" value={f.email} onChange={set('email')} className="input" /></div>
            <div><label htmlFor="msg" className="label">Message</label><textarea id="msg" required minLength={5} maxLength={3000} rows={5} value={f.message} onChange={set('message')} className="input" /></div>
            <input tabIndex={-1} autoComplete="off" value={f.site} onChange={set('site')} className="hidden" aria-hidden="true" name="site" />
            {state.err && <Alert type="error">{state.err}</Alert>}
            <button disabled={state.busy} className="btn-primary w-full">{state.busy ? 'Envoi…' : 'Envoyer'}</button>
            <p className="text-xs text-slate-500">Ne partage pas d'informations personnelles sensibles dans ce formulaire.</p>
          </form>
        )}
        {EMAIL && <a href={`mailto:${EMAIL}`} className="btn-ghost mt-4 w-full"><Mail size={18} />{EMAIL}</a>}
      </div>
    </>
  )
}
