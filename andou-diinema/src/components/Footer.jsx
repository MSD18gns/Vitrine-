import { Link } from 'react-router-dom'
import Logo from './Logo'

const COLS = [
  ['Comprendre', [['/peches', 'Les péchés banalisés'], ['/coeur-endurci', 'Ce qui endurcit le cœur'], ['/pieges-shaytan', 'Les pièges de Shaytan'], ['/consequences', 'Les conséquences']]],
  ['Changer', [['/sortir-des-peches', 'Sortir des péchés'], ['/repentir', 'Le repentir'], ['/reconstruire', 'Reconstruire sa foi'], ['/programme', 'Programme 30 jours']]],
  ['Ressources', [['/hadiths', 'Hadiths'], ['/invocations', 'Invocations'], ['/bilan', 'Bilan quotidien'], ['/a-propos', 'Notre démarche']]],
  ['Informations', [['/contact', 'Contact'], ['/confidentialite', 'Confidentialité'], ['/conditions', "Conditions d'utilisation"]]],
]

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-deep/10 bg-white">
      <div className="container-ad py-10">
        <div className="mb-8 max-w-sm">
          <Logo />
          <p className="mt-3 text-sm text-slate-600">« Ouvre les yeux, purifie ton cœur et rapproche-toi d'Allah. »</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLS.map(([t, links]) => (
            <div key={t}>
              <h2 className="mb-3 text-sm font-semibold text-brand-deep">{t}</h2>
              <ul className="space-y-2.5">
                {links.map(([to, l]) => <li key={to}><Link to={to} className="text-sm text-slate-600 hover:text-brand-deep">{l}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500">
          © {new Date().getFullYear()} ANDOU DIINEMA. Les contenus s'appuient sur le Coran et la Sunna authentique, avec références vérifiables. Ils ne remplacent pas l'avis d'un savant qualifié pour les questions personnelles de jurisprudence.
        </p>
      </div>
    </footer>
  )
}
