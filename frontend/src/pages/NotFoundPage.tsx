import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center section-container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="text-8xl mb-6">🏔️</div>
        <h1 className="text-6xl font-display font-bold text-surface-900 mb-3">404</h1>
        <h2 className="text-2xl font-display font-bold text-surface-700 mb-4">
          Ruta no encontrada
        </h2>
        <p className="text-surface-500 mb-10 max-w-sm mx-auto">
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
      </motion.div>
    </div>
  );
}
