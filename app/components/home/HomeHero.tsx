"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal, ArrowRight, Clock, TrendingUp, X, Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "@/app/components/AIModal/hooks/useVoiceInput";
import axios, { API_BASE_URL } from "@/app/shared/config/axios";
import type { ICard } from "@/app/types/models";

/**
 * HomeHero — верхний блок главной в стиле референса (travel-app):
 *   • Поиск (скруглённый инпут + кнопка фильтров)
 *   • Панель "Популярное" — карточки с фото закреплённых объектов
 *     (is_pinned === true из бэкенда), скруглённые как в макете.
 *
 * Цвета берутся из дизайн-системы сайта (--home-*), тёмная тема сохранена.
 */

// Частые запросы — показываются, когда строка поиска пустая.
const FREQUENT_QUERIES = [
  "ЖК Новый горизонт",
  "Алые паруса",
  "Квартира в Махачкале",
];

// Базовые подсказки автозаполнения по тематике сайта (города, типы, категории).
const BASE_SUGGESTIONS = [
  "Квартира в Махачкале",
  "Квартира в Каспийске",
  "Квартира в Дербенте",
  "Квартира в Избербаше",
  "1-комнатная квартира",
  "2-комнатная квартира",
  "3-комнатная квартира",
  "Студия",
  "Новостройки",
  "Квартиры в рассрочку",
  "Квартиры со скидкой",
  ...FREQUENT_QUERIES,
];

const HISTORY_KEY = "dh_home_search_history";
const HISTORY_LIMIT = 6;

function readHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 10px 6px",
  fontFamily: "var(--font-inter), system-ui, sans-serif",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--home-text-tertiary)",
};

function SuggestRow({
  icon,
  text,
  query,
  onPick,
}: {
  icon: "clock" | "trend" | "search";
  text: string;
  query?: string;
  onPick: () => void;
}) {
  const Icon = icon === "clock" ? Clock : icon === "trend" ? TrendingUp : SearchIcon;

  // Подсветка совпавшей части при автозаполнении.
  let content: React.ReactNode = text;
  if (query) {
    const i = text.toLowerCase().indexOf(query.trim().toLowerCase());
    if (i >= 0) {
      const end = i + query.trim().length;
      content = (
        <>
          {text.slice(0, i)}
          <span style={{ color: "var(--home-text-primary)", fontWeight: 700 }}>
            {text.slice(i, end)}
          </span>
          {text.slice(end)}
        </>
      );
    }
  }

  return (
    <button
      type="button"
      role="option"
      onClick={onPick}
      className="home-suggest-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "11px 10px",
        border: "none",
        background: "transparent",
        borderRadius: 12,
        cursor: "pointer",
        textAlign: "left",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontSize: 14,
        color: "var(--home-text-secondary)",
      }}
    >
      <Icon size={17} strokeWidth={2} color="var(--home-text-tertiary)" style={{ flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {content}
      </span>
      <ArrowRight size={15} color="var(--home-text-tertiary)" style={{ flexShrink: 0, opacity: 0.6 }} />
    </button>
  );
}

export function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  // Названия ЖК/застройщиков из каталога — для автозаполнения по содержимому.
  const [dynamicNames, setDynamicNames] = useState<string[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  // Закреплённые объекты + сбор названий для подсказок. Бэкенд не фильтрует
  // по is_pinned на сервере, поэтому берём страницу каталога и отбираем на клиенте.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get<{ results?: ICard[] } | ICard[]>(
          `${API_BASE_URL}/cards/?limit=100&page=1`
        );
        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        if (cancelled) return;
        // Уникальные названия застройщиков/ЖК из каталога.
        const names = new Set<string>();
        rows.forEach((c) => {
          const dev = c.developer?.name?.trim();
          if (dev) names.add(dev);
        });
        setDynamicNames([...names]);
      } catch {
        /* пусто — панель просто не покажется */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Полный пул подсказок (база + названия из каталога), без дублей.
  const suggestionPool = useMemo(
    () => Array.from(new Set([...BASE_SUGGESTIONS, ...dynamicNames])),
    [dynamicNames]
  );

  // Автозаполнение по введённому тексту.
  const autocomplete = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return suggestionPool
      .filter((s) => s.toLowerCase().includes(q) && s.toLowerCase() !== q)
      .slice(0, 7);
  }, [query, suggestionPool]);

  const saveHistory = useCallback((raw: string) => {
    const q = raw.trim();
    if (!q) return;
    setHistory((prev) => {
      const next = [q, ...prev.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(
        0,
        HISTORY_LIMIT
      );
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const runSearch = useCallback(
    (raw: string) => {
      const q = raw.trim();
      setFocused(false);
      if (!q) {
        router.push("/");
        return;
      }
      setQuery(q);
      saveHistory(q);
      router.push(`/?q=${encodeURIComponent(q)}`);
    },
    [router, saveHistory]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  // ── Голосовой поиск (Web Speech API, как в поиске шапки) ──
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  useEffect(() => {
    setIsVoiceSupported(
      "webkitSpeechRecognition" in window || "SpeechRecognition" in window
    );
  }, []);

  const handleVoiceFinal = useCallback(
    (text: string) => {
      if (text.trim()) runSearch(text);
    },
    [runSearch]
  );

  const { isListening, interimText, toggleListening } = useVoiceInput({
    onFinalText: handleVoiceFinal,
  });

  // Живая транскрипция: пока идёт запись, показываем распознанный текст в инпуте
  useEffect(() => {
    if (isListening && interimText) setQuery(interimText);
  }, [isListening, interimText]);

  const showDropdown = focused;
  const isEmptyQuery = query.trim().length === 0;

  return (
    <section aria-label="Поиск и популярное" style={{ padding: "0 16px" }}>
      {/* ── Поиск (стиль референса: скруглённый инпут + кнопка фильтров) ── */}
      <form
        onSubmit={submitSearch}
        style={{ display: "flex", alignItems: "flex-start", gap: 12, margin: "6px 0 18px" }}
      >
        <div
          style={{ position: "relative", flex: 1, minWidth: 0 }}
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              height: 48,
              padding: "0 14px",
              background: "var(--home-surface)",
              border: `1px solid ${focused ? "var(--home-accent)" : "var(--home-border-strong)"}`,
              borderRadius: 17,
              boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
              transition: "border-color 160ms ease",
            }}
          >
            <SearchIcon size={18} strokeWidth={2} color="var(--home-text-tertiary)" style={{ flexShrink: 0 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isListening ? "Говорите…" : "Найти квартиру или ЖК"}
              aria-label="Поиск по квартирам и ЖК"
              autoComplete="off"
              style={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: 15,
                color: "var(--home-text-primary)",
              }}
            />
            {query && !isListening && (
              <button
                type="button"
                aria-label="Очистить"
                onClick={() => setQuery("")}
                style={{
                  display: "flex",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 4,
                  flexShrink: 0,
                }}
              >
                <X size={16} color="var(--home-text-tertiary)" />
              </button>
            )}
            {isVoiceSupported && (
              <button
                type="button"
                aria-label={isListening ? "Остановить запись" : "Голосовой поиск"}
                aria-pressed={isListening}
                onClick={() => { void toggleListening(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                  color: isListening ? "var(--home-danger)" : "var(--home-text-tertiary)",
                  background: isListening ? "rgba(255,68,68,0.12)" : "transparent",
                  animation: isListening ? "heroMicPulse 1.4s ease-in-out infinite" : "none",
                  transition: "color 160ms ease, background 160ms ease",
                }}
              >
                {isListening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
            )}
          </div>

          {/* ── Выпадашка: история / частые запросы / автозаполнение ── */}
          {showDropdown && (
            <div
              role="listbox"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                right: 0,
                zIndex: 30,
                background: "var(--home-surface)",
                border: "1px solid var(--home-border-strong)",
                borderRadius: 18,
                boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
                padding: 8,
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {isEmptyQuery ? (
                <>
                  {history.length > 0 && (
                    <>
                      <div style={sectionHeaderStyle}>
                        <span>Вы искали</span>
                        <button
                          type="button"
                          onClick={clearHistory}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--home-accent-link)",
                            fontFamily: "var(--font-inter), system-ui, sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          Очистить
                        </button>
                      </div>
                      {history.map((h) => (
                        <SuggestRow key={`h-${h}`} icon="clock" text={h} onPick={() => runSearch(h)} />
                      ))}
                    </>
                  )}
                  {/* Частые запросы — только для новичков: как только появилась
                      своя история поиска, показываем лишь её. */}
                  {history.length === 0 && (
                    <>
                      <div style={sectionHeaderStyle}>
                        <span>Частые запросы</span>
                      </div>
                      {FREQUENT_QUERIES.map((f) => (
                        <SuggestRow key={`f-${f}`} icon="trend" text={f} onPick={() => runSearch(f)} />
                      ))}
                    </>
                  )}
                </>
              ) : autocomplete.length > 0 ? (
                autocomplete.map((s) => (
                  <SuggestRow key={`a-${s}`} icon="search" text={s} query={query} onPick={() => runSearch(s)} />
                ))
              ) : (
                <SuggestRow icon="search" text={`Искать «${query.trim()}»`} onPick={() => runSearch(query)} />
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Фильтры поиска"
          onClick={() => window.dispatchEvent(new CustomEvent("open-filters"))}
          className="home-hero-tile"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 48,
            height: 48,
            flexShrink: 0,
            background: "var(--home-accent)",
            border: "none",
            borderRadius: 17,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,117,255,0.35)",
          }}
        >
          <SlidersHorizontal size={20} strokeWidth={2.2} color="#FFFFFF" />
        </button>
      </form>

      <style jsx>{`
        .home-hero-tile {
          transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .home-hero-tile:active {
          transform: scale(0.96);
        }
        .home-suggest-row:hover {
          background: var(--home-surface-elevated) !important;
        }
        @keyframes heroMicPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(255, 68, 68, 0.25); }
          50% { box-shadow: 0 0 0 9px rgba(255, 68, 68, 0.1); }
        }
      `}</style>
    </section>
  );
}

export default HomeHero;
