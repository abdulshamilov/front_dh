/**
 * Унифицированная отправка заявок (leads) в Dream House.
 *
 * Backend поддерживает только два endpoint'а для заявок:
 *   • POST /cards/{id}/call_request/ — заявка по конкретной квартире (auth optional)
 *   • POST /cards/{id}/discount/    — предложение своей цены (auth required)
 *
 * Все общие формы (LeadForm с главной, ScheduleViewingSheet) идут через
 * /call_request/ с подстановкой card_id (для общей формы — FALLBACK_CARD_ID,
 * для записи на показ — первая карточка из выбранных).
 *
 * Доп. контекст (источник, список объектов, дата) кладётся в preferred_time
 * (поле maxLength=100 на бэке, принимает любой текст).
 *
 * Поддерживаемые типы:
 *   • callback          — общая форма с главной → /cards/{fallback}/call_request/
 *   • call_request      — заявка из карточки → /cards/{cardId}/call_request/
 *   • card_discount     — предложение цены → /cards/{cardId}/discount/ (auth)
 *   • schedule_viewing  — запись на показ из /favorite → /cards/{first}/call_request/
 */

import axios from "axios";
import type { AxiosError } from "axios";
import axiosInstance from "@/app/shared/config/axios";
import { getUtmParams } from "@/app/shared/utils/utm";

/**
 * ID "общей" карточки на бэке для заявок без привязки к объекту (LeadForm с
 * главной, ScheduleViewingSheet когда card_ids пуст).
 * TODO: Уточнить у бэка корректный fallback или попросить добавить
 * /api/leads/general/ эндпоинт.
 */
const FALLBACK_CARD_ID = 1;

export type LeadKind =
  | "callback"
  | "call_request"
  | "card_discount"
  | "schedule_viewing"
  | "map_viewing";

export type LeadPayload =
  | {
      kind: "callback";
      name: string;
      phone_number: string; // только цифры, 11 знаков
      source?: string;
    }
  | {
      kind: "call_request";
      cardId: number;
      phone_number: string;
      name: string;
      preferred_time?: string;
    }
  | {
      kind: "card_discount";
      cardId: number;
      proposed_price: number;
    }
  | {
      kind: "schedule_viewing";
      phone_number: string;
      card_ids: number[];
      /** Не переданы — менеджер согласует время по телефону. */
      date?: string; // YYYY-MM-DD
      time?: string; // HH:MM
      name?: string;
    }
  | {
      kind: "map_viewing";
      name: string;
      phone: string;
      jk: string;
      source?: string;
    };

export interface NormalizedError {
  message: string;
  status?: number;
}

function isNormalizedError(e: unknown): e is NormalizedError {
  return typeof e === "object" && e !== null && "message" in (e as object);
}

/** Превращает axios-ошибку в человекочитаемое сообщение + сохраняет status. */
function normalizeError(err: unknown): NormalizedError {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ detail?: string; message?: string }>;
    const status = ax.response?.status;
    const serverMsg =
      ax.response?.data?.detail || ax.response?.data?.message || null;

    // Любая ошибка без status — сетевая (текст разнится: Chrome даёт
    // "Network Error", iOS Safari "Network request failed" или пустую строку)
    if (!status) {
      return { message: "Нет соединения. Проверьте интернет.", status: 0 };
    }
    if (status === 400) {
      return { message: serverMsg || "Проверьте данные формы", status };
    }
    if (status === 401 || status === 403) {
      return { message: "Необходима авторизация", status };
    }
    if (status === 429) {
      return { message: "Слишком много запросов. Попробуйте через минуту.", status };
    }
    if (status && status >= 500) {
      return { message: "Ошибка сервера. Попробуйте позже.", status };
    }
    return { message: serverMsg || ax.message || "Не удалось отправить", status };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: "Неизвестная ошибка" };
}

/** Обрезает строку под лимит preferred_time (100 символов на бэке). */
function clampPreferredTime(s: string): string {
  return s.length <= 100 ? s : s.slice(0, 97) + "...";
}

/** Формирует preferred_time с UTM-меткой источника, если есть. */
function buildPreferredTime(base: string, utmSource?: string): string {
  return clampPreferredTime(utmSource ? `${base} | utm:${utmSource}` : base);
}

/**
 * Главная функция отправки заявки. Бросает NormalizedError при неуспехе.
 */
export async function submitLead(payload: LeadPayload): Promise<void> {
  // UTM атрибуция — для CRM-метрик. Кладём только utm_source в preferred_time
  // (другие utm_* теряются — на бэке нет полей для них в CallRequest).
  const utm = getUtmParams();
  try {
    switch (payload.kind) {
      case "callback": {
        // Общая форма заявки — нет card_id, используем FALLBACK_CARD_ID
        const sourceTag = payload.source ?? "site";
        const note = buildPreferredTime(`Источник: ${sourceTag}`, utm.utm_source);
        await axiosInstance.post(
          `/cards/${FALLBACK_CARD_ID}/call_request/`,
          {
            phone_number: payload.phone_number,
            name: payload.name,
            preferred_time: note,
          }
        );
        return;
      }
      case "call_request": {
        const note = payload.preferred_time
          ? buildPreferredTime(payload.preferred_time, utm.utm_source)
          : utm.utm_source
            ? `utm:${utm.utm_source}`
            : "";
        await axiosInstance.post(
          `/cards/${payload.cardId}/call_request/`,
          {
            phone_number: payload.phone_number,
            name: payload.name,
            ...(note ? { preferred_time: note } : {}),
          }
        );
        return;
      }
      case "card_discount": {
        await axiosInstance.post(
          `/cards/${payload.cardId}/discount/`,
          { proposed_price: payload.proposed_price }
        );
        return;
      }
      case "schedule_viewing": {
        // Привязываем к первой карточке из выбранных, остальные id и
        // дата/время идут в preferred_time
        const targetCardId = payload.card_ids[0] ?? FALLBACK_CARD_ID;
        const otherCards = payload.card_ids.slice(1);
        const cardsTail = otherCards.length > 0 ? `, +${otherCards.join(",")}` : "";
        const when =
          payload.date && payload.time
            ? `${payload.date} в ${payload.time}`
            : "время согласовать";
        const note = buildPreferredTime(`Показ ${when}${cardsTail}`, utm.utm_source);
        await axiosInstance.post(
          `/cards/${targetCardId}/call_request/`,
          {
            phone_number: payload.phone_number,
            name: payload.name ?? "Клиент (показ)",
            preferred_time: note,
          }
        );
        return;
      }
      case "map_viewing": {
        const note = buildPreferredTime(
          `Показ с карты | ЖК: ${payload.jk}`,
          utm.utm_source
        );
        await axiosInstance.post(
          `/cards/${FALLBACK_CARD_ID}/call_request/`,
          {
            phone_number: payload.phone,
            name: payload.name,
            preferred_time: note,
          }
        );
        return;
      }
      default: {
        const _never: never = payload;
        throw new Error(`Unknown lead kind: ${JSON.stringify(_never)}`);
      }
    }
  } catch (err) {
    if (isNormalizedError(err) && !axios.isAxiosError(err)) throw err;
    throw normalizeError(err);
  }
}
