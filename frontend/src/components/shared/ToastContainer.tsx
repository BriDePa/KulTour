import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore, type Toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const CONFIG = {
  success: {
    icon: CheckCircle2,
    bg: "bg-brand-green-500",
    border: "border-brand-green-400",
    iconClass: "text-white",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-500",
    border: "border-red-400",
    iconClass: "text-white",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-brand-orange-500",
    border: "border-brand-orange-400",
    iconClass: "text-white",
  },
  info: {
    icon: Info,
    bg: "bg-brand-blue-500",
    border: "border-brand-blue-400",
    iconClass: "text-white",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { remove } = useToastStore();
  const cfg = CONFIG[toast.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={cn(
        "flex items-start gap-3 w-full max-w-sm rounded-2xl px-4 py-3.5",
        "shadow-card-hover border text-white",
        cfg.bg, cfg.border
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", cfg.iconClass)} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-white/80 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="text-white/60 hover:text-white transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div
      className="fixed top-4 right-4 z-[80] flex flex-col gap-2 w-[calc(100vw-2rem)] sm:w-auto sm:max-w-sm pointer-events-none"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
