// ============================================================
// CATALOGUE DES PRODUITS
// Pour AJOUTER un produit : copie un bloc { ... } et modifie-le.
// Pour MODIFIER un produit : change directement ses champs.
// Pour SUPPRIMER un produit : supprime son bloc { ... }.
//
// image / images : chemins vers /public/images/products/
// (remplace les fichiers .svg d'exemple par de vraies photos
// au même nom, ou change le chemin).
//
// category : "femmes" | "hommes"
// isNew : apparaît dans "Nouveautés"
// isBestSeller : apparaît dans "Meilleures ventes"
// (un prix "oldPrice" renseigné place le produit en "Promotions")
// ============================================================

const products = [
  {
    id: 1,
    name: "Robe Satin Émeraude",
    category: "femmes",
    description:
      "Robe longue en satin fluide, coupe cintrée et dos nu discret. Une pièce de soirée qui sublime la silhouette, pensée pour les occasions où l'élégance ne se négocie pas.",
    price: 35000,
    oldPrice: 45000,
    image: null,
    images: [],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Émeraude", "Noir", "Doré"],
    stock: 12,
    featured: true,
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 2,
    name: "Ensemble Tailleur Beige",
    category: "femmes",
    description:
      "Blazer structuré et pantalon taille haute assortis, en tissu tenue parfaite. Un vestiaire professionnel qui ne fait jamais de compromis sur le style.",
    price: 42000,
    oldPrice: null,
    image: null,
    images: [],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Beige", "Noir"],
    stock: 8,
    featured: true,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 3,
    name: "Robe Longue Dorée",
    category: "femmes",
    description:
      "Robe fourreau à fines bretelles rehaussée de reflets dorés subtils. Drapé fluide, fermeture invisible au dos.",
    price: 38000,
    oldPrice: null,
    image: null,
    images: [],
    sizes: ["S", "M", "L"],
    colors: ["Doré", "Noir"],
    stock: 6,
    featured: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 4,
    name: "Chemisier Soie Ivoire",
    category: "femmes",
    description:
      "Chemisier en soie mélangée, col lavallière amovible. Se porte aussi bien au bureau qu'en soirée.",
    price: 22000,
    oldPrice: null,
    image: null,
    images: [],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Ivoire", "Beige"],
    stock: 15,
    featured: false,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 5,
    name: "Jupe Plissée Noire",
    category: "femmes",
    description:
      "Jupe plissée mi-longue, taille haute élastiquée. Le tombé parfait pour une allure fluide au quotidien.",
    price: 18000,
    oldPrice: 23000,
    image: null,
    images: [],
    sizes: ["S", "M", "L"],
    colors: ["Noir", "Beige"],
    stock: 10,
    featured: false,
    isNew: false,
    isBestSeller: false,
  },
  {
    id: 6,
    name: "Boubou Brodé Or",
    category: "femmes",
    description:
      "Boubou traditionnel revisité, broderies dorées faites main sur voile premium. Pièce d'exception pour les grandes occasions.",
    price: 32000,
    oldPrice: null,
    image: null,
    images: [],
    sizes: ["M", "L", "XL"],
    colors: ["Doré", "Blanc"],
    stock: 5,
    featured: true,
    isNew: true,
    isBestSeller: true,
  },
  {
    id: 7,
    name: "Costume Slim Anthracite",
    category: "hommes",
    description:
      "Costume deux pièces coupe slim, laine mélangée infroissable. Veste doublée et pantalon à pinces, pour une allure impeccable en toute circonstance.",
    price: 55000,
    oldPrice: null,
    image: null,
    images: [],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Anthracite", "Noir"],
    stock: 7,
    featured: true,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 8,
    name: "Chemise Lin Blanche",
    category: "hommes",
    description:
      "Chemise en lin 100% respirant, coupe droite. L'essentiel du vestiaire masculin, parfaite sous un blazer ou portée seule.",
    price: 15000,
    oldPrice: null,
    image: null,
    images: [],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blanc", "Beige"],
    stock: 20,
    featured: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 9,
    name: "Veste Structurée Noire",
    category: "hommes",
    description:
      "Veste courte à col montant, finitions soignées et boutons dorés. Un vestiaire contemporain qui ne passe pas inaperçu.",
    price: 48000,
    oldPrice: 60000,
    image: null,
    images: [],
    sizes: ["M", "L", "XL"],
    colors: ["Noir"],
    stock: 9,
    featured: true,
    isNew: false,
    isBestSeller: false,
  },
  {
    id: 10,
    name: "Pantalon Chino Beige",
    category: "hommes",
    description:
      "Chino coupe droite en coton stretch, confortable toute la journée. Un basique indispensable décliné dans des teintes intemporelles.",
    price: 17000,
    oldPrice: null,
    image: null,
    images: [],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Beige", "Noir"],
    stock: 18,
    featured: false,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: 11,
    name: "Polo Premium Noir",
    category: "hommes",
    description:
      "Polo en piqué de coton égyptien, col et manchettes côtelés. Simplicité et qualité pour un style décontracté-chic.",
    price: 12000,
    oldPrice: null,
    image: null,
    images: [],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir", "Blanc", "Beige"],
    stock: 25,
    featured: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    id: 12,
    name: "Ensemble Tendance",
    category: "hommes",
    description:
      "Ensemble deux pièces en coton léger, coupe moderne inspirée des tenues traditionnelles revisitées. Confortable, élégant, parfait pour toutes les occasions.",
    price: 15000,
    oldPrice: null,
    image: null,
    images: [],
    sizes: ["M", "L", "XL"],
    colors: ["Noir", "Beige", "Blanc"],
    stock: 14,
    featured: true,
    isNew: false,
    isBestSeller: true,
  },
];

export default products;
