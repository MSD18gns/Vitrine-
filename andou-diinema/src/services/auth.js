import { supabase, isConfigured, siteUrl, frError , db } from './supabase'

const need = () => {
  if (!isConfigured) throw new Error("Les comptes ne sont pas encore activés sur ce site (configuration Supabase manquante).")
}
const wrap = async (p) => {
  const { data, error } = await p
  if (error) throw new Error(frError(error))
  return data
}

export const validatePassword = (pw) => {
  if (!pw || pw.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.'
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'Le mot de passe doit contenir des lettres et des chiffres.'
  return null
}

export async function signUp({ email, password, displayName }) {
  need()
  return wrap(supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName?.trim().slice(0, 60) || '' }, emailRedirectTo: `${siteUrl}/parcours` },
  }))
}

export async function signIn({ email, password }) {
  need()
  return wrap(supabase.auth.signInWithPassword({ email: email.trim(), password }))
}

export async function signOut() {
  if (!isConfigured) return
  await supabase.auth.signOut()
}

export async function sendPasswordReset(email) {
  need()
  return wrap(supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${siteUrl}/reinitialiser` }))
}

export async function updatePassword(password) {
  need()
  return wrap(supabase.auth.updateUser({ password }))
}

// Récupère le profil ANDOU DIINEMA ; le crée à la première connexion
export async function getProfile(user) {
  const { data, error } = await db.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw new Error(frError(error))
  if (data) return data
  const name = String(user.user_metadata?.display_name || '').slice(0, 60)
  const created = await db.from('profiles').upsert({ id: user.id, display_name: name }, { onConflict: 'id' }).select().single()
  if (created.error) throw new Error(frError(created.error))
  return created.data
}

export async function updateProfile(userId, patch) {
  const allowed = ['display_name', 'reminder_prefs', 'programme_cycle', 'programme_started_at', 'encouragements']
  const clean = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)))
  return wrap(db.from('profiles').update(clean).eq('id', userId).select().single())
}

export async function getRoles(userId) {
  const { data, error } = await db.from('admin_roles').select('role').eq('user_id', userId)
  if (error) return []
  return data.map((r) => r.role)
}

export async function deleteAccount() {
  need()
  await wrap(db.rpc('delete_my_account'))
  await supabase.auth.signOut()
}
