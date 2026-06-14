"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Heart,
  Search as SearchIcon,
  Sparkles,
  Tag,
  Check,
  RefreshCw,
  Calendar,
  Share2,
} from "lucide-react";
import ProtectedRoute from "../components/ProtectedRoute";
import type { ICard } from "../types/models";
import { ListingsGrid } from "../components/home/ListingsGrid";
import { AiBanner } from "../components/home/AiBanner";
import { PageHero } from "../components/shared/PageHero";
import { EmptyState } from "../components/shared/EmptyState";
import { Chip } from "../components/shared/Chip";
import { Button } from "../components/shared/Button";
import { LeadCard } from "../components/shared/LeadCard";
import { useToast } from "../components/shared/Toast";
import { ScheduleViewingSheet } from "../components/favorite/ScheduleViewingSheet";
import { fetchFavoriteCards } from "../shared/redux/slices/cards";
import { useAppDispatch, useAppSelector } from "../shared/redux/hooks";
import { objectsWord } from "../shared/utils/plural";

type SortKey = "date" | "price_asc" | "price_desc" | "area";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "date", label: "По дате" },
  { value: "price_asc", label: "Цена ↑" },
  { value: "price_desc", label: "Цена ↓" },
  { value: "area", label: "По площади" },
];

function FavoriteContent() {
  const dispatch = useAppDispatch();
  const { cards, loading, error, isFavoritesPage } = useAppSelector((s) => s.cards);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);
  const { show: toast } = useToast();

  const fetchData = useCallback(() => {
    dispatch(fetchFavoriteCards());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedCards = useMemo(() => {
    if (!cards || cards.length === 0) return cards;
    if (sortBy === "date") return cards;
    const arr = [...cards];
    switch (sortBy) {
      case "price_asc":
        arr.sort((a, b) => (a.price_metr || 0) - (b.price_metr || 0));
        break;
      case "price_desc":
        arr.sort((a, b) => (b.price_metr || 0) - (a.price_metr || 0));
        break;
      case "area":
        arr.sort(
          (a, b) =>
            (parseFloat(String(b.area)) || 0) - (parseFloat(String(a.area)) || 0)
        );
        break;
    }
    return arr;
  }, [cards, sortBy]);

  const isReallyFavorites = isFavoritesPage === true;
  const cardsCount = isReallyFavorites ? cards?.length ?? 0 : 0;

  // Share подборки (MVP — base64 ID в URL)
  const handleShare = useCallback(async () => {
    if (cardsCount === 0) return;
    const ids = (cards ?? []).map((c) => c.id).join(",");
    const encoded = typeof window !== "undefined" ? btoa(ids) : "";
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/saved/${encoded}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Моя подборка квартир",
          text: `Подборка из ${cardsCount} ${objectsWord(cardsCount)} в Dream House`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Ссылка скопирована", { type: "success", duration: 3000 });
      }
    } catch {
      // user cancelled
    }
  }, [cards, cardsCount, toast]);

  return (
    <div
      className="flex flex-col items-center font-[family-name:var(--font-stetica-regular)]"
      style={{ backgroundColor: "var(--bg-primary)", minHeight: "calc(100vh - 0px)" }}
    >
      <div className="w-full max-w-[1300px] flex flex-col gap-y-4 sm:gap-y-6 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-10 flex-grow">

        {/* Hero block */}
        <section
          aria-label="Избранное"
          className="rounded-[20px] sm:rounded-[24px]"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-color)",
            padding: "16px 16px 14px",
          }}
        >
          <PageHero
            title="Избранное"
            accent="favorite"
            icon={<Heart size={22} strokeWidth={2.4} fill="currentColor" />}
            subtitle={
              !loading && cardsCount > 0
                ? `${cardsCount} ${objectsWord(cardsCount)} сохранено`
                : !loading && cardsCount === 0
                  ? "Здесь появятся объекты, которые вы добавите"
                  : "Загрузка..."
            }
            actions={
              cardsCount > 0 ? (
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Поделиться подборкой"
                  className="press-scale"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "var(--surface-elevated)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Share2 size={18} strokeWidth={2} />
                </button>
              ) : undefined
            }
          />

          {/* Sort chips inside hero */}
          {!loading && !error && cardsCount > 0 && (
            <div
              className="mt-4 pt-3 flex items-center gap-2.5"
              style={{ borderTop: "1px solid var(--border-color)" }}
            >
              <span
                className="hidden sm:inline text-[11px] uppercase tracking-wide whitespace-nowrap"
                style={{
                  color: "var(--text-tertiary)",
                  fontFamily: "var(--font-stetica-medium)",
                  letterSpacing: "0.05em",
                }}
              >
                Сортировка
              </span>
              <div
                className="flex gap-2 overflow-x-auto flex-1 -mx-1 px-1"
                style={{ scrollbarWidth: "none" }}
              >
                {sortOptions.map((option) => (
                  <Chip
                    key={option.value}
                    active={sortBy === option.value}
                    onClick={() => setSortBy(option.value)}
                    size="sm"
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Lead card "Записаться на показ" — viewable когда есть избранное */}
        {!loading && !error && cardsCount > 0 && (
          <LeadCard
            tone="primary"
            icon={<Calendar size={20} strokeWidth={2.4} />}
            title="Записаться на показ"
            description="Соберём маршрут по выбранным квартирам — менеджер свяжется через 15 минут"
            cta="Открыть форму"
            onClick={() => setShowScheduleSheet(true)}
          />
        )}

        {/* Error state */}
        {error && !loading && (
          <div
            className="rounded-[16px] p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-color)",
            }}
            role="alert"
          >
            <div className="flex flex-col gap-1">
              <p
                className="m-0 text-sm sm:text-base font-[family-name:var(--font-stetica-medium)]"
                style={{ color: "var(--text-primary)" }}
              >
                Не удалось загрузить избранное
              </p>
              <p className="m-0 text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>
                {error === "Network Error" ? "Проверьте подключение к интернету" : error}
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={fetchData}
              iconLeft={<RefreshCw size={16} strokeWidth={2.4} />}
            >
              Повторить
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && cardsCount === 0 && (
          <EmptyState
            accentColor="var(--favorite)"
            icon={<Heart size={36} strokeWidth={2} fill="currentColor" />}
            title="Сохраняйте квартиры мечты"
            description="Лайкайте понравившиеся объекты — они появятся здесь, чтобы вы могли вернуться к выбору в любой момент"
            features={
              <>
                <FeatureItem>Сохраняйте понравившиеся объекты</FeatureItem>
                <FeatureItem>Сравнивайте цены и характеристики</FeatureItem>
                <FeatureItem>Получайте уведомления о снижении цены</FeatureItem>
              </>
            }
            ctas={[
              {
                icon: <SearchIcon size={20} strokeWidth={2.2} />,
                title: "Каталог",
                href: "/",
              },
              {
                icon: <Sparkles size={20} strokeWidth={2.2} />,
                title: "AI-подбор",
                href: "/chat",
              },
              {
                icon: <Tag size={20} strokeWidth={2.2} />,
                title: "Акции",
                href: "/sale",
              },
            ]}
          />
        )}

        {/* Cards grid */}
        {!error && (loading || cardsCount > 0) && (
          <ListingsGrid
            cards={isReallyFavorites ? ((sortedCards ?? []) as ICard[]) : []}
            loading={loading}
            hasMore={false}
            page={1}
            onLoadMore={() => {}}
            hideEmpty
            showWhatsapp
          />
        )}

        {/* Cross-sell AI */}
        {!loading && !error && cardsCount > 0 && (
          <div className="mt-1">
            <AiBanner
              title="Подбор с AI"
              subtitle="Найдём похожие на ваши избранные"
              href="/chat"
              ariaLabel="Подобрать похожие на избранные с AI"
            />
          </div>
        )}
      </div>

      {/* Schedule viewing sheet */}
      <ScheduleViewingSheet
        open={showScheduleSheet}
        onClose={() => setShowScheduleSheet(false)}
        cards={(cards ?? []) as ICard[]}
      />
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: 7,
          background: "color-mix(in srgb, var(--success) 18%, transparent)",
          color: "var(--success)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Check size={14} strokeWidth={3} />
      </span>
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
        {children}
      </span>
    </div>
  );
}

export default function Favorite() {
  return (
    <ProtectedRoute>
      <FavoriteContent />
    </ProtectedRoute>
  );
}
