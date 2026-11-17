// =====================================================================
//  PROGRAMME DE TRANSFORMATION — 30 JOURS
// =====================================================================

export const PHASES = [
  { id: 1, jours: [1, 5], titre: 'Prendre conscience', texte: 'Identifier ses habitudes et les comportements à changer.' },
  { id: 2, jours: [6, 10], titre: 'Éloigner les tentations', texte: 'Commencer à éloigner les sources de tentation.' },
  { id: 3, jours: [11, 15], titre: 'Revenir vers Allah', texte: 'Développer le repentir et les demandes de pardon.' },
  { id: 4, jours: [16, 20], titre: 'Renforcer le lien', texte: "Renforcer les prières et le rappel d'Allah." },
  { id: 5, jours: [21, 25], titre: 'Mieux vivre avec les autres', texte: 'Améliorer les fréquentations et le comportement.' },
  { id: 6, jours: [26, 30], titre: 'Consolider', texte: 'Consolider les nouvelles habitudes et préparer la suite.' },
]

const d = (jour, mission, enseignement, verset, hadith, explication, action, invocation) =>
  ({ jour, phase: Math.ceil(jour / 5), mission, enseignement, verset, hadith, explication, action, invocation })

export const PROGRAMME = [
  d(1, "Faire le point honnêtement", "Le changement commence par la vérité sur soi.", 'rad-11', 'intention', "Allah ne change pas l'état d'une personne tant qu'elle ne change pas ce qui est en elle. Ce programme commence par une intention sincère : le faire pour Allah.", "Écris (dans ton espace privé) trois habitudes que tu veux changer, et formule ton intention.", 'coeur-ferme'),
  d(2, "Observer tes journées", "On ne change que ce que l'on voit.", 'isra-36', 'pieds-bougeront', "Nous serons interrogés sur notre vie. Observer sa journée, c'est commencer à en prendre la responsabilité.", "Note à quels moments de la journée tu te sens le plus loin d'Allah.", 'dhikr-shukr'),
  d(3, "Repérer tes déclencheurs", "Chaque habitude a un déclencheur.", 'yusuf-53', 'peche-trouble', "L'âme incite au mal. Repérer ce qui la pousse (fatigue, solitude, écran, personnes) permet d'agir avant la chute.", "Pour chaque habitude notée au jour 1, écris son déclencheur principal.", 'taawudh'),
  d(4, "Mesurer ton temps", "Le temps est un capital confié.", 'takathur-1', 'deux-bienfaits', "Beaucoup sont lésés dans leur temps libre. Savoir où il part est le premier pas pour le reprendre.", "Consulte ton temps d'écran et note-le.", 'hamm'),
  d(5, "Choisir ton premier combat", "Mieux vaut une victoire durable que dix tentatives abandonnées.", 'baqara-286', 'regularite', "Allah n'impose pas plus que la capacité. Commencer par un seul objectif rend le changement possible.", "Choisis l'habitude prioritaire à changer pendant ce programme.", 'huda-afaf'),
  d(6, "Nettoyer ton téléphone", "Fermer les portes avant de lutter.", 'nur-21', 'laisse-doute', "Shaytan avance pas à pas ; on se protège en fermant les premiers pas.", "Supprime au moins une application ou cinq abonnements qui t'éloignent d'Allah.", 'sens'),
  d(7, "Baisser le regard", "Le regard est la porte du cœur.", 'nur-30', 'regard-ali', "Le premier regard involontaire est pardonné ; le second est un choix. Aujourd'hui, entraîne-toi à détourner immédiatement.", "Pratique la règle du « premier regard » toute la journée, dans la rue et sur l'écran.", 'sens'),
  d(8, "Protéger tes nuits", "La nuit est le moment des chutes… et des plus belles adorations.", 'isra-32', 'troisieme-shaytan', "L'isolement est le terrain de Shaytan. Le soir, éloigne ce qui te met en danger.", "Laisse ton téléphone hors de la chambre cette nuit.", 'tawakkul-sortie'),
  d(9, "Remplacer plutôt que lutter", "Un vide se remplit toujours.", 'hud-114', 'crains-allah', "Les bonnes actions dissipent les mauvaises. Prévois une bonne action à la place de chaque moment à risque.", "Écris une alternative pour chacun de tes déclencheurs.", 'dhikr-shukr'),
  d(10, "Sortir de l'isolement", "On ne tient pas longtemps seul.", 'kahf-28', 'musc-forgeron', "Le bon compagnon est comme le vendeur de musc. On ne tient pas seul longtemps.", "Contacte une personne pieuse ou rends-toi à la mosquée.", 'coeur-ferme'),
  d(11, "Comprendre le repentir", "La tawbah n'est pas une honte, c'est une adoration.", 'tahrim-8', 'repentants', "Les meilleurs de ceux qui commettent des fautes sont ceux qui se repentent.", "Lis la page « Repentir » et ses quatre conditions.", 'astaghfirullah'),
  d(12, "Ta première tawbah sincère", "Regretter, arrêter, décider.", 'imran-135', 'regret', "« Le regret est repentir. » Ceux qui demandent pardon et ne persistent pas sont loués par Allah.", "Fais deux rakats puis demande pardon à Allah pour tes péchés passés, sans désespoir.", 'sayyid-istighfar'),
  d(13, "100 istighfar", "Le Prophète ﷺ demandait pardon plus de 70 fois par jour.", 'nisa-110', 'soixante-dix', "Celui qui demande pardon trouve Allah Pardonneur et Miséricordieux.", "Dis « Astaghfirullah » 100 fois aujourd'hui (utilise le compteur de dhikr).", 'astaghfirullah'),
  d(14, "Rendre un droit", "Certains péchés touchent les autres.", 'nisa-135', 'injustice', "Les droits des gens doivent être rendus ou pardonnés. L'injustice sera ténèbres au Jour dernier.", "Demande pardon à une personne que tu as blessée, ou rends ce qui ne t'appartient pas.", 'adam'),
  d(15, "Chasser le désespoir", "Aucun péché n'est plus grand que la miséricorde d'Allah.", 'zumar-53', 'nuages-ciel', "Même si tes péchés atteignaient les nuages du ciel, Allah pardonne à celui qui revient.", "Lis et médite le verset 39:53. Écris ce qu'il change pour toi.", 'yunus'),
  d(16, "La prière à l'heure", "L'œuvre la plus aimée d'Allah.", 'ankabut-45', 'priere-heure', "La prière préserve de la turpitude. Elle est la protection quotidienne du croyant.", "Prie les cinq prières à l'heure et coche-les dans ton suivi.", 'dhikr-shukr'),
  d(17, "Le dhikr après la prière", "Des paroles légères, lourdes dans la balance.", 'baqara-152', 'tasbih-priere', "Souvenez-vous de Moi, Je Me souviendrai de vous.", "Après chaque prière : 33 Subhan Allah, 33 Al-hamdu lillah, 33 Allahu akbar.", 'deux-paroles'),
  d(18, "Le Coran chaque jour", "Le meilleur d'entre vous apprend le Coran.", 'muhammad-24', 'meilleur-coran', "Le Coran se lit et se médite. Quelques versets compris valent mieux que des pages lues sans attention.", "Lis une page du Coran avec sa traduction.", 'ne-pas-devier'),
  d(19, "Le dhikr du matin et du soir", "Le dhikr est la vie du cœur.", 'rad-28', 'vivant-mort', "C'est par l'évocation d'Allah que les cœurs se tranquillisent.", "Fais ton dhikr du matin et du soir.", 'tawakkul-sortie'),
  d(20, "Une prière surérogatoire", "Se rapprocher par les nawafil.", 'imran-31', 'rapprocher-nawafil', "Le serviteur se rapproche d'Allah par les œuvres surérogatoires jusqu'à ce qu'Il l'aime.", "Ajoute deux rakats (par exemple la sunna du Fajr ou deux rakats la nuit).", 'dhikr-shukr'),
  d(21, "Faire le tri dans tes fréquentations", "On suit la religion de son ami.", 'furqan-27', 'religion-ami', "Certains regretteront au Jour dernier d'avoir pris un tel pour ami.", "Identifie une fréquentation qui t'éloigne et une qui te rapproche d'Allah.", 'coeur-ferme'),
  d(22, "Préserver ta langue", "Dire du bien ou se taire.", 'hujurat-12', 'bien-ou-silence', "La médisance est comparée à manger la chair de son frère mort.", "Une journée entière sans médisance ni moquerie.", 'kaffara-majlis'),
  d(23, "Honorer tes parents", "Ta mère, ta mère, ta mère, puis ton père.", 'isra-23', 'mere-trois', "La bonté envers les parents vient juste après la prière dans les œuvres les plus aimées.", "Rends un service à tes parents ou appelle-les, et invoque pour eux.", 'parents'),
  d(24, "Maîtriser ta colère", "Le fort est celui qui se maîtrise.", 'imran-134', 'fort-colere', "Ceux qui maîtrisent leur colère et pardonnent sont aimés d'Allah.", "Au premier signe de colère : « A'udhu billah », silence, ablutions.", 'taawudh'),
  d(25, "Un bienfait envers quelqu'un", "Aucun bien n'est petit.", 'fussilat-34', 'sourire', "Repousser le mal par le bien transforme les cœurs.", "Fais une bonne action envers quelqu'un (aide, sourire, aumône).", 'akhlaq'),
  d(26, "Relire ton parcours", "Mesurer le chemin parcouru donne la force de continuer.", 'zalzala-7', 'regularite', "Aucun atome de bien n'est perdu. Chaque effort de ces 25 jours est enregistré.", "Relis tes bilans quotidiens et note tes progrès.", 'dhikr-shukr'),
  d(27, "Préparer les rechutes", "Tomber n'est pas échouer ; ne pas se relever l'est.", 'imran-135', 'main-tendue', "Allah tend Sa main nuit et jour pour accueillir le repentir.", "Écris ton plan en cas de rechute : quoi faire dans les 10 minutes qui suivent.", 'sayyid-istighfar'),
  d(28, "La gratitude", "La reconnaissance augmente les bienfaits.", 'ibrahim-7', 'croyant-etonnant', "Si vous êtes reconnaissants, J'augmenterai pour vous.", "Écris dix bienfaits d'Allah dans ta vie.", 'dhikr-shukr'),
  d(29, "Une sadaqa", "L'aumône ne diminue pas les biens.", 'baqara-261', 'sadaqa-diminue', "La dépense dans le bien est multipliée comme un grain qui donne sept épis.", "Fais une aumône, même petite, avec une intention sincère.", 'dunya-akhira'),
  d(30, "Préparer la suite", "La persévérance est le vrai succès.", 'ankabut-69', 'laisse-pour-allah', "Allah guide sur Ses chemins ceux qui luttent pour Lui. Ce que tu as laissé pour Lui, Il le remplace par mieux.", "Choisis tes trois habitudes à garder et le prochain combat à mener. Tu peux recommencer le programme.", 'coeur-ferme'),
]
