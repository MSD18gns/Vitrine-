import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { isConfigured, getSupabase, onSupabaseReady, hasStoredSession, checkDbReady } from '../services/supabase'
import { getProfile, getRoles } from '../services/auth'
import { migrateGuestData } from '../services/progress'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [roles, setRoles] = useState([])
  // On n'attend Supabase que si une session existe déjà sur l'appareil
  const [loading, setLoading] = useState(() => hasStoredSession())
  const [dbReady, setDbReady] = useState(true)
  const [migrated, setMigrated] = useState(false)
  const user = session?.user || null
  const subscribed = useRef(false)

  useEffect(() => { checkDbReady().then(setDbReady) }, [])

  const loadUser = useCallback(async (u) => {
    if (!u) { setProfile(null); setRoles([]); return }
    const ready = await checkDbReady()
    setDbReady(ready)
    if (!ready) return
    try {
      const [p, r] = await Promise.all([getProfile(u), getRoles(u.id)])
      setProfile(p); setRoles(r)
    } catch { /* profil indisponible : on continue */ }
    try { if (await migrateGuestData(u)) setMigrated(true) } catch { /* transfert ultérieur */ }
  }, [])

  // Abonnement aux changements de session dès que le client est chargé
  useEffect(() => {
    if (!isConfigured) return
    return onSupabaseReady(async (sb) => {
      if (subscribed.current) return
      subscribed.current = true
      const { data } = await sb.auth.getSession()
      setSession(data.session)
      await loadUser(data.session?.user)
      setLoading(false)
      sb.auth.onAuthStateChange((event, s) => {
        setSession(s)
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') loadUser(s?.user)
      })
    })
  }, [loadUser])

  // Chargement immédiat seulement si une session est mémorisée
  useEffect(() => {
    if (hasStoredSession()) getSupabase().catch(() => setLoading(false))
  }, [])

  const value = useMemo(() => ({
    configured: isConfigured,
    loading,
    user,
    profile,
    roles,
    dbReady,
    isAdmin: roles.includes('admin'),
    isStaff: roles.length > 0,
    can: (r) => roles.includes('admin') || roles.includes(r),
    migrated,
    clearMigrated: () => setMigrated(false),
    refreshProfile: () => loadUser(user),
    warmUp: () => { if (isConfigured) getSupabase().catch(() => {}) },
  }), [loading, user, profile, roles, dbReady, migrated, loadUser])

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
