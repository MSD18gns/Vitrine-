// Mahmoud en wolof et pulaar : node mahmoud/tests/langues.test.mjs [url] [dossier-captures]
import { createRequire } from 'module'
const { chromium, devices } = createRequire(import.meta.url)('playwright')
const BASE = process.argv[2] || 'http://127.0.0.1:4173'
const OUT = process.argv[3] || 'mahmoud/preview/shots'
const results = []
const ok = (name, cond, info = '') => results.push([cond ? 'OK ' : 'ÉCHEC', name, info])
const CASES = {
  wo: { hello: /Assalaamu aleykum! Maa ngi tudd Mahmoud/, lesson: /tàmbali|Jéego bu bees|Toogal/, wrong: /Du dara|Du loolu|mbugal/, right: /Baax na, dëgg|Tontu bu rafet|Xam nga ko/, end: /Jéego bi jeex na|Beneen jéego/, reduce: 'Wàññi Mahmoud', check: 'Seetlu', cont: 'Wéyal', finish: /Jeexal episod/, chat: 'Yaw kan nga?', chatRe: /Duma imaam/ },
  ff: { hello: /Ko Mahmoud mi wiyetee/, lesson: /Fuɗɗen|Tappere hesere|Jooɗo/, wrong: /Wonaa hay huunde|Wonaa ɗum tigi|lepte/, right: /A moƴƴii, ko goonga|Jaabawol moƴƴol|A faami/, end: /Tappere gasii|Tappere goɗɗo/, reduce: 'Ustu Mahmoud', check: 'Ƴeewto', cont: 'Jokku', finish: /Gasnu episod/, chat: 'Ko hommbo woni?', chatRe: /Mi wonaa imaam/ },
}
const b = await chromium.launch()
for (const [lang, C] of Object.entries(CASES)) {
  const ctx = await b.newContext({ ...devices['iPhone 13'] })
  await ctx.addInitScript((l) => { try { if (!sessionStorage.getItem('t-init')) { localStorage.setItem('ad:langue', JSON.stringify(l)); localStorage.setItem('ad:rules-seen', 'true'); sessionStorage.setItem('t-init', '1') } } catch {} }, lang)
  const p = await ctx.newPage(); const errors = []
  p.on('pageerror', (e) => errors.push(String(e)))
  const bubble = () => p.locator('aside [aria-live=polite]').first().innerText().catch(() => '')
  await p.goto(`${BASE}/`); await p.waitForTimeout(4500)
  ok(`[${lang}] Accueil : bienvenue traduite`, C.hello.test(await bubble()), await bubble())
  ok(`[${lang}] Bouton « Réduire » traduit`, await p.getByRole('button', { name: C.reduce }).count() > 0)
  await p.screenshot({ path: `${OUT}/lang-${lang}-accueil.png` })
  await p.goto(`${BASE}/parcours/etape/banalisation`); await p.waitForTimeout(3500)
  ok(`[${lang}] Début de leçon traduit`, C.lesson.test(await bubble()), await bubble())
  for (let i = 0; i < 3; i++) { await p.getByRole('button', { name: C.cont, exact: true }).click(); await p.waitForTimeout(500) }
  const radios = p.getByRole('radio'); let wrong = false, right = false
  for (let i = 0; i < await radios.count() && !right; i++) {
    await radios.nth(i).click(); await p.getByRole('button', { name: C.check }).click(); await p.waitForTimeout(900)
    const t = await bubble()
    if (C.right.test(t)) { right = true; await p.screenshot({ path: `${OUT}/lang-${lang}-bonne.png` }) } else if (C.wrong.test(t)) wrong = true
  }
  ok(`[${lang}] Encouragement traduit (mauvaise réponse)`, wrong)
  ok(`[${lang}] Félicitations traduites (bonne réponse)`, right)
  for (let i = 0; i < 4; i++) { await p.getByRole('button', { name: C.cont, exact: true }).click().catch(() => {}); await p.waitForTimeout(400) }
  await p.getByRole('button', { name: C.finish }).click(); await p.waitForTimeout(2500)
  ok(`[${lang}] Fin d'étape traduite`, C.end.test(await bubble()), await bubble())
  await p.goto(`${BASE}/labo/mahmoud`); await p.getByText('chargée').waitFor({ timeout: 60000 })
  await p.getByRole('button', { name: C.chat }).click(); await p.waitForTimeout(1500)
  ok(`[${lang}] Démo : suggestion et réponse dans la langue`, await p.getByText(C.chatRe).count() > 0)
  ok(`[${lang}] Aucune erreur JavaScript`, errors.length === 0, errors.join(' | '))
  await ctx.close()
}
await b.close()
for (const r of results) console.log(r.join('  '))
console.log(`\n${results.filter((r) => r[0] === 'OK ').length}/${results.length} réussis`)
