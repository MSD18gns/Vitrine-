// Tenues de Mahmoud. Le visage, le corps, le squelette et les expressions sont identiques
// pour toutes les tenues : chaque tenue est un GLB généré par le même script Blender
// (mahmoud/blender/build_mahmoud.py --outfit <id>) en ne changeant que les vêtements.
// Seule la tenue verte existe pour l'instant ; les autres emplacements sont réservés.
export const OUTFITS = {
  emeraude: { label: 'Qamis vert émeraude', glb: '/mahmoud/mahmoud.glb', portrait: '/mahmoud/mahmoud-portrait.png', disponible: true },
  // Emplacements prévus (phase 6, après validation) — aucun fichier pour l'instant :
  // blanc, beige, gris, bleu-nuit, bordeaux, noir, sable, olive, ceremonie
}
export const DEFAULT_OUTFIT = 'emeraude'
export const outfit = (id) => OUTFITS[id]?.disponible ? OUTFITS[id] : OUTFITS[DEFAULT_OUTFIT]
