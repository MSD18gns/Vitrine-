import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import { IconSearch, IconClose } from "../components/icons";

const ALL_SIZES = [...new Set(products.flatMap((p) => p.sizes))].sort();
const ALL_COLORS = [...new Set(products.flatMap((p) => p.colors))].sort();
const MAX_PRICE = Math.max(...products.map((p) => p.price));

export default function Shop() {
  const { category } = useParams(); // présent sur /collections/:category
  const [searchParams] = useSearchParams();
  const filtreRapide = searchParams.get("filtre"); // nouveautes | meilleures-ventes | promotions

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(category || "toutes");
  const [priceMax, setPriceMax] = useState(MAX_PRICE);
  const [sizeFilter, setSizeFilter] = useState("toutes");
  const [colorFilter, setColorFilter] = useState("toutes");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Resynchronise le filtre catégorie quand on navigue entre
  // /collections/femmes et /collections/hommes.
  useEffect(() => {
    setCategoryFilter(category || "toutes");
  }, [category]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "toutes" && p.category !== categoryFilter) return false;
      if (sizeFilter !== "toutes" && !p.sizes.includes(sizeFilter)) return false;
      if (colorFilter !== "toutes" && !p.colors.includes(colorFilter)) return false;
      if (p.price > priceMax) return false;
      if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (filtreRapide === "nouveautes" && !p.isNew) return false;
      if (filtreRapide === "meilleures-ventes" && !p.isBestSeller) return false;
      if (filtreRapide === "promotions" && !p.oldPrice) return false;
      return true;
    });
  }, [categoryFilter, sizeFilter, colorFilter, priceMax, search, filtreRapide]);

  const titre =
    category === "femmes" ? "Collection Femmes" :
    category === "hommes" ? "Collection Hommes" :
    filtreRapide === "nouveautes" ? "Nouveautés" :
    filtreRapide === "meilleures-ventes" ? "Meilleures ventes" :
    filtreRapide === "promotions" ? "Promotions" :
    "Boutique";

  function resetFilters() {
    setSearch("");
    setCategoryFilter("toutes");
    setPriceMax(MAX_PRICE);
    setSizeFilter("toutes");
    setColorFilter("toutes");
  }

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-14">
      <div className="mb-10">
        <p className="eyebrow mb-2">{filtered.length} article{filtered.length > 1 ? "s" : ""}</p>
        <h1 className="section-title">{titre}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Filtres - desktop */}
        <aside className="hidden md:block w-56 flex-shrink-0 space-y-8">
          <FiltersPanel
            search={search} setSearch={setSearch}
            categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
            priceMax={priceMax} setPriceMax={setPriceMax}
            sizeFilter={sizeFilter} setSizeFilter={setSizeFilter}
            colorFilter={colorFilter} setColorFilter={setColorFilter}
            onReset={resetFilters}
          />
        </aside>

        <div className="flex-1">
          {/* Bouton filtres mobile */}
          <div className="md:hidden mb-6">
            <button
              onClick={() => setFiltersOpen(true)}
              className="btn-outline w-full"
            >
              Filtrer les produits
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-ink/50 py-20 text-center">
              Aucun produit ne correspond à votre recherche.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filtres - mobile overlay */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-cream p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-xl">Filtres</h2>
              <button onClick={() => setFiltersOpen(false)} aria-label="Fermer">
                <IconClose className="w-6 h-6" />
              </button>
            </div>
            <FiltersPanel
              search={search} setSearch={setSearch}
              categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
              priceMax={priceMax} setPriceMax={setPriceMax}
              sizeFilter={sizeFilter} setSizeFilter={setSizeFilter}
              colorFilter={colorFilter} setColorFilter={setColorFilter}
              onReset={resetFilters}
            />
            <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full mt-8">
              Voir les résultats ({filtered.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FiltersPanel({
  search, setSearch,
  categoryFilter, setCategoryFilter,
  priceMax, setPriceMax,
  sizeFilter, setSizeFilter,
  colorFilter, setColorFilter,
  onReset,
}) {
  return (
    <div className="space-y-8">
      <div>
        <label className="eyebrow block mb-2">Recherche</label>
        <div className="relative">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-ink/20 bg-transparent focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div>
        <label className="eyebrow block mb-3">Catégorie</label>
        <div className="space-y-2">
          {[
            { value: "toutes", label: "Toutes" },
            { value: "femmes", label: "Femmes" },
            { value: "hommes", label: "Hommes" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={categoryFilter === opt.value}
                onChange={() => setCategoryFilter(opt.value)}
                className="accent-ink"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="eyebrow block mb-3">
          Prix max : {new Intl.NumberFormat("fr-FR").format(priceMax)} FCFA
        </label>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={1000}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-gold"
        />
      </div>

      <div>
        <label className="eyebrow block mb-3">Taille</label>
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="w-full text-sm border border-ink/20 bg-transparent px-3 py-2.5 focus:outline-none focus:border-gold"
        >
          <option value="toutes">Toutes les tailles</option>
          {ALL_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="eyebrow block mb-3">Couleur</label>
        <select
          value={colorFilter}
          onChange={(e) => setColorFilter(e.target.value)}
          className="w-full text-sm border border-ink/20 bg-transparent px-3 py-2.5 focus:outline-none focus:border-gold"
        >
          <option value="toutes">Toutes les couleurs</option>
          {ALL_COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <button onClick={onReset} className="text-xs tracking-widest2 uppercase text-ink/50 hover:text-ink underline underline-offset-4">
        Réinitialiser les filtres
      </button>
    </div>
  );
}
