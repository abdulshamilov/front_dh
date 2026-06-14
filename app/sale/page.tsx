"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Tag,
  Sparkles,
  Search as SearchIcon,
  Heart,
  RefreshCw,
  Percent,
  Wallet,
} from "lucide-react";
import type { ICard } from "../types/models";
import { ListingsGrid } from "../components/home/ListingsGrid";
import { AiBanner } from "../components/home/AiBanner";
import { PageHero } from "../components/shared/PageHero";
import { EmptyState } from "../components/shared/EmptyState";
import { Chip } from "../components/shared/Chip";
import { Button } from "../components/shared/Button";
import { LeadCard } from "../components/shared/LeadCard";
import { fetchCards, resetPagination } from "../shared/redux/slices/cards";
import { useAppDispatch, useAppSelector } from "../shared/redux/hooks";
import { pluralRu } from "../shared/utils/plural";
import { buildWhatsappLink } from "../shared/utils/contacts";
import { MessageCircle } from "lucide-react";

type FilterTab = "all" | "discount" | "installment";
type SortKey = "newest" | "discount_size" | "price_asc" | "price_desc";

const filterTabs: { value: FilterTab; label: string; icon?: React.ReactNode }[] = [
  { value: "all", label: "Все" },
  { value: "discount", label: "Скидки", icon: <Percent size={13} strokeWidth={2.4} /> },
  {
    value: "installment",
    label: "Рассрочка",
    icon: <Wallet size={13} strokeWidth={2.4} />,
  },
];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "newest", label: "По дате" },
  { value: "discount_size", label: "По скидке" },
  { value: "price_asc", label: "Цена ↑" },
  { value: "price_desc", label: "Цена ↓" },
];

function calcDiscount(card: ICard): number {
  if (!card.old_price || card.old_price <= card.price_metr) return 0;
  return Math.round(((card.old_price - card.price_metr) / card.old_price) * 100);
}

export default function SalePage() {
  const dispatch = useAppDispatch();
  const { cards, loading, error, isFavoritesPage } = useAppSelector(
    (s) => s.cards
  );
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  const fetchData = useCallback(() => {
    dispatch(resetPagination());
    dispatch(fetchCards({ page: 1, category: "new_building" }));
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Защита: показываем карточки только когда state точно про каталог.
  // В отличие от /favorite — здесь fetchData делает resetPagination() (sync),
  // так что isFavoritesPage уже false к рендеру. Гард на ListingsGrid даёт
  // дополнительную страховку, но не gates всю цепочку фильтрации.
  const isCatalog = isFavoritesPage !== true;
  const allCards = cards ?? [];

  // Filter
  const filteredCards = useMemo(() => {
    if (activeTab === "all") return allCards;
    if (activeTab === "discount") {
      return allCards.filter((c) => c.old_price && c.old_price > c.price_metr);
    }
    if (activeTab === "installment") {
      return allCards.filter((c) => c.installment);
    }
    return allCards;
  }, [allCards, activeTab]);

  // Sort
  const sortedCards = useMemo(() => {
    if (filteredCards.length === 0) return filteredCards;
    if (sortBy === "newest") return filteredCards;
    const arr = [...filteredCards];
    switch (sortBy) {
      case "discount_size":
        arr.sort((a, b) => calcDiscount(b) - calcDiscount(a));
        break;
      case "price_asc":
        arr.sort((a, b) => (a.price_metr || 0) - (b.price_metr || 0));
        break;
      case "price_desc":
        arr.sort((a, b) => (b.price_metr || 0) - (a.price_metr || 0));
        break;
    }
    return arr;
  }, [filteredCards, sortBy]);

  // Метрика для Hero
  const heroMetric = useMemo(() => {
    if (loading || allCards.length === 0) return undefined;
    const discountCount = allCards.filter(
      (c) => c.old_price && c.old_price > c.price_metr
    ).length;
    if (activeTab === "all" && discountCount > 0) {
      const maxDiscount = Math.max(...allCards.map(calcDiscount));
      return `${discountCount} ${pluralRu(discountCount, ["акция", "акции", "акций"])} · до -${maxDiscount}%`;
    }
    if (filteredCards.length > 0) {
      const word = pluralRu(filteredCards.length, ["вариант", "варианта", "вариантов"]);
      return `${filteredCards.length} ${word}`;
    }
    return undefined;
  }, [loading, allCards, filteredCards, activeTab]);

  const handleResetFilters = useCallback(() => {
    setActiveTab("all");
    setSortBy("newest");
  }, []);

  const showFilteredEmpty =
    !loading &&
    !error &&
    allCards.length > 0 &&
    filteredCards.length === 0;

  // Catalog-empty взаимоисключает filtered-empty — никогда не покажем оба
  const showCatalogEmpty =
    !loading && !error && allCards.length === 0 && !showFilteredEmpty;

  return (
    <div
      className="flex flex-col items-center font-[family-name:var(--font-stetica-regular)]"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-[1300px] flex flex-col gap-y-4 sm:gap-y-6 px-4 sm:px-6 lg:px-8 pt-3 sm:pt-5 pb-10 flex-grow">

        {/* Hero card */}
        <section
          aria-label="Акции и скидки"
          className="rounded-[20px] sm:rounded-[24px]"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-color)",
            padding: "16px 16px 14px",
          }}
        >
          <PageHero
            title="Акции и скидки"
            accent="primary"
            icon={<Tag size={22} strokeWidth={2.4} />}
            subtitle={
              loading
                ? "Загружаем подборку..."
                : heroMetric ?? "Все спецпредложения от застройщиков"
            }
          />

          {/* Filter chips */}
          {!loading && !error && allCards.length > 0 && (
            <div className="mt-4 pt-3 flex flex-col gap-3" style={{ borderTop: "1px solid var(--border-color)" }}>
              <div className="flex items-center gap-2.5">
                <span
                  className="hidden sm:inline text-[11px] uppercase whitespace-nowrap"
                  style={{
                    color: "var(--text-tertiary)",
                    fontFamily: "var(--font-stetica-medium)",
                    letterSpacing: "0.05em",
                  }}
                >
                  Тип
                </span>
                <div
                  className="flex gap-2 overflow-x-auto flex-1 -mx-1 px-1"
                  style={{ scrollbarWidth: "none" }}
                >
                  {filterTabs.map((tab) => (
                    <Chip
                      key={tab.value}
                      active={activeTab === tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      size="sm"
                    >
                      {tab.icon}
                      {tab.label}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Sort row */}
              <div className="flex items-center gap-2.5">
                <span
                  className="hidden sm:inline text-[11px] uppercase whitespace-nowrap"
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
                  {sortOptions.map((opt) => (
                    <Chip
                      key={opt.value}
                      active={sortBy === opt.value}
                      onClick={() => setSortBy(opt.value)}
                      size="sm"
                    >
                      {opt.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Lead card — консультация через WhatsApp.
            Отдельное действие от AiBanner внизу (тот ведёт на AI-чат),
            здесь — живой менеджер по конкретной акции. */}
        {!loading && !error && allCards.length > 0 && !showFilteredEmpty && (
          <LeadCard
            tone="success"
            icon={<MessageCircle size={20} strokeWidth={2.4} />}
            title="Узнайте детали акции"
            description="Менеджер расскажет об условиях скидок и рассрочки в WhatsApp"
            cta="Написать в WhatsApp"
            onClick={() => {
              if (typeof window === "undefined") return;
              const url = buildWhatsappLink(
                "Здравствуйте! Расскажите про активные акции в Dream House"
              );
              window.open(url, "_blank", "noopener,noreferrer");
            }}
          />
        )}

        {/* Error */}
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
                Не удалось загрузить акции
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

        {/* Empty: фильтр не дал результата */}
        {showFilteredEmpty && (
          <EmptyState
            accentColor="var(--accent-primary)"
            icon={<Tag size={32} strokeWidth={2} />}
            title={
              activeTab === "discount"
                ? "Сейчас нет квартир со скидкой"
                : activeTab === "installment"
                  ? "Сейчас нет вариантов с рассрочкой"
                  : "Не нашлось подходящих акций"
            }
            description="Попробуйте изменить фильтр или вернуться позже — застройщики регулярно обновляют предложения"
            primaryAction={{
              label: "Сбросить фильтры",
              onClick: handleResetFilters,
            }}
          />
        )}

        {/* Empty: вообще нет каталога */}
        {showCatalogEmpty && (
          <EmptyState
            accentColor="var(--accent-primary)"
            icon={<Tag size={32} strokeWidth={2} />}
            title="Скоро появятся акции"
            description="Сейчас активных предложений нет. Загляните в каталог или подберите квартиру с AI"
            ctas={[
              { icon: <SearchIcon size={20} strokeWidth={2.2} />, title: "Каталог", href: "/" },
              { icon: <Sparkles size={20} strokeWidth={2.2} />, title: "AI-подбор", href: "/chat" },
              { icon: <Heart size={20} strokeWidth={2.2} />, title: "Избранное", href: "/favorite" },
            ]}
          />
        )}

        {/* Cards grid — guard: показываем только когда state точно про каталог */}
        {!error && (loading || (allCards.length > 0 && filteredCards.length > 0)) && (
          <ListingsGrid
            cards={isCatalog ? (sortedCards as ICard[]) : []}
            loading={loading}
            hasMore={false}
            page={1}
            onLoadMore={() => {}}
            hideEmpty
            showWhatsapp
          />
        )}

        {/* AI cross-sell под гридом */}
        {!loading && !error && filteredCards.length > 0 && (
          <div className="mt-1">
            <AiBanner
              title="Не нашли свою акцию?"
              subtitle="AI подберёт квартиру со скидкой за минуту"
              href="/chat"
              ariaLabel="Открыть AI-подбор квартиры со скидкой"
            />
          </div>
        )}
      </div>
    </div>
  );
}
