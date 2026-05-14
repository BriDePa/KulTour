import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Calendar, MapPin, Tag, ChevronDown, CalendarDays } from "lucide-react";
import { useEvents, usePlaces } from "@/hooks/useKultour";
import EventCard from "@/components/shared/EventCard";
import PlaceCard from "@/components/shared/PlaceCard";
import { cn, EVENT_CATEGORIES, PLACE_CATEGORY_LABELS } from "@/lib/utils";
import type { EventFilters, PlaceFilters, PlaceCategory } from "@/types";

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap border",
        active
          ? "bg-brand-blue-500 text-white border-brand-blue-500 shadow-glow dark:shadow-glow-dark"
          : "bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700 hover:border-brand-blue-300 dark:hover:border-brand-blue-600 hover:text-brand-blue-600 dark:hover:text-brand-blue-400"
      )}
    >
      {label}
    </button>
  );
}

function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton h-80 rounded-3xl" />
      ))}
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-brand-blue-50 dark:bg-brand-blue-900/30 flex items-center justify-center mx-auto mb-4">
        {tab === "events" ? (
          <CalendarDays className="w-8 h-8 text-brand-blue-500" />
        ) : (
          <MapPin className="w-8 h-8 text-brand-green-500" />
        )}
      </div>
      <h3 className="text-xl font-display font-bold text-surface-900 dark:text-surface-50 mb-2">
        Sin resultados
      </h3>
      <p className="text-surface-500 dark:text-surface-400 text-sm">
        Intenta con otros filtros o términos de búsqueda
      </p>
    </div>
  );
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<"events" | "places">("events");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [eventCategory, setEventCategory] = useState<string>("");
  const [placeCategory, setPlaceCategory] = useState<string>("");
  const [isFree, setIsFree] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  }, []);

  const eventFilters: EventFilters = {
    search: debouncedSearch || undefined,
    category: eventCategory || undefined,
    isFree: isFree || undefined,
    limit: 12,
  };

  const placeFilters: PlaceFilters = {
    search: debouncedSearch || undefined,
    category: placeCategory as PlaceCategory || undefined,
    limit: 12,
  };

  const { data: eventsData, isLoading: eventsLoading } = useEvents(eventFilters);
  const { data: placesData, isLoading: placesLoading } = usePlaces(placeFilters);

  const events = eventsData?.events || [];
  const places = placesData?.places || [];
  const eventTotal = eventsData?.pagination.total || 0;
  const placeTotal = placesData?.pagination.total || 0;

  const hasActiveFilters = eventCategory || placeCategory || isFree || debouncedSearch;

  return (
    <div className="min-h-screen">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-brand-blue-600 to-brand-blue-800 dark:from-brand-blue-700 dark:to-surface-900 pt-10 pb-16">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-3">
              Explorar La Paz
            </h1>
            <p className="text-white/70 dark:text-white/60 text-lg mb-8">
              Descubre eventos y lugares únicos en la ciudad más alta del mundo
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                placeholder={activeTab === "events" ? "Buscar eventos..." : "Buscar lugares..."}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white dark:bg-surface-800 border-0 rounded-2xl pl-12 pr-12 py-4 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-500 outline-none shadow-card-hover dark:shadow-card-hover-dark text-base"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setDebouncedSearch(""); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="section-container -mt-6">
        {/* ─── Tabs card ──────────────────────────────────── */}
        <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-card dark:shadow-card-dark p-2 flex gap-2 mb-8 inline-flex">
          <button
            onClick={() => setActiveTab("events")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
              activeTab === "events"
                ? "bg-brand-blue-500 text-white shadow-soft"
                : "text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-100"
            )}
          >
            <Calendar className="w-4 h-4" />
            Eventos
            {eventTotal > 0 && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-bold",
                activeTab === "events" ? "bg-white/20 text-white" : "bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400"
              )}>
                {eventTotal}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("places")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200",
              activeTab === "places"
                ? "bg-brand-blue-500 text-white shadow-soft"
                : "text-surface-500 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-100"
            )}
          >
            <MapPin className="w-4 h-4" />
            Lugares
            {placeTotal > 0 && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-bold",
                activeTab === "places" ? "bg-white/20 text-white" : "bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400"
              )}>
                {placeTotal}
              </span>
            )}
          </button>
        </div>

        {/* ─── Filters row ────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {activeTab === "events" && (
              <>
                <FilterPill
                  label="Todos"
                  active={!eventCategory}
                  onClick={() => setEventCategory("")}
                />
                {EVENT_CATEGORIES.map((cat) => (
                  <FilterPill
                    key={cat}
                    label={cat}
                    active={eventCategory === cat}
                    onClick={() => setEventCategory(cat === eventCategory ? "" : cat)}
                  />
                ))}
                <FilterPill
                  label="Gratis"
                  active={isFree}
                  onClick={() => setIsFree(!isFree)}
                />
              </>
            )}

            {activeTab === "places" && (
              <>
                <FilterPill
                  label="Todos"
                  active={!placeCategory}
                  onClick={() => setPlaceCategory("")}
                />
                {Object.entries(PLACE_CATEGORY_LABELS).map(([key, label]) => (
                  <FilterPill
                    key={key}
                    label={label}
                    active={placeCategory === key}
                    onClick={() => setPlaceCategory(key === placeCategory ? "" : key)}
                  />
                ))}
              </>
            )}
          </div>

          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                setEventCategory("");
                setPlaceCategory("");
                setIsFree(false);
                setSearch("");
                setDebouncedSearch("");
              }}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium whitespace-nowrap"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar filtros
            </motion.button>
          )}
        </div>

        {/* ─── Content grid ───────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="pb-24"
          >
            {activeTab === "events" ? (
              eventsLoading ? (
                <SkeletonGrid />
              ) : events.length === 0 ? (
                <EmptyState tab="events" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )
            ) : (
              placesLoading ? (
                <SkeletonGrid />
              ) : places.length === 0 ? (
                <EmptyState tab="places" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {places.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}