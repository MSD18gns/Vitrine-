import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'
import Seo from '../components/Seo'
import { PageHeader, EmptyState, Spinner } from '../components/ui'
import ReminderCard from '../components/ReminderCard'
import { useAnnouncements } from '../components/Announcements'

export default function Notifications() {
  const { items, loaded, isRead, markAll } = useAnnouncements()
  useEffect(() => { if (loaded && items.length) { const t = setTimeout(markAll, 1500); return () => clearTimeout(t) } }, [loaded, items.length]) // eslint-disable-line
  return (
    <>
      <Seo title="Notifications" noindex />
      <PageHeader eyebrow="Notifications" title="Rappels et annonces" subtitle="Les rappels publiés par l'équipe ANDOU DIINEMA." />
      <div className="container-ad max-w-2xl">
        <div className="mt-5"><ReminderCard /></div>
        <div className="mt-4 space-y-2.5">
          {!loaded ? <Spinner /> : items.length ? items.map((n) => (
            <div key={n.id} className={`card p-4 ${isRead(n.id) ? '' : 'ring-2 ring-brand/40'}`}>
              <p className="text-xs text-slate-500">{new Date(n.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
              <h2 className="mt-0.5 font-semibold text-slate-900">{n.titre}</h2>
              <p className="mt-1 whitespace-pre-line text-[15px] text-slate-700">{n.message}</p>
              {n.lien && <Link to={n.lien} className="mt-2 inline-flex min-h-[40px] items-center text-sm font-semibold text-brand">Ouvrir →</Link>}
            </div>
          )) : <EmptyState icon={Bell} title="Aucune annonce pour le moment" text="Les rappels publiés par l'équipe apparaîtront ici." />}
        </div>
        <Link to="/profil" className="btn-ghost mt-6 w-full"><Settings size={18} />Gérer mes rappels personnels</Link>
      </div>
    </>
  )
}
