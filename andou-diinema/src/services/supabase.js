// =====================================================================
//  Accès à Supabase
//  - Les visiteurs (lecture du contenu, annonces, contact) utilisent de
//    simples requêtes REST : la bibliothèque supabase-js (~60 Ko compressés)
//    n'est chargée QUE pour les comptes (connexion, progression, admin).
//  - Seule la clé PUBLIQUE est utilisée. La sécurité repose sur les RLS.
//  - Toutes les tables/fonctions sont préfixées « ad_ » (projet partagé).
// =====================================================================
const url = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isConfigured = Boolean(url && key && !/x{6,}/.test(url) && !/x{6,}/.test(key))
export const DB_PREFIX = import.meta.env.VITE_DB_PREFIX ?? 'ad_'
export const siteUrl = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')
const projectRef = url.match(/https:\/\/([^.]+)\./)?.[1] || ''
export const AUTH_STORAGE_KEY = `sb-${projectRef}-auth-token`
const TIMEOUT = 12000

// ------------------------------------------------------------ client complet (chargé à la demande)
let client = null
let loading = null
const readyListeners = new Set()

export function getSupabase() {
  if (!isConfigured) return Promise.reject(new Error('Supabase non configuré'))
  if (client) return Promise.resolve(client)
  if (!loading) {
    loading = import('@supabase/supabase-js').then(({ createClient }) => {
      client = createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: AUTH_STORAGE_KEY },
        global: { fetch: (input, init) => fetchWithTimeout(input, init) },
      })
      readyListeners.forEach((f) => f(client))
      return client
    }).catch((e) => { loading = null; throw e })
  }
  return loading
}
export const onSupabaseReady = (f) => { readyListeners.add(f); if (client) f(client); return () => readyListeners.delete(f) }

// Une session existe-t-elle déjà sur cet appareil (ou un retour de lien e-mail) ?
export function hasStoredSession() {
  if (!isConfigured) return false
  try {
    if (localStorage.getItem(AUTH_STORAGE_KEY)) return true
  } catch { /* stockage indisponible */ }
  const q = window.location.search + window.location.hash
  return /[?&#](code|access_token|token_hash|error_description)=/.test(q)
}

// Accès aux tables préfixées via le client complet (déjà chargé)
export const db = {
  from: (table) => {
    if (!client) throw new Error('Connexion à la base en cours, réessaie dans un instant.')
    return client.from(DB_PREFIX + table)
  },
  rpc: (fn, args) => {
    if (!client) throw new Error('Connexion à la base en cours, réessaie dans un instant.')
    return client.rpc(DB_PREFIX + fn, args)
  },
}

// ------------------------------------------------------------ REST léger (visiteurs)
export async function fetchWithTimeout(input, init = {}, ms = TIMEOUT) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  if (init.signal) init.signal.addEventListener('abort', () => ctrl.abort())
  try {
    return await fetch(input, { ...init, signal: ctrl.signal })
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('La connexion est trop lente. Réessaie dans un instant.')
    throw e
  } finally { clearTimeout(t) }
}

async function restCall(path, { method = 'GET', body, prefer } = {}) {
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
  if (prefer) headers.Prefer = prefer
  const res = await fetchWithTimeout(`${url}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) { const err = new Error(data?.message || res.statusText); err.code = data?.code; err.status = res.status; throw err }
  return data
}
export const rest = {
  select: (table, query = '') => restCall(`/rest/v1/${DB_PREFIX}${table}?${query}`),
  insert: (table, row) => restCall(`/rest/v1/${DB_PREFIX}${table}`, { method: 'POST', body: row, prefer: 'return=minimal' }),
  rpc: (fn, args = {}) => restCall(`/rest/v1/rpc/${DB_PREFIX}${fn}`, { method: 'POST', body: args }),
}

// La base ANDOU DIINEMA est-elle installée ? (vérifié une fois par session)
let dbReadyPromise = null
export function checkDbReady() {
  if (!isConfigured) return Promise.resolve(false)
  if (!dbReadyPromise) {
    dbReadyPromise = rest.select('categories', 'select=id&limit=1')
      .then(() => true)
      .catch((e) => {
        if (isMissingTable(e)) return false
        dbReadyPromise = null // erreur réseau : on retentera plus tard
        return true
      })
  }
  return dbReadyPromise
}
export const isMissingTable = (e) => e?.code === 'PGRST205' || e?.code === '42P01' || /schema cache|does not exist/i.test(e?.message || '')

// Traduit les erreurs techniques en messages compréhensibles
export function frError(error) {
  const m = (error?.message || String(error || '')).toLowerCase()
  if (!m) return "Une erreur inattendue s'est produite."
  if (isMissingTable(error)) return "La base de données d'ANDOU DIINEMA n'est pas encore installée. Ta progression est enregistrée sur cet appareil en attendant."
  if (m.includes('invalid login credentials')) return 'Adresse e-mail ou mot de passe incorrect.'
  if (m.includes('email not confirmed')) return "Ton adresse e-mail n'est pas encore confirmée. Vérifie ta boîte de réception (et les courriers indésirables)."
  if (m.includes('user already registered') || m.includes('already been registered')) return 'Un compte existe déjà avec cette adresse e-mail. Connecte-toi ou utilise « Mot de passe oublié ».'
  if (m.includes('password should be at least') || m.includes('weak password')) return 'Le mot de passe doit contenir au moins 8 caractères, avec lettres et chiffres.'
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes')) return 'Trop de tentatives. Patiente une minute avant de réessayer.'
  if (m.includes('trop lente')) return error.message
  if (m.includes('failed to fetch') || m.includes('network') || m.includes('load failed')) return 'Connexion impossible. Vérifie ta connexion Internet.'
  if (m.includes('row-level security') || m.includes('permission denied') || m.includes('accès refusé')) return "Tu n'as pas l'autorisation d'effectuer cette action."
  if (m.includes('jwt') || m.includes('session')) return 'Ta session a expiré. Reconnecte-toi.'
  if (m.includes('signups not allowed')) return 'Les inscriptions sont temporairement fermées.'
  return error?.message || "Une erreur inattendue s'est produite."
}
