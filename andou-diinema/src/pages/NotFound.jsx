import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
export default function NotFound() {
  return (
    <div className="container-ad grid min-h-[50vh] place-items-center py-12 text-center">
      <Seo title="Page introuvable" noindex />
      <div><p className="font-display text-6xl font-bold text-brand-light">404</p><h1 className="mt-2 text-2xl font-bold">Page introuvable</h1><p className="mt-2 text-slate-600">Cette page n'existe pas ou a été déplacée.</p><div className="mt-6 grid gap-2 sm:flex sm:justify-center"><Link to="/" className="btn-primary">Retour à l'accueil</Link><Link to="/decouvrir" className="btn-ghost">Découvrir</Link></div></div>
    </div>
  )
}
