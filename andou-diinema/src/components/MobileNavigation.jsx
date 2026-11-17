import { NavLink } from 'react-router-dom'
import { Home, Compass, Route, Bookmark, UserRound } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const ITEMS = [
  { to: '/', label: 'Accueil', Icon: Home, end: true },
  { to: '/parcours', label: 'Parcours', Icon: Route },
  { to: '/decouvrir', label: 'Découvrir', Icon: Compass },
  { to: '/favoris', label: 'Favoris', Icon: Bookmark },
  { to: '/profil', label: 'Profil', Icon: UserRound },
]

export default function MobileNavigation() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/parcours/etape/')) return null // mode immersif pendant une étape
  return (
    <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-brand-night/95 backdrop-blur lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => `flex h-[64px] flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${isActive ? 'text-white' : 'text-emerald-200/70'}`}>
              {({ isActive }) => (
                <>
                  <span className={`grid h-8 w-14 place-items-center rounded-full transition duration-300 ${isActive ? 'bg-brand-bright shadow-[0_3px_0_#032A1D] -translate-y-0.5' : 'active:scale-90'}`}><Icon size={21} strokeWidth={isActive ? 2.4 : 2} /></span>
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
