"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/shared/redux/hooks";

/**
 * Гость → регистрация. Возвращает функцию-страж: если пользователь
 * не авторизован, отправляет его на /register (с возвратом на текущую
 * страницу) и возвращает false. Если авторизован — возвращает true.
 *
 * Используется только там, где регистрация действительно нужна:
 * ИИ-помощник, избранное и отправка заявки.
 */
export function useRequireAuth() {
  const isAuth = useAppSelector((s) => s.auth.isAuth);
  const router = useRouter();

  return useCallback(
    (nextPath?: string): boolean => {
      if (isAuth) return true;
      const back =
        nextPath ??
        (typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/");
      router.push(`/register?next=${encodeURIComponent(back)}`);
      return false;
    },
    [isAuth, router]
  );
}
