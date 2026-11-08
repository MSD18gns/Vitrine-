import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-5 py-32 text-center">
      <p className="eyebrow mb-3">Erreur 404</p>
      <h1 className="font-display text-4xl mb-6">Page introuvable</h1>
      <p className="text-ink/60 mb-8">
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/" className="btn-primary">Retour à l'accueil</Link>
    </div>
  );
}
