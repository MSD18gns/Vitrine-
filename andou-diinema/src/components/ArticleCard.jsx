import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import BookmarkButton from './BookmarkButton'
import { useContent } from '../hooks/useContent'
import Icon from './Icon'

export default function ArticleCard({ article, variant = 'row' }) {
  const { category } = useContent()
  const cat = category(article.cat)
  if (variant === 'tile') {
    return (
      <Link to={`/article/${article.slug}`} className="card group flex h-full flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${cat?.couleur || 'from-emerald-600 to-emerald-800'} text-white`}><Icon name={cat?.icon} size={19} /></span>
          <BookmarkButton type="article" id={article.slug} />
        </div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand">{cat?.titre}</p>
        <h3 className="mb-1.5 font-semibold leading-snug text-slate-900 group-hover:text-brand-deep">{article.titre}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{article.accroche}</p>
      </Link>
    )
  }
  return (
    <Link to={`/article/${article.slug}`} className="card group flex items-center gap-3 p-3.5 transition hover:shadow-lg">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${cat?.couleur || 'from-emerald-600 to-emerald-800'} text-white`}><Icon name={cat?.icon} size={20} /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold leading-snug text-slate-900 group-hover:text-brand-deep">{article.titre}</span>
        <span className="mt-0.5 line-clamp-1 block text-sm text-slate-500">{article.accroche}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-slate-400" />
    </Link>
  )
}
