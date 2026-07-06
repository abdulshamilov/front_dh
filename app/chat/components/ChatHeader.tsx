"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Heart, Bell, User } from "lucide-react";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useAppSelector } from "@/app/shared/redux/hooks";
import { useToast } from "@/app/components/shared/Toast";

interface ChatHeaderProps {
  onBack: () => void;
}

// Chat header in the style of the site Header (rounded bottom, dropshadow),
// but with a black surface: back button on the left, quick actions on the right.
export function ChatHeader({ onBack }: ChatHeaderProps) {
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { isAuth } = useAppSelector((s) => s.auth);
  const { show: toast } = useToast();

  const onNotifClick = () => {
    if (!isAuth) {
      toast("Войдите, чтобы видеть уведомления", { type: "info" });
      return;
    }
    setNotifOpen((p) => !p);
  };

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const iconSize = 20;

  return (
    <header
      className="chat-header"
      style={{
        background: "var(--home-bg)",
        // Smaller radius — less visual chrome, more room for content.
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.4)",
      }}
    >
      <div className="chat-header__inner">
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад"
          className="chat-header__action"
        >
          <ChevronLeft size={22} strokeWidth={2.25} color="#FFFFFF" />
        </button>

        <div className="chat-header__spacer" />

        <div className="chat-header__actions">
          <button
            type="button"
            onClick={() => router.push("/favorite")}
            aria-label="Избранное"
            className="chat-header__ghost"
          >
            <Heart size={iconSize} strokeWidth={2} color="#FFFFFF" />
          </button>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={onNotifClick}
              aria-label="Уведомления"
              className="chat-header__ghost"
            >
              <Bell size={iconSize} strokeWidth={2} color="#FFFFFF" />
            </button>
            {notifOpen && <NotificationBell onClose={() => setNotifOpen(false)} />}
          </div>
          <button
            type="button"
            onClick={() => router.push("/profile")}
            aria-label="Профиль"
            className="chat-header__ghost"
          >
            <User size={iconSize} strokeWidth={2} color="#FFFFFF" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-header {
          position: sticky;
          top: 0;
          z-index: 10;
          width: 100%;
          transition: box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .chat-header__inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          height: 52px;
        }
        @media (min-width: 1024px) {
          .chat-header__inner {
            padding: 16px 32px;
            height: 72px;
          }
        }
        .chat-header__spacer {
          flex: 1;
        }
        .chat-header__actions {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        @media (min-width: 1024px) {
          .chat-header__actions {
            gap: 6px;
          }
        }
        .chat-header__action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          cursor: pointer;
          padding: 0;
          transition: background-color 200ms ease, transform 120ms ease;
          flex-shrink: 0;
        }
        .chat-header__ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background-color 200ms ease, transform 120ms ease;
          flex-shrink: 0;
        }
        @media (hover: hover) {
          .chat-header__action:hover,
          .chat-header__ghost:hover {
            background: rgba(255, 255, 255, 0.16);
          }
        }
        .chat-header__action:active,
        .chat-header__ghost:active {
          transform: scale(0.94);
        }
        @media (prefers-reduced-motion: reduce) {
          .chat-header,
          .chat-header__action,
          .chat-header__ghost {
            transition: none;
          }
          .chat-header__action:active,
          .chat-header__ghost:active {
            transform: none;
          }
        }
      `}</style>
    </header>
  );
}
