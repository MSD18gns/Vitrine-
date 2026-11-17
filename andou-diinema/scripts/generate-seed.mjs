// Génère supabase/seed.sql à partir du contenu du site (source unique).
// Tous les contenus sont insérés avec le statut 'review' : ils doivent être
// validés par une personne qualifiée puis publiés depuis l'administration.
import { writeFileSync } from 'node:fs'
import { VERSETS, HADITHS, INVOCATIONS } from '../src/content/sources.js'
import { CATEGORIES, ARTICLES } from '../src/content/peches.js'
import { PROGRAMME } from '../src/content/programme.js'

const q = (v) => (v === undefined || v === null ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
const arr = (a = []) => `array[${a.map(q).join(',')}]::text[]`
const out = ['-- Généré par scripts/generate-seed.mjs — ne pas modifier à la main', 'begin;']

CATEGORIES.forEach((c, i) => out.push(
  `insert into public.categories (id, lettre, titre, resume, icon, position, status) values (${q(c.id)}, ${q(c.lettre)}, ${q(c.titre)}, ${q(c.resume)}, ${q(c.icon)}, ${i}, 'review') on conflict (id) do nothing;`))

for (const [id, v] of Object.entries(VERSETS)) out.push(
  `insert into public.quran_verses (id, sourate, sourate_num, ayat, texte_ar, traduction_fr, status) values (${q(id)}, ${q(v.sourate)}, ${v.s}, ${q(v.a)}, ${q(v.ar)}, ${q(v.fr)}, 'review') on conflict (id) do nothing;`)

for (const [id, h] of Object.entries(HADITHS)) out.push(
  `insert into public.hadiths (id, texte_fr, texte_ar, reference, grade, contexte, status) values (${q(id)}, ${q(h.fr)}, ${q(h.ar)}, ${q(h.ref)}, ${q(h.grade)}, ${q(h.contexte)}, 'review') on conflict (id) do nothing;`)

for (const [id, d] of Object.entries(INVOCATIONS)) out.push(
  `insert into public.invocations (id, titre, theme, texte_ar, translitteration, traduction_fr, reference, status) values (${q(id)}, ${q(d.titre)}, ${q(d.theme)}, ${q(d.ar)}, ${q(d.tr)}, ${q(d.fr)}, ${q(d.ref)}, 'review') on conflict (id) do nothing;`)

for (const a of ARTICLES) {
  out.push(`insert into public.articles (slug, category_id, titre, accroche, hukm, intro, explication, danger, comprendre, installation, consequences, signes, abandon, plan, verset_ids, hadith_ids, invocation_id, encouragement, status, created_by) values (${[a.slug, a.cat, a.titre, a.accroche, a.hukm, a.intro, a.explication, a.danger, a.comprendre, a.installation].map(q).join(', ')}, ${arr(a.consequences)}, ${arr(a.signes)}, ${arr(a.abandon)}, ${arr(a.plan)}, ${arr(a.versets)}, ${arr(a.hadiths)}, ${q(a.invocation)}, ${q(a.encouragement)}, 'review', null) on conflict (slug) do nothing;`)
  out.push(`insert into public.sins (id, category_id, nom, hukm, article_slug, status) values (${q(a.slug)}, ${q(a.cat)}, ${q(a.titre)}, ${q(a.hukm)}, ${q(a.slug)}, 'review') on conflict (id) do nothing;`)
}

for (const d of PROGRAMME) out.push(
  `insert into public.daily_programs (jour, phase, mission, enseignement, verset_id, hadith_id, explication, action, invocation_id, status) values (${d.jour}, ${d.phase}, ${q(d.mission)}, ${q(d.enseignement)}, ${q(d.verset)}, ${q(d.hadith)}, ${q(d.explication)}, ${q(d.action)}, ${q(d.invocation)}, 'review') on conflict (jour) do nothing;`)

out.push('commit;')
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), out.join('\n') + '\n')
console.log(`seed.sql : ${out.length - 3} insertions`)
