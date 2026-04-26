import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {/* Offline */}
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed top-0 left-0 right-0 z-[70] flex justify-center"
          style={{ paddingTop: "var(--safe-top)" }}
        >
          <div className="bg-surface-800 text-white px-5 py-2.5 rounded-b-2xl flex items-center gap-2 text-sm font-medium shadow-lg">
            <WifiOff className="w-4 h-4 text-brand-orange-400" />
            Sin conexión — mostrando datos guardados
          </div>
        </motion.div>
      )}

      {/* Reconnected */}
      {showReconnected && (
        <motion.div
          key="reconnected"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed top-0 left-0 right-0 z-[70] flex justify-center"
          style={{ paddingTop: "var(--safe-top)" }}
        >
          <div className="bg-brand-green-500 text-white px-5 py-2.5 rounded-b-2xl flex items-center gap-2 text-sm font-medium shadow-lg">
            <Wifi className="w-4 h-4" />
            Conexión restaurada
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
