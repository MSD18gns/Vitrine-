import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import SearchBar from '../components/SearchBar'
import ArticleCard from '../components/ArticleCard'
import Icon from '../components/Icon'
import { PageHeader, EmptyState } from '../components/ui'
import { useContent } from '../hooks/useContent'
import { matches } from '../lib/text'
import { SearchX } from 'lucide-react'

export default function Peches() {
  const { categories, articles } = useContent()
  const [cat, setCat] = useState('all')
  const [q, setQ] = useState('')
  const list = useMemo(() => articles.filter((a) => (cat === 'all' || a.cat === cat) && matches(q, a.titre, a.accroche, a.intro)), [articles, cat, q])

  return (
    <>
      <Seo title="Les péchés banalisés" description="Bibliothèque des péchés que beaucoup considèrent comme anodins : le regard, les relations, les réseaux sociaux, la pudeur et le comportement." />
      <PageHeader emoji="👁️" eyebrow="Bibliothèque" title="Les péchés banalisés" subtitle="Ce que beaucoup considèrent comme anodin, expliqué à la lumière du Coran et de la Sunna — avec, pour chaque sujet, un chemin concret pour changer." />
      <div className="container-ad">
        <div className="relative -mt-6"><SearchBar value={q} onChange={setQ} placeholder="Rechercher dans la bibliothèque…" /></div>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="Catégories">
          <button role="tab" aria-selected={cat === 'all'} onClick={() => setCat('all')} className={`chip ${cat === 'all' ? 'chip-active' : ''}`}>Tout ({articles.length})</button>
          {categories.map((c) => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)} className={`chip ${cat === c.id ? 'chip-active' : ''}`}><Icon name={c.icon} size={15} />{c.titre}</button>
          ))}
        </div>

        {cat !== 'all' && (() => {
          const c = categories.find((x) => x.id === cat)
          return c && <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-brand-light p-4"><p className="text-sm text-brand-deep">{c.resume}</p><Link to={`/peches/${c.id}`} className="btn-sm btn-primary shrink-0">Ouvrir</Link></div>
        })()}

        <div className="mt-5 space-y-2.5">
          {list.length ? list.map((a) => <ArticleCard key={a.slug} article={a} />) : <EmptyState icon={SearchX} title="Aucun résultat" text="Essaie un autre mot-clé ou une autre catégorie." />}
        </div>
      </div>
    </>
  )
}
