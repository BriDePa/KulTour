import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  className?: string;
}

export default function EmptyState({ 
  icon: Icon, 
  iconColor = "text-surface-400", 
  iconBg = "bg-surface-100 dark:bg-surface-800",
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}
    >
      {Icon && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-5", iconBg)}
        >
          <Icon className={cn("w-8 h-8", iconColor)} />
        </motion.div>
      )}
      <h3 className="text-lg font-display font-bold text-surface-900 dark:text-surface-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-6 max-w-xs">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 active:scale-95",
            action.variant === "secondary"
              ? "bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
              : "bg-brand-blue-500 text-white hover:bg-brand-blue-600 shadow-soft hover:shadow-glow"
          )}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}