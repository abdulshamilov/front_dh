"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchUser, setInitialized } from "@/app/shared/redux/slices/auth";

export const AuthChecker = () => {
  const dispatch = useAppDispatch();
  const { initialized } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!initialized) {
      const token = localStorage.getItem("access_token");
      if (token) {
        dispatch(fetchUser());
      } else {
        dispatch(setInitialized());
      }
    }
  }, [dispatch, initialized]);

  return null;
};
