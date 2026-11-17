import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Spinner, EmptyState } from './ui'

export default function RequireAuth({ children, title = 'Connecte-toi pour continuer' }) {
  const { user, loading, configured } = useAuth()
  if (loading) return <Spinner />
  if (!configured) return <EmptyState icon={LogIn} title="Comptes bientôt disponibles" text="Les comptes seront actifs dès que la base de données du site sera configurée." />
  if (!user) return <EmptyState icon={LogIn} title={title} text="Ton espace est privé et sécurisé." action={<div className="flex flex-col gap-2 sm:flex-row sm:justify-center"><Link to="/connexion" className="btn-primary">Se connecter</Link><Link to="/inscription" className="btn-ghost">Créer un compte</Link></div>} />
  return children
}
