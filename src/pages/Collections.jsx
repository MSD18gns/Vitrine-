import { Link } from "react-router-dom";
import { BannerPlaceholder } from "../components/Placeholder";

const collections = [
  { slug: "femmes", label: "Femmes", bannerLabel: "FEMMES" },
  { slug: "hommes", label: "Hommes", bannerLabel: "HOMMES" },
];

export default function Collections() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
      <div className="mb-12 text-center">
        <p className="eyebrow mb-2">Explorez</p>
        <h1 className="section-title">Nos Collections</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map((c) => (
          <Link
            key={c.slug}
            to={`/collections/${c.slug}`}
            className="relative h-96 md:h-[28rem] overflow-hidden group block"
          >
            <BannerPlaceholder
              label={c.bannerLabel}
              className="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-ink/10 flex items-end p-10">
              <span className="font-display text-3xl text-cream tracking-wide">
                {c.label}
              </span>
            </div>
          </Link>
        ))}

        <Link
          to="/boutique?filtre=promotions"
          className="relative h-96 md:h-[28rem] overflow-hidden group block md:col-span-2"
        >
          <BannerPlaceholder
            label="PROMOTIONS"
            className="transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-ink/10 flex items-end p-10">
            <span className="font-display text-3xl text-cream tracking-wide">
              Promotions
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
