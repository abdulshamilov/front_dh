"use client";

import Link from "next/link";
import PublicRoute from "@/app/components/PublicRoute";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OtpInput } from "@/app/shared/components/OtpInput";
import axiosInstance from "@/app/shared/config/axios";
import { getErrorMessage } from "@/app/shared/types/errors";

type Step = "email" | "otp" | "new-password";

function ForgotPasswordContent() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setLoading(true);

    try {
      await axiosInstance.post("/users/password-reset/request/", { email: email.trim() });
      setStep("otp");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Ошибка отправки кода"));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
    if (value.length === 6) {
      setStep("new-password");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (newPassword.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await axiosInstance.post("/users/password-reset/confirm/", {
        email: email.trim(),
        otp,
        new_password: newPassword,
      });
      setSuccessMessage("Пароль успешно изменён! Перенаправление...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Ошибка сброса пароля"));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "new-password") {
      setStep("otp");
      setOtp("");
    } else if (step === "otp") {
      setStep("email");
      setOtp("");
    } else {
      router.push("/login");
    }
    setError(null);
  };

  const getTitle = () => {
    switch (step) {
      case "email":
        return "Восстановление пароля";
      case "otp":
        return "Введите код";
      case "new-password":
        return "Новый пароль";
    }
  };

  return (
    <div
      className="flex min-h-svh items-center justify-center relative font-[family-name:var(--font-stetica-bold)] px-4 py-10"
      style={{
        background: `linear-gradient(135deg, var(--auth-gradient-dark) 0%, var(--auth-gradient-mid) 50%, var(--auth-gradient-light) 100%)`,
        transition: "background 0.3s ease",
      }}
    >
      <div
        className="glass w-full max-w-md p-8 sm:p-10"
        style={{
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div className="flex justify-center items-center gap-x-[10px] mb-6">
          <Link
            className="flex justify-center content-center items-center"
            href="/"
          >
            <svg
              width="76"
              height="45"
              viewBox="0 0 76 45"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_3242_925)">
                <path
                  d="M35.6368 13.2754H38.69C39.2302 13.2754 39.7375 13.3839 40.2117 13.601C40.6859 13.818 41.0998 14.1067 41.4535 14.4671C41.8072 14.8275 42.0871 15.248 42.2912 15.7267C42.4952 16.2053 42.5963 16.7071 42.5963 17.2323C42.5963 17.7496 42.4972 18.2496 42.297 18.7282C42.0968 19.2068 41.8189 19.6293 41.4652 19.9935C41.1115 20.3578 40.6975 20.6485 40.2233 20.8655C39.7491 21.0826 39.24 21.1911 38.6919 21.1911H35.6388V13.2754H35.6368ZM37.7008 19.4471H38.175C38.5325 19.4471 38.8513 19.3909 39.1331 19.2785C39.4149 19.1661 39.65 19.0131 39.8444 18.8173C40.0368 18.6216 40.1845 18.3891 40.2875 18.1198C40.3885 17.8504 40.4391 17.5539 40.4391 17.2323C40.4391 16.9184 40.3866 16.6238 40.2816 16.3506C40.1767 16.0774 40.0271 15.8429 39.8347 15.6472C39.6423 15.4515 39.4052 15.2965 39.1234 15.186C38.8416 15.0736 38.5267 15.0174 38.175 15.0174H37.7008V19.4471Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M50.5119 21.1891H47.9427L45.974 18.1449V21.1891H43.91V13.2754H47.1206C47.5637 13.2754 47.9485 13.3394 48.2789 13.4692C48.6093 13.599 48.8814 13.7754 49.0951 14.0001C49.3089 14.2249 49.4702 14.4826 49.5791 14.7772C49.6879 15.0717 49.7423 15.3856 49.7423 15.7208C49.7423 16.3235 49.5965 16.8118 49.305 17.1858C49.0135 17.5598 48.584 17.8136 48.0165 17.9473L50.5119 21.1891ZM45.974 16.8118H46.3627C46.7688 16.8118 47.0817 16.7285 47.2994 16.5599C47.5171 16.3913 47.6259 16.151 47.6259 15.8352C47.6259 15.5193 47.5171 15.279 47.2994 15.1105C47.0817 14.9419 46.7688 14.8585 46.3627 14.8585H45.974V16.8118Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M55.8894 15.0174H53.4368V16.339H55.7514V18.081H53.4368V19.4452H55.8894V21.1872H51.3728V13.2754H55.8894V15.0174Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M62.2367 19.8133H59.2885L58.8143 21.1891H56.6143L59.6344 13.2754H61.8869L64.9108 21.1891H62.7109L62.2367 19.8133ZM61.6906 18.2496L60.7635 15.6143L59.8365 18.2496H61.6906Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M65.4589 21.1891L66.8057 13.2754H68.8482L70.438 17.4939L72.018 13.2754H74.0605L75.4074 21.1891H73.3551L72.671 16.6335L70.7975 21.1891H69.9774L68.1991 16.6335L67.515 21.1891H65.4589Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M37.7008 25.8397H40.68V22.7858H42.744V30.6995H40.68V27.4344H37.7008V30.6995H35.6368V22.7858H37.7008V25.8397Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M44.048 26.7407C44.048 26.1536 44.1569 25.6052 44.3745 25.0975C44.5922 24.5899 44.8934 24.148 45.2802 23.7702C45.6669 23.3923 46.1275 23.0978 46.6639 22.8827C47.2003 22.6696 47.7911 22.563 48.4382 22.563C49.0776 22.563 49.6665 22.6696 50.2068 22.8827C50.7471 23.0959 51.2115 23.3923 51.6022 23.7702C51.9908 24.148 52.294 24.5899 52.5136 25.0975C52.7313 25.6052 52.8401 26.1517 52.8401 26.7407C52.8401 27.3279 52.7313 27.8762 52.5136 28.3839C52.296 28.8916 51.9928 29.3334 51.6022 29.7113C51.2135 30.0891 50.7471 30.3856 50.2068 30.5988C49.6665 30.8119 49.0776 30.9185 48.4382 30.9185C47.793 30.9185 47.2022 30.8119 46.6639 30.5988C46.1275 30.3856 45.665 30.0891 45.2802 29.7113C44.8934 29.3334 44.5922 28.8916 44.3745 28.3839C44.1569 27.8762 44.048 27.3298 44.048 26.7407ZM46.2052 26.7407C46.2052 27.0566 46.2655 27.3453 46.384 27.6127C46.5026 27.8782 46.6639 28.1088 46.8679 28.3045C47.072 28.5002 47.3091 28.6533 47.5792 28.7618C47.8494 28.8703 48.1351 28.9246 48.4363 28.9246C48.7375 28.9246 49.0232 28.8703 49.2934 28.7618C49.5635 28.6533 49.8025 28.5002 50.0085 28.3045C50.2146 28.1088 50.3778 27.8782 50.4983 27.6127C50.6168 27.3472 50.6771 27.0566 50.6771 26.7407C50.6771 26.4249 50.6168 26.1362 50.4983 25.8688C50.3797 25.6033 50.2165 25.3727 50.0085 25.177C49.8025 24.9813 49.5635 24.8282 49.2934 24.7197C49.0232 24.6112 48.7375 24.5569 48.4363 24.5569C48.1351 24.5569 47.8494 24.6112 47.5792 24.7197C47.3091 24.8282 47.072 24.9813 46.8679 25.177C46.6639 25.3727 46.5026 25.6033 46.384 25.8688C46.2655 26.1362 46.2052 26.4268 46.2052 26.7407Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M56.2062 22.7839V27.0876C56.2062 27.3182 56.214 27.5546 56.2334 27.7968C56.2509 28.039 56.3034 28.256 56.3908 28.4518C56.4783 28.6475 56.6162 28.8064 56.8067 28.9304C56.9952 29.0525 57.2634 29.1145 57.6074 29.1145C57.9514 29.1145 58.2157 29.0525 58.4023 28.9304C58.5888 28.8083 58.7268 28.6494 58.8182 28.4518C58.9095 28.256 58.9639 28.0371 58.9814 27.7968C58.9989 27.5546 59.0086 27.3182 59.0086 27.0876V22.7839H61.0609V27.3705C61.0609 28.6029 60.7791 29.502 60.2135 30.0678C59.648 30.6336 58.7793 30.9185 57.6074 30.9185C56.4355 30.9185 55.5648 30.6356 54.9974 30.0678C54.4299 29.5001 54.1442 28.6029 54.1442 27.3705V22.7839H56.2062Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M67.0797 24.8108C66.8543 24.6286 66.6308 24.4949 66.4053 24.4058C66.1799 24.3186 65.9642 24.274 65.7523 24.274C65.4861 24.274 65.2684 24.3379 65.0993 24.462C64.9303 24.5879 64.8467 24.7526 64.8467 24.9561C64.8467 25.0956 64.8895 25.2119 64.973 25.3029C65.0566 25.394 65.1674 25.4735 65.3054 25.5393C65.4414 25.6052 65.5969 25.6634 65.7679 25.7118C65.9389 25.7602 66.1099 25.8126 66.279 25.8688C66.9534 26.0935 67.4451 26.3919 67.758 26.7659C68.0709 27.1399 68.2263 27.6282 68.2263 28.2309C68.2263 28.6358 68.1583 29.004 68.0203 29.3334C67.8843 29.6628 67.6841 29.9438 67.4198 30.1783C67.1575 30.4127 66.8329 30.5949 66.452 30.7247C66.0691 30.8545 65.6357 30.9185 65.1518 30.9185C64.1471 30.9185 63.2181 30.622 62.363 30.0271L63.2473 28.3684C63.5563 28.6417 63.8614 28.8451 64.1626 28.9769C64.4638 29.1106 64.7631 29.1765 65.0566 29.1765C65.3928 29.1765 65.6435 29.099 65.8087 28.9459C65.9739 28.7928 66.0555 28.6165 66.0555 28.4208C66.0555 28.3025 66.0341 28.1979 65.9914 28.1107C65.9486 28.0235 65.8787 27.9421 65.7815 27.8685C65.6824 27.7949 65.5541 27.727 65.3967 27.6631C65.2393 27.5992 65.0469 27.5294 64.8234 27.4538C64.5571 27.3705 64.2948 27.2775 64.0402 27.1748C63.7836 27.074 63.5563 26.9384 63.3561 26.7698C63.1559 26.6012 62.9946 26.39 62.8722 26.1342C62.7497 25.8784 62.6875 25.5548 62.6875 25.1634C62.6875 24.772 62.7517 24.4174 62.8819 24.0977C63.0121 23.7799 63.1948 23.5067 63.4299 23.2799C63.6651 23.0532 63.9527 22.875 64.2928 22.749C64.6329 22.6231 65.0138 22.561 65.4356 22.561C65.8281 22.561 66.2382 22.6153 66.6677 22.7238C67.0953 22.8323 67.5073 22.9912 67.8998 23.2024L67.0797 24.8108Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M74.0372 24.5278H71.5846V25.8494H73.8992V27.5914H71.5846V28.9556H74.0372V30.6976H69.5207V22.7839H74.0372V24.5278Z"
                  fill="var(--text-primary)"
                />
                <path
                  d="M28.5316 13.2677V30.717L23.0433 36.1911V23.121V21.8266L20.8473 24.0163V38.3807L14.2085 45L10.3527 41.1536L13.1629 38.3497L14.2337 37.282L15.359 36.1601L15.3706 0.0193787L20.8647 5.47798L20.8473 20.9295L20.8453 20.9314L20.8473 20.9333V20.9295L23.0433 18.7418L24.6545 17.1354L24.6875 17.1005L28.5316 13.2677Z"
                  fill="var(--accent-primary)"
                />
                <path
                  d="M13.1746 0V33.0171L10.928 30.777L7.68436 27.543V23.9698L7.35591 23.6423L5.48827 21.7801V23.0687V28.5002L7.68436 30.6898L9.35183 32.3505L12.6907 35.6814L8.80961 39.5511L7.68436 38.4291L5.48827 36.2414V36.2027L5.46884 36.2201L0 30.7673V13.2153L3.81108 17.0152L3.84218 17.0482L5.48827 18.6875L7.68436 20.8771V20.8791H7.6863L7.68436 20.8771L7.68047 5.47797L13.1746 0Z"
                  fill="var(--accent-primary)"
                />
              </g>
              <defs>
                <clipPath id="clip0_3242_925">
                  <rect width="75.4054" height="45" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </Link>
        </div>

        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 transition-colors cursor-pointer hover:opacity-80"
          style={{ color: "var(--accent-primary)" }}
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
          Назад
        </button>

        <h4
          className="text-[30px] mb-6"
          style={{
            color: "var(--accent-primary)",
            transition: "color 0.3s ease",
          }}
        >
          {getTitle()}
        </h4>

        {error && (
          <div
            className="mb-4 p-3 rounded-[var(--radius-sm)]"
            style={{
              backgroundColor: "rgba(255, 68, 68, 0.12)",
              border: "1px solid rgba(255, 68, 68, 0.3)",
              color: "var(--error)",
              transition: "all 0.3s ease",
            }}
          >
            {typeof error === "string" ? error : "Произошла ошибка"}
          </div>
        )}

        {successMessage && (
          <div
            className="mb-4 p-3 rounded-[var(--radius-sm)]"
            style={{
              backgroundColor: "rgba(30, 237, 97, 0.12)",
              border: "1px solid rgba(30, 237, 97, 0.3)",
              color: "var(--success)",
              transition: "all 0.3s ease",
            }}
          >
            {successMessage}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <label className="block">
              <span
                className="text-[20px]"
                style={{
                  color: "var(--text-primary)",
                  transition: "color 0.3s ease",
                }}
              >
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="font-[family-name:var(--font-stetica-regular)] mt-2 block w-full rounded-full px-5 py-3 focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: "var(--input-dark)",
                  color: "var(--text-primary)",
                  border: "1px solid transparent",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "transparent";
                }}
                autoComplete="email"
                required
              />
            </label>
            <div className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-[20px] py-3 hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "#FFFFFF",
                  borderRadius: "var(--radius-lg)",
                  transition: "background-color 0.3s ease, opacity 0.3s ease",
                }}
              >
                {loading ? "Отправка..." : "Отправить код"}
              </button>
            </div>
            <p
              className="text-center cursor-pointer font-[family-name:var(--font-stetica-regular)]"
              style={{
                color: "var(--accent-primary)",
                transition: "color 0.3s ease",
              }}
            >
              <Link href="/login">Вернуться ко входу</Link>
            </p>
          </form>
        )}

        {step === "otp" && (
          <div className="space-y-5">
            <div className="text-center">
              <p
                className="text-base mb-2 font-[family-name:var(--font-stetica-regular)]"
                style={{
                  color: "var(--text-secondary)",
                  transition: "color 0.3s ease",
                }}
              >
                Код отправлен на
              </p>
              <p
                className="text-lg font-medium"
                style={{
                  color: "var(--text-primary)",
                  transition: "color 0.3s ease",
                }}
              >
                {email}
              </p>
            </div>
            <div>
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                onComplete={() => setStep("new-password")}
                disabled={loading}
                error={!!error}
                className="mb-4"
              />
            </div>
            <div className="w-full">
              <button
                type="button"
                onClick={() => {
                  if (otp.length === 6) setStep("new-password");
                }}
                disabled={loading || otp.length !== 6}
                className="w-full text-[20px] py-3 hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "#FFFFFF",
                  borderRadius: "var(--radius-lg)",
                  transition: "background-color 0.3s ease, opacity 0.3s ease",
                }}
              >
                Далее
              </button>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  try {
                    await axiosInstance.post("/users/password-reset/request/", {
                      email: email.trim(),
                    });
                  } catch (err: unknown) {
                    setError(getErrorMessage(err, "Ошибка повторной отправки"));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="text-base font-[family-name:var(--font-stetica-regular)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: "var(--accent-primary)",
                  transition: "color 0.3s ease",
                }}
              >
                {loading ? "Отправка..." : "Отправить код повторно"}
              </button>
            </div>
          </div>
        )}

        {step === "new-password" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <label className="block">
              <span
                className="text-[20px]"
                style={{
                  color: "var(--text-primary)",
                  transition: "color 0.3s ease",
                }}
              >
                Новый пароль
              </span>
              <div className="relative mt-2">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="font-[family-name:var(--font-stetica-regular)] block w-full rounded-full px-5 py-3 pr-14 focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: "var(--input-dark)",
                    color: "var(--text-primary)",
                    border: "1px solid transparent",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-primary)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: "var(--accent-primary)" }}
                  aria-label={showNewPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showNewPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </label>

            <label className="block">
              <span
                className="text-[20px]"
                style={{
                  color: "var(--text-primary)",
                  transition: "color 0.3s ease",
                }}
              >
                Подтверждение пароля
              </span>
              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  className="font-[family-name:var(--font-stetica-regular)] block w-full rounded-full px-5 py-3 pr-14 focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: "var(--input-dark)",
                    color: "var(--text-primary)",
                    border: "1px solid transparent",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-primary)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ color: "var(--accent-primary)" }}
                  aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </label>

            <div className="w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full text-[20px] py-3 hover:opacity-90 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "#FFFFFF",
                  borderRadius: "var(--radius-lg)",
                  transition: "background-color 0.3s ease, opacity 0.3s ease",
                }}
              >
                {loading ? "Сохранение..." : "Сохранить пароль"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  return (
    <PublicRoute>
      <ForgotPasswordContent />
    </PublicRoute>
  );
}
