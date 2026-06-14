"use client";

export function CardSkeleton() {
  return (
    <div
      aria-hidden
      style={{
        background: "var(--home-surface)",
        border: "1px solid var(--home-border)",
        borderRadius: 18,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Photo placeholder */}
      <div
        className="shimmer"
        style={{
          width: "100%",
          aspectRatio: "5 / 6",
        }}
      />

      {/* Content */}
      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Meta line */}
        <div
          className="shimmer"
          style={{
            height: 12,
            width: "55%",
            borderRadius: 6,
          }}
        />
        {/* Title (2 lines) */}
        <div
          className="shimmer"
          style={{
            height: 14,
            width: "85%",
            borderRadius: 6,
            marginTop: 2,
          }}
        />
        <div
          className="shimmer"
          style={{
            height: 14,
            width: "65%",
            borderRadius: 6,
          }}
        />
        {/* Address */}
        <div
          className="shimmer"
          style={{
            height: 12,
            width: "70%",
            borderRadius: 6,
            marginTop: 4,
          }}
        />
        {/* Footer */}
        <div
          style={{
            marginTop: 8,
            paddingTop: 12,
            borderTop: "1px solid var(--home-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              className="shimmer"
              style={{
                height: 18,
                width: 120,
                borderRadius: 6,
              }}
            />
            <div
              className="shimmer"
              style={{
                height: 10,
                width: 80,
                borderRadius: 6,
              }}
            />
          </div>
          <div
            className="shimmer"
            style={{
              height: 12,
              width: 70,
              borderRadius: 6,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default CardSkeleton;
