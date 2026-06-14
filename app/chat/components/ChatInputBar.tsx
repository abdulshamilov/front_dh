"use client";

import {
  type KeyboardEvent,
  type ChangeEvent,
  forwardRef,
  useEffect,
  useRef,
} from "react";
import { Mic, MicOff, ArrowUp } from "lucide-react";
import { MicPulseRing } from "./MicPulseRing";

interface ChatInputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onToggleMic: () => void;
  isListening: boolean;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInputBar = forwardRef<HTMLInputElement, ChatInputBarProps>(
  function ChatInputBar(
    {
      value,
      onChange,
      onSend,
      onToggleMic,
      isListening,
      isLoading,
      placeholder = "Опиши квартиру мечты…",
    },
    ref
  ) {
    const canSend = value.trim().length > 0 && !isLoading;
    const wrapRef = useRef<HTMLDivElement | null>(null);

    // Follow the iOS soft keyboard. visualViewport.height shrinks while
    // window.innerHeight stays constant when the keyboard opens, so the
    // delta tells us how many pixels are covered by the keyboard. We
    // translate the bar up by that amount so it sits right above the
    // keyboard. On Android Chrome ≥108 + desktop the delta is 0 → no-op.
    useEffect(() => {
      if (typeof window === "undefined") return;
      const vv = window.visualViewport;
      const wrap = wrapRef.current;
      if (!vv || !wrap) return;

      const update = () => {
        const offset = window.innerHeight - vv.height - vv.offsetTop;
        wrap.style.transform =
          offset > 0 ? `translateY(${-offset}px)` : "";
      };
      update();
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
      return () => {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
        wrap.style.transform = "";
      };
    }, []);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (canSend) onSend();
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <div ref={wrapRef} className="chat-input-bar">
        <div
          className={`chat-input-bar__pill${isListening ? " is-listening" : ""}`}
        >
          <input
            ref={ref}
            className="chat-input-bar__input"
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
            aria-label="Сообщение для ИИ"
          />

          <button
            type="button"
            className={`chat-input-bar__mic${isListening ? " is-active" : ""}`}
            onClick={onToggleMic}
            disabled={isLoading}
            aria-label={isListening ? "Остановить запись" : "Начать запись"}
          >
            {isListening ? (
              <MicOff size={18} strokeWidth={2.4} color="#FFFFFF" />
            ) : (
              <Mic size={18} strokeWidth={2.4} color="var(--accent-primary)" />
            )}
            {isListening && <MicPulseRing active />}
          </button>

          <button
            type="button"
            className={`chat-input-bar__send${canSend ? " is-enabled" : ""}`}
            onClick={onSend}
            disabled={!canSend}
            aria-label="Отправить"
          >
            <ArrowUp
              size={18}
              strokeWidth={2.6}
              color={canSend ? "#FFFFFF" : "var(--text-tertiary)"}
            />
          </button>
        </div>

        <style jsx>{`
          .chat-input-bar {
            position: relative;
            z-index: 5;
            padding: 6px 12px calc(8px + env(safe-area-inset-bottom));
            background: var(--bg-primary);
            border-top: 1px solid var(--border-color);
            transition: transform 180ms cubic-bezier(0.32, 0.72, 0, 1);
            will-change: transform;
          }

          @media (prefers-reduced-motion: reduce) {
            .chat-input-bar {
              transition: none !important;
            }
          }

          .chat-input-bar__pill {
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--surface);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 4px 4px 4px 14px;
            transition:
              box-shadow 200ms ease,
              border-color 200ms ease,
              background 200ms ease;
          }

          .chat-input-bar__pill.is-listening {
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-primary) 18%, transparent);
            border-color: var(--accent-primary);
          }

          .chat-input-bar__input {
            flex: 1;
            min-width: 0;
            background: transparent;
            border: none;
            outline: none;
            color: var(--text-primary);
            font-family: var(--font-inter), system-ui, sans-serif;
            font-weight: 400;
            /* 16px обязательны на iOS чтобы не было zoom при focus */
            font-size: 16px;
            line-height: 1.4;
            padding: 4px 0;
          }

          .chat-input-bar__input::placeholder {
            color: var(--text-tertiary);
          }

          .chat-input-bar__input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .chat-input-bar__mic {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            flex-shrink: 0;
            background: transparent;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            padding: 0;
            transition: background-color 160ms ease, transform 120ms ease;
          }

          .chat-input-bar__mic:disabled {
            cursor: not-allowed;
            opacity: 0.5;
          }

          .chat-input-bar__mic.is-active {
            background: var(--error);
          }

          @media (hover: hover) {
            .chat-input-bar__mic:not(.is-active):not(:disabled):hover {
              background: var(--surface-elevated);
            }
          }

          .chat-input-bar__send {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            background: var(--surface-elevated);
            border: 1px solid var(--border-color);
            border-radius: 999px;
            cursor: not-allowed;
            padding: 0;
            transition: background-color 160ms ease, transform 120ms ease;
          }

          .chat-input-bar__send.is-enabled {
            background: var(--accent-primary);
            border-color: var(--accent-primary);
            cursor: pointer;
          }

          @media (hover: hover) {
            .chat-input-bar__send.is-enabled:hover {
              background: var(--accent-primary-dark, var(--accent-primary));
              filter: brightness(1.1);
            }
          }

          .chat-input-bar__send.is-enabled:active {
            transform: scale(0.94);
          }

          @media (prefers-reduced-motion: reduce) {
            .chat-input-bar__pill,
            .chat-input-bar__mic,
            .chat-input-bar__send {
              transition: none !important;
            }
            .chat-input-bar__send.is-enabled:active {
              transform: none !important;
            }
          }
        `}</style>
      </div>
    );
  }
);
