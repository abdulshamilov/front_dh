const API_BASE = "https://api.dreamhouse05.com/api";

export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  reason?: string;
}

export interface RequestSmsResponse {
  detail: string;
  otp: null;
}

export interface VerifySmsResponse {
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

export async function requestSms(phone: string): Promise<RequestSmsResponse> {
  const res = await fetch(`${API_BASE}/users/sms/request/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: phone,
    }),
  });

  if (!res.ok) {
    let errorMessage = "Ошибка отправки SMS";
    try {
      const err: ApiErrorResponse = await res.json();
      errorMessage = err.detail || err.message || err.reason || errorMessage;
    } catch {
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export async function verifySms(
  phone: string,
  otp: string
): Promise<VerifySmsResponse> {
  const res = await fetch(`${API_BASE}/users/sms/verify/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: phone,
      otp,
    }),
  });

  if (!res.ok) {
    let errorMessage = "Неверный код";
    try {
      const err: ApiErrorResponse = await res.json();
      errorMessage = err.detail || err.message || err.reason || errorMessage;
    } catch {
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
