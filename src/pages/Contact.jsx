import siteConfig from "../config";
import { IconWhatsApp, IconInstagram, IconTikTok } from "../components/icons";

export default function Contact() {
  const message = encodeURIComponent(
    "Bonjour, j'ai une question concernant vos produits."
  );

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-20">
      <div className="text-center mb-14">
        <p className="eyebrow mb-2">Nous contacter</p>
        <h1 className="section-title">Contact</h1>
        <p className="text-ink/60 mt-4 max-w-md mx-auto">
          Une question sur un produit, une commande ou la livraison ?
          Écrivez-nous, nous répondons rapidement.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
        <a
          href={`https://wa.me/${siteConfig.whatsappNumber}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-ink/10 p-8 hover:border-gold transition-colors"
        >
          <IconWhatsApp className="w-7 h-7 mx-auto mb-4 text-[#25D366]" />
          <p className="text-sm font-medium">WhatsApp</p>
          <p className="text-xs text-ink/50 mt-1">Réponse rapide</p>
        </a>

        {siteConfig.instagram && (
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-ink/10 p-8 hover:border-gold transition-colors"
          >
            <IconInstagram className="w-7 h-7 mx-auto mb-4" />
            <p className="text-sm font-medium">Instagram</p>
            <p className="text-xs text-ink/50 mt-1">Nos nouveautés</p>
          </a>
        )}

        {siteConfig.tiktok && (
          <a
            href={siteConfig.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-ink/10 p-8 hover:border-gold transition-colors"
          >
            <IconTikTok className="w-7 h-7 mx-auto mb-4" />
            <p className="text-sm font-medium">TikTok</p>
            <p className="text-xs text-ink/50 mt-1">Nos coulisses</p>
          </a>
        )}
      </div>

      <div className="mt-14 text-center text-sm text-ink/60 space-y-2">
        {siteConfig.address && <p>{siteConfig.address}</p>}
        <p>{siteConfig.deliveryInfo}</p>
      </div>
    </div>
  );
}
