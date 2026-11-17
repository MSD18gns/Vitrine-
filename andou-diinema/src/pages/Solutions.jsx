import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Repeat } from 'lucide-react'
import Seo from '../components/Seo'
import ShareButton from '../components/ShareButton'
import { PageHeader, Section } from '../components/ui'
import Sources from '../components/Sources'
import { METHODE, GUIDES } from '../content/themes'

export default function Solutions() {
  return (
    <>
      <Seo title="Comment sortir des péchés" description="Une méthode concrète en 9 étapes pour abandonner les mauvaises habitudes, avec des guides pratiques et des exemples." />
      <PageHeader emoji="🛟" eyebrow="Changer" title="Comment sortir des péchés" subtitle="Une méthode concrète en 9 étapes, avec des guides et des exemples, pour abandonner les mauvaises habitudes avec l'aide d'Allah." />
      <div className="container-ad max-w-3xl">
        <div className="-mt-5 relative flex justify-end rounded-2xl bg-white p-1 shadow-card"><ShareButton title="Comment sortir des péchés" path="/sortir-des-peches" /></div>
        <Section title="La méthode en 9 étapes">
          <ol className="relative space-y-3 border-l-2 border-brand-light pl-6">
            {METHODE.map((m, i) => (
              <li key={m.titre} className="relative">
                <span className="absolute -left-[38px] top-3 grid h-7 w-7 place-items-center rounded-full bg-brand-deep text-xs font-bold text-white ring-4 ring-brand-mist">{i + 1}</span>
                <div className="card p-4">
                  <h3 className="font-semibold text-slate-900">{m.titre}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-slate-700">{m.texte}</p>
                  <p className="mt-2 rounded-xl bg-brand-light px-3 py-2 text-sm text-brand-deep"><b>Exemple :</b> {m.exemple}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Guides pratiques">
          <div className="space-y-3">
            {GUIDES.map((g) => (
              <div key={g.titre} className="card p-4">
                <h3 className="mb-3 font-semibold text-brand-deep">{g.titre}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Zap size={15} className="text-amber-500" />Déclencheurs fréquents</p><ul className="space-y-1 text-sm text-slate-600">{g.declencheurs.map((x) => <li key={x}>• {x}</li>)}</ul></div>
                  <div><p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Repeat size={15} className="text-brand" />Remplacer par</p><ul className="space-y-1 text-sm text-slate-600">{g.remplacement.map((x) => <li key={x}>• {x}</li>)}</ul></div>
                </div>
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm italic text-slate-600">Exemple illustratif : {g.exemple}</p>
                <Link to={`/article/${g.article}`} className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-brand">Lire l'article complet <ArrowRight size={16} /></Link>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Les textes qui donnent la force">
          <Sources versets={['ankabut-69', 'zumar-53', 'talaq-2']} hadiths={['laisse-pour-allah', 'regularite']} />
        </Section>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link to="/programme" className="btn-primary">Commencer le programme de 30 jours</Link>
          <Link to="/repentir" className="btn-ghost">Le repentir</Link>
        </div>
      </div>
    </>
  )
}
