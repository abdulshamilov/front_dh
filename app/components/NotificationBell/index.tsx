"use client";

import { useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Bell, ChevronRight } from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/app/shared/redux/api/notifications";

interface NotificationBellProps {
  onClose?: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  user: number;
  // Опциональные поля бэкенда — ссылка на объект и фото.
  card?: number | { id: number; image?: string; images?: { image?: string }[] } | null;
  card_id?: number | null;
  object_id?: number | null;
  link?: string | null;
  url?: string | null;
  image?: string | null;
  photo?: string | null;
  preview?: string | null;
}

interface NotificationsPaginatedResponse {
  results: Notification[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

/** id карточки из уведомления, если оно про объект. */
function getCardId(n: Notification): number | null {
  if (typeof n.card_id === "number") return n.card_id;
  if (typeof n.card === "number") return n.card;
  if (n.card && typeof n.card === "object" && typeof n.card.id === "number")
    return n.card.id;
  const link = n.link || n.url || "";
  const m = typeof link === "string" ? link.match(/\/card\/(\d+)/) : null;
  return m ? Number(m[1]) : null;
}

/** Фото объекта, привязанного к уведомлению. */
function getCardImage(n: Notification): string | null {
  if (n.image) return n.image;
  if (n.photo) return n.photo;
  if (n.preview) return n.preview;
  if (n.card && typeof n.card === "object") {
    if (n.card.image) return n.card.image;
    const img = n.card.images?.find((i) => i.image)?.image;
    if (img) return img;
  }
  return null;
}

export function NotificationBell({ onClose }: NotificationBellProps) {
  const router = useRouter();
  const { data: notificationsData, isLoading } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const notifications: Notification[] = useMemo(() => {
    const result: Notification[] = [];
    if (Array.isArray(notificationsData)) {
      result.push(...notificationsData);
    } else if (
      notificationsData &&
      typeof notificationsData === "object" &&
      "results" in notificationsData
    ) {
      const paginatedData = notificationsData as NotificationsPaginatedResponse;
      if (Array.isArray(paginatedData.results)) result.push(...paginatedData.results);
    }
    return result;
  }, [notificationsData]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  useEffect(() => {
    if (!isLoading && notificationsData && unreadCount > 0) {
      markAllAsRead().catch(() => {});
    }
  }, [isLoading, notificationsData, unreadCount, markAllAsRead]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleNotificationClick = useCallback(
    async (n: Notification) => {
      if (!n.is_read) markAsRead(n.id).catch(() => {});
      const cardId = getCardId(n);
      if (cardId) {
        onClose?.();
        router.push(`/card/${cardId}`);
      }
    },
    [markAsRead, router, onClose]
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "сейчас";
    if (diffMins < 60) return `${diffMins} мин`;
    if (diffHours < 24) return `${diffHours} ч`;
    if (diffDays < 7) return `${diffDays} дн`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3"
      style={{
        backgroundColor: "var(--overlay-scrim)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        paddingTop: "max(12px, env(safe-area-inset-top))",
      }}
      onClick={onClose}
    >
      <div
        className="notif-sheet w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-color)",
          borderRadius: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3
            className="text-[18px] font-[family-name:var(--font-stetica-bold)]"
            style={{ color: "var(--text-primary)" }}
          >
            Уведомления
          </h3>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="notif-close"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--bg-button)",
              color: "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {isLoading ? (
            <div className="p-12 text-center">
              <div
                className="inline-block w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
              />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center gap-2">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--bg-button)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={24} color="var(--text-tertiary)" />
              </div>
              <p
                className="text-[15px] font-[family-name:var(--font-stetica-bold)]"
                style={{ color: "var(--text-primary)", marginTop: 4 }}
              >
                Пока пусто
              </p>
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)", maxWidth: 260 }}>
                Здесь появятся уведомления о новых объектах
              </p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const cardId = getCardId(n);
              const clickable = cardId !== null;
              const image = getCardImage(n);
              return (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className="notif-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 12px",
                    borderRadius: 14,
                    background: "transparent",
                    border: "none",
                    borderTop: i === 0 ? "none" : "1px solid var(--border-color)",
                    cursor: clickable ? "pointer" : "default",
                  }}
                >
                  {/* Фото объекта или иконка */}
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      loading="lazy"
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        objectFit: "cover",
                        flexShrink: 0,
                        background: "var(--surface-elevated)",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 12,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--bg-button)",
                      }}
                    >
                      <Bell size={18} color="var(--text-tertiary)" />
                    </span>
                  )}

                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontFamily: "var(--font-stetica-bold)",
                          fontSize: 14,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {n.title}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", flexShrink: 0 }}>
                        {formatTime(n.created_at)}
                      </span>
                    </span>
                    <span
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        marginTop: 2,
                        fontSize: 13,
                        lineHeight: 1.4,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {n.message}
                    </span>
                  </span>

                  {/* Индикатор непрочитанного / переход */}
                  {clickable ? (
                    <ChevronRight size={16} color="var(--text-tertiary)" style={{ flexShrink: 0 }} />
                  ) : !n.is_read ? (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--accent-primary)",
                        flexShrink: 0,
                      }}
                    />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>

      <style jsx>{`
        .notif-sheet {
          animation: notif-in 0.32s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 20px 56px rgba(0, 0, 0, 0.4);
        }
        @keyframes notif-in {
          from {
            opacity: 0;
            transform: translateY(-14px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .notif-item {
          transition: background 0.15s ease, transform 0.12s ease;
        }
        .notif-item:hover {
          background: var(--surface-elevated) !important;
        }
        .notif-item:active {
          transform: scale(0.99);
        }
        .notif-close:active {
          transform: scale(0.92);
        }
      `}</style>
    </div>
  );
}
