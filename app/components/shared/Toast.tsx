"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  action?: ToastAction;
  duration: number;
}

interface ToastContextValue {
  show: (
    message: string,
    options?: { type?: ToastType; action?: ToastAction; duration?: number }
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastContextValue["show"]>(
    (message, options) => {
      const id = ++idRef.current;
      const item: ToastItem = {
        id,
        message,
        type: options?.type ?? "info",
        action: options?.action,
        duration: options?.duration ?? 5000,
      };
      setItems((prev) => [...prev, item]);
      window.setTimeout(() => dismiss(id), item.duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Stack снизу страницы. Высоту над bottom-edge берём из CSS-переменной,
          которую страницы могут переопределить (например /chat задаёт другой
          offset из-за ChatInputBar вместо BottomBar). */}
      <div
        aria-live="polite"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + var(--toast-offset, 80px))",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          pointerEvents: "none",
          padding: "0 16px",
        }}
      >
        {/* Ограничиваем стек двумя последними тостами — UX-стандарт */}
        {items.slice(-2).map((t) => (
          <ToastBar key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastBar({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const Icon =
    item.type === "success" ? CheckCircle2 : item.type === "error" ? AlertCircle : Info;
  const accent =
    item.type === "success"
      ? "var(--success)"
      : item.type === "error"
        ? "var(--error)"
        : "var(--accent-primary)";

  return (
    <div
      role={item.type === "error" ? "alert" : "status"}
      style={{
        pointerEvents: "auto",
        maxWidth: 480,
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 14,
        backgroundColor: "var(--surface-elevated)",
        border: "1px solid var(--border-color)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transform: visible ? "translateY(0)" : "translateY(20px)",
        opacity: visible ? 1 : 0,
        transition: "transform 200ms ease-out, opacity 200ms ease-out",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      <Icon size={18} strokeWidth={2.4} style={{ color: accent, flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          color: "var(--text-primary)",
          lineHeight: 1.35,
        }}
      >
        {item.message}
      </span>
      {item.action && (
        <button
          type="button"
          onClick={() => {
            item.action!.onClick();
            onDismiss();
          }}
          className="press-scale"
          style={{
            flexShrink: 0,
            padding: "6px 12px",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: accent,
            fontFamily: "var(--font-stetica-medium)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {item.action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onDismiss}
        className="press-scale"
        style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          borderRadius: 8,
          border: "none",
          background: "transparent",
          color: "var(--text-tertiary)",
          cursor: "pointer",
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
