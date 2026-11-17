import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STRINGS, LANGUES } from './strings'
import { store } from '../lib/storage'

const KEY = 'ad:langue'
const LangContext = createContext(null)

function initial() {
  const saved = store.get(KEY, null)
  if (saved && STRINGS[saved]) return saved
  const nav = (typeof navigator !== 'undefined' && navigator.language || '').toLowerCase()
  if (nav.startsWith('wo')) return 'wo'
  if (nav.startsWith('ff') || nav.startsWith('fuc')) return 'ff'
  return 'fr'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initial)
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  const setLang = useCallback((l) => { if (STRINGS[l]) { setLangState(l); store.set(KEY, l) } }, [])
  // t('cle', { pct: 12 }) — repli automatique sur le français
  const t = useCallback((key, vars) => {
    let s = STRINGS[lang]?.[key] ?? STRINGS.fr[key] ?? key
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v)
    return s
  }, [lang])
  const value = useMemo(() => ({ lang, setLang, t, langues: LANGUES, isFr: lang === 'fr' }), [lang, setLang, t])
  return createElement(LangContext.Provider, { value }, children)
}

export function useT() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useT doit être utilisé dans LanguageProvider')
  return ctx
}
