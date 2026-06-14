export function CardSkeleton() {
  return (
    <div
      className="font-[family-name:var(--font-stetica-bold)] w-full overflow-hidden flex flex-col h-full glass-card"
      style={{
        borderRadius: "var(--radius-lg)",
      }}
    >
      {/* Image placeholder -- 5:6 aspect ratio */}
      <div
        className="relative w-full shimmer"
        style={{ aspectRatio: "5/6" }}
      />

      {/* Content placeholder */}
      <div className="w-full flex flex-col gap-y-2 px-3 py-3 flex-grow">
        {/* Price */}
        <div
          className="h-5 w-2/3 shimmer"
          style={{ borderRadius: "var(--radius-xs)" }}
        />

        {/* Title */}
        <div
          className="h-4 w-full shimmer"
          style={{ borderRadius: "var(--radius-xs)" }}
        />
        <div
          className="h-4 w-4/5 shimmer"
          style={{ borderRadius: "var(--radius-xs)" }}
        />

        {/* Rating + location */}
        <div className="flex gap-2 mt-1">
          <div
            className="h-4 w-12 shimmer"
            style={{ borderRadius: "var(--radius-xs)" }}
          />
          <div
            className="h-4 w-24 shimmer"
            style={{ borderRadius: "var(--radius-xs)" }}
          />
        </div>
      </div>
    </div>
  );
}
