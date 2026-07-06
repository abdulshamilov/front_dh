"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { ICard } from "@/app/types/models";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import {
  subscribeToDeveloper,
  unsubscribeFromDeveloper,
} from "@/app/shared/redux/slices/developers";
import { useToast } from "@/app/components/shared/Toast";

/**
 * Pixel-perfect port of `DeveloperCard` / `CompactSubscribeButton`
 * from DetailDeveloperCard.kt (GlassCard, logo 48, name, "Организация",
 * compact subscribe button).
 *
 * Visuals follow the Compose source 1:1 (dp -> px, sp -> px). The
 * subscription logic (Redux thunks, optimistic toggle + rollback +
 * anonymous toast) is reused from /card/[id]/lib/ComplexCard.tsx.
 */

interface DeveloperCardAppProps {
  card: ICard;
}

export function DeveloperCardApp({ card }: DeveloperCardAppProps) {
  const dispatch = useAppDispatch();
  const { show: toast } = useToast();
  const { isAuth } = useAppSelector((state) => state.auth);

  // Initialise from server-provided flag; the developers slice keeps
  // the source of truth once the subscribe/unsubscribe thunk resolves.
  const [isSubscribed, setIsSubscribed] = useState(
    card.developer?.is_subscribed ?? false
  );
  const [isLoading, setIsLoading] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);
  const [cardPressed, setCardPressed] = useState(false);

  useEffect(() => {
    setIsSubscribed(card.developer?.is_subscribed ?? false);
  }, [card.developer?.is_subscribed]);

  if (card.developer == null) return null;

  const developer = card.developer;

  const handleSubscribe = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    // The card itself is a Link to the developer page — never let the
    // subscribe tap bubble up into a navigation.
    e.preventDefault();
    e.stopPropagation();

    if (!isAuth) {
      toast("Войдите чтобы подписаться на комплекс", { type: "info" });
      return;
    }
    setIsLoading(true);
    const prev = isSubscribed;
    setIsSubscribed(!prev);
    try {
      if (prev) {
        await dispatch(unsubscribeFromDeveloper(developer.id)).unwrap();
      } else {
        await dispatch(subscribeToDeveloper(developer.id)).unwrap();
      }
    } catch {
      // Rollback the optimistic toggle on server failure.
      setIsSubscribed(prev);
      toast("Не удалось обновить подписку", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const releaseBtn = () => {
    if (btnPressed) setBtnPressed(false);
  };
  const releaseCard = () => {
    if (cardPressed) setCardPressed(false);
  };

  return (
    <Link
      href={`/developers/${developer.id}`}
      aria-label={`Открыть страницу комплекса ${developer.name || ""}`}
      onPointerDown={() => setCardPressed(true)}
      onPointerUp={releaseCard}
      onPointerLeave={releaseCard}
      onPointerCancel={releaseCard}
      style={{
        display: "block",
        width: "100%",
        margin: "12px 0",
        // iOS inset grouped row
        borderRadius: "16px",
        background: "var(--surface)",
        textDecoration: "none",
        cursor: "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        transform: cardPressed ? "scale(0.98)" : "scale(1)",
        filter: cardPressed ? "brightness(1.12)" : "none",
        transition: "transform 140ms ease-out, filter 140ms ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 12px 12px 14px",
        }}
      >

        {/* Info: имя + подпись, как в списках iOS */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              fontFamily: "var(--font-stetica-bold)",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {developer.name}
          </div>
          <div
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              color: "var(--text-tertiary, rgba(255,255,255,0.4))",
            }}
          >
            Жилой комплекс
          </div>
        </div>

        {/* Subscribe — тонированная iOS-пилюля */}
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={isLoading}
          aria-pressed={isSubscribed}
          onPointerDown={() => setBtnPressed(true)}
          onPointerUp={releaseBtn}
          onPointerLeave={releaseBtn}
          onPointerCancel={releaseBtn}
          style={{
            flexShrink: 0,
            borderRadius: "100px",
            padding: "7px 14px",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            cursor: isLoading ? "wait" : "pointer",
            opacity: isLoading ? 0.6 : 1,
            userSelect: "none",
            border: "none",
            background: isSubscribed
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,117,255,0.16)",
            color: isSubscribed
              ? "var(--text-secondary)"
              : "var(--accent-primary)",
            transform: btnPressed ? "scale(0.94)" : "scale(1)",
            transition:
              "transform 140ms ease-out, background 160ms ease, color 160ms ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {isSubscribed ? "Подписаны" : "Подписаться"}
        </button>

        {/* Шеврон — подсказка, что карточка ведёт на страницу ЖК */}
        <svg
          width="8"
          height="14"
          viewBox="0 0 8 14"
          fill="none"
          aria-hidden
          style={{ flexShrink: 0, marginLeft: 2 }}
        >
          <path
            d="M1 1l6 6-6 6"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}

export default DeveloperCardApp;
