// Réponses PRÉDÉFINIES et LOCALES pour la démo. Ce n'est PAS une intelligence artificielle :
// on cherche des mots-clés (français, wolof, pulaar) et on renvoie une réponse écrite à l'avance.
// Mahmoud ne donne aucun avis religieux (fatwa) et ne cite aucun texte ici :
// il oriente vers les rubriques du site et vers des personnes qualifiées.
import { INTENTS, DEFAULT_REPLY, SUGGESTIONS as S } from './lines'

const norm = (s) => ` ${s.toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim()} `

export function localReply(question, lang = 'fr') {
  const q = norm(question)
  const it = (q.trim() && INTENTS.find((x) => x.keys.some((k) => q.includes(k)))) || DEFAULT_REPLY
  return { ...it, reply: it.reply[lang] || it.reply.fr }
}

export const suggestions = (lang = 'fr') => S[lang] || S.fr
export const SUGGESTIONS = S.fr
