import { supabase, isConfigured, siteUrl, frError } from './supabase'

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

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw new Error(frError(error))
  return data
}

export async function updateProfile(userId, patch) {
  const allowed = ['display_name', 'reminder_prefs', 'programme_cycle', 'programme_started_at', 'encouragements']
  const clean = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)))
  return wrap(supabase.from('profiles').update(clean).eq('id', userId).select().single())
}

export async function getRoles(userId) {
  const { data, error } = await supabase.from('admin_roles').select('role').eq('user_id', userId)
  if (error) return []
  return data.map((r) => r.role)
}

export async function deleteAccount() {
  need()
  await wrap(supabase.rpc('delete_my_account'))
  await supabase.auth.signOut()
}
