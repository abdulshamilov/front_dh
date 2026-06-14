"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CITIES, CityId, useCity } from "@/app/shared/hooks/useCity";

type Variant = "pill" | "stacked";

interface CityPickerProps {
  variant?: Variant;
}

export function CityPicker({ variant = "pill" }: CityPickerProps) {
  const { cityId, cityName, setCityId } = useCity();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const toggle = () => {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left });
    }
    setOpen(!open);
  };

  const handleSelect = (id: CityId) => {
    setCityId(id);
    setOpen(false);
    // Sync URL on the home page so listings refetch with new city
    if (pathname === "/") {
      const params = new URLSearchParams(searchParams.toString());
      if (id === 0) {
        params.delete("city");
      } else {
        params.set("city", String(id));
      }
      router.push(`/?${params.toString()}`, { scroll: false });
    }
  };

  const trigger = variant === "pill" ? (
    <button
      ref={triggerRef}
      type="button"
      onClick={toggle}
      className="flex items-center gap-[6px] rounded-full px-3 py-2 transition-colors cursor-pointer"
      style={{ color: "#FFFFFF", background: open ? "rgba(255,255,255,0.12)" : "transparent" }}
      onMouseEnter={(e) => !open && (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")}
      onMouseLeave={(e) => !open && (e.currentTarget.style.backgroundColor = "transparent")}
      aria-label="Выбрать город"
      aria-expanded={open}
    >
      <MapPin size={18} strokeWidth={2} color="#FFFFFF" />
      <span style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontWeight: 600, fontSize: 16, color: "#FFFFFF", lineHeight: 1 }}>
        {cityName}
      </span>
      <ChevronDown size={14} strokeWidth={2} color="#FFFFFF" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
    </button>
  ) : (
    <button
      ref={triggerRef}
      type="button"
      onClick={toggle}
      className="flex flex-col items-start gap-[2px] cursor-pointer"
      aria-label="Выбрать город"
      aria-expanded={open}
      style={{ background: "transparent", border: "none", padding: 0 }}
    >
      <span style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontWeight: 500, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1 }}>
        Ваша локация
      </span>
      <span className="flex items-center gap-[4px]" style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", fontWeight: 700, fontSize: 18, color: "#FFFFFF", lineHeight: 1.2 }}>
        {cityName}
        <ChevronDown size={16} strokeWidth={2.5} color="#FFFFFF" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </span>
    </button>
  );

  const dropdown = open && coords && typeof window !== "undefined" ? createPortal(
    (
      <div
        ref={dropdownRef}
        role="listbox"
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          zIndex: 1000,
          minWidth: 200,
          backgroundColor: "#1D2024",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          padding: 4,
        }}
      >
          {CITIES.map((c) => {
            const active = c.id === cityId;
            return (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => handleSelect(c.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "11px 12px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: active ? "rgba(0,117,255,0.15)" : "transparent",
                  color: "#FFFFFF",
                  fontSize: 14,
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontWeight: active ? 600 : 500,
                  textAlign: "left",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => !active && (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}
                onMouseLeave={(e) => !active && (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <span>{c.name}</span>
                {active && <Check size={16} color="#0075FF" />}
              </button>
            );
          })}
      </div>
    ),
    document.body
  ) : null;

  return (
    <>
      {trigger}
      {dropdown}
    </>
  );
}
