import { BookOpen } from 'lucide-react'
import { verseRef } from '../content/sources'
import BookmarkButton from './BookmarkButton'
import { useContent } from '../hooks/useContent'

// Le verset est affiché en entier, directement : aucun lien externe nécessaire.
export default function VerseCard({ id }) {
  const { versets } = useContent()
  const v = versets[id]
  if (!v) return null
  return (
    <figure className="card card-3d flip-in overflow-hidden ring-brand/20">
      <div className="flex items-center justify-between border-b border-emerald-100 bg-brand-light/70 px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-deep"><span className="emoji text-base" aria-hidden="true">📖</span>Coran — {verseRef(v)}</span>
        <BookmarkButton type="verset" id={id} />
      </div>
      <div className="p-4 sm:p-5">
        {v.ar && <p className="arabic mb-3 text-[22px]">{v.ar}</p>}
        <blockquote className="font-display text-[16.5px] leading-relaxed text-slate-800">{v.fr}</blockquote>
        <figcaption className="mt-3 rounded-xl bg-brand-mist px-3 py-2 text-sm text-slate-600">
          <BookOpen size={14} className="mr-1 inline text-brand" /><b className="text-brand-deep">Sourate {v.sourate}</b> (n°{v.s}), verset{String(v.a).includes('-') ? 's' : ''} {v.a} · traduction du sens en français
        </figcaption>
      </div>
    </figure>
  )
}
