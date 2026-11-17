import { useMemo, useState } from 'react'
import Seo from '../components/Seo'
import SearchBar from '../components/SearchBar'
import InvocationCard from '../components/InvocationCard'
import { PageHeader } from '../components/ui'
import { useContent } from '../hooks/useContent'
import { matches } from '../lib/text'

export default function Invocations() {
  const { invocations } = useContent()
  const [q, setQ] = useState('')
  const [t, setT] = useState('Tous')
  const themes = ['Tous', ...new Set(Object.values(invocations).map((d) => d.theme).filter(Boolean))]
  const list = useMemo(() => Object.entries(invocations).filter(([, d]) => (t === 'Tous' || d.theme === t) && matches(q, d.titre, d.fr, d.tr, d.theme)), [invocations, q, t])
  return (
    <>
      <Seo title="Invocations" description="Invocations du Coran et de la Sunna pour le repentir, la fermeté du cœur, la chasteté, la famille et le quotidien, en arabe, phonétique et français." />
      <PageHeader emoji="🤲" eyebrow="Du'a" title="Invocations" subtitle="En arabe, en phonétique et en français, avec leur source. Ajoute-les à tes favoris pour les apprendre." />
      <div className="container-ad max-w-3xl">
        <div className="relative -mt-6"><SearchBar value={q} onChange={setQ} placeholder="Rechercher une invocation…" /></div>
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">{themes.map((x) => <button key={x} onClick={() => setT(x)} className={`chip ${t === x ? 'chip-active' : ''}`}>{x}</button>)}</div>
        <div className="mt-5 space-y-3">{list.map(([id]) => <InvocationCard key={id} id={id} />)}</div>
      </div>
    </>
  )
}
