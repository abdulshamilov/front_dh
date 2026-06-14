"use client";

import { AIAvatar } from "./AIAvatar";

// Индикатор печати: точки внутри bubble в стиле message AI
export function TypingIndicator() {
  return (
    <div
      aria-label="ИИ печатает ответ"
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      <div style={{ flexShrink: 0, marginBottom: 2 }}>
        <AIAvatar size="sm" />
      </div>
      <div
        style={{
          padding: "10px 14px",
          background: "var(--surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "18px 18px 18px 4px",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
        aria-hidden="true"
      >
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />

        <style jsx>{`
          .typing-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--text-tertiary);
            display: inline-block;
            animation: typing-dot 1.4s ease-in-out infinite;
          }
          .typing-dot:nth-child(1) {
            animation-delay: 0s;
          }
          .typing-dot:nth-child(2) {
            animation-delay: 0.2s;
          }
          .typing-dot:nth-child(3) {
            animation-delay: 0.4s;
          }
          @keyframes typing-dot {
            0%,
            100% {
              opacity: 0.3;
              transform: translateY(0) scale(0.85);
            }
            50% {
              opacity: 1;
              transform: translateY(-2px) scale(1);
              background: var(--accent-primary);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .typing-dot {
              animation: none;
              opacity: 0.6;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

export default TypingIndicator;
