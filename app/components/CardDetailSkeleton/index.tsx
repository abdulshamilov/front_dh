export function CardDetailSkeleton() {
  return (
    <div
      className="min-h-dvh"
      style={{
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Carousel Skeleton */}
            <div
              className="w-full aspect-[16/9] rounded-2xl shimmer"
            />

            {/* Title and Price Skeleton */}
            <div
              className="p-6 rounded-2xl space-y-4 glass-card"
            >
              <div
                className="h-8 w-3/4 rounded shimmer"
              />
              <div
                className="h-10 w-1/2 rounded shimmer"
              />
            </div>

            {/* Accordions Skeleton */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl glass-card"
              >
                <div
                  className="h-6 w-1/3 rounded shimmer"
                />
              </div>
            ))}
          </div>

          {/* Aside Panel Skeleton */}
          <div className="lg:w-[400px] space-y-6">
            <div
              className="p-6 rounded-2xl space-y-4 glass-card"
            >
              <div
                className="h-12 w-full rounded-lg shimmer"
              />
              <div
                className="h-12 w-full rounded-lg shimmer"
              />
              <div
                className="h-16 w-full rounded-lg shimmer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
