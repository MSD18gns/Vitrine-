import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Bell, Search, UserRound, ShieldCheck } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../hooks/useAuth'
import { useAnnouncements } from './Announcements'
import LanguageSwitcher from './LanguageSwitcher'
import { useT } from '../i18n'

const DESKTOP = [
  ['/', 'nav.home'],
  ['/parcours', 'nav.path'],
  ['/decouvrir', 'nav.discover'],
  ['/programme', 'nav.p30'],
  ['/suivi', 'nav.suivi'],
  ['/favoris', 'nav.favorites'],
]

export default function Header() {
  const { user, isStaff } = useAuth()
  const { unread } = useAnnouncements()
  const nav = useNavigate()
  const { t } = useT()
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-night/90 backdrop-blur supports-[backdrop-filter]:bg-brand-night/75" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="container-ad flex h-16 items-center justify-between gap-3">
        <Link to="/" aria-label="ANDOU DIINEMA — accueil"><Logo /></Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {DESKTOP.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-white/15 text-white' : 'text-emerald-100/80 hover:text-white'}`}>{t(label)}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-0.5">
          <LanguageSwitcher />
          <button onClick={() => nav('/recherche')} className="grid h-11 w-11 place-items-center rounded-xl text-emerald-50 hover:bg-white/10 active:scale-90 transition" aria-label="Rechercher"><Search size={21} /></button>
          <Link to="/notifications" className="relative grid h-11 w-11 place-items-center rounded-xl text-emerald-50 hover:bg-white/10 active:scale-90 transition" aria-label={`Notifications${unread ? ` (${unread} non lues)` : ''}`}>
            <Bell size={21} />
            {unread > 0 && <span className="heartbeat absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-brand-night">{unread}</span>}
          </Link>
          {isStaff && <Link to="/admin" className="hidden h-11 w-11 place-items-center rounded-xl text-emerald-50 hover:bg-white/10 sm:grid" aria-label="Administration"><ShieldCheck size={21} /></Link>}
          <Link to={user ? '/profil' : '/connexion'} className="hidden h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white hover:bg-white/10 lg:flex"><UserRound size={20} />{user ? t('nav.profile') : t('nav.login')}</Link>
        </div>
      </div>
    </header>
  )
}
