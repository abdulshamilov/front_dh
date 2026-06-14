"use client";

import { Clock, Trash2, Mic, MicOff } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import {
  clearSearchResults,
  fetchSearchHistory,
  clearSearchHistory,
} from "@/app/shared/redux/slices/cards";
import { useVoiceInput } from "@/app/components/AIModal/hooks/useVoiceInput";

const TYPEWRITER_PHRASES = [
  "Квартиры в Махачкале",
  "ЖК Акварель",
  "Новостройки",
  "2-комнатные",
];

const TYPE_SPEED = 50;
const HOLD_DURATION = 2000;
const ERASE_SPEED = 30;

function useTypewriter(active: boolean) {
  const [displayText, setDisplayText] = useState("");
  const phraseIndexRef = useRef(0);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) { setDisplayText(""); return; }
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      const phrase = TYPEWRITER_PHRASES[phraseIndexRef.current];
      let charIndex = 0;

      const typeNext = () => {
        if (cancelled) return;
        if (charIndex <= phrase.length) {
          setDisplayText(phrase.slice(0, charIndex));
          charIndex++;
          rafRef.current = setTimeout(typeNext, TYPE_SPEED);
        } else {
          rafRef.current = setTimeout(eraseNext, HOLD_DURATION);
        }
      };

      let eraseIndex = phrase.length;
      const eraseNext = () => {
        if (cancelled) return;
        if (eraseIndex >= 0) {
          setDisplayText(phrase.slice(0, eraseIndex));
          eraseIndex--;
          rafRef.current = setTimeout(eraseNext, ERASE_SPEED);
        } else {
          phraseIndexRef.current = (phraseIndexRef.current + 1) % TYPEWRITER_PHRASES.length;
          rafRef.current = setTimeout(runCycle, 300);
        }
      };

      typeNext();
    };

    runCycle();
    return () => { cancelled = true; if (rafRef.current !== null) clearTimeout(rafRef.current); };
  }, [active]);

  return displayText;
}

export const Search = () => {
  const searchRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { searchHistory, searchHistoryLoading } = useAppSelector((s) => s.cards);

  const [query, setQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [voiceTooltip, setVoiceTooltip] = useState<string | null>(null);

  const typewriterActive = !isFocused && query.length === 0;
  const typewriterText = useTypewriter(typewriterActive);

  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsVoiceSupported("webkitSpeechRecognition" in window || "SpeechRecognition" in window);
  }, []);

  // Sync input with URL q param on page load / back-forward
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const urlQ = params.get("q") ?? "";
    setQuery(urlQ);
  }, []);

  // submitSearch always reads current URL from window.location (no stale closure)
  const submitSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      setShowHistory(false);
      setIsFocused(false);
      if (!trimmed) {
        router.push("/");
        dispatch(clearSearchResults());
        return;
      }
      const params = new URLSearchParams(window.location.search);
      params.set("q", trimmed);
      router.push(`/?${params.toString()}`);
    },
    [router, dispatch]
  );

  const handleVoiceFinal = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setQuery(trimmed);
      submitSearch(trimmed);
    },
    [submitSearch]
  );

  const { isListening, toggleListening } = useVoiceInput({ onFinalText: handleVoiceFinal });

  const handleMicClick = useCallback(async () => {
    if (!isVoiceSupported) return;
    try {
      await toggleListening();
      setVoiceTooltip(null);
    } catch {
      setVoiceTooltip("Микрофон недоступен");
      setTimeout(() => setVoiceTooltip(null), 2500);
    }
  }, [isVoiceSupported, toggleListening]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowHistory(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showHistory && query.trim().length === 0) {
      const token = localStorage.getItem("access_token");
      if (token) dispatch(fetchSearchHistory());
    }
  }, [showHistory, query, dispatch]);

  const handleHistoryItemClick = (historyQuery: string) => {
    setQuery(historyQuery);
    submitSearch(historyQuery);
  };

  const handleClearHistory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await dispatch(clearSearchHistory());
  };

  return (
    <div className="w-full lg:flex-1 flex flex-row items-center justify-center">
      <div className="relative w-full max-w-[450px] min-w-[200px]" ref={searchRef}>
        {/* Typewriter placeholder */}
        {typewriterActive && (
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-sm sm:text-base z-10 flex items-center"
            style={{ color: "var(--text-tertiary)" }}
          >
            <span>{typewriterText}</span>
            <span style={{ animation: "cursorBlink 1s step-end infinite", marginLeft: "1px" }}>|</span>
          </div>
        )}

        {/* Form wrapper — ensures Enter submits reliably */}
        <form
          onSubmit={(e) => { e.preventDefault(); submitSearch(query); }}
          style={{ display: "contents" }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowHistory(e.target.value.trim().length === 0 && isFocused);
            }}
            onFocus={() => {
              setIsFocused(true);
              if (query.trim().length === 0) setShowHistory(true);
            }}
            onBlur={() => { setTimeout(() => setIsFocused(false), 150); }}
            placeholder=""
            className="w-full px-4 py-[9px] rounded-l-full focus:outline-none text-sm sm:text-base"
            style={{
              backgroundColor: "var(--input-dark)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              borderRight: 0,
              transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
              paddingRight: query
                ? isVoiceSupported ? "72px" : "40px"
                : isVoiceSupported ? "44px" : "16px",
            }}
          />
        </form>

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              dispatch(clearSearchResults());
              setShowHistory(true);
              router.push("/");
            }}
            className="absolute top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
            style={{ color: "var(--text-secondary)", right: isVoiceSupported ? "40px" : "8px" }}
            aria-label="Очистить поиск"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {isVoiceSupported && (
          <>
            <button
              type="button"
              onClick={handleMicClick}
              aria-label={isListening ? "Остановить запись" : "Голосовой поиск"}
              aria-pressed={isListening}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all"
              style={{
                width: "32px", height: "32px", borderRadius: "9999px",
                color: isListening ? "#ff4444" : "var(--text-secondary)",
                backgroundColor: isListening ? "rgba(255,68,68,0.12)" : "transparent",
                boxShadow: isListening ? "0 0 0 4px rgba(255,68,68,0.3)" : "none",
                animation: isListening ? "searchMicPulse 1.4s ease-in-out infinite" : "none",
              }}
              onMouseEnter={(e) => { if (!isListening) e.currentTarget.style.backgroundColor = "var(--surface-elevated)"; }}
              onMouseLeave={(e) => { if (!isListening) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            {voiceTooltip && (
              <div
                role="status"
                className="absolute right-0 top-full mt-2 px-3 py-1.5 text-xs rounded-md shadow-lg z-50"
                style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-glass)" }}
              >
                {voiceTooltip}
              </div>
            )}
            <style jsx>{`
              @keyframes searchMicPulse {
                0%, 100% { box-shadow: 0 0 0 4px rgba(255, 68, 68, 0.3); }
                50% { box-shadow: 0 0 0 8px rgba(255, 68, 68, 0.15); }
              }
            `}</style>
          </>
        )}

        {/* History dropdown */}
        {showHistory && query.trim().length === 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-auto rounded-[16px] shadow-lg z-50"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-glass)" }}
          >
            {searchHistoryLoading ? (
              <div className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>Загрузка...</div>
            ) : searchHistory.length > 0 ? (
              <>
                <div
                  className="px-4 py-2 flex items-center justify-between sticky top-0"
                  style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border-color)" }}
                >
                  <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    История поиска
                  </span>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-primary)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                  >
                    <Trash2 size={12} />
                    Очистить
                  </button>
                </div>
                {searchHistory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors border-b last:border-b-0"
                    style={{ color: "var(--text-primary)", backgroundColor: "transparent", borderColor: "var(--border-color)" }}
                    onClick={() => handleHistoryItemClick(item.query)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-elevated)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <Clock size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                    <span className="truncate">{item.query}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                История поиска пуста
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search button */}
      <button
        type="button"
        onClick={() => submitSearch(query)}
        className="flex items-center justify-center px-4 py-[11px] sm:py-[13px] rounded-r-full outline-none cursor-pointer"
        style={{
          backgroundColor: "var(--accent-primary)", color: "white",
          border: "1px solid var(--border-color)", borderLeft: 0,
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-secondary)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--accent-primary)")}
      >
        <svg className="w-[18px] h-[18px]" viewBox="0 0 17 17" fill="none">
          <path d="M16 16L12.3809 12.3809M12.3809 12.3809C12.9999 11.7618 13.491 11.0269 13.826 10.218C14.1611 9.40917 14.3335 8.54225 14.3335 7.66676C14.3335 6.79127 14.1611 5.92435 13.826 5.1155C13.491 4.30665 12.9999 3.57172 12.3809 2.95265C11.7618 2.33358 11.0269 1.84251 10.218 1.50748C9.40917 1.17244 8.54225 1 7.66676 1C6.79127 1 5.92435 1.17244 5.1155 1.50748C4.30665 1.84251 3.57172 2.33358 2.95265 2.95265C1.70239 4.20291 1 5.89863 1 7.66676C1 9.4349 1.70239 11.1306 2.95265 12.3809C4.20291 13.6311 5.89863 14.3335 7.66676 14.3335C9.4349 14.3335 11.1306 13.6311 12.3809 12.3809Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
