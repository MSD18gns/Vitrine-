import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { api, getDriver } from '../services/progress'

// Fournit l'API de progression (invité ou compte) et un compteur de version
// qui permet aux écrans de se rafraîchir après chaque modification.
const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const { user, migrated, dbReady } = useAuth()
  const [version, setVersion] = useState(0)
  const value = useMemo(() => ({
    api: api(getDriver(user, dbReady)),
    isGuest: !user || !dbReady,
    dbMissing: !!user && !dbReady,
    version,
    bump: () => setVersion((v) => v + 1),
  }), [user, dbReady, version])
  useEffect(() => { if (migrated) setVersion((v) => v + 1) }, [migrated])
  return createElement(ProgressContext.Provider, { value }, children)
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress doit être utilisé dans ProgressProvider')
  return ctx
}

// Charge une donnée asynchrone dépendant de la progression
export function useProgressData(loader, deps = []) {
  const { api: a, version } = useProgress()
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const load = useCallback(loader, [a, ...deps]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true }))
    load(a)
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error: error.message }))
    return () => { active = false }
  }, [load, version, a])
  return state
}

// Favoris
export function useBookmarks() {
  const { api: a, bump } = useProgress()
  const { data } = useProgressData((x) => x.listBookmarks())
  const list = data || []
  const has = (type, id) => list.some((b) => b.item_type === type && b.item_id === id)
  const toggle = async (type, id) => {
    if (has(type, id)) await a.removeBookmark({ item_type: type, item_id: id })
    else await a.addBookmark({ item_type: type, item_id: id })
    bump()
  }
  return { list, has, toggle }
}
