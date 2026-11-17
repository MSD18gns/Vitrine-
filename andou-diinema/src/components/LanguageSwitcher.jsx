import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { useT } from '../i18n'

// Sélecteur de langue : en-tête (compact) ou profil (liste complète)
export default function LanguageSwitcher({ variant = 'header' }) {
  const { lang, setLang, langues, t } = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('pointerdown', h)
    return () => document.removeEventListener('pointerdown', h)
  }, [])
  const cur = langues.find((l) => l.code === lang)

  if (variant === 'list') {
    return (
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('profile.language')}>
        {langues.map((l) => (
          <button key={l.code} role="radio" aria-checked={lang === l.code} onClick={() => setLang(l.code)} className={`card-3d flex min-h-[64px] flex-col items-center justify-center rounded-2xl border-2 font-bold transition active:scale-95 ${lang === l.code ? 'border-brand bg-brand-light text-brand-deep' : 'border-slate-200 bg-white text-slate-700'}`}>
            <span className="text-lg">{l.court}</span><span className="text-xs font-semibold">{l.nom}</span>
          </button>
        ))}
      </div>
    )
  }
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open} aria-label={`${t('nav.language')} : ${cur.nom}`} className="flex h-11 items-center gap-1 rounded-xl px-2 text-sm font-black text-emerald-50 transition hover:bg-white/10 active:scale-90">
        <Globe size={18} />{cur.court}
      </button>
      {open && (
        <ul role="listbox" className="tilt-in absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl">
          {langues.map((l) => (
            <li key={l.code}>
              <button role="option" aria-selected={lang === l.code} onClick={() => { setLang(l.code); setOpen(false) }} className={`flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-left text-[15px] font-semibold ${lang === l.code ? 'bg-brand-light text-brand-deep' : 'text-slate-700 hover:bg-slate-50'}`}>
                <span className="w-7 text-xs font-black text-brand">{l.court}</span><span className="flex-1">{l.nom}</span>{lang === l.code && <Check size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Bandeau : contenus religieux encore en français (langues autres que le français)
export function LanguageNotice({ className = '' }) {
  const { isFr, t } = useT()
  if (isFr) return null
  return <p className={`rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200 ${className}`}>🌍 {t('lang.notice')} <span className="block text-xs opacity-80">{t('lang.beta')}</span></p>
}
