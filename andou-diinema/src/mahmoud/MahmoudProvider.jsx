// Intégration de Mahmoud dans le site : un seul compagnon partagé par les pages.
//   const mahmoud = useMahmoudEvents(); mahmoud('answer:correct')
// Ce fichier est léger : la 3D n'est téléchargée que lorsque le compagnon s'affiche.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMahmoud } from './index'
import MahmoudCompanion from './MahmoudCompanion'
import { useT } from '../i18n'

const Ctx = createContext({ react: () => {}, enabled: false, setEnabled: () => {}, voice: false, setVoice: () => {} })
const KEY_ON = 'ad:mahmoud-on', KEY_VOICE = 'ad:mahmoud-voice'
const read = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v === '1' } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, v ? '1' : '0') } catch { /* ignore */ } }

// Pages où Mahmoud accompagne l'utilisateur
const ROUTES = [/^\/$/, /^\/parcours$/, /^\/parcours\/etape\/[^/]+$/]

export function MahmoudProvider({ children }) {
  const { lang } = useT()
  const controller = useMahmoud(lang)
  const [enabled, setEnabledState] = useState(() => read(KEY_ON, true))
  const [voice, setVoiceState] = useState(() => read(KEY_VOICE, false))
  const setEnabled = useCallback((v) => { setEnabledState(v); write(KEY_ON, v); if (!v) controller.stop() }, [controller])
  const setVoice = useCallback((v) => { setVoiceState(v); write(KEY_VOICE, v) }, [])
  const { react: rx } = controller
  const react = useCallback((event, ctx = {}) => (enabled ? rx(event, { voice, ...ctx }) : null), [enabled, voice, rx])
  const value = useMemo(() => ({ react, enabled, setEnabled, voice, setVoice, controller, lang }), [react, enabled, setEnabled, voice, setVoice, controller, lang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** Fonction pour signaler un événement à Mahmoud (sans effet s'il est masqué). */
export function useMahmoudEvents() { return useContext(Ctx).react }
export function useMahmoudSettings() { const c = useContext(Ctx); return { enabled: c.enabled, setEnabled: c.setEnabled, voice: c.voice, setVoice: c.setVoice, lang: c.lang } }

/** Le compagnon flottant, affiché seulement sur les pages prévues. Démarre après le chargement de la page. */
export function MahmoudDock() {
  const { pathname } = useLocation()
  const { controller, enabled, voice, setVoice, react, lang } = useContext(Ctx)
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    const go = () => setIdle(true)
    const id = 'requestIdleCallback' in window ? window.requestIdleCallback(go, { timeout: 2500 }) : setTimeout(go, 1200)
    return () => ('cancelIdleCallback' in window ? window.cancelIdleCallback(id) : clearTimeout(id))
  }, [])
  // en changeant de page, on sort du mode calme et on coupe la parole en cours
  useEffect(() => { controller.stop(); controller.behavior.setCalm(false) }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!enabled || !idle || !ROUTES.some((r) => r.test(pathname))) return null
  const etape = pathname.startsWith('/parcours/etape/')
  return (
    <MahmoudCompanion
      controller={controller}
      lang={lang}
      voice={voice}
      onVoice={setVoice}
      onTap={() => react('help')}
      obstacle={etape ? '#etape-actions' : null}
      compact={etape}
      storageKey={etape ? 'ad:mahmoud-open-etape' : 'ad:mahmoud-open'}
    />
  )
}
