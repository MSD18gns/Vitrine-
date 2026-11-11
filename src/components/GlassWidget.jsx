/**
 * Panneau en verre dépoli réutilisable.
 * - variant "dark"  : pour fonds foncés (héro)
 * - variant "light" : pour fonds clairs
 * - float : léger flottement (delay en secondes pour décaler les widgets)
 */
export default function GlassWidget({
  as: Tag = "div",
  variant = "dark",
  float = false,
  delay = 0,
  className = "",
  style,
  children,
  ...rest
}) {
  const base = variant === "light" ? "glass-light" : "glass";
  return (
    <Tag
      className={`${base} glass-sheen ${float ? "animate-glassFloat" : ""} ${className}`}
      style={{ animationDelay: float ? `${delay}s` : undefined, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
