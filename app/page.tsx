"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { useFiltersFromUrl } from "@/app/shared/hooks/useFiltersFromUrl";
import {
  fetchCards,
  searchCards,
  resetPagination,
  fetchGlobalTotalCount,
} from "@/app/shared/redux/slices/cards";
import { fetchDevelopers } from "@/app/shared/redux/slices/developers";
import { ICardFilters } from "@/app/types";
import { PromoBanner } from "@/app/components/home/PromoBanner";
import { FilterBar, SortKey } from "@/app/components/home/FilterBar";
import { ListingsGrid } from "@/app/components/home/ListingsGrid";
import { DevelopersPreview } from "@/app/components/home/DevelopersPreview";
import { Testimonials } from "@/app/components/home/Testimonials";
import { FinalCTA } from "@/app/components/home/FinalCTA";
import { parsePriceToNumber } from "@/app/shared/utils/price";
import { useCity } from "@/app/shared/hooks/useCity";

function areFiltersEqual(a: ICardFilters, b: ICardFilters): boolean {
  const ka = Object.keys(a).sort();
  const kb = Object.keys(b).sort();
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (a[k as keyof ICardFilters] !== b[k as keyof ICardFilters]) return false;
  }
  return true;
}

function HomeContent() {
  const dispatch = useAppDispatch();
  const { cards, searchResults, searchLoading, loading, page, hasMore, error } = useAppSelector(
    (state) => state.cards
  );
  const developersLoaded = useAppSelector((state) => {
    const d = state.developers.developers;
    return Array.isArray(d) && d.length > 0;
  });
  const { filters, updateFilters } = useFiltersFromUrl();
  const { cityId } = useCity();
  const searchParams = useSearchParams();

  // Sort state (client-side)
  const [sortKey, setSortKey] = useState<SortKey>("new");

  // Read q directly from URL (useFiltersFromUrl doesn't parse q)
  const q = searchParams.get("q") ?? undefined;

  const cardFilters = useMemo(() => filters as ICardFilters, [filters]);

  const filtersString = useMemo(
    () => JSON.stringify({ ...filters, q }),
    [filters, q]
  );

  // Refs for pagination guard and load-more
  const prevFiltersStringRef = useRef<string>("");
  const isLoadingMoreRef = useRef(false);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Reset pagination when filters or search query change
  useEffect(() => {
    if (filtersString !== prevFiltersStringRef.current) {
      dispatch(resetPagination());
    }
  }, [dispatch, filtersString]);

  // Initial / filter-driven fetch
  useEffect(() => {
    if (filtersString !== prevFiltersStringRef.current) {
      prevFiltersStringRef.current = filtersString;
      if (q && q.trim().length > 0) {
        // Smart search via dedicated endpoint
        dispatch(searchCards(q.trim()));
      } else {
        dispatch(
          fetchCards({ ...(cardFilters as ICardFilters), q, page: 1, append: false })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filtersString]);

  // Fetch developers once on mount (used by DevelopersPreview block below)
  useEffect(() => {
    if (!developersLoaded) {
      dispatch(fetchDevelopers());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Fetch global catalog total (for AI banner — reflects full catalog, not city filter)
  useEffect(() => {
    dispatch(fetchGlobalTotalCount());
  }, [dispatch]);

  // Load more (button click, not infinite scroll)
  const handleLoadMore = useCallback(() => {
    if (loading || !hasMore || isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;
    dispatch(
      fetchCards({
        ...(filtersRef.current as ICardFilters),
        page: page + 1,
        append: true,
      })
    ).finally(() => {
      isLoadingMoreRef.current = false;
    });
  }, [dispatch, loading, hasMore, page]);

  // Default filter on first mount: category=new_building + stored city
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const patch: ICardFilters = { ...filters };
    let changed = false;
    if (!patch.category) {
      patch.category = "new_building";
      changed = true;
    }
    if (!patch.city && cityId && cityId !== 0) {
      patch.city = cityId;
      changed = true;
    }
    // cityId === 0 means "Дагестан" (all cities) — no city filter
    if (patch.city && cityId === 0) {
      delete patch.city;
      changed = true;
    }
    if (changed) updateFilters(patch);
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When q is active — use smart search results, otherwise use paginated cards
  const isSearchMode = !!(q && q.trim().length > 0);
  const activeCards = isSearchMode ? searchResults : cards;
  const activeLoading = isSearchMode ? searchLoading : loading;

  // Sort client-side
  const sortedCards = useMemo(() => {
    if (sortKey === "new") return activeCards;
    const arr = [...activeCards];
    if (sortKey === "price_asc") {
      arr.sort(
        (a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price)
      );
    } else if (sortKey === "price_desc") {
      arr.sort(
        (a, b) => parsePriceToNumber(b.price) - parsePriceToNumber(a.price)
      );
    } else if (sortKey === "rating") {
      arr.sort((a, b) => {
        const ra = Number(a.rating) || 0;
        const rb = Number(b.rating) || 0;
        return rb - ra;
      });
    }
    return arr;
  }, [activeCards, sortKey]);

  const clearFilters = useCallback(() => {
    updateFilters({});
  }, [updateFilters]);

  return (
    <>
      <div
        className="home-content-wrapper"
        style={{
          background: "var(--home-bg)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="home-container"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "12px 0 64px",
          }}
        >
          <PromoBanner />

          <FilterBar
            filters={filters}
            onFiltersChange={updateFilters}
            sortKey={sortKey}
            onSortChange={setSortKey}
          />

          <ListingsGrid
            cards={sortedCards}
            loading={activeLoading}
            hasMore={isSearchMode ? false : hasMore}
            page={page}
            error={error}
            onLoadMore={handleLoadMore}
            onClearFilters={clearFilters}
            initialLimit={6}
          />

          <DevelopersPreview />

          <Testimonials />

          <FinalCTA />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .home-container {
            padding: 8px 0 48px !important;
          }
        }
      `}</style>
    </>
  );
}

export default function Home() {
  return (
    <div
      style={{
        backgroundColor: "var(--home-bg)",
        minHeight: "100vh",
      }}
    >
      <Suspense
        fallback={
          <div
            style={{
              padding: 80,
              textAlign: "center",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              color: "var(--home-text-secondary)",
            }}
          >
            Загрузка…
          </div>
        }
      >
        <HomeContent />
      </Suspense>
    </div>
  );
}
