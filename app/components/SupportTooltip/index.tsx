"use client";

import { useState, useRef, useEffect } from "react";
import { SHORT_PHONE_DISPLAY, SHORT_PHONE_TEL } from "@/app/shared/utils/contacts";

interface SupportTooltipProps {
  children: React.ReactNode;
  className?: string;
  placement?: "top" | "bottom";
}

export const SupportTooltip = ({ children, className, placement = "bottom" }: SupportTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = SHORT_PHONE_TEL;
  };

  return (
    <div className="relative" ref={triggerRef}>
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className={className}
      >
        {children}
      </div>
      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute right-0 z-50 ${
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div
            className="px-3 py-2 rounded-[12px] text-xs font-[family-name:var(--font-stetica-regular)]"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-primary)",
            }}
          >
            <div
              className="mb-1 text-[12px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Техническая поддержка
            </div>
            <a
              href={SHORT_PHONE_TEL}
              onClick={handlePhoneClick}
              className="hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{ color: "var(--text-primary)" }}
            >
              {SHORT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
