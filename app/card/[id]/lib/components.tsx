import { useState, useRef, useEffect } from "react";
import { IQuestion } from "@/app/types/models";
import { useAppSelector } from "@/app/shared/redux/hooks";
import axiosInstance from "@/app/shared/config/axios";

export function RatingAndQuestionsBlock({
  rating,
  count,
  questions,
  cardId,
  onNavigateToReviews,
  onNavigateToQuestions,
  onRated,
}: {
  rating: string | number;
  count: number;
  questions?: IQuestion[];
  cardId?: number;
  onNavigateToReviews?: () => void;
  onNavigateToQuestions?: () => void;
  onRated?: () => void;
}) {
  const { isAuth } = useAppSelector((state) => state.auth);
  const [showRatingPopover, setShowRatingPopover] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowRatingPopover(false);
      }
    };
    if (showRatingPopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRatingPopover]);

  const handleRatingClick = () => {
    if (!isAuth) {
      alert("Войдите в систему, чтобы оценить объект");
      return;
    }
    setShowRatingPopover((prev) => !prev);
  };

  const handleSubmitRating = async (value: number) => {
    if (!cardId || isSubmittingRating) return;
    setIsSubmittingRating(true);
    try {
      await axiosInstance.post(`/cards/${cardId}/rate/`, { rating: value });
      setShowRatingPopover(false);
      setRatingSubmitted(true);
      setTimeout(() => {
        setRatingSubmitted(false);
        if (onNavigateToReviews) onNavigateToReviews();
      }, 3000);
      if (onRated) onRated();
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Не удалось отправить оценку");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getQuestionsText = (num: number) => {
    if (num === 1) return "вопрос";
    if (num >= 2 && num <= 4) return "вопроса";
    return "вопросов";
  };

  return (
    <div className="flex flex-col mb-7">
      <div className="flex items-center gap-x-5 pb-5 pt-2">
        <div className="relative" ref={popoverRef}>
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleRatingClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleRatingClick();
              }
            }}
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              viewBox="0 0 23 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.4127 0L14.1068 8.2918H22.8253L15.7719 13.4164L18.4661 21.7082L11.4127 16.5836L4.35924 21.7082L7.0534 13.4164L-1.90735e-05 8.2918H8.71849L11.4127 0Z"
                fill="var(--rating)"
              />
            </svg>
            <div className="flex flex-row gap-x-2 sm:gap-x-3">
              <p
                className="text-base sm:text-lg lg:text-xl font-[family-name:var(--font-stetica-bold)] leading-none"
                style={{ color: "var(--rating)" }}
              >
                {ratingSubmitted ? "Оценено!" : rating}
              </p>
              {!ratingSubmitted && (
                <p
                  className="text-base sm:text-lg lg:text-xl font-[family-name:var(--font-stetica-bold)] leading-none opacity-70"
                  style={{
                    color: "var(--text-secondary)",
                    transition: "color 0.3s ease",
                  }}
                >
                  {count}{" "}
                  {count === 1
                    ? "оценка"
                    : count >= 2 && count <= 4
                      ? "оценки"
                      : "оценок"}
                </p>
              )}
            </div>
          </div>

          {/* Rating popover */}
          {showRatingPopover && (
            <div
              className="absolute top-full left-0 mt-2 z-50 p-3 rounded-xl animate-scale-in"
              style={{
                backgroundColor: "var(--modal-bg)",
                border: "1px solid var(--border-glass)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <p
                className="text-xs mb-2 font-[family-name:var(--font-stetica-medium)]"
                style={{ color: "var(--text-secondary)" }}
              >
                Оцените объект
              </p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleSubmitRating(star)}
                    onMouseEnter={() => setRatingHover(star)}
                    onMouseLeave={() => setRatingHover(0)}
                    disabled={isSubmittingRating}
                    className="cursor-pointer transition-transform hover:scale-110 press-scale disabled:opacity-50"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 23 22"
                      fill={star <= ratingHover ? "var(--rating)" : "none"}
                      stroke={star <= ratingHover ? "none" : "var(--text-disabled)"}
                      strokeWidth={star <= ratingHover ? 0 : 1}
                    >
                      <path d="M11.4127 0L14.1068 8.2918H22.8253L15.7719 13.4164L18.4661 21.7082L11.4127 16.5836L4.35924 21.7082L7.0534 13.4164L-1.90735e-05 8.2918H8.71849L11.4127 0Z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="flex items-center gap-[6px] cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onNavigateToQuestions}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNavigateToQuestions?.();
            }
          }}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            viewBox="0 0 26 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 2.4375C10.9109 2.4375 8.86879 3.05698 7.13179 4.2176C5.3948 5.37822 4.04098 7.02786 3.24153 8.95791C2.44208 10.8879 2.2329 13.0117 2.64046 15.0606C3.04802 17.1096 4.054 18.9916 5.53119 20.4688C7.00838 21.946 8.89044 22.952 10.9394 23.3595C12.9883 23.7671 15.1121 23.5579 17.0421 22.7585C18.9721 21.959 20.6218 20.6052 21.7824 18.8682C22.943 17.1312 23.5625 15.0891 23.5625 13C23.5595 10.1996 22.4458 7.51466 20.4656 5.53445C18.4853 3.55424 15.8004 2.44046 13 2.4375ZM13 19.5C12.759 19.5 12.5233 19.4285 12.3229 19.2946C12.1225 19.1607 11.9663 18.9703 11.874 18.7476C11.7818 18.5249 11.7576 18.2799 11.8047 18.0435C11.8517 17.8071 11.9678 17.5899 12.1382 17.4195C12.3087 17.249 12.5258 17.1329 12.7622 17.0859C12.9987 17.0389 13.2437 17.063 13.4664 17.1553C13.6891 17.2475 13.8794 17.4037 14.0134 17.6041C14.1473 17.8046 14.2188 18.0402 14.2188 18.2812C14.2188 18.6045 14.0903 18.9145 13.8618 19.143C13.6332 19.3716 13.3232 19.5 13 19.5ZM13.8125 14.5519V14.625C13.8125 14.8405 13.7269 15.0472 13.5745 15.1995C13.4222 15.3519 13.2155 15.4375 13 15.4375C12.7845 15.4375 12.5779 15.3519 12.4255 15.1995C12.2731 15.0472 12.1875 14.8405 12.1875 14.625V13.8125C12.1875 13.597 12.2731 13.3903 12.4255 13.238C12.5779 13.0856 12.7845 13 13 13C14.3437 13 15.4375 12.0859 15.4375 10.9687C15.4375 9.85156 14.3437 8.9375 13 8.9375C11.6563 8.9375 10.5625 9.85156 10.5625 10.9687V11.375C10.5625 11.5905 10.4769 11.7971 10.3245 11.9495C10.1722 12.1019 9.96549 12.1875 9.75 12.1875C9.53452 12.1875 9.32785 12.1019 9.17548 11.9495C9.02311 11.7971 8.9375 11.5905 8.9375 11.375V10.9687C8.9375 8.95273 10.7595 7.3125 13 7.3125C15.2405 7.3125 17.0625 8.95273 17.0625 10.9687C17.0625 12.7339 15.665 14.2116 13.8125 14.5519Z"
              fill="var(--accent-primary)"
            />
          </svg>
          <span
            className="text-base sm:text-lg lg:text-xl font-[family-name:var(--font-stetica-bold)]"
            style={{
              color: "var(--accent-primary)",
              transition: "color 0.3s ease",
            }}
          >
            {questions?.length} {getQuestionsText(questions?.length || 0)}
          </span>
        </div>
      </div>
      <hr
        className="border-0 h-px"
        style={{
          backgroundColor: "var(--divider)",
        }}
      />
    </div>
  );
}

export function CharacteristicCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="glass-card p-4 rounded-xl"
    >
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <p
        className="text-xl font-medium"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}

export function LocationIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 2.0625C9.19852 2.0625 7.47082 2.77814 6.19698 4.05198C4.92314 5.32582 4.2075 7.05352 4.2075 8.855V9.35C4.4825 13.0717 7.57167 16.0646 11 19.9375C14.5796 15.895 17.7925 12.8333 17.7925 8.855C17.7925 7.05352 17.0769 5.32582 15.803 4.05198C14.5292 2.77814 12.8015 2.0625 11 2.0625ZM11 5.59167C11.6465 5.59167 12.2785 5.78344 12.816 6.14273C13.3535 6.50202 13.7724 7.01267 14.0196 7.61007C14.2668 8.20747 14.3313 8.86477 14.2048 9.49881C14.0783 10.1328 13.7666 10.7151 13.3091 11.172C12.8517 11.6288 12.2689 11.9397 11.6347 12.0653C11.0005 12.1908 10.3433 12.1255 9.74625 11.8774C9.14919 11.6294 8.63913 11.2098 8.2806 10.6718C7.92207 10.1338 7.73118 9.50153 7.73209 8.855C7.7333 7.98909 8.07814 7.15906 8.69086 6.5472C9.30358 5.93533 10.1341 5.59167 11 5.59167Z"
        stroke="var(--location)"
        strokeOpacity="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="glass-button flex items-center justify-center mb-6 transition-all cursor-pointer hover:opacity-80"
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "var(--radius-md)",
        color: "var(--text-primary)",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.5 15L7.5 10L12.5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      <p>{value}</p>
    </div>
  );
}

export function DetailsSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div
      className="glass-card mt-6 rounded-2xl p-5"
    >
      <h4
        className="text-xl font-[family-name:var(--font-stetica-bold)] mb-3"
        style={{
          color: "var(--text-primary)",
          transition: "color 0.3s ease",
        }}
      >
        {title}
      </h4>
      <div
        className="grid grid-cols-2 gap-3 text-sm"
        style={{
          color: "var(--text-primary)",
          transition: "color 0.3s ease",
        }}
      >
        {items.map((item, idx) => (
          <DetailItem key={idx} label={item.label} value={item.value} />
        ))}
      </div>
    </div>
  );
}
