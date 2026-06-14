"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import Image from "next/image";
import axiosInstance from "@/app/shared/config/axios";
import type { IReview } from "@/app/types/models";
import { useAppSelector } from "@/app/shared/redux/hooks";

interface Props {
  cardId: number;
}

function StarRow({
  value,
  interactive,
  hover,
  onHover,
  onClick,
  size = 22,
}: {
  value: number;
  interactive?: boolean;
  hover?: number;
  onHover?: (v: number) => void;
  onClick?: (v: number) => void;
  size?: number;
}) {
  const display = hover || value;
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= display ? "#F59E0B" : "none"}
          color={n <= display ? "#F59E0B" : "rgba(255,255,255,0.2)"}
          style={{ cursor: interactive ? "pointer" : "default", transition: "all 0.1s" }}
          onMouseEnter={() => interactive && onHover?.(n)}
          onMouseLeave={() => interactive && onHover?.(0)}
          onClick={() => interactive && onClick?.(n)}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, fallbackName }: { review: IReview; fallbackName?: string }) {
  const date = new Date(review.created_at).toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });
  const displayName = review.user_name || fallbackName || "Аноним";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "16px",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {review.user_avatar ? (
          <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0, position: "relative" }}>
            <Image src={review.user_avatar} alt={displayName} fill className="object-cover" sizes="40px" />
          </div>
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,117,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontFamily: "var(--font-stetica-bold)", color: "#5AADFF" }}>{avatarLetter}</span>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-stetica-bold)", fontSize: 14, color: "#fff" }}>
              {displayName}
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{date}</span>
          </div>
          <div style={{ marginTop: 4 }}>
            <StarRow value={review.rating} size={14} />
          </div>
        </div>
      </div>

      {review.comment && (
        <p style={{ margin: "12px 0 0", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
          {review.comment}
        </p>
      )}

      {review.developer_response && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(0,117,255,0.08)", border: "1px solid rgba(0,117,255,0.2)" }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-stetica-bold)", color: "#5AADFF", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Ответ застройщика
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
            {review.developer_response.response_text}
          </p>
        </div>
      )}
    </div>
  );
}

export function ReviewsSection({ cardId }: Props) {
  const auth = useAppSelector((s) => s.auth);
  const { isAuth } = auth;

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<"rating" | "review" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get(`/cards/${cardId}/user-reviews/`)
      .then((res) => {
        const data = res.data;
        setReviews(Array.isArray(data) ? data : data.results ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cardId]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const hasText = comment.trim().length > 0;

  const handleSubmit = async () => {
    if (!userRating) { setFormError("Поставьте оценку"); return; }
    setFormError(null);
    setSubmitting(true);
    try {
      if (hasText) {
        // Отзыв с текстом — идёт на проверку
        await axiosInstance.post(`/cards/${cardId}/user-reviews/`, {
          rating: userRating,
          comment: comment.trim(),
        });
        setSubmitResult("review");
      } else {
        // Только оценка — публикуется сразу
        await axiosInstance.post(`/cards/${cardId}/rate/`, { rating: userRating });
        setSubmitResult("rating");
      }
      setComment("");
      setUserRating(0);
    } catch {
      setFormError("Не удалось отправить. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "16px 16px 0" }}>

      {/* Summary */}
      {reviews.length > 0 && avgRating && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", borderRadius: 16, background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)", marginBottom: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontFamily: "var(--font-stetica-bold)", color: "#F59E0B", lineHeight: 1 }}>{avgRating}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{reviews.length} отзыв{reviews.length === 1 ? "" : reviews.length < 5 ? "а" : "ов"}</div>
          </div>
          <div style={{ flex: 1 }}>
            <StarRow value={Math.round(Number(avgRating))} size={20} />
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>Средняя оценка</div>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #0075FF", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "28px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
          <MessageSquare size={32} color="rgba(255,255,255,0.2)" style={{ marginBottom: 10 }} />
          <p style={{ margin: 0, fontFamily: "var(--font-stetica-bold)", color: "rgba(255,255,255,0.55)", fontSize: 14 }}>Отзывов пока нет</p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Будьте первым!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {reviews.map((r) => <ReviewCard key={r.id} review={r} fallbackName={auth.user?.name} />)}
        </div>
      )}

      {/* Form */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-stetica-bold)", fontSize: 15, color: "#fff", marginBottom: 14 }}>
          Оставить отзыв
        </div>

        {!isAuth ? (
          <div style={{ padding: "14px 16px", borderRadius: 14, background: "rgba(0,117,255,0.08)", border: "1px solid rgba(0,117,255,0.2)", fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
            <a href="/login" style={{ color: "#5AADFF", textDecoration: "none", fontFamily: "var(--font-stetica-bold)" }}>Войдите</a>, чтобы оставить оценку или отзыв
          </div>
        ) : submitResult ? (
          <div style={{ padding: "16px", borderRadius: 14, background: submitResult === "review" ? "rgba(30,237,97,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${submitResult === "review" ? "rgba(30,237,97,0.25)" : "rgba(245,158,11,0.3)"}`, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{submitResult === "review" ? "✓" : "⭐"}</div>
            {submitResult === "review" ? (
              <>
                <div style={{ fontFamily: "var(--font-stetica-bold)", color: "#1EED61", fontSize: 14 }}>Отзыв отправлен на проверку</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>После одобрения он появится здесь</div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "var(--font-stetica-bold)", color: "#F59E0B", fontSize: 14 }}>Оценка принята!</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Спасибо за вашу оценку</div>
              </>
            )}
            <button
              onClick={() => setSubmitResult(null)}
              style={{ marginTop: 12, background: "none", border: "none", color: "#5AADFF", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-stetica-bold)" }}
            >
              {submitResult === "review" ? "Оставить ещё один" : "Изменить оценку"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Stars */}
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Ваша оценка</div>
              <StarRow
                value={userRating}
                hover={hoverRating}
                interactive
                onHover={setHoverRating}
                onClick={setUserRating}
                size={32}
              />
              {userRating > 0 && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                  {["", "Очень плохо", "Плохо", "Нормально", "Хорошо", "Отлично"][userRating]}
                </div>
              )}
            </div>

            {/* Optional textarea */}
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
                Отзыв <span style={{ color: "rgba(255,255,255,0.25)" }}>(необязательно)</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Расскажите об объекте..."
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 14, padding: "13px 14px",
                  color: "#fff", fontSize: 14,
                  fontFamily: "var(--font-stetica-regular)",
                  resize: "none", outline: "none",
                }}
              />
              {hasText && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
                  Отзыв с текстом отправится на проверку администратору
                </div>
              )}
            </div>

            {formError && (
              <div style={{ fontSize: 12, color: "#FF6B6B" }}>{formError}</div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !userRating}
              style={{
                padding: "13px 0", borderRadius: 14, border: "none",
                background: userRating
                  ? "linear-gradient(135deg, #0075FF 0%, #0056CC 100%)"
                  : "rgba(255,255,255,0.07)",
                color: userRating ? "#fff" : "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-stetica-bold)", fontSize: 15,
                cursor: submitting || !userRating ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
                transition: "all 0.2s",
              }}
            >
              {submitting ? "Отправка..." : hasText ? "Отправить отзыв" : "Оценить"}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
