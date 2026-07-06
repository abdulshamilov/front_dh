"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Bell, BellOff, Building2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import {
  fetchDeveloperById,
  subscribeToDeveloper,
  unsubscribeFromDeveloper,
  clearCurrentDeveloper,
} from "@/app/shared/redux/slices/developers";
import PropertyCard from "@/app/components/home/PropertyCard";

function objectsWord(n: number): string {
  const m100 = n % 100, m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return "объектов";
  if (m10 === 1) return "объект";
  if (m10 >= 2 && m10 <= 4) return "объекта";
  return "объектов";
}

function CardSkeleton() {
  return (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      background: "var(--home-surface, #1D2024)",
    }}>
      <div style={{ aspectRatio: "5/6", background: "rgba(255,255,255,0.05)", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 14, width: "55%", borderRadius: 7, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 12, width: "80%", borderRadius: 7, background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite 0.15s" }} />
        <div style={{ height: 12, width: "45%", borderRadius: 7, background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite 0.3s" }} />
      </div>
    </div>
  );
}

function NavBar({ onBack }: { onBack: () => void }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "rgba(7,7,7,0.72)",
      WebkitBackdropFilter: "saturate(180%) blur(20px)",
      backdropFilter: "saturate(180%) blur(20px)",
      borderBottom: "0.5px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{
        maxWidth: 980, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", height: 48, padding: "0 8px",
      }}>
        <button
          onClick={onBack}
          style={{
            justifySelf: "start",
            display: "inline-flex", alignItems: "center", gap: 1,
            padding: "6px 10px 6px 2px", borderRadius: 10,
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--home-accent, #0075FF)",
            fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif",
            fontSize: 16,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <ChevronLeft size={24} strokeWidth={2.4} style={{ marginRight: -2 }} />
          Назад
        </button>
        <span />
        <span />
      </div>
    </div>
  );
}

export default function DeveloperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentDeveloper, loading, error } = useAppSelector((s) => s.developers);
  const { isAuth } = useAppSelector((s) => s.auth);
  const [subLoading, setSubLoading] = useState(false);

  const developerId = Number(params.id);

  useEffect(() => {
    if (developerId) dispatch(fetchDeveloperById(developerId));
    return () => { dispatch(clearCurrentDeveloper()); };
  }, [dispatch, developerId]);

  const handleSubscribe = async () => {
    if (!isAuth) { router.replace("/login"); return; }
    setSubLoading(true);
    try {
      if (currentDeveloper?.is_subscribed) {
        await dispatch(unsubscribeFromDeveloper(currentDeveloper.id));
      } else if (currentDeveloper) {
        await dispatch(subscribeToDeveloper(currentDeveloper.id));
      }
    } finally { setSubLoading(false); }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
        <NavBar onBack={() => router.back()} />
        <div style={{
          maxWidth: 980, margin: "0 auto", padding: "28px 16px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
        }}>
          <div style={{ height: 26, width: 200, borderRadius: 8, background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: 14, width: 110, borderRadius: 7, background: "rgba(255,255,255,0.045)", animation: "pulse 1.5s ease-in-out infinite 0.15s" }} />
        </div>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 16px" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 14,
          }}>
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentDeveloper) {
    return (
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
        <NavBar onBack={() => router.back()} />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          padding: "120px 20px 0", textAlign: "center",
        }}>
          <Building2 size={36} strokeWidth={1.5} style={{ color: "rgba(255,255,255,0.18)" }} />
          <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif", fontSize: 15 }}>
            {error || "Жилой комплекс не найден"}
          </span>
        </div>
      </div>
    );
  }

  const count = currentDeveloper.cards?.length ?? 0;
  const subscribed = currentDeveloper.is_subscribed;

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
      <NavBar onBack={() => router.back()} />

      {/* ── Profile (iOS contact style) ── */}
      <div style={{
        maxWidth: 980, margin: "0 auto", padding: "28px 16px 8px",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center", gap: 14,
      }}>
        {/* Name */}
        <div>
          <h1 style={{
            margin: 0,
            fontFamily: "var(--font-stetica-bold), -apple-system, system-ui, sans-serif",
            fontSize: "clamp(24px, 4vw, 32px)",
            color: "#FFFFFF",
            lineHeight: 1.15,
            letterSpacing: "-0.022em",
          }}>
            {currentDeveloper.name}
          </h1>
          {count > 0 && (
            <p style={{
              margin: "5px 0 0",
              fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif",
              fontSize: 14, color: "rgba(255,255,255,0.38)",
            }}>
              {count} {objectsWord(count)}
            </p>
          )}
        </div>

        {/* Subscribe — iOS tinted pill */}
        <button
          onClick={handleSubscribe}
          disabled={subLoading}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 20px", borderRadius: 100,
            cursor: subLoading ? "not-allowed" : "pointer",
            opacity: subLoading ? 0.55 : 1,
            fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif",
            fontSize: 15, fontWeight: 600,
            background: subscribed ? "rgba(255,255,255,0.08)" : "var(--home-accent-soft, rgba(0,117,255,0.14))",
            color: subscribed ? "rgba(255,255,255,0.6)" : "var(--home-accent, #0075FF)",
            border: "none",
            transition: "background 160ms ease, color 160ms ease, opacity 160ms ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {subscribed ? <BellOff size={16} strokeWidth={2.2} /> : <Bell size={16} strokeWidth={2.2} />}
          {subscribed ? "Отписаться" : "Подписаться"}
        </button>
      </div>

      {/* ── Listings ── */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px 80px" }}>
        {count > 0 ? (
          <>
            <p style={{
              margin: "0 0 8px",
              padding: "0 16px",
              fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "rgba(255,255,255,0.35)",
            }}>
              Объекты
            </p>
            <div className="dev-cards-grid">
              {currentDeveloper.cards.map((card) => (
                <PropertyCard key={card.id} card={card} />
              ))}
            </div>
          </>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            textAlign: "center", padding: "56px 20px",
            background: "var(--home-surface, #1D2024)", borderRadius: 16,
          }}>
            <Building2 size={36} color="rgba(255,255,255,0.18)" strokeWidth={1.5} />
            <p style={{ fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif", fontSize: 15, color: "rgba(255,255,255,0.3)", margin: 0 }}>
              Объектов пока нет
            </p>
          </div>
        )}

        <style jsx>{`
          .dev-cards-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            column-gap: 16px;
            row-gap: 16px;
            padding: 0 16px;
          }
          @media (max-width: 1023px) {
            .dev-cards-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              column-gap: 4px;
              row-gap: 6px;
              padding: 0;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
