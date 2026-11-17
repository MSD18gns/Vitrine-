import { HandHeart, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import BookmarkButton from './BookmarkButton'
import { useContent } from '../hooks/useContent'

export default function InvocationCard({ id }) {
  const { invocations } = useContent()
  const d = invocations[id]
  const [copied, setCopied] = useState(false)
  if (!d) return null
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${d.ar}\n${d.tr}\n${d.fr}\n(${d.ref})`); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* ignore */ }
  }
  return (
    <article className="card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-2">
        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-brand-deep"><HandHeart size={17} className="shrink-0 text-brand" /><span className="truncate">{d.titre}</span></span>
        <div className="flex shrink-0">
          <button onClick={copy} className="grid h-11 w-11 place-items-center rounded-xl text-slate-500 hover:text-brand-deep" aria-label="Copier l'invocation">{copied ? <Check size={19} /> : <Copy size={19} />}</button>
          <BookmarkButton type="invocation" id={id} />
        </div>
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <p className="arabic text-[22px]">{d.ar}</p>
        <p className="text-[15px] italic leading-relaxed text-slate-600">{d.tr}</p>
        <p className="leading-relaxed text-slate-800">{d.fr}</p>
        <p className="text-sm font-semibold text-brand">{d.ref}</p>
      </div>
    </article>
  )
}
