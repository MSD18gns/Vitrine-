// ============================================================
// CONFIGURATION DE LA BOUTIQUE
// Modifie uniquement les valeurs ci-dessous. Rien d'autre
// dans le code n'a besoin d'être touché pour personnaliser
// les informations de contact et le numéro WhatsApp.
// ============================================================

const siteConfig = {
  // Nom de la boutique
  siteName: "VITRINE CHIC",

  // Numéro WhatsApp AVEC indicatif pays, SANS "+", SANS espaces.
  whatsappNumber: "221705704121",

  // Réseaux sociaux (laisser vide "" pour masquer le lien)
  instagram: "",
  tiktok: "",

  // Adresse physique (optionnel, laisser vide "" pour masquer)
  address: "",

  // Informations de livraison affichées dans le footer et la page produit
  deliveryInfo: "Livraison disponible à Dakar sous 24-48h. Livraison dans les autres régions sous 3-5 jours.",

  // Devise
  currency: "FCFA",

  // Connexion Supabase (catalogue produits + compteur de commandes).
  // La clé "anon" est publique par conception (protégée par les règles
  // de sécurité définies côté base de données) — rien de secret ici.
  supabaseUrl: "https://ejutptsipygbnobkrowt.supabase.co",
  supabaseAnonKey: "sb_publishable_PgdoHL0wEIOvmsKFfZqBHg_-SSHfew3",
};

export default siteConfig;
