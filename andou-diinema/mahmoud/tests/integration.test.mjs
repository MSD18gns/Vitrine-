// Mahmoud intégré au site : node mahmoud/tests/integration.test.mjs [url] [dossier-captures]
import { createRequire } from 'module'
const { chromium, devices } = createRequire(import.meta.url)('playwright')
const BASE = process.argv[2] || 'http://127.0.0.1:4173'
const OUT = process.argv[3] || 'mahmoud/preview/shots'
const results = []
const ok = (name, cond, info = '') => results.push([cond ? 'OK ' : 'ÉCHEC', name, info])
const IGNORE = /status of 404|ad_/   // sonde Supabase connue (tables ad_ non installées)

const b = await chromium.launch()
for (const [label, ctxOpts] of [['mobile', { ...devices['iPhone 13'] }], ['bureau', { viewport: { width: 1280, height: 860 } }]]) {
  const ctx = await b.newContext(ctxOpts)
  const p = await ctx.newPage(); const errors = []
  p.on('pageerror', (e) => errors.push(String(e)))
  p.on('console', (m) => { if (m.type() === 'error' && !IGNORE.test(m.text())) errors.push(m.text()) })
  const bubble = () => p.locator('aside[aria-label="Mahmoud, compagnon"] [aria-live=polite]').innerText().catch(() => '')

  // Accueil : apparition + bienvenue
  await p.goto(`${BASE}/`)
  await p.locator('aside[aria-label="Mahmoud, compagnon"]').waitFor({ timeout: 20000 })
  await p.waitForTimeout(4500)
  const hello = await bubble()
  ok(`[${label}] Accueil : Mahmoud affiché et souhaite la bienvenue`, /Assalamou|Content de te revoir/.test(hello), hello)
  await p.screenshot({ path: `${OUT}/integ-${label}-accueil.png` })
  const w = await p.evaluate(() => document.documentElement.scrollWidth)
  ok(`[${label}] Accueil : pas de débordement horizontal`, w <= (ctxOpts.viewport?.width || 390), `${w}px`)
  // toucher Mahmoud → aide
  await p.getByRole('button', { name: "Demander de l'aide à Mahmoud" }).click(); await p.waitForTimeout(600)
  ok(`[${label}] Toucher Mahmoud → proposition d'aide`, /aide|bloque/i.test(await bubble()))

  if (label === 'mobile') { await p.waitForTimeout(7500); await p.screenshot({ path: `${OUT}/integ-mobile-accueil-repos.png` }) }
  // Parcours
  await p.goto(`${BASE}/parcours`); await p.waitForTimeout(1500)
  const rules = p.getByRole('button', { name: 'Fermer', exact: true }).first()
  if (await rules.isVisible().catch(() => false)) await rules.click()
  ok(`[${label}] Parcours : Mahmoud présent`, await p.locator('aside[aria-label="Mahmoud, compagnon"]').first().isVisible())
  await p.screenshot({ path: `${OUT}/integ-${label}-parcours.png` })

  // Étape complète
  await p.goto(`${BASE}/parcours/etape/banalisation`); await p.waitForTimeout(3500)
  ok(`[${label}] Étape : début de leçon`, /commence|étape|Installe/i.test(await bubble()), await bubble())
  await p.screenshot({ path: `${OUT}/integ-${label}-lecon.png` })
  const bar = await p.locator('#etape-actions').boundingBox(); const dock = await p.locator('aside[aria-label="Mahmoud, compagnon"]').boundingBox()
  ok(`[${label}] Étape : Mahmoud ne recouvre pas la barre d'action`, dock && bar && dock.y + dock.height <= bar.y + 1, `dock bas=${dock && Math.round(dock.y + dock.height)} barre haut=${bar && Math.round(bar.y)}`)
  const cont = () => p.getByRole('button', { name: 'Continuer', exact: true }).click()
  await cont(); await p.waitForTimeout(800)   // verset
  ok(`[${label}] Verset : affichage sans erreur (mode calme vérifié dans la démo)`, errors.length === 0)
  await p.screenshot({ path: `${OUT}/integ-${label}-verset.png` })
  await cont(); await p.waitForTimeout(500)   // hadith
  await cont(); await p.waitForTimeout(800)   // quiz
  const radios = p.getByRole('radio'); const n = await radios.count()
  let wrongSeen = false, rightSeen = false
  for (let i = 0; i < n && !rightSeen; i++) {
    await radios.nth(i).click(); await p.getByRole('button', { name: 'Vérifier' }).click(); await p.waitForTimeout(900)
    const t = await bubble()
    if (/Bravo|Excellente|Bien vu/.test(t)) { rightSeen = true; await p.screenshot({ path: `${OUT}/integ-${label}-bonne.png` }) }
    else if (/grave|Pas tout à fait|pénalité/.test(t)) { if (!wrongSeen) await p.screenshot({ path: `${OUT}/integ-${label}-mauvaise.png` }); wrongSeen = true }
  }
  ok(`[${label}] Quiz : encouragement sur mauvaise réponse`, wrongSeen || n <= 1, wrongSeen ? '' : '(bonne réponse trouvée du premier coup)')
  ok(`[${label}] Quiz : félicitations sur bonne réponse`, rightSeen)
  const bar2 = await p.locator('#etape-actions').boundingBox(); const dock2 = await p.locator('aside[aria-label="Mahmoud, compagnon"]').boundingBox()
  ok(`[${label}] Quiz : Mahmoud remonte au-dessus du message de réponse`, dock2 && bar2 && dock2.y + dock2.height <= bar2.y + 1)
  for (let i = 0; i < 4; i++) { await cont().catch(() => {}); await p.waitForTimeout(400) }
  await p.getByRole('button', { name: /Terminer cette étape/ }).click(); await p.waitForTimeout(2500)
  ok(`[${label}] Fin d'étape : félicitations`, /terminée|sommet/i.test(await bubble()), await bubble())
  await p.screenshot({ path: `${OUT}/integ-${label}-fin.png` })

  // réduire / ouvrir, puis masquer depuis le Profil
  await p.goto(`${BASE}/`); await p.waitForTimeout(3000)
  const peek = p.getByRole('button', { name: 'Parler à Mahmoud' })
  if (label === 'mobile') {
    ok('[mobile] Au repos, Mahmoud est rangé en médaillon (ne cache pas la page)', await peek.isVisible())
    await peek.click(); await p.waitForTimeout(700)
    ok('[mobile] Toucher le médaillon → Mahmoud s\'agrandit et propose son aide', /aide|bloque/i.test(await bubble()))
    await p.screenshot({ path: `${OUT}/integ-mobile-medaillon-ouvert.png` })
  }
  await p.getByRole('button', { name: 'Réduire Mahmoud' }).click()
  ok(`[${label}] Réduire`, await p.getByRole('button', { name: 'Ouvrir Mahmoud' }).isVisible())
  await p.getByRole('button', { name: 'Ouvrir Mahmoud' }).click()
  await p.waitForTimeout(500)
  ok(`[${label}] Rouvrir`, await p.getByRole('button', { name: 'Réduire Mahmoud' }).isVisible())
  await p.goto(`${BASE}/profil`); await p.waitForTimeout(1200)
  await p.getByText('Mahmoud, compagnon 3D').click(); await p.goto(`${BASE}/`); await p.waitForTimeout(3000)
  ok(`[${label}] Profil : Mahmoud masqué partout`, (await p.locator('aside[aria-label="Mahmoud, compagnon"]').count()) === 0)
  await p.goto(`${BASE}/profil`); await p.waitForTimeout(800); await p.getByText('Mahmoud, compagnon 3D').click()
  // pages sans Mahmoud
  await p.goto(`${BASE}/hadiths`); await p.waitForTimeout(2500)
  ok(`[${label}] Pages de lecture (hadiths) : pas de Mahmoud`, (await p.locator('aside[aria-label="Mahmoud, compagnon"]').count()) === 0)
  ok(`[${label}] Aucune erreur JavaScript`, errors.length === 0, errors.slice(0, 3).join(' | '))
  await ctx.close()
}
await b.close()
for (const r of results) console.log(r.join('  '))
console.log(`\n${results.filter((r) => r[0] === 'OK ').length}/${results.length} réussis`)
