import Image from "next/image";
import { Inter, JetBrains_Mono } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const tokens = {
  bg: "#08090A",
  surface: "#0F1011",
  surfaceElevated: "#18191B",
  border: "#1F2023",
  borderStrong: "#27282B",
  textPrimary: "#F4F4F5",
  textSecondary: "#A1A1AA",
  textTertiary: "#52525B",
  accent: "#5E6AD2",
  accentHover: "#7C8BFF",
  success: "#00D26A",
  warning: "#FFB020",
} as const;

const noise: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 1px, transparent 1px)",
  backgroundSize: "4px 4px",
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
type Property = {
  id: string;
  title: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  image: string;
  tag?: "NEW" | "HOT" | null;
};

const properties: Property[] = [
  {
    id: "DH-00247",
    title: "Riverside Loft",
    address: "Brooklyn, NY",
    beds: 3,
    baths: 2,
    sqft: 1820,
    price: 1_250_000,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    tag: "NEW",
  },
  {
    id: "DH-00248",
    title: "Industrial Heights",
    address: "SoMa, SF",
    beds: 4,
    baths: 3,
    sqft: 2480,
    price: 3_480_000,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    tag: null,
  },
  {
    id: "DH-00249",
    title: "Glass House 42",
    address: "Silver Lake, LA",
    beds: 5,
    baths: 4,
    sqft: 3100,
    price: 5_750_000,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    tag: "HOT",
  },
  {
    id: "DH-00250",
    title: "The Monolith",
    address: "Tribeca, NY",
    beds: 2,
    baths: 2,
    sqft: 1440,
    price: 2_190_000,
    image: "https://images.unsplash.com/photo-1613553497126-a44624272024?w=800&q=80",
    tag: null,
  },
  {
    id: "DH-00251",
    title: "Vertex Tower",
    address: "Hudson Yards, NY",
    beds: 3,
    baths: 3,
    sqft: 2120,
    price: 4_120_000,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    tag: "NEW",
  },
  {
    id: "DH-00252",
    title: "Parallel Residences",
    address: "Venice, LA",
    beds: 4,
    baths: 3,
    sqft: 2680,
    price: 3_940_000,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    tag: null,
  },
  {
    id: "DH-00253",
    title: "Prime Square",
    address: "Chelsea, NY",
    beds: 3,
    baths: 2,
    sqft: 1960,
    price: 2_860_000,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    tag: null,
  },
  {
    id: "DH-00254",
    title: "Axis Penthouse",
    address: "Nob Hill, SF",
    beds: 5,
    baths: 5,
    sqft: 4280,
    price: 8_500_000,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    tag: "HOT",
  },
  {
    id: "DH-00255",
    title: "Quantum Lofts",
    address: "Williamsburg, NY",
    beds: 2,
    baths: 2,
    sqft: 1580,
    price: 1_680_000,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    tag: null,
  },
];

// ---------------------------------------------------------------------------
// Inline icons (stroke-based, 1.5px)
// ---------------------------------------------------------------------------
type IconProps = { size?: number; color?: string; style?: CSSProperties };

const stroke = (p: IconProps) => ({
  width: p.size ?? 14,
  height: p.size ?? 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: p.color ?? "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  style: p.style,
});

const MapPinIcon = (p: IconProps) => (
  <svg {...stroke(p)}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BellIcon = (p: IconProps) => (
  <svg {...stroke(p)}>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const ChevronDownIcon = (p: IconProps) => (
  <svg {...stroke(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ArrowRightIcon = (p: IconProps) => (
  <svg {...stroke(p)}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = (p: IconProps) => (
  <svg {...stroke(p)}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const TrendUpIcon = (p: IconProps) => (
  <svg {...stroke(p)}>
    <path d="M3 17 9 11l4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

const TrendDownIcon = (p: IconProps) => (
  <svg {...stroke(p)}>
    <path d="M3 7 9 13l4-4 8 8" />
    <path d="M14 17h7v-7" />
  </svg>
);

// ---------------------------------------------------------------------------
// Local components
// ---------------------------------------------------------------------------
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        aria-hidden
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background:
            "linear-gradient(135deg, #7C8BFF 0%, #5E6AD2 45%, #2B3199 100%)",
          boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,0.12), 0 2px 8px rgba(94,106,210,0.35)",
        }}
      />
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: tokens.textPrimary,
        }}
      >
        DreamHouse
      </span>
      <span
        style={{
          fontSize: 10,
          color: tokens.textTertiary,
          padding: "2px 6px",
          border: `1px solid ${tokens.border}`,
          borderRadius: 4,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
          marginLeft: 2,
        }}
      >
        v3.2
      </span>
    </div>
  );
}

function NavLink({ label, active }: { label: string; active?: boolean }) {
  return (
    <a
      href="#"
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: active ? tokens.textPrimary : tokens.textSecondary,
        padding: "6px 10px",
        borderRadius: 6,
        textDecoration: "none",
        background: active ? tokens.surfaceElevated : "transparent",
        transition: "background 120ms ease, color 120ms ease",
      }}
      className="nav-link"
    >
      {label}
    </a>
  );
}

function KbdPill() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: tokens.surfaceElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: 6,
        fontSize: 12,
        color: tokens.textSecondary,
        fontFamily: "var(--font-mono)",
        minWidth: 200,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.textTertiary} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <span style={{ flex: 1 }}>Search…</span>
      <span
        style={{
          padding: "1px 5px",
          borderRadius: 3,
          background: tokens.bg,
          border: `1px solid ${tokens.border}`,
          fontSize: 10,
          color: tokens.textTertiary,
        }}
      >
        ⌘K
      </span>
    </div>
  );
}

function Metric({
  label,
  value,
  delta,
  trend,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
}) {
  const trendColor =
    trend === "up"
      ? tokens.success
      : trend === "down"
      ? "#FF5C62"
      : tokens.textSecondary;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 220,
        height: 96,
        background: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: 10,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          ...noise,
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: tokens.textSecondary,
          fontWeight: 500,
          position: "relative",
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: 24,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: tokens.textPrimary,
          }}
        >
          {value}
        </span>
        {delta && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              color: trendColor,
              background:
                trend === "up"
                  ? "rgba(0,210,106,0.1)"
                  : trend === "down"
                  ? "rgba(255,92,98,0.1)"
                  : "rgba(161,161,170,0.08)",
              border: `1px solid ${
                trend === "up"
                  ? "rgba(0,210,106,0.2)"
                  : trend === "down"
                  ? "rgba(255,92,98,0.2)"
                  : tokens.border
              }`,
              fontFamily: "var(--font-mono)",
            }}
          >
            {trend === "up" ? (
              <TrendUpIcon size={10} color={trendColor} />
            ) : trend === "down" ? (
              <TrendDownIcon size={10} color={trendColor} />
            ) : null}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function SegmentedToggle() {
  const items = ["All", "Sale", "Rent", "New"];
  const active = "All";
  return (
    <div
      style={{
        display: "inline-flex",
        padding: 3,
        background: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: 8,
        gap: 2,
      }}
    >
      {items.map((it) => (
        <button
          key={it}
          type="button"
          style={{
            padding: "5px 12px",
            fontSize: 13,
            fontWeight: 500,
            color: it === active ? tokens.textPrimary : tokens.textSecondary,
            background: it === active ? tokens.surfaceElevated : "transparent",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            boxShadow:
              it === active
                ? `0 0 0 1px ${tokens.borderStrong}, 0 1px 0 rgba(255,255,255,0.03) inset`
                : "none",
          }}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

function FilterChip({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="chip"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        background: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: 7,
        fontSize: 13,
        fontWeight: 500,
        color: tokens.textSecondary,
        cursor: "pointer",
        transition: "background 120ms ease, border-color 120ms ease, color 120ms ease",
      }}
    >
      {children}
      <ChevronDownIcon size={12} color={tokens.textTertiary} />
    </button>
  );
}

function SortDropdown() {
  return (
    <button
      type="button"
      className="chip"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: 7,
        fontSize: 13,
        fontWeight: 500,
        color: tokens.textSecondary,
        cursor: "pointer",
      }}
    >
      <span style={{ color: tokens.textTertiary }}>Sort:</span>
      <span style={{ color: tokens.textPrimary }}>Newest</span>
      <ChevronDownIcon size={12} color={tokens.textTertiary} />
    </button>
  );
}

function StatusPill({ tag }: { tag: "NEW" | "HOT" }) {
  const isHot = tag === "HOT";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 7px",
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: isHot ? "#FFB020" : tokens.success,
        background: isHot ? "rgba(255,176,32,0.1)" : "rgba(0,210,106,0.1)",
        border: `1px solid ${
          isHot ? "rgba(255,176,32,0.25)" : "rgba(0,210,106,0.25)"
        }`,
        fontFamily: "var(--font-mono)",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: isHot ? "#FFB020" : tokens.success,
          boxShadow: `0 0 6px ${isHot ? "#FFB020" : tokens.success}`,
        }}
      />
      {tag}
    </span>
  );
}

function formatPrice(n: number) {
  return "$" + n.toLocaleString("en-US");
}

function PropertyCard({ p }: { p: Property }) {
  return (
    <article
      className="card"
      style={{
        background: tokens.surface,
        border: `1px solid ${tokens.border}`,
        borderRadius: 10,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition:
          "border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 10",
          background: tokens.surfaceElevated,
        }}
      >
        <Image
          src={p.image}
          alt={p.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(8,9,10,0) 55%, rgba(8,9,10,0.6) 100%)",
          }}
        />
        {/* ID pill */}
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: "3px 7px",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: tokens.textSecondary,
            background: "rgba(15,16,17,0.75)",
            border: `1px solid ${tokens.border}`,
            borderRadius: 5,
            backdropFilter: "blur(8px)",
          }}
        >
          #{p.id}
        </div>
        {p.tag && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <StatusPill tag={p.tag} />
          </div>
        )}
      </div>

      <div
        style={{
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: tokens.textPrimary,
            }}
          >
            {p.title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: tokens.textSecondary,
            }}
          >
            <MapPinIcon size={12} color={tokens.textTertiary} />
            <span>{p.address}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12,
            color: tokens.textSecondary,
            fontFamily: "var(--font-mono)",
            paddingTop: 10,
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          <span>{p.beds} bd</span>
          <span style={{ color: tokens.textTertiary }}>·</span>
          <span>{p.baths} ba</span>
          <span style={{ color: tokens.textTertiary }}>·</span>
          <span>{p.sqft.toLocaleString("en-US")} sqft</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: tokens.accent,
            }}
          >
            {formatPrice(p.price)}
          </span>
          <a
            href="#"
            className="details-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 500,
              color: tokens.textSecondary,
              textDecoration: "none",
            }}
          >
            View details
            <ArrowRightIcon size={12} />
          </a>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LinearPreviewPage() {
  return (
    <div
      className={`${inter.variable} ${jetbrains.variable}`}
      style={{
        minHeight: "100vh",
        background: tokens.bg,
        color: tokens.textPrimary,
        fontFamily: "var(--font-inter), system-ui, -apple-system, sans-serif",
        fontSize: 14,
        lineHeight: 1.5,
        letterSpacing: "-0.005em",
        position: "relative",
      }}
    >
      {/* Global page styles for hover states */}
      <style>{`
        .nav-link:hover { background: ${tokens.surfaceElevated} !important; color: ${tokens.textPrimary} !important; }
        .chip:hover { background: ${tokens.surfaceElevated} !important; border-color: ${tokens.borderStrong} !important; color: ${tokens.textPrimary} !important; }
        .card:hover {
          border-color: ${tokens.borderStrong} !important;
          box-shadow: 0 0 0 1px rgba(94,106,210,0.18), 0 8px 32px rgba(0,0,0,0.4);
          transform: translateY(-1px);
        }
        .details-link:hover { color: ${tokens.textPrimary} !important; }
        .pg-btn:hover { background: ${tokens.surfaceElevated} !important; color: ${tokens.textPrimary} !important; border-color: ${tokens.borderStrong} !important; }
        .hero-grad {
          background:
            radial-gradient(1200px 400px at 20% -10%, rgba(94,106,210,0.12), transparent 60%),
            radial-gradient(800px 300px at 85% 0%, rgba(124,139,255,0.06), transparent 70%);
        }
        .grid-cards {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        @media (max-width: 1024px) {
          .grid-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .grid-cards { grid-template-columns: 1fr; }
          .metrics-row { flex-wrap: wrap; }
          .hero-title { font-size: 28px !important; }
          .nav-hide { display: none !important; }
          .kbd-hide { display: none !important; }
        }
        @media (max-width: 820px) {
          .nav-hide { display: none !important; }
        }
      `}</style>

      {/* Global noise overlay */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          ...noise,
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ------------------------------ Header ------------------------------ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          height: 56,
          background: "rgba(8, 9, 10, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <Logo />
            <nav
              className="nav-hide"
              style={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <NavLink label="Dashboard" />
              <NavLink label="Properties" active />
              <NavLink label="Saved" />
              <NavLink label="Settings" />
            </nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="kbd-hide">
              <KbdPill />
            </div>
            <button
              type="button"
              aria-label="Notifications"
              style={{
                position: "relative",
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "transparent",
                border: `1px solid ${tokens.border}`,
                color: tokens.textSecondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              className="chip"
            >
              <BellIcon size={14} />
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: tokens.accent,
                  boxShadow: `0 0 6px ${tokens.accent}`,
                }}
              />
            </button>
            <div
              aria-label="User avatar"
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #7C8BFF 0%, #5E6AD2 50%, #2B3199 100%)",
                border: `1px solid ${tokens.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "#fff",
                letterSpacing: "0.02em",
              }}
            >
              RK
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------ Hero ------------------------------ */}
      <section
        className="hero-grad"
        style={{ position: "relative", zIndex: 1, paddingTop: 56, paddingBottom: 32 }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: tokens.textTertiary,
              fontWeight: 500,
              marginBottom: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: 999,
                background: tokens.accent,
                boxShadow: `0 0 8px ${tokens.accent}`,
              }}
            />
            Overview
          </div>
          <h1
            className="hero-title"
            style={{
              margin: 0,
              fontSize: 40,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: tokens.textPrimary,
              maxWidth: 760,
            }}
          >
            Find properties that match your criteria
          </h1>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: 16,
              color: tokens.textSecondary,
              maxWidth: 620,
              lineHeight: 1.55,
            }}
          >
            Real-time market data and intelligent search.
          </p>

          {/* Metrics */}
          <div
            className="metrics-row"
            style={{
              display: "flex",
              gap: 12,
              marginTop: 32,
            }}
          >
            <Metric
              label="Active listings"
              value="12,847"
              delta="+3.2%"
              trend="up"
            />
            <Metric
              label="Avg price / sq ft"
              value="$4,293"
              delta="-1.1%"
              trend="down"
            />
            <Metric
              label="Days on market"
              value="42"
              delta="+8d"
              trend="neutral"
            />
            <Metric label="Your saved" value="23" />
          </div>
        </div>
      </section>

      {/* ------------------------------ Filters ------------------------------ */}
      <section style={{ position: "relative", zIndex: 1, paddingTop: 32, paddingBottom: 16 }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <SegmentedToggle />
            <div
              aria-hidden
              style={{ width: 1, height: 20, background: tokens.border }}
            />
            <FilterChip>Price</FilterChip>
            <FilterChip>Bedrooms</FilterChip>
            <FilterChip>Type</FilterChip>
            <FilterChip>Area</FilterChip>
          </div>
          <SortDropdown />
        </div>
      </section>

      {/* ------------------------------ Grid ------------------------------ */}
      <section style={{ position: "relative", zIndex: 1, paddingTop: 16, paddingBottom: 64 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div className="grid-cards">
            {properties.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ Pagination bar ------------------------------ */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: `1px solid ${tokens.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "32px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: tokens.textSecondary,
            }}
          >
            Showing{" "}
            <span style={{ color: tokens.textPrimary, fontFamily: "var(--font-mono)" }}>
              9
            </span>{" "}
            of{" "}
            <span style={{ color: tokens.textPrimary, fontFamily: "var(--font-mono)" }}>
              12,847
            </span>{" "}
            properties
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              aria-label="Previous page"
              className="pg-btn"
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: tokens.surface,
                border: `1px solid ${tokens.border}`,
                borderRadius: 6,
                color: tokens.textSecondary,
                cursor: "pointer",
              }}
            >
              <ArrowLeftIcon size={14} />
            </button>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: tokens.textSecondary,
                padding: "0 10px",
              }}
            >
              Page <span style={{ color: tokens.textPrimary }}>1</span> / 1,428
            </div>
            <button
              type="button"
              aria-label="Next page"
              className="pg-btn"
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: tokens.surface,
                border: `1px solid ${tokens.border}`,
                borderRadius: 6,
                color: tokens.textSecondary,
                cursor: "pointer",
              }}
            >
              <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------ Footer ------------------------------ */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: `1px solid ${tokens.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: tokens.textTertiary,
              letterSpacing: "0.04em",
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: tokens.success,
                boxShadow: `0 0 8px ${tokens.success}`,
              }}
            />
            System operational
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: tokens.textTertiary,
              letterSpacing: "0.04em",
            }}
          >
            © 2026 DreamHouse · Built for Dagestan
          </div>
        </div>
      </footer>
    </div>
  );
}
