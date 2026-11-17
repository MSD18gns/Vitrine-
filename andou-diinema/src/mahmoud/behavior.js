// Moteur de comportement de Mahmoud — sans React, sans réseau.
// Il reçoit des événements de l'application et décide d'une réaction :
//   geste corporel (animation du squelette) + expression du visage + phrase éventuelle.
// Les deux couches (corps / visage) sont indépendantes et se combinent.
// Pas de hasard dans les réactions : les phrases tournent dans un ordre fixe, sans répétition
// immédiate, et un même geste n'est pas rejoué trop souvent (il est alors remplacé).

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
  'app:open': { gesture: 'Welcome', alt: 'Nod', expr: 'sourire', lines: [
    'Assalamou alaykoum ! Je suis Mahmoud, ton compagnon de route.',
    'Content de te revoir. On continue l\'ascension ensemble ?',
  ] },
  'lesson:start': { gesture: 'Explain', alt: 'Nod', expr: 'ecoute', lines: [
    'On commence. Prends ton temps et lis tranquillement.',
    'Nouvelle étape : je reste à côté de toi.',
    'Installe-toi, cette étape est faite pour toi.',
  ] },
  'answer:correct': { gesture: 'Celebrate', alt: 'Nod', cooldown: 15, expr: 'joie', lines: [
    'Bravo, c\'est juste !',
    'Excellente réponse.',
    'Bien vu, continue comme ça.',
  ] },
  'answer:wrong': { gesture: 'Encourage', alt: 'Nod', expr: 'compassion', lines: [
    'Ce n\'est pas grave, on apprend aussi en se trompant.',
    'Pas tout à fait. Relis l\'explication, tu vas y arriver.',
    'Aucune pénalité ici : réessaie quand tu veux.',
  ] },
  'step:end': { gesture: 'Celebrate', alt: 'Encourage', cooldown: 10, expr: 'joie', lines: [
    'Étape terminée, bravo ! Qu\'Allah te facilite la suite.',
    'Encore un pas vers le sommet. Bien joué !',
  ] },
  help: { gesture: 'Point', alt: 'Explain', expr: 'ecoute', lines: [
    'Besoin d\'aide ? Pose-moi ta question ou choisis une suggestion.',
    'Je suis là. Dis-moi ce qui te bloque.',
  ] },
  'chat:thinking': { gesture: null, loop: 'Think', expr: 'reflexion' },
  'chat:listening': { gesture: null, loop: 'Listen', expr: 'ecoute' },
}

// En mode calme (lecture d'un verset, d'un hadith, d'une invocation) :
// pas de célébration, pas de grands gestes, visage serein.
const CALM_ALLOWED = new Set(['Nod', 'Listen', 'Idle'])

export function createBehavior({ now = () => performance.now() / 1000 } = {}) {
  const listeners = new Set()
  const cursor = {}
  const lastGesture = {}
  let calm = false
  let loop = 'Idle'

  const emit = (r) => listeners.forEach((fn) => fn(r))

  function nextLine(event, lines) {
    if (!lines?.length) return null
    const i = cursor[event] ?? 0
    cursor[event] = (i + 1) % lines.length
    return lines[i]
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
        line: ctx.line ?? (ctx.silent ? null : nextLine(event, rx.lines)),
      }
      emit(r)
      return r
    },
  }
}
