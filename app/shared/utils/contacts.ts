/**
 * Контакты Dream House — единый источник правды.
 * Используется для tel:, wa.me, отображения и логирования.
 *
 * Если номер изменится — правим только тут.
 */

/** Короткий региональный номер для отображения и tel: на сайте. */
export const SHORT_PHONE_DISPLAY = "92-62-66";
export const SHORT_PHONE_TEL = "tel:926266";

/**
 * Полный международный номер для WhatsApp-ссылок.
 * Формат: только цифры, без + и пробелов (требование wa.me).
 * Соответствует номеру: +7 (988) 292-62-66
 */
export const WHATSAPP_PHONE = "79882926266";

/**
 * Сгенерировать ссылку WhatsApp с предзаполненным сообщением о квартире.
 *
 * @param cardTitle название/адрес квартиры (берётся из card.title)
 * @param cardUrl   полный URL карточки (если на клиенте — берётся window.location.origin)
 */
export function buildWhatsappLink(cardTitle: string, cardUrl?: string): string {
  const lines = [
    `Здравствуйте! Интересует объект:`,
    cardTitle,
  ];
  if (cardUrl) lines.push(cardUrl);
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`;
}
