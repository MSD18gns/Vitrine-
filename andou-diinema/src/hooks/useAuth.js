import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isConfigured } from '../services/supabase'
import { getProfile, getRoles } from '../services/auth'
import { migrateGuestData } from '../services/progress'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(isConfigured)
  const [migrated, setMigrated] = useState(false)
  const user = session?.user || null

  const loadUser = useCallback(async (u) => {
    if (!u) { setProfile(null); setRoles([]); return }
    try {
      const [p, r] = await Promise.all([getProfile(u.id), getRoles(u.id)])
      setProfile(p); setRoles(r)
    } catch { /* profil indisponible : on continue */ }
    try { if (await migrateGuestData(u)) setMigrated(true) } catch { /* transfert ultérieur */ }
  }, [])

  useEffect(() => {
    if (!isConfigured) return
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      await loadUser(data.session?.user)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') loadUser(s?.user)
    })
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [loadUser])

  const value = useMemo(() => ({
    configured: isConfigured,
    loading,
    user,
    profile,
    roles,
    isAdmin: roles.includes('admin'),
    isStaff: roles.length > 0,
    can: (r) => roles.includes('admin') || roles.includes(r),
    migrated,
    clearMigrated: () => setMigrated(false),
    refreshProfile: () => loadUser(user),
  }), [loading, user, profile, roles, migrated, loadUser])

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
