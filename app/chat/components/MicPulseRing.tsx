"use client";

interface MicPulseRingProps {
  active: boolean;
}

// Two concentric animated rings rendered around an active mic button.
// Parent must have position: relative. Non-interactive, purely decorative.
export function MicPulseRing({ active }: MicPulseRingProps) {
  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <span className="mic-ring mic-ring-1" />
      <span className="mic-ring mic-ring-2" />

      <style jsx>{`
        .mic-ring {
          position: absolute;
          inset: 0;
          border: 2px solid var(--home-accent);
          border-radius: 50%;
          animation: mic-pulse-ring 2s ease-out infinite;
          will-change: transform, opacity;
        }
        .mic-ring-1 {
          animation-delay: 0s;
        }
        .mic-ring-2 {
          animation-delay: 0.4s;
        }
        @keyframes mic-pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.55;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .mic-ring {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default MicPulseRing;
