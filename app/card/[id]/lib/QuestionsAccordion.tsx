import Image from "next/image";
import { useState, useMemo } from "react";
import { IQuestion, IQuestionUser } from "@/app/types/models";
import config from "@/app/shared/config/axios";
import { useAppSelector } from "@/app/shared/redux/hooks";
import { AxiosErrorResponse } from "@/app/shared/types/errors";

interface QuestionsAccordionProps {
  questions?: IQuestion[];
  cardId: number;
  onQuestionAdded?: () => void;
}

export function QuestionsAccordion({
  questions = [],
  cardId,
  onQuestionAdded,
}: QuestionsAccordionProps) {
  const [sortBy] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(5);
  const [questionText, setQuestionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuth } = useAppSelector((state) => state.auth);

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [questions, sortBy]);

  const visibleQuestions = useMemo(
    () => sortedQuestions.slice(0, visibleCount),
    [sortedQuestions, visibleCount]
  );
  const hasMore = visibleCount < sortedQuestions.length;

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

  const getUserInfo = (user: number | IQuestionUser) => {
    if (typeof user === "object" && user !== null) {
      return {
        name: user.name || "Пользователь",
        avatar: user.profile_photo,
      };
    }
    return {
      name: "Пользователь",
      avatar: undefined,
    };
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuth) {
      alert("Войдите в систему, чтобы задать вопрос");
      return;
    }

    if (!questionText.trim()) {
      setError("Введите вопрос");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await config.post(`/cards/${cardId}/questions/add/`, {
        question: questionText.trim(),
      });

      setQuestionText("");
      if (onQuestionAdded) {
        onQuestionAdded();
      }
    } catch (err: unknown) {
      console.error("Ошибка при отправке вопроса:", err);
      const axiosError = err as AxiosErrorResponse;
      const errorMessage =
        (typeof axiosError?.response?.data === 'object' && axiosError?.response?.data !== null && 'detail' in axiosError.response.data)
          ? (axiosError.response.data as { detail?: string }).detail
          : null;
      setError(errorMessage || "Не удалось отправить вопрос");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg">
      <div className="sm:px-4 pb-4 sm:pb-6">
        {questions.length === 0 ? (
          <p
            className="text-center py-4 text-sm sm:text-base"
            style={{ color: "var(--text-secondary)" }}
          >
            Вопросы пока отсутствуют
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {visibleQuestions.map((questionItem) => {
                const userInfo = getUserInfo(questionItem.user);
                return (
                  <div
                    key={questionItem.id}
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: "var(--accent-primary)" }}
                      >
                        {userInfo.avatar ? (
                          <Image
                            src={userInfo.avatar}
                            alt={userInfo.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-white text-lg font-[family-name:var(--font-stetica-bold)]">
                            {userInfo.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className="font-[family-name:var(--font-stetica-medium)] text-sm sm:text-base"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {userInfo.name}
                          </p>
                          <span
                            className="text-xs sm:text-sm"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatDate(questionItem.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <p
                        className="text-sm sm:text-base font-[family-name:var(--font-stetica-regular)] mb-2 leading-relaxed"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {questionItem.question}
                      </p>
                      {questionItem.answer && (
                        <div
                          className="mt-2 p-3 rounded-lg"
                          style={{
                            backgroundColor: "var(--surface-elevated)",
                            border: "1px solid var(--border-glass)",
                          }}
                        >
                          <p
                            className="text-xs sm:text-sm font-[family-name:var(--font-stetica-medium)] mb-2"
                            style={{ color: "var(--accent-primary)" }}
                          >
                            Ответ застройщика
                          </p>
                          <p
                            className="text-xs sm:text-sm leading-relaxed"
                            style={{
                              color: "var(--text-secondary)",
                              wordBreak: "break-word",
                            }}
                          >
                            {questionItem.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                Показать ещё ({sortedQuestions.length - visibleCount})
              </button>
            )}
          </>
        )}

        <div className="mt-2 pt-6" style={{ borderTop: "1px solid var(--divider)" }}>
          <h3
            className="text-lg sm:text-xl font-[family-name:var(--font-stetica-bold)] mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Задайте вопрос о квартире
          </h3>
          <p
            className="text-sm sm:text-base mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            Вам ответит застройщик или лицо, купившее этот товар. Пришлем уведомление, когда поступит ответ
          </p>

          <form onSubmit={handleSubmitQuestion} className="space-y-3">
            <textarea
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                setError(null);
              }}
              placeholder="Введите ваш вопрос..."
              rows={4}
              className="w-full rounded-xl px-4 py-3 resize-none focus:outline-none font-[family-name:var(--font-stetica-regular)]"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-glass)",
                color: "var(--text-primary)",
              }}
              disabled={isSubmitting}
            />

            {error && (
              <p className="text-sm" style={{ color: "var(--error)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !questionText.trim()}
              className="w-full py-2.5 rounded-xl font-[family-name:var(--font-stetica-medium)] text-sm sm:text-base transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "white",
              }}
            >
              {isSubmitting ? "Отправка..." : "Отправить вопрос"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
