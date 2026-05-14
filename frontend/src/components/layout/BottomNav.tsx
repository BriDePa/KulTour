import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Map, Sparkles, User, Home, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useNotifications";

const navItems = [
  { to: "/",            icon: Home,     label: "Inicio",   exact: true  },
  { to: "/explore",     icon: Compass,  label: "Explorar", exact: false },
  { to: "/map",         icon: Map,      label: "Mapa",     exact: false },
  { to: "/suggestions", icon: Sparkles, label: "Planes",   exact: false },
  { to: "/profile",     icon: User,     label: "Perfil",   exact: false },
];

export default function BottomNav() {
  const location = useLocation();
  const unreadCount = useUnreadCount();

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex w-full px-1">
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to) && to !== "/";

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "bottom-nav-item relative",
                isActive && "active"
              )}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-bg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", damping: 22, stiffness: 300 }}
                    className="absolute inset-x-1 top-0.5 h-8 bg-brand-blue-50 rounded-2xl -z-10"
                  />
                )}
              </AnimatePresence>

              <div className="relative">
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-all duration-200",
                    isActive ? "text-brand-blue-500" : "text-surface-400"
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {to === "/profile" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] leading-none font-semibold transition-colors duration-200",
                isActive ? "text-brand-blue-500" : "text-surface-400"
              )}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}