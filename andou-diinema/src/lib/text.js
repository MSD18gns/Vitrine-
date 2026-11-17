export const normalize = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, ' ')
export const matches = (q, ...fields) => {
  const n = normalize(q).trim()
  if (!n) return true
  const hay = normalize(fields.filter(Boolean).join(' '))
  return n.split(/\s+/).every((w) => hay.includes(w))
}
