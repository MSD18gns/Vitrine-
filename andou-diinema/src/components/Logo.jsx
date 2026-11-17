export function LogoMark({ className = 'h-9 w-9' }) {
  return <img src="/logo.svg" alt="" width="36" height="36" className={`${className} rounded-[10px]`} />
}
export default function Logo({ compact = false, light = true }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-none">
        <span className={`block text-[15px] font-extrabold tracking-[.08em] ${light ? 'text-white' : 'text-brand-deep'}`}>ANDOU DIINEMA</span>
        {!compact && <span className={`mt-0.5 block text-[10.5px] font-medium tracking-wide ${light ? 'text-emerald-200' : 'text-brand'}`}>Réveil & transformation</span>}
      </span>
    </span>
  )
}
