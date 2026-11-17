import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react'
import { baseContent, cachedDb, fetchDbContent, mergeContent } from '../services/articles'

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [db, setDb] = useState(() => cachedDb())
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    fetchDbContent()
      .then((d) => { if (active && d) setDb(d) })
      .catch((e) => active && setError(e.message))
    return () => { active = false }
  }, [version])

  const value = useMemo(() => {
    const c = db ? mergeContent(db) : baseContent()
    return {
      ...c,
      error,
      reload: () => setVersion((v) => v + 1),
      isValidated: (kind, id) => c.statuses[`${kind}:${id}`] === 'published',
      article: (slug) => c.articles.find((a) => a.slug === slug),
      category: (id) => c.categories.find((x) => x.id === id),
      byCategory: (id) => c.articles.filter((a) => a.cat === id),
    }
  }, [db, error])

  return createElement(ContentContext.Provider, { value }, children)
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent doit être utilisé dans ContentProvider')
  return ctx
}
