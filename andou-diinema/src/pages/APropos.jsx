import { Link } from 'react-router-dom'
import { BadgeCheck, BookOpen, HeartHandshake, ShieldCheck } from 'lucide-react'
import Seo from '../components/Seo'
import { PageHeader, Section } from '../components/ui'

const POINTS = [
  [BookOpen, 'Des sources vérifiables', "Chaque verset renvoie à quran.com, chaque hadith indique sa référence, son degré d'authenticité et son contexte. Aucun texte n'est inventé."],
  [BadgeCheck, 'Une validation par des personnes qualifiées', "Chaque contenu passe par un circuit : brouillon → relecture → validation par une personne qualifiée en sciences islamiques → publication. Le badge « Validé par le comité » l'indique."],
  [HeartHandshake, 'Avertir sans humilier', "Nous expliquons les dangers avec clarté, mais toujours avec miséricorde : personne n'est jugé, et la porte du repentir reste ouverte."],
  [ShieldCheck, 'Ta vie privée est sacrée', 'Tes réponses personnelles ne sont jamais publiques et restent inaccessibles à l\'équipe.'],
]

export default function APropos() {
  return (
    <>
      <Seo title="Notre démarche" description="La mission d'ANDOU DIINEMA, ses sources et son processus de validation religieuse." />
      <PageHeader eyebrow="ANDOU DIINEMA" title="Notre démarche" subtitle="Réveiller les consciences, expliquer avec les textes, et accompagner concrètement vers le changement." />
      <div className="container-ad max-w-3xl">
        <p className="mt-6 text-[16.5px] leading-relaxed text-slate-700">« Andou » évoque le fait d'avancer ensemble. ANDOU DIINEMA est né d'un constat : beaucoup de comportements qui éloignent d'Allah sont devenus normaux. Notre mission est d'aider chaque musulman à les reconnaître, à comprendre leurs conséquences à travers le Coran et la Sunna, et à trouver un chemin concret pour changer.</p>
        <Section title="Nos engagements">
          <div className="grid gap-3 sm:grid-cols-2">{POINTS.map(([I, t, x]) => <div key={t} className="card p-4"><I className="mb-2 text-brand" /><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{x}</p></div>)}</div>
        </Section>
        <Section title="Distinguer les statuts">
          <ul className="space-y-2 text-[15px] text-slate-700">
            <li className="card p-3.5"><b>Obligation (fard / wajib)</b> : ce qu'Allah a ordonné.</li>
            <li className="card p-3.5"><b>Interdiction (haram)</b> : ce qu'Allah a interdit.</li>
            <li className="card p-3.5"><b>Recommandation (mustahabb)</b> : ce qui est encouragé sans être obligatoire.</li>
            <li className="card p-3.5"><b>Divergence reconnue</b> : lorsque les savants ont des avis différents, cela est mentionné.</li>
          </ul>
        </Section>
        <p className="mt-8 text-slate-700">Tu as repéré une erreur ? <Link to="/contact" className="font-semibold text-brand">Signale-la-nous</Link>.</p>
      </div>
    </>
  )
}
