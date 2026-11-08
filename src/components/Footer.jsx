import { Link } from "react-router-dom";
import siteConfig from "../config";
import { IconInstagram, IconTikTok, IconWhatsApp } from "./icons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream mt-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <span className="font-display text-2xl tracking-widest2">
            {siteConfig.siteName}
          </span>
          <p className="mt-4 text-sm text-cream/60 leading-relaxed">
            Boutique de mode en ligne au Sénégal. Des pièces choisies avec
            exigence, pour un style qui vous ressemble.
          </p>
        </div>

        <div>
          <h4 className="eyebrow text-gold mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/" className="hover:text-gold">Accueil</Link></li>
            <li><Link to="/boutique" className="hover:text-gold">Boutique</Link></li>
            <li><Link to="/collections" className="hover:text-gold">Collections</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-gold mb-4">Livraison</h4>
          <p className="text-sm text-cream/70 leading-relaxed">
            {siteConfig.deliveryInfo}
          </p>
          {siteConfig.address && (
            <p className="text-sm text-cream/70 mt-3">{siteConfig.address}</p>
          )}
        </div>

        <div>
          <h4 className="eyebrow text-gold mb-4">Contact</h4>
          <a
            href={`https://wa.me/${siteConfig.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-cream/70 hover:text-gold mb-4"
          >
            <IconWhatsApp className="w-4 h-4" />
            Nous écrire sur WhatsApp
          </a>
          <div className="flex items-center gap-4">
            {siteConfig.instagram && (
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-gold"
              >
                <IconInstagram className="w-5 h-5" />
              </a>
            )}
            {siteConfig.tiktok && (
              <a
                href={siteConfig.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="hover:text-gold"
              >
                <IconTikTok className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10 py-6 text-center text-xs text-cream/50">
        © {year} {siteConfig.siteName}. Tous droits réservés.
      </div>
    </footer>
  );
}
