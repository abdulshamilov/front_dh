"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, Heart, Bot, History, Gift, Bell } from "lucide-react";
import { useAppDispatch } from "@/app/shared/redux/hooks";
import { setUser, fetchUser } from "@/app/shared/redux/slices/auth";
import PublicRoute from "@/app/components/PublicRoute";
import { useOtpTimer } from "@/app/shared/hooks/useOtpTimer";
import { OtpInput } from "@/app/shared/components/OtpInput";
import { requestRegisterSms, confirmRegisterSms } from "./lib/api";
import { requestSms, verifySms } from "@/app/login/lib/api";
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

/**
 * Единый вход по номеру телефона — без отдельной регистрации.
 * Имя не спрашиваем: новые аккаунты создаются с именем DEFAULT_NAME
 * (пользователь может поменять его в профиле). Сначала пробуем
 * регистрацию (создаёт аккаунт и шлёт код); если номер уже
 * зарегистрирован — прозрачно переключаемся на обычный вход по SMS.
 */
const DEFAULT_NAME = "безымянный";

/**
 * Контекст входа: для каждой страницы-источника (?next=) — свой заголовок,
 * объяснение и свой список пользы, чтобы гость явно видел, что именно
 * даст ему вход для конкретного действия.
 */
interface AuthContext {
  title: [string, string];
  subtitle: string;
  benefits: { icon: React.ReactNode; text: string }[];
}

const DEFAULT_CONTEXT: AuthContext = {
  title: ["Вход", "по номеру"],
  subtitle: "Укажите номер телефона — вышлем код для входа",
  benefits: [
    { icon: <Heart size={16} />, text: "Избранное синхронизируется между устройствами" },
    { icon: <Bot size={16} />, text: "ИИ-помощник подбирает квартиры под ваши запросы" },
    { icon: <Bell size={16} />, text: "Уведомления о новых объектах и снижении цен" },
    { icon: <History size={16} />, text: "История просмотров и статусы ваших заявок" },
    { icon: <Gift size={16} />, text: "Бонусы за приглашённых друзей" },
  ],
};

function contextForNext(next: string | null): AuthContext {
  if (!next) return DEFAULT_CONTEXT;

  if (next.startsWith("/favorite")) {
    return {
      title: ["Сохраните", "избранное"],
      subtitle:
        "Понравившиеся квартиры привязываются к аккаунту — войдите, чтобы подборка не потерялась",
      benefits: [
        { icon: <Heart size={16} />, text: "Подборка доступна с телефона и компьютера" },
        { icon: <Bell size={16} />, text: "Сообщим, если цена на сохранённую квартиру снизится" },
        { icon: <History size={16} />, text: "Избранное не пропадёт при смене устройства" },
      ],
    };
  }

  if (next.startsWith("/chat")) {
    return {
      title: ["ИИ-подбор", "квартиры"],
      subtitle:
        "Помощник запоминает ваши предпочтения и историю диалога — для этого нужен аккаунт",
      benefits: [
        { icon: <Bot size={16} />, text: "Подбор под ваш бюджет, район и параметры" },
        { icon: <History size={16} />, text: "Диалог сохраняется — можно вернуться к подбору позже" },
        { icon: <Bell size={16} />, text: "Помощник предложит новые объекты по вашему запросу" },
      ],
    };
  }

  if (next.startsWith("/card")) {
    return {
      title: ["Заявка", "за минуту"],
      subtitle:
        "Войдите — и менеджер свяжется с вами по этой квартире, без повторного ввода данных",
      benefits: [
        { icon: <Phone size={16} />, text: "Заявки и звонки в один тап — номер уже в профиле" },
        { icon: <History size={16} />, text: "Статусы заявок сохраняются в личном кабинете" },
        { icon: <Heart size={16} />, text: "Квартира не потеряется — добавьте её в избранное" },
      ],
    };
  }

  if (next.startsWith("/profile")) {
    return {
      title: ["Ваш", "профиль"],
      subtitle: "Войдите, чтобы открыть личный кабинет",
      benefits: [
        { icon: <Heart size={16} />, text: "Избранные квартиры в одном месте" },
        { icon: <History size={16} />, text: "История просмотров и ваши заявки" },
        { icon: <Gift size={16} />, text: "Бонусы за приглашённых друзей" },
      ],
    };
  }

  return DEFAULT_CONTEXT;
}

function RegisterContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState("");
  const [requestingCode, setRequestingCode] = useState(false);
  // Каким путём отправили код: register (новый номер) или login (существующий).
  const [flow, setFlow] = useState<"register" | "login">("register");

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

  const sendCode = async (normalizedPhone: string) => {
    try {
      const res = await requestRegisterSms(DEFAULT_NAME, normalizedPhone);
      if (res.detail || res.ok) {
        setFlow("register");
        return true;
      }
      return false;
    } catch {
      // Номер уже зарегистрирован (или register не прошёл) — обычный вход.
      const res = await requestSms(normalizedPhone);
      if (res.detail) {
        setFlow("login");
        return true;
      }
      return false;
    }
  };

  const onRequestCode = async (phone: string) => {
    setError(null);
    setRequestingCode(true);
    try {
      const normalizedPhone = normalizePhone(phone);
      if (await sendCode(normalizedPhone)) {
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

  const onConfirm = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const res =
        flow === "register"
          ? await confirmRegisterSms({
              phone_number: phoneNumber,
              otp,
              name: DEFAULT_NAME,
              ref_code: refCode,
            })
          : await verifySms(phoneNumber, otp);
      localStorage.setItem("access_token", res.access);
      localStorage.setItem("refresh_token", res.refresh);
      if (refCode) localStorage.removeItem("ref_code");
      if (res.user) {
        dispatch(setUser(res.user));
      } else {
        await dispatch(fetchUser());
      }
      router.push(searchParams.get("next") || "/");
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
      if (await sendCode(phoneNumber)) startTimer();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Ошибка повторной отправки SMS"));
    } finally {
      setRequestingCode(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
    if (value.length === 6) onConfirm();
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    resetTimer();
    setError(null);
  };

  const onBack = () => (step === "otp" ? handleBackToPhone() : router.push("/"));

  const ctx = contextForNext(searchParams.get("next"));

  return (
    <AuthShell onBack={onBack}>
      {step === "phone" ? (
        <>
          <AuthTitle line1={ctx.title[0]} line2={ctx.title[1]} />
          <AuthSubtitle>{ctx.subtitle}</AuthSubtitle>

          {error && <AuthError>{error}</AuthError>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const numbers = phoneInput.replace(/\D/g, "");
              if (numbers.length >= 11) onRequestCode(phoneInput);
            }}
            className="mt-8 flex flex-col gap-4"
          >
            <AuthField icon={<Phone size={18} />}>
              <input
                name="phone_number"
                value={phoneInput}
                placeholder="+7 (___) ___-__-__"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                onChange={(e) => setPhoneInput(formatPhone(e.target.value))}
                className="w-full bg-transparent outline-none text-[16px] font-[family-name:var(--font-stetica-regular)]"
                style={{ color: "var(--text-primary)" }}
              />
            </AuthField>

            <AuthSubmit disabled={loading || requestingCode}>
              {requestingCode || loading ? "Отправка..." : "Получить код"}
            </AuthSubmit>
          </form>

          {/* Зачем нужен аккаунт */}
          <div className="mt-8 flex flex-col gap-3">
            {ctx.benefits.map((b) => (
              <div key={b.text} className="flex items-center gap-3">
                <span
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "rgba(0,117,255,0.12)",
                    color: "var(--accent-primary)",
                  }}
                >
                  {b.icon}
                </span>
                <span
                  className="text-[13px] leading-snug font-[family-name:var(--font-stetica-regular)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {b.text}
                </span>
              </div>
            ))}
          </div>
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
              onComplete={onConfirm}
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
            onClick={onConfirm}
            disabled={loading || otp.length !== 6}
            className="mt-4"
          >
            {loading ? "Вход..." : "Войти"}
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
