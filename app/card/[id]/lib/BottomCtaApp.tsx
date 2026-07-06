"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { SHORT_PHONE_TEL } from "@/app/shared/utils/contacts";

/**
 * Одна CTA-плашка «swipe to confirm» (референс Book Now):
 * тёмная пилюля, жёлтая ручка ПО ЦЕНТРУ. Свайп вправо → оставить заявку,
 * влево → позвонить. После действия — галочка, затем плашка исчезает
 * (до перезагрузки страницы). Цвета не менялись.
 */

interface BottomCtaAppProps {
  onRequestClick: () => void;
  /** Страж перед действием (звонок/заявка): вернуть false, чтобы отменить (гость → регистрация). */
  onBeforeAction?: () => boolean;
}

const HANDLE = 48;
const PAD = 4;

// Фирменный знак DreamHouse (только стрелки-«H»), белым — на круг-ручке.
function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size * (29 / 45)}
      height={size}
      viewBox="0 0 29 45"
      fill="none"
      aria-hidden
    >
      <path
        d="M28.5316 13.2677V30.717L23.0433 36.1911V23.121V21.8266L20.8473 24.0163V38.3807L14.2085 45L10.3527 41.1536L13.1629 38.3497L14.2337 37.282L15.359 36.1601L15.3706 0.0193787L20.8647 5.47798L20.8473 20.9295L20.8453 20.9314L20.8473 20.9333V20.9295L23.0433 18.7418L24.6545 17.1354L24.6875 17.1005L28.5316 13.2677Z"
        fill="#fff"
      />
      <path
        d="M13.1746 0V33.0171L10.928 30.777L7.68436 27.543V23.9698L7.35591 23.6423L5.48827 21.7801V23.0687V28.5002L7.68436 30.6898L9.35183 32.3505L12.6907 35.6814L8.80961 39.5511L7.68436 38.4291L5.48827 36.2414V36.2027L5.46884 36.2201L0 30.7673V13.2153L3.81108 17.0152L3.84218 17.0482L5.48827 18.6875L7.68436 20.8771V20.8791H7.6863L7.68436 20.8771L7.68047 5.47797L13.1746 0Z"
        fill="#fff"
      />
    </svg>
  );
}

export function BottomCtaApp({ onRequestClick, onBeforeAction }: BottomCtaAppProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rectLeftRef = useRef(0);
  const [maxX, setMaxX] = useState(0);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [confirmed, setConfirmed] = useState<null | "call" | "request">(null);
  const [hidden, setHidden] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const center = maxX / 2;

  // Прячется/появляется при скролле как навбар.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const d = y - lastY;
        if (y < 24) setCollapsed(false);
        else if (d > 6) setCollapsed(true);
        else if (d < -6) setCollapsed(false);
        lastY = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const measure = () => {
      const t = trackRef.current;
      if (t) setMaxX(Math.max(0, t.clientWidth - HANDLE - PAD * 2));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Ставим ручку в центр после измерения (пока не перетаскивают/не подтвердили).
  useEffect(() => {
    if (!dragging && confirmed === null) setX(maxX / 2);
  }, [maxX, dragging, confirmed]);

  const handleCall = () => {
    const tel =
      SHORT_PHONE_TEL && SHORT_PHONE_TEL.trim() !== ""
        ? SHORT_PHONE_TEL
        : "tel:+79882926266";
    window.location.href = tel;
  };

  const onDown = (e: React.PointerEvent) => {
    if (confirmed) return;
    const t = trackRef.current;
    if (t) rectLeftRef.current = t.getBoundingClientRect().left;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const nx = e.clientX - rectLeftRef.current - PAD - HANDLE / 2;
    setX(Math.max(0, Math.min(nx, maxX)));
  };

  const confirm = (kind: "call" | "request") => {
    // Гость → уходим на регистрацию, плашку не гасим.
    if (onBeforeAction && !onBeforeAction()) {
      setX(center);
      return;
    }
    setConfirmed(kind);
    setX(kind === "request" ? maxX : 0);
    if (kind === "request") onRequestClick();
    else handleCall();
    window.setTimeout(() => setHidden(true), 1000);
  };

  const finish = () => {
    if (!dragging) return;
    setDragging(false);
    if (maxX <= 0) return;
    if (x >= maxX * 0.85) confirm("request");
    else if (x <= maxX * 0.15) confirm("call");
    else setX(center); // недосвайп — возврат в центр
  };

  if (hidden) return null;

  return (
    <div className="bottom-cta-app">
      <div
        className="cta-inner"
        style={{
          transformOrigin: "bottom center",
          transform: collapsed
            ? "translateY(130%) scale(0.9)"
            : "translateY(0) scale(1)",
          opacity: collapsed ? 0 : 1,
          filter: collapsed ? "blur(2px)" : "blur(0px)",
          pointerEvents: collapsed ? "none" : "auto",
          // iOS-подобная пружина: лёгкий overshoot при появлении.
          transition:
            "transform 0.52s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.34s ease, filter 0.34s ease",
        }}
      >
        <div ref={trackRef} className="swipe-track">
          {confirmed ? (
            <span className="swipe-done">Готово</span>
          ) : (
            <>
              <span className="swipe-side swipe-left" aria-hidden>
                <ChevronLeft size={14} />
                Позвонить
              </span>
              <span className="swipe-side swipe-right" aria-hidden>
                Оставить заявку
                <ChevronRight size={14} />
              </span>
            </>
          )}

          <div
            className="swipe-handle"
            role="button"
            aria-label="Свайп вправо — заявка, влево — позвонить"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={finish}
            onPointerCancel={finish}
            style={{
              transform: `translateX(${x}px)`,
              transition: dragging ? "none" : "transform 0.28s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div
              className={`swipe-knob${!dragging && !confirmed ? " is-idle" : ""}`}
              style={{
                transform: dragging ? "scale(1.12)" : "scale(1)",
                boxShadow: dragging
                  ? "0 6px 22px rgba(0,117,255,0.55), 0 0 0 6px rgba(0,117,255,0.14)"
                  : "0 2px 10px rgba(0,0,0,0.4)",
              }}
            >
              {confirmed ? (
                <Check size={20} strokeWidth={2.6} color="#fff" />
              ) : (
                <LogoMark size={22} />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bottom-cta-app {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
          display: flex;
          justify-content: center;
          padding: 12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px);
          pointer-events: none;
        }
        .cta-inner {
          width: 100%;
          max-width: 480px;
          pointer-events: auto;
        }
        @media (min-width: 1024px) {
          .bottom-cta-app {
            display: none;
          }
        }

        .swipe-track {
          position: relative;
          width: 100%;
          height: 56px;
          border-radius: 999px;
          background: rgba(24, 24, 28, 0.95);
          backdrop-filter: blur(22px) saturate(180%);
          -webkit-backdrop-filter: blur(22px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
          touch-action: pan-y;
        }
        .swipe-side {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: rgba(255, 255, 255, 0.55);
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-stetica-bold);
          pointer-events: none;
          white-space: nowrap;
          /* Не заходить под ручку в центре, чтобы буквы не оставались под кругом */
          max-width: calc(50% - ${HANDLE / 2 + 12}px);
          overflow: hidden;
        }
        .swipe-left {
          left: 16px;
          justify-content: flex-start;
        }
        .swipe-right {
          right: 16px;
          justify-content: flex-end;
        }
        .swipe-done {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          font-family: var(--font-stetica-bold);
          pointer-events: none;
        }
        .swipe-handle {
          position: absolute;
          top: ${PAD}px;
          left: ${PAD}px;
          width: ${HANDLE}px;
          height: ${HANDLE}px;
          cursor: grab;
          touch-action: none;
          z-index: 2;
        }
        .swipe-handle:active {
          cursor: grabbing;
        }
        .swipe-knob {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1px;
          /* iOS-подобная пружина при захвате */
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.2s ease;
        }
        /* Пока ручку не трогали — мягко покачивается влево-вправо,
           подсказывая направление свайпа. */
        .swipe-knob.is-idle {
          animation: knob-nudge 2.4s ease-in-out infinite;
        }
        @keyframes knob-nudge {
          0%, 100% { transform: translateX(0) scale(1); }
          18% { transform: translateX(7px) scale(1); }
          36% { transform: translateX(0) scale(1); }
          58% { transform: translateX(-7px) scale(1); }
          76% { transform: translateX(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .swipe-knob.is-idle {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default BottomCtaApp;
