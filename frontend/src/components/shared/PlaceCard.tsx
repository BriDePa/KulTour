import { memo } from "react";
import { motion } from "framer-motion";
import { MapPin, Star, Phone, Globe, Instagram, ArrowUpRight, Beer, UtensilsCrossed, Palette, Landmark, Trees, Music, Coffee, Image, Clapperboard, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn, truncate, PLACE_CATEGORY_LABELS } from "@/lib/utils";
import type { Place } from "@/types";

const CATEGORY_ICONS: Record<string, { icon: any; color: string }> = {
  BAR: { icon: Beer, color: "from-amber-500 to-orange-500" },
  RESTAURANT: { icon: UtensilsCrossed, color: "from-emerald-500 to-green-500" },
  CULTURAL_CENTER: { icon: Palette, color: "from-violet-500 to-purple-500" },
  MUSEUM: { icon: Landmark, color: "from-blue-500 to-indigo-500" },
  PARK: { icon: Trees, color: "from-green-500 to-emerald-500" },
  CLUB: { icon: Music, color: "from-pink-500 to-rose-500" },
  CAFE: { icon: Coffee, color: "from-amber-400 to-yellow-500" },
  GALLERY: { icon: Image, color: "from-teal-500 to-cyan-500" },
  THEATER: { icon: Clapperboard, color: "from-red-500 to-rose-500" },
  OTHER: { icon: Plus, color: "from-surface-500 to-surface-600" },
};

const PRICE_LABEL: Record<string, string> = {
  "$": "Económico", "$$": "Moderado", "$$$": "Premium",
};

interface PlaceCardProps {
  place: Place;
  onClick?: () => void;
}

const PlaceCard = memo(function PlaceCard({ place, onClick }: PlaceCardProps) {
  const categoryInfo = CATEGORY_ICONS[place.category] || CATEGORY_ICONS.OTHER;
  const CategoryIcon = categoryInfo.icon;
  const categoryLabel = PLACE_CATEGORY_LABELS[place.category] || "Lugar";

  const content = (
    <motion.article
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="card-base overflow-hidden h-full flex flex-col cursor-pointer group"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        {place.imageUrl ? (
          <img src={place.imageUrl} alt={place.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-green-400 to-brand-blue-400 flex items-center justify-center">
            <CategoryIcon className="w-10 h-10 text-white" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {place.featured && (
          <div className="absolute top-3 left-3 badge bg-brand-orange-500 text-white text-xs">
            <Star className="w-3 h-3 fill-current" /> Destacado
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-xs font-semibold text-surface-700 dark:text-surface-300 shadow-soft flex items-center gap-1.5">
          <CategoryIcon className="w-3.5 h-3.5" /> {categoryLabel}
        </div>
        {place.rating && place.rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-soft">
            <Star className="w-3.5 h-3.5 text-brand-orange-500 fill-brand-orange-500" />
            <span className="text-sm font-bold text-surface-900 dark:text-surface-100">{place.rating.toFixed(1)}</span>
          </div>
        )}
        {place.priceRange && (
          <div className="absolute bottom-3 right-3 bg-surface-900/80 dark:bg-surface-950/80 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-xs text-white font-medium">
            {place.priceRange} · {PRICE_LABEL[place.priceRange] || ""}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-surface-900 dark:text-surface-50 text-lg leading-snug mb-1.5 group-hover:text-brand-green-600 dark:group-hover:text-brand-green-400 transition-colors">
          {place.name}
        </h3>
        <div className="flex items-start gap-1.5 text-xs text-surface-500 dark:text-surface-400 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">{place.address}</span>
        </div>
        <p className="text-surface-500 dark:text-surface-400 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
          {place.description}
        </p>
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {place.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-xs">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-surface-100 dark:border-surface-700">
          <div className="flex items-center gap-3">
            {place.phone && (
              <a href={`tel:${place.phone}`} onClick={(e) => e.stopPropagation()}
                className="text-surface-400 dark:text-surface-500 hover:text-brand-blue-500 dark:hover:text-brand-blue-400 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            )}
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-surface-400 dark:text-surface-500 hover:text-brand-blue-500 dark:hover:text-brand-blue-400 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            )}
            {place.instagram && (
              <a href={`https://instagram.com/${place.instagram.replace("@", "")}`}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-surface-400 dark:text-surface-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-1 text-brand-green-500 dark:text-brand-green-400 text-xs font-semibold group-hover:gap-2 transition-all">
            Ver lugar <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.article>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return <Link to={`/places/${place.id}`} className="block group">{content}</Link>;
});

export default PlaceCard;