import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "vitrine_chic_cart_v1";

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Une ligne de panier est identifiée par produit + taille + couleur
function lineKey(item) {
  return `${item.id}__${item.size}__${item.color}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // localStorage indisponible (navigation privée, etc.) : on ignore
    }
  }, [items]);

  function addItem(product, { size, color, quantity = 1 }) {
    setItems((prev) => {
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.oldPrice ? product.price : product.price,
        size,
        color,
        quantity,
      };
      const key = lineKey(newItem);
      const existingIndex = prev.findIndex((it) => lineKey(it) === key);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, newItem];
    });
    setIsOpen(true);
  }

  function removeItem(item) {
    const key = lineKey(item);
    setItems((prev) => prev.filter((it) => lineKey(it) !== key));
  }

  function updateQuantity(item, quantity) {
    if (quantity < 1) {
      removeItem(item);
      return;
    }
    const key = lineKey(item);
    setItems((prev) =>
      prev.map((it) => (lineKey(it) === key ? { ...it, quantity } : it))
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, it) => sum + it.quantity, 0),
    [items]
  );

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    itemCount,
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans un CartProvider");
  return ctx;
}
