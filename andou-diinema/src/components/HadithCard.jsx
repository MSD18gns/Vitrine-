import { ExternalLink, ScrollText } from 'lucide-react'
import { sunnahLink } from '../content/sources'
import BookmarkButton from './BookmarkButton'
import { useContent } from '../hooks/useContent'

export default function HadithCard({ id, hadith, compact = false }) {
  const { hadiths } = useContent()
  const h = hadith || hadiths[id]
  if (!h) return null
  return (
    <figure className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-brand-mist px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand"><ScrollText size={15} />Hadith</span>
        {id && <BookmarkButton type="hadith" id={id} />}
      </div>
      <div className="p-4 sm:p-5">
        {h.ar && <p className="arabic mb-3 text-xl">{h.ar}</p>}
        <blockquote className="text-[15.5px] leading-relaxed text-slate-800">« {h.fr} »</blockquote>
        <figcaption className="mt-4 space-y-1.5 text-sm">
          <p className="font-semibold text-brand-deep">{h.ref}</p>
          <p className="text-slate-600"><span className="font-medium text-slate-700">Authenticité :</span> {h.grade}</p>
          {!compact && h.contexte && <p className="text-slate-600"><span className="font-medium text-slate-700">Contexte :</span> {h.contexte}</p>}
          <a href={sunnahLink(h)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1 text-sm font-medium text-brand hover:underline">Vérifier la source <ExternalLink size={14} /></a>
        </figcaption>
      </div>
    </figure>
  )
}
