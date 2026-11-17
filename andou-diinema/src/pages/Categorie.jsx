import { useParams, Link } from 'react-router-dom'
import Seo from '../components/Seo'
import ArticleCard from '../components/ArticleCard'
import { PageHeader } from '../components/ui'
import { useContent } from '../hooks/useContent'
import NotFound from './NotFound'

export default function Categorie() {
  const { cat } = useParams()
  const { category, byCategory, categories } = useContent()
  const c = category(cat)
  if (!c) return <NotFound />
  const list = byCategory(cat)
  return (
    <>
      <Seo title={`${c.titre} — péchés banalisés`} description={c.resume} />
      <PageHeader back={['/peches', 'Bibliothèque']} eyebrow={`Catégorie ${c.lettre}`} title={c.titre} subtitle={c.resume} />
      <div className="container-ad mt-6">
        {cat === 'pudeur' && (
          <Link to="/article/prescriptions-vestimentaires" className="card mb-4 block border-l-4 border-brand p-4 hover:shadow-lg">
            <p className="eyebrow mb-1">À lire en premier</p>
            <p className="font-semibold text-slate-900">Les prescriptions vestimentaires des hommes et des femmes, avec leurs références</p>
          </Link>
        )}
        <div className="space-y-2.5">{list.map((a) => <ArticleCard key={a.slug} article={a} />)}</div>
        <h2 className="mb-3 mt-10 text-lg font-semibold">Autres catégories</h2>
        <div className="flex flex-wrap gap-2">{categories.filter((x) => x.id !== cat).map((x) => <Link key={x.id} to={`/peches/${x.id}`} className="chip">{x.titre}</Link>)}</div>
      </div>
    </>
  )
}
