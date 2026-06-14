"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/shared/redux/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuth, loading, initialized } = useAppSelector(
    (state) => state.auth
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && initialized && !isAuth && !loading) {
      router.replace("/login");
    }
  }, [mounted, isAuth, loading, initialized, router]);

  // На сервере всегда рендерим children, чтобы избежать несоответствия гидратации
  if (!mounted) {
    return <>{children}</>;
  }

  if (!initialized || loading) {
    return (
      <div
        className="flex items-center justify-center min-h-dvh"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div className="text-center" style={{ color: "var(--text-secondary)" }}>
          Загрузка...
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}
