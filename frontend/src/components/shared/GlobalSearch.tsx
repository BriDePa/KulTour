import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Calendar, MapPin, Loader2, Clock, ArrowRight, Beer, UtensilsCrossed, Palette, Landmark, Trees, Music, Coffee, Image, Clapperboard, Plus, HelpCircle, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/hooks/useKultour";
import { cn, formatShortDate, formatPrice, PLACE_CATEGORY_LABELS } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, { icon: any; color: string }> = {
  BAR: { icon: Beer, color: "bg-brand-blue-100 dark:bg-brand-blue-900/30" },
  RESTAURANT: { icon: UtensilsCrossed, color: "bg-brand-green-100 dark:bg-brand-green-900/30" },
  CULTURAL_CENTER: { icon: Palette, color: "bg-violet-100 dark:bg-violet-900/30" },
  MUSEUM: { icon: Landmark, color: "bg-blue-100 dark:bg-blue-900/30" },
  PARK: { icon: Trees, color: "bg-green-100 dark:bg-green-900/30" },
  CLUB: { icon: Music, color: "bg-pink-100 dark:bg-pink-900/30" },
  CAFE: { icon: Coffee, color: "bg-amber-100 dark:bg-amber-900/30" },
  GALLERY: { icon: Image, color: "bg-teal-100 dark:bg-teal-900/30" },
  THEATER: { icon: Clapperboard, color: "bg-red-100 dark:bg-red-900/30" },
  OTHER: { icon: Plus, color: "bg-surface-100 dark:bg-surface-700" },
};

const RECENT_KEY = "kultour_recent_searches";
const MAX_RECENT = 5;

interface GlobalSearchProps {
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function GlobalSearch({ onClose, autoFocus }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    } catch { return []; }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const debouncedQ = query.trim().length >= 2 ? query.trim() : "";
  const { data: searchData, isLoading } = useSearch(debouncedQ, debouncedQ.length >= 2);
  const events = searchData?.events || [];
  const places = searchData?.places || [];
  const totalResults = (events.length + places.length);
  const hasResults = totalResults > 0;
  const showDropdown = focused && (debouncedQ.length >= 2 || recentSearches.length > 0);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const addRecent = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecent = (q: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== q);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleEventClick = (id: string) => {
    addRecent(query);
    navigate(`/events/${id}`);
    setQuery("");
    onClose?.();
  };

  const handlePlaceClick = (id: string) => {
    addRecent(query);
    navigate(`/places/${id}`);
    setQuery("");
    onClose?.();
  };

  const handleSearchClick = () => {
    if (!debouncedQ) return;
    addRecent(debouncedQ);
    navigate(`/explore?search=${encodeURIComponent(debouncedQ)}`);
    setQuery("");
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = events.length + places.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, totalItems - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        if (activeIndex < events.length) {
          handleEventClick(events[activeIndex].id);
        } else {
          handlePlaceClick(places[activeIndex - events.length].id);
        }
      } else if (debouncedQ) {
        handleSearchClick();
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const allItems = [...events.map((e) => ({ type: "event" as const, data: e })), ...places.map((p) => ({ type: "place" as const, data: p }))];

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-surface-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface-800 rounded-2xl shadow-card-hover dark:shadow-card-hover-dark border border-surface-100 dark:border-surface-700 overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
          >
            {isLoading && debouncedQ.length >= 2 && (
              <div className="flex items-center gap-3 px-4 py-4 text-surface-500 dark:text-surface-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-brand-blue-500 dark:text-brand-blue-400" />
                Buscando…
              </div>
            )}

            {!debouncedQ && recentSearches.length > 0 && (
              <div>
                <div className="px-4 py-2.5 bg-surface-50 dark:bg-surface-700/50 border-b border-surface-100 dark:border-surface-700">
                  <p className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Recientes
                  </p>
                </div>
                {recentSearches.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuery(q); addRecent(q); }}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-left"
                  >
                    <span className="text-sm text-surface-600 dark:text-surface-300">{q}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); clearRecent(q); }}
                        className="p-1 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3 text-surface-400" />
                      </button>
                      <ArrowRight className="w-3.5 h-3.5 text-surface-300" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!debouncedQ && recentSearches.length === 0 && (
              <div className="px-4 py-6 text-center text-surface-400 dark:text-surface-500 text-sm">
                Escribe para buscar eventos y lugares
              </div>
            )}

            {debouncedQ.length >= 2 && !isLoading && !hasResults && (
              <div className="px-4 py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-7 h-7 text-surface-400 dark:text-surface-500" />
                </div>
                <p className="text-surface-500 dark:text-surface-400 text-sm">
                  Sin resultados para <span className="font-semibold">"{debouncedQ}"</span>
                </p>
              </div>
            )}

            {events.length > 0 && (
              <div>
                <div className="px-4 py-2.5 bg-surface-50 dark:bg-surface-700/50 border-b border-surface-100 dark:border-surface-700">
                  <p className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" /> Eventos ({events.length})
                  </p>
                </div>
                {events.map((event, idx) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
                      activeIndex === idx ? "bg-brand-blue-50 dark:bg-brand-blue-900/20" : "hover:bg-surface-50 dark:hover:bg-surface-700"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-brand-blue-100 dark:bg-brand-blue-900/30 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-brand-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{event.title}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1 mt-0.5">
                        <span>{formatShortDate(event.date)}</span>
                        <span>·</span>
                        <span className="truncate">{event.venue}</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold text-brand-blue-600 dark:text-brand-blue-400 flex-shrink-0">
                      {formatPrice(event.price, event.isFree)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {places.length > 0 && (
              <div>
                <div className="px-4 py-2.5 bg-surface-50 dark:bg-surface-700/50 border-b border-surface-100 dark:border-surface-700 border-t border-t-surface-100 dark:border-t-surface-700">
                  <p className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> Lugares ({places.length})
                  </p>
                </div>
                {places.map((place, idx) => (
                  <button
                    key={place.id}
                    onClick={() => handlePlaceClick(place.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left",
                      activeIndex === events.length + idx ? "bg-brand-green-50 dark:bg-brand-green-900/20" : "hover:bg-surface-50 dark:hover:bg-surface-700"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-brand-green-100 dark:bg-brand-green-900/30 flex items-center justify-center">
                            {(() => {
                              const catInfo = CATEGORY_ICONS[place.category] || CATEGORY_ICONS.OTHER;
                              const Icon = catInfo.icon;
                              return <Icon className="w-5 h-5 text-brand-green-500" />;
                            })()}
                          </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{place.name}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1 mt-0.5">
                        <span>{PLACE_CATEGORY_LABELS[place.category]}</span>
                        {place.rating && (
                          <><span>·</span><span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-brand-orange-500 fill-brand-orange-500" /> {place.rating.toFixed(1)}</span></>
                        )}
                      </p>
                    </div>
                    {place.priceRange && (
                      <span className="text-xs text-surface-400 dark:text-surface-500 flex-shrink-0">{place.priceRange}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {hasResults && (
              <button
                onClick={handleSearchClick}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-surface-700/50 hover:bg-surface-100 dark:hover:bg-surface-700 border-t border-surface-100 dark:border-t-surface-700 transition-colors text-sm font-semibold text-brand-blue-600 dark:text-brand-blue-400"
              >
                Ver todos los resultados ({totalResults})
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}