import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import BookmarkButton from './BookmarkButton'
import { useContent } from '../hooks/useContent'

// Hadith complet avec sa référence, son degré et son contexte, lisibles sur place.
export default function HadithCard({ id, hadith, compact = false }) {
  const { hadiths } = useContent()
  const [open, setOpen] = useState(!compact)
  const h = hadith || hadiths[id]
  if (!h) return null
  return (
    <figure className="card card-3d flip-in overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 bg-brand-mist px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand"><span className="emoji text-base" aria-hidden="true">📜</span>Hadith</span>
        {id && <BookmarkButton type="hadith" id={id} />}
      </div>
      <div className="p-4 sm:p-5">
        {h.ar && <p className="arabic mb-3 text-xl">{h.ar}</p>}
        <blockquote className="text-[15.5px] leading-relaxed text-slate-800">« {h.fr} »</blockquote>
        <figcaption className="mt-4 space-y-1.5 text-sm">
          <p className="font-semibold text-brand-deep">📚 {h.ref}</p>
          <p className="text-slate-600"><span className="font-medium text-slate-700">✅ Authenticité :</span> {h.grade}</p>
          {h.contexte && (
            <>
              <button onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex min-h-[40px] items-center gap-1 font-semibold text-brand">
                {open ? 'Masquer le contexte' : 'Lire le contexte complet'} <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} />
              </button>
              {open && <p className="fade-in rounded-xl bg-brand-mist p-3 leading-relaxed text-slate-700"><span className="font-medium text-brand-deep">💡 Contexte et explication :</span> {h.contexte}</p>}
            </>
          )}
        </figcaption>
      </div>
    </figure>
  )
}
