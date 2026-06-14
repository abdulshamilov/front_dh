"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

interface ICatalogListProps {
  List: ICatalogListItem[];
}

interface ICatalogListItem {
  name: string;
  query: string;
}

export const CatalogList = ({ List }: ICatalogListProps) => {
  const catalog = useSearchParams().get("catalog");
  const [catalogItem, setCatalogItem] = useState<ICatalogListItem | null>(
    List.find((item) => item.query === catalog) || null
  );
  return (
    <nav aria-label="Каталог">
      <div className="w-full max-w-[1300px] mx-auto">
        <div className="md:hidden">
          <div
            className="flex gap-3 overflow-x-auto px-1 snap-x snap-mandatory"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "var(--border-color) transparent",
            }}
          >
            {List.map((item, index) => {
              const isActive = item.query === catalogItem?.query;
              return (
                <Link
                  key={index}
                  href={{ query: { catalog: item.query } }}
                  onClick={() => {
                    if (catalogItem === item) return;
                    setCatalogItem(item);
                  }}
                  className="snap-center flex-shrink-0 inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm transition-all duration-200 ease-in-out"
                  style={{
                    border: isActive
                      ? "1px solid var(--accent-primary)"
                      : "1px solid var(--border-color)",
                    backgroundColor: isActive
                      ? "var(--accent-primary)"
                      : "var(--card-bg)",
                    color: isActive ? "#FFFFFF" : "var(--text-primary)",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor =
                        "var(--accent-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = "var(--border-color)";
                    }
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block">
          <div className="w-full flex gap-x-3 items-center content-center justify-start">
            {List.map((item, index) => {
              const isActive = item.query === catalogItem?.query;
              return (
                <li key={index} className="w-auto flex justify-center">
                  <Link
                    href={{ query: { catalog: item.query } }}
                    onClick={() => {
                      if (catalogItem === item) return;
                      setCatalogItem(item);
                    }}
                    className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm md:text-base transition-all duration-200 ease-in-out"
                    style={{
                      border: isActive
                        ? "1px solid var(--accent-primary)"
                        : "1px solid var(--border-color)",
                      backgroundColor: isActive
                        ? "var(--accent-primary)"
                        : "var(--card-bg)",
                      color: isActive ? "#FFFFFF" : "var(--text-primary)",
                      transition: "all 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor =
                          "var(--accent-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor =
                          "var(--border-color)";
                      }
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
