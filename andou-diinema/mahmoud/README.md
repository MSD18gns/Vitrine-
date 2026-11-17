# Mahmoud — compagnon 3D d'ANDOU DIINEMA (prototype, tenue verte)

> Statut : **prototype à valider**. Aucune intégration dans les pages du site.
> Démo indépendante : `/labo/mahmoud` (non indexée, non reliée au menu).

Outils utilisés, tous gratuits et locaux : Blender 5.3 (module Python `bpy`), three.js 0.170,
React Three Fiber 8.18 (React 18.3 conservé), Drei 9.122, gltf-transform 4.5, Web Speech API,
Chromium + Playwright. Aucun service payant, aucune clé API, aucune base de données touchée.
(`motion` est installé pour les futures transitions d'interface ; il n'est pas encore utilisé.)

## Fichiers

| Élément | Fichier |
|---|---|
| Modèle source (script procédural) | `mahmoud/blender/build_mahmoud.py` |
| Modèle source Blender | `mahmoud/dist/mahmoud_emeraude.blend` |
| Modèle optimisé (site) | `public/mahmoud/mahmoud.glb` — 451 Ko (meshopt) |
| Portrait 2D de secours | `public/mahmoud/mahmoud-portrait.png` |
| Composant 3D (R3F) | `src/mahmoud/Mahmoud3D.jsx` (chargé à la demande) |
| Point d'entrée léger + contrôleur | `src/mahmoud/index.jsx` (`<Mahmoud />`, `useMahmoud()`) |
| Moteur de comportement | `src/mahmoud/behavior.js` |
| Voix, micro, synchronisation labiale | `src/mahmoud/speech.js` |
| Réponses locales de la démo | `src/mahmoud/replies.js` |
| Tenues | `src/mahmoud/outfits.js` |
| Compagnon flottant (Ouvrir / Réduire) | `src/mahmoud/MahmoudCompanion.jsx` |
| Démo | `src/pages/LaboMahmoud.jsx` |
| Tests | `mahmoud/tests/demo.test.mjs`, résultats `mahmoud/tests/resultats.txt` |
| Visionneuse de contrôle | `mahmoud/preview/viewer.html`, `mahmoud/preview/shoot.mjs` |

## Contenu du modèle

- 69 pièces, ~47 000 triangles, 1 squelette de 15 os (root, spine, chest, neck, head, yeux, épaules, bras, avant-bras, mains).
- **Expressions (shape keys)** : `Blink`, `Smile`, `Sad`, `BrowUp`, `BrowFrown`, `BrowSad`,
  visèmes `MouthOpen` (A), `MouthWide` (E/I), `MouthRound` (O/OU), `MouthClosed` (M/B/P).
- **Animations corporelles** : `Idle` (respiration, mouvements de tête), `Welcome`, `Explain`, `Point`,
  `Think`, `Listen`, `Nod`, `Encourage` (main sur le cœur), `Celebrate`, `Talk`.
- Visage et corps (couche os) sont **indépendants** : n'importe quelle expression se combine avec n'importe quel geste.
- Procédural dans le composant : clignements naturels, micro-mouvements des yeux, lissage des expressions.

## Utilisation (après validation)

```jsx
import Mahmoud, { useMahmoud } from '../mahmoud'
const m = useMahmoud()
<Mahmoud controller={m} framing="buste" className="h-64 w-full" />
m.react('answer:correct')            // événement → geste + expression + phrase
m.react('sacred:start')              // mode calme pendant un verset / hadith / invocation
m.say('Texte', { voice: true })      // parole (voix du navigateur) + bouche
```

Événements : `app:open`, `lesson:start`, `answer:correct`, `answer:wrong`, `step:end`, `help`,
`chat:thinking`, `chat:listening`, `sacred:start`, `sacred:end`.
Les phrases tournent dans un ordre fixe (jamais deux fois la même de suite) ; un geste rejoué trop tôt
est remplacé (ex. célébration → hochement). En mode calme, aucun grand geste ni célébration.

## Modifier Mahmoud

```bash
python3 -m venv blenv && ./blenv/bin/pip install bpy==5.3.0        # une seule fois (gratuit)
./blenv/bin/python mahmoud/blender/build_mahmoud.py                  # → mahmoud/dist/
npx gltf-transform optimize mahmoud/dist/mahmoud_raw.glb public/mahmoud/mahmoud.glb \
  --compress meshopt --simplify false --texture-compress false --join false --flatten false --instance false
```

- Couleurs (peau, barbe, tenue) : en haut du script (`SKIN`, `BEARD`, `OUTFITS`).
- Visage : section `TÊTE` (`head_shape`, `EYE_*`, `MOUTH`, `W_TOP` = contour de la barbe).
- Gestes : section `ANIMATIONS` (directions des bras + rotations de tête par image clé).
- Nouvelle tenue : ajouter une entrée dans `OUTFITS` (script) puis dans `src/mahmoud/outfits.js`,
  lancer `build_mahmoud.py --outfit <id>`. Le visage et le corps ne sont jamais modifiés par une tenue.
- Le fichier `.blend` peut aussi être ouvert dans Blender (gratuit) pour des retouches à la main.

## Rapport de tests (Chromium/Playwright, rendu logiciel SwiftShader, sans GPU)

19/19 réussis — voir `mahmoud/tests/resultats.txt` : chargement 3D (≈ 3 s sans GPU), noindex, accueil,
gestes + expressions combinés, réponses locales, aveu honnête hors sujet, mode calme, micro sans plantage,
mobile (iPhone 13) sans débordement, pause hors écran, compagnon réduire/rouvrir, portrait 2D sans WebGL
(three.js non téléchargé), pages existantes inchangées (aucune ressource Mahmoud chargée hors démo).

Poids : la 3D (three + fiber + drei) est un morceau séparé de 904 Ko (246 Ko gzip) + GLB 451 Ko,
téléchargés uniquement quand Mahmoud s'affiche. Le reste du site ne change pas.

**Non testable ici** : voix réelle (pas de synthèse vocale audible dans le conteneur), micro réel,
performances sur un vrai téléphone. À vérifier sur appareil.

## Évaluation honnête de la qualité

Ce prototype est un **personnage 3D stylisé correct**, cohérent avec la description (turban blanc,
lunettes, petite barbe noire, qamis émeraude, visage souriant) et entièrement animé. Il **n'atteint pas**
la qualité « 3D stylisé premium » d'un personnage sculpté par un artiste :

- formes simples (tête quasi sphérique, nez et oreilles en volumes basiques, mains schématiques) ;
- aucune texture (couleurs unies), pas de détails de tissu, plis, poils ou pores ;
- bras animés par rotations rigides (manches en tubes), sans simulation de tissu ;
- synchronisation labiale approximative (basée sur le texte, pas sur le son).

Solutions **gratuites** pour monter en qualité, à choisir après validation :
1. **Retouche manuelle dans Blender** (gratuit) à partir du `.blend` fourni : sculpture du visage et des mains,
   textures peintes. Demande du temps d'artiste 3D (bénévole ou membre de l'équipe).
2. **MakeHuman / MPFB2** (gratuit, licence CC0 pour les modèles produits) : base humaine réaliste
   stylisable, compatible Blender, puis même squelette, expressions et pipeline d'export.
3. **VRoid Studio** (gratuit) : personnage stylisé type anime, export VRM/GLB avec expressions intégrées —
   style différent de la référence, mais d'excellente finition.

Dans les trois cas, le composant, le moteur de comportement, la voix et la démo restent valables :
seul le fichier GLB serait remplacé (mêmes noms d'animations et d'expressions).
