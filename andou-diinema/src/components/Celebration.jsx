import { useEffect, useRef } from 'react'

// Confettis légers (canvas, ~1,8 s), désactivés si l'utilisateur préfère moins d'animations
export function Confetti({ fire, pieces = 110 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!fire) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = (c.width = innerWidth * dpr), H = (c.height = innerHeight * dpr)
    const colors = ['#075B40', '#13865B', '#7FD1A8', '#E8F5ED', '#F2C94C', '#ffffff']
    const ps = Array.from({ length: pieces }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35,
      vx: (Math.random() - 0.5) * 14 * dpr, vy: (-Math.random() * 14 - 6) * dpr,
      s: (Math.random() * 6 + 5) * dpr, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      c: colors[(Math.random() * colors.length) | 0], star: Math.random() < 0.25,
    }))
    let raf, t0 = performance.now()
    const tick = (t) => {
      const el = t - t0
      ctx.clearRect(0, 0, W, H)
      for (const p of ps) {
        p.vy += 0.45 * dpr; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c
        ctx.globalAlpha = Math.max(0, 1 - el / 1900)
        if (p.star) { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (Math.PI / 4) * i, rr = i % 2 ? p.s * 0.35 : p.s * 0.8; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) } ctx.fill() }
        else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2)
        ctx.restore()
      }
      if (el < 1900) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, W, H)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fire, pieces])
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[90] h-full w-full" aria-hidden="true" />
}

// Compteur animé (XP gagnés…)
export function CountUp({ to, duration = 900, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { el.textContent = to; return }
    let raf; const t0 = performance.now()
    const tick = (t) => { const k = Math.min(1, (t - t0) / duration); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])
  return <span ref={ref} className={className}>0</span>
}
