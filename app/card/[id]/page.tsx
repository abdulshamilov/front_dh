"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Home, RefreshCw, Search as SearchIcon } from "lucide-react";
import { formatPrice } from "@/app/card/[id]/lib";
import { AsidePanel } from "@/app/card/[id]/lib/AsidePanel";
import type { ICard } from "@/app/types/models";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchCardById } from "@/app/shared/redux/slices/cards";
import { useLeadSubmit } from "@/app/shared/hooks/useLeadSubmit";
import { useRequireAuth } from "@/app/shared/hooks/useRequireAuth";
import { extractDigits } from "@/app/shared/utils/phone";
import { EmptyState } from "@/app/components/shared/EmptyState";
import { Button } from "@/app/components/shared/Button";
import { CallRequestModal } from "@/app/components/CallRequestModal";
import { SimilarListings } from "@/app/card/[id]/lib/SimilarListings";
import { CardDetailV2Skeleton } from "./lib/Skeleton";
import { useCardActions } from "./lib/useCardActions";
import { HeroGallery } from "./lib/HeroGallery";
import { PriceTitleSection } from "./lib/PriceTitleSection";
import { DeveloperCardApp } from "./lib/DeveloperCardApp";
import { UnderlineTabs, type TabKey } from "./lib/UnderlineTabs";
import { DescriptionSectionApp } from "./lib/DescriptionSectionApp";
import { CharacteristicsSectionApp } from "./lib/CharacteristicsSectionApp";
import { DocumentsSectionApp } from "./lib/DocumentsSectionApp";
import { MapPreviewApp } from "./lib/MapPreviewApp";
import { BottomCtaApp } from "./lib/BottomCtaApp";
import { PricingSection } from "./lib/PricingSection";
import Apartment3DViewer from "./lib/Apartment3DViewer";

/**
 * /card/[id] — pixel-perfect web port of the mobile app's
 * DetailAppartament screen (Compose). Single narrow column centred
 * like a phone (max-width 480px); desktop = same column, just
 * centred. No site Header (hidden via Header HIDDEN check), no
 * two-column layout.
 *
 * Block order mirrors DetailAppartament.kt exactly:
 *   LazyColumn: Hero → Price/Title → DeveloperCard(if any) →
 *   Tabs → TabContent → "Возможно вам понравится" recommendations
 *   + Spacer; sticky BottomCTA (Позвонить / Отправить заявку).
 *
 * Default active tab = Specifications ("Характеристики"), as in the
 * app. Reviews/Questions/AiBanner/LeadCards intentionally omitted —
 * the mobile app screen has none of them.
 *
 * Functionality preserved: favorite/share via useCardActions,
 * developer subscription via Redux (DeveloperCardApp), call (tel:)
 * and request (CallRequestModal) via BottomCtaApp.
 */
export default function CardDetailV2Page() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentCard, loading, error } = useAppSelector((s) => s.cards);

  const cardId = Number(params.id);

  const loadCard = useCallback(() => {
    if (Number.isFinite(cardId) && cardId > 0) {
      dispatch(fetchCardById(cardId));
    }
  }, [cardId, dispatch]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  if (loading && !currentCard) {
    return <CardDetailV2Skeleton />;
  }

  if (error || !currentCard) {
    return (
      <div
        className="force-dark flex flex-col items-center font-[family-name:var(--font-stetica-regular)]"
        style={{ backgroundColor: "var(--bg-primary)", minHeight: "100dvh" }}
      >
        <div className="w-full max-w-[480px] flex flex-col gap-y-4 px-4 pt-5 pb-10 flex-grow">
          {error ? (
            <div
              className="rounded-[12px] p-5 flex flex-col gap-4"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-color)",
              }}
              role="alert"
            >
              <div className="flex flex-col gap-1">
                <p
                  className="m-0 text-sm font-[family-name:var(--font-stetica-bold)]"
                  style={{ color: "var(--text-primary)" }}
                >
                  Не удалось загрузить объект
                </p>
                <p
                  className="m-0 text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {error === "Network Error"
                    ? "Проверьте подключение к интернету"
                    : error}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={loadCard}
                iconLeft={<RefreshCw size={16} strokeWidth={2.4} />}
              >
                Повторить
              </Button>
            </div>
          ) : (
            <EmptyState
              accentColor="var(--accent-primary)"
              icon={<Home size={32} strokeWidth={2} />}
              title="Объект не найден"
              description="Возможно, ссылка устарела или объект сняли с продажи."
              ctas={[
                {
                  icon: <SearchIcon size={20} strokeWidth={2.2} />,
                  title: "Каталог",
                  href: "/",
                },
              ]}
              primaryAction={{
                label: "На главную",
                onClick: () => router.push("/"),
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <CardDetailV2Loaded card={currentCard} onBack={() => router.back()} />
  );
}

/**
 * Loaded body in its own component so useCardActions (which depends
 * on a present card and fires the one-shot view-history POST) is
 * never called conditionally.
 */
function CardDetailV2Loaded({
  card,
  onBack,
}: {
  card: ICard;
  onBack: () => void;
}) {
  const actions = useCardActions(card);
  const [tab, setTab] = useState<TabKey>("specifications");
  const [requestOpen, setRequestOpen] = useState(false);
  const has3d = Boolean(card.has_3d_model && card.model_3d_glb);
  // Переключатель медиа: фото-галерея или 3D-модель на её месте.
  const [media, setMedia] = useState<"photos" | "3d">("photos");

  const user = useAppSelector((s) => s.auth.user);
  const requireAuth = useRequireAuth();
  const { submit: submitLead } = useLeadSubmit({
    successMessage: "Заявка отправлена! В скором времени с вами свяжется менеджер",
  });

  // Авторизован и есть телефон в аккаунте → имя+номер берём из профиля и
  // отправляем заявку сразу с toast-уведомлением. Иначе — открываем форму.
  const handleRequest = useCallback(() => {
    if (!requireAuth()) return;
    const phone = extractDigits(user?.phone_number ?? "");
    if (user && phone.length >= 10) {
      submitLead({
        kind: "call_request",
        cardId: card.id,
        phone_number: phone,
        name: user.name ?? "",
      });
      return;
    }
    setRequestOpen(true);
  }, [requireAuth, user, card.id, submitLead]);

  const sidebarPrice = formatPrice(card.price);

  // Сегмент-переключатель «Фото / 3D» в стиле iOS.
  const mediaSwitch = has3d ? (
    <div
      role="tablist"
      aria-label="Фото или 3D-модель"
      style={{
        display: "flex",
        gap: 2,
        padding: 3,
        borderRadius: 12,
        background: "var(--surface)",
        border: "1px solid rgba(255,255,255,0.08)",
        width: "fit-content",
      }}
    >
      {([
        { key: "photos", label: "Фото" },
        { key: "3d", label: "3D" },
      ] as const).map((o) => {
        const active = media === o.key;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setMedia(o.key)}
            style={{
              padding: "7px 18px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              background: active ? "var(--accent-primary)" : "transparent",
              color: active ? "#FFFFFF" : "var(--text-secondary)",
              fontFamily: "var(--font-stetica-bold)",
              fontSize: 13,
              transition: "background 160ms ease, color 160ms ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div
      className="force-dark flex flex-col items-center font-[family-name:var(--font-stetica-medium)]"
      style={{ backgroundColor: "var(--bg-primary)", minHeight: "100dvh" }}
    >
      {/* ── MOBILE: узкая колонка 480px — без изменений ── */}
      <div className="lg:hidden w-full max-w-[480px] relative">
        {media === "3d" && has3d ? (
          <div style={{ padding: "16px 16px 0" }}>
            <Apartment3DViewer
              glbUrl={card.model_3d_glb!}
              usdzUrl={card.model_3d_usdz}
              posterUrl={card.model_3d_poster}
              alt={`3D-модель планировки: ${card.title}`}
              apartmentId={card.id}
            />
          </div>
        ) : (
          <HeroGallery
            card={card}
            isFavorite={actions.isFavorite}
            onToggleFav={actions.toggleFav}
            onShare={actions.share}
            onBack={onBack}
          />
        )}
        {mediaSwitch && (
          <div style={{ padding: "12px 16px 0" }}>{mediaSwitch}</div>
        )}
        <PriceTitleSection card={card} onRatingClick={undefined} />
        <div style={{ paddingLeft: 16, paddingRight: 16 }}>
          <DeveloperCardApp card={card} />
        </div>
        <UnderlineTabs active={tab} onChange={setTab} />
        {tab === "description" && (
          <DescriptionSectionApp text={card.description || ""} />
        )}
        {tab === "specifications" && (
          <CharacteristicsSectionApp card={card} />
        )}
        {tab === "documents" && (
          <DocumentsSectionApp documents={card.documents} />
        )}
        {tab === "map" && <MapPreviewApp card={card} />}
        {tab === "pricing" && <PricingSection cardId={card.id} />}
        <div style={{ paddingTop: 21 }}>
          <SimilarListings card={card} />
        </div>
        <div style={{ height: 100 }} />
      </div>

      {/* ── DESKTOP: 2-колоночный layout ── */}
      <div className="hidden lg:block w-full">
        <div className="max-w-[1280px] mx-auto px-8 py-8">
          <div className="flex gap-8 items-start">

            {/* Левая колонка: основной контент */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">

              {/* Галерея / 3D с переключателем */}
              <div className="flex flex-col gap-3">
                {media === "3d" && has3d ? (
                  <Apartment3DViewer
                    glbUrl={card.model_3d_glb!}
                    usdzUrl={card.model_3d_usdz}
                    posterUrl={card.model_3d_poster}
                    alt={`3D-модель планировки: ${card.title}`}
                    apartmentId={card.id}
                  />
                ) : (
                  <div style={{ borderRadius: "24px", overflow: "hidden" }}>
                    <HeroGallery
                      card={card}
                      isFavorite={actions.isFavorite}
                      onToggleFav={actions.toggleFav}
                      onShare={actions.share}
                      onBack={onBack}
                      aspectRatio="16 / 9"
                    />
                  </div>
                )}
                {mediaSwitch && (
                  <div className="flex items-center gap-3">
                    {mediaSwitch}
                    {media === "3d" && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontFamily: "var(--font-stetica-medium)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Покрутите модель чтобы рассмотреть со всех сторон
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Цена, заголовок, адрес, чипы */}
              <div
                style={{
                  background: "var(--surface)",
                  backgroundImage:
                    "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                }}
              >
                <PriceTitleSection card={card} onRatingClick={undefined} />
              </div>

              {/* Табы + контент в стеклянной карточке */}
              <div
                style={{
                  background: "var(--surface)",
                  backgroundImage:
                    "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <UnderlineTabs active={tab} onChange={setTab} />
                <div style={{ padding: "4px 0 16px" }}>
                  {tab === "description" && (
                    <DescriptionSectionApp text={card.description || ""} />
                  )}
                  {tab === "specifications" && (
                    <CharacteristicsSectionApp card={card} />
                  )}
                  {tab === "documents" && (
                    <DocumentsSectionApp documents={card.documents} />
                  )}
                  {tab === "map" && <MapPreviewApp card={card} />}
                  {tab === "pricing" && <PricingSection cardId={card.id} />}
                </div>
              </div>

              {/* Похожие объекты */}
              <SimilarListings card={card} />
            </div>

            {/* Правая колонка: sticky сайдбар */}
            <div
              className="flex-shrink-0 sticky"
              style={{ width: "360px", top: "32px" }}
            >
              <AsidePanel card={card} formattedPrice={sidebarPrice} />
            </div>
          </div>
        </div>
      </div>

      {/* BottomCtaApp скрывается на desktop через свой CSS (@media lg display:none) */}
      <BottomCtaApp onRequestClick={handleRequest} onBeforeAction={requireAuth} />

      <CallRequestModal
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        cardId={card.id}
      />
    </div>
  );
}
