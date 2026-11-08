# VITRINE CHIC — Boutique de mode (site vitrine)

Site vitrine e-commerce React + Tailwind CSS, **sans backend et sans
base de données**. Les commandes se font directement via WhatsApp,
et le panier est sauvegardé dans le navigateur (localStorage).

## 🚀 Démarrer en local

Ce projet a été écrit entièrement mais **n'a pas encore été
installé** (l'environnement de génération n'avait pas accès à
Internet pour télécharger les paquets npm). Sur ton ordinateur, avec
Node.js installé :

```bash
npm install
npm run dev
```

Le site s'ouvre sur `http://localhost:5173`.

Pour générer la version prête à publier :

```bash
npm run build
```

Le résultat est généré dans le dossier `dist/` — c'est ce dossier
qu'il faut déployer.

## 🌐 Déployer en ligne (gratuit)

Le plus simple : **Vercel** ou **Netlify**.

1. Mets ce dossier dans un repository GitHub.
2. Sur [vercel.com](https://vercel.com) (ou netlify.com), clique sur
   "New Project", connecte le repo. Vercel détecte automatiquement
   Vite et configure tout seul la commande de build (`npm run
   build`) et le dossier de sortie (`dist`).
3. Clique sur "Deploy". Ton site est en ligne en 1-2 minutes.

## ✏️ Personnaliser la boutique

### 1. Numéro WhatsApp, réseaux sociaux, adresse

Tout est dans **`src/config.js`** :

```js
whatsappNumber: "221705704121", // ton numéro, indicatif + numéro, sans "+"
instagram: "https://instagram.com/...",
tiktok: "https://tiktok.com/@...",
```

### 2. Produits

Tout est dans **`src/data/products.js`**. Chaque produit est un bloc :

```js
{
  id: 13,
  name: "Nom du produit",
  category: "femmes", // ou "hommes"
  description: "...",
  price: 20000,
  oldPrice: null,      // mets un prix ici pour activer une promo
  image: "/images/products/mon-produit.jpg",
  images: ["/images/products/mon-produit.jpg", "..."],
  sizes: ["S", "M", "L"],
  colors: ["Noir", "Beige"],
  stock: 10,
  featured: true,
  isNew: true,
  isBestSeller: false,
}
```

Pour ajouter un produit : copie un bloc existant et modifie-le.
Pour le supprimer : efface son bloc.

### 3. Photos

Tant qu'aucune vraie photo n'est fournie, chaque produit affiche un
visuel élégant généré automatiquement (silhouette + nom du produit),
sans aucun fichier image à gérer.

Pour ajouter tes vraies photos :

1. Mets tes fichiers (`.jpg` ou `.webp`, environ 1000×1250px,
   compressés pour le web) dans `public/images/products/`.
2. Dans `src/data/products.js`, renseigne les champs `image` et
   `images` du produit avec le chemin du fichier, par exemple :

```js
image: "/images/products/robe-satin-emeraude.jpg",
images: [
  "/images/products/robe-satin-emeraude.jpg",
  "/images/products/robe-satin-emeraude-2.jpg",
],
```

Dès qu'un produit a un `image` renseigné, sa vraie photo remplace
automatiquement le visuel généré — pas besoin de toucher au code.

### 4. Couleurs / style

La palette (noir, beige, doré) est définie dans
`tailwind.config.js` (`ink`, `cream`, `sand`, `gold`, `goldDark`).

## 📦 Structure du projet

```
src/
  config.js              → WhatsApp, réseaux sociaux, adresse
  data/products.js        → catalogue des produits
  context/CartContext.jsx → logique du panier (localStorage)
  utils/whatsapp.js        → génération des messages WhatsApp
  components/              → Navbar, Footer, ProductCard, CartDrawer,
                              Placeholder (visuels générés)...
  pages/                   → Accueil, Boutique, Produit, Collections, Contact
public/images/products/   → tes vraies photos, une fois ajoutées
```

## ✅ Fonctionnalités incluses

- Accueil avec bannière, nouveautés, meilleures ventes, promos,
  collections hommes/femmes
- Catalogue avec recherche + filtres (catégorie, prix, taille,
  couleur)
- Page produit avec galerie, sélection taille/couleur/quantité,
  produits similaires
- Commande directe sur WhatsApp (produit seul ou panier complet)
  avec message préformaté
- Panier persistant (localStorage) : ajout, suppression,
  modification de quantité, total
- 100% responsive (mobile, tablette, desktop)
- Aucune base de données, aucun backend, aucun paiement en ligne
