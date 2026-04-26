import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Calendar, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEvents, usePlaces } from "@/hooks/useKultour";
import { formatShortDate, formatPrice, truncate, PLACE_CATEGORY_LABELS } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, string> = {
  BAR: "🍺", RESTAURANT: "🍽️", CULTURAL_CENTER: "🎭",
  MUSEUM: "🏛️", PARK: "🌳", CLUB: "🎵",
  CAFE: "☕", GALLERY: "🖼️", THEATER: "🎬", OTHER: "📍",
};

interface GlobalSearchProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function GlobalSearch({ onClose, autoFocus }: GlobalSearchProps) {
  const [query, setQuery]         = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [focused, setFocused]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const hasQuery = debouncedQ.trim().length >= 2;

  const { data: eventsData, isLoading: eventsLoading } = useEvents(
    hasQuery ? { search: debouncedQ, limit: 4 } : undefined
  );
  const { data: placesData, isLoading: placesLoading } = usePlaces(
    hasQuery ? { search: debouncedQ, limit: 4 } : undefined
  );

  const events  = eventsData?.events  || [];
  const places  = placesData?.places  || [];
  const loading = eventsLoading || placesLoading;
  const noResults = hasQuery && !loading && events.length === 0 && places.length === 0;
  const showDropdown = focused && (hasQuery || query.length > 0);

  const handleEventClick = (id: string) => {
    navigate(`/events/${id}`);
    setQuery("");
    onClose?.();
  };

  const handlePlaceClick = (id: string) => {
    navigate(`/places/${id}`);
    setQuery("");
    onClose?.();
  };

  const handleClear = () => {
    setQuery("");
    setDebouncedQ("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Buscar eventos, bares, restaurantes…"
          className="input-base pl-10 pr-10 text-base"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-card-hover border border-surface-100 overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
          >
            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-3 px-4 py-4 text-surface-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-brand-blue-500" />
                Buscando…
              </div>
            )}

            {/* No results */}
            {noResults && (
              <div className="px-4 py-8 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-surface-500 text-sm">
                  Sin resultados para <span className="font-semibold">"{debouncedQ}"</span>
                </p>
              </div>
            )}

            {/* Empty state */}
            {!hasQuery && query.length > 0 && (
              <div className="px-4 py-4 text-center text-surface-400 text-sm">
                Escribe al menos 2 letras para buscar
              </div>
            )}

            {/* Events results */}
            {events.length > 0 && (
              <div>
                <div className="px-4 py-2.5 bg-surface-50 border-b border-surface-100">
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Eventos
                  </p>
                </div>
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-blue-100 flex items-center justify-center text-lg">🎭</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">{event.title}</p>
                      <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                        <span>{formatShortDate(event.date)}</span>
                        <span>·</span>
                        <span className="truncate">{event.venue}</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-brand-blue-600 flex-shrink-0">
                      {formatPrice(event.price, event.isFree)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Places results */}
            {places.length > 0 && (
              <div>
                <div className="px-4 py-2.5 bg-surface-50 border-b border-surface-100 border-t border-t-surface-100">
                  <p className="text-xs font-bold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Lugares
                  </p>
                </div>
                {places.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => handlePlaceClick(place.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      {place.imageUrl ? (
                        <img src={place.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-green-100 flex items-center justify-center text-lg">
                          {CATEGORY_ICONS[place.category] || "📍"}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 truncate">{place.name}</p>
                      <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                        <span>{PLACE_CATEGORY_LABELS[place.category]}</span>
                        {place.rating && (
                          <><span>·</span><span>⭐ {place.rating.toFixed(1)}</span></>
                        )}
                      </p>
                    </div>
                    {place.priceRange && (
                      <span className="text-xs text-surface-400 flex-shrink-0">{place.priceRange}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
