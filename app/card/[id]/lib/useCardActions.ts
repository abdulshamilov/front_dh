"use client";

import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/app/shared/config/axios";
import { useToast } from "@/app/components/shared/Toast";
import { useAppDispatch } from "@/app/shared/redux/hooks";
import { useRequireAuth } from "@/app/shared/hooks/useRequireAuth";
import { toggleFavorite, updateCardFavorite } from "@/app/shared/redux/slices/cards";
import { buildWhatsappLink } from "@/app/shared/utils/contacts";
import { markCardViewed } from "@/app/shared/utils/viewedCards";
import { buildStructuredTitle } from "@/app/card/[id]/lib";
import type { ICard } from "@/app/types/models";

export interface UseCardActions {
  isFavorite: boolean;
  toggleFav: () => void;
  share: () => Promise<void>;
  openWhatsapp: () => void;
}

/**
 * Centralises the interactive actions for the v2 detail page:
 * - optimistic favorite toggle (anon → toast, rollback on reject)
 * - native share with clipboard fallback
 * - WhatsApp deep link
 * - fire-and-forget view-history POST (parity with legacy /card page)
 */
export function useCardActions(card: ICard): UseCardActions {
  const dispatch = useAppDispatch();
  const { show: toast } = useToast();
  const requireAuth = useRequireAuth();

  const [isFavorite, setIsFavorite] = useState<boolean>(
    Boolean(card.is_favorite)
  );

  // Keep local state in sync when the card (re)loads from Redux.
  useEffect(() => {
    setIsFavorite(Boolean(card.is_favorite));
  }, [card.is_favorite]);

  // Record view history once per card load. Fire & forget — never block UI.
  // Гостям (нет токена) историю не пишем — эндпоинт требует авторизацию.
  useEffect(() => {
    if (!card.id) return;
    if (localStorage.getItem("access_token")) {
      axiosInstance.post(`/cards/${card.id}/view-history/`).catch(() => {});
    }
    // Local viewed-tracking so /map can dim pins the user already opened.
    markCardViewed(card.id);
  }, [card.id]);

  const toggleFav = useCallback(() => {
    if (!requireAuth()) return;

    // Current state — the thunk deletes when currently favorite, posts otherwise.
    const current = isFavorite;
    const next = !current;

    // Optimistic flip + Redux sync so the rest of the page reacts immediately.
    setIsFavorite(next);
    dispatch(updateCardFavorite({ id: card.id, is_favorite: next }));

    dispatch(toggleFavorite({ id: card.id, is_favorite: current }))
      .unwrap()
      .catch(() => {
        // Rollback on failure.
        setIsFavorite(current);
        dispatch(updateCardFavorite({ id: card.id, is_favorite: current }));
        toast("Не удалось изменить статус избранного", { type: "error" });
      });
  }, [requireAuth, isFavorite, card.id, dispatch, toast]);

  const share = useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = buildStructuredTitle(card);

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text: title, url });
      } else if (
        typeof navigator !== "undefined" &&
        navigator.clipboard?.writeText
      ) {
        await navigator.clipboard.writeText(url);
        toast("Ссылка скопирована", { type: "success", duration: 3000 });
      }
    } catch {
      // User cancelled the share sheet — stay silent.
    }
  }, [card, toast]);

  const openWhatsapp = useCallback(() => {
    if (typeof window === "undefined") return;
    const cardUrl = `${window.location.origin}/card/${card.id}`;
    const url = buildWhatsappLink(card.title || "", cardUrl);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [card.id, card.title]);

  return { isFavorite, toggleFav, share, openWhatsapp };
}
