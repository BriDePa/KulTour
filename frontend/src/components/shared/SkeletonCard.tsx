import { motion } from "framer-motion";

interface SkeletonCardProps {
  variant?: "event" | "place" | "detail";
  className?: string;
}

const shimmer = {
  initial: { backgroundPosition: "-200% 0" },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

export function SkeletonCard({ variant = "event", className = "" }: SkeletonCardProps) {
  if (variant === "event") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card-base overflow-hidden h-full flex flex-col ${className}`}
      >
        <div className="relative overflow-hidden aspect-[16/9]">
          <div
            className="absolute inset-0 skeleton"
            style={{
              background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        <div className="p-5 flex flex-col flex-1 space-y-3">
          <div className="h-4 w-16 rounded-lg skeleton" />
          <div className="h-6 w-3/4 rounded-lg skeleton" />
          <div className="h-4 w-full rounded-lg skeleton" />
          <div className="h-4 w-2/3 rounded-lg skeleton" />
          <div className="mt-auto pt-4 border-t border-surface-100 dark:border-surface-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full skeleton" />
              <div className="h-3 w-20 rounded-lg skeleton" />
            </div>
            <div className="h-3 w-16 rounded-lg skeleton" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "place") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card-base overflow-hidden h-full flex flex-col ${className}`}
      >
        <div className="relative overflow-hidden aspect-[4/3]">
          <div
            className="absolute inset-0 skeleton"
            style={{
              background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
        <div className="p-5 flex flex-col flex-1 space-y-3">
          <div className="h-6 w-3/4 rounded-lg skeleton" />
          <div className="h-4 w-full rounded-lg skeleton" />
          <div className="h-4 w-2/3 rounded-lg skeleton" />
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="h-5 w-12 rounded-lg skeleton" />
            <div className="h-5 w-16 rounded-lg skeleton" />
            <div className="h-5 w-14 rounded-lg skeleton" />
          </div>
          <div className="mt-auto pt-4 border-t border-surface-100 dark:border-surface-700 flex items-center justify-between">
            <div className="flex gap-3">
              <div className="w-4 h-4 rounded skeleton" />
              <div className="w-4 h-4 rounded skeleton" />
              <div className="w-4 h-4 rounded skeleton" />
            </div>
            <div className="h-3 w-16 rounded-lg skeleton" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`animate-pulse ${className}`}
    >
      <div className="h-80 skeleton rounded-3xl mb-6" />
      <div className="space-y-4">
        <div className="skeleton h-8 rounded-2xl w-3/4" />
        <div className="skeleton h-4 rounded-xl w-full" />
        <div className="skeleton h-4 rounded-xl w-5/6" />
        <div className="skeleton h-4 rounded-xl w-4/6" />
      </div>
    </motion.div>
  );
}

export function SkeletonGrid({ count = 6, variant = "event" }: { count?: number; variant?: "event" | "place" }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}