import { motion } from "framer-motion";
import { User, Mail, Calendar, Star, LogOut, Settings, Shield } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useAuthModal } from "@/components/shared/AuthModal";
import { useEvents } from "@/hooks/useKultour";
import EventCard from "@/components/shared/EventCard";
import { Link } from "react-router-dom";

const ROLE_LABEL: Record<string, { label: string; color: string; emoji: string }> = {
  USER:      { label: "Explorador",   color: "bg-brand-blue-50 text-brand-blue-600",   emoji: "🧭" },
  ORGANIZER: { label: "Organizador",  color: "bg-violet-50 text-violet-600",            emoji: "🎭" },
  ADMIN:     { label: "Administrador",color: "bg-red-50 text-red-600",                  emoji: "⚡" },
};

function GuestProfile() {
  const { open } = useAuthModal();
  return (
    <div className="section-container py-24 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-blue-100 to-brand-green-100 flex items-center justify-center mx-auto mb-6">
        <User className="w-12 h-12 text-surface-400" />
      </div>
      <h2 className="text-2xl font-display font-bold text-surface-900 mb-3">
        Tu perfil de Kultour
      </h2>
      <p className="text-surface-500 mb-8 max-w-sm mx-auto">
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
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();

  const { data: eventsData } = useEvents({ limit: 50 });
  const myEvents = eventsData?.events.filter(
    (e) => e.organizer.id === user?.id
  ) || [];

  if (!isAuthenticated || !user) return <GuestProfile />;

  const roleInfo = ROLE_LABEL[user.role] || ROLE_LABEL.USER;
  const joinDate = new Date(user.createdAt).toLocaleDateString("es-BO", {
    month: "long", year: "numeric"
  });

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-surface-800 to-surface-900 pt-10 pb-20">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 shadow-card-hover">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-1">{user.name}</h1>
            <p className="text-surface-400 text-sm mb-3">{user.email}</p>
            <span className={`badge ${roleInfo.color} inline-flex`}>
              {roleInfo.emoji} {roleInfo.label}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="section-container -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Info card */}
          <div className="lg:col-span-1 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-card p-6"
            >
              <h3 className="font-display font-bold text-surface-900 mb-5">Información</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-brand-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Email</p>
                    <p className="text-sm font-medium text-surface-900 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-green-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-brand-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Miembro desde</p>
                    <p className="text-sm font-medium text-surface-900 capitalize">{joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Rol</p>
                    <p className="text-sm font-medium text-surface-900">{roleInfo.emoji} {roleInfo.label}</p>
                  </div>
                </div>
                {user.bio && (
                  <div className="pt-3 border-t border-surface-100">
                    <p className="text-xs text-surface-500 mb-1">Bio</p>
                    <p className="text-sm text-surface-700 leading-relaxed">{user.bio}</p>
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
              <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                <div className="text-2xl font-display font-bold text-brand-blue-600">{myEvents.length}</div>
                <div className="text-xs text-surface-500 font-medium mt-0.5">Eventos creados</div>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-4 text-center">
                <div className="text-2xl font-display font-bold text-brand-orange-500">0</div>
                <div className="text-xs text-surface-500 font-medium mt-0.5">Guardados</div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl shadow-card p-4 space-y-1"
            >
              {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
                <Link to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-surface-50 transition-colors text-sm font-medium text-surface-700">
                  <Settings className="w-4 h-4 text-surface-400" />
                  Panel de organizador
                </Link>
              )}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors text-sm font-medium text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </motion.div>
          </div>

          {/* Right: My events */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-display font-bold text-surface-900 text-xl mb-5">
                {user.role === "USER" ? "Actividad reciente" : "Mis eventos"}
              </h3>
              {myEvents.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-card p-12 text-center">
                  <div className="text-5xl mb-4">🗓️</div>
                  <h4 className="font-display font-bold text-surface-900 mb-2">
                    {user.role === "USER" ? "Sin actividad aún" : "Sin eventos creados"}
                  </h4>
                  <p className="text-surface-500 text-sm mb-6">
                    {user.role === "USER"
                      ? "Explora eventos y empieza a descubrir La Paz."
                      : "Crea tu primer evento y llega a miles de personas."}
                  </p>
                  <Link
                    to={user.role === "USER" ? "/explore" : "/dashboard"}
                    className="btn-primary inline-flex"
                  >
                    {user.role === "USER" ? "Explorar eventos" : "Crear evento"}
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
          </div>
        </div>
      </div>
    </div>
  );
}
