"use client";

import { AIAvatar } from "./AIAvatar";
import { sanitizeAiResponse } from "@/app/shared/utils/sanitizeAiResponse";

interface ChatMessageAssistantProps {
  text: string;
  isDesktop: boolean;
}

// Ответ AI: аватар слева, пузырь сообщения справа в стиле messenger.
// aria-live на parent role="log".
export function ChatMessageAssistant({ text, isDesktop }: ChatMessageAssistantProps) {
  const columnMaxWidth = isDesktop ? "80%" : "85%";
  const fontSize = isDesktop ? 15 : 14;
  // Дополнительная защита: чистим текст на рендере, если служебный маркер
  // вдруг просочился (старая запись в кэше, ошибка API и т.п.)
  const safeText = sanitizeAiResponse(text);

  // Если после очистки строка пустая — не показываем пустой пузырь
  if (!safeText) return null;

  return (
    <div
      className="animate-fadeSlideUp"
      style={{
        display: "flex",
        justifyContent: "flex-start",
        gap: 10,
        width: "100%",
      }}
    >
      <div style={{ flexShrink: 0, alignSelf: "flex-end", marginBottom: 2 }}>
        <AIAvatar size="sm" />
      </div>
      <div
        style={{
          maxWidth: columnMaxWidth,
          padding: "10px 14px",
          background: "var(--surface)",
          border: "1px solid var(--border-color)",
          // Tail в левом нижнем углу
          borderRadius: "18px 18px 18px 4px",
          color: "var(--text-primary)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          fontWeight: 400,
          fontSize,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {safeText}
      </div>
    </div>
  );
}
