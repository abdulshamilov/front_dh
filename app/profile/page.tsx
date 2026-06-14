"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import DeleteAccountModal from "@/app/components/DeleteAccountModal";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import {
  Eye, Camera, ArrowLeft, Zap, Heart, Clock,
  Gift, User, ChevronRight, LogOut,
} from "lucide-react";
import { useProfileData, useReferralData, useAccountActions } from "./hooks";
import { AccountSection, ReferralSection } from "./ui";
import PropertyCard from "@/app/components/home/PropertyCard";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchRecentViews } from "@/app/shared/redux/slices/cards";
import axiosInstance from "@/app/shared/config/axios";
import { useUpdateProfilePhotoMutation } from "@/app/shared/redux/api/auth";
import { fetchUser } from "@/app/shared/redux/slices/auth";

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSection = searchParams.get("section") || "referral";
  const dispatch = useAppDispatch();

  const { profile, setProfile, isAuth } = useProfileData();
  const { referralLink, referrals, copied, loadingReferral, handleCopyLink } =
    useReferralData(activeSection, isAuth);
  const {
    isDeleteModalOpen,
    isDeleting,
    isRequestingOtp,
    otpError,
    setIsDeleteModalOpen,
    handleLogout,
    handleDeleteAccount,
    handleRequestOtp,
    handleConfirmDelete,
  } = useAccountActions();

  const { recentViews } = useAppSelector((s) => s.cards);
  const { cards } = useAppSelector((s) => s.cards);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateProfilePhoto, { isLoading: isUploadingPhoto }] = useUpdateProfilePhotoMutation();

  useEffect(() => {
    if (isAuth) dispatch(fetchRecentViews({ page: 1, limit: 10 }));
  }, [dispatch, isAuth]);

  useEffect(() => {
    if (isAuth) {
      axiosInstance.get("/notifications/settings/").then((res) => {
        if (res.data && typeof res.data.push_enabled === "boolean")
          setPushEnabled(res.data.push_enabled);
      }).catch(() => {});
    }
  }, [isAuth]);

  const handleToggleNotifications = useCallback(async () => {
    setNotifLoading(true);
    const next = !pushEnabled;
    try {
      await axiosInstance.post("/notifications/settings/", { push_enabled: next });
      setPushEnabled(next);
    } catch {}
    finally { setNotifLoading(false); }
  }, [pushEnabled]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    try {
      const formData = new FormData();
      formData.append("profile_photo", file);
      const result = await updateProfilePhoto(formData).unwrap();
      setProfile({ ...profile, profile_photo: result.profile_photo });
      dispatch(fetchUser());
    } catch {}
  };

  const favoritesCount = cards.filter((c) => c.is_favorite).length;
  const avatarLetter = profile.name ? profile.name.charAt(0).toUpperCase() : "";

  const NAV_ITEMS = [
    { key: "referral", label: "Рефералы",  icon: <Gift size={18} />,          section: "Программа" },
    { key: "account",  label: "Аккаунт",   icon: <User size={18} />,           section: "Управление" },
    { key: "views",    label: "Просмотры", icon: <Eye size={18} />,            section: "Активность" },
  ];

  const STATS = [
    { icon: <Clock size={14} color="#00C8C8" />, label: "Рефералы",  value: referrals.length,   bg: "rgba(0,200,200,0.1)",  border: "rgba(0,200,200,0.2)" },
    { icon: <Heart size={14} color="#F1117E" />, label: "Избранное", value: favoritesCount,     bg: "rgba(241,17,126,0.1)", border: "rgba(241,17,126,0.2)" },
    { icon: <Eye   size={14} color="#0075FF" />, label: "Просмотры", value: recentViews.length, bg: "rgba(0,117,255,0.1)",  border: "rgba(0,117,255,0.2)" },
  ];

  return (
    <div className="pf-root">
      <style jsx>{`
        /* ── root ── */
        .pf-root {
          min-height: 100vh;
          background: #0A0A0F;
          color: #fff;
          font-family: var(--font-stetica-regular);
          padding-bottom: 90px;
        }

        /* ── desktop layout ── */
        @media (min-width: 900px) {
          .pf-root {
            padding-bottom: 0;
            display: flex;
            flex-direction: column;
          }
          /* top bar only on desktop */
          .pf-topbar {
            display: flex !important;
            position: sticky;
            top: 0;
            z-index: 30;
            background: rgba(10,10,15,0.85);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            padding: 14px 32px;
            align-items: center;
            justify-content: space-between;
          }
          .pf-body {
            display: flex;
            flex: 1;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
            padding: 32px 24px;
            gap: 24px;
            box-sizing: border-box;
          }
          .pf-sidebar {
            display: flex !important;
            flex-direction: column;
            width: 300px;
            flex-shrink: 0;
            gap: 12px;
          }
          .pf-content {
            flex: 1;
            min-width: 0;
          }
          /* hide mobile elements */
          .pf-mobile-hero { display: none !important; }
          .pf-tabs { display: none !important; }
        }

        /* ── mobile layout ── */
        @media (max-width: 899px) {
          .pf-topbar { display: none !important; }
          .pf-body { display: block !important; }
          .pf-sidebar { display: none !important; }
          .pf-content { display: block; }
          .pf-mobile-hero {
            display: flex !important;
            flex-direction: column;
          }
          .pf-tabs { display: flex !important; }
          .pf-content-inner { padding: 14px 16px 0; max-width: 640px; margin: 0 auto; }
        }

        /* ── sidebar card ── */
        .pf-card {
          background: #13131A;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          overflow: hidden;
        }

        /* ── nav item (global: Link renders as <a>, styled-jsx scoping skips it) ── */
        :global(.pf-nav-item) {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-decoration: none;
          color: rgba(255,255,255,0.55);
          width: 100%;
          box-sizing: border-box;
        }
        :global(.pf-nav-item:hover) {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        :global(.pf-nav-item.active) {
          background: rgba(0,117,255,0.14);
          color: #fff;
        }
        :global(.pf-nav-icon) {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.07);
          flex-shrink: 0;
          transition: background 0.15s;
        }
        :global(.pf-nav-item:hover .pf-nav-icon) { background: rgba(255,255,255,0.11); }
        :global(.pf-nav-item.active .pf-nav-icon) {
          background: rgba(0,117,255,0.22);
          color: #5AADFF;
        }
        :global(.pf-nav-chevron) { margin-left: auto; opacity: 0.2; flex-shrink: 0; transition: opacity 0.15s; }
        :global(.pf-nav-item:hover .pf-nav-chevron) { opacity: 0.45; }
        :global(.pf-nav-item.active .pf-nav-chevron) { opacity: 0.55; }

        /* ── stats row ── */
        .pf-stats { display: flex; gap: 8px; }
        .pf-stat {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; padding: 10px 6px; border-radius: 14px;
          gap: 4px;
        }

        /* ── mobile tabs ── */
        .pf-tabs {
          position: sticky; top: 0; z-index: 20;
          background: #0A0A0F;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          gap: 6px; padding: 10px 16px;
          max-width: 640px; margin: 0 auto; width: 100%;
          box-sizing: border-box;
        }
        :global(.pf-tab) {
          flex: 1; text-align: center; padding: 9px 4px; border-radius: 12px;
          font-size: 13px; font-family: var(--font-stetica-bold);
          transition: all 0.15s; text-decoration: none;
        }
        :global(.pf-tab.active) { background: #0075FF; color: #fff; }
        :global(.pf-tab.inactive) { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── DESKTOP TOP BAR ── */}
      <div className="pf-topbar" style={{ display: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/")}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
          >
            <ArrowLeft size={16} />
          </button>
          <span style={{ fontSize: 15, fontFamily: "var(--font-stetica-bold)", color: "rgba(255,255,255,0.9)" }}>Профиль</span>
        </div>
      </div>

      {/* ── MOBILE HERO ── */}
      <div className="pf-mobile-hero" style={{ display: "none" }}>
        <div style={{
          background: "linear-gradient(160deg, #1F1D3A 0%, #141320 60%, #0A0A0F 100%)",
          paddingTop: "max(env(safe-area-inset-top), 16px)",
          position: "relative", overflow: "hidden",
        }}>
          <div aria-hidden style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 480, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,117,255,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
            <button onClick={() => router.push("/")} aria-label="Назад" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", cursor: "pointer", backgroundColor: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <ArrowLeft size={17} />
            </button>
          </div>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 22, paddingBottom: 28, padding: "22px 16px 28px" }}>
            <MobileAvatar profile={profile} avatarLetter={avatarLetter} isUploadingPhoto={isUploadingPhoto} fileInputRef={fileInputRef} onClick={() => fileInputRef.current?.click()} />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
            <div style={{ marginTop: 14, textAlign: "center" }}>
              <div style={{ fontSize: 20, fontFamily: "var(--font-stetica-bold)" }}>{profile.name || "Пользователь"}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{profile.phone_number}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2, fontFamily: "var(--font-stetica-bold)", letterSpacing: "0.04em" }}>DREAMHOUSE PERSONAL</div>
            </div>
            <div className="pf-stats" style={{ marginTop: 20, width: "100%" }}>
              {STATS.map((s) => (
                <div key={s.label} className="pf-stat" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  {s.icon}
                  <span style={{ fontSize: 18, fontFamily: "var(--font-stetica-bold)", lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.label}</span>
                </div>
              ))}
            </div>
            <Link href="/vacancy" style={{ marginTop: 16, textDecoration: "none", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "13px 18px", borderRadius: 16, background: "linear-gradient(135deg, #0075FF 0%, #0056CC 100%)", boxShadow: "0 4px 20px rgba(0,117,255,0.35)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Zap size={16} color="#fff" />
                <div>
                  <div style={{ fontSize: 14, fontFamily: "var(--font-stetica-bold)", color: "#fff" }}>Открытая вакансия</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Менеджер по продажам · Обучение бесплатно</div>
                </div>
              </div>
              <span style={{ fontSize: 20, color: "rgba(255,255,255,0.85)" }}>→</span>
            </Link>
          </div>
        </div>

        {/* mobile tabs */}
        <div className="pf-tabs" style={{ display: "none" }}>
          {NAV_ITEMS.map((tab) => (
            <Link key={tab.key} href={`/profile?section=${tab.key}`} className={`pf-tab ${activeSection === tab.key ? "active" : "inactive"}`}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="pf-body">

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="pf-sidebar" style={{ display: "none" }}>

          {/* Profile card */}
          <div className="pf-card" style={{ padding: "28px 20px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            {/* Avatar */}
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
              <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#14131F", border: "2.5px solid rgba(0,117,255,0.4)", boxShadow: "0 0 0 6px rgba(0,117,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                {profile.profile_photo
                  ? <Image src={profile.profile_photo} alt="avatar" fill className="object-cover" sizes="96px" />
                  : avatarLetter
                    ? <span style={{ fontSize: 34, fontFamily: "var(--font-stetica-bold)" }}>{avatarLetter}</span>
                    : <span style={{ fontSize: 34, color: "#555" }}>?</span>
                }
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: "50%", background: "#0075FF", border: "2.5px solid #0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isUploadingPhoto
                  ? <div style={{ width: 11, height: 11, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
                  : <Camera size={12} color="#fff" />
                }
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />

            <div style={{ marginTop: 14, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "var(--font-stetica-bold)" }}>{profile.name || "Пользователь"}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{profile.phone_number}</div>
              <div style={{ marginTop: 6, display: "inline-block", padding: "3px 10px", borderRadius: 20, background: "rgba(0,117,255,0.12)", border: "1px solid rgba(0,117,255,0.25)", fontSize: 10, fontFamily: "var(--font-stetica-bold)", color: "#5AADFF", letterSpacing: "0.05em" }}>
                DREAMHOUSE PERSONAL
              </div>
            </div>

            {/* stats */}
            <div className="pf-stats" style={{ marginTop: 18, width: "100%" }}>
              {STATS.map((s) => (
                <div key={s.label} className="pf-stat" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  {s.icon}
                  <span style={{ fontSize: 16, fontFamily: "var(--font-stetica-bold)", lineHeight: 1 }}>{s.value}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-stetica-bold)", color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em", padding: "0 4px 6px" }}>
              НАВИГАЦИЯ
            </div>
            {NAV_ITEMS.map((item) => {
              const active = activeSection === item.key;
              return (
                <Link key={item.key} href={`/profile?section=${item.key}`} className={`pf-nav-item${active ? " active" : ""}`}>
                  <div className="pf-nav-icon">{item.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontFamily: "var(--font-stetica-bold)", lineHeight: 1.2 }}>{item.label}</div>
                    <div style={{ fontSize: 12, marginTop: 2, color: active ? "rgba(90,173,255,0.65)" : "rgba(255,255,255,0.27)" }}>{item.section}</div>
                  </div>
                  <ChevronRight size={16} className="pf-nav-chevron" />
                </Link>
              );
            })}
          </div>

          {/* Vacancy card */}
          <Link href="/vacancy" style={{ textDecoration: "none" }}>
            <div style={{ background: "linear-gradient(135deg, #0075FF 0%, #0056CC 100%)", borderRadius: 20, padding: "16px 18px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(0,117,255,0.3)" }}>
              <Zap size={18} color="#fff" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontFamily: "var(--font-stetica-bold)", color: "#fff" }}>Открытая вакансия</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Менеджер по продажам</div>
              </div>
              <ChevronRight size={15} color="rgba(255,255,255,0.6)" />
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "15px 20px", borderRadius: 20,
              border: "1px solid rgba(255,68,68,0.25)",
              background: "rgba(255,68,68,0.05)",
              cursor: "pointer", color: "#FF6B6B",
              width: "100%", textAlign: "left",
              fontFamily: "var(--font-stetica-bold)", fontSize: 14,
              transition: "all 0.2s",
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,68,68,0.1)", flexShrink: 0 }}>
              <LogOut size={17} color="#FF6B6B" />
            </div>
            Выйти из аккаунта
          </button>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="pf-content">
          <div className="pf-content-inner">
            {activeSection === "account" && (
              <AccountSection profile={profile} setProfile={setProfile} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} hideLogout={isDesktop} />
            )}
            {activeSection === "referral" && (
              <ReferralSection referralLink={referralLink} referrals={referrals} copied={copied} loadingReferral={loadingReferral} onCopyLink={handleCopyLink} />
            )}
            {activeSection === "views" && (
              <ViewsSection recentViews={recentViews} />
            )}
          </div>
        </main>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onRequestOtp={handleRequestOtp}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        isRequestingOtp={isRequestingOtp}
        otpError={otpError}
      />
    </div>
  );
}

function MobileAvatar({ profile, avatarLetter, isUploadingPhoto, onClick }: {
  profile: { profile_photo?: string };
  avatarLetter: string;
  isUploadingPhoto: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  onClick: () => void;
}) {
  return (
    <div style={{ position: "relative", cursor: "pointer" }} onClick={onClick}>
      <div style={{ width: 110, height: 110, borderRadius: "50%", backgroundColor: "#14131F", border: "2.5px solid rgba(0,117,255,0.5)", boxShadow: "0 0 0 8px rgba(0,117,255,0.07), 0 12px 40px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        {profile.profile_photo
          ? <Image src={profile.profile_photo} alt="avatar" fill className="object-cover" sizes="110px" />
          : avatarLetter
            ? <span style={{ fontSize: 38, fontFamily: "var(--font-stetica-bold)" }}>{avatarLetter}</span>
            : <span style={{ fontSize: 38, color: "#555" }}>?</span>
        }
      </div>
      <div style={{ position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: "50%", backgroundColor: "#0075FF", border: "2.5px solid #0A0A0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isUploadingPhoto
          ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />
          : <Camera size={14} color="#fff" />
        }
      </div>
    </div>
  );
}

function ViewsSection({ recentViews }: { recentViews: import("@/app/types/models").ICard[] }) {
  if (recentViews.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "52px 20px", backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px", backgroundColor: "rgba(0,117,255,0.1)", border: "1px solid rgba(0,117,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Eye size={24} color="#0075FF" />
        </div>
        <p style={{ fontFamily: "var(--font-stetica-bold)", fontSize: 15, color: "#fff", marginBottom: 6 }}>Нет просмотренных объектов</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Открывайте карточки — они появятся здесь</p>
      </div>
    );
  }
  return (
    <div className="views-grid">
      {recentViews.map((card) => <PropertyCard key={card.id} card={card} />)}
      <style jsx>{`
        .views-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        @media (min-width: 768px) { .views-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; } }
      `}</style>
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <ProfileContent />
      </Suspense>
    </ProtectedRoute>
  );
}
