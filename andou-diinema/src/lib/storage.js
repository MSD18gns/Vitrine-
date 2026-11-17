// Accès sûr au localStorage (navigation privée, stockage bloqué…)
export const store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key)
      return v === null ? fallback : JSON.parse(v)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* stockage indisponible */ }
  },
  remove(key) {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  },
  keys(prefix) {
    try { return Object.keys(localStorage).filter((k) => k.startsWith(prefix)) } catch { return [] }
  },
}
