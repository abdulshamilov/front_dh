"use client";

import { useCallback, useEffect, useState } from "react";

export type CityId = 0 | 1 | 2 | 3 | 4;

export const CITIES: { id: CityId; name: string }[] = [
  { id: 0, name: "Дагестан" },
  { id: 1, name: "Махачкала" },
  { id: 2, name: "Каспийск" },
  { id: 3, name: "Дербент" },
  { id: 4, name: "Избербаш" },
];

const STORAGE_KEY = "dh_selected_city";
const DEFAULT_CITY: CityId = 0;

const CITY_CHANGED_EVENT = "dh-city-changed";

function readFromStorage(): CityId {
  if (typeof window === "undefined") return DEFAULT_CITY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const num = Number(raw);
    if ([0, 1, 2, 3, 4].includes(num)) return num as CityId;
  } catch {}
  return DEFAULT_CITY;
}

export function getCityName(id: CityId): string {
  return CITIES.find((c) => c.id === id)?.name ?? "Дагестан";
}

export function useCity() {
  const [cityId, setCityIdState] = useState<CityId>(DEFAULT_CITY);

  useEffect(() => {
    setCityIdState(readFromStorage());

    const onChange = () => setCityIdState(readFromStorage());
    window.addEventListener(CITY_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CITY_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setCityId = useCallback((id: CityId) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(id));
    } catch {}
    setCityIdState(id);
    window.dispatchEvent(new CustomEvent(CITY_CHANGED_EVENT));
  }, []);

  return { cityId, cityName: getCityName(cityId), setCityId };
}
