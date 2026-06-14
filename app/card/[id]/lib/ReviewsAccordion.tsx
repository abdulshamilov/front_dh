import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { IReview } from "@/app/types/models";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { likeReview } from "@/app/shared/redux/slices/cards";
import axiosInstance from "@/app/shared/config/axios";

interface ReviewsAccordionProps {
  reviews?: IReview[];
  cardId?: number;
  onReviewAdded?: () => void;
}

export function ReviewsAccordion({
  reviews = [],
  cardId,
  onReviewAdded,
}: ReviewsAccordionProps) {
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector((state) => state.auth);
  const [sortBy] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [likingReviewId, setLikingReviewId] = useState<number | null>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<Record<number, number>>({});

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Синхронизируем локальное состояние с пропсами
  useEffect(() => {
    setOptimisticLikes({});
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuth) {
      alert("Войдите в систему, чтобы оставить отзыв");
      return;
    }

    if (reviewRating === 0) {
      setReviewError("Выберите рейтинг");
      return;
    }

    if (!reviewText.trim()) {
      setReviewError("Введите текст отзыва");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      await axiosInstance.post(`/cards/${cardId}/reviews/add/`, {
        rating: reviewRating,
        text: reviewText.trim(),
      });

      setReviewRating(0);
      setReviewText("");
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (err: unknown) {
      console.error("Error submitting review:", err);
      setReviewError("Не удалось отправить отзыв. Попробуйте позже.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Создаем обновленные отзывы с оптимистичными лайками
  const updatedReviews = useMemo(() => {
    return reviews.map(review => {
      const optimisticCount = optimisticLikes[review.id];
      if (optimisticCount !== undefined) {
        return {
          ...review,
          helpful_count: optimisticCount,
          user_vote: 'helpful' as const,
        };
      }
      return review;
    });
  }, [reviews, optimisticLikes]);

  const sortedReviews = useMemo(() => {
    return [...updatedReviews].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [updatedReviews, sortBy]);

  const visibleReviews = useMemo(
    () => sortedReviews.slice(0, visibleCount),
    [sortedReviews, visibleCount]
  );
  const hasMore = visibleCount < sortedReviews.length;

  const isVoted = (review: IReview) => {
    return review.user_vote === 'helpful';
  };

  const handleLike = async (review: IReview) => {
    if (!isAuth) {
      alert("Войдите в систему, чтобы лайкнуть отзыв");
      return;
    }

    if (isVoted(review) || likingReviewId === review.id) {
      return;
    }

    // Оптимистичное обновление
    const currentCount = review.helpful_count || 0;
    setOptimisticLikes(prev => ({
      ...prev,
      [review.id]: currentCount + 1,
    }));
    setLikingReviewId(review.id);

    try {
      await dispatch(likeReview(review.id)).unwrap();
    } catch (error) {
      console.error("Ошибка при лайке отзыва:", error);
      // Откатываем оптимистичное обновление при ошибке
      setOptimisticLikes(prev => {
        const newState = { ...prev };
        delete newState[review.id];
        return newState;
      });
    } finally {
      setLikingReviewId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width="16"
            height="16"
            viewBox="0 0 23 22"
            fill={star <= rating ? "var(--rating)" : "none"}
            stroke={star <= rating ? "none" : "var(--border-color)"}
            strokeWidth={star <= rating ? 0 : 1}
          >
            <path d="M11.4127 0L14.1068 8.2918H22.8253L15.7719 13.4164L18.4661 21.7082L11.4127 16.5836L4.35924 21.7082L7.0534 13.4164L-1.90735e-05 8.2918H8.71849L11.4127 0Z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Создаем даты без времени для корректного сравнения дней
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Вычисляем разницу в днях
    const diffTime = nowOnly.getTime() - dateOnly.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Сегодня";
    if (diffDays === 1) return "Вчера";
    if (diffDays > 1 && diffDays < 7) return `${diffDays} дн. назад`;

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderReviewForm = () => {
    if (!isAuth) return null;

    return (
      <div
        className="mb-6 p-4 rounded-xl"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-glass)",
        }}
      >
        <h3
          className="text-lg sm:text-xl font-[family-name:var(--font-stetica-bold)] mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Оставить отзыв
        </h3>

        {reviewSuccess && (
          <div
            className="mb-3 p-3 rounded-xl text-sm font-[family-name:var(--font-stetica-medium)]"
            style={{
              backgroundColor: "var(--badge-green)",
              color: "var(--success)",
            }}
          >
            Отзыв успешно отправлен!
          </div>
        )}

        <form onSubmit={handleSubmitReview} className="space-y-3">
          {/* Star rating selector */}
          <div>
            <p
              className="text-sm mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Ваша оценка
            </p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  onMouseEnter={() => setReviewHover(star)}
                  onMouseLeave={() => setReviewHover(0)}
                  className="cursor-pointer transition-transform hover:scale-110 press-scale"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 23 22"
                    fill={
                      star <= (reviewHover || reviewRating)
                        ? "var(--rating)"
                        : "none"
                    }
                    stroke={
                      star <= (reviewHover || reviewRating)
                        ? "none"
                        : "var(--text-disabled)"
                    }
                    strokeWidth={
                      star <= (reviewHover || reviewRating) ? 0 : 1
                    }
                  >
                    <path d="M11.4127 0L14.1068 8.2918H22.8253L15.7719 13.4164L18.4661 21.7082L11.4127 16.5836L4.35924 21.7082L7.0534 13.4164L-1.90735e-05 8.2918H8.71849L11.4127 0Z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Review text */}
          <textarea
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value);
              setReviewError(null);
            }}
            placeholder="Расскажите о вашем опыте..."
            rows={4}
            className="w-full rounded-xl px-4 py-3 resize-none focus:outline-none font-[family-name:var(--font-stetica-regular)]"
            style={{
              backgroundColor: "var(--input-dark)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-primary)",
            }}
            disabled={isSubmittingReview}
          />

          {reviewError && (
            <p className="text-sm" style={{ color: "var(--error)" }}>
              {reviewError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmittingReview || reviewRating === 0 || !reviewText.trim()}
            className="w-full py-2.5 rounded-[16px] font-[family-name:var(--font-stetica-medium)] text-sm sm:text-base transition-opacity disabled:opacity-50 disabled:cursor-not-allowed press-scale"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "white",
            }}
          >
            {isSubmittingReview ? "Отправка..." : "Отправить отзыв"}
          </button>
        </form>
      </div>
    );
  };

  return (
    <>
      <div
        className="overflow-hidden rounded-lg"
      >
        <div className="sm:px-4 pb-4 sm:pb-6">
          {renderReviewForm()}

          {reviews.length === 0 ? (
            <p
              className="text-center py-4 text-sm sm:text-base"
              style={{ color: "var(--text-secondary)" }}
            >
              Отзывы пока отсутствуют
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {visibleReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: "var(--accent-primary)" }}
                      >
                        {review.user_avatar ? (
                          <Image
                            src={review.user_avatar}
                            alt={review.user_name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-white text-lg font-[family-name:var(--font-stetica-bold)]">
                            {review.user_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p
                            className="font-[family-name:var(--font-stetica-medium)] text-sm sm:text-base"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {review.user_name}
                          </p>
                          <span
                            className="text-xs sm:text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {review.images.slice(0, 3).map((img, idx) => (
                          <div
                            key={img.id}
                            className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => setSelectedImage(img.image)}
                          >
                            <Image
                              src={img.image}
                              alt={`Фото ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 80px, 96px"
                            />
                            {idx === 2 && review.images.length > 3 && (
                              <div
                                className="absolute inset-0 flex items-center justify-center text-white text-lg font-[family-name:var(--font-stetica-bold)]"
                                style={{
                                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                                }}
                              >
                                +{review.images.length - 3}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p
                      className="text-sm sm:text-base leading-relaxed mb-3"
                      style={{
                        color: "var(--text-secondary)",
                        wordBreak: "break-word",
                      }}
                    >
                      {review.comment}
                    </p>

                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs sm:text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Ответ полезен?
                      </span>
                      <button
                        onClick={() => handleLike(review)}
                        disabled={isVoted(review) || likingReviewId === review.id}
                        className="flex items-center gap-1 px-2 py-1 rounded transition-opacity"
                        style={{
                          opacity: (isVoted(review) || likingReviewId === review.id) ? 0.5 : 1,
                          cursor: (isVoted(review) || likingReviewId === review.id) ? "not-allowed" : "pointer",
                        }}
                      >
                        <span>👍</span>
                        <span
                          className="text-xs sm:text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {review.helpful_count || 0}
                        </span>
                      </button>
                    </div>

                    {review.developer_response && (
                      <div
                        className="mt-3 p-3 rounded-lg"
                        style={{
                          backgroundColor: "var(--surface-elevated)",
                          border: "1px solid var(--border-glass)",
                        }}
                      >
                        <p
                          className="text-xs sm:text-sm font-[family-name:var(--font-stetica-medium)] mb-1"
                          style={{ color: "var(--accent-primary)" }}
                        >
                          Ответ застройщика{" "}
                          {review.developer_response.developer_name}
                        </p>
                        <p
                          className="text-xs sm:text-sm mb-1"
                          style={{
                            color: "var(--text-secondary)",
                            wordBreak: "break-word",
                          }}
                        >
                          {review.developer_response.response_text}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            color: "var(--text-secondary)",
                            opacity: 0.7,
                          }}
                        >
                          {formatDate(review.developer_response.created_at)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {hasMore && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="w-full py-2.5 mt-4 rounded-xl font-[family-name:var(--font-stetica-medium)] text-sm sm:text-base transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "white",
                  }}
                >
                  Показать ещё ({sortedReviews.length - visibleCount})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={selectedImage}
              alt="Просмотр изображения"
              width={1200}
              height={800}
              className="object-contain max-h-[90vh]"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl text-white text-2xl glass-button"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
