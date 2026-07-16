"use client";

import DeleteAccountModal from "@/app/components/DeleteAccountModal";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import {
  Eye, Camera, ChevronLeft, Bell, Heart, Gift,
  ChevronRight, LogOut, Briefcase, Pencil, Check, X, Trash2,
} from "lucide-react";
import { useProfileData, useReferralData, useAccountActions } from "./hooks";
import { ReferralSection } from "./ui";
import PropertyCard from "@/app/components/home/PropertyCard";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchRecentViews } from "@/app/shared/redux/slices/cards";
import { useUpdateProfilePhotoMutation, useUpdateProfileMutation } from "@/app/shared/redux/api/auth";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useGetNotificationsQuery } from "@/app/shared/redux/api/notifications";
import { fetchUser } from "@/app/shared/redux/slices/auth";
import {
  AuthShell, AuthTitle, AuthSubtitle, AuthSubmit,
} from "@/app/components/auth/AuthShell";

// Разделы-подстраницы (открываются как отдельный экран с «Назад»).
const SECTION_KEYS = ["referral", "views"] as const;
type SectionKey = (typeof SECTION_KEYS)[number];

const SECTION_TITLES: Record<SectionKey, string> = {
  referral: "Рефералы",
  views: "Мои просмотры",
};

function GuestPrompt() {
  const router = useRouter();
  return (
    <AuthShell onBack={() => router.push("/")}>
      <AuthTitle line1="Войдите" line2="в профиль" />
      <AuthSubtitle>
        Чтобы видеть избранное, историю просмотров и бонусы — войдите по номеру телефона
      </AuthSubtitle>

      <div className="mt-8 flex flex-col gap-3">
        <AuthSubmit onClick={() => router.push("/register")}>Войти</AuthSubmit>
      </div>
    </AuthShell>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const sectionParam = searchParams.get("section");
  const activeSection = (SECTION_KEYS as readonly string[]).includes(sectionParam ?? "")
    ? (sectionParam as SectionKey)
    : null;

  const { profile, setProfile, isAuth } = useProfileData();
  const initialized = useAppSelector((s) => s.auth.initialized);
  const { referralLink, referrals, copied, loadingReferral, handleCopyLink } =
    useReferralData(activeSection ?? "", isAuth);
  const {
    isDeleteModalOpen, isDeleting, isRequestingOtp, otpError,
    setIsDeleteModalOpen, handleLogout, handleDeleteAccount,
    handleRequestOtp, handleConfirmDelete,
  } = useAccountActions();

  const { recentViews } = useAppSelector((s) => s.cards);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Счётчик непрочитанных для бейджа на колокольчике
  const { data: notificationsData } = useGetNotificationsQuery(undefined, { skip: !isAuth });
  const unreadCount = (() => {
    const list = Array.isArray(notificationsData)
      ? notificationsData
      : (notificationsData as { results?: { is_read: boolean }[] } | undefined)?.results ?? [];
    return list.filter((n) => !n.is_read).length;
  })();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateProfilePhoto, { isLoading: isUploadingPhoto }] = useUpdateProfilePhotoMutation();

  // Инлайн-редактирование имени в карточке профиля
  const [updateProfile, { isLoading: isSavingName }] = useUpdateProfileMutation();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  const startNameEdit = () => {
    setNameDraft(profile.name || "");
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const cancelNameEdit = () => setEditingName(false);

  const saveName = async () => {
    const next = nameDraft.trim();
    if (!next || next === profile.name) { setEditingName(false); return; }
    try {
      const result = await updateProfile({ name: next }).unwrap();
      setProfile({ ...profile, name: result.name });
      dispatch(fetchUser());
      setEditingName(false);
    } catch {
      setEditingName(false);
    }
  };

  useEffect(() => {
    if (isAuth) dispatch(fetchRecentViews({ page: 1, limit: 10 }));
  }, [dispatch, isAuth]);

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

  // ── Гость / загрузка ──
  if (!initialized || !mounted) {
    return <div style={{ minHeight: "100svh", background: "var(--home-bg)" }} />;
  }
  if (!isAuth) {
    return <GuestPrompt />;
  }

  const avatarLetter = profile.name ? profile.name.charAt(0).toUpperCase() : "?";

  const MENU = [
    { label: "Рефералы", sub: "Приглашай и получай бонусы", icon: <Gift size={18} />, href: "/profile?section=referral" },
    { label: "Избранное", sub: "Сохранённые объекты", icon: <Heart size={18} />, href: "/favorite" },
    { label: "Мои просмотры", sub: "История объектов", icon: <Eye size={18} />, href: "/profile?section=views" },
  ];

  // ── Подстраница раздела ──
  if (activeSection) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--home-bg)", paddingBottom: 96 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "max(20px, env(safe-area-inset-top)) 16px 0" }}>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--home-text-primary)", marginBottom: 16 }}
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
            <span style={{ fontSize: 16, fontFamily: "var(--font-stetica-regular)" }}>Назад</span>
          </button>
          <h1 style={{ margin: "0 0 20px", fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--home-text-primary)", fontFamily: "var(--font-manrope), var(--font-stetica-bold)" }}>
            {SECTION_TITLES[activeSection]}
          </h1>

          {activeSection === "referral" && (
            <ReferralSection referralLink={referralLink} referrals={referrals} copied={copied} loadingReferral={loadingReferral} onCopyLink={handleCopyLink} />
          )}
          {activeSection === "views" && <ViewsSection recentViews={recentViews} />}
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

  // ── Хаб профиля (стиль референса) ──
  return (
    <div style={{ minHeight: "100svh", background: "var(--home-bg)", paddingBottom: 96 }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "max(20px, env(safe-area-inset-top)) 16px 0" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--home-text-primary)", fontFamily: "var(--font-manrope), var(--font-stetica-bold)" }}>
            Профиль
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              aria-label="Уведомления"
              style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--home-border-strong)", background: "var(--home-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--home-text-primary)" }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute", top: -2, right: -2, minWidth: 18, height: 18,
                    padding: "0 5px", borderRadius: 999, background: "var(--home-accent)",
                    color: "#fff", fontSize: 10.5, fontWeight: 700, lineHeight: "18px",
                    textAlign: "center", border: "2px solid var(--home-bg)", boxSizing: "content-box" as const,
                  }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {notifOpen && <NotificationBell onClose={() => setNotifOpen(false)} />}

        {/* Avatar — залипает, и секция при скролле наезжает сверху, пряча фото */}
        <div style={{ position: "sticky", top: 12, zIndex: 0, display: "flex", justifyContent: "center", marginTop: 10, paddingBottom: 0 }}>
          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
            <div style={{ width: 104, height: 104, borderRadius: "50%", background: "var(--home-surface-elevated)", border: "3px solid var(--home-surface)", boxShadow: "0 8px 30px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
              {profile.profile_photo
                ? <Image src={profile.profile_photo} alt="avatar" fill className="object-cover" sizes="104px" />
                : <span style={{ fontSize: 36, fontFamily: "var(--font-stetica-bold)", color: "var(--home-text-primary)" }}>{avatarLetter}</span>}
            </div>
            <div style={{ position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: "50%", background: "var(--home-accent)", border: "3px solid var(--home-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isUploadingPhoto
                ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #fff", borderTopColor: "transparent", animation: "pf-spin 0.7s linear infinite" }} />
                : <Camera size={13} color="#fff" />}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
        </div>

        {/* Секция поверх аватара — при скролле наезжает и прячет фото. marginTop = зазор в покое */}
        <div style={{ position: "relative", zIndex: 2, background: "var(--home-bg)", marginTop: 16 }}>

        {/* Profile card */}
        <div style={{ background: "var(--home-surface)", border: "1px solid var(--home-border-strong)", borderRadius: 24, padding: 18, boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              {editingName ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    ref={nameInputRef}
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") cancelNameEdit();
                    }}
                    disabled={isSavingName}
                    placeholder="Ваше имя"
                    maxLength={40}
                    style={{
                      flex: 1, minWidth: 0, fontSize: 17, fontWeight: 700,
                      fontFamily: "var(--font-manrope), var(--font-stetica-bold)",
                      color: "var(--home-text-primary)", background: "var(--home-bg)",
                      border: "1.5px solid var(--home-accent)", borderRadius: 12,
                      padding: "7px 12px", outline: "none",
                      opacity: isSavingName ? 0.6 : 1,
                    }}
                  />
                  <button
                    type="button"
                    aria-label="Сохранить имя"
                    onClick={saveName}
                    disabled={isSavingName}
                    style={{ width: 34, height: 34, borderRadius: 10, border: "none", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--home-accent)", cursor: "pointer" }}
                  >
                    <Check size={17} color="#fff" />
                  </button>
                  <button
                    type="button"
                    aria-label="Отменить"
                    onClick={cancelNameEdit}
                    style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--home-border-strong)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", cursor: "pointer" }}
                  >
                    <X size={16} color="var(--home-text-tertiary)" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startNameEdit}
                  aria-label="Редактировать имя"
                  style={{ display: "flex", alignItems: "center", gap: 7, maxWidth: "100%", background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}
                >
                  <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--home-text-primary)", fontFamily: "var(--font-manrope), var(--font-stetica-bold)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {profile.name || "Пользователь"}
                  </span>
                  <Pencil size={14} color="var(--home-text-tertiary)" style={{ flexShrink: 0 }} />
                </button>
              )}
              <div style={{ fontSize: 13, color: "var(--home-text-tertiary)", marginTop: 2 }}>
                {profile.phone_number || ""}
              </div>
            </div>
            <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 999, background: "var(--home-accent-soft)", color: "var(--home-accent-link)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-inter), system-ui" }}>
              Dream House
            </span>
          </div>

          {/* CTA banner */}
          <Link href="/vacancy" style={{ marginTop: 16, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", borderRadius: 18, background: "var(--home-bg)", border: "1px solid var(--home-border-strong)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--home-accent-soft)" }}>
                <Briefcase size={18} color="var(--home-accent-link)" />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--home-text-primary)", fontFamily: "var(--font-manrope), var(--font-stetica-bold)" }}>Станьте агентом</div>
                <div style={{ fontSize: 12, color: "var(--home-text-tertiary)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Обучение бесплатно · удалённо</div>
              </div>
            </div>
            <span style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 999, background: "var(--home-accent)", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-inter), system-ui" }}>Открыть</span>
          </Link>
        </div>

        {/* Menu list */}
        <div style={{ marginTop: 14, background: "var(--home-surface)", border: "1px solid var(--home-border-strong)", borderRadius: 24, overflow: "hidden" }}>
          {MENU.map((item, i) => (
            <Link key={item.label} href={item.href} className="pf-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", textDecoration: "none", borderTop: i === 0 ? "none" : "1px solid var(--home-border)" }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--home-surface-elevated)", color: "var(--home-text-primary)" }}>
                {item.icon}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: "var(--home-text-primary)", fontFamily: "var(--font-manrope), var(--font-stetica-bold)" }}>{item.label}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--home-text-tertiary)", marginTop: 1 }}>{item.sub}</span>
              </span>
              <ChevronRight size={18} color="var(--home-text-tertiary)" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 20, border: "1px solid rgba(255,68,68,0.25)", background: "rgba(255,68,68,0.06)", cursor: "pointer", color: "#FF6B6B", fontFamily: "var(--font-manrope), var(--font-stetica-bold)", fontSize: 15, fontWeight: 700, textAlign: "left" }}
        >
          <span style={{ width: 42, height: 42, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,68,68,0.1)", flexShrink: 0 }}>
            <LogOut size={18} color="#FF6B6B" />
          </span>
          Выйти из аккаунта
        </button>

        {/* Удаление аккаунта — раньше жило в разделе «Аккаунт» */}
        <button
          onClick={handleDeleteAccount}
          style={{ margin: "10px auto 0", display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "var(--home-text-muted)", fontSize: 13, padding: "4px 8px" }}
        >
          <Trash2 size={13} />
          Удалить аккаунт
        </button>
        </div>
        {/* /pf-sheet */}
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

      <style jsx global>{`
        @keyframes pf-spin { to { transform: rotate(360deg); } }
        .pf-row { transition: background 0.15s ease; }
        .pf-row:hover { background: var(--home-surface-elevated); }
        .pf-row:active { background: var(--home-surface-elevated); }
      `}</style>
    </div>
  );
}

function ViewsSection({ recentViews }: { recentViews: import("@/app/types/models").ICard[] }) {
  if (recentViews.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "52px 20px", background: "var(--home-surface)", borderRadius: 18, border: "1px solid var(--home-border-strong)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px", background: "var(--home-accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Eye size={24} color="var(--home-accent)" />
        </div>
        <p style={{ fontFamily: "var(--font-stetica-bold)", fontSize: 15, color: "var(--home-text-primary)", marginBottom: 6 }}>Нет просмотренных объектов</p>
        <p style={{ fontSize: 13, color: "var(--home-text-tertiary)" }}>Открывайте карточки — они появятся здесь</p>
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
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
