// =====================================================================
//  Progression personnelle : programme, prières, dhikr, objectifs,
//  bilans, favoris. Deux moteurs :
//   - "local"  : invité (données dans ce navigateur uniquement)
//   - "remote" : compte connecté (Supabase, protégé par RLS)
//  À la connexion, les données invitées sont transférées dans le compte.
// =====================================================================
import { frError, db } from './supabase'
import { store } from '../lib/storage'
import { dayKey } from '../lib/dates'

export const PRIERES = [
  { id: 'fajr', nom: 'Fajr' },
  { id: 'dhuhr', nom: 'Dhuhr' },
  { id: 'asr', nom: 'Asr' },
  { id: 'maghrib', nom: 'Maghrib' },
  { id: 'isha', nom: 'Isha' },
]

export const DHIKRS = [
  { id: 'subhanallah', ar: 'سُبْحَانَ اللَّهِ', nom: 'Subhan Allah', objectif: 33 },
  { id: 'alhamdulillah', ar: 'الْحَمْدُ لِلَّهِ', nom: 'Al-hamdu lillah', objectif: 33 },
  { id: 'allahuakbar', ar: 'اللَّهُ أَكْبَرُ', nom: 'Allahu akbar', objectif: 33 },
  { id: 'astaghfirullah', ar: 'أَسْتَغْفِرُ اللَّهَ', nom: 'Astaghfirullah', objectif: 100 },
  { id: 'lailahaillallah', ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ', nom: 'La ilaha illa Allah', objectif: 100 },
  { id: 'salawat', ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', nom: "Salat 'ala n-Nabi", objectif: 10 },
]

const ok = ({ data, error }) => {
  if (error) throw new Error(frError(error))
  return data
}

// ------------------------------------------------------------------ LOCAL
const L = 'ad:guest:'
const local = {
  name: 'local',
  _rows() { return store.get(L + 'progress', []) },
  _save(rows) { store.set(L + 'progress', rows) },
  async listProgress(kind, { from, to } = {}) {
    return this._rows().filter((r) => r.kind === kind && (!from || r.day >= from) && (!to || r.day <= to))
  },
  async upsertProgress(row) {
    const rows = this._rows().filter((r) => !(r.kind === row.kind && r.ref === row.ref && r.day === row.day))
    rows.push({ value: 1, data: {}, ...row, updated_at: new Date().toISOString() })
    this._save(rows)
  },
  async deleteProgress({ kind, ref, day }) {
    this._save(this._rows().filter((r) => !(r.kind === kind && r.ref === ref && (day === undefined || r.day === day))))
  },
  async getMeta() { return store.get(L + 'meta', { programme_cycle: 1, encouragements: 0, programme_started_at: null, reminder_prefs: {} }) },
  async setMeta(patch) { store.set(L + 'meta', { ...(await this.getMeta()), ...patch }) },
  async getReview(day) { return store.get(L + 'reviews', {})[day] || null },
  async listReviews(limit = 30) {
    return Object.values(store.get(L + 'reviews', {})).sort((a, b) => b.day.localeCompare(a.day)).slice(0, limit)
  },
  async saveReview(r) { const all = store.get(L + 'reviews', {}); all[r.day] = r; store.set(L + 'reviews', all) },
  async listBookmarks() { return store.get(L + 'bookmarks', []) },
  async addBookmark(b) { const all = store.get(L + 'bookmarks', []); if (!all.some((x) => x.item_type === b.item_type && x.item_id === b.item_id)) store.set(L + 'bookmarks', [{ ...b, created_at: new Date().toISOString() }, ...all]) },
  async removeBookmark(b) { store.set(L + 'bookmarks', store.get(L + 'bookmarks', []).filter((x) => !(x.item_type === b.item_type && x.item_id === b.item_id))) },
  hasData() { return this._rows().length > 0 || store.get(L + 'bookmarks', []).length > 0 || Object.keys(store.get(L + 'reviews', {})).length > 0 },
  clear() { ['progress', 'meta', 'reviews', 'bookmarks'].forEach((k) => store.remove(L + k)) },
}

// ------------------------------------------------------------------ REMOTE
const remote = (user) => ({
  name: 'remote',
  async listProgress(kind, { from, to } = {}) {
    let q = db.from('user_progress').select('kind, ref, day, value, data, updated_at').eq('kind', kind)
    if (from) q = q.gte('day', from)
    if (to) q = q.lte('day', to)
    return ok(await q.order('day', { ascending: true }).limit(5000))
  },
  async upsertProgress(row) {
    ok(await db.from('user_progress').upsert({ user_id: user.id, value: 1, data: {}, ...row }, { onConflict: 'user_id,kind,ref,day' }))
  },
  async deleteProgress({ kind, ref, day }) {
    let q = db.from('user_progress').delete().eq('user_id', user.id).eq('kind', kind).eq('ref', ref)
    if (day !== undefined) q = q.eq('day', day)
    ok(await q)
  },
  async getMeta() {
    const p = ok(await db.from('profiles').select('programme_cycle, encouragements, programme_started_at, reminder_prefs, display_name').eq('id', user.id).maybeSingle())
    return p || { programme_cycle: 1, encouragements: 0, programme_started_at: null, reminder_prefs: {} }
  },
  async setMeta(patch) { ok(await db.from('profiles').upsert({ id: user.id, ...patch }, { onConflict: 'id' })) },
  async getReview(day) { return ok(await db.from('daily_reviews').select('*').eq('day', day).maybeSingle()) },
  async listReviews(limit = 30) { return ok(await db.from('daily_reviews').select('*').order('day', { ascending: false }).limit(limit)) },
  async saveReview(r) {
    ok(await db.from('daily_reviews').upsert({ user_id: user.id, day: r.day, answers: r.answers, note: r.note || null, score: r.score }, { onConflict: 'user_id,day' }))
  },
  async listBookmarks() { return ok(await db.from('bookmarks').select('item_type, item_id, created_at').order('created_at', { ascending: false })) },
  async addBookmark(b) { ok(await db.from('bookmarks').upsert({ user_id: user.id, ...b }, { onConflict: 'user_id,item_type,item_id' })) },
  async removeBookmark(b) { ok(await db.from('bookmarks').delete().eq('user_id', user.id).eq('item_type', b.item_type).eq('item_id', b.item_id)) },
})

export const getDriver = (user, dbReady = true) => (user && dbReady ? remote(user) : local)

// Transfert des données invitées vers le compte, une seule fois
export async function migrateGuestData(user) {
  if (!user || !local.hasData()) return false
  const r = remote(user)
  const rows = local._rows()
  if (rows.length) {
    const payload = rows.map(({ kind, ref, day, value, data }) => ({ user_id: user.id, kind, ref, day, value, data: data || {} }))
    ok(await db.from('user_progress').upsert(payload, { onConflict: 'user_id,kind,ref,day' }))
  }
  for (const rv of await local.listReviews(365)) await r.saveReview(rv)
  for (const b of await local.listBookmarks()) await r.addBookmark({ item_type: b.item_type, item_id: b.item_id })
  const meta = await local.getMeta()
  const current = await r.getMeta()
  await r.setMeta({
    encouragements: (current.encouragements || 0) + (meta.encouragements || 0),
    programme_cycle: Math.max(current.programme_cycle || 1, meta.programme_cycle || 1),
    programme_started_at: current.programme_started_at || meta.programme_started_at,
  })
  local.clear()
  return true
}

// ------------------------------------------------------------------ API métier
export const api = (driver) => ({
  driver: driver.name,

  // Programme 30 jours ---------------------------------------------
  async programme() {
    const meta = await driver.getMeta()
    const cycle = meta.programme_cycle || 1
    const rows = await driver.listProgress('programme')
    const done = {}
    const historique = []
    let totalAllCycles = 0
    for (const r of rows) {
      const [c, j] = r.ref.split(':').map(Number)
      totalAllCycles++
      historique.push({ cycle: c, jour: j, day: r.day })
      if (c === cycle) done[j] = r.day
    }
    historique.sort((a, b) => b.day.localeCompare(a.day) || b.jour - a.jour)
    return { cycle, done, historique, encouragements: meta.encouragements || 0, totalAllCycles, startedAt: meta.programme_started_at }
  },
  async setMission(cycle, jour, isDone) {
    const ref = `${cycle}:${jour}`
    if (isDone) {
      await driver.upsertProgress({ kind: 'programme', ref, day: dayKey() })
      const meta = await driver.getMeta()
      const patch = { encouragements: (meta.encouragements || 0) + 1 }
      if (!meta.programme_started_at) patch.programme_started_at = dayKey()
      await driver.setMeta(patch)
    } else {
      await driver.deleteProgress({ kind: 'programme', ref })
    }
  },
  // Recommencer : nouveau cycle, les encouragements et l'historique sont conservés
  async restartProgramme() {
    const meta = await driver.getMeta()
    await driver.setMeta({ programme_cycle: (meta.programme_cycle || 1) + 1, programme_started_at: dayKey() })
  },

  // Prières --------------------------------------------------------
  async prayers(from, to) { return driver.listProgress('prayer', { from, to }) },
  async setPrayer(day, id, isDone) {
    if (isDone) await driver.upsertProgress({ kind: 'prayer', ref: id, day })
    else await driver.deleteProgress({ kind: 'prayer', ref: id, day })
  },

  // Dhikr ----------------------------------------------------------
  async dhikr(from, to) { return driver.listProgress('dhikr', { from, to }) },
  async setDhikr(day, id, value) {
    if (value <= 0) await driver.deleteProgress({ kind: 'dhikr', ref: id, day })
    else await driver.upsertProgress({ kind: 'dhikr', ref: id, day, value: Math.min(value, 100000) })
  },

  // Objectifs ------------------------------------------------------
  async goals() {
    const rows = await driver.listProgress('goal')
    return rows.map((r) => ({ id: r.ref, day: r.day, titre: r.data?.titre || '', done: !!r.data?.done })).sort((a, b) => Number(a.done) - Number(b.done) || b.day.localeCompare(a.day))
  },
  async saveGoal(goal) {
    const id = goal.id || `g${Date.now().toString(36)}`
    await driver.upsertProgress({ kind: 'goal', ref: id, day: goal.day || dayKey(), data: { titre: goal.titre.slice(0, 140), done: !!goal.done } })
    return id
  },
  async deleteGoal(goal) { await driver.deleteProgress({ kind: 'goal', ref: goal.id, day: goal.day }) },

  // Bilans quotidiens ----------------------------------------------
  getReview: (day) => driver.getReview(day),
  listReviews: (limit) => driver.listReviews(limit),
  saveReview: (r) => driver.saveReview(r),

  // Favoris --------------------------------------------------------
  listBookmarks: () => driver.listBookmarks(),
  addBookmark: (b) => driver.addBookmark(b),
  removeBookmark: (b) => driver.removeBookmark(b),

  // Rappels --------------------------------------------------------
  async reminderPrefs() { return (await driver.getMeta()).reminder_prefs || {} },
  async setReminderPrefs(prefs) { await driver.setMeta({ reminder_prefs: prefs }) },
})
