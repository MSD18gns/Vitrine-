import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import { HeroPlaceholder } from "../components/Placeholder";

export default function Home() {
  const { products, loading } = useProducts();
  const favoris = products.filter((p) => p.featured);
  const toShow = (favoris.length > 0 ? favoris : products).slice(0, 8);

  return (
    <div>
      {/* Bannière héro */}
      <section className="relative h-[70vh] min-h-[480px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroPlaceholder />
        </div>
        <div className="absolute inset-0 bg-ink/15" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8 w-full">
          <div className="max-w-xl animate-fadeUp">
            <p className="eyebrow text-gold mb-4">Nouvelle collection</p>
            <h1 className="font-display text-4xl md:text-6xl leading-[1.1] text-white">
              L'ÉLÉGANCE<br />À VOTRE PORTÉE
            </h1>
            <p className="mt-5 text-white/85 text-base md:text-lg max-w-md">
              Découvrez notre collection de vêtements tendance.
            </p>
            <Link to="/boutique" className="btn-primary mt-7 bg-gold text-ink hover:bg-white">
              Découvrir la collection
            </Link>
          </div>
        </div>
      </section>

      {/* Un seul bloc produits, clair et simple */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-2">Sélection</p>
            <h2 className="section-title">Nos Favoris</h2>
          </div>
          <Link
            to="/boutique"
            className="hidden md:block text-xs tracking-widest2 uppercase text-ink/60 hover:text-gold"
          >
            Voir toute la boutique →
          </Link>
        </div>

        {loading ? (
          <p className="text-ink/40 text-center py-16">Chargement du catalogue...</p>
        ) : toShow.length === 0 ? (
          <p className="text-ink/40 text-center py-16">
            Aucun produit pour le moment. Ajoutez-en depuis la page admin.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {toShow.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link to="/boutique" className="btn-outline">
            Voir toute la boutique
          </Link>
        </div>
      </section>
    </div>
  );
}
