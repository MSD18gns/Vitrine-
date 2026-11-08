import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import siteConfig from "../config";
import { useCart } from "../context/CartContext";
import { IconBag, IconMenu, IconClose } from "./icons";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/boutique", label: "Boutique" },
  { to: "/boutique?filtre=nouveautes", label: "Nouveautés" },
  { to: "/collections", label: "Collections" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-cream/95 backdrop-blur shadow-sm" : "bg-cream"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
        <button
          className="md:hidden p-2 -ml-2"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <IconMenu className="w-6 h-6" />
        </button>

        <Link to="/" className="font-display text-2xl md:text-3xl tracking-widest2 text-ink">
          {siteConfig.siteName}
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `text-xs tracking-widest2 uppercase transition-colors ${
                  isActive ? "text-goldDark" : "text-ink/80 hover:text-gold"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="relative p-2"
          onClick={openCart}
          aria-label="Ouvrir le panier"
        >
          <IconBag className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-gold text-ink text-[10px] font-semibold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-xs bg-cream p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <span className="font-display text-xl tracking-widest2">
                {siteConfig.siteName}
              </span>
              <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu">
                <IconClose className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm tracking-widest2 uppercase text-ink/90"
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
