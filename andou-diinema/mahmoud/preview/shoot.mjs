// Captures de contrôle : node mahmoud/preview/shoot.mjs '[["nom","view=face&morph=Smile:1"]]' dossier
import { createRequire } from 'module'
const { chromium } = createRequire(import.meta.url)('playwright')
const shots = JSON.parse(process.argv[2]); const out = process.argv[3]
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 640, height: 800 } })
p.on('console', (m) => { if (m.type() === 'error') console.log('ERR', m.text()) })
for (const [name, qs] of shots) {
  await p.goto(`http://localhost:8765/mahmoud/preview/viewer.html?${qs}`)
  await p.waitForFunction(() => window.READY, null, { timeout: 90000 })
  const err = await p.evaluate(() => window.ERR); if (err) console.log('LOAD ERR', err)
  if (name === 'info') console.log(JSON.stringify(await p.evaluate(() => window.INFO)))
  await p.locator('canvas').screenshot({ path: `${out}/${name}.png` })
}
await b.close()
