import { useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice, orderProductOnWhatsApp } from "../utils/whatsapp";
import { IconWhatsApp } from "./icons";
import { ProductPlaceholder } from "./Placeholder";

export default function ProductCard({ product }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const inPromo = Boolean(product.oldPrice);

  function handleOrder(e) {
    e.preventDefault();
    orderProductOnWhatsApp({
      name: product.name,
      price: product.price,
      size,
      color,
      quantity: 1,
    });
  }

  return (
    <div className="group animate-fadeUp">
      <Link to={`/produit/${product.id}`} className="block relative overflow-hidden bg-sand aspect-[4/5]">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ProductPlaceholder
            label={product.name}
            seed={product.id}
            className="transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {inPromo && (
          <span className="absolute top-3 left-3 rounded-full bg-ink/60 backdrop-blur-md border border-white/20 text-cream text-[10px] tracking-widest2 uppercase px-3 py-1.5 shadow-lg">
            Promo
          </span>
        )}
        {product.isNew && !inPromo && (
          <span className="absolute top-3 left-3 rounded-full bg-white/55 backdrop-blur-md border border-white/70 text-ink text-[10px] tracking-widest2 uppercase px-3 py-1.5 shadow-lg">
            Nouveau
          </span>
        )}
      </Link>

      <div className="pt-4">
        <Link to={`/produit/${product.id}`}>
          <h3 className="text-sm md:text-base text-ink font-medium hover:text-goldDark transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">
            {formatPrice(product.price)}
          </span>
          {inPromo && (
            <span className="text-xs text-ink/40 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            onClick={(e) => e.preventDefault()}
            aria-label="Taille"
            className="text-xs border border-ink/20 bg-cream px-2 py-1.5 focus:outline-none focus:border-gold"
          >
            {product.sizes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            onClick={(e) => e.preventDefault()}
            aria-label="Couleur"
            className="text-xs border border-ink/20 bg-cream px-2 py-1.5 focus:outline-none focus:border-gold"
          >
            {product.colors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOrder}
          className="mt-3 w-full btn-whatsapp"
        >
          <IconWhatsApp className="w-4 h-4" />
          Commander sur WhatsApp
        </button>
      </div>
    </div>
  );
}
