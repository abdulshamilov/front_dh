/**
 * Утилиты для работы с российскими телефонными номерами.
 * Используются во всех формах заявок (LeadForm, CallRequestModal,
 * ScheduleViewingSheet и т.д.) — единый источник правды.
 */

/** Достать только цифры из любой строки. */
export function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Прогрессивное форматирование вводимого телефона: +7 (XXX) XXX-XX-XX.
 * Лидирующий 8 нормализуется в 7. Если кодовой части нет — подставляется 7.
 * Обрезается до 11 цифр.
 */
export function formatPhoneInput(value: string): string {
  let digits = extractDigits(value);
  if (!digits) return "";

  // Нормализуем 8 → 7
  if (digits[0] === "8") {
    digits = "7" + digits.slice(1);
  }
  // Если первый символ не 7 — считаем что пользователь начал с кода 9XX
  // и добавляем 7 в начало
  if (digits[0] !== "7") {
    digits = "7" + digits;
  }
  // Обрезаем до 11 знаков (7 + 10)
  digits = digits.slice(0, 11);

  const country = digits[0];
  const code = digits.slice(1, 4);
  const part1 = digits.slice(4, 7);
  const part2 = digits.slice(7, 9);
  const part3 = digits.slice(9, 11);

  let formatted = `+${country}`;
  if (code) formatted += ` (${code}`;
  if (code.length === 3) formatted += `)`;
  if (part1) formatted += ` ${part1}`;
  if (part2) formatted += `-${part2}`;
  if (part3) formatted += `-${part3}`;

  return formatted;
}

/**
 * Валидный российский номер: 11 цифр, начинается с 7 или 8.
 * Принимает как чистые цифры, так и форматированную строку.
 */
export function isValidRussianPhone(value: string): boolean {
  const digits = extractDigits(value);
  return digits.length === 11 && (digits[0] === "7" || digits[0] === "8");
}
