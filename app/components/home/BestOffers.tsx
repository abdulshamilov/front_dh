"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Percent,
  CreditCard,
  Gift,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import axios, { API_BASE_URL } from "@/app/shared/config/axios";
import type { PromotionDTO } from "@/app/types";

/**
 * BestOffers — секция «Лучшие предложения» в стиле «Recommended» из макета:
 * горизонтальная карусель крупных карточек, данные — акции (promotions),
 * а НЕ объекты каталога. Цвета из дизайн-системы сайта (тёмная тема).
 */

interface Offer {
  id: number;
  title: string;
  subtitle: string;
  href: string;
  image?: string | null;
  gradient: string;
  accentRgb: string;
  badge?: string | null;
  Icon: LucideIcon;
}

const PALETTES = [
  { gradient: "linear-gradient(150deg, #F1117E 0%, #FF7A3D 100%)", rgb: "241,17,126" },
  { gradient: "linear-gradient(150deg, #0075FF 0%, #0057D6 100%)", rgb: "0,117,255" },
  { gradient: "linear-gradient(150deg, #8B5CF6 0%, #4F3AA3 100%)", rgb: "139,92,246" },
  { gradient: "linear-gradient(150deg, #353358 0%, #15142A 100%)", rgb: "53,51,88" },
];

function iconForType(type?: string | null): LucideIcon {
  switch (type) {
    case "discount":
      return Percent;
    case "installment":
      return CreditCard;
    case "referral":
      return Gift;
    default:
      return Sparkles;
  }
}

function dtoToOffer(dto: PromotionDTO, idx: number): Offer | null {
  if (dto.is_active === false) return null;
  const title = (dto.title ?? "").trim();
  if (!title) return null;
  const subtitle = (dto.description ?? "").trim() || "Подробности по клику";
  const p = PALETTES[idx % PALETTES.length];

  let badge: string | null = null;
  if (typeof dto.discount_percent === "number" && dto.discount_percent > 0) {
    badge = `−${Math.round(dto.discount_percent)}%`;
  } else if (typeof dto.discount_amount === "number" && dto.discount_amount > 0) {
    badge = `−${new Intl.NumberFormat("ru-RU").format(dto.discount_amount)} ₽`;
  } else if (dto.promotion_type === "installment") {
    badge = "Рассрочка";
  } else if (dto.promotion_type === "referral") {
    badge = "Бонус";
  }

  return {
    id: dto.id,
    title,
    subtitle,
    href: `/promo/${dto.id}`,
    image: dto.banner_image ?? null,
    gradient: p.gradient,
    accentRgb: p.rgb,
    badge,
    Icon: iconForType(dto.promotion_type),
  };
}

function OfferCard({ o }: { o: Offer }) {
  return (
    <Link
      href={o.href}
      className="best-offer-card"
      style={{
        flex: "0 0 auto",
        width: "78vw",
        maxWidth: 320,
        scrollSnapAlign: "start",
        display: "block",
        textDecoration: "none",
        color: "inherit",
        background: "var(--home-surface)",
        border: "1px solid var(--home-border-strong)",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
      }}
    >
      {/* Фото / градиент */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background: o.image ? "var(--home-surface-tinted)" : o.gradient,
        }}
      >
        {o.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={o.image}
            alt={o.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(360px 240px at 110% 110%, rgba(${o.accentRgb},0.45), transparent 65%), radial-gradient(220px 180px at -10% -10%, rgba(255,255,255,0.08), transparent 65%)`,
            }}
          />
        )}

        {/* Иконка-кружок в углу (как heart в макете) */}
        <span
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 40,
            height: 40,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(10,10,12,0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          <o.Icon size={18} strokeWidth={2.2} color="#FFFFFF" />
        </span>

        {o.badge && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              padding: "5px 12px",
              borderRadius: 999,
              background: "var(--home-accent)",
              color: "#FFFFFF",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.02em",
            }}
          >
            {o.badge}
          </span>
        )}
      </div>

      {/* Текст */}
      <div style={{ padding: "14px 16px 16px" }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 17,
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
            color: "var(--home-text-primary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {o.title}
        </h3>
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 13,
            lineHeight: 1.4,
            color: "var(--home-text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {o.subtitle}
        </p>
      </div>
    </Link>
  );
}

export function BestOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get<{ results?: PromotionDTO[] } | PromotionDTO[]>(
          `${API_BASE_URL}/cards/promotions/`
        );
        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        const mapped = rows
          .map((dto, i) => dtoToOffer(dto, i))
          .filter((o): o is Offer => o !== null);
        if (!cancelled) setOffers(mapped);
      } catch {
        /* нет акций — секция не показывается */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (offers.length === 0) return null;

  return (
    <section aria-labelledby="best-offers-heading" style={{ marginTop: 22 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "0 0 14px",
          padding: "0 16px",
        }}
      >
        <h2
          id="best-offers-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: "var(--home-text-primary)",
          }}
        >
          Лучшие предложения
        </h2>
        <Link
          href="/sale"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: "var(--home-accent-link)",
            textDecoration: "none",
          }}
        >
          Показать все <ArrowRight size={14} />
        </Link>
      </header>

      <div className="best-offers-track">
        {offers.map((o) => (
          <OfferCard key={o.id} o={o} />
        ))}
      </div>

      <style jsx>{`
        .best-offers-track {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          scroll-snap-type: x mandatory;
          padding: 0 16px 8px;
          scrollbar-width: none;
        }
        .best-offers-track::-webkit-scrollbar {
          display: none;
        }
        .best-offer-card {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .best-offer-card:active {
          transform: scale(0.98);
        }
      `}</style>
    </section>
  );
}

export default BestOffers;
