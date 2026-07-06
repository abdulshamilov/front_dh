"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IRegisterForm } from "@/app/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { User, Phone } from "lucide-react";
import { useAppDispatch } from "@/app/shared/redux/hooks";
import { setUser, fetchUser } from "@/app/shared/redux/slices/auth";
import PublicRoute from "@/app/components/PublicRoute";
import { useOtpTimer } from "@/app/shared/hooks/useOtpTimer";
import { OtpInput } from "@/app/shared/components/OtpInput";
import { requestRegisterSms, confirmRegisterSms } from "./lib/api";
import { normalizePhone, formatPhone } from "./lib/utils";
import { getErrorMessage } from "@/app/shared/types/errors";
import {
  AuthShell,
  AuthTitle,
  AuthSubtitle,
  AuthError,
  AuthSubmit,
  AuthField,
} from "@/app/components/auth/AuthShell";

function RegisterContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"info" | "otp">("info");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [requestingCode, setRequestingCode] = useState(false);

  const refFromUrl = searchParams.get("ref") || searchParams.get("ref_code");
  const [refCode, setRefCode] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    if (refFromUrl) {
      localStorage.setItem("ref_code", refFromUrl);
      return refFromUrl;
    }
    return localStorage.getItem("ref_code") || undefined;
  });

  useEffect(() => {
    if (refFromUrl) {
      localStorage.setItem("ref_code", refFromUrl);
      setRefCode(refFromUrl);
    }
  }, [refFromUrl]);

  const { seconds, canResend, start: startTimer, reset: resetTimer } = useOtpTimer({
    initialSeconds: 60,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IRegisterForm>();

  const onRequestCode: SubmitHandler<IRegisterForm> = async (data) => {
    setError(null);
    setRequestingCode(true);
    try {
      const normalizedPhone = normalizePhone(data.phone_number);
      const trimmedName = data.name.trim();
      setName(trimmedName);
      const res = await requestRegisterSms(trimmedName, normalizedPhone);
      if (res.detail || res.ok) {
        setPhoneNumber(normalizedPhone);
        setStep("otp");
        startTimer();
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Ошибка отправки SMS"));
    } finally {
      setRequestingCode(false);
    }
  };

  const onConfirmRegister = async () => {
    if (otp.length !== 6) return;
    if (!name || !name.trim()) {
      setError("Имя не указано. Вернитесь назад и заполните форму заново.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await confirmRegisterSms({
        phone_number: phoneNumber,
        otp,
        name: name.trim(),
        ref_code: refCode,
      });
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      if (refCode) localStorage.removeItem("ref_code");
      if (res.user) {
        dispatch(setUser(res.user));
      } else {
        await dispatch(fetchUser());
      }
      router.push("/");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Ошибка верификации кода"));
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setRequestingCode(true);
    setOtp("");
    try {
      const res = await requestRegisterSms(name, phoneNumber);
      if (res.detail || res.ok) startTimer();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Ошибка повторной отправки SMS"));
    } finally {
      setRequestingCode(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
    if (value.length === 6) onConfirmRegister();
  };

  const handleBackToInfo = () => {
    setStep("info");
    setOtp("");
    resetTimer();
    setError(null);
  };

  const onBack = () => (step === "otp" ? handleBackToInfo() : router.push("/"));

  return (
    <AuthShell onBack={onBack}>
      {step === "info" ? (
        <>
          <AuthTitle line1="Создать" line2="аккаунт" />
          <AuthSubtitle>Как вас зовут и на какой номер выслать код</AuthSubtitle>

          {error && <AuthError>{error}</AuthError>}

          <form onSubmit={handleSubmit(onRequestCode)} className="mt-8 flex flex-col gap-4">
            <div>
              <AuthField icon={<User size={18} />}>
                <input
                  {...register("name", {
                    required: "Это поле является обязательным",
                    minLength: { value: 2, message: "Минимум 2 символа" },
                    maxLength: { value: 25, message: "Максимум 25 символов" },
                    pattern: {
                      value: /^[а-яА-ЯёЁa-zA-Z\s-]+$/,
                      message: "Только буквы, пробелы и дефисы",
                    },
                  })}
                  placeholder="Ваше имя"
                  autoComplete="name"
                  className="w-full bg-transparent outline-none text-[16px] font-[family-name:var(--font-stetica-regular)]"
                  style={{ color: "var(--text-primary)" }}
                />
              </AuthField>
              {errors.name && (
                <span className="text-[13px] mt-1.5 block" style={{ color: "var(--error)" }}>
                  {errors.name.message}
                </span>
              )}
            </div>

            <div>
              <AuthField icon={<Phone size={18} />}>
                <input
                  {...register("phone_number", {
                    required: "Это поле является обязательным",
                    validate: (value) =>
                      value.replace(/\D/g, "").length >= 11 ||
                      "Введите корректный номер телефона",
                  })}
                  placeholder="+7 (___) ___-__-__"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  onChange={(e) =>
                    setValue("phone_number", formatPhone(e.target.value), {
                      shouldValidate: true,
                    })
                  }
                  className="w-full bg-transparent outline-none text-[16px] font-[family-name:var(--font-stetica-regular)]"
                  style={{ color: "var(--text-primary)" }}
                />
              </AuthField>
              {errors.phone_number && (
                <span className="text-[13px] mt-1.5 block" style={{ color: "var(--error)" }}>
                  {errors.phone_number.message}
                </span>
              )}
            </div>

            <AuthSubmit disabled={loading || requestingCode}>
              {requestingCode || loading ? "Отправка..." : "Получить код"}
            </AuthSubmit>
          </form>

          <p
            className="mt-6 text-center text-[14px] font-[family-name:var(--font-stetica-regular)]"
            style={{ color: "var(--text-secondary)" }}
          >
            Уже есть аккаунт?{" "}
            <Link href="/login" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
              Войти
            </Link>
          </p>
        </>
      ) : (
        <>
          <AuthTitle line1="Подтвердите" line2="номер" />
          <AuthSubtitle>
            Введите код из SMS, отправленный на {formatPhone(phoneNumber)}
          </AuthSubtitle>

          {error && <AuthError>{error}</AuthError>}

          <div className="mt-8">
            <OtpInput
              value={otp}
              onChange={handleOtpChange}
              onComplete={onConfirmRegister}
              disabled={loading}
              error={!!error && error.includes("код")}
            />
          </div>

          <div className="mt-6 mb-2 text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={requestingCode}
                className="text-[14px] underline underline-offset-4 font-[family-name:var(--font-stetica-regular)] disabled:opacity-50"
                style={{ color: "var(--text-secondary)" }}
              >
                {requestingCode ? "Отправка..." : "Отправить код повторно"}
              </button>
            ) : (
              <span
                className="text-[14px] font-[family-name:var(--font-stetica-regular)]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Повторно через {Math.floor(seconds / 60)}:
                {(seconds % 60).toString().padStart(2, "0")}
              </span>
            )}
          </div>

          <AuthSubmit
            onClick={onConfirmRegister}
            disabled={loading || otp.length !== 6}
            className="mt-4"
          >
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </AuthSubmit>
        </>
      )}
    </AuthShell>
  );
}

export default function Register() {
  return (
    <PublicRoute>
      <Suspense fallback={null}>
        <RegisterContent />
      </Suspense>
    </PublicRoute>
  );
}
