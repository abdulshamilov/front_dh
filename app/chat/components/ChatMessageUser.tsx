"use client";

interface ChatMessageUserProps {
  text: string;
  isDesktop: boolean;
}

// Пузырь сообщения пользователя: справа, акцентный фон.
// #FFFFFF — единственный fixed-цвет (контраст на синем accent).
export function ChatMessageUser({ text, isDesktop }: ChatMessageUserProps) {
  const maxWidth = isDesktop ? "72%" : "85%";
  const fontSize = isDesktop ? 15 : 14;

  return (
    <div
      className="animate-fadeSlideUp"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth,
          padding: "10px 14px",
          background: "var(--accent-primary)",
          color: "#FFFFFF",
          // Tail в правом нижнем углу (мессенджер-style)
          borderRadius: "18px 18px 4px 18px",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontWeight: 400,
          fontSize,
          lineHeight: 1.45,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxShadow: "0 4px 14px color-mix(in srgb, var(--accent-primary) 28%, transparent)",
        }}
      >
        {text}
      </div>
    </div>
  );
}
