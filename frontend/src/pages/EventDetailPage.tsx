import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, MapPin, Clock, Tag, Users, ArrowLeft,
  ExternalLink, Share2, Heart, Ticket, Star, User
} from "lucide-react";
import { useEvent } from "@/hooks/useKultour";
import { formatDate, formatTime, formatPrice, cn } from "@/lib/utils";

function SkeletonDetail() {
  return (
    <div className="animate-pulse section-container py-10">
      <div className="skeleton h-[400px] rounded-3xl mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton h-8 rounded-2xl w-3/4" />
          <div className="skeleton h-4 rounded-xl w-full" />
          <div className="skeleton h-4 rounded-xl w-5/6" />
          <div className="skeleton h-4 rounded-xl w-4/6" />
        </div>
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id!);

  if (isLoading) return <SkeletonDetail />;

  if (error || !event) {
    return (
      <div className="section-container py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-display font-bold text-surface-900 mb-3">
          Evento no encontrado
        </h2>
        <p className="text-surface-500 mb-8">Este evento no existe o fue cancelado.</p>
        <Link to="/explore" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Volver a explorar
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.date);

  return (
    <div className="pb-24">
      {/* ─── Hero image ──────────────────────────────────── */}
      <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-blue-500 to-brand-green-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-black/30 backdrop-blur-sm text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-black/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Share button */}
        <button className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm text-white border border-white/20 p-2.5 rounded-xl hover:bg-black/50 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>

        {/* Hero content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {event.featured && (
                  <span className="badge bg-brand-orange-500 text-white">⭐ Destacado</span>
                )}
                {event.category && (
                  <span className="badge bg-white/20 text-white border border-white/20">
                    {event.category}
                  </span>
                )}
                <span className={cn(
                  "badge",
                  event.isFree ? "bg-brand-green-500 text-white" : "bg-white text-surface-900"
                )}>
                  {formatPrice(event.price, event.isFree)}
                </span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-display font-bold text-white text-balance">
                {event.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────── */}
      <div className="section-container mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Main info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Meta chips */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2 bg-brand-blue-50 text-brand-blue-700 px-4 py-2.5 rounded-2xl text-sm font-medium">
                <Calendar className="w-4 h-4" />
                {formatDate(event.date, { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <div className="flex items-center gap-2 bg-surface-100 text-surface-700 px-4 py-2.5 rounded-2xl text-sm font-medium">
                <Clock className="w-4 h-4" />
                {formatTime(event.date)}
                {event.endDate && ` — ${formatTime(event.endDate)}`}
              </div>
              <div className="flex items-center gap-2 bg-brand-green-50 text-brand-green-700 px-4 py-2.5 rounded-2xl text-sm font-medium">
                <MapPin className="w-4 h-4" />
                {event.venue}
              </div>
              {event.capacity && (
                <div className="flex items-center gap-2 bg-surface-100 text-surface-700 px-4 py-2.5 rounded-2xl text-sm font-medium">
                  <Users className="w-4 h-4" />
                  {event.capacity.toLocaleString()} personas
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-card"
            >
              <h2 className="text-xl font-display font-bold text-surface-900 mb-4">
                Sobre el evento
              </h2>
              <p className="text-surface-600 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-card"
            >
              <h2 className="text-xl font-display font-bold text-surface-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-green-500" />
                Ubicación
              </h2>
              <p className="text-surface-600 mb-4">{event.address}</p>
              {/* Mini static map placeholder */}
              <div className="bg-brand-green-50 border border-brand-green-100 rounded-2xl h-36 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-brand-green-500 mx-auto mb-2" />
                  <p className="text-sm text-brand-green-700 font-medium">{event.city?.name}</p>
                  <Link to="/map" className="text-xs text-brand-green-500 hover:text-brand-green-600 font-semibold">
                    Ver en el mapa →
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Tags */}
            {event.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                {event.tags.map((tag) => (
                  <span key={tag} className="badge bg-surface-100 text-surface-600">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </motion.div>
            )}
          </div>

          {/* Right: Sticky sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-5">
            {/* Ticket card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-6 shadow-card border border-surface-100"
            >
              <div className="text-center mb-6">
                <div className="text-4xl font-display font-bold text-surface-900 mb-1">
                  {formatPrice(event.price, event.isFree)}
                </div>
                <p className="text-surface-500 text-sm">por persona</p>
              </div>

              {event.ticketUrl ? (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center mb-3"
                >
                  <Ticket className="w-4 h-4" />
                  Comprar entrada
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button className="btn-primary w-full justify-center mb-3">
                  <Ticket className="w-4 h-4" />
                  {event.isFree ? "Registro gratuito" : "Obtener entrada"}
                </button>
              )}

              <button className="btn-secondary w-full justify-center">
                <Heart className="w-4 h-4" />
                Guardar evento
              </button>

              {event.capacity && (
                <p className="text-center text-xs text-surface-400 mt-4">
                  Capacidad: {event.capacity.toLocaleString()} personas
                </p>
              )}
            </motion.div>

            {/* Organizer card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-3xl p-6 shadow-card border border-surface-100"
            >
              <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wide mb-4">
                Organizador
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white text-lg font-bold">
                  {event.organizer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-surface-900">{event.organizer.name}</p>
                  <div className="flex items-center gap-1 text-xs text-brand-orange-500">
                    <Star className="w-3 h-3 fill-brand-orange-500" />
                    <span className="font-medium">Organizador verificado</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
