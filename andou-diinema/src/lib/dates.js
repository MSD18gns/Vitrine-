// Dates au format local AAAA-MM-JJ (fuseau de l'utilisateur)
export const dayKey = (d = new Date()) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const addDays = (key, n) => {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + n))
}
export const lastDays = (n, from = dayKey()) => Array.from({ length: n }, (_, i) => addDays(from, i - n + 1))
export const formatDay = (key, opts = { weekday: 'long', day: 'numeric', month: 'long' }) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', opts)
}
export const dayOfYear = (d = new Date()) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)
export const hijriToday = () => {
  try {
    return new Intl.DateTimeFormat('fr-FR-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  } catch { return '' }
}
// Série de jours consécutifs se terminant aujourd'hui (ou hier)
export const streak = (daysSet) => {
  let k = dayKey()
  if (!daysSet.has(k)) k = addDays(k, -1)
  let n = 0
  while (daysSet.has(k)) { n++; k = addDays(k, -1) }
  return n
}
