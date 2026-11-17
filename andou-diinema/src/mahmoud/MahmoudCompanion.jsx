// Compagnon flottant : Mahmoud en buste + bulle de texte, avec bouton Réduire / Ouvrir.
// (Utilisé dans la démo seulement ; intégration aux pages après validation.)
import { useEffect, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import Mahmoud, { MahmoudPortrait } from './index'

export default function MahmoudCompanion({ controller, defaultOpen = true, storageKey = 'ad:mahmoud-open' }) {
  const [open, setOpen] = useState(() => {
    try { const v = localStorage.getItem(storageKey); return v === null ? defaultOpen : v === '1' } catch { return defaultOpen }
  })
  useEffect(() => { try { localStorage.setItem(storageKey, open ? '1' : '0') } catch { /* ignore */ } }, [open, storageKey])
  useEffect(() => { if (!open) controller.stop() }, [open, controller])

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} aria-label="Ouvrir Mahmoud"
        className="fixed bottom-24 right-4 z-40 h-16 w-16 overflow-hidden rounded-full border-4 border-white bg-brand-light shadow-xl transition active:scale-95 sm:bottom-6">
        <MahmoudPortrait className="scale-[1.9] translate-y-[34%]" />
      </button>
    )
  }
  return (
    <aside className="fixed bottom-24 right-3 z-40 w-[min(300px,calc(100vw-24px))] sm:bottom-6" aria-label="Mahmoud, compagnon">
      {controller.caption && (
        <div className="fade-in relative mb-2 rounded-2xl bg-white p-3 text-[14.5px] leading-snug text-slate-800 shadow-xl ring-1 ring-brand/10" aria-live="polite">
          {controller.caption}
          <span className="absolute -bottom-2 right-16 h-4 w-4 rotate-45 bg-white ring-1 ring-brand/10 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />
        </div>
      )}
      <div className="relative h-[230px] overflow-hidden rounded-3xl bg-gradient-to-b from-brand-mist to-brand-light shadow-2xl ring-4 ring-white">
        <Mahmoud controller={controller} framing="buste" className="h-full w-full" />
        <div className="absolute right-2 top-2 flex gap-1">
          <button type="button" onClick={() => setOpen(false)} aria-label="Réduire Mahmoud" className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow active:scale-95"><ChevronDown size={18} /></button>
          {controller.speaking && <button type="button" onClick={controller.stop} aria-label="Arrêter la parole" className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow active:scale-95"><X size={18} /></button>}
        </div>
      </div>
    </aside>
  )
}
