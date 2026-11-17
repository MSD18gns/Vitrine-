import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowRight, ChevronRight, CalendarCheck, Flame, Gem, Play, Sparkles, Activity, Trophy } from 'lucide-react'
import Seo from '../components/Seo'
import ArticleCard from '../components/ArticleCard'
import ReminderCard from '../components/ReminderCard'
import HadithCard from '../components/HadithCard'
import Icon from '../components/Icon'
import { DailyGoal } from '../components/StatsBar'
import { Lantern } from '../components/Illustrations'
import { iconFor } from '../components/stepIcons'
import { Section } from '../components/ui'
import { useContent } from '../hooks/useContent'
import { useAuth } from '../hooks/useAuth'
import { useJourney } from '../hooks/useJourney'
import { CHAPITRES, ETAPES, etapeById } from '../content/parcours'
import { SECTIONS } from '../content/sections'
import { topArticles } from '../services/articles'
import { messageSerie } from '../services/gamification'
import { dayOfYear, hijriToday } from '../lib/dates'

const POPULAIRES = ['pornographie', 'scrolling', 'medisance', 'relations-amoureuses']
const HADITH_JOUR = ['peches-meprises', 'repentants', 'point-noir', 'main-tendue', 'regularite', 'laisse-pour-allah', 'montagne', 'joie-repentir', 'deux-bienfaits', 'bien-ou-silence']

function salutation() {
  const h = new Date().getHours()
  return h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'
}

export default function Home() {
  const { articles, article, categories } = useContent()
  const { profile, user } = useAuth()
  const { stats, courante, prefs, loading } = useJourney()
  const [top, setTop] = useState([])
  useEffect(() => { topArticles(6).then(setTop) }, [])

  const next = etapeById(courante) || ETAPES[0]
  const chap = CHAPITRES.find((c) => c.id === next.chap)
  const NextIcon = iconFor(next.icon)
  const name = profile?.display_name || (user?.email ? user.email.split('@')[0] : '')
  const debutant = stats.etapesFaites === 0
  const populaires = (top.length >= 3 ? top.map((t) => t.slug) : POPULAIRES).map(article).filter(Boolean).slice(0, 4)
  const sujet = articles[dayOfYear() % articles.length]
  const pctTotal = Math.round((stats.etapesFaites / ETAPES.length) * 100)

  return (
    <>
      <Seo />
      {/* ACCUEIL PERSONNALISÉ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-deep via-[#0a6c4c] to-brand text-white">
        <div className="pattern-islamic absolute inset-0" aria-hidden="true" />
        <div className="container-ad relative pb-8 pt-6 sm:pb-12 sm:pt-10">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-emerald-100">{hijriToday()}</p>
              <h1 className="mt-2 font-display text-[28px] font-bold leading-tight text-white sm:text-4xl">
                {salutation()}{name ? `, ${name}` : ''} 👋
              </h1>
              <p className="mt-2 text-[15.5px] text-emerald-50/90">{debutant ? "Ce que tu banalises aujourd'hui peut éloigner ton cœur d'Allah demain. Commence ton chemin, une étape à la fois." : messageSerie(stats)}</p>
            </div>
            <Lantern className="bob h-28 w-24 shrink-0 sm:h-36 sm:w-32" />
          </div>

          {!prefs.sobre && !loading && (
            <div className="mt-5 grid grid-cols-3 gap-2">
              <Link to="/recompenses" className="tap rounded-2xl bg-white/12 p-3 ring-1 ring-white/15" style={{ background: 'rgba(255,255,255,.1)' }}><p className="flex items-center gap-1 text-lg font-extrabold"><Flame size={18} className="fill-orange-300 text-orange-300" />{stats.serie}</p><p className="text-[11px] text-emerald-100">jour{stats.serie > 1 ? 's' : ''} de suite</p></Link>
              <Link to="/recompenses" className="tap rounded-2xl p-3 ring-1 ring-white/15" style={{ background: 'rgba(255,255,255,.1)' }}><p className="flex items-center gap-1 text-lg font-extrabold"><Gem size={17} className="text-emerald-200" />{stats.xp}</p><p className="text-[11px] text-emerald-100">XP</p></Link>
              <Link to="/recompenses" className="tap rounded-2xl p-3 ring-1 ring-white/15" style={{ background: 'rgba(255,255,255,.1)' }}><p className="text-lg font-extrabold">Niv. {stats.niveau.niveau}</p><p className="truncate text-[11px] text-emerald-100">{stats.niveau.nom}</p></Link>
            </div>
          )}

          {/* CONTINUER */}
          <Link to={`/parcours/etape/${next.id}`} className="tap mt-4 block rounded-3xl bg-white p-4 text-slate-900 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="node-btn node-current pulse-ring h-14 w-14 shrink-0" style={{ boxShadow: '0 5px 0 #043a29' }}><NextIcon size={26} /></span>
              <span className="min-w-0 flex-1">
                <span className="eyebrow">{debutant ? 'Ta première étape' : 'Prochaine étape'} · Chapitre {chap.id}</span>
                <span className="block truncate text-lg font-extrabold">{next.titre}</span>
                <span className="block text-xs text-slate-500">Leçon, verset, hadith, quiz, mission · +20 XP</span>
              </span>
            </div>
            <span className="btn-3d mt-4 w-full text-base"><Play size={18} className="fill-white" />{debutant ? 'Commencer mon parcours' : 'Continuer mon parcours'}</span>
          </Link>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-100">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${pctTotal}%` }} /></div>
            <span>{stats.etapesFaites}/{ETAPES.length} étapes</span>
          </div>
        </div>
      </section>

      <div className="container-ad">
        {!prefs.sobre && <div className="mt-5"><DailyGoal stats={stats} /></div>}

        {/* ACCÈS RAPIDE */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[['/parcours', 'Parcours', Sparkles], ['/programme', '30 jours', CalendarCheck], ['/suivi', 'Mon suivi', Activity], ['/recompenses', 'Badges', Trophy]].map(([to, l, I]) => (
            <Link key={to} to={to} className="tap card flex flex-col items-center gap-1.5 p-3 text-center"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-light text-brand-deep"><I size={20} /></span><span className="text-[12px] font-semibold leading-tight text-slate-700">{l}</span></Link>
          ))}
        </div>

        {/* CATÉGORIES */}
        <Section title="Explorer par catégorie" action={<Link to="/decouvrir" className="text-sm font-semibold text-brand">Tout voir</Link>}>
          <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {categories.map((c) => (
              <Link key={c.id} to={`/peches/${c.id}`} className={`tap relative flex w-36 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${c.couleur} p-4 text-white shadow-card`} style={{ minHeight: 120 }}>
                <span className="pattern-islamic absolute inset-0" aria-hidden="true" />
                <Icon name={c.icon} size={22} className="relative" />
                <span className="relative font-semibold leading-snug">{c.titre}</span>
              </Link>
            ))}
            {SECTIONS.slice(1, 7).map((s) => (
              <Link key={s.to} to={s.to} className="tap card flex w-36 shrink-0 snap-start flex-col justify-between p-4" style={{ minHeight: 120 }}>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-light text-brand-deep"><Icon name={s.icon} size={18} /></span>
                <span className="font-semibold leading-snug text-slate-900">{s.titre}</span>
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Conseil du jour">
          <ReminderCard />
          <Link to="/bilan" className="tap card mt-3 flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-deep text-white"><CalendarCheck size={21} /></span>
            <span className="flex-1"><span className="block font-semibold text-slate-900">Fais le bilan de ta journée</span><span className="text-sm text-slate-500">+10 XP · 7 questions, sans culpabiliser</span></span>
            <ChevronRight size={18} className="text-slate-400" />
          </Link>
        </Section>

        <Section title="Le sujet du jour">
          <Link to={`/article/${sujet.slug}`} className="tap group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-brand-deep to-brand p-5 text-white shadow-card">
            <div className="pattern-islamic absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[.16em] text-emerald-100">{categories.find((c) => c.id === sujet.cat)?.titre}</p>
              <h3 className="font-display text-xl font-bold text-white">{sujet.titre}</h3>
              <p className="mt-1 text-sm text-emerald-50/90">{sujet.accroche}</p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-deep">Lire <ArrowRight size={16} /></span>
            </div>
          </Link>
        </Section>

        <Section title="Les dangers les plus consultés" action={<Link to="/peches" className="text-sm font-semibold text-brand">Bibliothèque</Link>}>
          <div className="grid gap-3 sm:grid-cols-2">{populaires.map((a) => <ArticleCard key={a.slug} article={a} variant="tile" />)}</div>
        </Section>

        <Section title="Le hadith du jour"><HadithCard id={HADITH_JOUR[dayOfYear() % HADITH_JOUR.length]} /></Section>
      </div>
    </>
  )
}
