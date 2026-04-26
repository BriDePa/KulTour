import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Map, Sparkles, LayoutDashboard,
  LogIn, LogOut, User, ChevronDown, Menu, X, Search,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/hooks/useAuth";
import { useAuthModal } from "@/components/shared/AuthModal";
import { cn } from "@/lib/utils";
import BottomNav from "./BottomNav";
import GlobalSearch from "@/components/shared/GlobalSearch";

const navItems = [
  { to: "/explore",     icon: Compass,  label: "Explorar" },
  { to: "/map",         icon: Map,      label: "Mapa"     },
  { to: "/suggestions", icon: Sparkles, label: "Planes"   },
];

export default function Layout() {
  const { isAuthenticated, user } = useAuthStore();
  const logout = useLogout();
  const { open } = useAuthModal();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 glass border-b border-white/60"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="section-container">
          <div className="flex items-center justify-between h-14 gap-3">

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 font-display font-bold text-lg flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-green-500 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-gradient-blue hidden sm:block">Kultour</span>
            </NavLink>

            {/* Desktop search bar (centro) */}
            <div className="hidden md:flex flex-1 max-w-sm">
              <GlobalSearch />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-shrink-0">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-brand-blue-50 text-brand-blue-600"
                        : "text-surface-600 hover:text-surface-900 hover:bg-surface-100"
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
              {isAuthenticated && (user?.role === "ORGANIZER" || user?.role === "ADMIN") && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-brand-blue-50 text-brand-blue-600"
                        : "text-surface-600 hover:text-surface-900 hover:bg-surface-100"
                    )
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel
                </NavLink>
              )}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-surface-700 max-w-[80px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-surface-100 overflow-hidden z-50"
                      >
                        <div className="p-3.5 border-b border-surface-100">
                          <p className="text-sm font-semibold text-surface-900 truncate">{user?.name}</p>
                          <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          <button
                            onClick={() => { navigate("/profile"); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface-700 hover:bg-surface-50 rounded-xl transition-colors"
                          >
                            <User className="w-4 h-4 text-surface-400" /> Mi perfil
                          </button>
                          <button
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Cerrar sesión
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button onClick={() => open("login")} className="btn-ghost text-sm px-3 py-2">
                    <LogIn className="w-4 h-4" /> Entrar
                  </button>
                  <button onClick={() => open("register")} className="btn-primary text-sm px-4 py-2">
                    Registrarse
                  </button>
                </>
              )}
            </div>

            {/* Mobile: search + menu */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="touch-target text-surface-600"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="touch-target text-surface-700"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : (
                  isAuthenticated ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  ) : <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search dropdown */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-surface-100 bg-white overflow-hidden"
            >
              <div className="section-container py-3">
                <GlobalSearch
                  autoFocus
                  onClose={() => setSearchOpen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-surface-100 bg-white/98 backdrop-blur-xl overflow-hidden"
            >
              <div className="section-container py-3 flex flex-col gap-1">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 mb-1 border-b border-surface-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-surface-900 truncate">{user?.name}</p>
                        <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { navigate("/profile"); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-surface-700 hover:bg-surface-50"
                    >
                      <User className="w-4 h-4 text-surface-400" /> Mi perfil
                    </button>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 py-2">
                    <button onClick={() => { open("login"); setMobileOpen(false); }}
                      className="btn-secondary flex-1 justify-center text-sm">
                      Entrar
                    </button>
                    <button onClick={() => { open("register"); setMobileOpen(false); }}
                      className="btn-primary flex-1 justify-center text-sm">
                      Registrarse
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main ───────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ─── Footer (solo desktop) ──────────────────────────── */}
      <footer className="bg-surface-900 text-white mt-24 hidden md:block">
        <div className="section-container py-12">
          <div className="grid grid-cols-3 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-xl mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-blue-500 to-brand-green-500 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                Kultour
              </div>
              <p className="text-surface-400 text-sm leading-relaxed">
                Descubre lo mejor de La Paz. Eventos, lugares y experiencias únicas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-surface-200">Explorar</h4>
              <ul className="space-y-2 text-sm text-surface-400">
                <li><NavLink to="/explore" className="hover:text-white transition-colors">Eventos</NavLink></li>
                <li><NavLink to="/map" className="hover:text-white transition-colors">Mapa</NavLink></li>
                <li><NavLink to="/suggestions" className="hover:text-white transition-colors">Sugerencias</NavLink></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-surface-200">Cuenta</h4>
              <ul className="space-y-2 text-sm text-surface-400">
                <li><NavLink to="/profile" className="hover:text-white transition-colors">Mi perfil</NavLink></li>
                <li><NavLink to="/dashboard" className="hover:text-white transition-colors">Panel organizador</NavLink></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-surface-800 pt-6 flex items-center justify-between">
            <p className="text-surface-500 text-sm">© 2024 Kultour — La Paz, Bolivia 🏔️</p>
            <p className="text-surface-600 text-xs">La ciudad más alta del mundo</p>
          </div>
        </div>
      </footer>

      {/* ─── Bottom Nav móvil ────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}
