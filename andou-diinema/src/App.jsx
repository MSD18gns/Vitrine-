import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileNavigation from './components/MobileNavigation'
import { Spinner } from './components/ui'
import ErrorBoundary from './components/ErrorBoundary'
import { useProgress } from './hooks/useProgress'
import { useAuth } from './hooks/useAuth'
import { checkReminders } from './services/notifications'
import Home from './pages/Home'

// Après une mise à jour du site, une page ouverte peut demander un fichier
// de l'ancienne version : on recharge alors la page une seule fois.
const p = (f) => lazy(() => f().then((m) => { try { sessionStorage.removeItem('ad:chunk-reload') } catch { /* ignore */ } return m }).catch((e) => {
  let again = false
  try { again = !sessionStorage.getItem('ad:chunk-reload'); sessionStorage.setItem('ad:chunk-reload', '1') } catch { /* ignore */ }
  if (again) { window.location.reload(); return new Promise(() => {}) }
  throw e
}))
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
const Parcours = p(() => import('./pages/Parcours'))
const Etape = p(() => import('./pages/Etape'))
const Recompenses = p(() => import('./pages/Recompenses'))
const LaboMahmoud = p(() => import('./pages/LaboMahmoud'))
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

function DbBanner() {
  const { user, dbReady } = useAuth()
  if (!user || dbReady) return null
  return <div className="bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900" role="status">Tu es connecté(e). La base de données est en cours d'installation : ta progression est enregistrée sur cet appareil et sera transférée automatiquement.</div>
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
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-xl focus:bg-white focus:p-3">Aller au contenu</a>
      <ScrollTop />
      <Reminders />
      <Header />
      <DbBanner />
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
              <Route path="/parcours" element={<Parcours />} />
              <Route path="/parcours/etape/:id" element={<Etape />} />
              <Route path="/suivi" element={<Dashboard />} />
              <Route path="/recompenses" element={<Recompenses />} />
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
              <Route path="/labo/mahmoud" element={<LaboMahmoud />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      {!pathname.startsWith('/parcours') && <Footer />}
      <MobileNavigation />
    </div>
  )
}
