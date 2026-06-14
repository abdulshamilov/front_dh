"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/shared/redux/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const { isAuth, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && isAuth) {
      router.replace("/");
    }
  }, [isAuth, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  if (isAuth) {
    return null;
  }

  return <>{children}</>;
}
