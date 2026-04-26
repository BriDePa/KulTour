import { motion } from "framer-motion";
import { Calendar, MapPin, Tag, Users, ArrowUpRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { formatShortDate, formatTime, formatPrice, truncate, cn } from "@/lib/utils";
import type { Event } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  "Música":        "bg-brand-blue-50 text-brand-blue-600",
  "Arte y Cultura":"bg-violet-50 text-violet-600",
  "Gastronomía":   "bg-amber-50 text-amber-600",
  "Noche":         "bg-surface-800 text-white",
  "Turismo":       "bg-brand-green-50 text-brand-green-600",
  "Deportes":      "bg-red-50 text-red-600",
  "Familiar":      "bg-pink-50 text-pink-600",
};

interface EventCardProps {
  event: Event;
  compact?: boolean;
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const categoryColor = CATEGORY_COLORS[event.category || ""] || "bg-surface-100 text-surface-600";
  const eventDate = new Date(event.date);
  const dayNumber = eventDate.toLocaleDateString("es-BO", { day: "numeric" });
  const monthShort = eventDate.toLocaleDateString("es-BO", { month: "short" });

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="card-base overflow-hidden h-full flex flex-col"
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/9]">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-blue-400 to-brand-green-400" />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Featured badge */}
          {event.featured && (
            <div className="absolute top-3 left-3 badge bg-brand-orange-500 text-white text-xs font-bold shadow-soft">
              ⭐ Destacado
            </div>
          )}

          {/* Price badge */}
          <div className={cn(
            "absolute top-3 right-3 px-3 py-1.5 rounded-xl text-sm font-bold shadow-soft",
            event.isFree ? "bg-brand-green-500 text-white" : "bg-white text-surface-900"
          )}>
            {formatPrice(event.price, event.isFree)}
          </div>

          {/* Date pill */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-center shadow-soft min-w-[52px]">
            <div className="text-lg font-bold font-display text-brand-blue-600 leading-none">{dayNumber}</div>
            <div className="text-xs text-surface-500 font-medium uppercase tracking-wide">{monthShort}</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category */}
          {event.category && (
            <span className={cn("badge text-xs mb-3 self-start", categoryColor)}>
              {event.category}
            </span>
          )}

          {/* Title */}
          <h3 className="font-display font-bold text-surface-900 text-lg leading-snug mb-2 group-hover:text-brand-blue-600 transition-colors">
            {compact ? truncate(event.title, 55) : event.title}
          </h3>

          {/* Description */}
          {!compact && (
            <p className="text-surface-500 text-sm leading-relaxed mb-4 flex-1">
              {truncate(event.description, 100)}
            </p>
          )}

          {/* Meta */}
          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{formatTime(event.date)}</span>
              <span className="text-surface-300">·</span>
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-surface-500">
              <Tag className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                {event.tags.slice(0, 3).join(" · ")}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white text-xs font-bold">
                {event.organizer.name.charAt(0)}
              </div>
              <span className="text-xs text-surface-500 font-medium">
                {truncate(event.organizer.name, 20)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-brand-blue-500 text-xs font-semibold group-hover:gap-2 transition-all">
              Ver más
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
