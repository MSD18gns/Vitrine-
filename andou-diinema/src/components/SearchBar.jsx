import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function SearchBar({ value, onChange, placeholder = 'Rechercher un sujet, un péché, une invocation…', autoFocus = false, navigateOnSubmit = false }) {
  const [inner, setInner] = useState('')
  const nav = useNavigate()
  const v = value ?? inner
  const set = onChange ?? setInner
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); if (navigateOnSubmit && v.trim()) nav(`/recherche?q=${encodeURIComponent(v.trim())}`) }} className="relative">
      <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input type="search" value={v} onChange={(e) => set(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} aria-label="Rechercher"
        className="input h-[52px] rounded-2xl pl-11 pr-11 shadow-card" enterKeyHint="search" />
      {v && <button type="button" onClick={() => set('')} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl text-slate-400 hover:text-slate-600" aria-label="Effacer"><X size={18} /></button>}
    </form>
  )
}
