import siteConfig from "../config";

function formatPrice(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " " + siteConfig.currency;
}

/**
 * Construit l'URL wa.me avec un message pré-rempli et l'ouvre
 * dans un nouvel onglet.
 */
function openWhatsApp(message) {
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${siteConfig.whatsappNumber}?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Commande d'un seul produit (depuis la page produit ou la carte produit).
 */
export function orderProductOnWhatsApp({ name, price, size, color, quantity }) {
  const message = [
    "Bonjour, je souhaite commander ce produit :",
    "",
    `Produit : ${name}`,
    `Prix : ${formatPrice(price)}`,
    `Taille : ${size}`,
    `Couleur : ${color}`,
    `Quantité : ${quantity}`,
    "",
    "Merci de me confirmer la disponibilité et les modalités de livraison.",
  ].join("\n");

  openWhatsApp(message);
}

/**
 * Commande de tout le panier (depuis le tiroir panier).
 */
export function orderCartOnWhatsApp(items, total) {
  const lines = [
    "Bonjour, je souhaite commander les produits suivants :",
    "",
  ];

  items.forEach((item, idx) => {
    lines.push(
      `${idx + 1}. ${item.name} — Taille ${item.size}, Couleur ${item.color}, Quantité ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    );
  });

  lines.push("");
  lines.push(`Total : ${formatPrice(total)}`);
  lines.push("");
  lines.push("Merci de me confirmer la disponibilité et les modalités de livraison.");

  openWhatsApp(lines.join("\n"));
}

export { formatPrice };
