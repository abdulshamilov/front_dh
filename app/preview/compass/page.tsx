import type { Metadata } from "next";
import Image from "next/image";
import { Playfair_Display, Inter } from "next/font/google";

// Font setup — Playfair for headlines, Inter for body
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Dream House — Premium Real Estate",
  description:
    "Discover exceptional properties in the world's most desirable locations.",
};

// ---------- Design tokens (local, isolated) ----------
const tokens = {
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  textPrimary: "#1C1C1C",
  textSecondary: "#6B6B6B",
  accent: "#1A3A52",
  mutedAccent: "#A08E6C",
  divider: "#E8E5DE",
  price: "#1A3A52",
};

// ---------- Mock data ----------
type Listing = {
  id: string;
  image: string;
  label: "FOR SALE" | "NEW LISTING" | "EXCLUSIVE" | "PRIVATE OFFERING";
  name: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
};

const listings: Listing[] = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    label: "FOR SALE",
    name: "The Oakwood Residence",
    location: "Beverly Hills, CA",
    price: "$4,250,000",
    beds: 5,
    baths: 6,
    sqft: 6200,
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    label: "NEW LISTING",
    name: "Malibu Cliffside",
    location: "Malibu, CA",
    price: "$12,500,000",
    beds: 7,
    baths: 9,
    sqft: 9800,
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
    label: "EXCLUSIVE",
    name: "Sunset Boulevard Estate",
    location: "West Hollywood, CA",
    price: "$6,950,000",
    beds: 6,
    baths: 7,
    sqft: 7400,
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1613553497126-a44624272024?w=1200&q=80",
    label: "FOR SALE",
    name: "The Pemberton",
    location: "Bel Air, CA",
    price: "$8,800,000",
    beds: 6,
    baths: 8,
    sqft: 8100,
  },
  {
    id: "5",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    label: "NEW LISTING",
    name: "Hillcrest Manor",
    location: "Pacific Palisades, CA",
    price: "$5,475,000",
    beds: 5,
    baths: 6,
    sqft: 6700,
  },
  {
    id: "6",
    image:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    label: "PRIVATE OFFERING",
    name: "Ocean View Villa",
    location: "Manhattan Beach, CA",
    price: "$3,625,000",
    beds: 4,
    baths: 5,
    sqft: 4800,
  },
  {
    id: "7",
    image:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    label: "FOR SALE",
    name: "The Sterling",
    location: "Santa Monica, CA",
    price: "$2,800,000",
    beds: 3,
    baths: 4,
    sqft: 3600,
  },
  {
    id: "8",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    label: "EXCLUSIVE",
    name: "Crestwood Heights",
    location: "Brentwood, CA",
    price: "$7,250,000",
    beds: 6,
    baths: 7,
    sqft: 7900,
  },
];

// ---------- Local components ----------

function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 80,
        background: "rgba(250, 250, 247, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${tokens.divider}`,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 clamp(24px, 4vw, 64px)",
        }}
      >
        <div
          className="font-['Playfair_Display']"
          style={{
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: tokens.textPrimary,
          }}
        >
          Dream House
        </div>

        <nav
          className="hidden md:flex font-['Inter']"
          style={{
            gap: 36,
            fontSize: 14,
            fontWeight: 500,
            color: tokens.textPrimary,
          }}
        >
          {["Buy", "Sell", "Rent", "Insights", "Agents"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                color: tokens.textPrimary,
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              className="hover:!text-[#1A3A52]"
            >
              {item}
            </a>
          ))}
        </nav>

        <div
          className="font-['Inter']"
          style={{ display: "flex", alignItems: "center", gap: 16 }}
        >
          <a
            href="#"
            className="hidden sm:inline"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: tokens.textPrimary,
              textDecoration: "none",
            }}
          >
            Sign In
          </a>
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 42,
              padding: "0 22px",
              background: tokens.textPrimary,
              color: tokens.bg,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.03em",
              textDecoration: "none",
              borderRadius: 2,
              transition: "background 0.25s ease",
            }}
            className="hover:!bg-[#1A3A52]"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "70vh",
        minHeight: 560,
        overflow: "hidden",
      }}
    >
      <Image
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2400&q=90"
        alt="Featured luxury home exterior"
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover" }}
      />

      {/* Dark gradient from bottom */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 70%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 clamp(24px, 4vw, 64px) 72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <div
            className="font-['Inter']"
            style={{
              display: "inline-block",
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)",
              marginBottom: 20,
              fontWeight: 500,
            }}
          >
            ● Curated since 2011
          </div>

          <h1
            className="font-['Playfair_Display']"
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              lineHeight: 1.05,
              color: "#FFFFFF",
              fontWeight: 400,
              letterSpacing: "-0.01em",
              margin: 0,
              marginBottom: 20,
            }}
          >
            Your dream home <em style={{ fontStyle: "italic" }}>awaits</em>
          </h1>

          <p
            className="font-['Inter']"
            style={{
              fontSize: "clamp(15px, 1.3vw, 18px)",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.88)",
              maxWidth: 560,
              margin: 0,
              fontWeight: 400,
            }}
          >
            Discover exceptional properties in the world&apos;s most desirable
            locations.
          </p>
        </div>

        {/* Search pill */}
        <div
          className="font-['Inter']"
          style={{
            marginTop: 48,
            background: "#FFFFFF",
            borderRadius: 999,
            height: 72,
            maxWidth: 720,
            display: "flex",
            alignItems: "center",
            padding: "8px 8px 8px 28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={tokens.textSecondary}
            strokeWidth="1.8"
            style={{ flexShrink: 0, marginRight: 14 }}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by city, neighborhood, or ZIP"
            style={{
              flex: 1,
              height: "100%",
              border: "none",
              outline: "none",
              fontSize: 15,
              color: tokens.textPrimary,
              background: "transparent",
              fontFamily: "inherit",
            }}
          />
          <button
            type="button"
            style={{
              height: 56,
              padding: "0 32px",
              borderRadius: 999,
              background: tokens.textPrimary,
              color: tokens.bg,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.03em",
              border: "none",
              cursor: "pointer",
              transition: "background 0.25s ease",
            }}
            className="hover:!bg-[#1A3A52]"
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 56, maxWidth: 760 }}>
      {eyebrow && (
        <div
          className="font-['Inter']"
          style={{
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: tokens.mutedAccent,
            marginBottom: 18,
            fontWeight: 500,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        className="font-['Playfair_Display']"
        style={{
          fontSize: "clamp(32px, 4vw, 48px)",
          lineHeight: 1.1,
          color: tokens.textPrimary,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          margin: 0,
          marginBottom: subtitle ? 16 : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="font-['Inter']"
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: tokens.textSecondary,
            margin: 0,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function PropertyCard({ listing }: { listing: Listing }) {
  return (
    <article className="dh-card" style={{ display: "flex", flexDirection: "column" }}>
      <div
        className="dh-card-imgwrap"
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 5",
          overflow: "hidden",
          borderRadius: 4,
          background: tokens.divider,
        }}
      >
        <Image
          src={listing.image}
          alt={listing.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="dh-card-img"
          style={{ objectFit: "cover" }}
        />

        {/* Minimal favorite */}
        <button
          type="button"
          aria-label="Save property"
          className="dh-fav"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s ease, transform 0.2s ease",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={tokens.textPrimary} strokeWidth="1.6">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div style={{ paddingTop: 20 }}>
        <div
          className="font-['Inter']"
          style={{
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: tokens.mutedAccent,
            marginBottom: 10,
            fontWeight: 500,
          }}
        >
          {listing.label}
        </div>
        <h3
          className="font-['Playfair_Display']"
          style={{
            fontSize: 22,
            lineHeight: 1.2,
            color: tokens.textPrimary,
            fontWeight: 500,
            margin: 0,
            marginBottom: 4,
            letterSpacing: "-0.005em",
          }}
        >
          {listing.name}
        </h3>
        <div
          className="font-['Inter']"
          style={{
            fontSize: 14,
            color: tokens.textSecondary,
            marginBottom: 14,
            fontWeight: 400,
          }}
        >
          {listing.location}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            paddingTop: 14,
            borderTop: `1px solid ${tokens.divider}`,
          }}
        >
          <div
            className="font-['Playfair_Display']"
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: tokens.price,
              letterSpacing: "-0.01em",
            }}
          >
            {listing.price}
          </div>
          <div
            className="font-['Inter']"
            style={{
              fontSize: 13,
              color: tokens.textSecondary,
              fontWeight: 400,
              textAlign: "right",
            }}
          >
            {listing.beds} Beds · {listing.baths} Baths ·{" "}
            {listing.sqft.toLocaleString()} sqft
          </div>
        </div>
      </div>
    </article>
  );
}

function FeaturedListings() {
  return (
    <section
      style={{
        background: tokens.bg,
        padding: "clamp(80px, 10vw, 120px) 0",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 clamp(24px, 4vw, 64px)",
        }}
      >
        <SectionIntro
          eyebrow="The Collection"
          title="Featured Properties"
          subtitle="Handpicked homes from our premium collection."
        />

        <div className="dh-grid">
          {listings.map((l) => (
            <PropertyCard key={l.id} listing={l} />
          ))}
        </div>

        <div style={{ marginTop: 72, textAlign: "center" }}>
          <a
            href="#"
            className="font-['Inter']"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: tokens.textPrimary,
              textDecoration: "none",
              borderBottom: `1px solid ${tokens.textPrimary}`,
              paddingBottom: 4,
            }}
          >
            View All Properties
            <span style={{ fontSize: 16 }}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function EditorialBand() {
  return (
    <section
      style={{
        background: tokens.surface,
        padding: "clamp(80px, 10vw, 120px) 0",
        borderTop: `1px solid ${tokens.divider}`,
        borderBottom: `1px solid ${tokens.divider}`,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 clamp(24px, 4vw, 64px)",
          textAlign: "center",
        }}
      >
        <div
          className="font-['Inter']"
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: tokens.mutedAccent,
            marginBottom: 24,
            fontWeight: 500,
          }}
        >
          Our Philosophy
        </div>
        <blockquote
          className="font-['Playfair_Display']"
          style={{
            fontSize: "clamp(28px, 3.6vw, 44px)",
            lineHeight: 1.3,
            color: tokens.textPrimary,
            fontStyle: "italic",
            fontWeight: 400,
            letterSpacing: "-0.01em",
            margin: 0,
            maxWidth: 900,
            marginInline: "auto",
          }}
        >
          “A home is more than an address — it is a quiet signature of how you
          choose to live. We curate residences for those who notice the
          difference.”
        </blockquote>
        <div
          className="font-['Inter']"
          style={{
            marginTop: 32,
            fontSize: 13,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: tokens.textSecondary,
          }}
        >
          — The Dream House Editorial
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const columns: { title: string; links: string[] }[] = [
    {
      title: "Company",
      links: ["About", "Careers", "Press", "Contact"],
    },
    {
      title: "Properties",
      links: ["Buy", "Sell", "Rent", "New Developments"],
    },
    {
      title: "Agents",
      links: ["Find an Agent", "Join Us", "Agent Login", "Concierge"],
    },
    {
      title: "Legal",
      links: ["Terms", "Privacy", "Cookies", "Accessibility"],
    },
  ];

  return (
    <footer
      style={{
        background: "#1C1C1C",
        color: "#FAFAF7",
        paddingTop: 80,
        paddingBottom: 32,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 clamp(24px, 4vw, 64px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr repeat(4, 1fr)",
            gap: 48,
            paddingBottom: 72,
            borderBottom: "1px solid rgba(250,250,247,0.12)",
          }}
          className="dh-footer-grid"
        >
          <div>
            <div
              className="font-['Playfair_Display']"
              style={{
                fontWeight: 600,
                fontSize: 20,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              Dream House
            </div>
            <p
              className="font-['Inter']"
              style={{
                fontSize: 14,
                lineHeight: 1.65,
                color: "rgba(250,250,247,0.65)",
                maxWidth: 280,
                margin: 0,
              }}
            >
              A quiet brokerage for exceptional homes. Curated with taste since
              2011.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div
                className="font-['Inter']"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: tokens.mutedAccent,
                  marginBottom: 20,
                  fontWeight: 500,
                }}
              >
                {col.title}
              </div>
              <ul
                className="font-['Inter']"
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      style={{
                        fontSize: 14,
                        color: "rgba(250,250,247,0.8)",
                        textDecoration: "none",
                        transition: "color 0.2s ease",
                      }}
                      className="hover:!text-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="font-['Inter']"
          style={{
            marginTop: 32,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            color: "rgba(250,250,247,0.55)",
          }}
        >
          <div>© {new Date().getFullYear()} Dream House. All rights reserved.</div>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            {/* Instagram */}
            <a href="#" aria-label="Instagram" style={{ color: "inherit" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="#" aria-label="X" style={{ color: "inherit" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2H21l-6.52 7.45L22 22h-6.844l-5.35-6.99L3.6 22H.843l6.974-7.97L2 2h7.02l4.84 6.4L18.244 2zm-1.2 18.4h1.82L7.05 3.52H5.1L17.043 20.4z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" aria-label="LinkedIn" style={{ color: "inherit" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S.02 4.88.02 3.5 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.22 8h4.56v14H.22V8zm7.35 0h4.37v1.92h.06c.61-1.15 2.1-2.36 4.32-2.36 4.62 0 5.48 3.04 5.48 7v7.44h-4.56v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.48V22H7.57V8z" />
              </svg>
            </a>
            {/* Pinterest */}
            <a href="#" aria-label="Pinterest" style={{ color: "inherit" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-3.64 19.32c-.09-.78-.17-1.98.04-2.83.18-.77 1.19-4.9 1.19-4.9s-.3-.6-.3-1.5c0-1.4.82-2.45 1.84-2.45.87 0 1.29.65 1.29 1.43 0 .87-.55 2.17-.84 3.38-.24 1.01.5 1.83 1.5 1.83 1.8 0 3.19-1.9 3.19-4.64 0-2.43-1.75-4.13-4.24-4.13-2.89 0-4.58 2.17-4.58 4.41 0 .87.34 1.81.76 2.32.08.1.1.19.07.29-.08.33-.26 1.01-.3 1.15-.05.2-.16.24-.37.14-1.35-.63-2.2-2.61-2.2-4.2 0-3.42 2.49-6.56 7.17-6.56 3.77 0 6.69 2.68 6.69 6.27 0 3.74-2.36 6.75-5.64 6.75-1.1 0-2.13-.57-2.49-1.25l-.67 2.55c-.24.94-.9 2.11-1.34 2.83A10 10 0 1 0 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Page ----------
export default function CompassPreviewPage() {
  return (
    <div
      className={`${playfair.variable} ${inter.variable}`}
      style={{
        background: tokens.bg,
        color: tokens.textPrimary,
        minHeight: "100vh",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      {/* Scoped styles for this preview only */}
      <style>{`
        .dh-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .dh-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .dh-grid { grid-template-columns: 1fr; gap: 28px; }
        }

        .dh-card { transition: transform 0.4s ease; }
        .dh-card-img {
          transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
        }
        .dh-card:hover .dh-card-img { transform: scale(1.035); }
        .dh-card:hover .dh-card-imgwrap {
          box-shadow: 0 24px 60px rgba(28, 28, 28, 0.12);
        }
        .dh-card-imgwrap {
          transition: box-shadow 0.4s ease;
        }
        .dh-fav:hover { background: #FFFFFF; transform: scale(1.06); }

        .dh-footer-grid { }
        @media (max-width: 900px) {
          .dh-footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 40px !important;
          }
        }
        @media (max-width: 520px) {
          .dh-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Header />
      <main>
        <Hero />
        <FeaturedListings />
        <EditorialBand />
      </main>
      <Footer />
    </div>
  );
}
