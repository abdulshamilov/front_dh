"use client";

import { FieldChips } from "@/app/components/Filter/ui/FieldChips";
import { FieldSelect } from "@/app/components/Filter/ui/FieldSelect";
import { RangeSlider } from "@/app/components/Filter/ui/RangeSlider";
import { Sheet } from "@/app/components/shared/Sheet";
import { Button } from "@/app/components/shared/Button";
import { ICardFilters } from "@/app/types";
import { useEffect, useState, useCallback, memo, useMemo } from "react";
import { RotateCcw } from "lucide-react";

interface FiltersModalProps {
  initial: ICardFilters;
  onClose: () => void;
  onApply: (filters: ICardFilters) => void;
}

export const FiltersModal = memo(function FiltersModal({
  initial,
  onClose,
  onApply,
}: FiltersModalProps) {
  const [localFilters, setLocalFilters] = useState<ICardFilters>(() => ({
    ...initial,
  }));

  useEffect(() => {
    setLocalFilters({ ...initial });
  }, [initial]);

  const updateField = useCallback(
    (key: keyof ICardFilters, value: string | number | boolean | undefined) => {
      setLocalFilters((prev) => {
        const newValue = value === "" ? undefined : value;
        if (prev[key] === newValue) return prev;
        return {
          ...prev,
          [key]: newValue,
        };
      });
    },
    []
  );

  const toggleSingleChip = useCallback(
    (key: keyof ICardFilters, value: string) => {
      setLocalFilters((prev) => {
        const current = prev[key];
        if (typeof current === "boolean") {
          const incoming = value === "true";
          const newValue = current === incoming ? undefined : incoming;
          if (prev[key] === newValue) return prev;
          return { ...prev, [key]: newValue };
        }
        const currentValue = prev[key] as string | undefined;
        const newValue = currentValue === value ? undefined : value;
        if (prev[key] === newValue) return prev;
        return { ...prev, [key]: newValue };
      });
    },
    []
  );

  const formatPrice = useCallback(
    (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`,
    []
  );

  const formatArea = useCallback((value: number) => `${value} м²`, []);

  // Считаем количество активных фильтров для бейджа на кнопке
  const activeCount = useMemo(() => {
    return Object.entries(localFilters).filter(
      ([, v]) => v !== undefined && v !== ""
    ).length;
  }, [localFilters]);

  const handleApply = useCallback(() => {
    const cleanFilters = Object.entries(localFilters).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key as keyof ICardFilters] = value;
        }
        return acc;
      },
      {} as ICardFilters
    );
    onApply(cleanFilters);
  }, [localFilters, onApply]);

  const handleReset = useCallback(() => {
    setLocalFilters({});
  }, []);

  return (
    <Sheet
      open
      onClose={onClose}
      title="Фильтры"
      footer={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleReset}
            disabled={activeCount === 0}
            iconLeft={<RotateCcw size={16} strokeWidth={2.4} />}
          >
            Сбросить
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={handleApply}>
            Показать
            {activeCount > 0 && (
              <span
                aria-hidden
                style={{
                  marginLeft: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 22,
                  height: 22,
                  padding: "0 6px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.18)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {activeCount}
              </span>
            )}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Группа: Локация */}
        <FilterGroup title="Локация">
          <FieldSelect
            label="Город"
            value={localFilters.city?.toString()}
            onChange={(v) =>
              updateField("city", v ? (Number(v) as 1 | 2 | 3 | 4) : undefined)
            }
            placeholder="Все города"
            options={[
              { value: "1", label: "Махачкала" },
              { value: "2", label: "Каспийск" },
              { value: "3", label: "Дербент" },
              { value: "4", label: "Избербаш" },
            ]}
          />
        </FilterGroup>

        {/* Группа: Цена */}
        <FilterGroup title="Цена">
          <RangeSlider
            label="Стоимость"
            min={0}
            max={100000000}
            step={100000}
            valueMin={localFilters.price_min}
            valueMax={localFilters.price_max}
            onChangeMin={(v) => updateField("price_min", v)}
            onChangeMax={(v) => updateField("price_max", v)}
            formatValue={formatPrice}
          />
          <RangeSlider
            label="Цена за м²"
            min={0}
            max={500000}
            step={5000}
            valueMin={localFilters.price_per_sqm_min}
            valueMax={localFilters.price_per_sqm_max}
            onChangeMin={(v) => updateField("price_per_sqm_min", v)}
            onChangeMax={(v) => updateField("price_per_sqm_max", v)}
            formatValue={formatPrice}
          />
        </FilterGroup>

        {/* Группа: Площадь и комнаты */}
        <FilterGroup title="Площадь и комнаты">
          <RangeSlider
            label="Площадь"
            min={0}
            max={500}
            step={5}
            valueMin={localFilters.area_min}
            valueMax={localFilters.area_max}
            onChangeMin={(v) => updateField("area_min", v)}
            onChangeMax={(v) => updateField("area_max", v)}
            formatValue={formatArea}
          />
          <RangeSlider
            label="Количество комнат"
            min={1}
            max={10}
            step={1}
            valueMin={localFilters.rooms_min}
            valueMax={localFilters.rooms_max}
            onChangeMin={(v) => updateField("rooms_min", v)}
            onChangeMax={(v) => updateField("rooms_max", v)}
          />
        </FilterGroup>

        {/* Группа: Дом */}
        <FilterGroup title="Характеристики дома">
          <FieldChips
            label="Тип комплекса"
            options={[
              { value: "residential", label: "Жилой комплекс" },
              { value: "apart", label: "Апарт-комплекс" },
            ]}
            value={localFilters.complex_type ? [localFilters.complex_type] : []}
            onToggle={(val) => toggleSingleChip("complex_type", val)}
            multiSelect={false}
          />
          <FieldChips
            label="Тип дома"
            options={[
              { value: "brick", label: "Кирпичный" },
              { value: "panel", label: "Панельный" },
              { value: "monolith", label: "Монолитный" },
              { value: "brick_monolith", label: "Кирпично-монолитный" },
              { value: "solid_monolith", label: "Цельно-монолитный" },
            ]}
            value={localFilters.house_type ? [localFilters.house_type] : []}
            onToggle={(val) => toggleSingleChip("house_type", val)}
            multiSelect={false}
          />
          <RangeSlider
            label="Этажность"
            min={1}
            max={50}
            step={1}
            valueMin={localFilters.floors_min}
            valueMax={localFilters.floors_max}
            onChangeMin={(v) => updateField("floors_min", v)}
            onChangeMax={(v) => updateField("floors_max", v)}
          />
          <RangeSlider
            label="Высота потолков"
            min={2.0}
            max={5.0}
            step={0.1}
            valueMin={localFilters.ceiling_height_min}
            valueMax={localFilters.ceiling_height_max}
            onChangeMin={(v) => updateField("ceiling_height_min", v)}
            onChangeMax={(v) => updateField("ceiling_height_max", v)}
            formatValue={(v) => `${v.toFixed(1)} м`}
          />
        </FilterGroup>

        {/* Группа: Инфраструктура */}
        <FilterGroup title="Инфраструктура">
          <FieldChips
            label="Лифт"
            options={[
              { value: "none", label: "Нет" },
              { value: "passenger", label: "Пассажирский" },
              { value: "cargo", label: "Грузовой" },
              { value: "cargo_passenger", label: "Грузопассажирский" },
              { value: "passenger_and_cargo", label: "Пасс. + грузовой" },
            ]}
            value={localFilters.elevator ? [localFilters.elevator] : []}
            onToggle={(val) => toggleSingleChip("elevator", val)}
            multiSelect={false}
          />
          <FieldChips
            label="Парковка"
            options={[
              { value: "none", label: "Нет" },
              { value: "underground", label: "Подземная" },
              { value: "ground", label: "Наземная" },
              { value: "two_level", label: "Двухуровневая" },
            ]}
            value={localFilters.parking ? [localFilters.parking] : []}
            onToggle={(val) => toggleSingleChip("parking", val)}
            multiSelect={false}
          />
        </FilterGroup>

        {/* Группа: Квартира */}
        <FilterGroup title="Удобства квартиры">
          <FieldChips
            label="Балкон"
            options={[
              { value: "true", label: "Есть" },
              { value: "false", label: "Нет" },
            ]}
            value={
              localFilters.balcony !== undefined
                ? [localFilters.balcony.toString()]
                : []
            }
            onToggle={(val) => toggleSingleChip("balcony", val)}
            multiSelect={false}
          />
          <FieldChips
            label="Лоджия"
            options={[
              { value: "true", label: "Есть" },
              { value: "false", label: "Нет" },
            ]}
            value={
              localFilters.loggia !== undefined
                ? [localFilters.loggia.toString()]
                : []
            }
            onToggle={(val) => toggleSingleChip("loggia", val)}
            multiSelect={false}
          />
          <FieldChips
            label="Отделка"
            options={[
              { value: "none", label: "Без отделки" },
              { value: "with_finish", label: "С отделкой" },
            ]}
            value={localFilters.finishing ? [localFilters.finishing] : []}
            onToggle={(val) => toggleSingleChip("finishing", val)}
            multiSelect={false}
          />
        </FilterGroup>
      </div>
    </Sheet>
  );
});

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h3
        style={{
          margin: 0,
          fontFamily: "var(--font-stetica-medium)",
          fontSize: 12,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
        }}
      >
        {title}
      </h3>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
