/**
 * Извлекает UTM-параметры из URL текущей страницы.
 * Используется в submitLead для kind: "callback" чтобы прокидывать
 * атрибуцию маркетинговых кампаний в CRM.
 */
export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export function getUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const utm: UtmParams = {};

  const keys: (keyof UtmParams)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  for (const key of keys) {
    const value = params.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}
