"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchFavoritesCount } from "@/app/shared/redux/slices/cards";

const HIDDEN_PATHS = ["/login", "/register", "/forgot", "/chat", "/map"];

export function BottomBar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  // Real total favorites count, fetched globally so the badge is correct
  // regardless of which page is open.
  const favoritesCount = useAppSelector((state) => state.cards.favoritesCount);
  const isAuth = useAppSelector((state) => state.auth.isAuth);

  // Load the real favorites total on mount and whenever auth changes.
  // Skip when unauthenticated: the endpoint requires a token (401),
  // and the count stays 0.
  useEffect(() => {
    if (isAuth) {
      dispatch(fetchFavoritesCount());
    }
  }, [isAuth, dispatch]);

  const shouldHide = useMemo(
    () => HIDDEN_PATHS.some((p) => pathname.startsWith(p)),
    [pathname]
  );

  if (shouldHide) return null;

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const badgeLabel = favoritesCount > 9 ? "9+" : String(favoritesCount);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden justify-center"
      aria-label="Bottom navigation"
      style={{
        // Reserve home-indicator space below the bar on iOS so the visual
        // 56px main bar + 32px FAB pull never sit under the indicator.
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Solid background that fills the safe-area zone underneath the bar.
          Without this, the home-indicator zone shows page content through. */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "env(safe-area-inset-bottom, 0px)",
          background: "var(--nav-bg)",
        }}
      />
      {/* Glow layer behind bar — sits ABOVE the safe-area solid-fill so
          its blue tint never bleeds into the home-indicator zone. The
          solid fill below stays pure black under the indicator. */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          bottom: "env(safe-area-inset-bottom, 0px)",
          height: "58px",
          background:
            "linear-gradient(to top, rgba(7,103,215,0.3) 0%, rgba(0,85,255,0.1) 40%, transparent 100%)",
          filter: "blur(8px)",
          borderRadius: "20px 20px 0 0",
        }}
      />

      {/* Main bar */}
      <div
        className="relative w-full max-w-[500px] h-[56px] flex items-center justify-around px-2"
        style={{
          background: "var(--nav-bg)",
          borderRadius: "20px 20px 0 0",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Home */}
        <Link href="/" className="flex items-center justify-center w-12 h-12 press-scale-sm" aria-label="Главная">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
              stroke={isActive("/") ? "#0055FF" : "#8E8F91"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={isActive("/") ? "#0055FF" : "none"}
            />
          </svg>
        </Link>

        {/* Sale / Discounts (slot 2) */}
        <Link href="/sale" className="flex items-center justify-center w-12 h-12 press-scale-sm" aria-label="Акции">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="4" fill={isActive("/sale") ? "#0055FF" : "#8E8F91"} />
            <line x1="9" y1="15" x2="15" y2="9" stroke={isActive("/sale") ? "white" : "#070707"} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="9" cy="9" r="1.5" fill={isActive("/sale") ? "white" : "#070707"} />
            <circle cx="15" cy="15" r="1.5" fill={isActive("/sale") ? "white" : "#070707"} />
          </svg>
        </Link>

        {/* FAB — Map (center, primary discovery action) */}
        <Link href="/map" className="relative flex items-center justify-center -mt-8" aria-label="Карта объектов">
          {/* Pulse rings (Siri-style) */}
          <span className="absolute w-[56px] h-[56px] rounded-full fab-pulse-ring" style={{ animationDelay: "0ms" }} />
          <span className="absolute w-[56px] h-[56px] rounded-full fab-pulse-ring" style={{ animationDelay: "600ms" }} />
          <span className="absolute w-[56px] h-[56px] rounded-full fab-pulse-ring" style={{ animationDelay: "1200ms" }} />

          {/* Soft glow */}
          <span
            className="absolute w-[68px] h-[68px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(7,103,215,0.15) 0%, rgba(7,103,215,0.05) 60%, transparent 100%)",
            }}
          />

          {/* Glassmorphism blur */}
          <span
            className="absolute w-[72px] h-[72px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(7,103,215,0.6) 0%, rgba(0,85,255,0.4) 40%, rgba(0,198,255,0.2) 100%)",
              filter: "blur(20px)",
            }}
          />

          {/* FAB button */}
          <span
            className="relative w-[56px] h-[56px] rounded-full flex items-center justify-center"
            style={{ background: "#0767D7", boxShadow: "0 4px 20px rgba(7,103,215,0.4)" }}
          >
            {/* Map pin icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C7.58 2 4 5.58 4 10c0 7 8 12 8 12s8-5 8-12c0-4.42-3.58-8-8-8z" fill="white" />
              <circle cx="12" cy="10" r="3" fill="#0767D7" />
            </svg>
          </span>
        </Link>

        {/* Favorites (slot 4) */}
        <Link
          href="/favorite"
          className="relative flex items-center justify-center w-12 h-12 press-scale-sm"
          aria-label={
            favoritesCount > 0
              ? `Избранное, ${favoritesCount}`
              : "Избранное"
          }
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
              fill={isActive("/favorite") ? "#0055FF" : "none"}
              stroke={isActive("/favorite") ? "#0055FF" : "#8E8F91"}
              strokeWidth={isActive("/favorite") ? "0" : "1.5"}
            />
          </svg>
          {favoritesCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute"
              style={{
                top: "4px",
                right: "4px",
                minWidth: "18px",
                height: "18px",
                padding: favoritesCount >= 10 ? "0 4px" : "0",
                borderRadius: "9999px",
                backgroundColor: "#F1117E",
                color: "white",
                fontSize: "10px",
                fontWeight: 600,
                lineHeight: "18px",
                textAlign: "center",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
              }}
            >
              {badgeLabel}
            </span>
          )}
        </Link>

        {/* Profile */}
        <Link href="/profile" className="flex items-center justify-center w-12 h-12 press-scale-sm" aria-label="Профиль">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
              fill={isActive("/profile") ? "#0055FF" : "none"}
              stroke={isActive("/profile") ? "#0055FF" : "#8E8F91"}
              strokeWidth={isActive("/profile") ? "0" : "1.5"}
            />
            <path
              d="M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21"
              fill={isActive("/profile") ? "#0055FF" : "none"}
              stroke={isActive("/profile") ? "#0055FF" : "#8E8F91"}
              strokeWidth={isActive("/profile") ? "0" : "1.5"}
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
