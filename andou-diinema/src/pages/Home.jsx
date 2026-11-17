import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'
import Seo from '../components/Seo'
import ReminderCard from '../components/ReminderCard'
import HadithCard from '../components/HadithCard'
import { DailyGoal } from '../components/StatsBar'
import { Lantern } from '../components/Illustrations'
import { Section } from '../components/ui'
import { useContent } from '../hooks/useContent'
import { useAuth } from '../hooks/useAuth'
import { useJourney } from '../hooks/useJourney'
import { CHAPITRES, ETAPES, EMOJIS, etapeById } from '../content/parcours'
import { messageSerie } from '../services/gamification'
import { dayOfYear, hijriToday } from '../lib/dates'

const HADITH_JOUR = ['peches-meprises', 'repentants', 'point-noir', 'main-tendue', 'regularite', 'laisse-pour-allah', 'montagne', 'joie-repentir', 'deux-bienfaits', 'bien-ou-silence']

// LA CHARTE : ce que je dois apprendre, changer, protéger, purifier, construire, suivre
const CHARTE = [
  { emoji: '🎓', titre: 'Apprendre', texte: 'Les bases de la foi et les textes', couleur: 'from-[#0B6B47] to-[#14905F]', liens: [['📖', 'Hadiths authentiques', '/hadiths'], ['🤲', 'Invocations', '/invocations'], ['🕌', 'Reconstruire sa foi', '/reconstruire']] },
  { emoji: '🔄', titre: 'Changer', texte: 'Les péchés que l\'on banalise', couleur: 'from-[#0A5F4F] to-[#128571]', liens: [['👁️', 'Le regard', '/peches/regard'], ['📱', 'Réseaux sociaux', '/peches/reseaux'], ['🗣️', 'Comportement', '/peches/comportement']] },
  { emoji: '🛡️', titre: 'Me protéger', texte: 'Des pièges et des mauvaises influences', couleur: 'from-[#07503A] to-[#0E7A55]', liens: [['🪤', 'Pièges de Shaytan', '/pieges-shaytan'], ['🤝', 'Relations', '/peches/relations'], ['👗', 'La pudeur', '/peches/pudeur']] },
  { emoji: '💚', titre: 'Purifier', texte: 'Mon cœur et revenir vers Allah', couleur: 'from-[#0B6B47] to-[#1A9A6A]', liens: [['🫀', 'Cœur endurci', '/coeur-endurci'], ['🚪', 'Le repentir', '/repentir'], ['⚖️', 'Les conséquences', '/consequences']] },
  { emoji: '🌱', titre: 'Construire', texte: 'De nouvelles habitudes, jour après jour', couleur: 'from-[#096146] to-[#13865B]', liens: [['🛟', 'Sortir des péchés', '/sortir-des-peches'], ['📅', 'Programme 30 jours', '/programme'], ['🏔️', 'Mon ascension', '/parcours']] },
  { emoji: '📊', titre: 'Suivre', texte: 'Ma progression et mes efforts', couleur: 'from-[#05432F] to-[#0B6B47]', liens: [['📝', 'Bilan du jour', '/bilan'], ['🕋', 'Prières & dhikr', '/suivi'], ['🏅', 'Mes récompenses', '/recompenses']] },
]

function salutation() {
  const h = new Date().getHours()
  return h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'
}

export default function Home() {
  const { articles, categories } = useContent()
  const { profile, user } = useAuth()
  const { stats, courante, prefs, loading } = useJourney()
  const next = etapeById(courante) || ETAPES[0]
  const chap = CHAPITRES.find((c) => c.id === next.chap)
  const name = profile?.display_name || (user?.email ? user.email.split('@')[0] : '')
  const debutant = stats.etapesFaites === 0
  const sujet = articles[dayOfYear() % articles.length]
  const pct = Math.round((stats.etapesFaites / ETAPES.length) * 100)

  return (
    <>
      <Seo />
      {/* EN-TÊTE DE JEU */}
      <section className="relative overflow-hidden text-white">
        <div className="pattern-islamic absolute inset-0 opacity-50" aria-hidden="true" />
        {['✨', '🌙', '⭐', '🤍'].map((e, i) => <span key={e} className="emoji float pointer-events-none absolute text-2xl opacity-60" style={{ left: `${[8, 82, 64, 22][i]}%`, top: `${[14, 10, 62, 70][i]}%`, animationDelay: `${i * 0.7}s` }} aria-hidden="true">{e}</span>)}
        <div className="container-ad relative pb-14 pt-6 sm:pt-10">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-200">{hijriToday()}</p>
              <h1 className="mt-2 font-display text-[28px] font-bold leading-tight text-white sm:text-4xl">{salutation()}{name ? `, ${name}` : ''} <span className="emoji wobble inline-block">👋</span></h1>
              <p className="mt-2 text-[15.5px] text-emerald-50/90">{debutant ? "Ce que tu banalises aujourd'hui peut éloigner ton cœur d'Allah demain. Ouvre les yeux, et commence à changer." : messageSerie(stats)}</p>
            </div>
            <Lantern className="float h-28 w-24 shrink-0 sm:h-36 sm:w-32" />
          </div>

          {!prefs.sobre && !loading && (
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[['🔥', stats.serie, `jour${stats.serie > 1 ? 's' : ''} de suite`, 'heartbeat'], ['💎', stats.xp, 'XP gagnés', 'coin'], ['⭐', `Niv. ${stats.niveau.niveau}`, stats.niveau.nom, 'float']].map(([e, v, l, a]) => (
                <Link key={l} to="/recompenses" className="glass card-3d rounded-2xl p-3 active:scale-95">
                  <p className="flex items-center gap-1.5 text-lg font-black"><span className={`emoji ${a}`}>{e}</span>{v}</p>
                  <p className="truncate text-[11px] text-emerald-100">{l}</p>
                </Link>
              ))}
            </div>
          )}

          {/* CONTINUER L'ASCENSION */}
          <Link to="/parcours" className="card-3d mt-4 block rounded-3xl bg-white p-4 text-slate-900 shadow-[0_8px_0_rgba(3,42,29,.55)] active:translate-y-1">
            <div className="flex items-center gap-3">
              <span className="node-btn node-current pulse-ring h-16 w-16 shrink-0"><span className="emoji float text-3xl">{EMOJIS[next.id]}</span></span>
              <span className="min-w-0 flex-1">
                <span className="eyebrow">🧗 {debutant ? 'Ton premier épisode' : 'Prochain épisode'} · Camp {chap.id}</span>
                <span className="block truncate text-lg font-black">{next.titre}</span>
                <span className="mt-1 flex items-center gap-2"><span className="h-2 flex-1 overflow-hidden rounded-full bg-brand-light"><span className="block h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500" style={{ width: `${pct}%` }} /></span><span className="text-xs font-bold text-slate-500">{pct}%</span></span>
              </span>
            </div>
            <span className="btn-3d mt-4 w-full text-base"><Play size={18} className="fill-white" />{debutant ? 'Commencer l\'ascension' : 'Continuer l\'ascension'} ⬆️</span>
          </Link>
        </div>
      </section>

      <div className="container-ad">
        {!prefs.sobre && <DailyGoal stats={stats} />}

        {/* LA CHARTE */}
        <section className="mt-8" aria-labelledby="charte">
          <div className="rounded-[28px] border-4 border-double border-brand/40 bg-gradient-to-b from-brand-mist to-white p-4 sm:p-6">
            <div className="text-center">
              <span className="emoji float inline-block text-4xl">📜</span>
              <h2 id="charte" className="section-title mt-1">Ma charte de transformation</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">Six domaines pour savoir exactement quoi apprendre, quoi changer et comment avancer.</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {CHARTE.map((c, i) => (
                <div key={c.titre} className="tilt-in overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-brand/10" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className={`relative flex items-center gap-3 bg-gradient-to-br ${c.couleur} p-4 text-white`}>
                    <span className="pattern-islamic absolute inset-0" aria-hidden="true" />
                    <span className="emoji float relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl" style={{ animationDelay: `${i * 0.3}s` }}>{c.emoji}</span>
                    <span className="relative"><span className="block text-xs font-black uppercase tracking-[.16em] text-emerald-100">Je dois…</span><span className="block text-lg font-black">{c.titre}</span><span className="block text-[13px] text-emerald-50/90">{c.texte}</span></span>
                  </div>
                  <div className="grid gap-2 p-3">
                    {c.liens.map(([e, l, to]) => (
                      <Link key={to} to={to} className="group flex min-h-[48px] items-center gap-3 rounded-2xl bg-brand-mist px-3 font-semibold text-slate-800 shadow-[0_3px_0_#d4e6db] transition active:translate-y-[3px] active:shadow-none hover:bg-brand-light">
                        <span className="emoji text-xl transition group-hover:scale-125 group-active:scale-90">{e}</span>
                        <span className="flex-1 text-[15px]">{l}</span>
                        <ArrowRight size={17} className="text-brand transition group-hover:translate-x-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Section title="💡 Conseil du jour"><ReminderCard /></Section>

        <Section title="📰 Le sujet du jour">
          <Link to={`/article/${sujet.slug}`} className="card-3d group relative block overflow-hidden rounded-3xl bg-gradient-to-br from-brand-deep to-brand p-5 text-white shadow-[0_8px_0_#032A1D]">
            <div className="pattern-islamic absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[.16em] text-emerald-100">{categories.find((c) => c.id === sujet.cat)?.titre}</p>
              <h3 className="font-display text-xl font-bold text-white">{sujet.titre}</h3>
              <p className="mt-1 text-sm text-emerald-50/90">{sujet.accroche}</p>
              <span className="btn-gold mt-4 min-h-[42px] px-4 text-sm">Lire l'article <ArrowRight size={16} /></span>
            </div>
          </Link>
        </Section>

        <Section title="📜 Le hadith du jour"><HadithCard id={HADITH_JOUR[dayOfYear() % HADITH_JOUR.length]} /></Section>
      </div>
    </>
  )
}
