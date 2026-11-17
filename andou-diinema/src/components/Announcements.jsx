import { useEffect, useState, useSyncExternalStore } from 'react'
import { fetchAnnouncements, readIds, markRead } from '../services/notifications'

// Petit magasin partagé : chargé une fois, partagé entre l'en-tête et la page
let state = { items: [], loaded: false }
const subs = new Set()
const emit = () => subs.forEach((f) => f())
let started = false
function load() {
  if (started) return
  started = true
  fetchAnnouncements().then((items) => { state = { items, loaded: true }; emit() })
}

export function useAnnouncements() {
  useEffect(load, [])
  const snap = useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => state)
  const [read, setRead] = useState(readIds)
  const unread = snap.items.filter((n) => !read.has(n.id)).length
  return {
    ...snap,
    unread,
    isRead: (id) => read.has(id),
    markAll: () => { markRead(snap.items.map((n) => n.id)); setRead(readIds()) },
  }
}
