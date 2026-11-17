import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import Seo from '../components/Seo'
import { PageHeader, EmptyState, Section } from '../components/ui'
import ArticleCard from '../components/ArticleCard'
import HadithCard from '../components/HadithCard'
import VerseCard from '../components/VerseCard'
import InvocationCard from '../components/InvocationCard'
import { useBookmarks, useProgress } from '../hooks/useProgress'
import { useContent } from '../hooks/useContent'
import { THEMES } from '../content/themes'

const THEME_PATH = { coeur: '/coeur-endurci', pieges: '/pieges-shaytan', consequences: '/consequences', repentir: '/repentir', reconstruction: '/reconstruire' }

export default function Favoris() {
  const { list } = useBookmarks()
  const { isGuest } = useProgress()
  const { article } = useContent()
  const of = (t) => list.filter((b) => b.item_type === t)
  return (
    <>
      <Seo title="Mes favoris" noindex />
      <PageHeader eyebrow="Favoris" title="Mes favoris" subtitle="Les articles, versets, hadiths et invocations que tu as enregistrés." />
      <div className="container-ad max-w-3xl">
        {isGuest && list.length > 0 && <p className="mt-4 text-sm text-slate-600">Enregistrés sur cet appareil. <Link to="/inscription" className="font-semibold text-brand">Crée un compte</Link> pour les retrouver partout.</p>}
        {!list.length && <div className="mt-6"><EmptyState icon={Bookmark} title="Aucun favori pour l'instant" text="Appuie sur l'icône d'enregistrement d'un article, d'un verset, d'un hadith ou d'une invocation pour le retrouver ici." action={<Link to="/decouvrir" className="btn-primary">Découvrir les contenus</Link>} />}</div>}
        {of('article').length > 0 && <Section title="Articles"><div className="space-y-2.5">{of('article').map((b) => article(b.item_id)).filter(Boolean).map((a) => <ArticleCard key={a.slug} article={a} />)}</div></Section>}
        {of('theme').length > 0 && <Section title="Rubriques"><div className="space-y-2.5">{of('theme').filter((b) => THEMES[b.item_id]).map((b) => <Link key={b.item_id} to={THEME_PATH[b.item_id]} className="card block p-4 font-semibold text-slate-900 hover:shadow-lg">{THEMES[b.item_id].titre}</Link>)}</div></Section>}
        {of('verset').length > 0 && <Section title="Versets"><div className="space-y-3">{of('verset').map((b) => <VerseCard key={b.item_id} id={b.item_id} />)}</div></Section>}
        {of('hadith').length > 0 && <Section title="Hadiths"><div className="space-y-3">{of('hadith').map((b) => <HadithCard key={b.item_id} id={b.item_id} compact />)}</div></Section>}
        {of('invocation').length > 0 && <Section title="Invocations"><div className="space-y-3">{of('invocation').map((b) => <InvocationCard key={b.item_id} id={b.item_id} />)}</div></Section>}
      </div>
    </>
  )
}
