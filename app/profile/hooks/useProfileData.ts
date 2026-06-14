import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchUser } from "@/app/shared/redux/slices/auth";

export function useProfileData() {
  const dispatch = useAppDispatch();
  const { user, isAuth } = useAppSelector((state) => state.auth);
  
  const [profile, setProfile] = useState<{
    name: string;
    phone_number: string;
    password: string;
    profile_photo?: string | undefined;
  }>({
    name: "",
    phone_number: "",
    password: "••••••••",
    profile_photo: undefined,
  });

  useEffect(() => {
    if (isAuth && !user) {
      dispatch(fetchUser());
    }
  }, [dispatch, isAuth, user]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        phone_number: user.phone_number || "",
        password: "•••••••••••••",
        profile_photo: user.profile_photo || undefined,
      });
    }
  }, [user]);

  return { profile, setProfile, user, isAuth };
}
