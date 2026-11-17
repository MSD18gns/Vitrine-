import { Share2, Check } from 'lucide-react'
import { useState } from 'react'

export default function ShareButton({ title, text, path, className = '' }) {
  const [copied, setCopied] = useState(false)
  const url = window.location.origin + (path || window.location.pathname)
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ title, text, url }); return }
      await navigator.clipboard.writeText(`${title} — ${url}`)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    } catch { /* partage annulé */ }
  }
  return (
    <button onClick={share} className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl px-2.5 text-sm font-medium text-slate-500 hover:text-brand-deep ${className}`} aria-label="Partager">
      {copied ? <Check size={20} /> : <Share2 size={20} />}<span className="sr-only sm:not-sr-only">{copied ? 'Lien copié' : 'Partager'}</span>
    </button>
  )
}
