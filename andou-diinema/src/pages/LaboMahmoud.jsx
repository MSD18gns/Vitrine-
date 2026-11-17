// Démo interactive INDÉPENDANTE de Mahmoud (prototype à valider).
// Route /labo/mahmoud : non indexée, non reliée au menu, aucune donnée enregistrée en base.
import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react'
import Seo from '../components/Seo'
import Mahmoud, { useMahmoud } from '../mahmoud'
import MahmoudCompanion from '../mahmoud/MahmoudCompanion'
import { EXPRESSIONS } from '../mahmoud/behavior'
import { MODELES } from '../mahmoud/outfits'
import { createListener, speechSupport } from '../mahmoud/speech'
import { localReply, SUGGESTIONS } from '../mahmoud/replies'

const EVENTS = [
  ['app:open', '👋 Ouverture de l\'app'],
  ['lesson:start', '📖 Début de leçon'],
  ['answer:correct', '✅ Bonne réponse'],
  ['answer:wrong', '🤍 Mauvaise réponse'],
  ['step:end', '🏁 Fin d\'étape'],
  ['help', '🆘 Demande d\'aide'],
]
const GESTES = [['Welcome', 'Bienvenue'], ['Explain', 'Explication'], ['Point', 'Désignation'], ['Think', 'Réflexion'], ['Listen', 'Écoute'], ['Nod', 'Acquiescer'], ['Encourage', 'Encouragement'], ['Celebrate', 'Réussite'], ['Talk', 'Parole (boucle)'], ['Idle', 'Repos (boucle)']]
const EXPR_LABELS = { neutre: 'Neutre', sourire: 'Sourire', joie: 'Joie', ecoute: 'Écoute', reflexion: 'Réflexion', compassion: 'Compassion', calme: 'Calme' }
const LOOPS = new Set(['Talk', 'Idle', 'Listen', 'Think'])

export default function LaboMahmoud() {
  const m = useMahmoud()
  const [voice, setVoice] = useState(false)
  const [calm, setCalm] = useState(false)
  const [framing, setFraming] = useState('buste')
  const [modele, setModele] = useState('v2')
  const [status, setStatus] = useState({})
  const [chat, setChat] = useState([])
  const [input, setInput] = useState('')
  const [micState, setMicState] = useState('idle')
  const [micMsg, setMicMsg] = useState('')
  const [companion, setCompanion] = useState(false)
  const sup = speechSupport()
  const listener = useRef(null)
  const opened = useRef(false)

  useEffect(() => {
    if (status.ready && !opened.current) { opened.current = true; setTimeout(() => m.react('app:open'), 400) }
  }, [status.ready, m])

  const ask = useCallback((q) => {
    const text = q.trim(); if (!text) return
    setChat((c) => [...c, { from: 'moi', text }]); setInput('')
    m.react('chat:thinking', { silent: true })
    setTimeout(() => {
      const r = localReply(text)
      setChat((c) => [...c, { from: 'mahmoud', text: r.reply, local: true }])
      m.behavior.setLoop('Idle')
      // geste + expression propres à la réponse (le mode calme reste prioritaire)
      directReact(m, { type: 'reaction', gesture: calm ? 'Nod' : r.gesture, expr: calm ? 'calme' : r.expr })
      m.say(r.reply, { voice })
    }, 700)
  }, [m, voice, calm])

  const toggleMic = () => {
    if (micState === 'listening') { listener.current?.stop(); return }
    setMicMsg('')
    listener.current = listener.current || createListener({
      onState: (s) => { setMicState(s); if (s === 'listening') m.react('chat:listening', { silent: true }); else m.behavior.setLoop('Idle') },
      onResult: (t, final) => { setInput(t); if (final) ask(t) },
      onError: (_c, msg) => setMicMsg(msg),
    })
    m.stop()
    listener.current.start()
  }

  const toggleCalm = () => { const v = !calm; setCalm(v); m.react(v ? 'sacred:start' : 'sacred:end') }

  return (
    <>
      <Seo title="Laboratoire — Mahmoud" noindex />
      <div className="container-ad py-6">
        <p className="eyebrow">🧪 Prototype à valider</p>
        <h1 className="section-title">Mahmoud — démo interactive</h1>
        <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Démonstration : les réponses sont <b>prédéfinies et locales</b> (mots-clés). Mahmoud n'est relié à <b>aucune intelligence artificielle</b>.
          Rien n'est enregistré. La voix utilise celle de ton navigateur.
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* SCÈNE */}
          <section>
            <div className="relative h-[460px] overflow-hidden rounded-[28px] bg-gradient-to-b from-brand-mist via-white to-brand-light shadow-card ring-1 ring-brand/10">
              <Mahmoud controller={m} src={MODELES[modele].glb} portrait={MODELES[modele].portrait} framing={framing} className="h-full w-full" onStatus={setStatus} />
              {m.caption && <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 p-3 text-[15px] text-slate-800 shadow-lg" aria-live="polite">{m.caption}</div>}
              {calm && <span className="absolute left-3 top-3 rounded-full bg-brand-deep px-3 py-1 text-xs font-bold text-white">🕊️ Mode calme</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm" role="group" aria-label="Modèle">
              {Object.entries(MODELES).map(([k, v]) => (
                <button key={k} type="button" onClick={() => setModele(k)} className={`rounded-full px-3 py-1.5 font-semibold ring-1 ${modele === k ? 'bg-brand-deep text-white ring-brand-deep' : 'bg-white text-slate-700 ring-slate-200'}`}>{v.label}</button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {[['buste', 'Buste'], ['visage', 'Visage'], ['pied', 'En pied']].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setFraming(k)} className={`rounded-full px-3 py-1.5 font-semibold ring-1 ${framing === k ? 'bg-brand text-white ring-brand' : 'bg-white text-slate-700 ring-slate-200'}`}>{l}</button>
              ))}
              <button type="button" onClick={() => setVoice((v) => !v)} className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-semibold text-slate-700 ring-1 ring-slate-200">
                {voice ? <Volume2 size={16} /> : <VolumeX size={16} />} Voix {voice ? 'activée' : 'coupée'}
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="rounded-xl bg-white p-2 ring-1 ring-slate-100"><dt className="font-bold">3D (WebGL)</dt><dd>{status.webgl === false ? 'indisponible → portrait 2D' : status.ready ? 'chargée' : 'chargement…'}</dd></div>
              <div className="rounded-xl bg-white p-2 ring-1 ring-slate-100"><dt className="font-bold">Rendu</dt><dd>{status.active ? 'actif' : 'en pause (hors écran)'}</dd></div>
              <div className="rounded-xl bg-white p-2 ring-1 ring-slate-100"><dt className="font-bold">Synthèse vocale</dt><dd>{sup.tts ? 'disponible' : 'absente → sous-titres'}</dd></div>
              <div className="rounded-xl bg-white p-2 ring-1 ring-slate-100"><dt className="font-bold">Reconnaissance vocale</dt><dd>{sup.stt ? 'disponible' : 'absente → clavier'}</dd></div>
            </dl>
          </section>

          {/* COMMANDES */}
          <section className="space-y-5">
            <div>
              <h2 className="font-black text-slate-900">Événements de l'application</h2>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {EVENTS.map(([e, l]) => <button key={e} type="button" onClick={() => m.react(e, { voice })} className="rounded-2xl bg-white px-3 py-3 text-left text-sm font-semibold text-slate-800 shadow-[0_3px_0_#d4e6db] ring-1 ring-brand/10 active:translate-y-[3px] active:shadow-none">{l}</button>)}
                <button type="button" onClick={toggleCalm} className={`col-span-2 rounded-2xl px-3 py-3 text-sm font-bold ${calm ? 'bg-brand-deep text-white' : 'bg-brand-mist text-brand-deep ring-1 ring-brand/20'}`}>
                  🕊️ {calm ? 'Fin de la lecture d\'un texte religieux (quitter le mode calme)' : 'Lecture d\'un texte religieux (mode calme)'}
                </button>
              </div>
            </div>

            <div>
              <h2 className="font-black text-slate-900">Gestes (corps)</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {GESTES.map(([g, l]) => <button key={g} type="button" onClick={() => directReact(m, LOOPS.has(g) ? { type: 'loop', loop: g } : { type: 'reaction', gesture: g })} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 active:scale-95">{l}</button>)}
              </div>
              <h2 className="mt-4 font-black text-slate-900">Expressions (visage, combinables avec les gestes)</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.keys(EXPRESSIONS).map((k) => <button key={k} type="button" onClick={() => directReact(m, { type: 'reaction', expr: k })} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 active:scale-95">{EXPR_LABELS[k]}</button>)}
              </div>
              <button type="button" onClick={() => m.say('Assalamou alaykoum. Bienvenue sur ANDOU DIINEMA. Avançons ensemble, une étape après l\'autre.', { voice })} className="btn-3d mt-3 w-full text-sm">🗣️ Tester la parole et la synchronisation labiale</button>
            </div>

            <div className="rounded-3xl bg-white p-3 shadow-card ring-1 ring-brand/10">
              <h2 className="font-black text-slate-900">Conversation (réponses locales prédéfinies)</h2>
              <div className="mt-2 max-h-56 space-y-2 overflow-y-auto" aria-live="polite">
                {chat.length === 0 && <p className="text-sm text-slate-500">Pose une question ou choisis une suggestion.</p>}
                {chat.map((c, i) => (
                  <p key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${c.from === 'moi' ? 'ml-auto bg-brand text-white' : 'bg-brand-mist text-slate-800'}`}>
                    {c.text}{c.local && <span className="mt-1 block text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">réponse prédéfinie</span>}
                  </p>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => ask(s)} className="rounded-full bg-brand-mist px-2.5 py-1 text-xs font-semibold text-brand-deep">{s}</button>)}
              </div>
              <form className="mt-2 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(input) }}>
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Écris ta question…" className="min-h-[44px] flex-1 rounded-2xl border border-slate-200 px-3 text-[15px]" aria-label="Question pour Mahmoud" />
                <button type="button" onClick={toggleMic} aria-label={micState === 'listening' ? 'Arrêter le micro' : 'Parler au micro'} className={`grid h-11 w-11 place-items-center rounded-2xl ${micState === 'listening' ? 'bg-red-500 text-white' : 'bg-brand-mist text-brand-deep'}`}>{micState === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}</button>
                <button type="submit" aria-label="Envoyer" className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white"><Send size={18} /></button>
              </form>
              {micMsg && <p className="mt-2 text-xs text-red-600" role="alert">{micMsg}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={companion} onChange={(e) => setCompanion(e.target.checked)} /> Afficher aussi le compagnon flottant (bouton Ouvrir / Réduire)
            </label>
          </section>
        </div>
      </div>
      {companion && <MahmoudCompanionDemo voice={voice} />}
    </>
  )
}

/** Envoie une réaction directe (geste / expression / boucle) au rendu 3D, sans passer par les règles d'événements. */
function directReact(m, r) { m.behavior.emitDirect(r) }

function MahmoudCompanionDemo() { // compagnon autonome (son propre contrôleur)
  const c = useMahmoud()
  const first = useRef(c)
  useEffect(() => { const t = setTimeout(() => first.current.react('help'), 1200); return () => clearTimeout(t) }, [])
  return <MahmoudCompanion controller={c} />
}
