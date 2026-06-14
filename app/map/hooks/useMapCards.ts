"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/app/shared/config/axios";
import { ICard } from "@/app/types/models";

interface PaginatedResponse {
  results: ICard[];
  next: string | null;
}

interface UseMapCardsResult {
  cards: ICard[];
  isLoading: boolean;
  fetchError: string | null;
}

const PAGE_LIMIT = 8;
const MAX_TOTAL = 100;

/**
 * Local paginated fetch loop for the /map page.
 *
 * Doesn't touch the Redux cards slice — having the map paginate via Redux
 * would compete with the home page's list, leading to a torn-state bug
 * where leaving /map back to / starts you on page 12. The map needs its
 * own dataset anyway: it ignores filters and aims for the broadest set
 * of cards-with-coords.
 */
export function useMapCards(): UseMapCardsResult {
  const [cards, setCards] = useState<ICard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadAll() {
      setIsLoading(true);
      setFetchError(null);
      const all: ICard[] = [];
      let page = 1;
      try {
        while (all.length < MAX_TOTAL) {
          const before = all.length;
          const { data } = await axiosInstance.get<PaginatedResponse>(
            `/cards/?page=${page}&limit=${PAGE_LIMIT}`,
            { signal: controller.signal }
          );
          if (cancelled) return;
          if (Array.isArray(data?.results)) {
            all.push(...data.results);
          }
          // Stop when API exhausted OR a malformed page returned no new
          // items (would otherwise re-fetch the same page in a loop).
          if (!data?.next) break;
          if (all.length === before) break;
          page += 1;
        }
        if (!cancelled) {
          setCards(all);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        // Aborted requests aren't real errors
        const isAbort =
          (err as { name?: string })?.name === "CanceledError" ||
          (err as { code?: string })?.code === "ERR_CANCELED";
        if (isAbort) return;
        setFetchError("Не удалось загрузить объекты");
        setIsLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return { cards, isLoading, fetchError };
}
