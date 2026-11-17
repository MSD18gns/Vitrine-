// =====================================================================
//  Notifications :
//   - annonces / rappels publiés par l'équipe (table notifications)
//   - rappels personnels (notification du navigateur, à l'ouverture du site)
// =====================================================================
import { isConfigured, rest, checkDbReady } from './supabase'
import { store } from '../lib/storage'
import { dayKey } from '../lib/dates'

const READ = 'ad:notif-read'

export async function fetchAnnouncements() {
  if (!isConfigured || !(await checkDbReady())) return []
  try {
    return await rest.select('notifications', `select=id,titre,message,lien,scheduled_at&status=eq.published&scheduled_at=lte.${encodeURIComponent(new Date().toISOString())}&order=scheduled_at.desc&limit=20`)
  } catch { return [] }
}

export const readIds = () => new Set(store.get(READ, []))
export const markRead = (ids) => store.set(READ, [...new Set([...readIds(), ...ids])].slice(-200))

export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window
export const permission = () => (notificationsSupported() ? Notification.permission : 'unsupported')

export async function askPermission() {
  if (!notificationsSupported()) return 'unsupported'
  try { return await Notification.requestPermission() } catch { return 'denied' }
}

async function show(title, body, url = '/') {
  if (permission() !== 'granted') return false
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.()
    const opts = { body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', data: { url }, tag: title }
    if (reg) await reg.showNotification(title, opts)
    else new Notification(title, opts)
    return true
  } catch { return false }
}

export const testNotification = () => show('ANDOU DIINEMA', 'Les rappels sont activés. Qu\'Allah te facilite.', '/parcours')

// Rappels personnels : déclenchés une fois par jour après l'heure choisie,
// lorsque le site (ou l'application installée) est ouvert.
export const DEFAULT_PREFS = {
  bilan: { actif: false, heure: '21:30' },
  programme: { actif: false, heure: '08:00' },
  dhikr: { actif: false, heure: '18:00' },
}
const MESSAGES = {
  bilan: ['Fais le bilan de ta journée', 'Quelques minutes pour te rapprocher d\'Allah avant de dormir.', '/bilan'],
  programme: ['Ta prochaine étape t\'attend', 'Continue ton parcours, une étape à la fois.', '/parcours'],
  dhikr: ['Un moment pour le dhikr', '« N\'est-ce pas par l\'évocation d\'Allah que les cœurs se tranquillisent ? »', '/suivi'],
}

export function checkReminders(prefs) {
  const p = { ...DEFAULT_PREFS, ...(prefs || {}) }
  const now = new Date()
  const hm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const sent = store.get('ad:reminders-sent', {})
  for (const [k, v] of Object.entries(p)) {
    if (!v?.actif || !MESSAGES[k]) continue
    const key = `${k}:${dayKey()}`
    if (hm >= v.heure && !sent[key]) {
      show(...MESSAGES[k])
      sent[key] = true
    }
  }
  store.set('ad:reminders-sent', Object.fromEntries(Object.entries(sent).filter(([k]) => k.endsWith(dayKey()))))
}
