"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ReferralRedirect() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  useEffect(() => {
    if (code) {
      localStorage.setItem("ref_code", code);
      router.replace(`/register?ref=${code}`);
    } else {
      router.replace("/register");
    }
  }, [code, router]);

  return (
    <div
      className="flex min-h-svh items-center justify-center font-[family-name:var(--font-stetica-bold)]"
      style={{
        background: `linear-gradient(135deg, var(--auth-gradient-dark) 0%, var(--auth-gradient-mid) 50%, var(--auth-gradient-light) 100%)`,
      }}
    >
      <div className="text-center">
        <p
          className="text-xl"
          style={{ color: "var(--text-primary)" }}
        >
          Перенаправление...
        </p>
      </div>
    </div>
  );
}
