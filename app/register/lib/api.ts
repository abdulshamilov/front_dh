const API_BASE = "https://api.dreamhouse05.com/api";

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  reason?: string;
}

export interface RegisterSmsRequest {
  phone_number: string;
}

export interface RegisterSmsResponse {
  detail?: string;
  ok?: boolean;
}

export interface ConfirmRegisterRequest {
  phone_number: string;
  otp: string;
  name: string;
  ref_code?: string;
}

export interface ConfirmRegisterResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    phone_number: string;
    name: string;
    profile_photo: string;
  };
  is_new: boolean;
}

export async function requestRegisterSms(
  name: string,
  phone: string
): Promise<RegisterSmsResponse> {
  const res = await fetch(`${API_BASE}/users/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      phone_number: phone,
    }),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка отправки SMS";
    try {
      const err: ApiErrorResponse = await res.json();
      errorMessage = err.detail || err.message || err.reason || errorMessage;
    } catch {
      // Если не удалось распарсить JSON, используем стандартное сообщение
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function confirmRegisterSms(
  data: ConfirmRegisterRequest
): Promise<ConfirmRegisterResponse> {
  const res = await fetch(`${API_BASE}/users/register/confirm/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let errorMessage = "Неверный код";
    try {
      const err: ApiErrorResponse = await res.json();
      errorMessage = err.detail || err.message || err.reason || errorMessage;
    } catch {
      // Если не удалось распарсить JSON, используем стандартное сообщение
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
