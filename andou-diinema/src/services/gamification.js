// =====================================================================
//  Progression motivante — principes :
//  - On GAGNE toujours (XP, lumière, badges). On ne perd jamais rien.
//  - Une journée manquée ne retire rien : la série repart, avec un mot
//    d'accueil bienveillant. Aucun lien avec les péchés commis.
//  - Le repentir et les enseignements ne sont jamais bloqués.
//  - Tout peut être masqué (« mode sobre ») dans le profil.
// =====================================================================
import { ETAPES, CHAPITRES } from '../content/parcours'
import { dayKey, addDays } from '../lib/dates'

export const XP = { etape: 20, quizParfait: 5, revision: 5, mission: 10, bilan: 10, priere: 2, dhikrPar10: 1, dhikrMaxJour: 10 }
export const OBJECTIFS = [
  { xp: 10, label: 'Tranquille', texte: '1 petite activité' },
  { xp: 30, label: 'Régulier', texte: '1 étape du parcours' },
  { xp: 50, label: 'Engagé', texte: '2 étapes ou plus' },
  { xp: 80, label: 'Intense', texte: 'Parcours + suivi' },
]
export const DEFAULT_GOAL = 30

export const NIVEAUX = ['Éveil', 'Prise de conscience', 'Premiers pas', 'Persévérance', 'Constance', 'Sérénité', 'Lumière', 'Cœur apaisé', 'Cœur attaché', 'Cœur reconnaissant']
const XP_PAR_NIVEAU = 120

export function niveauDe(xp) {
  const n = Math.floor(xp / XP_PAR_NIVEAU)
  return { niveau: n + 1, nom: NIVEAUX[Math.min(n, NIVEAUX.length - 1)], dansNiveau: xp - n * XP_PAR_NIVEAU, requis: XP_PAR_NIVEAU }
}

export const BADGES = [
  { id: 'premier-pas', titre: 'Premier pas', texte: 'Terminer ta première étape', icon: 'Footprints', test: (s) => s.etapesFaites >= 1 },
  { id: 'chercheur', titre: 'Chercheur de savoir', texte: 'Terminer 5 étapes', icon: 'BookOpen', test: (s) => s.etapesFaites >= 5 },
  { id: 'voyageur', titre: 'Voyageur', texte: 'Terminer 15 étapes', icon: 'Compass', test: (s) => s.etapesFaites >= 15 },
  { id: 'parcours-complet', titre: 'Chemin accompli', texte: 'Terminer les 30 étapes', icon: 'Mountain', test: (s) => s.etapesFaites >= ETAPES.length },
  ...CHAPITRES.map((c) => ({ id: `chapitre-${c.id}`, titre: c.titre, texte: `Terminer le chapitre ${c.id}`, icon: 'Award', chapitre: c.id, test: (s) => s.chapitresFaits.includes(c.id) })),
  { id: 'serie-3', titre: 'Trois jours', texte: '3 jours de progression d\'affilée', icon: 'Flame', test: (s) => s.meilleureSerie >= 3 },
  { id: 'serie-7', titre: 'Une semaine', texte: '7 jours de progression d\'affilée', icon: 'Flame', test: (s) => s.meilleureSerie >= 7 },
  { id: 'serie-30', titre: 'Un mois', texte: '30 jours de progression d\'affilée', icon: 'Flame', test: (s) => s.meilleureSerie >= 30 },
  { id: 'quiz-5', titre: 'Esprit attentif', texte: 'Réussir 5 quiz du premier coup', icon: 'Target', test: (s) => s.quizParfaits >= 5 },
  { id: 'reflexion-5', titre: 'Cœur qui réfléchit', texte: 'Écrire 5 réflexions personnelles', icon: 'PenLine', test: (s) => s.reflexions >= 5 },
  { id: 'repentir', titre: 'Le retour', texte: 'Terminer le chapitre du repentir', icon: 'DoorOpen', test: (s) => s.chapitresFaits.includes(7) },
  { id: 'bilan-7', titre: 'Introspection', texte: 'Faire 7 bilans quotidiens', icon: 'CalendarCheck', test: (s) => s.bilans >= 7 },
  { id: 'prieres-35', titre: 'Fidèle à la prière', texte: 'Suivre 35 prières', icon: 'Landmark', test: (s) => s.prieres >= 35 },
  { id: 'programme-10', titre: 'Dix missions', texte: '10 missions du programme de 30 jours', icon: 'Sparkles', test: (s) => s.missions >= 10 },
  { id: 'niveau-5', titre: 'Constance', texte: 'Atteindre le niveau 5', icon: 'Gem', test: (s) => s.niveau.niveau >= 5 },
]

function longestStreak(days) {
  const sorted = [...days].sort()
  let best = 0, cur = 0, prev = null
  for (const d of sorted) {
    cur = prev && addDays(prev, 1) === d ? cur + 1 : 1
    best = Math.max(best, cur); prev = d
  }
  return best
}
function currentStreak(days) {
  let k = dayKey()
  if (!days.has(k)) k = addDays(k, -1)
  let n = 0
  while (days.has(k)) { n++; k = addDays(k, -1) }
  return n
}

// rows : { lessons, programme (historique), prayers, reviews, dhikr }
export function computeStats({ lessons = [], programme = [], prayers = [], reviews = [], dhikr = [] }, goal = DEFAULT_GOAL) {
  const today = dayKey()
  const xpByDay = {}
  const add = (day, n) => { xpByDay[day] = (xpByDay[day] || 0) + n }

  const faites = new Set()
  let quizParfaits = 0, reflexions = 0
  const historique = []
  const tri = [...lessons].sort((a, b) => a.day.localeCompare(b.day))
  for (const r of tri) {
    const premiere = !faites.has(r.ref)
    const gain = premiere ? XP.etape + (r.data?.parfait ? XP.quizParfait : 0) : XP.revision
    add(r.day, gain)
    if (premiere) { faites.add(r.ref); if (r.data?.parfait) quizParfaits++ }
    if (r.data?.reflexion) reflexions++
    historique.push({ ref: r.ref, day: r.day, xp: gain, premiere })
  }
  for (const m of programme) add(m.day, XP.mission)
  for (const r of reviews) add(r.day, XP.bilan)
  for (const p of prayers) add(p.day, XP.priere)
  for (const d of dhikr) add(d.day, Math.min(XP.dhikrMaxJour, Math.floor((d.value || 0) / 10) * XP.dhikrPar10))

  const xp = Object.values(xpByDay).reduce((a, b) => a + b, 0)
  const actifs = new Set(Object.keys(xpByDay).filter((d) => xpByDay[d] > 0))
  const xpJour = xpByDay[today] || 0
  const serie = currentStreak(actifs)
  const hier = addDays(today, -1)
  const chapitresFaits = CHAPITRES.filter((c) => ETAPES.filter((e) => e.chap === c.id).every((e) => faites.has(e.id))).map((c) => c.id)

  const s = {
    xp, xpJour, xpByDay, objectif: goal, objectifAtteint: xpJour >= goal,
    lumiere: Math.min(5, Math.floor((xpJour / goal) * 5)),
    serie, meilleureSerie: longestStreak(actifs), actifAujourdhui: actifs.has(today),
    retour: !actifs.has(today) && !actifs.has(hier) && actifs.size > 0, // revient après une pause
    joursActifs: actifs.size,
    etapesFaites: faites.size, faites, quizParfaits, reflexions,
    chapitresFaits,
    missions: programme.length, bilans: reviews.length, prieres: prayers.length,
    historique: historique.reverse(),
  }
  s.niveau = niveauDe(xp)
  s.badges = BADGES.filter((b) => b.test(s)).map((b) => b.id)
  return s
}

// Étapes : statut de chaque étape du chemin
export function etatDesEtapes(faites) {
  let courante = null
  const etats = {}
  ETAPES.forEach((e, i) => {
    const chap = CHAPITRES.find((c) => c.id === e.chap)
    const precedenteFaite = i === 0 || faites.has(ETAPES[i - 1].id)
    const ouverte = faites.has(e.id) || precedenteFaite || chap?.toujoursOuvert
    let st = faites.has(e.id) ? 'faite' : ouverte ? 'ouverte' : 'verrouillee'
    if (!courante && st === 'ouverte' && precedenteFaite) { courante = e.id; st = 'courante' }
    etats[e.id] = st
  })
  if (!courante) { const first = ETAPES.find((e) => etats[e.id] === 'ouverte'); if (first) { courante = first.id; etats[first.id] = 'courante' } }
  return { etats, courante }
}

export const messageSerie = (s) => {
  if (s.retour) return 'Bon retour ! Chaque jour est un nouveau départ.'
  if (s.serie === 0) return 'Commence ta série aujourd\'hui.'
  if (!s.actifAujourdhui) return `${s.serie} jour${s.serie > 1 ? 's' : ''} d'affilée — continue aujourd'hui !`
  return `${s.serie} jour${s.serie > 1 ? 's' : ''} d'affilée, ma sha Allah !`
}
