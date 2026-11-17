import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useBookmarks } from '../hooks/useProgress'
import { useState } from 'react'

export default function BookmarkButton({ type, id, label = false, className = '' }) {
  const { has, toggle } = useBookmarks()
  const [busy, setBusy] = useState(false)
  const on = has(type, id)
  const click = async (e) => {
    e.preventDefault(); e.stopPropagation()
    setBusy(true)
    try { await toggle(type, id) } finally { setBusy(false) }
  }
  return (
    <button onClick={click} disabled={busy} aria-pressed={on} aria-label={on ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl px-2.5 text-sm font-medium transition ${on ? 'text-brand-deep' : 'text-slate-500 hover:text-brand-deep'} ${className}`}>
      {on ? <BookmarkCheck size={20} className="fill-brand-light" /> : <Bookmark size={20} />}
      {label && <span>{on ? 'Enregistré' : 'Enregistrer'}</span>}
    </button>
  )
}
