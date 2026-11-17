// Génère public/sitemap.xml et public/robots.txt (URL du site : VITE_SITE_URL)
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { ARTICLES, CATEGORIES } from '../src/content/peches.js'

let site = process.env.VITE_SITE_URL
if (!site && existsSync('.env.local')) site = readFileSync('.env.local', 'utf8').match(/^VITE_SITE_URL=(.*)$/m)?.[1]
site = (site || 'https://andou-diinema.vercel.app').trim().replace(/\/$/, '')

const pages = ['/', '/decouvrir', '/peches', '/coeur-endurci', '/pieges-shaytan', '/consequences', '/sortir-des-peches', '/repentir', '/reconstruire', '/programme', '/hadiths', '/invocations', '/a-propos', '/contact', '/confidentialite', '/conditions',
  ...CATEGORIES.map((c) => `/peches/${c.id}`), ...ARTICLES.map((a) => `/article/${a.slug}`), ...Array.from({ length: 30 }, (_, i) => `/programme/jour/${i + 1}`)]
const today = new Date().toISOString().slice(0, 10)
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${site}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`)
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /profil\nDisallow: /parcours\nDisallow: /bilan\nDisallow: /favoris\nDisallow: /connexion\nDisallow: /inscription\n\nSitemap: ${site}/sitemap.xml\n`)
console.log(`sitemap.xml : ${pages.length} pages (${site})`)
