// Réponses PRÉDÉFINIES et LOCALES pour la démo. Ce n'est PAS une intelligence artificielle :
// on cherche des mots-clés et on renvoie une réponse écrite à l'avance.
// Mahmoud ne donne aucun avis religieux (fatwa) et ne cite aucun texte ici :
// il oriente vers les rubriques du site et vers des personnes qualifiées.

const INTENTS = [
  { id: 'salut', keys: ['salam', 'salut', 'bonjour', 'bonsoir', 'coucou', 'assalam'],
    reply: 'Wa alaykoum salam ! Je suis Mahmoud. Dans cette démo, je peux t\'expliquer le parcours, le repentir sur le site, ou t\'encourager.', expr: 'sourire', gesture: 'Welcome' },
  { id: 'qui', keys: ['qui es', 'tu es qui', 't\'es qui', 'ton nom', 'imam', 'savant', 'cheikh'],
    reply: 'Je suis Mahmoud, un compagnon virtuel d\'ANDOU DIINEMA. Je ne suis ni imam ni savant : pour une question religieuse précise, adresse-toi à une personne qualifiée.', expr: 'sourire', gesture: 'Explain' },
  { id: 'parcours', keys: ['parcours', 'étape', 'etape', 'monter', 'sommet', 'xp', 'niveau', 'jeu'],
    reply: 'Le parcours se grimpe comme une montagne : dix camps, trois étapes chacun. Chaque étape contient une leçon, des sources, un quiz et une petite mission. Tu ne perds jamais rien.', expr: 'ecoute', gesture: 'Point' },
  { id: 'repentir', keys: ['repentir', 'tawba', 'tawbah', 'pardon', 'pardonne', 'péché', 'peche', 'faute'],
    reply: 'La rubrique Repentir du site explique les conditions de la tawbah avec leurs sources. Le chapitre 7 du parcours est toujours ouvert. Ne désespère jamais.', expr: 'compassion', gesture: 'Encourage' },
  { id: 'priere', keys: ['prière', 'priere', 'salat', 'prier'],
    reply: 'Tu peux suivre tes prières dans « Mon suivi ». Pour les règles de la prière, consulte une personne qualifiée ou les contenus validés du site.', expr: 'ecoute', gesture: 'Explain' },
  { id: 'triste', keys: ['triste', 'découragé', 'decourage', 'fatigué', 'fatigue', 'difficile', 'nul', 'j\'arrive pas', 'je n\'arrive pas', 'perdu'],
    reply: 'Je comprends. Avance petit à petit : une seule étape aujourd\'hui suffit. Si tu traverses une vraie détresse, parles-en aussi à un proche de confiance ou à un professionnel.', expr: 'compassion', gesture: 'Encourage' },
  { id: 'aide', keys: ['aide', 'comment', 'marche', 'fonctionne', 'utiliser'],
    reply: 'Touche « Continuer » sur l\'accueil pour reprendre ton ascension. Le bouton d\'aide de chaque étape t\'explique quoi faire.', expr: 'ecoute', gesture: 'Point' },
  { id: 'merci', keys: ['merci', 'barak', 'jazak'],
    reply: 'Avec plaisir ! Qu\'Allah te facilite.', expr: 'joie', gesture: 'Nod' },
  { id: 'bye', keys: ['au revoir', 'bye', 'à plus', 'a plus', 'bonne nuit', 'salut à toi'],
    reply: 'À bientôt ! Reviens quand tu veux, je serai là.', expr: 'sourire', gesture: 'Welcome' },
]

const DEFAULT = {
  id: 'inconnu',
  reply: 'Je suis une démonstration : je ne comprends que quelques sujets (le parcours, le repentir, la prière, l\'encouragement). Je ne suis pas encore relié à une intelligence artificielle.',
  expr: 'reflexion', gesture: 'Think',
}

const norm = (s) => s.toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim()

export function localReply(question) {
  const q = norm(question)
  if (!q) return DEFAULT
  return INTENTS.find((it) => it.keys.some((k) => q.includes(k))) || DEFAULT
}

export const SUGGESTIONS = ['Salam !', 'Qui es-tu ?', 'Comment marche le parcours ?', 'Je suis découragé', 'Parle-moi du repentir']
