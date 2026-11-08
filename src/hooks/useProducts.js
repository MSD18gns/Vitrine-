import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function mapRow(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    price: p.price,
    oldPrice: p.old_price,
    images: p.images || [],
    sizes: p.sizes || [],
    colors: p.colors || [],
    stock: p.stock,
    featured: p.featured,
    isNew: p.is_new,
    isBestSeller: p.is_best_seller,
  };
}

/**
 * Charge le catalogue produit depuis Supabase (table vc_products).
 * `refresh()` permet de recharger après un ajout/modif/suppression
 * depuis la page Admin.
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vc_products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setProducts((data || []).map(mapRow));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, loading, error, refresh };
}
