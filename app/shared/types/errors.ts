/**
 * Типы для обработки ошибок API
 */

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  reason?: string;
  code?: string;
}

export interface AxiosErrorResponse {
  response?: {
    data?: ApiErrorResponse | string;
    status?: number;
  };
  message?: string;
}

/**
 * Проверяет, является ли значение объектом Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Извлекает сообщение об ошибке из различных форматов
 */
export function getErrorMessage(error: unknown, fallback: string = "Произошла ошибка"): string {
  if (isError(error)) {
    return error.message || fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    ("message" in error || "detail" in error || "reason" in error)
  ) {
    const errorObj = error as { message?: string; detail?: string; reason?: string };
    return errorObj.message || errorObj.detail || errorObj.reason || fallback;
  }

  return fallback;
}

/**
 * Проверяет, является ли значение AxiosErrorResponse
 */
export function isAxiosErrorResponse(value: unknown): value is AxiosErrorResponse {
  return (
    value !== null &&
    typeof value === "object" &&
    ("response" in value || "message" in value)
  );
}
