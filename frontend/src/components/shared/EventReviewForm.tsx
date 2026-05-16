import { useState } from "react";
import { Star, Send } from "lucide-react";
import { useCreateEventReview } from "@/hooks/useEventReviews";
import { useAuthStore } from "@/store/authStore";
import { useAuthModal } from "@/components/shared/AuthModal";
import { cn } from "@/lib/utils";

interface EventReviewFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export function EventReviewForm({ eventId, onSuccess }: EventReviewFormProps) {
  const { isAuthenticated } = useAuthStore();
  const { open } = useAuthModal();
  const createReview = useCreateEventReview();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      open("login");
      return;
    }
    if (rating === 0) return;

    createReview.mutate(
      { eventId, rating, comment: comment || undefined },
      {
        onSuccess: () => {
          setRating(0);
          setComment("");
          onSuccess?.();
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-2xl text-center">
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-2">
          Inicia sesión para dejar una reseña
        </p>
        <button onClick={() => open("login")} className="btn-primary text-sm">
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-2xl">
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                "w-6 h-6",
                (hoverRating || rating) >= star
                  ? "text-brand-orange-500 fill-brand-orange-500"
                  : "text-surface-300 dark:text-surface-600"
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-surface-500 dark:text-surface-400">
          {rating > 0 ? `${rating}/5` : "Sin calificación"}
        </span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Cuéntanos tu experiencia en este evento..."
        className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-surface-100 bg-white dark:bg-surface-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-blue-500 dark:focus:ring-brand-blue-400 focus:border-transparent transition-all"
        rows={3}
      />
      <button
        type="submit"
        disabled={rating === 0 || createReview.isPending}
        className="btn-primary mt-3 text-sm disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        {createReview.isPending ? "Publicando..." : "Publicar reseña"}
      </button>
    </form>
  );
}