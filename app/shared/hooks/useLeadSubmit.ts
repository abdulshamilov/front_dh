"use client";

import { useCallback, useRef, useState } from "react";
import { useToast } from "@/app/components/shared/Toast";
import { useRequireAuth } from "@/app/shared/hooks/useRequireAuth";
import {
  submitLead,
  type LeadPayload,
  type NormalizedError,
} from "@/app/shared/api/leads";

interface UseLeadSubmitOptions {
  onSuccess?: () => void;
  /** Текст success-toast'а. По умолчанию: "Заявка отправлена! …". */
  successMessage?: string;
  /** Длительность success-toast'а в ms. */
  successDuration?: number;
  /** Не показывать success-toast — компонент покажет inline-checkmark сам. */
  silentSuccess?: boolean;
  /** Не показывать error-toast — компонент покажет inline-ошибку сам. */
  silentError?: boolean;
}

interface UseLeadSubmitReturn {
  submit: (payload: LeadPayload) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Хук для отправки заявок с встроенными toast-уведомлениями
 * и retry-логикой при сетевых ошибках.
 *
 * Возвращает submit, который кидает true при успехе и false при ошибке —
 * это позволяет компоненту скрыть форму или показать inline success.
 */
export function useLeadSubmit(
  options: UseLeadSubmitOptions = {}
): UseLeadSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPayloadRef = useRef<LeadPayload | null>(null);
  // Синхронный guard от двойной отправки — useState не успевает обновиться
  // до второго вызова при быстром клике или retry-toast.
  const isSubmittingRef = useRef(false);
  const { show: toast } = useToast();
  const requireAuth = useRequireAuth();

  const submit = useCallback(
    async (payload: LeadPayload): Promise<boolean> => {
      // Заявку может оставить только авторизованный — гостя ведём на регистрацию.
      if (!requireAuth()) return false;
      if (isSubmittingRef.current) return false;
      isSubmittingRef.current = true;

      lastPayloadRef.current = payload;
      setIsSubmitting(true);
      setError(null);

      try {
        await submitLead(payload);
        if (!options.silentSuccess) {
          toast(
            options.successMessage ??
              "Заявка отправлена! В скором времени с вами свяжется менеджер",
            { type: "success", duration: options.successDuration ?? 6000 }
          );
        }
        options.onSuccess?.();
        return true;
      } catch (err) {
        const norm = err as NormalizedError;
        const message = norm.message || "Не удалось отправить заявку";
        const status = norm.status;
        setError(message);

        if (!options.silentError) {
          // Retry имеет смысл только для сетевых/5xx (не для 400/429)
          const canRetry = !status || status >= 500;
          toast(message, {
            type: "error",
            duration: 8000,
            action: canRetry
              ? {
                  label: "Повторить",
                  onClick: () => {
                    if (lastPayloadRef.current) {
                      void submit(lastPayloadRef.current);
                    }
                  },
                }
              : undefined,
          });
        }
        return false;
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [options, toast, requireAuth]
  );

  const reset = useCallback(() => setError(null), []);

  return { submit, isSubmitting, error, reset };
}
