/**
 * Возвращает правильную форму существительного "объект" в зависимости от числа.
 * 1 объект, 2 объекта, 5 объектов, 11 объектов, 21 объект...
 */
export function objectsWord(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return "объектов";
  if (mod10 === 1) return "объект";
  if (mod10 >= 2 && mod10 <= 4) return "объекта";
  return "объектов";
}

/**
 * Универсальный плюрализатор для других русских существительных.
 * forms: [одна, две-четыре, пять+] — например ["квартира","квартиры","квартир"].
 */
export function pluralRu(n: number, forms: [string, string, string]): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod100 >= 11 && mod100 <= 14) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}
