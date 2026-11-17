// Voix de Mahmoud avec l'API Web Speech du navigateur (gratuite, locale au navigateur).
// - Synthèse : speechSynthesis (la voix dépend du système de l'utilisateur).
// - Reconnaissance : SpeechRecognition (Chrome/Edge/Safari ; absente de Firefox).
// - Synchronisation labiale APPROXIMATIVE : on convertit le texte en visèmes, cadencés sur
//   la durée estimée de la phrase, recalés à chaque mot quand le navigateur fournit
//   l'événement « boundary ». Sans synthèse vocale, la bouche s'anime quand même (sous-titres).

const VISEME_KEYS = ['MouthOpen', 'MouthWide', 'MouthRound', 'MouthClosed']

function charViseme(c) {
  if ('aàâä'.includes(c)) return { MouthOpen: 0.85 }
  if ('eéèêëiîïy'.includes(c)) return { MouthWide: 0.75, MouthOpen: 0.2 }
  if ('oôöuùûü'.includes(c)) return { MouthRound: 0.85 }
  if ('mbp'.includes(c)) return { MouthClosed: 1 }
  if ('fv'.includes(c)) return { MouthClosed: 0.5, MouthWide: 0.35 }
  if (/[a-zç]/.test(c)) return { MouthOpen: 0.3, MouthWide: 0.1 }
  return null // espace / ponctuation : bouche au repos
}

/** Suite de visèmes [{t, w}] pour un texte (t en secondes depuis le début). */
export function textToVisemes(text, rate = 1) {
  const cps = 14 * rate
  const out = []; let t = 0
  for (const ch of text.toLowerCase()) {
    out.push({ t, w: charViseme(ch), i: out.length })
    t += /[.,;:!?]/.test(ch) ? 0.28 / rate : 1 / cps
  }
  return { frames: out, duration: t }
}

export const speechSupport = () => ({
  tts: typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  stt: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
})

function pickVoice(lang) {
  const voices = window.speechSynthesis.getVoices()
  const fr = voices.filter((v) => v.lang?.toLowerCase().startsWith(lang.slice(0, 2)))
  return fr.find((v) => /male|homme|thomas|paul|henri|nicolas/i.test(v.name)) || fr.find((v) => v.localService) || fr[0] || null
}

/**
 * createSpeaker({ onViseme(weights), onStart(), onEnd(), onCaption(text, index) })
 * speak(text, { voice: true|false }) : voix si possible, sinon animation muette.
 */
export function createSpeaker({ onViseme, onStart, onEnd, onCaption } = {}) {
  let raf = 0, timer = 0, frames = [], t0 = 0, offset = 0, active = false
  const rest = Object.fromEntries(VISEME_KEYS.map((k) => [k, 0]))

  function tick() {
    if (!active) return
    const t = (performance.now() - t0) / 1000 + offset
    let f = frames[0]
    for (let k = 0; k < frames.length && frames[k].t <= t; k++) f = frames[k]
    const w = { ...rest, ...(f?.w || {}) }
    // petite modulation pour éviter un mouvement mécanique
    const m = 0.85 + 0.15 * Math.sin(t * 23)
    for (const k of VISEME_KEYS) w[k] *= m
    onViseme?.(w)
    raf = requestAnimationFrame(tick)
  }
  function begin(text, rate) {
    const v = textToVisemes(text, rate); frames = v.frames; offset = 0
    t0 = performance.now(); active = true; onStart?.(); onCaption?.(text, 0); tick()
    return v.duration
  }
  function finish() {
    if (!active) return
    active = false; cancelAnimationFrame(raf); clearTimeout(timer); onViseme?.(rest); onEnd?.()
  }

  return {
    get speaking() { return active },
    speak(text, { voice = true, lang = 'fr-FR', rate = 1 } = {}) {
      this.cancel()
      const sup = speechSupport()
      if (!voice || !sup.tts) {
        const d = begin(text, rate)
        timer = setTimeout(finish, d * 1000 + 250)
        return 'muet'
      }
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang; u.rate = rate; u.pitch = 0.95
      const v = pickVoice(lang); if (v) u.voice = v
      let started = false
      u.onstart = () => { started = true; begin(text, rate) }
      u.onboundary = (e) => { // recalage sur le mot prononcé
        if (!active || e.name === 'sentence') return
        const f = frames.find((x) => x.i >= e.charIndex)
        if (f) { offset = f.t; t0 = performance.now() }
      }
      u.onend = finish
      u.onerror = finish
      window.speechSynthesis.speak(u)
      // Si le navigateur ne démarre jamais la voix (aucune voix installée, autoplay bloqué) :
      timer = setTimeout(() => { if (!started) { window.speechSynthesis.cancel(); const d = begin(text, rate); timer = setTimeout(finish, d * 1000 + 250) } }, 1500)
      return 'voix'
    },
    cancel() {
      try { if (speechSupport().tts) window.speechSynthesis.cancel() } catch { /* ignore */ }
      finish()
    },
  }
}

/**
 * createListener({ onResult(text, final), onState(state), onError(code, message) })
 * Le navigateur demande lui-même l'autorisation du micro au premier start().
 */
export function createListener({ onResult, onState, onError, lang = 'fr-FR' } = {}) {
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  if (!SR) return { supported: false, start() { onError?.('unsupported', 'La reconnaissance vocale n\'est pas disponible sur ce navigateur. Écris ta question.') }, stop() {} }
  const rec = new SR()
  rec.lang = lang; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1
  const MSG = {
    'not-allowed': 'Accès au micro refusé. Autorise le micro dans les réglages du navigateur, ou écris ta question.',
    'service-not-allowed': 'La reconnaissance vocale est désactivée sur cet appareil. Écris ta question.',
    'no-speech': 'Je n\'ai rien entendu. Réessaie en parlant près du micro.',
    'audio-capture': 'Aucun micro détecté.',
    network: 'La reconnaissance vocale du navigateur nécessite une connexion internet.',
    aborted: null,
  }
  rec.onstart = () => onState?.('listening')
  rec.onend = () => onState?.('idle')
  rec.onerror = (e) => { const m = MSG[e.error]; if (m !== null) onError?.(e.error, m || 'Erreur de reconnaissance vocale.') }
  rec.onresult = (e) => {
    const r = e.results[e.results.length - 1]
    onResult?.(r[0].transcript, r.isFinal)
  }
  return {
    supported: true,
    start() { try { rec.start() } catch { /* déjà démarré */ } },
    stop() { try { rec.stop() } catch { /* ignore */ } },
  }
}
