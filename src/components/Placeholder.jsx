import siteConfig from "../config";

// Palettes reprenant l'identité noir / beige / doré de la boutique.
const PALETTES = {
  dark: { bg: "#0B0B0B", line: "#F7F3EC", accent: "#C7A353" },
  sand: { bg: "#EDE6D8", line: "#0B0B0B", accent: "#C7A353" },
  charcoal: { bg: "#1A1A1A", line: "#F7F3EC", accent: "#C7A353" },
};

function toneFor(seed) {
  const tones = ["dark", "sand", "charcoal"];
  return tones[Math.abs(seed) % tones.length];
}

/**
 * Silhouette élégante générée en SVG — sert de photo de remplacement
 * pour un produit tant que les vraies photos n'ont pas été ajoutées.
 * `seed` fait varier la couleur de fond pour éviter la monotonie.
 */
export function ProductPlaceholder({ label, seed = 0, className = "" }) {
  const { bg, line, accent } = PALETTES[toneFor(seed)];
  return (
    <svg
      viewBox="0 0 600 750"
      className={`w-full h-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="600" height="750" fill={bg} />
      <rect x="24" y="24" width="552" height="702" fill="none" stroke={accent} strokeWidth="1" opacity="0.55" />
      <g transform="translate(300,330)" fill="none" stroke={line} strokeWidth="2.2" opacity="0.9">
        <path d="M -70,-180 C -70,-210 -30,-230 0,-230 C 30,-230 70,-210 70,-180 L 95,-120 L 55,-100 L 40,-150 L 40,220 L -40,220 L -40,-150 L -55,-100 L -95,-120 Z" />
        <line x1="-18" y1="-200" x2="-18" y2="-150" />
        <line x1="18" y1="-200" x2="18" y2="-150" />
      </g>
      <text x="300" y="690" textAnchor="middle" fontFamily="Georgia, serif" fontSize="22" letterSpacing="6" fill={accent}>
        {label.toUpperCase()}
      </text>
      <text x="300" y="716" textAnchor="middle" fontFamily="Georgia, serif" fontSize="12" letterSpacing="4" fill={line} opacity="0.6">
        {siteConfig.siteName}
      </text>
    </svg>
  );
}

/**
 * Bannière décorative (accueil, catégories) — silhouette + libellé,
 * en dégradé sombre doré.
 */
export function BannerPlaceholder({ label, className = "" }) {
  return (
    <svg
      viewBox="0 0 900 600"
      className={`w-full h-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B0B0B" />
          <stop offset="1" stopColor="#201a10" />
        </linearGradient>
      </defs>
      <rect width="900" height="600" fill={`url(#grad-${label})`} />
      <g transform="translate(450,260)" fill="none" stroke="#C7A353" strokeWidth="2" opacity="0.85">
        <path d="M -70,-180 C -70,-210 -30,-230 0,-230 C 30,-230 70,-210 70,-180 L 95,-120 L 55,-100 L 40,-150 L 40,220 L -40,220 L -40,-150 L -55,-100 L -95,-120 Z" />
      </g>
      <text x="450" y="540" textAnchor="middle" fontFamily="Georgia, serif" fontSize="28" letterSpacing="8" fill="#F7F3EC">
        {label}
      </text>
    </svg>
  );
}

/**
 * Grande bannière héro de la page d'accueil.
 */
export function HeroPlaceholder({ className = "" }) {
  return (
    <svg
      viewBox="0 0 1600 1000"
      className={`w-full h-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0B0B0B" />
          <stop offset="0.55" stopColor="#171410" />
          <stop offset="1" stopColor="#2a2217" />
        </linearGradient>
        <radialGradient id="heroSpot" cx="70%" cy="30%" r="60%">
          <stop offset="0" stopColor="#C7A353" stopOpacity="0.25" />
          <stop offset="1" stopColor="#C7A353" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#heroGrad)" />
      <rect width="1600" height="1000" fill="url(#heroSpot)" />
      <g opacity="0.9" stroke="#C7A353" strokeWidth="2" fill="none">
        <path d="M620,250 C620,210 670,180 720,180 C770,180 820,210 820,250 L860,340 L800,370 L780,300 L780,820 L660,820 L660,300 L640,370 L580,340 Z" />
        <line x1="700" y1="220" x2="700" y2="290" />
        <line x1="740" y1="220" x2="740" y2="290" />
      </g>
      <g opacity="0.55" stroke="#F7F3EC" strokeWidth="1.5" fill="none">
        <path d="M980,300 C980,270 1015,250 1050,250 C1085,250 1120,270 1120,300 L1145,370 L1100,390 L1085,335 L1085,760 L1015,760 L1015,335 L1000,390 L955,370 Z" />
      </g>
      <line x1="80" y1="80" x2="80" y2="920" stroke="#C7A353" strokeWidth="1" opacity="0.3" />
      <line x1="1520" y1="80" x2="1520" y2="920" stroke="#C7A353" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}
