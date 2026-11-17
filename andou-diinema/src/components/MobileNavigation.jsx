import { NavLink } from 'react-router-dom'
import { Home, Compass, Route, Bookmark, UserRound } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Accueil', Icon: Home, end: true },
  { to: '/decouvrir', label: 'Découvrir', Icon: Compass },
  { to: '/parcours', label: 'Mon parcours', Icon: Route },
  { to: '/favoris', label: 'Favoris', Icon: Bookmark },
  { to: '/profil', label: 'Profil', Icon: UserRound },
]

export default function MobileNavigation() {
  return (
    <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-deep/10 bg-white/95 backdrop-blur lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => `flex h-[64px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${isActive ? 'text-brand-deep' : 'text-slate-500'}`}>
              {({ isActive }) => (
                <>
                  <span className={`grid h-8 w-14 place-items-center rounded-full transition ${isActive ? 'bg-brand-light' : ''}`}><Icon size={21} strokeWidth={isActive ? 2.4 : 2} /></span>
                  <span className="leading-none">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
