import { useCart } from "../context/CartContext";
import { formatPrice, orderCartOnWhatsApp } from "../utils/whatsapp";
import { IconClose, IconTrash, IconWhatsApp, IconBag } from "./icons";
import { ProductPlaceholder } from "./Placeholder";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/50" onClick={closeCart} />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-cream flex flex-col animate-fadeUp">
        <div className="flex items-center justify-between px-6 h-20 border-b border-ink/10">
          <h2 className="font-display text-2xl tracking-wide">Votre panier</h2>
          <button onClick={closeCart} aria-label="Fermer le panier">
            <IconClose className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-ink/50 gap-3">
              <IconBag className="w-10 h-10 opacity-40" />
              <p className="text-sm">Votre panier est vide.</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                  <div className="w-20 h-24 bg-sand flex-shrink-0 overflow-hidden">
                    <ProductPlaceholder label={item.name} seed={item.id} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-ink truncate">{item.name}</h3>
                    <p className="text-xs text-ink/50 mt-0.5">
                      Taille {item.size} · {item.color}
                    </p>
                    <p className="text-sm font-semibold text-ink mt-1">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-ink/20">
                        <button
                          className="w-7 h-7 text-sm"
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          aria-label="Diminuer la quantité"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          className="w-7 h-7 text-sm"
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          aria-label="Augmenter la quantité"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item)}
                        aria-label="Supprimer l'article"
                        className="text-ink/40 hover:text-ink"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/10 px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink/60">Total</span>
              <span className="text-lg font-semibold">{formatPrice(total)}</span>
            </div>
            <button
              onClick={() => orderCartOnWhatsApp(items, total)}
              className="w-full btn-whatsapp py-3.5"
            >
              <IconWhatsApp className="w-5 h-5" />
              Commander mon panier sur WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
