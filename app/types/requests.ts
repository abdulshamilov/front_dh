// SMS Login requests
export interface IRequestSmsCodeRequest {
    phone_number: string;
}

export interface IVerifySmsCodeRequest {
    phone_number: string;
    otp: string;
}

// SMS Register requests
export interface IRegisterSmsRequest {
    phone_number: string;
    name: string;
    ref_code?: string;
}

export interface IConfirmRegisterRequest {
    phone_number: string;
    otp: string;
    name: string;
    ref_code?: string;
}

// Legacy interfaces (для обратной совместимости, если нужно)
export interface IRegisterRequest {
    name: string;
    phone_number: string;
    password: string;
    password_confirm: string;
}

export interface ILoginRequest {
    phone_number: string;
    password: string;
}

// SMS responses
export interface IRequestSmsCodeResponse {
    ok: boolean;
    CODE: "OK" | "SMS_REQUEST_FAILED" | "INVALID_PHONE" | "TOO_MANY_REQUESTS" | "SERVER_ERROR";
    reason: string;
}

export interface IVerifySmsCodeResponse {
    ok: boolean;
    CODE: "OK" | "INVALID_OTP" | "OTP_EXPIRED" | "USER_NOT_FOUND" | "SERVER_ERROR";
    reason: string;
    access?: string;
    refresh?: string;
}

export interface IRegisterSmsResponse {
    ok: boolean;
    CODE: "OK" | "REGISTER_FAILED" | "ALREADY_REGISTERED" | "INVALID_PHONE" | "INVALID_DATA" | "TOO_MANY_REQUESTS" | "SERVER_ERROR";
    reason: string;
}

export interface IConfirmRegisterResponse {
    ok: boolean;
    CODE: "OK" | "REGISTER_FAILED" | "INVALID_OTP" | "OTP_EXPIRED" | "ALREADY_REGISTERED" | "SERVER_ERROR";
    reason: string;
    access?: string;
    refresh?: string;
}

// Legacy interfaces (для обратной совместимости)
export interface IRegisterResponse {
    ok: boolean;
    CODE: "OK" | "REGISTER_FAILED" | "ALREADY_REGISTERED" | "INVALID_EMAIL" | "WEAK_PASSWORD" | "INVALID_DATA" | "SERVER_ERROR";
    reason: string;
    access?: string;
    refresh?: string;
}

export interface ILoginResponse {
    ok: boolean;
    CODE: "OK" | "LOGIN_FAILED" | "INVALID_CREDENTIALS" | "USER_NOT_FOUND" | "ACCOUNT_BLOCKED" | "INVALID_EMAIL" | "SERVER_ERROR";
    reason: string;
    token?: string;
    access?: string;
    refresh?: string;
}

export interface IDeleteAccountRequest {
    otp: string;
}

export interface IDeleteAccountResponse {
    ok: boolean;
    CODE: "OK" | "DELETE_FAILED" | "INVALID_OTP" | "OTP_EXPIRED" | "SERVER_ERROR";
    reason: string;
}

export interface IRequestDeleteAccountOtpResponse {
    ok: boolean;
    CODE: "OK" | "SMS_REQUEST_FAILED" | "TOO_MANY_REQUESTS" | "SERVER_ERROR";
    reason: string;
}

export interface IUpdateProfilePhotoRequest {
    profile_photo: string | File;
}

export interface IUpdateProfileRequest {
    name?: string;
    profile_photo?: File;
}

export interface IUpdateProfilePhotoResponse {
    id: number;
    phone_number: string;
    name: string;
    profile_photo: string;
}