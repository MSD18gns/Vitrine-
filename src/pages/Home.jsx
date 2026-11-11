import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import { HeroPlaceholder, ProductPlaceholder } from "../components/Placeholder";
import GlassWidget from "../components/GlassWidget";
import { IconWhatsApp } from "../components/icons";
import siteConfig from "../config";

function IconTruck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h11v9H3zM14 9h4l3 3v3h-7" />
      <circle cx="7" cy="17" r="1.8" />
      <circle cx="17" cy="17" r="1.8" />
    </svg>
  );
}

function IconSparkle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" />
    </svg>
  );
}

function Thumb({ product }) {
  return (
    <div className="aspect-[4/5] rounded-lg overflow-hidden border border-white/15 bg-white/5">
      {product.images && product.images.length > 0 ? (
        <img src={product.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <ProductPlaceholder label={product.name} seed={product.id} />
      )}
    </div>
  );
}

export default function Home() {
  const { products, loading, error } = useProducts();
  const favoris = products.filter((p) => p.featured);
  const toShow = (favoris.length > 0 ? favoris : products).slice(0, 8);
  const nouveautes = products.filter((p) => p.isNew);
  const vitrine = (nouveautes.length > 0 ? nouveautes : products).slice(0, 3);

  return (
    <div>
      {/* Bannière héro */}
      <section className="relative h-[70vh] min-h-[480px] lg:min-h-[620px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <HeroPlaceholder />
        </div>
        <div className="absolute inset-0 bg-ink/15" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8 w-full grid lg:grid-cols-[1fr_380px] gap-10 items-center">
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

            {/* Widgets compacts (mobile / tablette) */}
            <div className="mt-8 flex flex-wrap gap-3 lg:hidden">
              <GlassWidget className="!rounded-full px-4 py-2 flex items-center gap-2 text-xs">
                <IconTruck className="w-4 h-4 text-gold" />
                Livraison Dakar 24–48h
              </GlassWidget>
              <GlassWidget className="!rounded-full px-4 py-2 flex items-center gap-2 text-xs">
                <IconWhatsApp className="w-4 h-4 text-[#25D366]" />
                Commande WhatsApp
              </GlassWidget>
            </div>
          </div>

          {/* Widgets en verre flottants (desktop) */}
          <div className="hidden lg:block relative h-[400px]" aria-hidden="true">
            <GlassWidget float delay={0} className="absolute top-0 right-0 w-[300px] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-widest2 uppercase text-gold flex items-center gap-1.5">
                  <IconSparkle className="w-3.5 h-3.5" />
                  Nouveautés
                </span>
                <span className="text-[10px] text-white/50">{siteConfig.siteName}</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {vitrine.length > 0
                  ? vitrine.map((p) => <Thumb key={p.id} product={p} />)
                  : [0, 1, 2].map((i) => (
                      <div key={i} className="aspect-[4/5] rounded-lg bg-white/10 animate-pulse" />
                    ))}
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-display text-3xl leading-none">
                    {loading ? "—" : nouveautes.length || products.length}
                  </p>
                  <p className="text-[11px] text-white/60 mt-1">
                    {nouveautes.length ? "nouvelles pièces" : "pièces en boutique"}
                  </p>
                </div>
                <div className="h-1 w-24 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-gold to-white/80" />
                </div>
              </div>
            </GlassWidget>

            <GlassWidget float delay={1.5} className="absolute top-[200px] left-0 w-[250px] p-4">
              <div className="flex items-center gap-3">
                <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366]/20 border border-[#25D366]/40">
                  <IconWhatsApp className="w-5 h-5 text-[#25D366]" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#25D366] animate-glassPulse" />
                </span>
                <div>
                  <p className="text-sm font-medium">Commande directe</p>
                  <p className="text-[11px] text-white/60">En un message WhatsApp</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl rounded-tl-sm bg-white/10 border border-white/10 px-3 py-2 text-[11px] text-white/80">
                Bonjour, je souhaite commander cet article ✨
              </div>
            </GlassWidget>

            <GlassWidget float delay={3} className="absolute bottom-0 right-6 w-[230px] p-4 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gold/15 border border-gold/40">
                <IconTruck className="w-5 h-5 text-gold" />
              </span>
              <div>
                <p className="text-sm font-medium">Livraison rapide</p>
                <p className="text-[11px] text-white/60">Dakar sous 24–48h</p>
              </div>
            </GlassWidget>
          </div>
        </div>
      </section>

      {/* Bandeau en verre qui chevauche le héro */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 md:px-8 -mt-10">
        <GlassWidget
          variant="light"
          className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-ink/10"
        >
          {[
            { icon: IconTruck, title: "Livraison Dakar", text: "Sous 24–48h" },
            { icon: IconTruck, title: "Autres régions", text: "Sous 3–5 jours" },
            { icon: IconWhatsApp, title: "Commande simple", text: "Directement sur WhatsApp" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 px-6 py-4">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gold/10 border border-gold/30 text-goldDark shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs tracking-widest2 uppercase text-ink">{title}</p>
                <p className="text-xs text-ink/55 mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </GlassWidget>
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

        {error ? (
          <p className="text-red-600/80 text-center py-16">
            Impossible de charger le catalogue pour le moment. Réessayez dans un instant.
          </p>
        ) : loading ? (
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
