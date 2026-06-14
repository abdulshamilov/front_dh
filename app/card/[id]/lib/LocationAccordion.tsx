"use client";

import { MapWidget } from "@/app/card/[id]/lib/MapWidget";
import { useState } from "react";

export function LocationAccordion({
  latitude,
  longitude,
  address,
}: {
  latitude: number;
  longitude: number;
  address: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const isValid =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0);
  return (
    <details
      open={isOpen}
      className="mb-4 overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border-glass)",
      }}
    >
      <summary
        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none font-[family-name:var(--font-stetica-bold)] text-lg"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((v) => !v);
        }}
        aria-expanded={isOpen}
        style={{ color: "var(--text-primary)" }}
      >
        Расположение
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </summary>
      <div
        className="w-full h-[280px] px-6 pb-6 pt-2 rounded-xl"
        style={{ backgroundColor: "var(--surface)" }}
      >
        {isValid ? (
          <div
            className="w-full h-full rounded-xl overflow-hidden"
            style={{ backgroundColor: "var(--surface-elevated)" }}
          >
            <MapWidget
              address={address}
              latitude={latitude}
              longitude={longitude}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: "var(--text-secondary)" }}
            >
              <path
                d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ color: "var(--text-secondary)" }}>
              Карта недоступна
            </span>
            {address && (
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {address}
              </span>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
