// Moteur de comportement de Mahmoud — sans React, sans réseau.
// Il reçoit des événements de l'application et décide d'une réaction :
//   geste corporel (animation du squelette) + expression du visage + phrase éventuelle.
// Les deux couches (corps / visage) sont indépendantes et se combinent.
// Pas de hasard dans les réactions : les phrases tournent dans un ordre fixe, sans répétition
// immédiate, et un même geste n'est pas rejoué trop souvent (il est alors remplacé).

import { LINES, line } from './lines'

export const GESTURES = ['Welcome', 'Explain', 'Point', 'Think', 'Listen', 'Nod', 'Celebrate', 'Encourage', 'Talk', 'Idle']

export const EXPRESSIONS = {
  neutre: {},
  sourire: { Smile: 0.65, BrowUp: 0.15 },
  joie: { Smile: 1, BrowUp: 0.55 },
  ecoute: { Smile: 0.25, BrowUp: 0.35 },
  reflexion: { BrowFrown: 0.45, Smile: 0.05 },
  compassion: { BrowSad: 0.55, Smile: 0.3 },
  calme: { Smile: 0.18 },
}

// Réactions par événement. `alt` : geste de remplacement si le geste principal vient d'être joué.
const REACTIONS = {
  'app:open': { gesture: 'Welcome', alt: 'Nod', expr: 'sourire' },
  'lesson:start': { gesture: 'Explain', alt: 'Nod', expr: 'ecoute' },
  'answer:correct': { gesture: 'Celebrate', alt: 'Nod', cooldown: 15, expr: 'joie' },
  'answer:wrong': { gesture: 'Encourage', alt: 'Nod', expr: 'compassion' },
  'step:end': { gesture: 'Celebrate', alt: 'Encourage', cooldown: 10, expr: 'joie' },
  help: { gesture: 'Point', alt: 'Explain', expr: 'ecoute' },
  'chat:thinking': { gesture: null, loop: 'Think', expr: 'reflexion' },
  'chat:listening': { gesture: null, loop: 'Listen', expr: 'ecoute' },
}

// En mode calme (lecture d'un verset, d'un hadith, d'une invocation) :
// pas de célébration, pas de grands gestes, visage serein.
const CALM_ALLOWED = new Set(['Nod', 'Listen', 'Idle'])

export function createBehavior({ now = () => performance.now() / 1000, lang = () => 'fr' } = {}) {
  const listeners = new Set()
  const cursor = {}
  const lastGesture = {}
  let calm = false
  let loop = 'Idle'

  let last = null
  const emit = (r) => { if (r.type !== 'loop') last = { ...r, t: now() }; listeners.forEach((fn) => fn(r)) }

  function nextLine(event) {
    if (!LINES.fr[event]) return null
    const i = cursor[event] ?? 0
    cursor[event] = i + 1
    return line(lang(), event, i)
  }

  function pickGesture(rx) {
    let g = rx.gesture
    if (!g) return null
    const t = now()
    if (lastGesture[g] && t - lastGesture[g] < (rx.cooldown ?? 6)) g = rx.alt || null
    if (calm && g && !CALM_ALLOWED.has(g)) g = 'Nod'
    if (g) lastGesture[g] = t
    return g
  }

  return {
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
    /** Dernière réaction si elle date de moins de 5 s (pour la 3D qui se charge après l'événement). */
    get recent() { return last && now() - last.t < 5 ? last : null },
    get calm() { return calm },
    setCalm(v) {
      calm = !!v
      emit({ type: 'calm', calm, loop: 'Idle', expr: calm ? 'calme' : 'sourire' })
    },
    /** Commande directe (démo, tests) : { gesture?, expr?, loop? } sans règles d'événement. */
    emitDirect(r) { emit({ type: 'direct', ...r, gesture: r.gesture && calm && !CALM_ALLOWED.has(r.gesture) ? 'Nod' : r.gesture }) },
    setLoop(l) { loop = l; emit({ type: 'loop', loop: calm && l === 'Talk' ? 'Idle' : l }) },
    get loop() { return loop },
    /** Événement applicatif → réaction. ctx.line force une phrase (ex. réponse du chat). */
    dispatch(event, ctx = {}) {
      if (event === 'sacred:start') return this.setCalm(true)
      if (event === 'sacred:end') return this.setCalm(false)
      const rx = REACTIONS[event]
      if (!rx) return
      const r = {
        type: 'reaction', event,
        gesture: pickGesture(rx),
        loop: rx.loop || null,
        expr: calm ? 'calme' : rx.expr,
        line: ctx.line ?? (ctx.silent ? null : nextLine(event)),
      }
      emit(r)
      return r
    },
  }
}
