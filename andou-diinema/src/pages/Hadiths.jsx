import { useMemo, useState } from 'react'
import Seo from '../components/Seo'
import SearchBar from '../components/SearchBar'
import HadithCard from '../components/HadithCard'
import { PageHeader, Alert } from '../components/ui'
import { useContent } from '../hooks/useContent'
import { matches } from '../lib/text'

const FILTRES = [['all', 'Tous'], ['Bukhari', 'Al-Bukhari'], ['Muslim', 'Muslim'], ['Tirmidhi', 'At-Tirmidhi'], ['Dawud', 'Abu Dawud'], ['Majah', 'Ibn Majah'], ['Ahmad', 'Ahmad']]

export default function Hadiths() {
  const { hadiths } = useContent()
  const [q, setQ] = useState('')
  const [f, setF] = useState('all')
  const list = useMemo(() => Object.entries(hadiths).filter(([, h]) => (f === 'all' || h.ref.includes(f)) && matches(q, h.fr, h.ref, h.contexte)), [hadiths, q, f])
  return (
    <>
      <Seo title="Hadiths authentiques" description="Hadiths authentiques sur le repentir, le cœur, la langue, la pudeur et le comportement, avec référence, degré d'authenticité et contexte." />
      <PageHeader emoji="📜" eyebrow="Sunna" title="Hadiths" subtitle="Chaque hadith est présenté avec sa traduction, sa référence, son degré d'authenticité et son contexte, et un lien pour vérifier la source." />
      <div className="container-ad max-w-3xl">
        <div className="relative -mt-6"><SearchBar value={q} onChange={setQ} placeholder="Rechercher un hadith (repentir, regard, colère…)" /></div>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">{FILTRES.map(([k, l]) => <button key={k} onClick={() => setF(k)} className={`chip ${f === k ? 'chip-active' : ''}`}>{l}</button>)}</div>
        <Alert className="mt-4">Les références suivent la numérotation usuelle (Al-Bukhari : Fath al-Bari ; Muslim : Fu'ad 'Abd al-Baqi). Elles peuvent différer légèrement selon les éditions.</Alert>
        <p className="mt-4 text-sm text-slate-500">{list.length} hadith(s)</p>
        <div className="mt-2 space-y-3">{list.map(([id, h]) => <HadithCard key={id} id={id} hadith={h} />)}</div>
      </div>
    </>
  )
}
