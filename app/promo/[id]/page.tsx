"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import axios, { API_BASE_URL } from "@/app/shared/config/axios";
import type { PromotionDTO, PromoCardItem } from "@/app/types";
import type { ICard, ICardImage } from "@/app/types/models";
import { PropertyCard } from "@/app/components/home/PropertyCard";
import { CardSkeleton } from "@/app/components/home/CardSkeleton";
import { objectsWord } from "@/app/shared/utils/plural";

function promoCardToICard(
  item: PromoCardItem,
  images: ICardImage[] = []
): ICard {
  return {
    ...item.card,
    description: "",
    house_type: "",
    category: "",
    floors_total: 0,
    elevator: "",
    parking: "",
    balcony: false,
    ceiling_height: "",
    rating_count: 0,
    owner: "",
    images,
    videos: [],
    created_at: "",
  } as unknown as ICard;
}

export default function PromoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [promo, setPromo] = useState<PromotionDTO | null>(null);
  const [cardImages, setCardImages] = useState<Map<number, ICardImage[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios
      .get<{ results?: PromotionDTO[] } | PromotionDTO[]>(
        `${API_BASE_URL}/cards/promotions/`
      )
      .then(({ data }) => {
        const list = Array.isArray(data)
          ? data
          : (data as { results?: PromotionDTO[] }).results ?? [];
        const found = list.find((p) => p.id === Number(id));
        if (!found) {
          setNotFound(true);
          return;
        }
        setPromo(found);

        const items = found.items ?? [];
        if (items.length === 0) return;

        Promise.all(
          items.map((item) =>
            axios
              .get<ICard>(`${API_BASE_URL}/cards/${item.card.id}/`)
              .then(({ data: card }) => ({ id: item.card.id, images: card.images ?? [] }))
              .catch(() => ({ id: item.card.id, images: [] as ICardImage[] }))
          )
        ).then((results) => {
          const map = new Map<number, ICardImage[]>();
          results.forEach(({ id: cardId, images }) => map.set(cardId, images));
          setCardImages(map);
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const items = promo?.items ?? [];

  if (loading) {
    return (
      <div style={{ background: "var(--home-bg)", minHeight: "100vh", paddingBottom: 72 }}>
        <div style={{ padding: "12px 16px", height: 48 }} />
        <div
          className="shimmer"
          style={{
            margin: "0 16px",
            borderRadius: 14,
            aspectRatio: "3/1",
          }}
        />
        <div style={{ padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="shimmer" style={{ height: 26, width: "60%", borderRadius: 8 }} />
          <div className="shimmer" style={{ height: 16, width: "35%", borderRadius: 6 }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 px-4 pt-1">
          {[0, 1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (notFound || !promo) {
    return (
      <div
        style={{
          background: "var(--home-bg)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 32,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 18,
            color: "var(--home-text-primary)",
          }}
        >
          Акция не найдена
        </span>
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 20px",
            borderRadius: 12,
            border: "none",
            background: "var(--home-accent)",
            color: "#FFFFFF",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          На главную
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--home-bg)", minHeight: "100vh" }}>
      {/* Back nav */}
      <div style={{ padding: "12px 16px 0" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 0",
            background: "transparent",
            border: "none",
            color: "var(--home-text-secondary)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
          Назад
        </button>
      </div>

      {/* Banner image */}
      {promo.banner_image && (
        <div style={{ padding: "12px 16px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promo.banner_image}
            alt={promo.title ?? ""}
            style={{
              display: "block",
              width: "100%",
              aspectRatio: "3/1",
              objectFit: "cover",
              borderRadius: 14,
            }}
          />
        </div>
      )}

      {/* Title + description + count */}
      <div style={{ padding: "16px 16px 4px" }}>
        {promo.title && (
          <h1
            style={{
              margin: "0 0 4px",
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 22,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "var(--home-text-primary)",
            }}
          >
            {promo.title}
          </h1>
        )}
        {promo.description && (
          <p
            style={{
              margin: "0 0 8px",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 14,
              lineHeight: 1.45,
              color: "var(--home-text-secondary)",
            }}
          >
            {promo.description}
          </p>
        )}
        <span
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 13,
            color: "var(--home-text-tertiary)",
          }}
        >
          {items.length} {objectsWord(items.length)}
        </span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 px-4 pt-3 pb-[72px]">
        {items.length > 0 ? (
          items.map((item) => {
            const imgs = cardImages.get(item.card.id);
            return (
              <PropertyCard
                key={`${item.card.id}-${imgs?.length ?? 0}`}
                card={promoCardToICard(item, imgs)}
              />
            );
          })
        ) : (
          <p
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 14,
              color: "var(--home-text-tertiary)",
              padding: "40px 0",
              margin: 0,
            }}
          >
            Объекты скоро появятся
          </p>
        )}
      </div>
    </div>
  );
}
