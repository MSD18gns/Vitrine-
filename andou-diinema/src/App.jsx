import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileNavigation from './components/MobileNavigation'
import { Spinner } from './components/ui'
import ErrorBoundary from './components/ErrorBoundary'
import { useProgress } from './hooks/useProgress'
import { checkReminders } from './services/notifications'
import Home from './pages/Home'

const p = (f) => lazy(f)
const Decouvrir = p(() => import('./pages/Decouvrir'))
const Peches = p(() => import('./pages/Peches'))
const Categorie = p(() => import('./pages/Categorie'))
const Article = p(() => import('./pages/Article'))
const CoeurEndurci = p(() => import('./pages/CoeurEndurci'))
const PiegesShaytan = p(() => import('./pages/PiegesShaytan'))
const Consequences = p(() => import('./pages/Consequences'))
const Solutions = p(() => import('./pages/Solutions'))
const Repentir = p(() => import('./pages/Repentir'))
const Reconstruction = p(() => import('./pages/Reconstruction'))
const Programme30Jours = p(() => import('./pages/Programme30Jours'))
const JourProgramme = p(() => import('./pages/JourProgramme'))
const BilanQuotidien = p(() => import('./pages/BilanQuotidien'))
const Hadiths = p(() => import('./pages/Hadiths'))
const Invocations = p(() => import('./pages/Invocations'))
const Dashboard = p(() => import('./pages/Dashboard'))
const Favoris = p(() => import('./pages/Favoris'))
const Profil = p(() => import('./pages/Profil'))
const Login = p(() => import('./pages/Login'))
const Register = p(() => import('./pages/Register'))
const MotDePasse = p(() => import('./pages/MotDePasse'))
const Reinitialiser = p(() => import('./pages/Reinitialiser'))
const Admin = p(() => import('./pages/Admin'))
const Recherche = p(() => import('./pages/Recherche'))
const Notifications = p(() => import('./pages/Notifications'))
const Contact = p(() => import('./pages/Contact'))
const Legal = p(() => import('./pages/Legal'))
const APropos = p(() => import('./pages/APropos'))
const NotFound = p(() => import('./pages/NotFound'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Reminders() {
  const { api } = useProgress()
  useEffect(() => {
    let id
    const run = () => api.reminderPrefs().then(checkReminders).catch(() => {})
    run()
    id = setInterval(run, 60_000)
    return () => clearInterval(id)
  }, [api])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-xl focus:bg-white focus:p-3">Aller au contenu</a>
      <ScrollTop />
      <Reminders />
      <Header />
      <main id="contenu" className="pb-nav flex-1">
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/decouvrir" element={<Decouvrir />} />
              <Route path="/peches" element={<Peches />} />
              <Route path="/peches/:cat" element={<Categorie />} />
              <Route path="/article/:slug" element={<Article />} />
              <Route path="/coeur-endurci" element={<CoeurEndurci />} />
              <Route path="/pieges-shaytan" element={<PiegesShaytan />} />
              <Route path="/consequences" element={<Consequences />} />
              <Route path="/sortir-des-peches" element={<Solutions />} />
              <Route path="/repentir" element={<Repentir />} />
              <Route path="/reconstruire" element={<Reconstruction />} />
              <Route path="/programme" element={<Programme30Jours />} />
              <Route path="/programme/jour/:jour" element={<JourProgramme />} />
              <Route path="/bilan" element={<BilanQuotidien />} />
              <Route path="/hadiths" element={<Hadiths />} />
              <Route path="/invocations" element={<Invocations />} />
              <Route path="/parcours" element={<Dashboard />} />
              <Route path="/favoris" element={<Favoris />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/mot-de-passe-oublie" element={<MotDePasse />} />
              <Route path="/reinitialiser" element={<Reinitialiser />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/recherche" element={<Recherche />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/confidentialite" element={<Legal page="confidentialite" />} />
              <Route path="/conditions" element={<Legal page="conditions" />} />
              <Route path="/a-propos" element={<APropos />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileNavigation />
    </div>
  )
}
