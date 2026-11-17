export default function ProgressCard({ icon: Icon, label, value, total, hint, children }) {
  const pct = total ? Math.min(100, Math.round((value / total) * 100)) : null
  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">{Icon && <Icon size={17} className="text-brand" />}{label}</div>
      <p className="text-2xl font-bold text-brand-deep">{value}{total ? <span className="text-base font-medium text-slate-400"> / {total}</span> : null}</p>
      {pct !== null && <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-light" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-deep transition-all" style={{ width: `${pct}%` }} /></div>}
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
      {children}
    </div>
  )
}
