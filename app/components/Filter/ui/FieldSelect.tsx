"use client";

import { useState, useRef, useEffect, memo } from "react";
import { ChevronDown, Check } from "lucide-react";

interface FieldSelectOption {
  value: string | number;
  label: string;
}

interface FieldSelectProps {
  label?: string;
  value?: string | number;
  onChange: (v: string) => void;
  options: FieldSelectOption[];
  placeholder?: string;
}

export const FieldSelect = memo(function FieldSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "",
}: FieldSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));
  const displayText = selectedOption?.label || placeholder || "Все";
  const hasValue = !!selectedOption;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string | number) => {
    onChange(String(optionValue));
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-stetica-medium), system-ui, sans-serif",
    fontSize: 14,
    color: "var(--text-primary)",
    margin: 0,
  };

  const triggerStyle: React.CSSProperties = {
    width: "100%",
    height: 44,
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    background: "var(--surface-elevated)",
    border: isOpen
      ? "1px solid var(--accent-primary)"
      : "1px solid var(--border-color)",
    borderRadius: 12,
    cursor: "pointer",
    transition: "border-color 160ms ease, background 160ms ease",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: hasValue ? "var(--text-primary)" : "var(--text-tertiary)",
    textAlign: "left" as const,
  };

  const itemStyle = (active: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    background: active ? "color-mix(in srgb, var(--accent-primary) 14%, transparent)" : "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: active ? "var(--accent-primary)" : "var(--text-primary)",
    textAlign: "left" as const,
    transition: "background 120ms ease",
  });

  return (
    <div ref={dropdownRef} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {label && <span style={labelStyle}>{label}</span>}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="press-scale"
          style={triggerStyle}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayText}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={2.4}
            style={{
              flexShrink: 0,
              color: "var(--text-secondary)",
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 200ms ease",
            }}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 10,
              background: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: 14,
              maxHeight: 260,
              overflowY: "auto",
              boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
              padding: 6,
            }}
          >
            <button
              type="button"
              onClick={() => handleSelect("")}
              role="option"
              aria-selected={!value}
              style={itemStyle(!value)}
            >
              <span>{placeholder || "Все"}</span>
              {!value && <Check size={16} strokeWidth={2.4} />}
            </button>
            {options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  style={itemStyle(isSelected)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} strokeWidth={2.4} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});
