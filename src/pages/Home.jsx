import { Link } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import { HeroPlaceholder, BannerPlaceholder } from "../components/Placeholder";

function ProductRow({ title, subtitle, items, link }) {
  if (items.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="eyebrow mb-2">{subtitle}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        {link && (
          <Link to={link} className="hidden md:block text-xs tracking-widest2 uppercase text-ink/70 hover:text-gold">
            Voir tout →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
        {items.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const nouveautes = products.filter((p) => p.isNew);
  const meilleuresVentes = products.filter((p) => p.isBestSeller);
  const promotions = products.filter((p) => p.oldPrice);
  const femmes = products.filter((p) => p.category === "femmes");
  const hommes = products.filter((p) => p.category === "hommes");

  return (
    <div>
      {/* Bannière héro */}
      <section className="relative h-[85vh] min-h-[560px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroPlaceholder />
        </div>
        <div className="absolute inset-0 bg-ink/20" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8 w-full">
          <div className="max-w-xl animate-fadeUp">
            <p className="eyebrow text-gold mb-5">Nouvelle collection</p>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-cream">
              L'ÉLÉGANCE<br />À VOTRE PORTÉE
            </h1>
            <p className="mt-6 text-cream/80 text-base md:text-lg max-w-md">
              Découvrez notre collection de vêtements tendance.
            </p>
            <Link to="/boutique" className="btn-primary mt-8 bg-gold text-ink hover:bg-cream">
              Découvrir la collection
            </Link>
          </div>
        </div>
      </section>

      {/* Bandes Hommes / Femmes */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link to="/collections/femmes" className="relative h-80 md:h-96 overflow-hidden group block">
          <BannerPlaceholder label="FEMMES" className="transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-ink/10 flex items-end p-8">
            <span className="text-cream text-sm tracking-widest2 uppercase border-b border-gold pb-1">
              Collection Femmes
            </span>
          </div>
        </Link>
        <Link to="/collections/hommes" className="relative h-80 md:h-96 overflow-hidden group block">
          <BannerPlaceholder label="HOMMES" className="transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-ink/10 flex items-end p-8">
            <span className="text-cream text-sm tracking-widest2 uppercase border-b border-gold pb-1">
              Collection Hommes
            </span>
          </div>
        </Link>
      </section>

      <ProductRow
        title="Nouveautés"
        subtitle="Fraîchement arrivé"
        items={nouveautes}
        link="/boutique?filtre=nouveautes"
      />

      <ProductRow
        title="Meilleures ventes"
        subtitle="Les favoris"
        items={meilleuresVentes}
        link="/boutique?filtre=meilleures-ventes"
      />

      <ProductRow
        title="Collection Femmes"
        subtitle="Pour elle"
        items={femmes}
        link="/collections/femmes"
      />

      <ProductRow
        title="Collection Hommes"
        subtitle="Pour lui"
        items={hommes}
        link="/collections/hommes"
      />

      {promotions.length > 0 && (
        <section className="bg-sand py-16 mt-8">
          <ProductRow
            title="Promotions"
            subtitle="Offres limitées"
            items={promotions}
            link="/boutique?filtre=promotions"
          />
        </section>
      )}
    </div>
  );
}
