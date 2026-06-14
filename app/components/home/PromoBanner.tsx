"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Percent,
  CreditCard,
  Gift,
  ShieldCheck,
  Bot,
  MapPinned,
  HandCoins,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import axios, { API_BASE_URL } from "@/app/shared/config/axios";
import type { PromotionDTO } from "@/app/types";

interface Slide {
  key: string;
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
  bannerImage?: string | null;
  gradient: string;
  accentRgb: string;
  badge?: string | null;
}

const FALLBACK_SLIDES: Slide[] = [
  {
    key: "fallback-verified",
    Icon: ShieldCheck,
    eyebrow: "Почему Dream House",
    title: "Только проверенные застройщики",
    subtitle: "Проверяем документы и репутацию каждого ЖК",
    href: "/developers",
    gradient: "linear-gradient(135deg, #353358 0%, #22212F 55%, #15142A 100%)",
    accentRgb: "53,51,88",
  },
  {
    key: "fallback-no-middlemen",
    Icon: HandCoins,
    eyebrow: "Без посредников",
    title: "Напрямую с застройщиком",
    subtitle: "Честная цена — без агентских комиссий",
    href: "/",
    gradient: "linear-gradient(135deg, #0075FF 0%, #0057D6 100%)",
    accentRgb: "0,117,255",
  },
  {
    key: "fallback-ai",
    Icon: Bot,
    eyebrow: "AI-помощник",
    title: "Подбор квартиры за минуту",
    subtitle: "Опиши мечту — мы найдём лучшие варианты",
    href: "/chat",
    gradient: "linear-gradient(135deg, #F1117E 0%, #FF7A3D 100%)",
    accentRgb: "241,17,126",
  },
  {
    key: "fallback-map",
    Icon: MapPinned,
    eyebrow: "На карте",
    title: "Все квартиры Дагестана",
    subtitle: "Расположение, инфраструктура и цена",
    href: "/map",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #4F3AA3 100%)",
    accentRgb: "139,92,246",
  },
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

function eyebrowForType(type?: string | null, discount?: number | null): string {
  if (type === "discount" || (discount ?? 0) > 0) return "Скидка";
  if (type === "installment") return "Рассрочка";
  if (type === "referral") return "Приведи друга";
  return "Акция";
}

function dtoToSlide(dto: PromotionDTO, idx: number): Slide | null {
  if (dto.is_active === false) return null;
  const title = (dto.title ?? "").trim();
  if (!title) return null;
  const subtitle = (dto.description ?? "").trim() || "Подробности по клику";

  const palettes = [
    { gradient: "linear-gradient(135deg, #F1117E 0%, #FF7A3D 100%)", rgb: "241,17,126" },
    { gradient: "linear-gradient(135deg, #0075FF 0%, #0057D6 100%)", rgb: "0,117,255" },
    { gradient: "linear-gradient(135deg, #353358 0%, #22212F 55%, #15142A 100%)", rgb: "53,51,88" },
    { gradient: "linear-gradient(135deg, #8B5CF6 0%, #4F3AA3 100%)", rgb: "139,92,246" },
  ];
  const p = palettes[idx % palettes.length];

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
    key: `promo-${dto.id}`,
    Icon: iconForType(dto.promotion_type),
    eyebrow: eyebrowForType(dto.promotion_type, dto.discount_percent),
    title,
    subtitle,
    href: `/promo/${dto.id}`,
    bannerImage: dto.banner_image ?? null,
    gradient: p.gradient,
    accentRgb: p.rgb,
    badge,
  };
}

const TRACK_PADDING_X = 12;
const SLIDE_GAP = 8;

function SlideInner({
  s,
  isDesktop,
}: {
  s: Slide;
  isDesktop: boolean;
}) {
  const sharedCard: React.CSSProperties = {
    display: "block",
    position: "relative",
    aspectRatio: isDesktop ? "3/1" : "21/9",
    borderRadius: 20,
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };

  const content = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: isDesktop ? "22px 24px" : "16px 18px",
        gap: 4,
        background: s.bannerImage
          ? "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.05) 100%)"
          : undefined,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "rgba(255,255,255,0.13)",
          border: "1px solid rgba(255,255,255,0.16)",
          marginBottom: 6,
          flexShrink: 0,
        }}
      >
        <s.Icon size={16} strokeWidth={2.2} color="#FFFFFF" />
      </span>

      {s.eyebrow && (
        <span
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {s.eyebrow}
        </span>
      )}

      <span
        style={{
          fontFamily: "var(--font-manrope), system-ui, sans-serif",
          fontWeight: 800,
          fontSize: isDesktop ? 22 : 18,
          lineHeight: 1.15,
          color: "#FFFFFF",
          letterSpacing: "-0.02em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {s.title}
      </span>

      <span
        style={{
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontSize: isDesktop ? 13 : 12,
          lineHeight: 1.35,
          color: "rgba(255,255,255,0.62)",
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {s.subtitle}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
        {s.badge && (
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 999,
              background: "var(--home-accent)",
              color: "#FFFFFF",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.03em",
            }}
          >
            {s.badge}
          </span>
        )}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.13)",
            border: "1px solid rgba(255,255,255,0.16)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 11,
            letterSpacing: "0.01em",
          }}
        >
          Подробнее →
        </span>
      </div>
    </div>
  );

  if (s.bannerImage) {
    return (
      <Link href={s.href} style={sharedCard}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={s.bannerImage}
          alt={s.title}
          loading="lazy"
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
        />
        {s.badge && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "4px 12px",
              borderRadius: 999,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#FFFFFF",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.04em",
            }}
          >
            {s.badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={s.href}
      style={{
        ...sharedCard,
        background: s.gradient,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(420px 260px at 110% 110%, rgba(${s.accentRgb},0.45), transparent 65%), radial-gradient(260px 200px at -10% -10%, rgba(255,255,255,0.07), transparent 65%)`,
        }}
      />
      {content}
    </Link>
  );
}

export function PromoBanner() {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [active, setActive] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const userInteractingRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const activeSourceRef = useRef<"user" | "auto">("auto");

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setTrackWidth(track.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get<
          | { results?: PromotionDTO[] }
          | PromotionDTO[]
        >(`${API_BASE_URL}/cards/promotions/`);
        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        const mapped = rows
          .map((dto, i) => dtoToSlide(dto, i))
          .filter((s): s is Slide => s !== null);
        if (!cancelled && mapped.length > 0) {
          setSlides(mapped);
          setActive(0);
        }
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => {
      if (userInteractingRef.current) return;
      if (Date.now() < pauseUntilRef.current) return;
      setActive((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    if (activeSourceRef.current === "user") {
      activeSourceRef.current = "auto";
      return;
    }
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[active] as HTMLElement | undefined;
    if (child) {
      // start-snap: scroll so slide left edge aligns with track left padding
      const left = child.offsetLeft - track.offsetLeft - TRACK_PADDING_X;
      track.scrollTo({ left, behavior: "smooth" });
    }
  }, [active]);

  const scrollRafRef = useRef<number | null>(null);
  const handleScroll = () => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const track = trackRef.current;
      if (!track) return;
      const children = Array.from(track.children) as HTMLElement[];
      // find which slide left edge is closest to the snapped position
      const snapLeft = track.scrollLeft + TRACK_PADDING_X;
      let closest = 0;
      let minDelta = Infinity;
      children.forEach((c, i) => {
        const slideLeft = c.offsetLeft - track.offsetLeft;
        const delta = Math.abs(slideLeft - snapLeft);
        if (delta < minDelta) {
          minDelta = delta;
          closest = i;
        }
      });
      if (closest !== active) {
        activeSourceRef.current = "user";
        setActive(closest);
      }
      pauseUntilRef.current = Date.now() + 5000;
    });
  };

  // Desktop: show 1.5 slides; mobile: show 1 slide full-width
  const slideWidth = trackWidth > 0
    ? isDesktop
      ? `${Math.round((trackWidth - TRACK_PADDING_X * 2 - SLIDE_GAP) / 1.5)}px`
      : `${trackWidth - TRACK_PADDING_X * 2}px`
    : isDesktop
      ? `calc((100vw - ${TRACK_PADDING_X * 2 + SLIDE_GAP}px) / 1.5)`
      : `calc(100vw - ${TRACK_PADDING_X * 2}px)`;

  // Single banner: render centered at full width, no carousel chrome
  if (slides.length === 1) {
    return (
      <section aria-label="Акции и преимущества" style={{ marginTop: 12 }}>
        <div style={{ padding: `0 ${TRACK_PADDING_X}px` }}>
          <SlideInner s={slides[0]} isDesktop={isDesktop} />
        </div>
      </section>
    );
  }

  // Unified scrollable carousel for both mobile and desktop
  return (
    <section
      aria-label="Акции и преимущества"
      style={{ marginTop: 12 }}
      onTouchStart={() => {
        userInteractingRef.current = true;
      }}
      onTouchEnd={() => {
        userInteractingRef.current = false;
        pauseUntilRef.current = Date.now() + 5000;
      }}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        style={{
          display: "flex",
          gap: SLIDE_GAP,
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          padding: `0 ${TRACK_PADDING_X}px 4px`,
          scrollbarWidth: "none",
        }}
      >
        {slides.map((s) => (
          <div
            key={s.key}
            style={{
              flex: "0 0 auto",
              width: slideWidth,
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <SlideInner s={s} isDesktop={isDesktop} />
          </div>
        ))}
      </div>

      <div
        role="tablist"
        aria-label="Слайды"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
          marginTop: 12,
        }}
      >
        {slides.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Слайд ${i + 1}`}
              onClick={() => {
                setActive(i);
                pauseUntilRef.current = Date.now() + 5000;
              }}
              style={{
                width: isActive ? 18 : 6,
                height: 2,
                padding: 0,
                borderRadius: 999,
                border: "none",
                background: isActive
                  ? "var(--home-text-primary)"
                  : "rgba(255,255,255,0.22)",
                cursor: "pointer",
                transition: "width 280ms cubic-bezier(0.4,0,0.2,1), background 280ms ease",
              }}
            />
          );
        })}
      </div>
    </section>
  );
}

export default PromoBanner;
