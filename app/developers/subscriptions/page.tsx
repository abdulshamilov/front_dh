"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/shared/redux/hooks";
import { fetchMySubscriptions } from "@/app/shared/redux/slices/developers";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Link from "next/link";

function SubscriptionsContent() {
  const dispatch = useAppDispatch();
  const { subscriptions, loading, error } = useAppSelector(
    (state) => state.developers
  );

  useEffect(() => {
    dispatch(fetchMySubscriptions());
  }, [dispatch]);

  return (
    <div
      className="flex flex-col min-h-dvh justify-start content-center items-center font-[family-name:var(--font-stetica-regular)]"
      style={{
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div className="w-full max-w-[1300px] flex flex-col content-center gap-y-6 sm:gap-y-[25px] px-4 sm:px-6 lg:px-8 pt-6 pb-6 flex-grow">
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-[family-name:var(--font-stetica-bold)]"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Мои подписки
        </h1>

        {loading && (
          <div className="text-center py-10" style={{ color: "var(--text-secondary)" }}>
            Загрузка подписок...
          </div>
        )}

        {error && (
          <div className="text-center py-10" style={{ color: "var(--error)" }}>{error}</div>
        )}

        {!loading && !error && subscriptions.length === 0 && (
          <div
            className="text-center py-20 rounded-[24px] glass-card"
          >
            <svg
              className="w-24 h-24 mx-auto mb-4 opacity-50"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: "var(--text-secondary)" }}
            >
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-lg" style={{ color: "var(--text-primary)" }}>У вас пока нет подписок на застройщиков</p>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Перейдите в раздел{" "}
              <Link
                href="/developers"
                className="underline"
                style={{ color: "var(--accent-primary)" }}
              >
                Застройщики
              </Link>
              , чтобы подписаться
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <ProtectedRoute>
      <SubscriptionsContent />
    </ProtectedRoute>
  );
}
