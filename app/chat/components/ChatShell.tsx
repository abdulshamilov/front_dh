"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useChatHistory,
  useChatMessages,
  useVoiceInput,
} from "@/app/components/AIModal/hooks";
import { useToast } from "@/app/components/shared/Toast";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageUser } from "./ChatMessageUser";
import { ChatMessageAssistant } from "./ChatMessageAssistant";
import { ReferencedCards } from "./ReferencedCards";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";
import { ChatInputBar } from "./ChatInputBar";

export function ChatShell() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastSentRef = useRef<string>("");
  const { show: toast } = useToast();

  // Single matchMedia subscription
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // На /chat нет BottomBar (скрыт через HIDDEN_PATHS), поэтому Toast'ы
  // должны позиционироваться над ChatInputBar (~64px), не над BottomBar (~80px).
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.style.getPropertyValue("--toast-offset");
    root.style.setProperty("--toast-offset", "76px");
    return () => {
      if (prev) root.style.setProperty("--toast-offset", prev);
      else root.style.removeProperty("--toast-offset");
    };
  }, []);

  // BottomBar is hidden on /chat — drop the global main padding-bottom
  // (var(--bottom-bar-height) ≈ 88px + safe-area) so the input bar can
  // sit flush against the screen edge instead of floating ~88px above.
  useEffect(() => {
    document.body.classList.add("no-bottom-pad");
    return () => {
      document.body.classList.remove("no-bottom-pad");
    };
  }, []);

  const { history, isLoadingHistory } = useChatHistory();
  const { messages, isLoading, error, sendMessage, clearError } =
    useChatMessages();

  const { isListening, interimText, toggleListening } = useVoiceInput({
    onFinalText: (text) => setInputText(text),
  });

  useEffect(() => {
    if (isListening && interimText) {
      setInputText(interimText);
    }
  }, [isListening, interimText]);

  const allMessages = useMemo(() => {
    return [...history, ...messages].filter(
      (msg, idx, self) => idx === self.findIndex((m) => m.id === msg.id),
    );
  }, [history, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, isLoading]);

  // Toast вместо banner для ошибки + retry-кнопка.
  // Защита от дубликатов: каждый error показывается только один раз
  // (lastErrorShownRef хранит уже отображённую ошибку).
  const lastErrorShownRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== lastErrorShownRef.current) {
      lastErrorShownRef.current = error;
      const last = lastSentRef.current;
      toast(error || "Не удалось получить ответ", {
        type: "error",
        duration: 7000,
        action: last
          ? {
              label: "Повторить",
              onClick: () => {
                lastErrorShownRef.current = null;
                clearError();
                sendMessage(last);
              },
            }
          : undefined,
      });
    } else if (!error) {
      // Сбрасываем гард когда ошибка очищена снаружи (успешный response)
      lastErrorShownRef.current = null;
    }
  }, [error, toast, clearError, sendMessage]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    lastSentRef.current = text;
    setInputText("");
    sendMessage(text);
    // Возвращаем фокус на input — UX best practice
    inputRef.current?.focus();
  };

  const handleSuggestion = (text: string) => {
    if (isLoading) return;
    lastSentRef.current = text;
    sendMessage(text);
  };

  const showEmptyState =
    !isLoadingHistory && allMessages.length === 0 && !isLoading;

  return (
    <div className="chat-shell">
      <ChatHeader onBack={() => router.push("/")} />

      <div className="chat-shell__messages" role="log" aria-live="polite">
        {isLoadingHistory ? (
          <div className="chat-shell__history-loading" aria-label="Загрузка истории">
            <div className="chat-shell__spinner" />
          </div>
        ) : showEmptyState ? (
          <div className="chat-shell__empty">
            <EmptyState onSuggestionClick={handleSuggestion} disabled={isLoading} />
          </div>
        ) : (
          <div className="chat-shell__thread">
            {allMessages.map((msg) => (
              <div key={msg.id} className="chat-shell__group">
                <ChatMessageUser text={msg.message} isDesktop={isDesktop} />
                {msg.response && (
                  <ChatMessageAssistant
                    text={msg.response}
                    isDesktop={isDesktop}
                  />
                )}
                {msg.referenced_cards && msg.referenced_cards.length > 0 && (
                  <ReferencedCards cards={msg.referenced_cards} />
                )}
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInputBar
        ref={inputRef}
        value={inputText}
        onChange={setInputText}
        onSend={handleSend}
        onToggleMic={toggleListening}
        isListening={isListening}
        isLoading={isLoading}
      />

      <style jsx>{`
        .chat-shell {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          background: var(--bg-primary);
          color: var(--text-primary);
          /* Мягкий ambient glow за thread'ом — связь с hero на главной */
          background-image: radial-gradient(
            1200px 600px at 50% 0%,
            color-mix(in srgb, var(--accent-primary) 6%, transparent),
            transparent 70%
          );
        }

        .chat-shell__messages {
          flex: 1;
          overflow-y: auto;
          /* clip защищает от горизонтального scroll'а из-за negative-margin
             в ReferencedCards на узких/широких экранах */
          overflow-x: clip;
          display: flex;
          flex-direction: column;
        }

        .chat-shell__empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .chat-shell__history-loading {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
        }

        .chat-shell__spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--surface);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: chat-spin 900ms linear infinite;
        }

        .chat-shell__thread {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .chat-shell__group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @keyframes chat-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chat-shell__spinner {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

export default ChatShell;
