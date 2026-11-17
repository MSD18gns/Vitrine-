import { BadgeCheck, Clock } from 'lucide-react'
export default function ValidationBadge({ validated, light = false }) {
  if (validated) return <span className={`badge ${light ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700'}`}><BadgeCheck size={14} />Validé par le comité</span>
  return <span className={`badge ${light ? 'bg-white/15 text-emerald-50' : 'bg-slate-100 text-slate-600'}`} title="Ce contenu s'appuie sur des références vérifiables et attend la relecture d'une personne qualifiée."><Clock size={14} />En attente de validation</span>
}
