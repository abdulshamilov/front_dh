"use client";

import { Sparkles } from "lucide-react";

interface AIAvatarProps {
  size?: "sm" | "md" | "lg";
}

// AI avatar: gradient circle with Sparkles icon. Mirrors mobile AIScreen.kt visual.
export function AIAvatar({ size = "md" }: AIAvatarProps) {
  const boxSize = size === "sm" ? 28 : size === "lg" ? 72 : 40;
  const iconSize = size === "sm" ? 16 : size === "lg" ? 38 : 22;
  const glow =
    size === "lg" ? "0 0 40px rgba(0,117,255,0.35)" : "none";

  return (
    <div
      role="img"
      aria-label="DreamHouse AI"
      style={{
        width: boxSize,
        height: boxSize,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, var(--home-accent) 0%, var(--home-accent-link) 100%)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: glow,
      }}
    >
      <Sparkles size={iconSize} color="#FFFFFF" strokeWidth={2} />
    </div>
  );
}

export default AIAvatar;
