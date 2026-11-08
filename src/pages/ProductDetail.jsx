import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { formatPrice, orderProductOnWhatsApp } from "../utils/whatsapp";
import { IconWhatsApp, IconBag, IconChevronLeft, IconChevronRight } from "../components/icons";
import { ProductPlaceholder } from "../components/Placeholder";

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading, error } = useProducts();
  const product = products.find((p) => String(p.id) === id);

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-5 py-28 text-center text-red-600/80">
        Impossible de charger ce produit pour le moment. Réessayez dans un instant.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-5 py-28 text-center text-ink/40">
        Chargement...
      </div>
    );
  }

  if (!product) return <NotFoundProduct />;

  return <ProductDetailView product={product} allProducts={products} />;
}

function NotFoundProduct() {
  return (
    <div className="max-w-xl mx-auto px-5 py-28 text-center">
      <h1 className="font-display text-3xl mb-4">Produit introuvable</h1>
      <p className="text-ink/60 mb-8">Ce produit n'existe pas ou a été retiré du catalogue.</p>
      <Link to="/boutique" className="btn-primary">Retour à la boutique</Link>
    </div>
  );
}

function ProductDetailView({ product, allProducts }) {
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);

  const inPromo = Boolean(product.oldPrice);
  const hasRealPhotos = Boolean(product.images?.length);
  // Nombre de vues de la galerie (en attendant les vraies photos).
  const imageCount = hasRealPhotos ? product.images.length : 3;

  const similar = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  function handleOrder() {
    orderProductOnWhatsApp({
      name: product.name,
      price: product.price,
      size,
      color,
      quantity,
    });
  }

  function handleAddToCart() {
    addItem(product, { size, color, quantity });
  }

  function nextImage() {
    setActiveImage((i) => (i + 1) % imageCount);
  }
  function prevImage() {
    setActiveImage((i) => (i - 1 + imageCount) % imageCount);
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-12">
      <nav className="text-xs text-ink/50 mb-8">
        <Link to="/boutique" className="hover:text-ink">Boutique</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        {/* Galerie */}
        <div>
          <div className="relative bg-sand aspect-[4/5] overflow-hidden">
            {hasRealPhotos ? (
              <img
                src={product.images[activeImage]}
                alt={`${product.name} — photo ${activeImage + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <ProductPlaceholder
                label={product.name}
                seed={product.id * 10 + activeImage}
              />
            )}
            {imageCount > 1 && (
              <>
                <button
                  onClick={prevImage}
                  aria-label="Photo précédente"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-cream/80 p-2 hover:bg-cream"
                >
                  <IconChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  aria-label="Photo suivante"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-cream/80 p-2 hover:bg-cream"
                >
                  <IconChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {imageCount > 1 && (
            <div className="flex gap-3 mt-4">
              {Array.from({ length: imageCount }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-24 bg-sand overflow-hidden border ${
                    idx === activeImage ? "border-gold" : "border-transparent"
                  }`}
                >
                  {hasRealPhotos ? (
                    <img src={product.images[idx]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ProductPlaceholder label={product.name} seed={product.id * 10 + idx} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Infos produit */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl font-semibold">{formatPrice(product.price)}</span>
            {inPromo && (
              <span className="text-sm text-ink/40 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          <p className="text-ink/70 leading-relaxed mb-8">{product.description}</p>

          <div className="mb-6">
            <label className="eyebrow block mb-3">Taille</label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    size === s ? "border-ink bg-ink text-cream" : "border-ink/20 hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="eyebrow block mb-3">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    color === c ? "border-ink bg-ink text-cream" : "border-ink/20 hover:border-ink"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="eyebrow block mb-3">Quantité</label>
            <div className="inline-flex items-center border border-ink/20">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 text-lg"
                aria-label="Diminuer la quantité"
              >
                −
              </button>
              <span className="w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 text-lg"
                aria-label="Augmenter la quantité"
              >
                +
              </button>
            </div>
            {product.stock <= 5 && (
              <p className="text-xs text-goldDark mt-2">
                Plus que {product.stock} en stock
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleOrder} className="btn-whatsapp flex-1 py-3.5">
              <IconWhatsApp className="w-5 h-5" />
              Commander sur WhatsApp
            </button>
            <button onClick={handleAddToCart} className="btn-outline flex-1 py-3.5">
              <IconBag className="w-4 h-4" />
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-24">
          <h2 className="section-title mb-8">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
