import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useProducts } from "../hooks/useProducts";
import siteConfig from "../config";
import { formatPrice } from "../utils/whatsapp";

const EMPTY_FORM = {
  id: null,
  name: "",
  category: "femmes",
  description: "",
  price: "",
  oldPrice: "",
  images: "",
  sizes: "",
  colors: "",
  stock: "",
  featured: false,
  isNew: false,
  isBestSeller: false,
};

export default function Admin() {
  const [session, setSession] = useState(undefined); // undefined = pas encore vérifié

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="max-w-md mx-auto px-5 py-28 text-center text-ink/40">Chargement...</div>;
  }

  return session ? <AdminDashboard /> : <AdminLogin />;
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Identifiants incorrects.");
    setBusy(false);
  }

  return (
    <div className="max-w-sm mx-auto px-5 py-28">
      <p className="eyebrow mb-2 text-center">Espace privé</p>
      <h1 className="section-title text-center mb-8">Administration</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-ink/20 px-4 py-3 text-sm focus:outline-none focus:border-gold"
        />
        <input
          type="password"
          required
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-ink/20 px-4 py-3 text-sm focus:outline-none focus:border-gold"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}

function AdminDashboard() {
  const { products, loading, refresh } = useProducts();
  const [orderCount, setOrderCount] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadOrderCount();
  }, []);

  async function loadOrderCount() {
    const { count } = await supabase
      .from("vc_orders")
      .select("*", { count: "exact", head: true });
    setOrderCount(count ?? 0);
  }

  function logout() {
    supabase.auth.signOut();
  }

  function startEdit(p) {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      images: (p.images || []).join(", "),
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
      stock: String(p.stock ?? 0),
      featured: Boolean(p.featured),
      isNew: Boolean(p.isNew),
      isBestSeller: Boolean(p.isBestSeller),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFormError("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce produit ?")) return;
    await supabase.from("vc_products").delete().eq("id", id);
    refresh();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.price || !form.sizes.trim() || !form.colors.trim()) {
      setFormError("Nom, prix, tailles et couleurs sont obligatoires.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      old_price: form.oldPrice ? Number(form.oldPrice) : null,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      stock: Number(form.stock) || 0,
      featured: form.featured,
      is_new: form.isNew,
      is_best_seller: form.isBestSeller,
    };

    setSaving(true);
    const query = form.id
      ? supabase.from("vc_products").update(payload).eq("id", form.id)
      : supabase.from("vc_products").insert(payload);
    const { error } = await query;
    setSaving(false);

    if (error) {
      setFormError(error.message);
      return;
    }
    resetForm();
    refresh();
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-14">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="eyebrow mb-2">Administration</p>
          <h1 className="section-title">{siteConfig.siteName}</h1>
        </div>
        <button onClick={logout} className="text-xs tracking-widest2 uppercase text-ink/50 hover:text-ink underline underline-offset-4">
          Se déconnecter
        </button>
      </div>

      {/* Stat commandes */}
      <div className="border border-ink/10 bg-sand p-8 mb-12 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Total</p>
          <p className="text-sm text-ink/60">Commandes envoyées via WhatsApp (produit seul ou panier)</p>
        </div>
        <p className="font-display text-5xl text-ink">{orderCount === null ? "…" : orderCount}</p>
      </div>

      {/* Formulaire produit */}
      <div className="border border-ink/10 p-8 mb-12">
        <h2 className="font-display text-2xl mb-6">
          {form.id ? "Modifier le produit" : "Ajouter un produit"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Nom du produit *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-ink/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold md:col-span-2"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border border-ink/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          >
            <option value="femmes">Femmes</option>
            <option value="hommes">Hommes</option>
          </select>
          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="border border-ink/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <input
            type="number"
            placeholder="Prix (FCFA) *"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border border-ink/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <input
            type="number"
            placeholder="Ancien prix (promo, optionnel)"
            value={form.oldPrice}
            onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
            className="border border-ink/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="border border-ink/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold md:col-span-2"
          />
          <input
            placeholder="Tailles, séparées par des virgules (ex: S, M, L) *"
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            className="border border-ink/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <input
            placeholder="Couleurs, séparées par des virgules *"
            value={form.colors}
            onChange={(e) => setForm({ ...form, colors: e.target.value })}
            className="border border-ink/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
          />
          <input
            placeholder="URLs des photos séparées par des virgules (optionnel)"
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            className="border border-ink/20 px-4 py-2.5 text-sm focus:outline-none focus:border-gold md:col-span-2"
          />

          <div className="flex items-center gap-6 md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              Favori (accueil)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
              Nouveauté
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} />
              Meilleure vente
            </label>
          </div>

          {formError && <p className="text-sm text-red-600 md:col-span-2">{formError}</p>}

          <div className="flex gap-3 md:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Enregistrement..." : form.id ? "Enregistrer les modifications" : "Ajouter le produit"}
            </button>
            {form.id && (
              <button type="button" onClick={resetForm} className="btn-outline">
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Liste produits */}
      <div>
        <h2 className="font-display text-2xl mb-6">Catalogue ({products.length})</h2>
        {loading ? (
          <p className="text-ink/40">Chargement...</p>
        ) : (
          <div className="divide-y divide-ink/10 border-t border-b border-ink/10">
            {products.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-ink/50">
                    {p.category} · {formatPrice(p.price)} · stock {p.stock}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(p)} className="text-xs uppercase tracking-widest2 text-ink/60 hover:text-gold">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs uppercase tracking-widest2 text-red-600/70 hover:text-red-600">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
