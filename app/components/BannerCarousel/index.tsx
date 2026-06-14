"use client";

import { useState, useRef, useCallback } from "react";

const banners = [
  {
    id: 1,
    title: "Скидка до 15%",
    subtitle: "На квартиры в новостройках",
    gradient: "linear-gradient(135deg, #0767D7, #0055FF)",
  },
  {
    id: 2,
    title: "Рассрочка 0%",
    subtitle: "Без первоначального взноса",
    gradient: "linear-gradient(135deg, #F1117E, #C9A962)",
  },
  {
    id: 3,
    title: "Лучшие цены",
    subtitle: "Эксклюзивные предложения",
    gradient: "linear-gradient(135deg, #1EED61, #0767D7)",
  },
];

export function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / container.offsetWidth);
    setActiveIndex(index);
  }, []);

  return (
    <div className="w-full">
      {/* Scrollable banner container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full tabs-scroll"
        style={{
          overflowX: "auto",
          scrollSnapType: "x mandatory",
        }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative flex-shrink-0 w-full overflow-hidden"
            style={{
              aspectRatio: "25/9",
              borderRadius: "20px",
              scrollSnapAlign: "center",
              background: banner.gradient,
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                top: "-40px",
                right: "-20px",
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                bottom: "-30px",
                right: "60px",
              }}
            />
            <div
              className="absolute pointer-events-none"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
                top: "20px",
                left: "-20px",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center h-full px-6 sm:px-10">
              <h2
                className="font-[family-name:var(--font-stetica-bold)] text-white leading-tight"
                style={{ fontSize: "clamp(18px, 4vw, 28px)" }}
              >
                {banner.title}
              </h2>
              <p
                className="font-[family-name:var(--font-stetica-regular)] mt-1"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "clamp(12px, 2vw, 16px)",
                }}
              >
                {banner.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-[6px] mt-3">
        {banners.map((banner, idx) => (
          <div
            key={banner.id}
            style={{
              width: idx === activeIndex ? "20px" : "6px",
              height: "6px",
              borderRadius: idx === activeIndex ? "9999px" : "50%",
              backgroundColor:
                idx === activeIndex ? "white" : "rgba(255,255,255,0.4)",
              transition: "width 0.25s ease, background-color 0.25s ease",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
