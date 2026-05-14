import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Compass, ArrowLeft, Mountain } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-24 h-24 rounded-3xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-6"
      >
        <Mountain className="w-12 h-12 text-surface-400 dark:text-surface-500" />
      </motion.div>
      <h1 className="text-6xl font-display font-bold text-surface-900 dark:text-surface-50 mb-3">404</h1>
      <h2 className="text-2xl font-display font-bold text-surface-700 dark:text-surface-300 mb-4">
        Ruta no encontrada
      </h2>
      <p className="text-surface-500 dark:text-surface-400 mb-10 max-w-sm mx-auto">
        Parece que te perdiste en las alturas. Esta página no existe.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <button onClick={() => navigate("/")} className="btn-primary">
          <Compass className="w-4 h-4" />
          Ir al inicio
        </button>
      </div>
    </div>
  );
}