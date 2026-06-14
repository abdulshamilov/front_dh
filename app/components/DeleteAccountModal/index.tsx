"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { OtpInput } from "@/app/shared/components/OtpInput";
import { useOtpTimer } from "@/app/shared/hooks/useOtpTimer";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestOtp: () => Promise<void>;
  onConfirm: (otp: string) => void;
  isLoading?: boolean;
  isRequestingOtp?: boolean;
  otpError?: string | null;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onRequestOtp,
  onConfirm,
  isLoading = false,
  isRequestingOtp = false,
  otpError = null,
}: DeleteAccountModalProps) {
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [error, setError] = useState("");

  const {
    seconds,
    canResend,
    start: startTimer,
    reset: resetTimer,
  } = useOtpTimer({
    initialSeconds: 300, // 5 minutes
  });

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
      setStep("request");
      setOtp("");
      setError("");
      resetTimer();
    } else {
      document.body.classList.remove("modal-open");
      setOtp("");
      setError("");
      setStep("request");
      resetTimer();
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, resetTimer]);

  useEffect(() => {
    if (otpError) {
      setError(otpError);
    }
  }, [otpError]);

  const handleRequestOtp = async () => {
    setError("");
    try {
      await onRequestOtp();
      setStep("verify");
      startTimer();
    } catch {
      setError("Не удалось отправить код. Попробуйте позже.");
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setOtp("");
    resetTimer();
    try {
      await onRequestOtp();
      startTimer();
    } catch {
      setError("Не удалось отправить код. Попробуйте позже.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === "request") {
      handleRequestOtp();
      return;
    }

    if (otp.length !== 6) {
      setError("Пожалуйста, введите полный код");
      return;
    }

    onConfirm(otp);
  };

  const handleOtpComplete = (value: string) => {
    if (value.length === 6) {
      onConfirm(value);
    }
  };

  const handleClose = () => {
    if (!isLoading && !isRequestingOtp) {
      setOtp("");
      setError("");
      setStep("request");
      resetTimer();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{
        backgroundColor: "var(--overlay-scrim)",
        backdropFilter: "blur(4px)",
      }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] p-6 sm:p-8 relative animate-scale-in"
        style={{
          backgroundColor: "var(--modal-bg)",
          border: "1px solid var(--border-glass)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-full transition-all"
          style={{
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
            opacity: isLoading ? 0.5 : 1,
          }}
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              backgroundColor: "rgba(255, 68, 68, 0.15)",
            }}
          >
            <AlertTriangle className="w-8 h-8" style={{ color: "var(--error)" }} />
          </div>

          <h2
            className="text-2xl font-[family-name:var(--font-stetica-bold)] text-center mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Удалить аккаунт?
          </h2>

          <p
            className="text-center text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Это действие необратимо. Все ваши данные будут безвозвратно удалены.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === "request" ? (
            <div className="space-y-4">
              <p
                className="text-center text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Для подтверждения удаления аккаунта мы отправим SMS-код на ваш номер телефона
              </p>
              {error && (
                <p className="text-sm text-center" style={{ color: "var(--error)" }}>{error}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-[family-name:var(--font-stetica-bold)] mb-4 text-center"
                  style={{ color: "var(--text-primary)" }}
                >
                  Введите код из SMS
                </label>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleOtpComplete}
                  disabled={isLoading}
                  error={!!error}
                  className="mb-4"
                />
                {error && (
                  <p className="text-sm text-center mt-2" style={{ color: "var(--error)" }}>{error}</p>
                )}
              </div>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isRequestingOtp}
                  className="w-full text-sm text-center py-2 hover:underline transition-all"
                  style={{
                    color: "var(--accent-primary)",
                    opacity: isRequestingOtp ? 0.5 : 1,
                  }}
                >
                  {isRequestingOtp ? "Отправка..." : "Отправить код повторно"}
                </button>
              ) : (
                <p
                  className="text-sm text-center"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Повторная отправка через {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-[16px] font-[family-name:var(--font-stetica-bold)] transition-all"
              style={{
                backgroundColor: "var(--surface-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isLoading || isRequestingOtp || (step === "verify" && otp.length !== 6)}
              className="flex-1 py-3 rounded-[16px] font-[family-name:var(--font-stetica-bold)] transition-all relative"
              style={{
                backgroundColor: "var(--error)",
                color: "#fff",
                opacity: (isLoading || isRequestingOtp || (step === "verify" && otp.length !== 6)) ? 0.7 : 1,
              }}
            >
              {isRequestingOtp ? (
                <span className="flex items-center justify-center gap-2">
                  <div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                  />
                  Отправка...
                </span>
              ) : isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                  />
                  Удаление...
                </span>
              ) : step === "request" ? (
                "Получить код"
              ) : (
                "Удалить аккаунт"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
