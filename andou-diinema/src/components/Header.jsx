import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, Search, UserRound, ShieldCheck } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../hooks/useAuth'
import { useAnnouncements } from './Announcements'

const DESKTOP = [
  ['/', 'Accueil'],
  ['/decouvrir', 'Découvrir'],
  ['/programme', 'Programme 30 jours'],
  ['/parcours', 'Mon parcours'],
  ['/favoris', 'Favoris'],
]

export default function Header() {
  const { user, isStaff } = useAuth()
  const { unread } = useAnnouncements()
  const nav = useNavigate()
  return (
    <header className="sticky top-0 z-40 border-b border-brand-deep/5 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="container-ad flex h-16 items-center justify-between gap-3">
        <Link to="/" aria-label="ANDOU DIINEMA — accueil"><Logo /></Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {DESKTOP.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-light text-brand-deep' : 'text-slate-600 hover:text-brand-deep'}`}>{label}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button onClick={() => nav('/recherche')} className="grid h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-brand-light" aria-label="Rechercher"><Search size={21} /></button>
          <Link to="/notifications" className="relative grid h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-brand-light" aria-label={`Notifications${unread ? ` (${unread} non lues)` : ''}`}>
            <Bell size={21} />
            {unread > 0 && <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{unread}</span>}
          </Link>
          {isStaff && <Link to="/admin" className="hidden h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-brand-light sm:grid" aria-label="Administration"><ShieldCheck size={21} /></Link>}
          <Link to={user ? '/profil' : '/connexion'} className="hidden h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-brand-deep hover:bg-brand-light lg:flex"><UserRound size={20} />{user ? 'Profil' : 'Connexion'}</Link>
        </div>
      </div>
    </header>
  )
}
