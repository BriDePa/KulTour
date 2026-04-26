import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Ya está instalada como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Android/Chrome: capturar evento de instalación
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar banner después de 3 segundos
      const dismissed = localStorage.getItem("kultour_pwa_dismissed");
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS: detectar Safari sin estar instalada
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = ("standalone" in window.navigator) &&
      (window.navigator as any).standalone;

    if (isIOS && !isInStandaloneMode) {
      const dismissed = localStorage.getItem("kultour_pwa_dismissed");
      if (!dismissed) {
        setTimeout(() => setShowIOSGuide(true), 3000);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("kultour_pwa_dismissed", "true");
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Android/Chrome Banner */}
      <AnimatePresence>
        {showBanner && deferredPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60] md:bottom-6 md:left-6 md:right-auto md:max-w-sm"
            style={{ paddingBottom: "var(--safe-bottom)" }}
          >
            <div className="bg-surface-900 text-white rounded-t-3xl md:rounded-3xl p-5 shadow-card-hover">
              <div className="flex items-start gap-4">
                {/* App icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue-500 to-brand-green-500 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base">Instalar Kultour</p>
                  <p className="text-surface-400 text-sm mt-0.5 leading-snug">
                    Agrega la app a tu pantalla de inicio para acceso rápido y uso offline
                  </p>
                </div>

                <button
                  onClick={handleDismiss}
                  className="text-surface-500 hover:text-white transition-colors p-1 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 rounded-xl border border-surface-700 text-surface-400 text-sm font-medium hover:border-surface-600 transition-colors"
                >
                  Ahora no
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2.5 rounded-xl bg-brand-blue-500 hover:bg-brand-blue-600 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Instalar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Guide Banner */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60]"
            style={{ paddingBottom: "var(--safe-bottom)" }}
          >
            <div className="bg-surface-900 text-white rounded-t-3xl p-5 shadow-card-hover">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-base">Instalar en iPhone</p>
                <button onClick={handleDismiss} className="text-surface-500 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { step: "1", text: 'Toca el botón de compartir', icon: "⬆️" },
                  { step: "2", text: '"Agregar a pantalla de inicio"', icon: "➕" },
                  { step: "3", text: 'Toca "Agregar" para confirmar', icon: "✅" },
                ].map(({ step, text, icon }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-blue-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step}
                    </div>
                    <span className="text-sm text-surface-300">{icon} {text}</span>
                  </div>
                ))}
              </div>
              {/* Flecha apuntando a la barra de Safari */}
              <div className="text-center mt-4 text-surface-400 text-xs">
                ↓ Busca el ícono de compartir en la barra de Safari
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
