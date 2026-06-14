"use client";

import { useEffect, useMemo, useCallback } from "react";
import { X } from "lucide-react";
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
}

interface NotificationsPaginatedResponse {
  results: Notification[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export function NotificationBell({ onClose }: NotificationBellProps) {
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
      if (Array.isArray(paginatedData.results)) {
        result.push(...paginatedData.results);
      }
    }
    return result;
  }, [notificationsData]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  useEffect(() => {
    if (!isLoading && notificationsData && unreadCount > 0) {
      markAllAsRead().catch((error) => {
        console.error("Failed to mark all notifications as read:", error);
      });
    }
  }, [isLoading, notificationsData, unreadCount, markAllAsRead]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleNotificationClick = useCallback(async (id: number, isRead: boolean) => {
    if (!isRead) {
      try {
        await markAsRead(id).unwrap();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  }, [markAsRead]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Только что";
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--overlay-scrim)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: "var(--modal-bg)",
          border: "1px solid var(--border-glass)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div>
              <h3
                className="text-xl font-[family-name:var(--font-stetica-regular)]"
                style={{ color: "var(--text-primary)" }}
              >
                Последние уведомления
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:opacity-80"
            style={{ color: "var(--text-secondary)" }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-0">
          {isLoading ? (
            <div className="p-12 text-center">
              <div
                className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                style={{
                  borderColor: "var(--accent-primary)",
                  borderTopColor: "transparent",
                }}
              ></div>
              <p
                className="mt-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Загрузка уведомлений...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center content-center p-12 text-center gap-y-1">
              <svg
                width="103"
                height="126"
                viewBox="0 0 103 126"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M51.3944 0C40.7195 0 30.4817 4.24061 22.9334 11.789C15.385 19.3373 11.1444 29.575 11.1444 40.25V60.536C11.1453 61.428 10.9386 62.3079 10.5407 63.1063L0.667936 82.846C0.185663 83.8104 -0.042062 84.882 0.00638991 85.9592C0.0548418 87.0364 0.377862 88.0833 0.94477 89.0005C1.51168 89.9177 2.30365 90.6747 3.24547 91.1997C4.18729 91.7247 5.24768 92.0002 6.32594 92H96.4629C97.5412 92.0002 98.6016 91.7247 99.5434 91.1997C100.485 90.6747 101.277 89.9177 101.844 89.0005C102.411 88.0833 102.734 87.0364 102.782 85.9592C102.831 84.882 102.603 83.8104 102.121 82.846L92.2539 63.1063C91.8541 62.3084 91.6454 61.4284 91.6444 60.536V40.25C91.6444 29.575 87.4038 19.3373 79.8555 11.789C72.3071 4.24061 62.0694 0 51.3944 0ZM51.3944 109.25C47.8257 109.252 44.3442 108.147 41.4298 106.087C38.5154 104.028 36.3115 101.115 35.1219 97.75H67.6669C66.4774 101.115 64.2735 104.028 61.3591 106.087C58.4447 108.147 54.9632 109.252 51.3944 109.25Z"
                  fill="var(--accent-primary)"
                  fillOpacity="0.4"
                />
              </svg>
              <p
                className="text-lg font-[family-name:var(--font-stetica-regular)]"
                style={{ color: "var(--text-primary)" }}
              >
                Здесь пока ничего нет
              </p>
              <p
                className="text-base"
                style={{ color: "var(--text-secondary)" }}
              >
                Здесь будут собраны уведомления о новой недвижимости тех
                застройщиков, на которых вы подписаны{" "}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.is_read
                    )
                  }
                  className="w-full text-left p-4 border-b"
                  style={{
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex flex-col gap-3">
                    {!notification.is_read && (
                      <span
                        className="flex justify-center content-center max-w-[80px] rounded-lg px-3 py-1"
                        style={{
                          backgroundColor: "var(--accent-primary)",
                          color: "#FFFFFF",
                        }}
                      >
                        Новое
                      </span>
                    )}
                    <div className="flex items-center gap-3">
                      <span
                        className="w-[24px] h-[24px] rounded-full flex items-center content-center justify-center font-[family-name:var(--font-stetica-bold)]"
                        style={{
                          backgroundColor: "var(--accent-primary)",
                          color: "#FFFFFF",
                        }}
                      >
                        !
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className="text-base font-[family-name:var(--font-stetica-medium)]"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {notification.title}
                          </h4>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {notification.message}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
