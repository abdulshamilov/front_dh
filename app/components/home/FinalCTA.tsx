"use client";

import { LeadForm } from "@/app/components/shared/LeadForm";

// Official store listings (from the project's Deep Link config).
const APP_STORE_URL =
  "https://apps.apple.com/us/app/dream-house/id6760730166";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.dreamhouse.app";

function AppStoreButton() {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="store-btn"
      aria-label="Скачать в App Store"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 12,
        color: "#FFFFFF",
        textDecoration: "none",
        transition: "background 160ms ease, border-color 160ms ease",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontSize: 10, opacity: 0.7, fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
          Скачать в
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-manrope), system-ui, sans-serif", marginTop: 2 }}>
          App Store
        </span>
      </div>
    </a>
  );
}

function GooglePlayButton() {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="store-btn"
      aria-label="Скачать в Google Play"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: 12,
        color: "#FFFFFF",
        textDecoration: "none",
        transition: "background 160ms ease, border-color 160ms ease",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734c0-.388.22-.732.61-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.91-3.906l-3.21 3.21L14.985 8.786 18.41 6.75c.78.46.977 1.68.018 2.15l-.019.01zm-3.21-3.21L5.164 1.258 14.5 7.794l1.99-1.99L14.5 7.793l2.909-2.202z"/>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontSize: 10, opacity: 0.7, fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
          Доступно в
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-manrope), system-ui, sans-serif", marginTop: 2 }}>
          Google Play
        </span>
      </div>
    </a>
  );
}

export function FinalCTA() {
  return (
    <section
      className="final-cta-section"
      style={{
        marginTop: 48,
        marginLeft: 16,
        marginRight: 16,
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        background: "var(--home-surface)",
        border: "1px solid var(--home-border)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(600px 300px at 10% 0%, rgba(0,117,255,0.22), transparent 70%), radial-gradient(500px 250px at 90% 100%, rgba(241,17,126,0.14), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="final-cta-inner"
        style={{
          position: "relative",
          padding: "40px 32px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div>
          <h2
            className="final-cta-title"
            style={{
              margin: 0,
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 30,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--home-text-primary)",
            }}
          >
            Найди квартиру мечты
          </h2>
          <p
            style={{
              margin: "12px 0 0",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 15,
              lineHeight: 1.5,
              color: "var(--home-text-secondary)",
              maxWidth: 440,
            }}
          >
            Оставь заявку — перезвоним за 5 минут и поможем выбрать. Или
            скачай мобильное приложение и ищи сам.
          </p>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <AppStoreButton />
            <GooglePlayButton />
          </div>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: 13,
              color: "var(--home-text-secondary)",
            }}
          >
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "var(--home-success)",
                boxShadow: "0 0 10px rgba(30,237,97,0.6)",
              }}
            />
            100+ консультантов на связи
          </div>
        </div>

        <div
          className="final-cta-form"
          style={{
            padding: 24,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 18,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <LeadForm variant="card" source="home_final_cta" />
        </div>
      </div>

      <style jsx>{`
        .store-btn:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        @media (max-width: 767px) {
          .final-cta-inner {
            grid-template-columns: 1fr !important;
            padding: 28px 20px !important;
            gap: 28px !important;
          }
          .final-cta-title {
            font-size: 24px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default FinalCTA;
