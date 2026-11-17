import { Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Link } from 'react-router-dom'

export const Spinner = ({ label = 'Chargement…' }) => (
  <div className="flex items-center justify-center gap-2 py-10 text-brand" role="status"><Loader2 className="animate-spin" size={22} /><span className="text-sm">{label}</span></div>
)

export function Alert({ type = 'info', children, className = '' }) {
  const styles = {
    info: ['bg-brand-light text-brand-deep', Info],
    success: ['bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200', CheckCircle2],
    error: ['bg-red-50 text-red-800 ring-1 ring-red-200', AlertTriangle],
    warning: ['bg-amber-50 text-amber-900 ring-1 ring-amber-200', AlertTriangle],
  }[type]
  const Icon = styles[1]
  return <div role={type === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-2xl p-4 text-sm leading-relaxed ${styles[0]} ${className}`}><Icon size={18} className="mt-0.5 shrink-0" /><div>{children}</div></div>
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="card px-6 py-10 text-center">
      {Icon && <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-light text-brand-deep"><Icon size={26} /></span>}
      <h2 className="mb-1 text-lg font-semibold">{title}</h2>
      {text && <p className="mx-auto max-w-sm text-sm text-slate-600">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageHeader({ eyebrow, title, subtitle, children, back, emoji }) {
  return (
    <div className="relative overflow-hidden text-white">
      <div className="pattern-islamic absolute inset-0 opacity-60" aria-hidden="true" />
      {emoji && <span className="emoji float pointer-events-none absolute right-5 top-6 text-5xl opacity-90 sm:right-12 sm:text-6xl" aria-hidden="true">{emoji}</span>}
      <div className="container-ad relative pb-12 pt-7 sm:pb-16 sm:pt-12">
        {back && <Link to={back[0]} className="mb-3 inline-flex min-h-[40px] items-center text-sm font-medium text-emerald-100 hover:text-white">← {back[1]}</Link>}
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-emerald-100">{eyebrow}</p>}
        <h1 className="font-display text-[28px] font-bold leading-tight text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-emerald-50/90 sm:text-base">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}

export const Section = ({ title, action, children, className = '' }) => (
  <section className={`mt-10 ${className}`}>
    {(title || action) && <div className="mb-4 flex items-end justify-between gap-3"><h2 className="section-title">{title}</h2>{action}</div>}
    {children}
  </section>
)
