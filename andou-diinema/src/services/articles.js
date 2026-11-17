// =====================================================================
//  Contenus : base intégrée au site + contenus gérés dans Supabase.
//  - Un contenu PUBLIÉ en base remplace la version intégrée (même identifiant)
//    et reçoit le badge « Validé ».
//  - Un contenu ARCHIVÉ en base est masqué du site.
//  - Les nouveaux contenus publiés en base sont ajoutés.
// =====================================================================
import { isConfigured, frError, rest, checkDbReady } from './supabase'
import { store } from '../lib/storage'
import { VERSETS, HADITHS, INVOCATIONS } from '../content/sources'
import { CATEGORIES, ARTICLES } from '../content/peches'
import { PROGRAMME } from '../content/programme'

const CACHE = 'ad:content-cache:v1'

export const baseContent = () => ({
  categories: CATEGORIES,
  articles: ARTICLES,
  versets: VERSETS,
  hadiths: HADITHS,
  invocations: INVOCATIONS,
  programme: PROGRAMME,
  statuses: {},
  source: 'base',
})

const fromDbArticle = (r) => ({
  slug: r.slug, cat: r.category_id, titre: r.titre, accroche: r.accroche, hukm: r.hukm, intro: r.intro,
  explication: r.explication, danger: r.danger, comprendre: r.comprendre, installation: r.installation,
  consequences: r.consequences || [], signes: r.signes || [], abandon: r.abandon || [], plan: r.plan || [],
  versets: r.verset_ids || [], hadiths: r.hadith_ids || [], invocation: r.invocation_id, encouragement: r.encouragement,
  published_at: r.published_at,
})

export function mergeContent(db) {
  const c = baseContent()
  if (!db) return c
  const st = {}
  for (const s of db.statuses || []) st[`${s.kind}:${s.id}`] = s.status
  const hidden = (kind, id) => st[`${kind}:${id}`] === 'archived'

  const versets = { ...c.versets }
  for (const r of db.versets || []) versets[r.id] = { s: r.sourate_num, a: r.ayat, sourate: r.sourate, ar: r.texte_ar || undefined, fr: r.traduction_fr }
  const hadiths = { ...c.hadiths }
  for (const r of db.hadiths || []) hadiths[r.id] = { fr: r.texte_fr, ar: r.texte_ar || undefined, ref: r.reference, grade: r.grade, contexte: r.contexte }
  const invocations = { ...c.invocations }
  for (const r of db.invocations || []) invocations[r.id] = { titre: r.titre, theme: r.theme, ar: r.texte_ar, tr: r.translitteration, fr: r.traduction_fr, ref: r.reference }

  const cats = new Map(c.categories.map((x) => [x.id, x]))
  for (const r of db.categories || []) cats.set(r.id, { ...(cats.get(r.id) || { couleur: 'from-emerald-600 to-emerald-800', icon: 'BookOpen' }), id: r.id, lettre: r.lettre, titre: r.titre, resume: r.resume, icon: r.icon || cats.get(r.id)?.icon || 'BookOpen' })

  const arts = new Map(c.articles.map((a) => [a.slug, a]))
  for (const r of db.articles || []) arts.set(r.slug, fromDbArticle(r))

  const prog = new Map(c.programme.map((d) => [d.jour, d]))
  for (const r of db.programme || []) prog.set(r.jour, { jour: r.jour, phase: r.phase, mission: r.mission, enseignement: r.enseignement, verset: r.verset_id, hadith: r.hadith_id, explication: r.explication, action: r.action, invocation: r.invocation_id })

  return {
    categories: [...cats.values()].filter((x) => !hidden('categorie', x.id)),
    articles: [...arts.values()].filter((a) => !hidden('article', a.slug) && !hidden('categorie', a.cat)),
    versets, hadiths, invocations,
    programme: [...prog.values()].sort((a, b) => a.jour - b.jour),
    statuses: st,
    source: 'supabase',
  }
}

export const cachedDb = () => store.get(CACHE, null)

export async function fetchDbContent() {
  if (!isConfigured || !(await checkDbReady())) return null
  const pub = (t) => rest.select(t, 'select=*&status=eq.published')
  const [statuses, categories, articles, versets, hadiths, invocations, programme] = await Promise.all([
    rest.rpc('content_statuses'),
    pub('categories'), pub('articles'), pub('quran_verses'), pub('hadiths'), pub('invocations'), pub('daily_programs'),
  ])
  const db = { statuses, categories, articles, versets, hadiths, invocations, programme }
  store.set(CACHE, db)
  return db
}

export async function topArticles(limit = 5) {
  if (!isConfigured || !(await checkDbReady())) return []
  try { return await rest.rpc('top_articles', { p_limit: limit }) } catch { return [] }
}

export function countView(slug) {
  if (!isConfigured) return
  const k = `ad:viewed:${slug}`
  if (sessionStorageSafe(k)) return
  checkDbReady().then((ok) => ok && rest.rpc('increment_article_view', { p_slug: slug })).catch(() => {})
}
function sessionStorageSafe(k) {
  try { if (sessionStorage.getItem(k)) return true; sessionStorage.setItem(k, '1') } catch { /* ignore */ }
  return false
}

export async function sendContactMessage({ nom, email, message }) {
  if (!isConfigured) throw new Error('Le formulaire sera actif dès la configuration de la base de données. Écris-nous par e-mail en attendant.')
  if (!(await checkDbReady())) throw new Error('Le formulaire sera actif très bientôt. Écris-nous par e-mail en attendant.')
  try { await rest.insert('contact_messages', { nom: nom.trim(), email: email.trim(), message: message.trim() }) } catch (e) { throw new Error(frError(e)) }
}
