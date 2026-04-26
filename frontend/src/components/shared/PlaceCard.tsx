import { motion } from "framer-motion";
import { MapPin, Star, Phone, Globe, Instagram, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn, truncate, PLACE_CATEGORY_LABELS } from "@/lib/utils";
import type { Place } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  BAR: "🍺", RESTAURANT: "🍽️", CULTURAL_CENTER: "🎭",
  MUSEUM: "🏛️", PARK: "🌳", CLUB: "🎵",
  CAFE: "☕", GALLERY: "🖼️", THEATER: "🎬", OTHER: "📍",
};

const PRICE_LABEL: Record<string, string> = {
  "$": "Económico", "$$": "Moderado", "$$$": "Premium",
};

interface PlaceCardProps {
  place: Place;
  onClick?: () => void;
}

export default function PlaceCard({ place, onClick }: PlaceCardProps) {
  const navigate = useNavigate();
  const categoryEmoji = CATEGORY_ICONS[place.category] || "📍";
  const categoryLabel = PLACE_CATEGORY_LABELS[place.category] || "Lugar";

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/places/${place.id}`);
    }
  };

  return (
    <motion.article
      onClick={handleClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="card-base overflow-hidden h-full flex flex-col cursor-pointer group"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        {place.imageUrl ? (
          <img src={place.imageUrl} alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-green-400 to-brand-blue-400 flex items-center justify-center">
            <span className="text-5xl">{categoryEmoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {place.featured && (
          <div className="absolute top-3 left-3 badge bg-brand-orange-500 text-white text-xs">
            ⭐ Destacado
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-xs font-semibold text-surface-700 shadow-soft flex items-center gap-1">
          <span>{categoryEmoji}</span> {categoryLabel}
        </div>
        {place.rating && place.rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-soft">
            <Star className="w-3.5 h-3.5 text-brand-orange-500 fill-brand-orange-500" />
            <span className="text-sm font-bold text-surface-900">{place.rating.toFixed(1)}</span>
          </div>
        )}
        {place.priceRange && (
          <div className="absolute bottom-3 right-3 bg-surface-900/80 backdrop-blur-sm rounded-xl px-2.5 py-1.5 text-xs text-white font-medium">
            {place.priceRange} · {PRICE_LABEL[place.priceRange] || ""}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-surface-900 text-lg leading-snug mb-1.5 group-hover:text-brand-green-600 transition-colors">
          {place.name}
        </h3>
        <div className="flex items-start gap-1.5 text-xs text-surface-500 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">{place.address}</span>
        </div>
        <p className="text-surface-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
          {place.description}
        </p>
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {place.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge bg-surface-100 text-surface-600 text-xs">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-surface-100">
          <div className="flex items-center gap-3">
            {place.phone && (
              <a href={`tel:${place.phone}`} onClick={(e) => e.stopPropagation()}
                className="text-surface-400 hover:text-brand-blue-500 transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            )}
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-surface-400 hover:text-brand-blue-500 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
            )}
            {place.instagram && (
              <a href={`https://instagram.com/${place.instagram.replace("@", "")}`}
                target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-surface-400 hover:text-pink-500 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
          <div className="flex items-center gap-1 text-brand-green-500 text-xs font-semibold group-hover:gap-2 transition-all">
            Ver lugar <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}
