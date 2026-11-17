import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SearchX, ScrollText, HandHeart, BookOpen } from 'lucide-react'
import Seo from '../components/Seo'
import SearchBar from '../components/SearchBar'
import ArticleCard from '../components/ArticleCard'
import { EmptyState, Section } from '../components/ui'
import { useContent } from '../hooks/useContent'
import { THEMES } from '../content/themes'
import { verseRef } from '../content/sources'
import { matches } from '../lib/text'

const THEME_PATH = { coeur: '/coeur-endurci', pieges: '/pieges-shaytan', consequences: '/consequences', repentir: '/repentir', reconstruction: '/reconstruire' }
const SUGGESTIONS = ['regard', 'repentir', 'réseaux sociaux', 'colère', 'médisance', 'parents', 'hijab', 'prière']

export default function Recherche() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const setQ = (v) => setParams(v ? { q: v } : {}, { replace: true })
  const { articles, hadiths, invocations, versets } = useContent()
  const r = useMemo(() => {
    if (q.trim().length < 2) return null
    return {
      articles: articles.filter((a) => matches(q, a.titre, a.accroche, a.intro, a.explication)),
      themes: Object.entries(THEMES).flatMap(([k, t]) => t.items.filter((i) => matches(q, i.titre, i.texte)).map((i) => ({ k, t, i }))),
      hadiths: Object.entries(hadiths).filter(([, h]) => matches(q, h.fr, h.contexte)).slice(0, 8),
      versets: Object.entries(versets).filter(([, v]) => matches(q, v.fr, v.sourate)).slice(0, 8),
      invocations: Object.entries(invocations).filter(([, d]) => matches(q, d.titre, d.fr, d.theme)),
    }
  }, [q, articles, hadiths, invocations, versets])
  const total = r ? Object.values(r).reduce((s, x) => s + x.length, 0) : 0

  return (
    <div className="container-ad max-w-3xl pt-5">
      <Seo title={q ? `Recherche : ${q}` : 'Recherche'} noindex />
      <h1 className="sr-only">Recherche</h1>
      <SearchBar value={q} onChange={setQ} autoFocus />
      {!r && <div className="mt-6"><p className="mb-3 text-sm font-medium text-slate-600">Suggestions</p><div className="flex flex-wrap gap-2">{SUGGESTIONS.map((s) => <button key={s} onClick={() => setQ(s)} className="chip">{s}</button>)}</div></div>}
      {r && <p className="mt-4 text-sm text-slate-500" aria-live="polite">{total} résultat(s) pour « {q} »</p>}
      {r && total === 0 && <div className="mt-4"><EmptyState icon={SearchX} title="Aucun résultat" text="Essaie un autre mot, sans accent ou au singulier." /></div>}
      {r?.articles.length > 0 && <Section title="Articles"><div className="space-y-2.5">{r.articles.map((a) => <ArticleCard key={a.slug} article={a} />)}</div></Section>}
      {r?.themes.length > 0 && <Section title="Dans les rubriques"><div className="space-y-2.5">{r.themes.map(({ k, t, i }) => <Link key={k + i.titre} to={THEME_PATH[k]} className="card block p-4 hover:shadow-lg"><span className="eyebrow">{t.titre}</span><span className="block font-semibold text-slate-900">{i.titre}</span><span className="line-clamp-2 text-sm text-slate-600">{i.texte}</span></Link>)}</div></Section>}
      {r?.versets.length > 0 && <Section title="Versets"><div className="space-y-2.5">{r.versets.map(([id, v]) => <div key={id} className="card flex gap-3 p-4"><BookOpen size={18} className="mt-0.5 shrink-0 text-brand" /><span><span className="block text-sm font-semibold text-brand-deep">{verseRef(v)}</span><span className="line-clamp-3 text-sm text-slate-700">{v.fr}</span></span></div>)}</div></Section>}
      {r?.hadiths.length > 0 && <Section title="Hadiths" action={<Link to="/hadiths" className="text-sm font-semibold text-brand">Tous</Link>}><div className="space-y-2.5">{r.hadiths.map(([id, h]) => <div key={id} className="card flex gap-3 p-4"><ScrollText size={18} className="mt-0.5 shrink-0 text-brand" /><span><span className="line-clamp-3 text-sm text-slate-700">« {h.fr} »</span><span className="mt-1 block text-xs font-semibold text-brand-deep">{h.ref}</span></span></div>)}</div></Section>}
      {r?.invocations.length > 0 && <Section title="Invocations" action={<Link to="/invocations" className="text-sm font-semibold text-brand">Toutes</Link>}><div className="space-y-2.5">{r.invocations.map(([id, d]) => <Link key={id} to="/invocations" className="card flex gap-3 p-4 hover:shadow-lg"><HandHeart size={18} className="mt-0.5 shrink-0 text-brand" /><span><span className="block font-semibold text-slate-900">{d.titre}</span><span className="line-clamp-2 text-sm text-slate-600">{d.fr}</span></span></Link>)}</div></Section>}
    </div>
  )
}
