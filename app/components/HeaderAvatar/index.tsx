"use client";

import Link from "next/link";
import { CircleUser } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchUser } from "@/app/shared/redux/slices/auth";

type HeaderAvatarProps = {
  variant?: "mobile" | "desktop";
};

export const HeaderAvatar = ({ variant = "desktop" }: HeaderAvatarProps) => {
  const dispatch = useAppDispatch();
  const { user, isAuth, initialized } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuth && !user && initialized) {
      dispatch(fetchUser());
    }
  }, [dispatch, isAuth, user, initialized]);

  // Before mount: always render unauthenticated shell to match server HTML
  const resolvedAuth = mounted ? isAuth : false;

  const { firstName, lastName } = useMemo(() => {
    if (!user?.name) return { firstName: "Пользователь", lastName: "" };
    const parts = user.name.trim().split(" ");
    return { firstName: parts[0] || "Пользователь", lastName: parts[1] || "" };
  }, [user?.name]);

  const href = resolvedAuth ? "/profile" : "/login";

  if (variant === "mobile" || !resolvedAuth) {
    return (
      <Link
        href={href}
        className="flex items-center gap-x-2 rounded-md px-2 sm:px-3 py-2 transition-colors flex-shrink-0"
        style={{
          border: "1px solid var(--border-color)",
          color: "var(--text-primary)",
          transition: "border-color 0.3s ease, color 0.3s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--accent-primary)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--border-color)")
        }
        aria-label={resolvedAuth ? "Профиль" : "Войти"}
      >
        <CircleUser
          strokeWidth={1.25}
          style={{ color: "var(--accent-primary)", transition: "color 0.3s ease" }}
        />
        {!resolvedAuth && <span className="max-[950px]:hidden">Войти</span>}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex flex-row gap-x-2 rounded-md px-3 py-2 cursor-pointer transition-colors items-center"
      style={{
        border: "1px solid var(--border-color)",
        transition: "border-color 0.3s ease",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--accent-primary)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border-color)")
      }
      aria-label="Профиль"
    >
      <CircleUser
        strokeWidth={1.25}
        style={{ color: "var(--accent-primary)", transition: "color 0.3s ease" }}
      />
      <p
        className="max-[950px]:hidden flex flex-row items-center gap-x-[5px]"
        style={{ color: "var(--text-primary)", transition: "color 0.3s ease" }}
      >
        {lastName && (
          <span className="max-[1150px]:hidden block">{lastName}</span>
        )}
        <span>{firstName}</span>
      </p>
    </Link>
  );
};
