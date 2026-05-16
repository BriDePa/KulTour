import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Star, Phone, Globe, Instagram,
  Clock, Tag, Share2, Heart, ExternalLink, Map, Send, ChevronLeft, ChevronRight, X,
  Beer, UtensilsCrossed, Palette, Landmark, Trees, Music, Coffee, Image, Clapperboard, Plus
} from "lucide-react";
import { usePlace } from "@/hooks/useKultour";
import { useReviews, useCreateReview, useAverageRating } from "@/hooks/useReviews";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useToggleFavorite } from "@/hooks/useFavorites";
import { useAuthStore } from "@/store/authStore";
import { useAuthModal } from "@/components/shared/AuthModal";
import { cn, PLACE_CATEGORY_LABELS } from "@/lib/utils";

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
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews(id!);
  const { data: avgRating } = useAverageRating(id!);
  const { isAuthenticated, user } = useAuthStore();
  const { open } = useAuthModal();
  const { isFavorite } = useFavoritesStore();
  const toggleFavorite = useToggleFavorite();
  const createReview = useCreateReview();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewPage, setReviewPage] = useState(1);

  const isFav = isFavorite(undefined, id);
  const reviews = reviewsData?.reviews || [];
  const totalReviews = reviewsData?.pagination?.total || 0;

  const handleSaveFavorite = () => {
    if (!isAuthenticated) {
      open("login");
      return;
    }
    toggleFavorite(undefined, id);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      open("login");
      return;
    }
    if (rating === 0) return;
    createReview.mutate(
      { placeId: id!, rating, comment },
      { onSuccess: () => { setRating(0); setComment(""); } }
    );
  };

  if (isLoading) return <SkeletonDetail />;

  if (error || !place) {
    return (
      <div className="section-container py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-10 h-10 text-surface-400 dark:text-surface-500" />
        </div>
        <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-surface-50 mb-3">Lugar no encontrado</h2>
        <p className="text-surface-500 dark:text-surface-400 mb-8">Este lugar no existe o fue eliminado.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>
    );
  }

  const categoryInfo = CATEGORY_ICONS[place.category] || CATEGORY_ICONS.OTHER;
  const CategoryIcon = categoryInfo.icon;
  const label = PLACE_CATEGORY_LABELS[place.category] || "Lugar";
  const hours = place.openingHours as Record<string, string> | null;

  return (
    <div className="pb-24">
      {/* ─── Hero ──────────────────────────────────────────── */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        {place.imageUrl ? (
          <img src={place.imageUrl} alt={place.name}
            loading="eager"
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-green-400 to-brand-blue-400 flex items-center justify-center">
            <CategoryIcon className="w-16 h-16 text-white" />
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
              <span className="badge bg-white/20 dark:bg-surface-800/60 text-white dark:text-surface-100 border border-white/20 dark:border-surface-700/50">
                <CategoryIcon className="w-3.5 h-3.5" /> {label}
              </span>
              {place.featured && (
                <span className="badge bg-brand-orange-500 text-white flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Destacado
                </span>
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
              <div className="flex items-center gap-2 bg-brand-green-50 dark:bg-brand-green-900/30 text-brand-green-700 dark:text-brand-green-400 px-4 py-2.5 rounded-2xl text-sm font-medium">
                <MapPin className="w-4 h-4" /> {place.address}
              </div>
              {place.rating && place.rating > 0 && (
                <div className="flex items-center gap-2 bg-brand-orange-50 dark:bg-brand-orange-900/30 text-brand-orange-700 dark:text-brand-orange-400 px-4 py-2.5 rounded-2xl text-sm font-medium">
                  <Star className="w-4 h-4 fill-brand-orange-500" />
                  {place.rating.toFixed(1)} de 5
                </div>
              )}
              {place.priceRange && (
                <div className="flex items-center gap-2 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 px-4 py-2.5 rounded-2xl text-sm font-medium">
                  {place.priceRange} ·{" "}
                  {{ "$": "Económico", "$$": "Moderado", "$$$": "Premium" }[place.priceRange] || place.priceRange}
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark"
            >
              <h2 className="text-lg font-display font-bold text-surface-900 dark:text-surface-50 mb-3">Sobre el lugar</h2>
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed">{place.description}</p>
            </motion.div>

            {/* Opening Hours */}
            {hours && Object.keys(hours).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark"
              >
                <h2 className="text-lg font-display font-bold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
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
                          isToday ? "bg-brand-blue-50 dark:bg-brand-blue-900/30 font-semibold" : ""
                        )}
                      >
                        <span className={cn("capitalize", isToday ? "text-brand-blue-700 dark:text-brand-blue-400" : "text-surface-600 dark:text-surface-400")}>
                          {DAYS_ES[day] || day}
                          {isToday && <span className="ml-2 text-xs text-brand-blue-500 dark:text-brand-blue-400 font-bold">(hoy)</span>}
                        </span>
                        <span className={isToday ? "text-brand-blue-700 dark:text-brand-blue-400" : "text-surface-700 dark:text-surface-300"}>
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
                  <span key={tag} className="badge bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Map placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-brand-green-50 dark:bg-brand-green-900/30 border border-brand-green-100 dark:border-brand-green-800 rounded-3xl p-5"
            >
              <h2 className="text-lg font-display font-bold text-surface-900 dark:text-surface-50 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-green-500" /> Cómo llegar
              </h2>
              <p className="text-surface-600 dark:text-surface-400 text-sm mb-4">{place.address}</p>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-green-600 dark:text-brand-green-400 hover:text-brand-green-700 dark:hover:text-brand-green-300 transition-colors"
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
              className="bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark border border-surface-100 dark:border-surface-700"
            >
              <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-4">
                Contacto
              </h3>
              <div className="space-y-3">
                {place.phone && (
                  <a href={`tel:${place.phone}`}
                    className="flex items-center gap-3 text-sm text-surface-700 dark:text-surface-300 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-brand-blue-50 dark:bg-brand-blue-900/30 flex items-center justify-center group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/50 transition-colors">
                      <Phone className="w-4 h-4 text-brand-blue-500" />
                    </div>
                    <span className="font-medium">{place.phone}</span>
                  </a>
                )}
                {place.website && (
                  <a href={place.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-surface-700 dark:text-surface-300 hover:text-brand-blue-600 dark:hover:text-brand-blue-400 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-brand-blue-50 dark:bg-brand-blue-900/30 flex items-center justify-center group-hover:bg-brand-blue-100 dark:group-hover:bg-brand-blue-900/50 transition-colors">
                      <Globe className="w-4 h-4 text-brand-blue-500" />
                    </div>
                    <span className="font-medium truncate">{place.website.replace("https://", "")}</span>
                  </a>
                )}
                {place.instagram && (
                  <a
                    href={`https://instagram.com/${place.instagram.replace("@", "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-surface-700 dark:text-surface-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center group-hover:bg-pink-100 dark:group-hover:bg-pink-900/50 transition-colors">
                      <Instagram className="w-4 h-4 text-pink-500" />
                    </div>
                    <span className="font-medium">{place.instagram}</span>
                  </a>
                )}
                {!place.phone && !place.website && !place.instagram && (
                  <p className="text-surface-400 dark:text-surface-500 text-sm">Sin información de contacto</p>
                )}
              </div>
            </motion.div>

            {/* Save button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleSaveFavorite}
              className={cn(
                "btn-secondary w-full justify-center",
                isFav && "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
              )}
            >
              <motion.div animate={{ scale: isFav ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.3 }}>
                <Heart className={cn("w-4 h-4", isFav && "fill-current")} />
              </motion.div>
              {isFav ? "Quitar de guardados" : "Guardar lugar"}
            </motion.button>
          </div>
        </div>

        {/* ─── Reviews ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark"
        >
          <h2 className="text-lg font-display font-bold text-surface-900 dark:text-surface-50 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-brand-orange-500" />
            Reseñas ({totalReviews})
            {avgRating && (
              <span className="ml-2 text-sm font-medium text-surface-500 dark:text-surface-400">
                · Promedio: {avgRating.toFixed(1)} <Star className="w-3.5 h-3.5 fill-brand-orange-500 text-brand-orange-500 inline" />
              </span>
            )}
          </h2>

          {/* Review form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-surface-50 dark:bg-surface-700/50 rounded-2xl">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-6 h-6",
                        (hoverRating || rating) >= star
                          ? "text-brand-orange-500 fill-brand-orange-500"
                          : "text-surface-300 dark:text-surface-600"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-surface-500 dark:text-surface-400">
                  {rating > 0 ? `${rating}/5` : "Sin calificación"}
                </span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia en este lugar..."
                className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-surface-100 bg-white dark:bg-surface-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-500 dark:focus:ring-brand-blue-400 focus:border-transparent transition-all"
                rows={3}
              />
              <button
                type="submit"
                disabled={rating === 0 || createReview.isPending}
                className="btn-primary mt-3 text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {createReview.isPending ? "Publicando..." : "Publicar reseña"}
              </button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-surface-50 dark:bg-surface-700/50 rounded-2xl text-center">
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-2">Inicia sesión para dejar una reseña</p>
              <button onClick={() => open("login")} className="btn-primary text-sm">
                Iniciar sesión
              </button>
            </div>
          )}

          {/* Reviews list */}
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-surface-100 dark:bg-surface-700 rounded-xl" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-surface-400 dark:text-surface-500 text-sm py-8">
              Aún no hay reseñas. ¡Sé el primero!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-surface-900 dark:text-surface-100">{review.user.name}</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-3 h-3",
                                star <= review.rating
                                  ? "text-brand-orange-500 fill-brand-orange-500"
                                  : "text-surface-300 dark:text-surface-600"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">{review.comment}</p>
                      <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString("es-BO")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {totalReviews > 4 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                    disabled={reviewPage === 1}
                    className="p-2 rounded-xl bg-surface-100 dark:bg-surface-700 disabled:opacity-50 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-surface-500 dark:text-surface-400 px-3">
                    {reviewPage} / {Math.ceil(totalReviews / 4)}
                  </span>
                  <button
                    onClick={() => setReviewPage((p) => p + 1)}
                    disabled={reviewPage >= Math.ceil(totalReviews / 4)}
                    className="p-2 rounded-xl bg-surface-100 dark:bg-surface-700 disabled:opacity-50 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}