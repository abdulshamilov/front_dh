"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchFavoritesCount } from "@/app/shared/redux/slices/cards";
import { useRequireAuth } from "@/app/shared/hooks/useRequireAuth";

const HIDDEN_PATHS = ["/login", "/register", "/forgot", "/chat", "/map", "/card/"];

// Instagram-стиль: все иконки белые; активная — залитая (filled) в сером
// круге-«шайбе», неактивная — контурная.
const ACTIVE = "#FFFFFF";
const INACTIVE = "#FFFFFF";

/**
 * Запускает мягкую pop-анимацию тапа на pointerdown и всегда проигрывает её
 * целиком — в отличие от :active, которая обрывается на быстром касании
 * (из-за чего тап ощущается «деревянным»).
 */
function useTapPop<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const play = () => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("tab-pop");
    // рефлоу, чтобы анимация перезапустилась при частых тапах
    void el.offsetWidth;
    el.classList.add("tab-pop");
  };
  const clear = () => ref.current?.classList.remove("tab-pop");
  return { ref, onPointerDown: play, onAnimationEnd: clear };
}

// Один пункт таб-бара (module scope — не ремаунтится при навигации,
// поэтому анимация тапа не сбрасывается на переходе).
function TabItem({
  href,
  label,
  active,
  authGate = false,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  /** Требует авторизацию: гостя ведём на регистрацию вместо перехода. */
  authGate?: boolean;
  children: React.ReactNode;
}) {
  const pop = useTapPop<HTMLAnchorElement>();
  const requireAuth = useRequireAuth();
  return (
    <Link
      ref={pop.ref}
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="tab-item"
      onPointerDown={pop.onPointerDown}
      onAnimationEnd={pop.onAnimationEnd}
      onClick={(e) => {
        if (authGate && !requireAuth(href)) e.preventDefault();
      }}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Активный таб — широкая светло-серая овальная «шайба» почти во всю
        // высоту бара, как в Instagram; ширина плавно расползается.
        width: active ? 76 : 48,
        height: 52,
        borderRadius: 9999,
        background: active ? "rgba(255,255,255,0.22)" : "transparent",
        transition: "background 200ms ease, width 260ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {children}
    </Link>
  );
}

export function BottomBar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const favoritesCount = useAppSelector((state) => state.cards.favoritesCount);
  const isAuth = useAppSelector((state) => state.auth.isAuth);

  // Как в Instagram: при скролле вниз бар плавно тает, вверх — возвращается.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isAuth) {
      dispatch(fetchFavoritesCount());
    }
  }, [isAuth, dispatch]);

  const shouldHide = useMemo(
    () => HIDDEN_PATHS.some((p) => pathname.startsWith(p)),
    [pathname]
  );

  // Реакция на направление скролла.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const delta = y - lastY;
        if (y < 24) {
          setCollapsed(false); // у самого верха всегда развёрнут
        } else if (delta > 6) {
          setCollapsed(true); // листаем вниз — прячем
        } else if (delta < -6) {
          setCollapsed(false); // листаем вверх — показываем
        }
        lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (shouldHide) return null;

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center lg:hidden"
      aria-label="Bottom navigation"
      style={{
        padding: "0 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
        pointerEvents: collapsed ? "none" : "auto",
      }}
    >
      {/* Внешний слой — только анимация скрытия (transform/opacity/filter).
          Держим её отдельно от пилюли: filter/transform на том же элементе,
          что и backdrop-filter, ломают эффект стекла в Chrome/Safari. */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          transformOrigin: "bottom center",
          transform: collapsed
            ? "translateY(130%) scale(0.9)"
            : "translateY(0) scale(1)",
          opacity: collapsed ? 0 : 1,
          // Вниз — плавно (без пружины), вверх — с лёгким iOS-overshoot.
          transition: collapsed
            ? "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease"
            : "transform 0.5s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.34s ease",
        }}
      >
      {/* Пилюля: раскладка как в Instagram, материал — полупрозрачное
          стекло: контент просвечивает и размывается под баром. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          height: 64,
          padding: "0 6px",
          borderRadius: 9999,
          background: "rgba(30,30,34,0.65)",
          backdropFilter: "blur(24px) saturate(160%)",
          WebkitBackdropFilter: "blur(24px) saturate(160%)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        {/* Home */}
        <TabItem href="/" label="Главная" active={isActive("/")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
              stroke={isActive("/") ? ACTIVE : INACTIVE}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isActive("/") ? ACTIVE : "none"}
            />
          </svg>
        </TabItem>

        {/* AI-помощник — только для авторизованных */}
        <TabItem href="/chat" label="AI-помощник" active={isActive("/chat")} authGate>
          <Bot size={24} strokeWidth={2} color={isActive("/chat") ? ACTIVE : INACTIVE} />
        </TabItem>

        {/* Map — обычный пункт, как остальные (в Instagram нет акцентной кнопки) */}
        <TabItem href="/map" label="Карта объектов" active={isActive("/map")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C7.58 2 4 5.58 4 10c0 7 8 12 8 12s8-5 8-12c0-4.42-3.58-8-8-8z"
              fill={isActive("/map") ? ACTIVE : "none"}
              stroke={INACTIVE}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="10"
              r="3"
              fill={isActive("/map") ? "rgba(22,22,24,1)" : "none"}
              stroke={isActive("/map") ? "none" : INACTIVE}
              strokeWidth="1.8"
            />
          </svg>
        </TabItem>

        {/* Favorites */}
        <TabItem
          href="/favorite"
          label={favoritesCount > 0 ? `Избранное, ${favoritesCount}` : "Избранное"}
          active={isActive("/favorite")}
          authGate
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
              fill={isActive("/favorite") ? ACTIVE : "none"}
              stroke={isActive("/favorite") ? ACTIVE : INACTIVE}
              strokeWidth={isActive("/favorite") ? "0" : "1.5"}
            />
          </svg>
          {favoritesCount > 0 && (
            <span
              aria-hidden="true"
              style={{
                // Точка-индикатор без числа, снизу-справа от иконки — как в Instagram.
                position: "absolute",
                bottom: "12px",
                right: "8px",
                width: "9px",
                height: "9px",
                borderRadius: "9999px",
                backgroundColor: "#FF3040",
              }}
            />
          )}
        </TabItem>

        {/* Profile */}
        <TabItem href="/profile" label="Профиль" active={isActive("/profile")}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
              fill={isActive("/profile") ? ACTIVE : "none"}
              stroke={isActive("/profile") ? ACTIVE : INACTIVE}
              strokeWidth={isActive("/profile") ? "0" : "1.5"}
            />
            <path
              d="M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21"
              fill={isActive("/profile") ? ACTIVE : "none"}
              stroke={isActive("/profile") ? ACTIVE : INACTIVE}
              strokeWidth={isActive("/profile") ? "0" : "1.5"}
              strokeLinecap="round"
            />
          </svg>
        </TabItem>
      </div>
      </div>
    </nav>
  );
}
