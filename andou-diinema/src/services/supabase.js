import { createClient } from '@supabase/supabase-js'

// Seule la clé PUBLIQUE (anon / publishable) est utilisée côté navigateur.
// La sécurité repose sur les politiques RLS définies dans supabase/migrations/schema.sql.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && key && !/x{6,}/.test(url) && !/x{6,}/.test(key))

export const supabase = isConfigured
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    })
  : null

export const siteUrl = (import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')

// Traduit les erreurs techniques en messages compréhensibles
export function frError(error) {
  const m = (error?.message || String(error || '')).toLowerCase()
  if (!m) return "Une erreur inattendue s'est produite."
  if (m.includes('invalid login credentials')) return 'Adresse e-mail ou mot de passe incorrect.'
  if (m.includes('email not confirmed')) return "Ton adresse e-mail n'est pas encore confirmée. Vérifie ta boîte de réception."
  if (m.includes('user already registered') || m.includes('already been registered')) return 'Un compte existe déjà avec cette adresse e-mail.'
  if (m.includes('password should be at least') || m.includes('weak password')) return 'Le mot de passe doit contenir au moins 8 caractères, avec lettres et chiffres.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Trop de tentatives. Réessaie dans quelques minutes.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Connexion impossible. Vérifie ta connexion Internet.'
  if (m.includes('row-level security') || m.includes('permission denied') || m.includes('accès refusé')) return "Tu n'as pas l'autorisation d'effectuer cette action."
  if (m.includes('jwt') || m.includes('session')) return 'Ta session a expiré. Reconnecte-toi.'
  return error?.message || "Une erreur inattendue s'est produite."
}
