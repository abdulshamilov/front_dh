export function normalizePhone(phone: string): string {
  let phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.startsWith("7")) {
    phoneDigits = "8" + phoneDigits.slice(1);
  }
  return phoneDigits;
}

export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  let formatted = numbers;
  
  if (formatted.startsWith("8")) {
    formatted = "7" + formatted.slice(1);
  }
  if (!formatted.startsWith("7") && formatted.length > 0) {
    formatted = "7" + formatted;
  }
  
  formatted = formatted.slice(0, 11);
  
  let result = "";
  if (formatted.length === 0) result = "";
  else if (formatted.length === 1) result = `+${formatted}`;
  else if (formatted.length <= 4)
    result = `+${formatted[0]} (${formatted.slice(1)}`;
  else if (formatted.length <= 7) {
    result = `+${formatted[0]} (${formatted.slice(1, 4)}) ${formatted.slice(4)}`;
  } else if (formatted.length <= 9) {
    result = `+${formatted[0]} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7)}`;
  } else {
    result = `+${formatted[0]} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7, 9)}-${formatted.slice(9, 11)}`;
  }
  
  return result;
}
