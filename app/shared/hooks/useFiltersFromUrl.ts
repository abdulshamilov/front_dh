"use client";

import { ICardFilters } from "@/app/types";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";

export function parseFiltersFromUrl(
  searchParams: URLSearchParams
): ICardFilters {
  const filters: ICardFilters = {};
  const city = searchParams.get("city");
  if (city) {
    const cityNum = Number(city);
    if ([1, 2, 3, 4].includes(cityNum)) {
      filters.city = cityNum as 1 | 2 | 3 | 4;
    }
  }
  const category = searchParams.get("category");
  if (category && ["flat", "new_building", "secondary"].includes(category)) {
    filters.category = category as "flat" | "new_building" | "secondary";
  }
  const house_type = searchParams.get("house_type");
  if (house_type && ["brick", "panel", "monolith", "brick_monolith", "solid_monolith"].includes(house_type)) {
    filters.house_type = house_type as "brick" | "panel" | "monolith" | "brick_monolith" | "solid_monolith";
  }
  const complex_type = searchParams.get("complex_type");
  if (complex_type && ["residential", "apart"].includes(complex_type)) {
    filters.complex_type = complex_type as "residential" | "apart";
  }
  const elevator = searchParams.get("elevator");
  if (elevator && ["none", "passenger", "cargo", "cargo_passenger", "passenger_and_cargo"].includes(elevator)) {
    filters.elevator = elevator as "none" | "passenger" | "cargo" | "cargo_passenger" | "passenger_and_cargo";
  }
  const parking = searchParams.get("parking");
  if (parking && ["none", "underground", "ground", "two_level"].includes(parking)) {
    filters.parking = parking as "none" | "underground" | "ground" | "two_level";
  }
  const developer = searchParams.get("developer");
  if (developer) filters.developer = Number(developer);
  const finishing = searchParams.get("finishing");
  if (finishing && ["none", "with_finish"].includes(finishing)) {
    filters.finishing = finishing as "none" | "with_finish";
  }
  const balcony = searchParams.get("balcony");
  if (balcony) filters.balcony = balcony === "true";
  const loggia = searchParams.get("loggia");
  if (loggia) filters.loggia = loggia === "true";
  const price_min = searchParams.get("price_min");
  if (price_min) filters.price_min = Number(price_min);

  const price_max = searchParams.get("price_max");
  if (price_max) filters.price_max = Number(price_max);

  const area_min = searchParams.get("area_min");
  if (area_min) filters.area_min = Number(area_min);

  const area_max = searchParams.get("area_max");
  if (area_max) filters.area_max = Number(area_max);

  const floors_min = searchParams.get("floors_min");
  if (floors_min) filters.floors_min = Number(floors_min);

  const floors_max = searchParams.get("floors_max");
  if (floors_max) filters.floors_max = Number(floors_max);

  const rooms_min = searchParams.get("rooms_min");
  if (rooms_min) filters.rooms_min = Number(rooms_min);

  const rooms_max = searchParams.get("rooms_max");
  if (rooms_max) filters.rooms_max = Number(rooms_max);

  const ceiling_height_min = searchParams.get("ceiling_height_min");
  if (ceiling_height_min) filters.ceiling_height_min = Number(ceiling_height_min);

  const ceiling_height_max = searchParams.get("ceiling_height_max");
  if (ceiling_height_max) filters.ceiling_height_max = Number(ceiling_height_max);

  const price_per_sqm_min = searchParams.get("price_per_sqm_min");
  if (price_per_sqm_min) filters.price_per_sqm_min = Number(price_per_sqm_min);

  const price_per_sqm_max = searchParams.get("price_per_sqm_max");
  if (price_per_sqm_max) filters.price_per_sqm_max = Number(price_per_sqm_max);

  const search = searchParams.get("search");
  if (search) filters.search = search;

  return filters;
}

/**
 * Сериализует фильтры в URL параметры
 */
export function serializeFiltersToUrl(filters: ICardFilters): string {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", String(filters.city));
  if (filters.category) params.set("category", filters.category);
  if (filters.complex_type) params.set("complex_type", filters.complex_type);
  if (filters.house_type) params.set("house_type", filters.house_type);
  if (filters.developer) params.set("developer", String(filters.developer));
  if (filters.elevator) params.set("elevator", filters.elevator);
  if (filters.parking) params.set("parking", filters.parking);
  if (filters.finishing) params.set("finishing", filters.finishing);
  if (filters.balcony !== undefined) {
    params.set("balcony", String(filters.balcony));
  }
  if (filters.loggia !== undefined) {
    params.set("loggia", String(filters.loggia));
  }
  if (filters.price_min !== undefined && filters.price_min !== null) {
    params.set("price_min", String(filters.price_min));
  }
  if (filters.price_max !== undefined && filters.price_max !== null) {
    params.set("price_max", String(filters.price_max));
  }
  if (filters.area_min !== undefined && filters.area_min !== null) {
    params.set("area_min", String(filters.area_min));
  }
  if (filters.area_max !== undefined && filters.area_max !== null) {
    params.set("area_max", String(filters.area_max));
  }
  if (filters.floors_min !== undefined && filters.floors_min !== null) {
    params.set("floors_min", String(filters.floors_min));
  }
  if (filters.floors_max !== undefined && filters.floors_max !== null) {
    params.set("floors_max", String(filters.floors_max));
  }
  if (filters.rooms_min !== undefined && filters.rooms_min !== null) {
    params.set("rooms_min", String(filters.rooms_min));
  }
  if (filters.rooms_max !== undefined && filters.rooms_max !== null) {
    params.set("rooms_max", String(filters.rooms_max));
  }
  if (filters.ceiling_height_min !== undefined && filters.ceiling_height_min !== null) {
    params.set("ceiling_height_min", String(filters.ceiling_height_min));
  }
  if (filters.ceiling_height_max !== undefined && filters.ceiling_height_max !== null) {
    params.set("ceiling_height_max", String(filters.ceiling_height_max));
  }
  if (filters.price_per_sqm_min !== undefined && filters.price_per_sqm_min !== null) {
    params.set("price_per_sqm_min", String(filters.price_per_sqm_min));
  }
  if (filters.price_per_sqm_max !== undefined && filters.price_per_sqm_max !== null) {
    params.set("price_per_sqm_max", String(filters.price_per_sqm_max));
  }
  if (filters.search) {
    params.set("search", filters.search);
  }

  return params.toString();
}

/**
 * Сравнивает два объекта фильтров на равенство
 */
function areFiltersEqual(filters1: ICardFilters, filters2: ICardFilters): boolean {
  const keys1 = Object.keys(filters1).sort();
  const keys2 = Object.keys(filters2).sort();
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (filters1[key as keyof ICardFilters] !== filters2[key as keyof ICardFilters]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Хук для работы с фильтрами через URL
 */
export function useFiltersFromUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ICardFilters>(() => parseFiltersFromUrl(searchParams));
  const filtersRef = useRef<ICardFilters>(filters);
  const isUpdatingRef = useRef(false);
  
  // Мемоизируем сериализованную строку searchParams для сравнения
  const searchParamsString = searchParams.toString();
  const prevSearchParamsStringRef = useRef<string>(searchParamsString);
  
  useEffect(() => {
    // Пропускаем обновление, если мы сами только что обновили URL
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }
    
    // Обновляем только если searchParams действительно изменились
    if (searchParamsString !== prevSearchParamsStringRef.current) {
      prevSearchParamsStringRef.current = searchParamsString;
      const parsedFilters = parseFiltersFromUrl(searchParams);
      
      // Обновляем только если фильтры действительно изменились
      if (!areFiltersEqual(parsedFilters, filtersRef.current)) {
        filtersRef.current = parsedFilters;
        setFilters(parsedFilters);
      }
    }
  }, [searchParamsString, searchParams]);
  
  const updateFilters = useCallback(
    (newFilters: ICardFilters) => {
      // Обновляем только если фильтры действительно изменились
      if (!areFiltersEqual(newFilters, filtersRef.current)) {
        filtersRef.current = newFilters;
        setFilters(newFilters);
        isUpdatingRef.current = true;
        const queryString = serializeFiltersToUrl(newFilters);
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(newUrl, { scroll: false });
      }
    },
    [pathname, router]
  );

  const memoizedFilters = useMemo(() => filters, [
    filters
  ]);

  return { filters: memoizedFilters, updateFilters };
}
