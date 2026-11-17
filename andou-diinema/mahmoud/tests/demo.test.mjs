// Tests de la démo Mahmoud (Chromium + Playwright) : node mahmoud/tests/demo.test.mjs [url] [dossier-captures]
import { createRequire } from 'module'
const { chromium, devices } = createRequire(import.meta.url)('playwright')
const BASE = process.argv[2] || 'http://127.0.0.1:4173'
const OUT = process.argv[3] || 'mahmoud/preview/shots'
const results = []
const ok = (name, cond, info = '') => { results.push([cond ? 'OK ' : 'ÉCHEC', name, info]); }

const b = await chromium.launch()

// 1) Bureau : chargement 3D, événements, gestes, conversation
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 })
  const p = await ctx.newPage(); const errors = []
  p.on('pageerror', (e) => errors.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errors.push(m.text()) })
  // (le 404 connu vient de la sonde Supabase existante : tables ad_ non installées — hors périmètre Mahmoud)
  const t0 = Date.now()
  await p.goto(`${BASE}/labo/mahmoud`)
  await p.getByText('chargée').waitFor({ timeout: 90000 })
  ok('3D chargée', true, `${((Date.now() - t0) / 1000).toFixed(1)} s (SwiftShader, sans GPU)`)
  ok('robots noindex', (await p.locator('meta[name=robots]').getAttribute('content')).includes('noindex'))
  await p.waitForTimeout(1500)
  ok('Accueil automatique (phrase)', (await p.locator('[aria-live=polite]').first().innerText()).length > 5)
  await p.screenshot({ path: `${OUT}/demo-desktop.png` })
  for (const [label, file] of [['✅ Bonne réponse', 'ev-correct'], ['🤍 Mauvaise réponse', 'ev-wrong'], ['🆘 Demande d\'aide', 'ev-help']]) {
    await p.getByRole('button', { name: label }).click(); await p.waitForTimeout(700)
    await p.locator('section').first().screenshot({ path: `${OUT}/${file}.png` })
  }
  await p.getByRole('button', { name: 'Explication' }).click(); await p.getByRole('button', { name: 'Joie' }).click(); await p.waitForTimeout(900)
  await p.locator('section').first().screenshot({ path: `${OUT}/combo-explain-joie.png` })
  ok('Geste + expression combinés sans erreur', errors.length === 0, errors.join(' | '))
  // conversation locale
  await p.getByLabel('Question pour Mahmoud').fill('Qui es-tu ?'); await p.getByRole('button', { name: 'Envoyer' }).click()
  await p.getByText('Je ne suis ni imam ni savant').first().waitFor({ timeout: 5000 })
  ok('Réponse locale « qui es-tu »', true)
  await p.getByLabel('Question pour Mahmoud').fill('Quelle est la capitale du Pérou ?'); await p.getByRole('button', { name: 'Envoyer' }).click()
  await p.getByText('pas encore relié à une intelligence artificielle').first().waitFor({ timeout: 5000 })
  ok('Question hors sujet → aveu honnête', true)
  // mode calme : un geste de célébration est remplacé
  await p.getByRole('button', { name: /mode calme/ }).click(); await p.getByRole('button', { name: '✅ Bonne réponse' }).click(); await p.waitForTimeout(800)
  ok('Mode calme affiché', await p.getByText('🕊️ Mode calme').isVisible())
  await p.locator('section').first().screenshot({ path: `${OUT}/calme.png` })
  // parole muette (sous-titres + bouche)
  await p.getByRole('button', { name: /Tester la parole/ }).click(); await p.waitForTimeout(600)
  await p.getByRole('button', { name: 'Visage' }).click(); await p.waitForTimeout(400)
  await p.locator('section').first().screenshot({ path: `${OUT}/parole.png` })
  // micro : sans micro dans le conteneur → message clair, pas de plantage
  await p.getByRole('button', { name: 'Parler au micro' }).click(); await p.waitForTimeout(2500)
  const micMsg = await p.locator('[role=alert]').allInnerTexts()
  ok('Micro : démarrage sans plantage (pas de micro dans le conteneur : reconnaissance réelle non testable ici)', errors.length === 0, micMsg.join(' '))
  ok('Aucune erreur console (bureau)', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// 2) Mobile : rendu, pause hors écran, compagnon réduire/ouvrir
{
  const ctx = await b.newContext({ ...devices['iPhone 13'] })
  const p = await ctx.newPage(); const errors = []
  p.on('pageerror', (e) => errors.push(String(e)))
  await p.goto(`${BASE}/labo/mahmoud`)
  await p.getByText('chargée').waitFor({ timeout: 90000 })
  const w = await p.evaluate(() => document.documentElement.scrollWidth)
  ok('Mobile : pas de débordement horizontal', w <= 390, `${w}px`)
  await p.screenshot({ path: `${OUT}/demo-mobile.png` })
  ok('Rendu actif à l\'écran', await p.getByText('actif', { exact: true }).isVisible())
  await p.getByLabel('Question pour Mahmoud').scrollIntoViewIfNeeded(); await p.waitForTimeout(800)
  ok('Rendu en pause hors écran', (await p.getByText('en pause (hors écran)').count()) === 1)
  await p.getByText('Afficher aussi le compagnon').click(); await p.waitForTimeout(4000)
  await p.screenshot({ path: `${OUT}/compagnon-ouvert.png` })
  await p.getByRole('button', { name: 'Réduire Mahmoud' }).click(); await p.waitForTimeout(400)
  ok('Compagnon réduit', await p.getByRole('button', { name: 'Ouvrir Mahmoud' }).isVisible())
  await p.screenshot({ path: `${OUT}/compagnon-reduit.png` })
  await p.getByRole('button', { name: 'Ouvrir Mahmoud' }).click()
  ok('Compagnon rouvert', await p.getByRole('button', { name: 'Réduire Mahmoud' }).isVisible())
  ok('Aucune erreur (mobile)', errors.length === 0, errors.join(' | '))
  await ctx.close()
}

// 3) Sans WebGL : portrait 2D de secours, three.js jamais téléchargé
{
  const ctx = await b.newContext({ viewport: { width: 420, height: 860 } })
  await ctx.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return /webgl/.test(t) ? null : g.call(this, t, ...a) } })
  const p = await ctx.newPage(); const js = []
  p.on('request', (r) => { if (r.url().includes('Mahmoud3D')) js.push(r.url()) })
  await p.goto(`${BASE}/labo/mahmoud`); await p.waitForTimeout(2500)
  ok('Sans WebGL : portrait affiché', await p.getByAltText(/Mahmoud, compagnon/).first().isVisible())
  ok('Sans WebGL : 3D non téléchargée', js.length === 0)
  ok('Sans WebGL : statut correct', await p.getByText('indisponible → portrait 2D').isVisible())
  await p.screenshot({ path: `${OUT}/sans-webgl.png` })
  await ctx.close()
}

// 4) Le reste du site n'a pas changé : la 3D n'est chargée que sur la démo
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } })
  const p = await ctx.newPage(); const js = []
  p.on('request', (r) => { if (/Mahmoud3D|mahmoud\.glb/.test(r.url())) js.push(r.url()) })
  for (const r of ['/', '/parcours', '/parcours/etape/relations', '/peches']) { await p.goto(`${BASE}${r}`); await p.waitForTimeout(800) }
  ok('Pages existantes : aucune ressource Mahmoud chargée', js.length === 0, js.join(','))
  await ctx.close()
}
await b.close()
for (const r of results) console.log(r.join('  '))
console.log(`\n${results.filter((r) => r[0] === 'OK ').length}/${results.length} réussis`)
