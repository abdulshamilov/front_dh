import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/shared/redux/hooks";
import { logout } from "@/app/shared/redux/slices/auth";
import { useDeleteAccountMutation, useRequestDeleteAccountOtpMutation } from "@/app/shared/redux/api/auth";

export function useAccountActions() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestDeleteAccountOtpMutation();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
    setOtpError(null);
  };

  const handleRequestOtp = async () => {
    setOtpError(null);
    try {
      await requestOtp().unwrap();
    } catch (error: unknown) {
      const apiError = error as { data?: { reason?: string; detail?: string; CODE?: string } };
      let errorMessage = 
        apiError?.data?.reason || 
        apiError?.data?.detail ||
        "Не удалось отправить код";
      
      if (apiError?.data?.CODE === "TOO_MANY_REQUESTS") {
        errorMessage = "Слишком много запросов. Попробуйте позже";
      } else if (apiError?.data?.CODE === "SMS_REQUEST_FAILED") {
        errorMessage = "Не удалось отправить SMS. Попробуйте позже";
      }
      
      setOtpError(errorMessage);
      throw error;
    }
  };

  const handleConfirmDelete = async (otp: string) => {
    setOtpError(null);
    try {
      await deleteAccount({ otp }).unwrap();
      
      setIsDeleteModalOpen(false);
      dispatch(logout());
      router.replace("/");
    } catch (error: unknown) {
      const apiError = error as { data?: { reason?: string; detail?: string; CODE?: string } };
      let errorMessage = 
        apiError?.data?.reason || 
        apiError?.data?.detail ||
        "Неверный код или ошибка сервера";
      
      if (apiError?.data?.CODE === "INVALID_OTP") {
        errorMessage = "Неверный код подтверждения";
      } else if (apiError?.data?.CODE === "OTP_EXPIRED") {
        errorMessage = "Код истёк. Запросите новый";
      }
      
      setOtpError(errorMessage);
    }
  };

  return {
    isDeleteModalOpen,
    isDeleting,
    isRequestingOtp,
    otpError,
    setIsDeleteModalOpen,
    handleLogout,
    handleDeleteAccount,
    handleRequestOtp,
    handleConfirmDelete,
  };
}
