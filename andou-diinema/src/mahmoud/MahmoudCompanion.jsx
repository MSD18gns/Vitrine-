// Compagnon flottant : Mahmoud en buste + bulle de texte, boutons Réduire / Ouvrir / Voix.
import { useEffect, useState } from 'react'
import { ChevronDown, Volume2, VolumeX, X } from 'lucide-react'
import Mahmoud, { MahmoudPortrait } from './index'
import { ui } from './lines'

const read = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v === '1' } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, v ? '1' : '0') } catch { /* ignore */ } }

/** Hauteur d'un élément fixé en bas de l'écran (barre d'action d'une étape), suivie en direct. */
function useBottomObstacle(selector) {
  const [h, setH] = useState(0)
  useEffect(() => {
    if (!selector) { setH(0); return }
    let ro, el, raf
    const attach = () => {
      el = document.querySelector(selector)
      if (!el) { raf = requestAnimationFrame(attach); return }
      ro = new ResizeObserver(() => setH(el.getBoundingClientRect().height)); ro.observe(el)
    }
    attach()
    return () => { cancelAnimationFrame(raf); ro?.disconnect() }
  }, [selector])
  return h
}

export default function MahmoudCompanion({ lang = 'fr', controller, defaultOpen = true, storageKey = 'ad:mahmoud-open', voice, onVoice, onTap, obstacle, compact = false, className = '' }) {
  const [open, setOpen] = useState(() => read(storageKey, defaultOpen))
  const [bubble, setBubble] = useState(false)
  const obstacleH = useBottomObstacle(obstacle)
  const L = ui(lang)
  useEffect(() => { write(storageKey, open) }, [open, storageKey])
  useEffect(() => { if (!open) controller.stop() }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  // la bulle s'affiche à chaque nouvelle phrase puis disparaît (sauf pendant la parole)
  useEffect(() => {
    if (!controller.caption) return
    setBubble(true)
    if (controller.speaking) return
    const t = setTimeout(() => setBubble(false), window.matchMedia?.('(max-width: 639px)').matches ? 3800 : 6500)
    return () => clearTimeout(t)
  }, [controller.caption, controller.speaking])

  const bottom = obstacleH ? { bottom: `${Math.round(obstacleH) + 10}px` } : undefined
  const pos = obstacleH ? '' : 'bottom-[calc(76px+env(safe-area-inset-bottom))] sm:bottom-6'

  // Sur mobile, Mahmoud se range en médaillon et ne s'agrandit que lorsqu'il réagit ou parle
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 639px)').matches)
  useEffect(() => {
    const mq = window.matchMedia?.('(max-width: 639px)'); if (!mq) return
    const f = () => setMobile(mq.matches); mq.addEventListener?.('change', f); return () => mq.removeEventListener?.('change', f)
  }, [])
  const showCard = open && (!mobile || bubble || controller.speaking)

  const size = compact ? 'h-[150px] w-[124px] sm:h-[230px] sm:w-[200px]' : 'h-[170px] w-[140px] sm:h-[250px] sm:w-[220px]'
  return (
    <aside className={`pointer-events-none fixed right-3 z-[65] flex flex-col items-end ${pos} ${className}`} style={bottom} aria-label={L.region}>
      {showCard && bubble && controller.caption && (
        <div className="pointer-events-auto fade-in relative mb-2 w-[min(280px,calc(100vw-24px))] rounded-2xl bg-white p-3 text-[14.5px] leading-snug text-slate-800 shadow-xl ring-1 ring-brand/10" aria-live="polite">
          {controller.caption}
          <button type="button" onClick={() => setBubble(false)} aria-label={L.closeBubble} className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-white text-slate-500 shadow ring-1 ring-slate-200"><X size={14} /></button>
        </div>
      )}
      {/* la carte 3D reste montée (pas de rechargement) ; masquée et en pause quand elle est rangée */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-brand-mist to-brand-light shadow-2xl ring-4 ring-white transition-all duration-300 ${size} ${showCard ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none absolute bottom-0 right-0 scale-50 opacity-0'}`} aria-hidden={!showCard}>
        <Mahmoud controller={controller} framing="buste" className="h-full w-full" paused={!showCard} />
        {onTap && <button type="button" onClick={onTap} tabIndex={showCard ? 0 : -1} aria-label={L.help} className="absolute inset-0 z-10 cursor-pointer rounded-3xl focus-visible:ring-4 focus-visible:ring-amber-300" />}
        <div className="absolute right-1.5 top-1.5 z-20 flex flex-col gap-1">
          <button type="button" onClick={() => { setOpen(false); setBubble(false) }} tabIndex={showCard ? 0 : -1} aria-label={L.reduce} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-700 shadow active:scale-95"><ChevronDown size={17} /></button>
          {onVoice && <button type="button" onClick={() => { if (voice) controller.stop(); onVoice(!voice) }} tabIndex={showCard ? 0 : -1} aria-label={voice ? L.voiceOff : L.voiceOn} aria-pressed={voice} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-700 shadow active:scale-95">{voice ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>}
        </div>
      </div>
      {!showCard && (
        <button type="button" onClick={() => { if (!open) setOpen(true); onTap?.() }} aria-label={open ? L.talk : L.open}
          className={`pointer-events-auto h-16 w-16 overflow-hidden rounded-full border-4 bg-brand-light shadow-xl transition active:scale-95 ${open ? 'border-white' : 'border-white/70 opacity-90'}`}>
          <MahmoudPortrait className="translate-y-[30%] scale-[1.9]" />
        </button>
      )}
    </aside>
  )
}
