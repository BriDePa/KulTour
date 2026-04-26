import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Star, Phone, Globe, Instagram,
  Clock, Tag, Share2, Heart, ExternalLink, Map
} from "lucide-react";
import { usePlace } from "@/hooks/useKultour";
import { cn, PLACE_CATEGORY_LABELS } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, string> = {
  BAR: "🍺", RESTAURANT: "🍽️", CULTURAL_CENTER: "🎭",
  MUSEUM: "🏛️", PARK: "🌳", CLUB: "🎵",
  CAFE: "☕", GALLERY: "🖼️", THEATER: "🎬", OTHER: "📍",
};

const DAYS_ES: Record<string, string> = {
  lunes: "Lunes", martes: "Martes", miercoles: "Miércoles",
  jueves: "Jueves", viernes: "Viernes", sabado: "Sábado", domingo: "Domingo",
};

function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="skeleton h-72 rounded-none mb-6" />
      <div className="section-container space-y-4">
        <div className="skeleton h-8 w-2/3 rounded-2xl" />
        <div className="skeleton h-4 w-1/2 rounded-xl" />
        <div className="skeleton h-32 rounded-3xl" />
      </div>
    </div>
  );
}

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: place, isLoading, error } = usePlace(id!);

  if (isLoading) return <SkeletonDetail />;

  if (error || !place) {
    return (
      <div className="section-container py-24 text-center">
        <div className="text-6xl mb-4">📍</div>
        <h2 className="text-2xl font-display font-bold mb-3">Lugar no encontrado</h2>
        <p className="text-surface-500 mb-8">Este lugar no existe o fue eliminado.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>
    );
  }

  const emoji = CATEGORY_ICONS[place.category] || "📍";
  const label = PLACE_CATEGORY_LABELS[place.category] || "Lugar";
  const hours = place.openingHours as Record<string, string> | null;

  return (
    <div className="pb-24">
      {/* ─── Hero ──────────────────────────────────────────── */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {place.imageUrl ? (
          <img src={place.imageUrl} alt={place.name}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-green-400 to-brand-blue-400 flex items-center justify-center">
            <span className="text-8xl">{emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white border border-white/20 px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 hover:bg-black/50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <button className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white border border-white/20 p-2.5 rounded-xl hover:bg-black/50 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>

        {/* Hero info */}
        <div className="absolute bottom-0 left-0 right-0 p-5 section-container">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="badge bg-white/20 text-white border border-white/20">
                {emoji} {label}
              </span>
              {place.featured && (
                <span className="badge bg-brand-orange-500 text-white">⭐ Destacado</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">
              {place.name}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────────── */}
      <div className="section-container mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Quick info chips */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center gap-2 bg-brand-green-50 text-brand-green-700 px-4 py-2.5 rounded-2xl text-sm font-medium">
                <MapPin className="w-4 h-4" /> {place.address}
              </div>
              {place.rating && place.rating > 0 && (
                <div className="flex items-center gap-2 bg-brand-orange-50 text-brand-orange-700 px-4 py-2.5 rounded-2xl text-sm font-medium">
                  <Star className="w-4 h-4 fill-brand-orange-500" />
                  {place.rating.toFixed(1)} de 5
                </div>
              )}
              {place.priceRange && (
                <div className="flex items-center gap-2 bg-surface-100 text-surface-700 px-4 py-2.5 rounded-2xl text-sm font-medium">
                  {place.priceRange} ·{" "}
                  {{ "$": "Económico", "$$": "Moderado", "$$$": "Premium" }[place.priceRange] || ""}
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-6 shadow-card"
            >
              <h2 className="text-lg font-display font-bold text-surface-900 mb-3">Sobre el lugar</h2>
              <p className="text-surface-600 leading-relaxed">{place.description}</p>
            </motion.div>

            {/* Opening Hours */}
            {hours && Object.keys(hours).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-6 shadow-card"
              >
                <h2 className="text-lg font-display font-bold text-surface-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-blue-500" /> Horarios
                </h2>
                <div className="space-y-2.5">
                  {Object.entries(hours).map(([day, hours]) => {
                    const today = new Date().toLocaleDateString("es", { weekday: "long" }).toLowerCase();
                    const isToday = today.startsWith(day.slice(0, 4));
                    return (
                      <div key={day}
                        className={cn(
                          "flex items-center justify-between py-2 px-3 rounded-xl text-sm",
                          isToday ? "bg-brand-blue-50 font-semibold" : ""
                        )}
                      >
                        <span className={cn("capitalize", isToday ? "text-brand-blue-700" : "text-surface-600")}>
                          {DAYS_ES[day] || day}
                          {isToday && <span className="ml-2 text-xs text-brand-blue-500 font-bold">(hoy)</span>}
                        </span>
                        <span className={isToday ? "text-brand-blue-700" : "text-surface-800"}>
                          {hours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Tags */}
            {place.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex flex-wrap gap-2"
              >
                {place.tags.map((tag) => (
                  <span key={tag} className="badge bg-surface-100 text-surface-600">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-brand-green-50 border border-brand-green-100 rounded-3xl p-5"
            >
              <h2 className="text-lg font-display font-bold text-surface-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-green-500" /> Cómo llegar
              </h2>
              <p className="text-surface-600 text-sm mb-4">{place.address}</p>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green-600 hover:text-brand-green-700 transition-colors"
              >
                <Map className="w-4 h-4" />
                Ver en el mapa
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-5">
            {/* Contact card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-6 shadow-card border border-surface-100"
            >
              <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-4">
                Contacto
              </h3>
              <div className="space-y-3">
                {place.phone && (
                  <a href={`tel:${place.phone}`}
                    className="flex items-center gap-3 text-sm text-surface-700 hover:text-brand-blue-600 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-brand-blue-50 flex items-center justify-center group-hover:bg-brand-blue-100 transition-colors">
                      <Phone className="w-4 h-4 text-brand-blue-500" />
                    </div>
                    <span className="font-medium">{place.phone}</span>
                  </a>
                )}
                {place.website && (
                  <a href={place.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-surface-700 hover:text-brand-blue-600 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-brand-blue-50 flex items-center justify-center group-hover:bg-brand-blue-100 transition-colors">
                      <Globe className="w-4 h-4 text-brand-blue-500" />
                    </div>
                    <span className="font-medium truncate">{place.website.replace("https://", "")}</span>
                  </a>
                )}
                {place.instagram && (
                  <a
                    href={`https://instagram.com/${place.instagram.replace("@", "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-surface-700 hover:text-pink-600 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                      <Instagram className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="font-medium">{place.instagram}</span>
                  </a>
                )}
                {!place.phone && !place.website && !place.instagram && (
                  <p className="text-surface-400 text-sm">Sin información de contacto</p>
                )}
              </div>
            </motion.div>

            {/* Save button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="btn-secondary w-full justify-center"
            >
              <Heart className="w-4 h-4" />
              Guardar lugar
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
