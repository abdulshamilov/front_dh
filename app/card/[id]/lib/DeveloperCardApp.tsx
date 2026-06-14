"use client";

import Image from "next/image";
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
  const hasLogo = !!developer.logo && developer.logo.trim() !== "";
  const initials = (developer.name || "").trim().slice(0, 2).toUpperCase();

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
        borderRadius: "8px",
        // GlassCard: surface base + white linear-gradient overlay,
        // composited so the 1px border reads as the lighter gradient
        // edge (background-clip trick: gradient drawn on the border-box,
        // surface on the padding-box).
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.016) 100%), var(--surface)",
        border: "1px solid rgba(255,255,255,0.08)",
        textDecoration: "none",
        cursor: "pointer",
        userSelect: "none",
        transform: cardPressed ? "scale(0.98)" : "scale(1)",
        transition: "transform 120ms ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            position: "relative",
            width: "48px",
            height: "48px",
            borderRadius: "8px",
            background: "var(--surface-elevated)",
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasLogo ? (
            <Image
              src={developer.logo}
              alt={developer.name || ""}
              fill
              sizes="48px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span
              aria-hidden
              style={{
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: "var(--font-stetica-bold)",
                color: "var(--text-secondary)",
              }}
            >
              {initials}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "14px",
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
        </div>

        {/* Subscribe button (CompactSubscribeButton) */}
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
            borderRadius: "8px",
            padding: "8px 12px",
            fontSize: "12px",
            fontWeight: 500,
            fontFamily: "var(--font-stetica-medium)",
            cursor: isLoading ? "wait" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            userSelect: "none",
            background: isSubscribed
              ? "var(--surface)"
              : "var(--accent-primary)",
            color: isSubscribed
              ? "var(--text-secondary)"
              : "var(--text-primary)",
            border: isSubscribed
              ? "1px solid var(--divider)"
              : "1px solid transparent",
            transform: btnPressed ? "scale(0.95)" : "scale(1)",
            transition: "transform 120ms ease-out",
          }}
        >
          {isSubscribed ? "Подписаны" : "Подписаться"}
        </button>
      </div>
    </Link>
  );
}

export default DeveloperCardApp;
