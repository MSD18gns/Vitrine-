import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Target, ArrowRight, Scale } from 'lucide-react'
import Seo from '../components/Seo'
import BookmarkButton from '../components/BookmarkButton'
import ShareButton from '../components/ShareButton'
import ValidationBadge from '../components/ValidationBadge'
import Sources from '../components/Sources'
import InvocationCard from '../components/InvocationCard'
import ArticleCard from '../components/ArticleCard'
import { useContent } from '../hooks/useContent'
import { countView } from '../services/articles'
import NotFound from './NotFound'

const Part = ({ n, title, children }) => (
  <section className="mt-8">
    <h2 className="mb-3 flex items-center gap-2.5 text-lg font-bold text-brand-deep sm:text-xl">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-light text-sm text-brand-deep">{n}</span>{title}
    </h2>
    {children}
  </section>
)
const List = ({ items, ordered }) => {
  const T = ordered ? 'ol' : 'ul'
  return <T className="space-y-2">{items.map((x, i) => <li key={i} className="card flex gap-3 p-3.5 text-[15px] leading-relaxed text-slate-700"><span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-light text-xs font-bold text-brand-deep">{ordered ? i + 1 : '•'}</span><span>{x}</span></li>)}</T>
}

export default function Article() {
  const { slug } = useParams()
  const { article, category, byCategory, isValidated } = useContent()
  const a = article(slug)
  useEffect(() => { if (a) countView(a.slug) }, [a])
  if (!a) return <NotFound />
  const cat = category(a.cat)
  const autres = byCategory(a.cat).filter((x) => x.slug !== a.slug).slice(0, 3)

  return (
    <article>
      <Seo title={a.titre} description={`${a.accroche} ${a.intro}`.slice(0, 160)} />
      {/* 1. Titre */}
      <header className="relative overflow-hidden bg-gradient-to-br from-brand-deep to-brand text-white">
        <div className="pattern-islamic absolute inset-0" aria-hidden="true" />
        <div className="container-ad relative py-8 sm:py-12">
          <Link to={`/peches/${a.cat}`} className="mb-3 inline-flex min-h-[40px] items-center text-sm font-medium text-emerald-100 hover:text-white">← {cat?.titre || 'Bibliothèque'}</Link>
          <h1 className="font-display text-[30px] font-bold leading-tight text-white sm:text-4xl">{a.titre}</h1>
          <p className="mt-3 text-lg text-emerald-50">{a.accroche}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ValidationBadge validated={isValidated('article', a.slug)} light />
            {a.hukm && <span className="badge bg-white/15 text-white"><Scale size={14} />{a.hukm}</span>}
          </div>
        </div>
      </header>

      <div className="container-ad max-w-3xl">
        <div className="-mt-5 relative flex justify-end gap-1 rounded-2xl bg-white p-1 shadow-card">
          <BookmarkButton type="article" id={a.slug} label />
          <ShareButton title={a.titre} text={a.accroche} />
        </div>

        {/* 2. Introduction */}
        <p className="mt-6 text-[17px] font-medium leading-relaxed text-slate-800">{a.intro}</p>
        {/* 3. Explication */}
        <Part n={1} title="De quoi parle-t-on ?"><p className="leading-relaxed text-slate-700">{a.explication}</p></Part>
        {/* 4. Danger */}
        <Part n={2} title="Pourquoi est-ce dangereux ?"><div className="rounded-2xl bg-amber-50 p-4 leading-relaxed text-amber-950 ring-1 ring-amber-200">{a.danger}</div></Part>
        {/* 5 & 6. Références */}
        <Part n={3} title="Ce que disent le Coran et la Sunna"><Sources versets={a.versets} hadiths={a.hadiths} /></Part>
        {/* 7. Explication accessible */}
        <Part n={4} title="Comprendre simplement"><p className="leading-relaxed text-slate-700">{a.comprendre}</p></Part>
        {/* 8. Installation */}
        <Part n={5} title="Comment cette habitude s'installe"><p className="leading-relaxed text-slate-700">{a.installation}</p></Part>
        {/* 9. Conséquences */}
        <Part n={6} title="Les conséquences spirituelles et comportementales"><List items={a.consequences} /></Part>
        {/* 10. Reconnaître */}
        <Part n={7} title="Comment reconnaître cette habitude"><List items={a.signes} /></Part>
        {/* 11. Abandonner */}
        <Part n={8} title="Comment l'abandonner"><List items={a.abandon} ordered /></Part>
        {/* 12. Plan d'action */}
        <Part n={9} title="Ton plan d'action concret">
          <List items={a.plan} ordered />
          <Link to="/programme" className="btn-secondary mt-3 w-full"><Target size={18} />Suivre le programme de 30 jours</Link>
        </Part>
        {/* 13. Invocation */}
        {a.invocation && <Part n={10} title="Une invocation adaptée"><InvocationCard id={a.invocation} /></Part>}
        {/* 14. Encouragement */}
        <section className="mt-8 rounded-3xl bg-gradient-to-br from-brand-light to-white p-5 ring-1 ring-brand/15">
          <p className="eyebrow mb-2">Message d'encouragement</p>
          <p className="font-display text-[17px] leading-relaxed text-brand-deep">{a.encouragement}</p>
          <Link to="/repentir" className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-brand">Comment se repentir <ArrowRight size={17} /></Link>
        </section>

        <p className="mt-6 text-xs leading-relaxed text-slate-500">Les références sont fournies pour vérification. Pour une question personnelle de jurisprudence, consulte un imam ou une personne de science.</p>

        {autres.length > 0 && <section className="mt-10"><h2 className="mb-3 text-lg font-bold">Dans la même catégorie</h2><div className="space-y-2.5">{autres.map((x) => <ArticleCard key={x.slug} article={x} />)}</div></section>}
      </div>
    </article>
  )
}
