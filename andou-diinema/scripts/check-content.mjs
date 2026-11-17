// Vérifie que toutes les références de contenu existent (aucun lien cassé).
import { VERSETS, HADITHS, INVOCATIONS } from '../src/content/sources.js'
import { ARTICLES, CATEGORIES } from '../src/content/peches.js'
import { THEMES, GUIDES } from '../src/content/themes.js'
import { PROGRAMME } from '../src/content/programme.js'
const errs = []
const chk = (kind, set, id, where) => { if (id && !set[id]) errs.push(`${kind} inconnu "${id}" dans ${where}`) }
const cats = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))
const slugs = {}
for (const a of ARTICLES) {
  if (slugs[a.slug]) errs.push('slug en double ' + a.slug); slugs[a.slug] = a
  chk('catégorie', cats, a.cat, a.slug)
  a.versets.forEach(v => chk('verset', VERSETS, v, a.slug))
  a.hadiths.forEach(h => chk('hadith', HADITHS, h, a.slug))
  chk('invocation', INVOCATIONS, a.invocation, a.slug)
  for (const k of ['titre','accroche','hukm','intro','explication','danger','comprendre','installation','encouragement']) if (!a[k]) errs.push(`${a.slug} : champ vide ${k}`)
  for (const k of ['consequences','signes','abandon','plan','versets','hadiths']) if (!a[k]?.length) errs.push(`${a.slug} : liste vide ${k}`)
}
for (const [k, t] of Object.entries(THEMES)) {
  ;(t.versetsCles||[]).forEach(v => chk('verset', VERSETS, v, k)); (t.hadithsCles||[]).forEach(h => chk('hadith', HADITHS, h, k))
  t.items.forEach(i => { (i.versets||[]).forEach(v => chk('verset', VERSETS, v, k+'/'+i.titre)); (i.hadiths||[]).forEach(h => chk('hadith', HADITHS, h, k+'/'+i.titre)) })
}
GUIDES.forEach(g => chk('article', slugs, g.article, 'guide ' + g.titre))
if (PROGRAMME.length !== 30) errs.push('programme : ' + PROGRAMME.length + ' jours')
PROGRAMME.forEach(d => { chk('verset', VERSETS, d.verset, 'jour ' + d.jour); chk('hadith', HADITHS, d.hadith, 'jour ' + d.jour); chk('invocation', INVOCATIONS, d.invocation, 'jour ' + d.jour) })
console.log(`${ARTICLES.length} articles, ${Object.keys(VERSETS).length} versets, ${Object.keys(HADITHS).length} hadiths, ${Object.keys(INVOCATIONS).length} invocations, ${PROGRAMME.length} jours`)
if (errs.length) { console.error(errs.join('\n')); process.exit(1) } else console.log('OK : aucune référence cassée')

// ---- Parcours
const { ETAPES, CHAPITRES } = await import('../src/content/parcours.js')
const errs2 = []
const ids = new Set()
for (const e of ETAPES) {
  if (ids.has(e.id)) errs2.push('étape en double ' + e.id); ids.add(e.id)
  if (!CHAPITRES.find((c) => c.id === e.chap)) errs2.push('chapitre inconnu ' + e.id)
  if (e.article && !slugs[e.article]) errs2.push(`article inconnu ${e.article} (${e.id})`)
  if (e.theme && !THEMES[e.theme[0]]?.items[e.theme[1]]) errs2.push(`rubrique inconnue ${e.theme} (${e.id})`)
  if (!e.article && !e.theme && !e.lecture) errs2.push('pas de lecture ' + e.id)
  if (!VERSETS[e.verset]) errs2.push(`verset inconnu ${e.verset} (${e.id})`)
  if (!HADITHS[e.hadith]) errs2.push(`hadith inconnu ${e.hadith} (${e.id})`)
  if (!INVOCATIONS[e.invocation]) errs2.push(`invocation inconnue ${e.invocation} (${e.id})`)
  if (!e.quiz?.q || e.quiz.o?.length < 3 || !e.quiz.e) errs2.push('quiz incomplet ' + e.id)
  if (!e.reflexion || !e.mission) errs2.push('activité manquante ' + e.id)
}
console.log(`Parcours : ${CHAPITRES.length} chapitres, ${ETAPES.length} étapes`)
if (errs2.length) { console.error(errs2.join('\n')); process.exit(1) }
