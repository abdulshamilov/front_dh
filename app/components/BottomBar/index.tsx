"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchFavoritesCount } from "@/app/shared/redux/slices/cards";
import { useRequireAuth } from "@/app/shared/hooks/useRequireAuth";

const HIDDEN_PATHS = ["/login", "/register", "/forgot", "/chat", "/map", "/card/"];

// Стиль макета: залитые иконки, активная — синяя, неактивные — серые.
const ACTIVE = "#0075FF";
const INACTIVE = "#8E8F91";

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
        width: 52,
        height: 52,
        borderRadius: 9999,
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

  // Точка на «Избранном»: загорается, когда счётчик вырос с момента
  // последнего визита на /favorite, и гаснет при заходе на страницу.
  const [seenFavCount, setSeenFavCount] = useState<number>(() => {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem("dh_fav_seen_count");
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : 0;
  });

  useEffect(() => {
    if (pathname.startsWith("/favorite")) {
      setSeenFavCount(favoritesCount);
      try {
        localStorage.setItem("dh_fav_seen_count", String(favoritesCount));
      } catch {}
    }
  }, [pathname, favoritesCount]);

  // Если избранное только убавлялось (удаляли), точку не показываем —
  // и синхронизируем «увиденное» вниз, чтобы следующее добавление её зажгло.
  useEffect(() => {
    if (favoritesCount < seenFavCount) {
      setSeenFavCount(favoritesCount);
      try {
        localStorage.setItem("dh_fav_seen_count", String(favoritesCount));
      } catch {}
    }
  }, [favoritesCount, seenFavCount]);

  const hasNewFavorites = favoritesCount > seenFavCount;

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
        {/* Home — залитый дом */}
        <TabItem href="/" label="Главная" active={isActive("/")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M11.36 2.5a1 1 0 0 1 1.28 0l8 6.67c.23.19.36.47.36.77V20a1.5 1.5 0 0 1-1.5 1.5H15a1 1 0 0 1-1-1v-4.25a2 2 0 0 0-4 0v4.25a1 1 0 0 1-1 1H4.5A1.5 1.5 0 0 1 3 20V9.94c0-.3.13-.58.36-.77l8-6.67Z"
              fill={isActive("/") ? ACTIVE : INACTIVE}
            />
          </svg>
        </TabItem>

        {/* Favorites — залитое сердце + розовый счётчик */}
        <TabItem
          href="/favorite"
          label={favoritesCount > 0 ? `Избранное, ${favoritesCount}` : "Избранное"}
          active={isActive("/favorite")}
          authGate
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
              fill={isActive("/favorite") ? ACTIVE : INACTIVE}
            />
          </svg>
          {hasNewFavorites && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 9,
                right: 11,
                width: 9,
                height: 9,
                borderRadius: 9999,
                background: "#FF3040",
                boxShadow: "0 0 6px rgba(255,48,64,0.6)",
              }}
            />
          )}
        </TabItem>

        {/* Карта — большая синяя кнопка по центру, приподнята над баром */}
        <MapCenterButton />

        {/* AI-помощник — микрофон со звёздочкой */}
        <TabItem href="/chat" label="AI-помощник" active={isActive("/chat")} authGate>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3.5" width="6" height="11" rx="3" fill={isActive("/chat") ? ACTIVE : INACTIVE} />
            <path
              d="M5.5 11.5a6.5 6.5 0 0 0 13 0"
              stroke={isActive("/chat") ? ACTIVE : INACTIVE}
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M12 18v3M9.5 21h5" stroke={isActive("/chat") ? ACTIVE : INACTIVE} strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M18.6 2.2l.65 1.75 1.75.65-1.75.65-.65 1.75-.65-1.75-1.75-.65 1.75-.65.65-1.75Z"
              fill={isActive("/chat") ? ACTIVE : INACTIVE}
              style={{ transformOrigin: "18.6px 5.25px", animation: "aiSparkle 2.2s ease-in-out infinite" }}
            />
          </svg>
        </TabItem>

        {/* Profile — залитый силуэт */}
        <TabItem href="/profile" label="Профиль" active={isActive("/profile")}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
              fill={isActive("/profile") ? ACTIVE : INACTIVE}
            />
            <path
              d="M12 13.5c-4.42 0-8 2.91-8 6.5 0 .55.45 1 1 1h14c.55 0 1-.45 1-1 0-3.59-3.58-6.5-8-6.5Z"
              fill={isActive("/profile") ? ACTIVE : INACTIVE}
            />
          </svg>
        </TabItem>
      </div>
      </div>

      {/* global: keyframes используются инлайн-стилями в AiCenterButton */}
      <style jsx global>{`
        @keyframes aiGlow {
          0%, 100% { box-shadow: 0 8px 26px rgba(0, 117, 255, 0.55), 0 0 0 0 rgba(0, 117, 255, 0.35); }
          50% { box-shadow: 0 8px 26px rgba(0, 117, 255, 0.55), 0 0 0 10px rgba(0, 117, 255, 0); }
        }
        @keyframes aiSparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(0.55) rotate(20deg); opacity: 0.6; }
        }
      `}</style>
    </nav>
  );
}

/** Центральная кнопка карты: приподнята над баром, дышащее свечение. */
function MapCenterButton() {
  const pop = useTapPop<HTMLAnchorElement>();
  return (
    <Link
      ref={pop.ref}
      href="/map"
      aria-label="Карта объектов"
      className="tab-item"
      onPointerDown={pop.onPointerDown}
      onAnimationEnd={pop.onAnimationEnd}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 62,
        height: 62,
        borderRadius: 9999,
        // Кнопка чуть приподнята над пилюлей, как в макете
        marginTop: -22,
        flexShrink: 0,
        background: "linear-gradient(160deg, #2B8FFF 0%, #0075FF 45%, #0057D6 100%)",
        animation: "aiGlow 2.6s ease-in-out infinite",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2C7.58 2 4 5.58 4 10c0 7 8 12 8 12s8-5 8-12c0-4.42-3.58-8-8-8z"
          fill="#FFFFFF"
        />
        <circle cx="12" cy="10" r="3" fill="#0075FF" />
      </svg>
    </Link>
  );
}
