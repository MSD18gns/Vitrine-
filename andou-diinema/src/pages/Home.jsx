import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight, Route, Eye, LifeBuoy, ChevronRight, CalendarCheck } from 'lucide-react'
import Seo from '../components/Seo'
import ArticleCard from '../components/ArticleCard'
import ReminderCard from '../components/ReminderCard'
import HadithCard from '../components/HadithCard'
import Icon from '../components/Icon'
import { Section } from '../components/ui'
import { useContent } from '../hooks/useContent'
import { PHASES } from '../content/programme'
import { SECTIONS } from '../content/sections'
import { topArticles } from '../services/articles'
import { dayOfYear, hijriToday } from '../lib/dates'

const POPULAIRES = ['pornographie', 'scrolling', 'medisance', 'relations-amoureuses', 'regard-desir', 'negligence-reseaux']
const HADITH_JOUR = ['peches-meprises', 'repentants', 'point-noir', 'main-tendue', 'regularite', 'laisse-pour-allah', 'montagne', 'joie-repentir', 'deux-bienfaits', 'bien-ou-silence']

export default function Home() {
  const { articles, article, categories } = useContent()
  const [top, setTop] = useState([])
  useEffect(() => { topArticles(6).then(setTop) }, [])

  const sujet = articles[dayOfYear() % articles.length]
  const populaires = (top.length >= 3 ? top.map((t) => t.slug) : POPULAIRES).map(article).filter(Boolean).slice(0, 4)
  const derniers = [...articles].filter((a) => a.published_at).sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, 4)
  const recents = derniers.length ? derniers : articles.slice(-4).reverse()
  const hadith = HADITH_JOUR[dayOfYear() % HADITH_JOUR.length]

  return (
    <>
      <Seo />
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-brand-mist">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-light blur-2xl" aria-hidden="true" />
        <div className="container-ad relative pb-10 pt-8 sm:pb-16 sm:pt-14">
          <p className="eyebrow mb-3 fade-up">ANDOU DIINEMA · {hijriToday()}</p>
          <h1 className="fade-up font-display text-[34px] font-bold leading-[1.12] text-brand-deep sm:text-5xl">
            Ce que tu banalises aujourd'hui peut éloigner ton cœur d'Allah demain.
          </h1>
          <p className="fade-up mt-5 max-w-2xl text-[16.5px] leading-relaxed text-slate-600">
            Certaines habitudes semblent innocentes. Certains comportements deviennent normaux avec le temps. Pourtant, ils peuvent avoir des conséquences sur notre foi et notre relation avec Allah. Découvre ces dangers, comprends-les et commence à changer.
          </p>
          <div className="fade-up mt-7 grid gap-3 sm:flex">
            <Link to="/programme" className="btn-primary"><Route size={19} />Commencer mon parcours</Link>
            <Link to="/peches" className="btn-ghost"><Eye size={19} />Découvrir les dangers</Link>
            <Link to="/sortir-des-peches" className="btn-secondary"><LifeBuoy size={19} />Apprendre à changer</Link>
          </div>
          <p className="mt-6 font-display text-[15px] italic text-brand">« Ouvre les yeux, purifie ton cœur et rapproche-toi d'Allah. »</p>
        </div>
      </section>

      <div className="container-ad">
        {/* SUJET DU JOUR */}
        <Section title="Le sujet du jour" className="mt-4">
          <Link to={`/article/${sujet.slug}`} className="group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-brand-deep to-brand p-6 text-white shadow-card">
            <div className="pattern-islamic absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-emerald-100">{categories.find((c) => c.id === sujet.cat)?.titre}</p>
              <h3 className="font-display text-2xl font-bold">{sujet.titre}</h3>
              <p className="mt-2 text-emerald-50/90">{sujet.accroche}</p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-deep">Lire l'article <ArrowRight size={16} className="transition group-hover:translate-x-0.5" /></span>
            </div>
          </Link>
        </Section>

        {/* CONSEILS */}
        <Section title="Conseils quotidiens">
          <div className="grid gap-3 sm:grid-cols-2"><ReminderCard /><ReminderCard offset={7} /></div>
          <Link to="/bilan" className="card mt-3 flex items-center gap-3 p-4 hover:shadow-lg">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-deep text-white"><CalendarCheck size={21} /></span>
            <span className="flex-1"><span className="block font-semibold text-slate-900">Fais le bilan de ta journée</span><span className="text-sm text-slate-500">7 questions pour avancer, sans culpabiliser</span></span>
            <ChevronRight size={18} className="text-slate-400" />
          </Link>
        </Section>

        {/* POPULAIRES */}
        <Section title="Les dangers les plus consultés" action={<Link to="/peches" className="text-sm font-semibold text-brand">Tout voir</Link>}>
          <div className="grid gap-3 sm:grid-cols-2">{populaires.map((a) => <ArticleCard key={a.slug} article={a} variant="tile" />)}</div>
        </Section>

        {/* 6 ÉTAPES */}
        <Section title="Les six grandes étapes de transformation">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((ph) => (
              <li key={ph.id} className="card flex gap-3 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-light font-bold text-brand-deep">{ph.id}</span>
                <span><span className="block font-semibold text-slate-900">{ph.titre}</span><span className="text-sm text-slate-600">Jours {ph.jours[0]} à {ph.jours[1]} — {ph.texte}</span></span>
              </li>
            ))}
          </ol>
          <Link to="/programme" className="btn-primary mt-4 w-full sm:w-auto">Commencer le programme de 30 jours <ArrowRight size={18} /></Link>
        </Section>

        {/* HADITH DU JOUR */}
        <Section title="Le hadith du jour"><HadithCard id={hadith} /></Section>

        {/* DERNIERS ARTICLES */}
        <Section title="Derniers articles">
          <div className="space-y-2.5">{recents.map((a) => <ArticleCard key={a.slug} article={a} />)}</div>
        </Section>

        {/* EXPLORER */}
        <Section title="Explorer ANDOU DIINEMA">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {SECTIONS.map((s) => (
              <Link key={s.to} to={s.to} className="card flex flex-col gap-2 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand-deep"><Icon name={s.icon} size={20} /></span>
                <span className="font-semibold leading-snug text-slate-900">{s.titre}</span>
                <span className="text-xs text-slate-500">{s.texte}</span>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </>
  )
}
