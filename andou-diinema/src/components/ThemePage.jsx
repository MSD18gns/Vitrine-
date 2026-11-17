import { useState } from 'react'
import { ChevronDown, ShieldCheck, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import Seo from './Seo'
import Sources from './Sources'
import BookmarkButton from './BookmarkButton'
import ShareButton from './ShareButton'
import { PageHeader, Section } from './ui'
import { THEMES } from '../content/themes'

function Item({ item, index, themeId }) {
  const [open, setOpen] = useState(index === 0)
  const id = `${themeId}-${index}`
  return (
    <li className="card overflow-hidden">
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={id} className="flex min-h-[60px] w-full items-center gap-3 p-4 text-left">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand-deep">{index + 1}</span>
        <span className="flex-1 font-semibold text-slate-900">{item.titre}</span>
        <ChevronDown size={20} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={id} className="space-y-4 border-t border-slate-100 p-4">
          <p className="leading-relaxed text-slate-700">{item.texte}</p>
          {item.protection && <p className="flex gap-2 rounded-xl bg-brand-light p-3 text-sm text-brand-deep"><ShieldCheck size={18} className="shrink-0" /><span><b>Se protéger :</b> {item.protection}</span></p>}
          {item.action && <p className="rounded-xl bg-brand-light p-3 text-sm text-brand-deep"><b>Action :</b> {item.action}</p>}
          <Sources versets={item.versets} hadiths={item.hadiths} />
        </div>
      )}
    </li>
  )
}

export default function ThemePage({ id, path, children, eyebrow }) {
  const t = THEMES[id]
  return (
    <>
      <Seo title={t.titre} description={t.sousTitre + ' ' + t.intro.slice(0, 100)} />
      <PageHeader emoji={{ coeur: '🫀', pieges: '🛡️', consequences: '⚖️', repentir: '🚪', reconstruction: '🌱' }[id]} eyebrow={eyebrow} title={t.titre} subtitle={t.sousTitre} />
      <div className="container-ad max-w-3xl">
        <div className="-mt-5 relative flex justify-end gap-1 rounded-2xl bg-white p-1 shadow-card">
          <BookmarkButton type="theme" id={id} label />
          <ShareButton title={t.titre} text={t.sousTitre} path={path} />
        </div>
        <p className="mt-6 text-[16.5px] leading-relaxed text-slate-700">{t.intro}</p>
        {t.avertissement && <p className="mt-4 flex gap-2 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700"><Info size={18} className="shrink-0 text-brand" />{t.avertissement}</p>}

        {(t.versetsCles?.length || t.hadithsCles?.length) ? (
          <Section title="Les textes de référence"><Sources versets={t.versetsCles} hadiths={t.hadithsCles} /></Section>
        ) : null}

        {children?.before}
        <Section title="Comprendre en détail">
          <ol className="space-y-2.5">{t.items.map((it, i) => <Item key={i} item={it} index={i} themeId={id} />)}</ol>
        </Section>
        {children?.after}

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <Link to="/sortir-des-peches" className="btn-primary">Méthode pour changer</Link>
          <Link to="/programme" className="btn-ghost">Programme de 30 jours</Link>
        </div>
      </div>
    </>
  )
}
