"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bell, BellOff, Building2 } from "lucide-react";
import Image from "next/image";
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
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.06)",
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
        {/* Header skeleton */}
        <div style={{
          height: 220,
          background: "linear-gradient(160deg, #1A1835 0%, #111022 100%)",
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 16px" }}>
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
      <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: 15 }}>
          {error || "Жилой комплекс не найден"}
        </div>
      </div>
    );
  }

  const count = currentDeveloper.cards?.length ?? 0;
  const subscribed = currentDeveloper.is_subscribed;

  return (
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>

      {/* ── Hero header ── */}
      <div style={{
        background: "linear-gradient(160deg, #1A1835 0%, #151228 55%, var(--bg-primary) 100%)",
        position: "relative",
        overflow: "hidden",
        paddingBottom: 40,
      }}>
        {/* Decorative glow */}
        <div aria-hidden style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,117,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Back button */}
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "16px 16px 0" }}>
          <button
            onClick={() => router.back()}
            style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "8px 14px 8px 10px", borderRadius: 20,
              background: "rgba(255,255,255,0.07)", border: "none",
              color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
          >
            <ArrowLeft size={15} />
            Все комплексы
          </button>
        </div>

        {/* Developer info */}
        <div style={{
          maxWidth: 1300, margin: "0 auto", padding: "28px 16px 0",
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", gap: 16,
        }}>
          {/* Logo */}
          <div style={{
            width: 96, height: 96, borderRadius: 20,
            background: "#FFFFFF",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", padding: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          }}>
            {currentDeveloper.logo ? (
              <Image src={currentDeveloper.logo} alt={currentDeveloper.name} width={76} height={76} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
            ) : (
              <Building2 size={40} color="#888" strokeWidth={1.5} />
            )}
          </div>

          {/* Name */}
          <div>
            <h1 style={{
              margin: 0,
              fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
              fontSize: "clamp(22px, 4vw, 36px)",
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}>
              {currentDeveloper.name}
            </h1>
            {count > 0 && (
              <p style={{
                margin: "6px 0 0",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 14, color: "rgba(255,255,255,0.35)",
              }}>
                {count} {objectsWord(count)}
              </p>
            )}
          </div>

          {/* Subscribe button */}
          <button
            onClick={handleSubscribe}
            disabled={subLoading}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "11px 22px", borderRadius: 14,
              cursor: subLoading ? "not-allowed" : "pointer",
              opacity: subLoading ? 0.6 : 1,
              fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
              fontSize: 14,
              background: subscribed ? "rgba(255,255,255,0.08)" : "#0075FF",
              color: subscribed ? "rgba(255,255,255,0.7)" : "#FFFFFF",
              border: subscribed ? "1px solid rgba(255,255,255,0.12)" : "none",
              transition: "all 0.2s",
            }}
          >
            {subscribed ? <BellOff size={15} /> : <Bell size={15} />}
            {subscribed ? "Отписаться" : "Подписаться на ЖК"}
          </button>
        </div>
      </div>

      {/* ── Listings ── */}
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 16px 80px" }}>
        {count > 0 ? (
          <>
            <h2 style={{
              margin: "0 0 16px",
              fontFamily: "var(--font-stetica-bold), system-ui, sans-serif",
              fontSize: 20, color: "#FFFFFF", letterSpacing: "-0.01em",
              padding: "0 16px",
            }}>
              Объекты
            </h2>
            <div className="dev-cards-grid">
              {currentDeveloper.cards.map((card) => (
                <PropertyCard key={card.id} card={card} />
              ))}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "rgba(255,255,255,0.02)", borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <Building2 size={40} color="rgba(255,255,255,0.15)" strokeWidth={1.5} style={{ margin: "0 auto 16px" }} />
            <p style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: 15, color: "rgba(255,255,255,0.3)", margin: 0 }}>
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
