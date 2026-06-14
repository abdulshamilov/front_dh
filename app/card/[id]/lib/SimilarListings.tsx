"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchSimilarCards } from "@/app/shared/redux/slices/cards";
import { ListingsGrid } from "@/app/components/home/ListingsGrid";
import axiosInstance, { API_BASE_URL } from "@/app/shared/config/axios";
import type { ICard } from "@/app/types/models";

interface SimilarListingsProps {
  card: ICard;
}

interface CardsResponse {
  results?: ICard[];
}

/**
 * "Возможно понравится" recommendations block. Renders the home
 * ListingsGrid so cards look identical to the catalogue, flush to
 * the screen edges like the home page.
 *
 * Source priority:
 *  1. Curated similar cards (/cards/{id}/curations/, via Redux).
 *  2. Fallback "рядом": if curations is empty, load catalogue cards
 *     in the SAME city (GET /cards/?city={card.city}) so the block
 *     always shows nearby objects by location instead of staying
 *     hidden. Uses the same axios client as the cards slice — no
 *     Redux/API changes.
 */
export function SimilarListings({ card }: SimilarListingsProps) {
  const dispatch = useAppDispatch();
  const { similarCards, similarCardsLoading } = useAppSelector(
    (state) => state.cards
  );

  const [nearby, setNearby] = useState<ICard[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  useEffect(() => {
    if (card.id) {
      dispatch(fetchSimilarCards(card.id));
    }
  }, [dispatch, card.id]);

  // Fallback: once curations resolved empty, fetch same-city cards.
  useEffect(() => {
    if (similarCardsLoading) return;
    if (similarCards && similarCards.length > 0) {
      setNearby([]);
      return;
    }
    if (!card.city) return;

    let cancelled = false;
    setNearbyLoading(true);
    axiosInstance
      .get<CardsResponse | ICard[]>(
        `${API_BASE_URL}/cards/?city=${card.city}&limit=12`
      )
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.results ?? [];
        // Exclude the current object; keep only nearby ones.
        setNearby(list.filter((c) => c.id !== card.id));
      })
      .catch(() => {
        if (!cancelled) setNearby([]);
      })
      .finally(() => {
        if (!cancelled) setNearbyLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [similarCards, similarCardsLoading, card.city, card.id]);

  const hasCurated = !!similarCards && similarCards.length > 0;
  const list = hasCurated ? similarCards : nearby;

  if (similarCardsLoading || nearbyLoading) return null;
  if (list.length === 0) return null;

  return (
    // No horizontal padding on the section so the grid sits flush to
    // the screen edges exactly like the home page (.listings-grid is
    // padding:0 on mobile). Only the heading is inset.
    <section style={{ padding: "12px 0" }}>
      <h2
        style={{
          margin: "0 16px 12px",
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: "var(--font-stetica-bold)",
          color: "var(--text-primary)",
        }}
      >
        Возможно понравится
      </h2>
      {/* Reuse the exact home-page grid so the cards look identical
          to the catalogue (same .listings-grid layout & spacing). */}
      <ListingsGrid
        cards={list.slice(0, 6)}
        loading={false}
        hasMore={false}
        page={1}
        onLoadMore={() => {}}
        hideEmpty
      />
    </section>
  );
}
