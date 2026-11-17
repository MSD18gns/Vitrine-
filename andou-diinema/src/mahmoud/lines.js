// Phrases de Mahmoud en français, wolof et pulaar.
// ⚠️ Wolof et pulaar : traductions de travail, à faire relire par des locuteurs natifs
// (comme le reste de l'interface). Aucune parole religieuse n'est citée ici.
// Toute phrase absente dans une langue s'affiche en français.

export const LINES = {
  fr: {
    'app:open': ['Assalamou alaykoum ! Je suis Mahmoud, ton compagnon de route.', 'Content de te revoir. On continue l\'ascension ensemble ?'],
    'lesson:start': ['On commence. Prends ton temps et lis tranquillement.', 'Nouvelle étape : je reste à côté de toi.', 'Installe-toi, cette étape est faite pour toi.'],
    'answer:correct': ['Bravo, c\'est juste !', 'Excellente réponse.', 'Bien vu, continue comme ça.'],
    'answer:wrong': ['Ce n\'est pas grave, on apprend aussi en se trompant.', 'Pas tout à fait. Relis l\'explication, tu vas y arriver.', 'Aucune pénalité ici : réessaie quand tu veux.'],
    'step:end': ['Étape terminée, bravo ! Qu\'Allah te facilite la suite.', 'Encore un pas vers le sommet. Bien joué !'],
    help: ['Besoin d\'aide ? Pose-moi ta question ou choisis une suggestion.', 'Je suis là. Dis-moi ce qui te bloque.'],
  },
  wo: {
    'app:open': ['Assalaamu aleykum! Maa ngi tudd Mahmoud, sa àndandoo ci yoon wi.', 'Bég naa ci gisaat la. Ñu wéy yéeg ñun ñaar?'],
    'lesson:start': ['Ñu tàmbali. Jël sa jot te jàng ak dal.', 'Jéego bu bees: maa ngi ci sa wet.', 'Toogal bu baax, jéego bii ngir yaw la.'],
    'answer:correct': ['Baax na, dëgg la!', 'Tontu bu rafet la.', 'Xam nga ko bu baax, wéyal noonu.'],
    'answer:wrong': ['Du dara, ku juum dafay jàng tamit.', 'Du loolu tamit. Jàngaatal leeral bi, dinga ko am.', 'Amul benn mbugal fii: jéemaatal saa su la neexee.'],
    'step:end': ['Jéego bi jeex na, baax na! Yàlla na la yombal li ci des.', 'Beneen jéego ci kaw tund bi. Def nga ko bu baax!'],
    help: ['Soxla nga ndimbal? Laaj ma sa laaj walla tànn benn ci li ñu la digal.', 'Maa ngi fi. Wax ma li la tee dem.'],
  },
  ff: {
    'app:open': ['Assalaamu aleykum! Ko Mahmoud mi wiyetee, mi gonndiiɗo maa e laawol ngol.', 'Mi weltiima yiyde maa kadi. En jokka ƴentugol ngol wondude?'],
    'lesson:start': ['Fuɗɗen. Jogo sahaa maa, taro e deeƴre.', 'Tappere hesere: mi ina wondi e maa.', 'Jooɗo no moƴƴiri, tappere ndee ko an.'],
    'answer:correct': ['A moƴƴii, ko goonga!', 'Jaabawol moƴƴol.', 'A faami no moƴƴiri, jokku non.'],
    'answer:wrong': ['Wonaa hay huunde, kala juumɗo ina ekkitoo kadi.', 'Wonaa ɗum tigi. Tar kadi ɓannginol ngol, a heɓat ɗum.', 'Alaa lepte ɗoo: etaade kadi sahaa mo njiɗɗaa.'],
    'step:end': ['Tappere gasii, a moƴƴii! Alla newnu ma ko heddii.', 'Tappere goɗɗo faade e hoore waamnde. A waɗii no moƴƴiri!'],
    help: ['Aɗa sokli ballal? Lamndo kam lamndal maa walla suɓo e ko tinndinaa.', 'Mi ɗoo. Wiy kam ko haɗi maa.'],
  },
}

// Réponses locales de la conversation (démo) : mots-clés dans les trois langues, réponse dans la langue choisie
export const INTENTS = [
  { id: 'salut', keys: ['salam', 'salut', 'bonjour', 'bonsoir', 'coucou', 'assalam', 'salaam', 'na nga def', 'nanga def', 'jàmm', 'jamm', 'jam ', 'jam!', 'no mbaɗ'], expr: 'sourire', gesture: 'Welcome', reply: {
    fr: 'Wa alaykoum salam ! Je suis Mahmoud. Dans cette démo, je peux t\'expliquer le parcours, le repentir sur le site, ou t\'encourager.',
    wo: 'Maalekum salaam! Maa ngi tudd Mahmoud. Ci misaal bii, man naa la leeral yoon wi, tuub ci sit bi, walla dooleel la.',
    ff: 'Waaleykum salaam! Ko Mahmoud mi wiyetee. E ndee holleeyee, mi waawi ɓanngine maa laawol ngol, tuubtaare e lowre ndee, walla semmbinde maa.' } },
  { id: 'qui', keys: ['qui es', 'tu es qui', 't\'es qui', 'ton nom', 'imam', 'savant', 'cheikh', 'kan nga', 'yaw kan', 'sa tur', 'hommbo', 'hol mo', 'innde maa'], expr: 'sourire', gesture: 'Explain', reply: {
    fr: 'Je suis Mahmoud, un compagnon virtuel d\'ANDOU DIINEMA. Je ne suis ni imam ni savant : pour une question religieuse précise, adresse-toi à une personne qualifiée.',
    wo: 'Man Mahmoud laa, àndandoo bu wirtuwel bu ANDOU DIINEMA. Duma imaam, duma boroom xam-xam: ngir laaj bu jëm ci diine, laajal ku ko xam.',
    ff: 'Ko min Mahmoud, gonndiiɗo wirtuwel ANDOU DIINEMA. Mi wonaa imaam, mi wonaa annduɗo: e lamndal diine, lamndo neɗɗo jeyɗo ganndal.' } },
  { id: 'parcours', keys: ['parcours', 'étape', 'etape', 'monter', 'sommet', 'xp', 'niveau', 'jeu', 'yoon', 'jéego', 'yéeg', 'laawol', 'tappere', 'ƴentu'], expr: 'ecoute', gesture: 'Point', reply: {
    fr: 'Le parcours se grimpe comme une montagne : dix camps, trois étapes chacun. Chaque étape contient une leçon, des sources, un quiz et une petite mission. Tu ne perds jamais rien.',
    wo: 'Yoon wi dafa mel ni tund buñuy yéeg: fukki dal, ñetti jéego ci bu nekk. Jéego bu nekk am na njàngale, ay firnde, ay laaj ak liggéey bu tuuti. Doo ñàkk dara.',
    ff: 'Laawol ngol ina nanndi e waamnde ƴentetee: sappo ndiwgu, tati tappe e mbaadi kala. Tappere kala ina jogii jaŋde, dalillaaji, lamndaaɗe e golle tokoose. A majjintaa hay huunde.' } },
  { id: 'repentir', keys: ['repentir', 'tawba', 'tawbah', 'pardon', 'pardonne', 'péché', 'peche', 'faute', 'tuub', 'baal', 'bàkkaar', 'yaafo', 'junuubu'], expr: 'compassion', gesture: 'Encourage', reply: {
    fr: 'La rubrique Repentir du site explique les conditions de la tawbah avec leurs sources. Le chapitre 7 du parcours est toujours ouvert. Ne désespère jamais.',
    wo: 'Xaaj bu « Tuub » ci sit bi day leeral sarti tuub bi ak seen firnde. Dal 7 bi ci yoon wi mi ngi ubbiku saa su nekk. Bul yàq yaakaar mukk.',
    ff: 'Taƴre « Tuubtaare » e lowre ndee ina ɓanngina sarɗiiji tuubtaare e dalillaaji majji. Ndiwgu 7 e laawol ngol ina udditii sahaa kala. Taa a ɓaɗa jikke.' } },
  { id: 'priere', keys: ['prière', 'priere', 'salat', 'prier', 'julli', 'juul'], expr: 'ecoute', gesture: 'Explain', reply: {
    fr: 'Tu peux suivre tes prières dans « Mon suivi ». Pour les règles de la prière, consulte une personne qualifiée ou les contenus validés du site.',
    wo: 'Man nga topp say julli ci « Sama topp ». Ngir àtte julli, laajal ku ko xam walla jàng li ñu wóoral ci sit bi.',
    ff: 'A waawi jokkude juulde maa e « Rewindol am ». E sarɗiiji juulde, lamndo annduɗo walla tar ko ƴeewtaa e lowre ndee.' } },
  { id: 'triste', keys: ['triste', 'découragé', 'decourage', 'fatigué', 'fatigue', 'difficile', 'nul', 'j\'arrive pas', 'je n\'arrive pas', 'perdu', 'naqar', 'tawat', 'metti', 'sonn', 'sunn', 'tampi', 'sattii'], expr: 'compassion', gesture: 'Encourage', reply: {
    fr: 'Je comprends. Avance petit à petit : une seule étape aujourd\'hui suffit. Si tu traverses une vraie détresse, parles-en aussi à un proche de confiance ou à un professionnel.',
    wo: 'Dégg naa la. Doxal ndànk ndànk: benn jéego tey doy na. Su fekkee ni nga ci naqar bu réy, waxal ko itam ak ab mbokk boo wóolu walla ab doktoor.',
    ff: 'Mi faami. Yah seeɗa seeɗa: tappere wootere hannde yonii. So aɗa e sunaare mawnde, haal ɗum kadi e banndiraaɗo mo kooliɗaa walla cafroowo.' } },
  { id: 'aide', keys: ['aide', 'comment', 'marche', 'fonctionne', 'utiliser', 'ndimbal', 'dimbali', 'naka', 'ballal', 'wallu', 'no '], expr: 'ecoute', gesture: 'Point', reply: {
    fr: 'Touche « Continuer » sur l\'accueil pour reprendre ton ascension. Le bouton d\'aide de chaque étape t\'explique quoi faire.',
    wo: 'Bësal « Wéyal yéeg gi » ci xët wu njëkk wi ngir wéy yéeg. Butoŋu ndimbal bi ci jéego bu nekk day wax li ngay def.',
    ff: 'Ñoƴƴu « Jokku ƴentugol » e hello arandeewo ngam jokkude ƴentugol maa. Butoŋ ballal e tappere kala ina ɓanngina ko ngaɗataa.' } },
  { id: 'merci', keys: ['merci', 'barak', 'jazak', 'jërëjëf', 'jerejef', 'jaaraama'], expr: 'joie', gesture: 'Nod', reply: {
    fr: 'Avec plaisir ! Qu\'Allah te facilite.', wo: 'Ak jàmm! Yàlla na la yombal.', ff: 'Ko e jam! Alla newnu.' } },
  { id: 'bye', keys: ['au revoir', 'bye', 'à plus', 'a plus', 'bonne nuit', 'ba beneen', 'ba ci kanam', 'kawrete', 'haa yeeso'], expr: 'sourire', gesture: 'Welcome', reply: {
    fr: 'À bientôt ! Reviens quand tu veux, je serai là.', wo: 'Ba beneen yoon! Ñibbisil saa su la neexee, dinaa fi nekk.', ff: 'En kawrete! Arto sahaa mo njiɗɗaa, mi woodan ɗoo.' } },
]
export const DEFAULT_REPLY = { id: 'inconnu', expr: 'reflexion', gesture: 'Think', reply: {
  fr: 'Je suis une démonstration : je ne comprends que quelques sujets (le parcours, le repentir, la prière, l\'encouragement). Je ne suis pas encore relié à une intelligence artificielle.',
  wo: 'Misaal laa rekk: dama xam ay mbir yu néew (yoon wi, tuub, julli, dooleel). Jokkooguma ak benn xel bu nit sàkk (IA).',
  ff: 'Ko holleeyee tan mi: mi faamata si wonaa geɗe seeɗa (laawol ngol, tuubtaare, juulde, semmbinde). Mi jokkondiraaki e hay ganndal sosaangal (IA).' } }

export const SUGGESTIONS = {
  fr: ['Salam !', 'Qui es-tu ?', 'Comment marche le parcours ?', 'Je suis découragé', 'Parle-moi du repentir'],
  wo: ['Salaam!', 'Yaw kan nga?', 'Naka la yoon wi doxe?', 'Dama tawat', 'Wax ma ci tuub'],
  ff: ['Jam!', 'Ko hommbo woni?', 'No laawol ngol yahrata?', 'Mi tampii', 'Haal kam e tuubtaare'],
}

// Libellés des boutons et réglages de Mahmoud
export const UI = {
  fr: { open: 'Ouvrir Mahmoud', talk: 'Parler à Mahmoud', reduce: 'Réduire Mahmoud', voiceOn: 'Activer la voix de Mahmoud', voiceOff: 'Couper la voix de Mahmoud', closeBubble: 'Fermer la bulle', help: "Demander de l'aide à Mahmoud", region: 'Mahmoud, compagnon',
    setTitle: 'Mahmoud, compagnon 3D', setSub: "Il t'accompagne sur l'accueil, le parcours et les étapes. Réponses prédéfinies, pas d'intelligence artificielle.", voiceTitle: 'Voix de Mahmoud', voiceSub: 'Utilise la voix de ton appareil.', voiceFrOnly: 'En wolof et en pulaar, Mahmoud parle par sous-titres : les appareils n\'ont pas encore de voix dans ces langues.' },
  wo: { open: 'Ubbi Mahmoud', talk: 'Wax ak Mahmoud', reduce: 'Wàññi Mahmoud', voiceOn: 'Taal baatu Mahmoud', voiceOff: 'Fay baatu Mahmoud', closeBubble: 'Tëj bataaxal bi', help: 'Laaj Mahmoud ndimbal', region: 'Mahmoud, sa àndandoo',
    setTitle: 'Mahmoud, àndandoo 3D', setSub: 'Day àndal ak yaw ci xët wu njëkk wi, yoon wi ak jéego yi. Tontu yu ñu waajal lañu, du xel bu nit sàkk (IA).', voiceTitle: 'Baatu Mahmoud', voiceSub: 'Day jëfandikoo baatu sa jumtukaay.', voiceFrOnly: 'Ci wolof ak pulaar, Mahmoud day bind li muy wax: jumtukaay yi amaguñu baat ci làkk yooyu.' },
  ff: { open: 'Uddit Mahmoud', talk: 'Haal e Mahmoud', reduce: 'Ustu Mahmoud', voiceOn: 'Huɓɓu hoolo Mahmoud', voiceOff: 'Ñif hoolo Mahmoud', closeBubble: 'Uddu ndeftere ndee', help: 'Ƴaam Mahmoud ballal', region: 'Mahmoud, gonndiiɗo',
    setTitle: 'Mahmoud, gonndiiɗo 3D', setSub: 'Ina wondi e maa e hello arandeewo, laawol ngol e tappe ɗee. Jaabawuuje ɓeyditaaɗe, wonaa ganndal sosaangal (IA).', voiceTitle: 'Hoolo Mahmoud', voiceSub: 'Ina huutoroo hoolo kaɓirgol maa.', voiceFrOnly: 'E wolof e pulaar, Mahmoud ina winnda ko o wiyata: kaɓirɗe ɗee alaa tawo hoolo e ɗemɗe ɗee.' },
}

export const line = (lang, event, i) => { const L = LINES[lang]?.[event] || LINES.fr[event]; return L ? L[i % L.length] : null }
export const ui = (lang) => ({ ...UI.fr, ...(UI[lang] || {}) })
