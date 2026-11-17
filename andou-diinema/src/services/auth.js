import { getSupabase, isConfigured, siteUrl, frError, db, isMissingTable } from './supabase'

const need = async () => {
  if (!isConfigured) throw new Error("Les comptes ne sont pas encore activés sur ce site (configuration Supabase manquante).")
  return getSupabase()
}
const wrap = async (p) => {
  let res
  try { res = await p } catch (e) { throw new Error(frError(e)) }
  if (res.error) throw new Error(frError(res.error))
  return res.data
}

export const validatePassword = (pw) => {
  if (!pw || pw.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.'
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'Le mot de passe doit contenir des lettres et des chiffres.'
  return null
}
export const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((e || '').trim())

export async function signUp({ email, password, displayName }) {
  const sb = await need()
  return wrap(sb.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { display_name: displayName?.trim().slice(0, 60) || '' }, emailRedirectTo: `${siteUrl}/parcours` },
  }))
}

export async function signIn({ email, password }) {
  const sb = await need()
  return wrap(sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }))
}

// Connexion sans mot de passe : lien envoyé par e-mail (pratique sur téléphone)
export async function sendMagicLink(email) {
  const sb = await need()
  return wrap(sb.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { emailRedirectTo: `${siteUrl}/parcours`, shouldCreateUser: false } }))
}

export async function resendConfirmation(email) {
  const sb = await need()
  return wrap(sb.auth.resend({ type: 'signup', email: email.trim().toLowerCase(), options: { emailRedirectTo: `${siteUrl}/parcours` } }))
}

export async function signOut() {
  if (!isConfigured) return
  const sb = await getSupabase()
  await sb.auth.signOut()
}

export async function sendPasswordReset(email) {
  const sb = await need()
  return wrap(sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${siteUrl}/reinitialiser` }))
}

export async function updatePassword(password) {
  const sb = await need()
  return wrap(sb.auth.updateUser({ password }))
}

// Récupère le profil ANDOU DIINEMA ; le crée à la première connexion.
// Retourne null si la base n'est pas encore installée.
export async function getProfile(user) {
  const { data, error } = await db.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) { if (isMissingTable(error)) return null; throw new Error(frError(error)) }
  if (data) return data
  const name = String(user.user_metadata?.display_name || '').slice(0, 60)
  const created = await db.from('profiles').upsert({ id: user.id, display_name: name }, { onConflict: 'id' }).select().single()
  if (created.error) throw new Error(frError(created.error))
  return created.data
}

export async function updateProfile(userId, patch) {
  const allowed = ['display_name', 'reminder_prefs', 'programme_cycle', 'programme_started_at', 'encouragements']
  const clean = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)))
  return wrap(db.from('profiles').upsert({ id: userId, ...clean }, { onConflict: 'id' }).select().single())
}

export async function getRoles(userId) {
  const { data, error } = await db.from('admin_roles').select('role').eq('user_id', userId)
  if (error) return []
  return data.map((r) => r.role)
}

export async function deleteAccount() {
  const sb = await need()
  await wrap(db.rpc('delete_my_account'))
  await sb.auth.signOut()
}
