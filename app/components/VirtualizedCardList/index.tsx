"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import { CardItemPreview } from "@/app/components/CardItemPreview";
import { CardSkeleton } from "@/app/components/CardSkeleton";
import { ICard } from "@/app/types/models";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchCards } from "@/app/shared/redux/slices/cards";
import { ICardFilters } from "@/app/types";

interface VirtualizedCardListProps {
  filters: ICardFilters;
  query?: string;
}

export function VirtualizedCardList({ filters, query }: VirtualizedCardListProps) {
  const dispatch = useAppDispatch();
  const {
    cards = [],
    loading,
    hasMore,
    page,
    error,
  } = useAppSelector((state) => state.cards);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const filtersRef = useRef<ICardFilters>(filters);
  const prevFiltersStringRef = useRef<string>("");
  
  const displayCards = cards;
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRestoredScrollRef = useRef(false);

  const filtersString = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  const queryRef = useRef<string | undefined>(query);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  // Save scroll position on scroll (debounced)
  useEffect(() => {
    const handleScroll = () => {
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
      scrollDebounceRef.current = setTimeout(() => {
        sessionStorage.setItem("home-scroll-pos", String(window.scrollY));
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, []);

  // Restore scroll position on mount (once cards are loaded)
  useEffect(() => {
    if (!loading && displayCards.length > 0 && !hasRestoredScrollRef.current) {
      hasRestoredScrollRef.current = true;
      const savedPos = sessionStorage.getItem("home-scroll-pos");
      if (savedPos) {
        const pos = Number(savedPos);
        // Use requestAnimationFrame for reliable scroll after render
        requestAnimationFrame(() => {
          window.scrollTo(0, pos);
        });
      }
    }
  }, [loading, displayCards.length]);

  // Clear saved position on filter change
  useEffect(() => {
    if (filtersString !== prevFiltersStringRef.current || queryRef.current !== query) {
      prevFiltersStringRef.current = filtersString;
      filtersRef.current = filters;
      queryRef.current = query;
      sessionStorage.removeItem("home-scroll-pos");
      hasRestoredScrollRef.current = false;
      dispatch(fetchCards({ ...filters, q: query, page: 1, append: false }));
    }
    // filters используется через filtersRef, чтобы избежать лишних перерендеров
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filtersString, query]);
  
  const loadMore = useCallback(() => {
    if (loading || !hasMore || isLoadingRef.current) return;
    isLoadingRef.current = true;
    dispatch(fetchCards({ ...filtersRef.current, q: queryRef.current, page: page + 1, append: true })).finally(
      () => {
        isLoadingRef.current = false;
      }
    );
  }, [dispatch, page, hasMore, loading]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMore]);

  if (error) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-[2px] w-full">
        {displayCards.map((card: ICard, index: number) => (
          <div
            key={card.id}
            className="card-entrance"
            style={index <= 5 ? { animationDelay: `${index * 40}ms` } : undefined}
          >
            <CardItemPreview card={card} />
          </div>
        ))}
        
        {loading && (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}
      </div>

      {hasMore && !loading && <div ref={loadMoreRef} className="h-10" />}

      {!loading && displayCards.length === 0 && (
        <div
          className="text-center py-16 col-span-full"
          style={{
            borderRadius: "var(--radius-xl)",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-glass)",
          }}
        >
          <p
            className="text-base font-[family-name:var(--font-stetica-medium)]"
            style={{ color: "var(--text-secondary)" }}
          >
            Объекты не найдены
          </p>
          <p
            className="text-sm mt-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            Попробуйте изменить параметры фильтра
          </p>
        </div>
      )}
    </>
  );
}
