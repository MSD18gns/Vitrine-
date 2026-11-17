import { Link } from 'react-router-dom'
import { ScrollText, HandHeart, CalendarCheck } from 'lucide-react'
import Seo from '../components/Seo'
import SearchBar from '../components/SearchBar'
import Icon from '../components/Icon'
import { PageHeader, Section } from '../components/ui'
import { SECTIONS } from '../content/sections'
import { useContent } from '../hooks/useContent'

export default function Decouvrir() {
  const { categories, byCategory } = useContent()
  return (
    <>
      <Seo title="Découvrir" description="Explore les péchés banalisés, les maladies du cœur, les pièges de Shaytan, le repentir et les méthodes pour changer." />
      <PageHeader emoji="🧭" eyebrow="Découvrir" title="Ouvre les yeux sur ce que l'on banalise" subtitle="Explore les sujets, comprends les dangers et trouve un chemin concret pour revenir vers Allah." />
      <div className="container-ad">
        <div className="-mt-6 relative"><SearchBar navigateOnSubmit /></div>

        <Section title="Les péchés banalisés" action={<Link to="/peches" className="text-sm font-semibold text-brand">Bibliothèque</Link>}>
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
            {categories.map((c) => (
              <Link key={c.id} to={`/peches/${c.id}`} className={`relative flex w-[42%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${c.couleur} p-4 text-white shadow-card sm:w-auto`} style={{ minHeight: 150 }}>
                <span className="pattern-islamic absolute inset-0" aria-hidden="true" />
                <Icon name={c.icon} size={24} className="relative" />
                <span className="relative">
                  <span className="block text-xs font-semibold opacity-80">Catégorie {c.lettre}</span>
                  <span className="block font-semibold leading-snug">{c.titre}</span>
                  <span className="text-xs opacity-80">{byCategory(c.id).length} sujets</span>
                </span>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Toutes les rubriques">
          <div className="grid gap-3 sm:grid-cols-2">
            {SECTIONS.map((s) => (
              <Link key={s.to} to={s.to} className="card flex items-center gap-3 p-4 hover:shadow-lg">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-light text-brand-deep"><Icon name={s.icon} size={21} /></span>
                <span><span className="block font-semibold text-slate-900">{s.titre}</span><span className="text-sm text-slate-500">{s.texte}</span></span>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Ressources">
          <div className="grid gap-3 sm:grid-cols-3">
            {[['/hadiths', 'Hadiths authentiques', 'Avec références et contexte', ScrollText], ['/invocations', 'Invocations', 'Arabe, phonétique, traduction', HandHeart], ['/bilan', 'Bilan quotidien', 'Fais le point chaque soir', CalendarCheck]].map(([to, t, d, I]) => (
              <Link key={to} to={to} className="card flex items-center gap-3 p-4 hover:shadow-lg">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-deep text-white"><I size={20} /></span>
                <span><span className="block font-semibold text-slate-900">{t}</span><span className="text-sm text-slate-500">{d}</span></span>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </>
  )
}
