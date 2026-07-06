"use client";

/**
 * Skeleton mirroring the v2 detail layout (C.0): DetailHeroGallery skeleton
 * (4:5 box, bottom 15px radius) + DetailAppartament SkeletonContent.
 * Shimmer is a self-contained CSS keyframe (no external libs), disabled
 * under prefers-reduced-motion.
 */
export function CardDetailV2Skeleton() {
  return (
    <div
      className="force-dark"
      style={{
        backgroundColor: "var(--bg-primary)",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Hero placeholder: 4:5, bottom 15px radius, shimmer */}
        <div
          className="dh-shimmer"
          style={{
            width: "100%",
            aspectRatio: "4 / 5",
            backgroundColor: "var(--surface)",
            borderRadius: "0 0 15px 15px",
          }}
          aria-hidden="true"
        />

        {/* Content: padding 16 */}
        <div style={{ padding: "16px" }}>
          {/* Price line: 50% x 32, r8 */}
          <div
            className="dh-shimmer"
            style={{
              width: "50%",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: "var(--surface)",
            }}
          />

          <div style={{ height: "8px" }} />

          {/* Title line: 80% x 24, r8 */}
          <div
            className="dh-shimmer"
            style={{
              width: "80%",
              height: "24px",
              borderRadius: "8px",
              backgroundColor: "var(--surface)",
            }}
          />

          <div style={{ height: "16px" }} />

          {/* Chips row: 3x 80x28, r9999 */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="dh-shimmer"
                style={{
                  width: "80px",
                  height: "28px",
                  borderRadius: "9999px",
                  backgroundColor: "var(--surface)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dh-shimmer {
          position: relative;
          overflow: hidden;
        }
        .dh-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.06) 50%,
            transparent 100%
          );
          animation: dh-shimmer-move 1600ms linear infinite;
        }
        @keyframes dh-shimmer-move {
          100% {
            transform: translateX(100%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .dh-shimmer::after {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default CardDetailV2Skeleton;
