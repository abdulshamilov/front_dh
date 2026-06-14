"use client";

import { Search, Heart, Phone } from "lucide-react";

const STEPS = [
  {
    num: "1",
    Icon: Search,
    title: "Ищи",
    text: "Сотни новостроек Дагестана с удобными фильтрами и AI-помощником",
  },
  {
    num: "2",
    Icon: Heart,
    title: "Выбирай",
    text: "Сохраняй в избранное, сравнивай варианты, смотри на карте",
  },
  {
    num: "3",
    Icon: Phone,
    title: "Связывайся",
    text: "Напрямую с застройщиком — без посредников и комиссий",
  },
];

export function HowItWorks() {
  return (
    <section
      className="how-it-works-section"
      style={{ marginTop: 48 }}
      aria-labelledby="how-heading"
    >
      <header style={{ marginBottom: 24 }}>
        <h2
          id="how-heading"
          style={{
            margin: 0,
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1.2,
            letterSpacing: "-0.015em",
            color: "var(--home-text-primary)",
          }}
        >
          Как это работает
        </h2>
      </header>

      <div className="how-grid">
        {STEPS.map((s, i) => (
          <div key={s.num} className="how-step" data-last={i === STEPS.length - 1}>
            <div
              className="how-num"
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: "var(--home-accent-soft)",
                color: "var(--home-accent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 14,
              }}
            >
              {s.num}
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                color: "var(--home-accent)",
                marginBottom: 10,
              }}
            >
              <s.Icon size={28} strokeWidth={2} />
            </div>
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 17,
                color: "var(--home-text-primary)",
                marginBottom: 6,
              }}
            >
              {s.title}
            </h3>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--home-text-secondary)",
              }}
            >
              {s.text}
            </p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .how-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }
        .how-step {
          position: relative;
          padding: 24px;
          background: var(--home-surface);
          border: 1px solid var(--home-border);
          border-radius: 16px;
          transition: border-color 180ms ease;
        }
        .how-step:hover {
          border-color: var(--home-border-strong);
        }
        @media (min-width: 768px) {
          .how-step[data-last="false"]::after {
            content: "";
            position: absolute;
            top: 42px;
            right: -16px;
            width: 16px;
            height: 2px;
            background: repeating-linear-gradient(
              90deg,
              var(--home-border-strong) 0,
              var(--home-border-strong) 4px,
              transparent 4px,
              transparent 8px
            );
          }
        }
        @media (max-width: 767px) {
          .how-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </section>
  );
}

export default HowItWorks;
