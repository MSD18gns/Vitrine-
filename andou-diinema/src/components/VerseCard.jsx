import { BookOpen, ExternalLink } from 'lucide-react'
import { quranLink, verseRef } from '../content/sources'
import BookmarkButton from './BookmarkButton'
import { useContent } from '../hooks/useContent'

export default function VerseCard({ id }) {
  const { versets } = useContent()
  const v = versets[id]
  if (!v) return null
  return (
    <figure className="card overflow-hidden ring-brand/20">
      <div className="flex items-center justify-between border-b border-emerald-100 bg-brand-light/70 px-4 py-2">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-deep"><BookOpen size={15} />Coran — {verseRef(v)}</span>
        <BookmarkButton type="verset" id={id} />
      </div>
      <div className="p-4 sm:p-5">
        {v.ar && <p className="arabic mb-3 text-[22px]">{v.ar}</p>}
        <blockquote className="font-display text-[16.5px] leading-relaxed text-slate-800">{v.fr}</blockquote>
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-slate-500">Traduction du sens</span>
          <a href={quranLink(v)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1 font-medium text-brand hover:underline">Lire sur quran.com <ExternalLink size={14} /></a>
        </figcaption>
      </div>
    </figure>
  )
}
