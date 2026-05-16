import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Star, LogOut, Settings, Shield, Compass, Sparkles, Zap, MapPin, Loader2, Store } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLogout } from "@/hooks/useAuth";
import { useAuthModal } from "@/components/shared/AuthModal";
import { useEvents, useMyPlaces } from "@/hooks/useKultour";
import { useToastStore } from "@/store/toastStore";
import EventCard from "@/components/shared/EventCard";
import PlaceCard from "@/components/shared/PlaceCard";
import { Link } from "react-router-dom";
import api from "@/lib/api";

const ROLE_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  USER:      { label: "Explorador",   color: "bg-brand-blue-50 dark:bg-brand-blue-900/30 text-brand-blue-600 dark:text-brand-blue-400",   icon: Compass },
  ORGANIZER: { label: "Organizador",  color: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",            icon: Sparkles },
  ADMIN:     { label: "Administrador",color: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",                  icon: Zap },
};

function GuestProfile() {
  const { open } = useAuthModal();
  return (
    <div className="section-container py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-blue-100 dark:from-brand-blue-900/30 to-brand-green-100 dark:to-brand-green-900/30 flex items-center justify-center mx-auto mb-6">
        <User className="w-12 h-12 text-surface-400 dark:text-surface-500" />
      </div>
      <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-surface-50 mb-3">
        Tu perfil de Kultour
      </h2>
      <p className="text-surface-500 dark:text-surface-400 mb-8 max-w-sm mx-auto">
        Inicia sesión para ver tu perfil, guardar eventos favoritos y gestionar tu cuenta.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => open("login")} className="btn-primary">
          Iniciar sesión
        </button>
        <button onClick={() => open("register")} className="btn-secondary">
          Crear cuenta gratis
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const logout = useLogout();
  const favorites = useFavoritesStore((state) => state.favorites);
  const { success, error } = useToastStore();
  const [verifying, setVerifying] = useState(false);

  const { data: eventsData } = useEvents({ limit: 50 });
  const { data: myPlacesData } = useMyPlaces(user?.id);
  const myEvents = eventsData?.events.filter(
    (e) => e.organizer.id === user?.id
  ) || [];
  const myPlaces = myPlacesData?.places || [];

  const handleVerifyRequest = async () => {
    setVerifying(true);
    try {
      await api.post("/auth/verify-request");
      success("Solicitud enviada", "Tu solicitud de verificación será procesada pronto");
    } catch (err: any) {
      error("Error", err?.response?.data?.message || "No se pudo enviar la solicitud");
    } finally {
      setVerifying(false);
    }
  };

  if (!isAuthenticated || !user) return <GuestProfile />;

  const roleInfo = ROLE_LABEL[user.role] || ROLE_LABEL.USER;
  const joinDate = new Date(user.createdAt).toLocaleDateString("es-BO", {
    month: "long", year: "numeric"
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-surface-800 dark:from-surface-900 to-surface-900 dark:to-surface-950 pt-10 pb-20">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-card-hover">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">{user.name}</h1>
            <p className="text-surface-400 dark:text-surface-500 text-sm mb-3">{user.email}</p>
            <div className="flex items-center gap-2">
              <span className={`badge ${roleInfo.color} inline-flex`}>
                <roleInfo.icon className="w-3.5 h-3.5" /> {roleInfo.label}
              </span>
              {user.isVerified && (
                <span className="badge bg-brand-green-500 text-white inline-flex">
                  <Star className="w-3.5 h-3.5 fill-current" /> Verificado
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="section-container -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Info card */}
          <div className="lg:col-span-1 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-surface-800 rounded-3xl shadow-card dark:shadow-card-dark p-6"
            >
              <h3 className="font-display font-bold text-surface-900 dark:text-surface-50 mb-5">Información</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue-50 dark:bg-brand-blue-900/30 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-brand-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Email</p>
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-green-50 dark:bg-brand-green-900/30 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-brand-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Miembro desde</p>
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 capitalize">{joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Rol</p>
                    <p className="text-sm font-medium text-surface-900 dark:text-surface-100 flex items-center gap-1.5">
                      <roleInfo.icon className="w-4 h-4" /> {roleInfo.label}
                    </p>
                  </div>
                </div>
                {user.bio && (
                  <div className="pt-3 border-t border-surface-100 dark:border-surface-700">
                    <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Bio</p>
                    <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{user.bio}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 text-center">
                <div className="text-2xl font-display font-bold text-brand-blue-600 dark:text-brand-blue-400">{myEvents.length}</div>
                <div className="text-xs text-surface-500 dark:text-surface-400 font-medium mt-0.5">Eventos creados</div>
              </div>
              <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-card dark:shadow-card-dark p-4 text-center">
                <div className="text-2xl font-display font-bold text-brand-orange-500 dark:text-brand-orange-400">{favorites.length}</div>
                <div className="text-xs text-surface-500 dark:text-surface-400 font-medium mt-0.5">Guardados</div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white dark:bg-surface-800 rounded-3xl shadow-card dark:shadow-card-dark p-4 space-y-1"
            >
              <Link to="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors text-sm font-medium text-surface-700 dark:text-surface-300">
                <Settings className="w-4 h-4 text-surface-400 dark:text-surface-500" />
                Panel de organizador
              </Link>
              {!user.isVerified && (
                <button
                  onClick={handleVerifyRequest}
                  disabled={verifying}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-brand-orange-50 dark:hover:bg-brand-orange-900/20 transition-colors text-sm font-medium text-brand-orange-600 dark:text-brand-orange-400 disabled:opacity-50"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                  {verifying ? "Enviando..." : "Solicitar verificación"}
                </button>
              )}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </motion.div>
          </div>

          {/* Right: My content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-display font-bold text-surface-900 dark:text-surface-50 text-xl mb-5">
                Mis eventos ({myEvents.length})
              </h3>
              {myEvents.length === 0 ? (
                <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-card dark:shadow-card-dark p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue-50 dark:bg-brand-blue-900/30 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-7 h-7 text-brand-blue-500" />
                  </div>
                  <h4 className="font-display font-bold text-surface-900 dark:text-surface-50 mb-2">
                    Sin eventos creados
                  </h4>
                  <p className="text-surface-500 dark:text-surface-400 text-sm mb-4">
                    Crea tu primer evento y llega a miles de personas.
                  </p>
                  <Link to="/dashboard" className="btn-primary inline-flex text-sm">
                    Crear evento
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {myEvents.slice(0, 4).map((event) => (
                    <EventCard key={event.id} event={event} compact />
                  ))}
                </div>
              )}
            </motion.div>

            {/* My Places */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-display font-bold text-surface-900 dark:text-surface-50 text-xl mb-5">
                Mis lugares ({myPlaces.length})
              </h3>
              {myPlaces.length === 0 ? (
                <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-card dark:shadow-card-dark p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-green-50 dark:bg-brand-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Store className="w-7 h-7 text-brand-green-500" />
                  </div>
                  <h4 className="font-display font-bold text-surface-900 dark:text-surface-50 mb-2">
                    Sin lugares registrados
                  </h4>
                  <p className="text-surface-500 dark:text-surface-400 text-sm mb-4">
                    Registra tus lugares favoritos o negocios.
                  </p>
                  <Link to="/dashboard" className="btn-secondary inline-flex text-sm">
                    Crear lugar
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {myPlaces.slice(0, 4).map((place) => (
                    <PlaceCard key={place.id} place={place} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}