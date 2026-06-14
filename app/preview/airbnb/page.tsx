"use client";

import Image from "next/image";
import { Nunito } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";

// Friendly, warm sans-serif for the consumer feel
const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// ---------- Design tokens (local to this isolated page) ----------
const colors = {
  bg: "#FFFFFF",
  text: "#222222",
  textSecondary: "#717171",
  textMuted: "#B0B0B0",
  accent: "#FF385C",
  accentGradient:
    "linear-gradient(135deg, #E61E4D 0%, #E31C5F 50%, #BD1E59 100%)",
  border: "#EBEBEB",
  borderStrong: "#DDDDDD",
  surfaceHover: "#F7F7F7",
  success: "#008489",
};

// ---------- Types ----------
type Property = {
  id: number;
  location: string;
  distance: string;
  dates: string;
  price: number;
  rating: number;
  photo: string;
  guestFavorite?: boolean;
};

// ---------- Mock data ----------
const PROPERTIES: Property[] = [
  {
    id: 1,
    location: "Malibu, California",
    distance: "2 hours drive away",
    dates: "Nov 15-20",
    price: 450,
    rating: 4.92,
    photo:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    guestFavorite: true,
  },
  {
    id: 2,
    location: "Aspen, Colorado",
    distance: "4 hours flight away",
    dates: "Dec 1-7",
    price: 685,
    rating: 4.98,
    photo:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    guestFavorite: true,
  },
  {
    id: 3,
    location: "Lake Tahoe, CA",
    distance: "3 hours drive away",
    dates: "Nov 22-27",
    price: 325,
    rating: 4.85,
    photo:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  },
  {
    id: 4,
    location: "Miami Beach, FL",
    distance: "5 hours flight away",
    dates: "Jan 10-15",
    price: 520,
    rating: 4.79,
    photo:
      "https://images.unsplash.com/photo-1613553497126-a44624272024?w=800&q=80",
    guestFavorite: true,
  },
  {
    id: 5,
    location: "Hawaii, Big Island",
    distance: "11 hours flight away",
    dates: "Feb 3-10",
    price: 820,
    rating: 5.0,
    photo:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    guestFavorite: true,
  },
  {
    id: 6,
    location: "New York, NY",
    distance: "6 hours flight away",
    dates: "Dec 12-16",
    price: 395,
    rating: 4.76,
    photo:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  },
  {
    id: 7,
    location: "Austin, TX",
    distance: "3 hours flight away",
    dates: "Nov 28-Dec 2",
    price: 210,
    rating: 4.88,
    photo:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
  },
  {
    id: 8,
    location: "Seattle, WA",
    distance: "2 hours flight away",
    dates: "Dec 8-13",
    price: 275,
    rating: 4.82,
    photo:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    guestFavorite: true,
  },
  {
    id: 9,
    location: "Portland, OR",
    distance: "2 hours flight away",
    dates: "Nov 17-22",
    price: 185,
    rating: 4.75,
    photo:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  },
  {
    id: 10,
    location: "Savannah, GA",
    distance: "4 hours flight away",
    dates: "Dec 20-26",
    price: 245,
    rating: 4.9,
    photo:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  },
  {
    id: 11,
    location: "Napa Valley, CA",
    distance: "2 hours drive away",
    dates: "Jan 5-9",
    price: 610,
    rating: 4.95,
    photo:
      "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&q=80",
    guestFavorite: true,
  },
  {
    id: 12,
    location: "Charleston, SC",
    distance: "5 hours flight away",
    dates: "Feb 14-19",
    price: 125,
    rating: 4.81,
    photo:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  },
];

const CATEGORIES = [
  { icon: "🏠", label: "Houses" },
  { icon: "🏢", label: "Apartments" },
  { icon: "🏖️", label: "Beachfront" },
  { icon: "🏔️", label: "Countryside" },
  { icon: "🏙️", label: "City" },
  { icon: "🌴", label: "Tropical" },
  { icon: "🧊", label: "Arctic" },
  { icon: "🛖", label: "Cabins" },
  { icon: "🏡", label: "Mansions" },
  { icon: "🏰", label: "Castles" },
  { icon: "🎡", label: "Amusement" },
  { icon: "⛺", label: "Camping" },
  { icon: "🛥️", label: "Boats" },
  { icon: "🎿", label: "Ski" },
];

// ---------- Icons (inline SVG) ----------
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="24"
      height="24"
      style={{
        display: "block",
        fill: filled ? colors.accent : "rgba(0,0,0,0.5)",
        stroke: "#FFFFFF",
        strokeWidth: 2,
        overflow: "visible",
      }}
      aria-hidden="true"
    >
      <path d="M16 28c7-4.733 14-10 14-17a6.98 6.98 0 00-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a7 7 0 00-9.9 9.9C6.22 19.33 9 22 16 28z" />
    </svg>
  );
}

function SearchIcon({ color = "#FFFFFF", size = 12 }: { color?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      style={{ display: "block", fill: "none", stroke: color, strokeWidth: 4, strokeLinecap: "round" }}
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="9" />
      <path d="M27 27l-6-6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" style={{ fill: "currentColor" }} aria-hidden="true">
      <path d="M8 .25a7.77 7.77 0 017.75 7.78 7.75 7.75 0 01-7.52 7.72h-.25A7.75 7.75 0 01.25 8.25v-.25A7.75 7.75 0 018 .25zm1.95 8.5H6.05c.15 2.31.95 4.41 1.95 5.53.9-1 1.63-2.8 1.88-4.88l.02-.16zm4.28 0H11.5c-.15 2.19-.78 4.12-1.7 5.36 2.44-.65 4.3-2.72 4.42-5.2v-.16zM4.5 8.75H1.77c.12 2.48 1.98 4.55 4.43 5.2-.87-1.17-1.48-2.96-1.66-5Zm1.55-6.1l-.15.04c-2.35.7-4.1 2.73-4.13 5.2V8h2.73c.15-3.82 1.62-5.28 1.55-5.21zm1.95-.1c-1 1.12-1.8 3.22-1.95 5.54h3.9c-.15-2.32-.95-4.42-1.95-5.54zm2 .14l.1.12c.89 1.22 1.48 3.1 1.63 5.14h2.73l-.02-.24c-.19-2.4-1.96-4.34-4.27-4.97z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" style={{ fill: "currentColor" }} aria-hidden="true">
      <path d="M2 4h12a1 1 0 000-2H2a1 1 0 000 2zm12 3H2a1 1 0 000 2h12a1 1 0 000-2zm0 5H2a1 1 0 000 2h12a1 1 0 000-2z" />
    </svg>
  );
}

function UserAvatarIcon() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" style={{ fill: "#717171" }} aria-hidden="true">
      <path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 28c-4.02 0-7.61-1.85-9.98-4.75.9-1.88 3.22-3.04 5.9-3.81 1.42 1.02 2.91 1.62 4.08 1.62s2.66-.6 4.08-1.62c2.68.77 5 1.93 5.9 3.81A12.7 12.7 0 0116 28.7zm-5.35-12.35c0-3.85 1.7-5.35 5.35-5.35s5.35 1.5 5.35 5.35c0 3.58-2.42 6.55-5.35 6.55s-5.35-2.97-5.35-6.55z" />
    </svg>
  );
}

function FiltersIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" style={{ fill: "currentColor" }} aria-hidden="true">
      <path d="M5 8c1.3 0 2.4.84 2.82 2H14v2H7.82A3 3 0 1 1 5 8zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6-8a3 3 0 0 1 2.82 2H14v2h-.18A3 3 0 1 1 11 2zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM5 2v2H2V2h3zm6 6v2H2V8h9z" />
    </svg>
  );
}

function StarIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} style={{ fill: "currentColor" }} aria-hidden="true">
      <path d="M15.1 1.58l-4.13 8.88-9.86 1.27a1 1 0 0 0-.54 1.74l7.3 6.57-1.97 9.85a1 1 0 0 0 1.48 1.06L16 25.88l8.62 4.07a1 1 0 0 0 1.48-1.06l-1.97-9.85 7.3-6.57a1 1 0 0 0-.54-1.74l-9.86-1.27-4.13-8.88a1 1 0 0 0-1.8 0z" />
    </svg>
  );
}

function ChevronIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 18 18"
      width="12"
      height="12"
      style={{
        fill: "none",
        stroke: "#222",
        strokeWidth: 3,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        transform: direction === "left" ? "rotate(180deg)" : undefined,
      }}
      aria-hidden="true"
    >
      <path d="M6 3l6 6-6 6" />
    </svg>
  );
}

function HouseLogoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
      <path
        d="M12 3.2l9 7.6v10.4a1.2 1.2 0 01-1.2 1.2h-4.4v-6.8h-6.8V22.4H4.2A1.2 1.2 0 013 21.2V10.8L12 3.2z"
        fill={colors.accent}
      />
      <circle cx="12" cy="12.8" r="1.8" fill="#fff" />
    </svg>
  );
}

// ---------- Property Card ----------
function PropertyCard({ property }: { property: Property }) {
  const [liked, setLiked] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const dotsCount = 5;

  return (
    <div style={{ cursor: "pointer" }} className="group">
      {/* Photo */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: "#F0F0F0",
        }}
      >
        <Image
          src={property.photo}
          alt={property.location}
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          style={{ objectFit: "cover" }}
        />

        {/* Guest favorite badge */}
        {property.guestFavorite && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: "#FFFFFF",
              color: colors.text,
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: 999,
              boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
              letterSpacing: 0.2,
            }}
          >
            Guest favorite
          </div>
        )}

        {/* Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLiked((v) => !v);
          }}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            border: "none",
            padding: 4,
            cursor: "pointer",
            transition: "transform 0.15s ease",
          }}
          className="hover:scale-110"
        >
          <HeartIcon filled={liked} />
        </button>

        {/* Swipe dots */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
          }}
        >
          {Array.from({ length: dotsCount }).map((_, i) => {
            const isActive = i === activeDot;
            return (
              <span
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDot(i);
                }}
                style={{
                  display: "inline-block",
                  width: isActive ? 7 : 6,
                  height: isActive ? 7 : 6,
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  opacity: isActive ? 1 : 0.6,
                  boxShadow: "0 0 2px rgba(0,0,0,0.25)",
                  transition: "all 0.15s ease",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Text */}
      <div style={{ marginTop: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
            {property.location}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 14,
              color: colors.text,
              fontWeight: 500,
            }}
          >
            <StarIcon size={12} />
            {property.rating.toFixed(2)}
          </span>
        </div>
        <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
          {property.distance}
        </div>
        <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
          {property.dates}
        </div>
        <div style={{ fontSize: 15, color: colors.text, marginTop: 6 }}>
          <span style={{ fontWeight: 600, textDecoration: "underline" }}>
            ${property.price}
          </span>
          <span style={{ color: colors.text }}> night</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Category Row ----------
function CategoryRow({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (i: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 400, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Left arrow */}
      {canScrollLeft && (
        <>
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 60,
              background:
                "linear-gradient(to right, #FFFFFF 30%, rgba(255,255,255,0))",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll categories left"
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#FFFFFF",
              border: `1px solid ${colors.borderStrong}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 2,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <ChevronIcon direction="left" />
          </button>
        </>
      )}

      {/* Scroll row */}
      <div
        ref={scrollerRef}
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 32,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          padding: "8px 4px 0",
        }}
        className="no-scrollbar"
      >
        {CATEGORIES.map((cat, i) => {
          const isActive = i === active;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() => onSelect(i)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "8px 0 12px",
                minWidth: 64,
                scrollSnapAlign: "start",
                color: isActive ? colors.text : colors.textSecondary,
                opacity: isActive ? 1 : 0.75,
                borderBottom: isActive
                  ? `2px solid ${colors.text}`
                  : "2px solid transparent",
                transition: "opacity 0.15s ease, color 0.15s ease, border-color 0.15s ease",
                whiteSpace: "nowrap",
              }}
              className="hover:opacity-100 hover:text-[#222]"
            >
              <span style={{ fontSize: 24, lineHeight: "24px" }}>{cat.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <>
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 60,
              background:
                "linear-gradient(to left, #FFFFFF 30%, rgba(255,255,255,0))",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll categories right"
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#FFFFFF",
              border: `1px solid ${colors.borderStrong}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 2,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            }}
          >
            <ChevronIcon direction="right" />
          </button>
        </>
      )}
    </div>
  );
}

// ---------- Header ----------
function SearchPill() {
  return (
    <div
      role="search"
      style={{
        display: "flex",
        alignItems: "center",
        height: 48,
        borderRadius: 999,
        border: `1px solid ${colors.borderStrong}`,
        background: "#FFFFFF",
        boxShadow: "0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease",
      }}
      className="hover:shadow-lg"
    >
      <div style={pillSection()}>
        <span style={pillLabel()}>Anywhere</span>
      </div>
      <div style={pillDivider()} />
      <div style={pillSection()}>
        <span style={pillLabel()}>Any week</span>
      </div>
      <div style={pillDivider()} />
      <div style={pillSection()}>
        <span style={pillLabel()}>Any type</span>
      </div>
      <div style={pillDivider()} />
      <div style={{ ...pillSection(), paddingRight: 6, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ ...pillLabel(), color: colors.textSecondary, fontWeight: 400 }}>
          Add guests
        </span>
        <button
          type="button"
          aria-label="Search"
          style={{
            marginLeft: "auto",
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: colors.accentGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <SearchIcon color="#FFFFFF" size={12} />
        </button>
      </div>
    </div>
  );
}

function pillSection(): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    height: "100%",
    minWidth: 0,
    flexShrink: 1,
  };
}

function pillLabel(): React.CSSProperties {
  return {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
    whiteSpace: "nowrap",
  };
}

function pillDivider(): React.CSSProperties {
  return {
    width: 1,
    height: 22,
    background: colors.border,
    flexShrink: 0,
  };
}

function Header({
  activeCategory,
  setActiveCategory,
  showTotalBeforeTaxes,
  setShowTotalBeforeTaxes,
}: {
  activeCategory: number;
  setActiveCategory: (i: number) => void;
  showTotalBeforeTaxes: boolean;
  setShowTotalBeforeTaxes: (v: boolean) => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#FFFFFF",
        borderBottom: scrolled ? `1px solid ${colors.border}` : "1px solid transparent",
        boxShadow: scrolled ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* Top row */}
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "0 40px",
        }}
        className="airbnb-top-row"
      >
        {/* Logo */}
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: colors.accent,
            fontWeight: 700,
            fontSize: 18,
            textDecoration: "none",
            flexShrink: 0,
          }}
          aria-label="DreamHouse home"
        >
          <HouseLogoIcon />
          <span>dreamhouse</span>
        </a>

        {/* Search pill */}
        <div
          style={{
            flex: "1 1 auto",
            maxWidth: 520,
            margin: "0 auto",
          }}
        >
          <SearchPill />
        </div>

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <a
            href="#"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: colors.text,
              padding: "12px 14px",
              borderRadius: 999,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
            className="hover:bg-[#F7F7F7]"
          >
            Switch to hosting
          </a>
          <button
            type="button"
            aria-label="Choose language"
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.text,
              cursor: "pointer",
            }}
            className="hover:bg-[#F7F7F7]"
          >
            <GlobeIcon />
          </button>
          <button
            type="button"
            aria-label="Main menu"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              height: 42,
              padding: "5px 5px 5px 12px",
              borderRadius: 999,
              border: `1px solid ${colors.borderStrong}`,
              background: "#FFFFFF",
              color: colors.text,
              cursor: "pointer",
            }}
            className="hover:shadow-md"
          >
            <MenuIcon />
            <UserAvatarIcon />
          </button>
        </div>
      </div>

      {/* Second row: categories + filters */}
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 40px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            height: 80,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <CategoryRow active={activeCategory} onSelect={setActiveCategory} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 12,
                border: `1px solid ${colors.borderStrong}`,
                background: "#FFFFFF",
                color: colors.text,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              className="hover:border-black"
            >
              <FiltersIcon />
              Filters
            </button>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                borderRadius: 12,
                border: `1px solid ${colors.borderStrong}`,
                background: "#FFFFFF",
                color: colors.text,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              className="hover:border-black"
            >
              <span>Display total before taxes</span>
              <span
                role="switch"
                aria-checked={showTotalBeforeTaxes}
                onClick={() => setShowTotalBeforeTaxes(!showTotalBeforeTaxes)}
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: 32,
                  height: 18,
                  borderRadius: 999,
                  background: showTotalBeforeTaxes ? colors.text : "#D3D3D3",
                  transition: "background 0.15s ease",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: showTotalBeforeTaxes ? 16 : 2,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    transition: "left 0.15s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                />
              </span>
            </label>
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------- Footer ----------
function Footer() {
  const columns = [
    {
      title: "Support",
      links: ["Help Center", "AirCover", "Anti-discrimination", "Disability support", "Cancellation options", "Report concern"],
    },
    {
      title: "Hosting",
      links: ["DreamHouse your home", "Cover for Hosts", "Hosting resources", "Community forum", "Hosting responsibly", "Join a free class"],
    },
    {
      title: "DreamHouse",
      links: ["Newsroom", "New features", "Careers", "Investors", "Gift cards", "Emergency stays"],
    },
    {
      title: "Discover",
      links: ["Twitter", "Instagram", "Facebook", "TikTok", "YouTube", "Press inquiries"],
    },
  ];

  return (
    <footer
      style={{
        background: colors.surfaceHover,
        borderTop: `1px solid ${colors.border}`,
        marginTop: 48,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "48px 40px 0",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 32,
            paddingBottom: 32,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {columns.map((col) => (
            <div key={col.title}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                {col.title}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      style={{
                        fontSize: 14,
                        color: colors.text,
                        textDecoration: "none",
                      }}
                      className="hover:underline"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "24px 0",
            fontSize: 14,
            color: colors.text,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
            <span>© 2026 DreamHouse, Inc.</span>
            <span style={{ color: colors.textMuted }}>·</span>
            <a href="#" style={{ color: colors.text, textDecoration: "none" }} className="hover:underline">
              Terms
            </a>
            <span style={{ color: colors.textMuted }}>·</span>
            <a href="#" style={{ color: colors.text, textDecoration: "none" }} className="hover:underline">
              Sitemap
            </a>
            <span style={{ color: colors.textMuted }}>·</span>
            <a href="#" style={{ color: colors.text, textDecoration: "none" }} className="hover:underline">
              Privacy
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
              }}
              className="hover:underline"
            >
              <GlobeIcon />
              English (US)
            </button>
            <button
              type="button"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                color: colors.text,
              }}
              className="hover:underline"
            >
              $ USD
            </button>
            <div style={{ display: "flex", gap: 12, color: colors.text }}>
              <a href="#" aria-label="Facebook" style={{ color: colors.text }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.7V14h2.7v8h3.1z" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" style={{ color: colors.text }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22 5.9c-.7.3-1.5.6-2.4.7.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1a4.1 4.1 0 0 0-7 3.7C8.2 8.8 5.1 7.1 3 4.6c-.4.7-.6 1.5-.6 2.3 0 1.4.7 2.7 1.8 3.4-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.6 3.3 4-.3.1-.7.1-1.1.1-.3 0-.5 0-.8-.1.5 1.6 2 2.8 3.8 2.8-1.4 1.1-3.1 1.7-5 1.7H2a11.6 11.6 0 0 0 6.3 1.8c7.5 0 11.7-6.2 11.7-11.7v-.5C20.7 7.4 21.4 6.7 22 5.9z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" style={{ color: colors.text }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2 0 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c0 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2 0-1.8-.3-2.2-.4a3.8 3.8 0 0 1-1.4-.9 3.8 3.8 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c0-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zm0 2.2c-3.2 0-3.5 0-4.8.1-1.1 0-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.4 1-.4 2.1-.1 1.3-.1 1.6-.1 4.8s0 3.5.1 4.8c0 1.1.2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .4 2.1.4 1.3.1 1.6.1 4.8.1s3.5 0 4.8-.1c1.1 0 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.4-1 .4-2.1.1-1.3.1-1.6.1-4.8s0-3.5-.1-4.8c0-1.1-.2-1.7-.4-2.1a2.8 2.8 0 0 0-.8-1.3 2.8 2.8 0 0 0-1.3-.8c-.4-.2-1-.4-2.1-.4-1.3-.1-1.6-.1-4.8-.1zm0 3.4a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2zm0 7.6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5.8-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Page ----------
export default function AirbnbPreviewPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [showTotalBeforeTaxes, setShowTotalBeforeTaxes] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  const visible = useMemo(
    () => PROPERTIES.slice(0, visibleCount),
    [visibleCount]
  );

  return (
    <div
      className={nunito.className}
      style={{
        background: colors.bg,
        color: colors.text,
        minHeight: "100vh",
        lineHeight: 1.5,
        fontFeatureSettings: '"ss01","cv11"',
      }}
    >
      {/* scoped styles */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 1024px) {
          .airbnb-top-row,
          .airbnb-container {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
        }
        @media (max-width: 640px) {
          .airbnb-top-row,
          .airbnb-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>

      <Header
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showTotalBeforeTaxes={showTotalBeforeTaxes}
        setShowTotalBeforeTaxes={setShowTotalBeforeTaxes}
      />

      <main
        className="airbnb-container"
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "32px 40px 48px",
        }}
      >
        <PropertyGrid properties={visible} />

        {visibleCount < PROPERTIES.length ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
            <button
              type="button"
              onClick={() => setVisibleCount(PROPERTIES.length)}
              style={{
                padding: "14px 28px",
                borderRadius: 999,
                border: `1px solid ${colors.text}`,
                background: "#FFFFFF",
                color: colors.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
              className="hover:bg-[#222] hover:text-white"
            >
              Show more
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
            <button
              type="button"
              style={{
                padding: "14px 28px",
                borderRadius: 999,
                border: `1px solid ${colors.text}`,
                background: "#FFFFFF",
                color: colors.text,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
              className="hover:bg-[#222] hover:text-white"
            >
              Show more
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function PropertyGrid({ properties }: { properties: Property[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        columnGap: 24,
        rowGap: 40,
      }}
      className="airbnb-grid"
    >
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
      <style jsx>{`
        @media (max-width: 1280px) {
          .airbnb-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 768px) {
          .airbnb-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 480px) {
          .airbnb-grid {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
            row-gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
