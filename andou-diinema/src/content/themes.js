// =====================================================================
//  PAGES THÉMATIQUES — cœur, pièges, conséquences, repentir, reconstruction
// =====================================================================

export const THEMES = {
  coeur: {
    titre: 'Ce qui endurcit le cœur',
    sousTitre: "Le cœur est le roi du corps. Comprendre ce qui l'endurcit, c'est apprendre à le protéger.",
    intro: "Le Prophète ﷺ a enseigné que le cœur est le centre de tout : s'il est sain, tout le corps l'est. Le Coran décrit des cœurs qui se sont endurcis « comme des pierres ou plus durs encore ». Voici les causes mentionnées par les textes et expliquées par les savants. Nul ne peut juger de l'état du cœur d'une autre personne : ces explications servent à s'examiner soi-même, jamais à juger autrui.",
    avertissement: "Seul Allah connaît l'état réel des cœurs. Cette page t'aide à t'examiner toi-même, jamais à juger les autres.",
    versetsCles: ['baqara-74', 'hadid-16', 'mutaffifin-14'],
    hadithsCles: ['morceau-chair', 'point-noir'],
    items: [
      { titre: "S'habituer aux péchés", texte: "Chaque péché non suivi de repentir laisse une trace. Le hadith du « point noir » explique comment la répétition finit par recouvrir le cœur : c'est le « ran » mentionné dans la sourate Al-Mutaffifin.", versets: ['mutaffifin-14'], hadiths: ['point-noir'] },
      { titre: 'Ne plus ressentir de remords', texte: "Le croyant voit ses péchés comme une montagne prête à tomber ; celui dont le cœur s'est endurci les voit comme une mouche qu'il chasse d'un geste. La disparition de la gêne est un signal d'alarme.", hadiths: ['montagne', 'peche-trouble'] },
      { titre: "Négliger le rappel d'Allah", texte: "Celui qui oublie Allah finit par s'oublier lui-même. Le dhikr est la vie du cœur ; son absence le dessèche.", versets: ['hashr-19', 'taha-124', 'rad-28'], hadiths: ['vivant-mort'] },
      { titre: "L'orgueil", texte: "L'orgueil ferme le cœur à la vérité et au conseil. C'est la maladie qui a fait chuter Iblis.", versets: ['luqman-18'], hadiths: ['orgueil'] },
      { titre: 'La jalousie', texte: "Le hasad occupe le cœur de ce que possèdent les autres et l'empêche de se tourner vers Allah avec gratitude.", versets: ['nisa-54'], hadiths: ['pas-envie'] },
      { titre: 'La haine et la rancœur', texte: "La rancœur durcit le cœur et détruit la fraternité. Le Coran enseigne de demander à Allah un cœur sans rancœur.", versets: ['hashr-10'], hadiths: ['pas-envie'] },
      { titre: "L'attachement excessif à ce monde", texte: "La course aux biens et aux apparences distrait jusqu'à la tombe. Le croyant vit dans ce monde comme un voyageur.", versets: ['takathur-1', 'hadid-20'], hadiths: ['etranger-voyageur', 'deux-vallees'] },
      { titre: 'Les mauvaises fréquentations', texte: "L'entourage influence la religion. Le cœur se façonne au contact de ceux qu'on aime.", versets: ['furqan-27'], hadiths: ['religion-ami', 'musc-forgeron'] },
      { titre: 'Les distractions permanentes', texte: "Un cœur constamment distrait n'a plus de place pour la méditation, la prière recueillie et la réflexion.", versets: ['munafiqun-9', 'muminun-1'], hadiths: ['delaisser-inutile'] },
      { titre: 'La négligence des obligations', texte: "La prière préserve de la turpitude. La négliger retire au cœur sa protection quotidienne.", versets: ['ankabut-45'], hadiths: ['riviere', 'abandon-priere'] },
    ],
    remedes: ["Faire suivre chaque péché d'un repentir immédiat.", "Le dhikr régulier, matin et soir.", "La lecture méditée du Coran.", "Se souvenir de la mort et visiter les tombes.", "Fréquenter les gens de bien.", "Faire l'aumône et aider les plus faibles.", "Invoquer : « Ô Toi qui retournes les cœurs, affermis mon cœur sur Ta religion. »"],
  },

  pieges: {
    titre: 'Les pièges de Shaytan',
    sousTitre: "Shaytan ne pousse jamais d'un coup vers le grand péché : il avance pas à pas.",
    intro: "Le Coran présente Shaytan comme un ennemi déclaré, qui embellit le mal et suggère dans les poitrines. Mais il rappelle aussi qu'il n'a aucun pouvoir sur ceux qui croient et placent leur confiance en Allah. Connaître ses pièges, c'est déjà s'en protéger.",
    versetsCles: ['fatir-6', 'nur-21', 'nahl-99', 'ibrahim-22'],
    hadithsCles: ['sang-shaytan'],
    items: [
      { titre: 'Les tentations', texte: "Il embellit l'interdit pour le rendre attirant : « je leur embellirai la vie sur terre ».", versets: ['hijr-39', 'imran-14'], hadiths: ['entoure-desirs'], protection: "Fermer les portes, baisser le regard, s'éloigner des lieux de tentation." },
      { titre: 'Les waswas (suggestions)', texte: "Il souffle des pensées, des doutes et des obsessions. Les pensées non voulues ne sont pas des péchés tant qu'on ne les met pas en acte.", versets: ['nas-1'], hadiths: ['pense-pardonne', 'qui-a-cree'], protection: "Chercher refuge en Allah, ne pas s'attarder sur la pensée, réciter les deux dernières sourates du Coran." },
      { titre: 'Les désirs', texte: "Il s'appuie sur les passions de l'âme. Celui qui suit sa passion sans limite en fait une « divinité ».", versets: ['jathiya-23', 'nazi-40'], hadiths: ['jeunes-mariage'], protection: "Le jeûne, le mariage pour qui le peut, l'occupation utile du temps." },
      { titre: 'Les mauvaises fréquentations', texte: "Il utilise aussi les humains : le mauvais conseiller peut être « djinn ou humain » (sourate An-Nas).", versets: ['nas-1', 'furqan-27'], hadiths: ['religion-ami'], protection: "Choisir ses amis avec soin et rejoindre les gens de bien." },
      { titre: 'La colère', texte: "La colère fait perdre le contrôle et prononcer des paroles regrettées. Le Prophète ﷺ a enseigné un remède direct.", versets: ['imran-134'], hadiths: ['refuge-colere', 'pas-colere', 'fort-colere'], protection: "Dire « A'udhu billahi mina sh-shaytani r-rajim », se taire, changer de position, faire les ablutions." },
      { titre: "L'orgueil", texte: "C'est le piège dans lequel Iblis est lui-même tombé, et il le tend aux hommes.", versets: ['luqman-18'], hadiths: ['orgueil'], protection: "Accepter la vérité d'où qu'elle vienne, servir les autres." },
      { titre: 'La jalousie', texte: "Il attise la comparaison et la rancœur pour diviser les croyants.", versets: ['isra-53', 'falaq-5'], hadiths: ['pas-envie'], protection: "Faire du du'a pour les autres, aimer pour eux ce qu'on aime pour soi." },
      { titre: 'La procrastination religieuse', texte: "« Je commencerai à prier demain », « je me repentirai plus tard » : reporter est l'un de ses pièges les plus efficaces, car nul ne connaît l'heure de sa mort.", versets: ['muminun-99', 'imran-133'], hadiths: ['cinq-avant-cinq', 'agonie'], protection: "Agir maintenant, même un petit pas : une prière, un istighfar, une page." },
      { titre: 'Le désespoir après un péché', texte: "Après avoir poussé au péché, il pousse au désespoir : « Allah ne te pardonnera jamais ». C'est un mensonge : Allah pardonne tous les péchés à celui qui se repent.", versets: ['zumar-53', 'baqara-268'], hadiths: ['nuages-ciel', 'main-tendue'], protection: "Se rappeler la miséricorde d'Allah et revenir immédiatement." },
      { titre: "Les distractions qui éloignent du rappel", texte: "Il occupe le temps par le futile pour éloigner de la prière et du dhikr.", versets: ['munafiqun-9'], hadiths: ['deux-bienfaits'], protection: "Fixer des moments sacrés dans la journée, réduire les écrans." },
    ],
    protections: ["La prière à l'heure.", "Le dhikr du matin et du soir.", "Réciter Ayat al-Kursi (2:255) et les deux dernières sourates (Al-Falaq et An-Nas).", "Dire « Bismillah » avant chaque action.", "Être en état d'ablution.", "La compagnie des gens de bien.", "Chercher refuge en Allah dès qu'une suggestion apparaît."],
  },

  consequences: {
    titre: 'Les conséquences',
    sousTitre: "Avertir sans exagérer, rappeler sans faire perdre espoir.",
    intro: "Le Coran et la Sunna parlent des conséquences des actes avec équilibre : l'avertissement va toujours de pair avec la miséricorde. Cette page présente ce que disent les textes, sans exagération ni invention.",
    versetsCles: ['zalzala-7', 'imran-185'],
    hadithsCles: ['misericorde-devance'],
    items: [
      { titre: 'Les conséquences spirituelles des péchés', texte: "Le péché affaiblit la foi, retire la douceur de l'adoration et crée une distance avec Allah. Les savants ont mentionné de nombreux effets : tristesse du cœur, difficulté dans les affaires, perte de la baraka.", versets: ['taha-124'], hadiths: ['point-noir'] },
      { titre: "L'endurcissement du cœur", texte: "La répétition des péchés sans repentir recouvre le cœur, jusqu'à ce qu'il ne reconnaisse plus le bien.", versets: ['mutaffifin-14', 'baqara-74'], hadiths: ['point-noir'] },
      { titre: 'La banalisation des interdits', texte: "Ce qui est petit à nos yeux peut être énorme auprès d'Allah. Les petits péchés accumulés peuvent détruire.", versets: ['nur-15'], hadiths: ['peches-meprises', 'plus-fin-cheveu'] },
      { titre: 'La responsabilité devant Allah', texte: "Chacun sera interrogé sur sa vie, sa science, ses biens et son corps. Chaque parole est consignée.", versets: ['isra-36', 'qaf-16'], hadiths: ['pieds-bougeront'] },
      { titre: 'Le repentir', texte: "La porte reste ouverte jusqu'à l'agonie ou jusqu'au lever du soleil à l'ouest. Le repentir efface ce qui précède.", versets: ['zumar-53', 'nisa-17'], hadiths: ['agonie', 'main-tendue'] },
      { titre: 'La mort', texte: "Toute âme goûtera la mort. S'en souvenir n'est pas morbide : c'est un remède contre l'attachement excessif et la procrastination.", versets: ['imran-185', 'muminun-99'], hadiths: ['destructeur-plaisirs'] },
      { titre: 'La tombe', texte: "La tombe est la première étape de l'au-delà (le barzakh). Celui qui en est sauvé, la suite lui sera plus facile.", versets: ['muminun-99'], hadiths: ['premiere-etape'] },
      { titre: 'Le Jour du Jugement', texte: "Le jour où chaque atome de bien et de mal sera vu. Le jour où les amis deviendront ennemis, sauf les pieux.", versets: ['zalzala-7', 'zukhruf-67'], hadiths: ['pieds-bougeront', 'injustice'] },
      { titre: 'Le Paradis', texte: "Un Paradis « large comme les cieux et la terre », où se trouve ce qu'aucune âme ne peut imaginer.", versets: ['imran-133', 'sajda-17'], hadiths: ['entoure-desirs'] },
      { titre: "L'Enfer", texte: "Le Coran avertit d'un Feu réel. Il ordonne de s'en préserver soi-même et sa famille. Ce rappel vise à réveiller, non à désespérer.", versets: ['tahrim-6'], hadiths: ['entoure-desirs'] },
      { titre: "La miséricorde d'Allah", texte: "La miséricorde d'Allah embrasse toute chose et devance Sa colère. Il en a gardé quatre-vingt-dix-neuf parts pour le Jour dernier.", versets: ['araf-156', 'zumar-53'], hadiths: ['cent-parts', 'misericorde-devance'] },
    ],
  },

  repentir: {
    titre: 'Le repentir et la purification du cœur',
    sousTitre: "Quel que soit ton passé, Allah se réjouit de ton retour.",
    intro: "La tawbah n'est pas réservée aux « grands pécheurs » : c'est le chemin de tous les croyants. Le Prophète ﷺ lui-même demandait pardon plus de soixante-dix fois par jour. Voici les étapes et les vertus qui purifient le cœur.",
    versetsCles: ['tahrim-8', 'baqara-222', 'furqan-70'],
    hadithsCles: ['joie-repentir', 'repentants'],
    conditions: [
      { titre: 'Arrêter le péché', texte: "Cesser immédiatement l'acte." },
      { titre: 'Regretter sincèrement', texte: "« Le regret est repentir » (Ibn Majah 4252)." },
      { titre: 'Décider de ne pas recommencer', texte: "Une résolution ferme, même si l'on craint de rechuter." },
      { titre: 'Rendre les droits', texte: "Si le péché concerne autrui : restituer, demander pardon ou réparer." },
    ],
    items: [
      { titre: 'La tawbah (le repentir)', texte: "Revenir vers Allah avec regret, arrêt et résolution. Allah aime ceux qui se repentent.", versets: ['tahrim-8', 'baqara-222'], hadiths: ['regret', 'comme-sans-peche'] },
      { titre: "L'istighfar (demande de pardon)", texte: "La demande de pardon quotidienne purifie le cœur, même sans péché précis.", versets: ['nisa-110', 'imran-135'], hadiths: ['soixante-dix', 'sayyid-istighfar'] },
      { titre: 'La sincérité', texte: "Agir pour Allah seul. C'est la base de l'acceptation des œuvres.", versets: ['hujurat-13'], hadiths: ['intention'] },
      { titre: "L'humilité", texte: "Reconnaître sa faiblesse et ne mépriser personne.", versets: ['luqman-18', 'nisa-28'], hadiths: ['sadaqa-diminue'] },
      { titre: 'La patience', texte: "Le changement prend du temps ; la patience est récompensée sans compter.", versets: ['zumar-10', 'baqara-153'], hadiths: ['croyant-etonnant'] },
      { titre: 'La gratitude', texte: "La reconnaissance augmente les bienfaits et adoucit le cœur.", versets: ['ibrahim-7'], hadiths: ['remercier-gens', 'croyant-etonnant'] },
      { titre: 'Le pardon', texte: "Pardonner aux autres pour être pardonné par Allah.", versets: ['imran-134', 'fussilat-34'], hadiths: ['sadaqa-diminue'] },
      { titre: 'La maîtrise de la colère', texte: "La vraie force est de se maîtriser au moment de la colère.", versets: ['imran-134'], hadiths: ['fort-colere', 'refuge-colere'] },
      { titre: "L'amour d'Allah", texte: "Suivre le Prophète ﷺ et se rapprocher par les œuvres surérogatoires.", versets: ['imran-31', 'baqara-165'], hadiths: ['rapprocher-nawafil'] },
      { titre: "La lutte contre l'orgueil", texte: "Accepter la vérité et respecter les gens.", versets: ['luqman-18'], hadiths: ['orgueil'] },
      { titre: 'La lutte contre la jalousie', texte: "Aimer pour son frère ce que l'on aime pour soi-même.", versets: ['hashr-10'], hadiths: ['aimer-frere', 'pas-envie'] },
    ],
  },

  reconstruction: {
    titre: 'Reconstruire sa foi',
    sousTitre: "Petits pas réguliers, grands changements durables.",
    intro: "« Les actions les plus aimées d'Allah sont les plus régulières, même si elles sont peu nombreuses. » Voici dix habitudes à installer progressivement. Choisis-en une ou deux, puis avance.",
    versetsCles: ['rad-11', 'ankabut-69', 'taghabun-16'],
    hadithsCles: ['regularite'],
    items: [
      { titre: 'Accomplir les cinq prières', texte: "Le pilier de la religion. Commence par prier à l'heure, puis ajoute les sunnas.", versets: ['ankabut-45', 'hud-114'], hadiths: ['riviere', 'priere-heure'], action: "Active les rappels de prière et suis-les dans ton espace." },
      { titre: 'Lire et comprendre le Coran', texte: "Quelques versets par jour avec leur traduction et leur explication.", versets: ['muzzammil-4', 'muhammad-24'], hadiths: ['meilleur-coran'], action: "Lis une page par jour après la prière du Fajr." },
      { titre: 'Faire le dhikr', texte: "Le rappel d'Allah apaise les cœurs.", versets: ['rad-28', 'baqara-152'], hadiths: ['deux-paroles', 'tasbih-priere'], action: "Utilise le compteur de dhikr de ton espace." },
      { titre: 'Apprendre les invocations', texte: "Une invocation par semaine, pour chaque moment de la journée.", versets: ['baqara-201'], hadiths: ['meilleur-dhikr'], action: "Ajoute une invocation à tes favoris chaque semaine." },
      { titre: 'Améliorer sa pudeur', texte: "Dans le vêtement, le regard, la parole et les publications.", versets: ['araf-26', 'nur-30'], hadiths: ['pudeur'], action: "Choisis un point concret à améliorer cette semaine." },
      { titre: "S'éloigner des fréquentations dangereuses", texte: "Et rejoindre des gens qui rappellent Allah.", versets: ['kahf-28'], hadiths: ['musc-forgeron'], action: "Rejoins une activité de ta mosquée." },
      { titre: 'Respecter les parents', texte: "Douceur, service et invocations.", versets: ['isra-23'], hadiths: ['mere-trois'], action: "Appelle ou visite tes parents aujourd'hui." },
      { titre: 'Aider les autres', texte: "Le sourire, le service, l'écoute : aucun bien n'est petit.", versets: ['nahl-90'], hadiths: ['sourire'], action: "Rends un service discret cette semaine." },
      { titre: 'Faire la sadaqa', texte: "L'aumône ne diminue pas les biens ; elle purifie le cœur.", versets: ['baqara-261'], hadiths: ['sadaqa-diminue'], action: "Donne régulièrement, même peu." },
      { titre: 'Améliorer son comportement', texte: "Le bon caractère est le plus lourd dans la balance.", versets: ['fussilat-34'], hadiths: ['balance-caractere', 'crains-allah'], action: "Fais ton bilan quotidien chaque soir." },
    ],
  },
}

// ---------------------------------------------------------------------
//  COMMENT SORTIR DES PÉCHÉS — méthode en 9 étapes
// ---------------------------------------------------------------------
export const METHODE = [
  { titre: 'Identifier le problème', texte: "Nomme précisément l'habitude, sans te mépriser. « Je regarde des contenus interdits le soir » est plus utile que « je suis un mauvais musulman ».", exemple: "Écris en une phrase : quoi, quand, où, avec qui." },
  { titre: 'Comprendre pourquoi il est dangereux', texte: "Lis les versets et hadiths qui en parlent. Comprendre renforce la motivation.", exemple: "Lis l'article correspondant dans la bibliothèque." },
  { titre: 'Reconnaître les déclencheurs', texte: "Fatigue, solitude, ennui, colère, certains lieux ou certaines personnes : chaque habitude a ses déclencheurs.", exemple: "Note pendant 3 jours les moments où l'envie apparaît." },
  { titre: 'Éloigner les sources de tentation', texte: "Supprime les accès, change l'environnement. Ne compte pas uniquement sur ta volonté.", exemple: "Désinstaller une application, sortir le téléphone de la chambre, couper un contact." },
  { titre: 'Remplacer la mauvaise habitude', texte: "Un vide se remplit toujours. Prévois une alternative pour chaque déclencheur.", exemple: "Ennui → marche ou lecture ; colère → ablutions ; solitude → appeler un ami pieux." },
  { titre: 'Installer de nouvelles habitudes', texte: "Commence petit et régulier : les actions les plus aimées d'Allah sont les plus constantes.", exemple: "5 minutes de dhikr après chaque prière." },
  { titre: 'Se repentir sincèrement', texte: "Arrêter, regretter, décider de ne pas recommencer, rendre les droits si nécessaire.", exemple: "Deux rakats de repentir suivies du Sayyid al-istighfar." },
  { titre: 'Apprendre à gérer les rechutes', texte: "Une rechute n'annule pas tes efforts. Shaytan veut que tu abandonnes ; Allah veut que tu reviennes.", exemple: "Après une chute : ablutions, istighfar, analyse du déclencheur, reprise immédiate." },
  { titre: 'Persévérer dans le changement', texte: "Le combat contre l'âme dure toute la vie. Allah guide ceux qui luttent pour Lui.", exemple: "Suis ton programme de 30 jours et fais ton bilan chaque soir." },
]

export const GUIDES = [
  { titre: 'Sortir de la pornographie', article: 'pornographie', declencheurs: ['Téléphone au lit', 'Solitude nocturne', 'Stress ou tristesse'], remplacement: ['Téléphone hors de la chambre', 'Dormir après Isha', 'Sport et jeûne'], exemple: "Karim, 22 ans, a installé un filtre, a confié son téléphone à son frère la nuit et s'est inscrit à une salle de sport. Après plusieurs rechutes, il a tenu en notant chaque soir son bilan." },
  { titre: 'Réduire le temps sur les réseaux', article: 'scrolling', declencheurs: ['Réveil', 'Ennui', 'Notifications'], remplacement: ['Coran au réveil', 'Limite d\'écran', 'Notifications désactivées'], exemple: "Aïcha a remplacé son premier scroll du matin par une page de Coran et a fixé une limite de 45 minutes par jour sur ses applications." },
  { titre: 'Arrêter la médisance', article: 'medisance', declencheurs: ['Groupes de discussion', 'Pauses au travail', 'Jalousie'], remplacement: ['Changer de sujet', 'Défendre l\'absent', 'Expiation de l\'assemblée'], exemple: "Moussa a pris l'habitude de dire « parlons d'autre chose » et de réciter l'invocation d'expiation à la fin de chaque réunion." },
  { titre: 'Maîtriser sa colère', article: 'insultes', declencheurs: ['Fatigue', 'Conflits familiaux', 'Jeux en ligne'], remplacement: ['Chercher refuge en Allah', 'Se taire', 'Faire les ablutions'], exemple: "Fatou s'est fixé une règle : à la première montée de colère, elle dit « A'udhu billah » et quitte la pièce cinq minutes." },
  { titre: 'Quitter une relation interdite', article: 'relations-amoureuses', declencheurs: ['Messages nocturnes', 'Solitude', 'Lieux de rencontre'], remplacement: ['Couper le contact', 'Entourage pieux', 'Projet de mariage halal'], exemple: "Ibrahima a mis fin à une relation cachée, en a parlé à son père et a entamé une démarche de mariage auprès d'une famille." },
  { titre: 'Revenir à la prière', article: 'negligence-reseaux', declencheurs: ['Écrans', 'Fatigue', 'Report « dans 5 minutes »'], remplacement: ['Téléphone posé dès l\'adhan', 'Ablutions à l\'avance', 'Suivi des prières'], exemple: "Awa a commencé par ne plus manquer le Fajr en dormant tôt, puis a ajouté chaque semaine une prière à l'heure." },
]

// ---------------------------------------------------------------------
//  CONSEILS QUOTIDIENS (rotation par jour de l'année)
// ---------------------------------------------------------------------
export const CONSEILS = [
  "Pose ton téléphone dès que tu entends l'appel à la prière.",
  "Récite « Subhana Allahi wa bihamdihi » 100 fois aujourd'hui.",
  "Fais une bonne action que personne ne connaîtra.",
  "Avant de publier, demande-toi : « Est-ce que cela plaît à Allah ? »",
  "Appelle tes parents ou fais une invocation pour eux.",
  "Lis une page du Coran avec sa traduction.",
  "Quand tu entends médire, change gentiment de sujet.",
  "Dors en état d'ablution et récite le dhikr du soir.",
  "Remplace 15 minutes de réseaux sociaux par une marche.",
  "Demande pardon à Allah 100 fois aujourd'hui : « Astaghfirullah ».",
  "Souris à quelqu'un : c'est une aumône.",
  "Baisse ton regard aujourd'hui dans la rue et sur ton écran.",
  "Note trois bienfaits d'Allah dans ta journée.",
  "Pardonne à quelqu'un qui t'a blessé.",
  "Fais deux rakats de prière surérogatoire.",
  "Supprime une application ou un abonnement qui t'éloigne d'Allah.",
  "Donne une petite aumône, même une pièce.",
  "Écoute un rappel bénéfique de 10 minutes.",
  "Renouvelle ton intention avant chaque action importante.",
  "Fais ton bilan quotidien ce soir avant de dormir.",
]
