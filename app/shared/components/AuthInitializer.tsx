"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/app/shared/redux/hooks";
import { fetchUser } from "@/app/shared/redux/slices/auth";

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      dispatch(fetchUser()).catch(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      });
    } else {
      localStorage.removeItem("refresh_token");
    }
  }, [dispatch]);

  return <>{children}</>;
}
