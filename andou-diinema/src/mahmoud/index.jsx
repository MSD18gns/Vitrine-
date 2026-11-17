// Point d'entrée léger de Mahmoud : ce fichier NE charge PAS three.js.
// La 3D (≈ three + fiber + drei + le GLB) n'est téléchargée qu'au moment où Mahmoud
// devient visible, et seulement si le navigateur supporte WebGL. Sinon : portrait 2D.
import { Component, Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createBehavior } from './behavior'
import { createSpeaker } from './speech'
import { outfit, DEFAULT_OUTFIT } from './outfits'

const Mahmoud3D = lazy(() => import('./Mahmoud3D'))

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Contrôleur unique : moteur de comportement + voix + état partagé avec la 3D. */
export function useMahmoud() {
  const behavior = useMemo(() => createBehavior(), [])
  const live = useRef({ visemes: {} })
  const [caption, setCaption] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const speaker = useMemo(() => createSpeaker({
    onViseme: (w) => { live.current.visemes = w },
    onStart: () => { setSpeaking(true); behavior.setLoop('Talk') },
    onEnd: () => { setSpeaking(false); behavior.setLoop('Idle') },
    onCaption: (t) => setCaption(t),
  }), [behavior])
  useEffect(() => () => speaker.cancel(), [speaker])

  /** Faire réagir Mahmoud à un événement (et dire la phrase associée). */
  const react = useCallback((event, ctx = {}) => {
    const r = behavior.dispatch(event, ctx)
    if (r?.line) speaker.speak(r.line, { voice: ctx.voice ?? false })
    return r
  }, [behavior, speaker])

  const say = useCallback((text, { voice = false } = {}) => { setCaption(text); speaker.speak(text, { voice }) }, [speaker])
  const stop = useCallback(() => speaker.cancel(), [speaker])
  return { behavior, live, speaker, react, say, stop, caption, speaking }
}

class GLBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(e) { this.props.onError?.(e) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

export function MahmoudPortrait({ outfitId = DEFAULT_OUTFIT, className = '' }) {
  return <img src={outfit(outfitId).portrait} alt="Mahmoud, compagnon d'ANDOU DIINEMA" className={`h-full w-full object-contain object-bottom ${className}`} draggable="false" />
}

/**
 * <Mahmoud controller={useMahmoud()} framing="buste" />
 * Pause automatique hors écran et quand l'onglet est masqué. Portrait 2D si WebGL absent
 * ou en cas d'erreur de chargement.
 */
export default function Mahmoud({ controller, outfitId = DEFAULT_OUTFIT, framing = 'buste', className = '', forceFallback = false, onStatus }) {
  const box = useRef(null)
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  const [seen, setSeen] = useState(false)
  const [ready, setReady] = useState(false)
  const webgl = useMemo(() => !forceFallback && hasWebGL(), [forceFallback])
  const reduced = useMemo(prefersReducedMotion, [])

  useEffect(() => {
    const el = box.current; if (!el || !('IntersectionObserver' in window)) { setVisible(true); setSeen(true); return }
    const io = new IntersectionObserver(([e]) => { setVisible(e.isIntersecting); if (e.isIntersecting) setSeen(true) }, { rootMargin: '120px' })
    io.observe(el); return () => io.disconnect()
  }, [])
  useEffect(() => {
    const f = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', f); return () => document.removeEventListener('visibilitychange', f)
  }, [])
  useEffect(() => { onStatus?.({ webgl, ready, active: visible && pageVisible }) }, [webgl, ready, visible, pageVisible, onStatus])
  const onReady = useCallback(() => setReady(true), [])

  const portrait = <MahmoudPortrait outfitId={outfitId} />
  return (
    <div ref={box} className={`relative ${className}`}>
      {(!webgl || !ready) && <div className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}>{portrait}</div>}
      {webgl && seen && (
        <GLBoundary fallback={portrait} onError={() => onStatus?.({ webgl: false, error: true })}>
          <Suspense fallback={null}>
            <div className={`absolute inset-0 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
              <Mahmoud3D outfitId={outfitId} behavior={controller.behavior} live={controller.live} active={visible && pageVisible} framing={framing} reducedMotion={reduced} onReady={onReady} />
            </div>
          </Suspense>
        </GLBoundary>
      )}
    </div>
  )
}
