import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE = 'ANDOU DIINEMA'
const DEFAULT_DESC = "Plateforme islamique de réveil et de transformation spirituelle : comprendre les péchés banalisés, se repentir et changer, avec le Coran et la Sunna."

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

export default function Seo({ title, description = DEFAULT_DESC, noindex = false }) {
  const { pathname } = useLocation()
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : `${SITE} — Ouvre les yeux, purifie ton cœur et rapproche-toi d'Allah`
    document.title = full
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', window.location.origin + pathname)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    const canon = document.head.querySelector('link[rel="canonical"]')
    if (canon) canon.setAttribute('href', window.location.origin + pathname)
  }, [title, description, noindex, pathname])
  return null
}
