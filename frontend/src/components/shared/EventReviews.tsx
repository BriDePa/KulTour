import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useEventReviews } from "@/hooks/useEventReviews";
import { cn } from "@/lib/utils";

interface EventReviewsProps {
  eventId: string;
}

export function EventReviews({ eventId }: EventReviewsProps) {
  const { data: reviewsData, isLoading } = useEventReviews(eventId);
  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.pagination;

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
      : 0,
  }));

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="skeleton h-6 w-32 rounded-lg" />
        <div className="skeleton h-20 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-800 rounded-3xl p-6 shadow-card dark:shadow-card-dark">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-brand-orange-500" />
        <h2 className="text-lg font-display font-bold text-surface-900 dark:text-surface-50">
          Reseñas del evento
        </h2>
        <span className="text-surface-500 dark:text-surface-400">
          ({reviews.length})
        </span>
      </div>

      {reviews.length > 0 && (
        <div className="flex items-start gap-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-surface-900 dark:text-surface-50">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-0.5 justify-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-4 h-4",
                    star <= Math.round(averageRating)
                      ? "text-brand-orange-500 fill-brand-orange-500"
                      : "text-surface-300 dark:text-surface-600"
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
              {stats?.total || 0} reseñas
            </p>
          </div>

          <div className="flex-1 space-y-2">
            {ratingCounts.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-xs text-surface-600 dark:text-surface-400 w-3">
                  {rating}
                </span>
                <Star className="w-3 h-3 text-brand-orange-500 fill-brand-orange-500" />
                <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full bg-brand-orange-500 rounded-full"
                  />
                </div>
                <span className="text-xs text-surface-500 dark:text-surface-400 w-6">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-center text-surface-400 dark:text-surface-500 py-8">
          Este evento aún no tiene reseñas.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.slice(0, 5).map((review) => (
            <div
              key={review.id}
              className="p-4 bg-surface-50 dark:bg-surface-700/50 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue-400 to-brand-green-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-surface-900 dark:text-surface-100">
                      {review.user.name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-3 h-3",
                            star <= review.rating
                              ? "text-brand-orange-500 fill-brand-orange-500"
                              : "text-surface-300 dark:text-surface-600"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString("es-BO")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}