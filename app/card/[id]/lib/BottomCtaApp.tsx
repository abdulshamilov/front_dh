"use client";

import { useState } from "react";
import { SHORT_PHONE_TEL } from "@/app/shared/utils/contacts";

/**
 * Pixel-perfect port of `BottomCTAButtons` from DetailContentSections.kt
 * (sticky 2-button bar: "Позвонить" + "Отправить заявку").
 *
 * Compose source has NO icons on these buttons (text only) — kept text
 * only here too. dp -> px, sp -> px. The Compose bar reserves a 56dp
 * bottom inset; on the site the global mobile BottomBar (~56px,
 * lg:hidden) occupies that space, so the bar sits flush at bottom:0 and
 * lifts itself by 56px + safe-area on mobile, safe-area only on desktop.
 */

interface BottomCtaAppProps {
  onRequestClick: () => void;
}

export function BottomCtaApp({ onRequestClick }: BottomCtaAppProps) {
  const [callPressed, setCallPressed] = useState(false);
  const [reqPressed, setReqPressed] = useState(false);

  const handleCall = () => {
    // ICard has no phone field on the site model; the Compose source
    // reads card.phone (absent here). Use the canonical site number from
    // contacts.ts; fall back to the Compose SUPPORT_PHONE if unset.
    const tel =
      SHORT_PHONE_TEL && SHORT_PHONE_TEL.trim() !== ""
        ? SHORT_PHONE_TEL
        : "tel:+79882926266";
    window.location.href = tel;
  };

  const releaseCall = () => {
    if (callPressed) setCallPressed(false);
  };
  const releaseReq = () => {
    if (reqPressed) setReqPressed(false);
  };

  return (
    <>
      <div className="bottom-cta-app">
        <button
          type="button"
          onClick={handleCall}
          aria-label="Позвонить"
          onPointerDown={() => setCallPressed(true)}
          onPointerUp={releaseCall}
          onPointerLeave={releaseCall}
          onPointerCancel={releaseCall}
          className="bottom-cta-btn"
          style={{
            background: "var(--success-bg)",
            borderRadius: "16px 0 0 0",
            transform: callPressed ? "scale(0.95)" : "scale(1)",
          }}
        >
          Позвонить
        </button>

        <button
          type="button"
          onClick={onRequestClick}
          aria-label="Отправить заявку"
          onPointerDown={() => setReqPressed(true)}
          onPointerUp={releaseReq}
          onPointerLeave={releaseReq}
          onPointerCancel={releaseReq}
          className="bottom-cta-btn"
          style={{
            background: "var(--accent-secondary)",
            borderRadius: "0 16px 0 0",
            transform: reqPressed ? "scale(0.95)" : "scale(1)",
          }}
        >
          Отправить заявку
        </button>
      </div>

      <style jsx>{`
        .bottom-cta-app {
          position: fixed;
          left: 50%;
          transform: translateX(-50%);
          bottom: 0;
          width: 100%;
          max-width: 480px;
          z-index: 40;
          background: var(--bg-primary);
          display: flex;
          /* Mobile: lift above the global BottomBar (~56px) + safe area. */
          padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 56px);
        }

        /* Desktop: sidebar has CTA buttons, hide this fixed bar. */
        @media (min-width: 1024px) {
          .bottom-cta-app {
            display: none;
          }
        }

        .bottom-cta-btn {
          flex: 1;
          height: 48px;
          border: none;
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          font-family: var(--font-stetica-bold);
          cursor: pointer;
          user-select: none;
          transition: transform 120ms ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .bottom-cta-btn {
            transition: none;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}

export default BottomCtaApp;
