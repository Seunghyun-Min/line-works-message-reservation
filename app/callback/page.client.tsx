"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.push("/login");
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        const tokenRes = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!tokenRes.ok) {
          console.error("Token exchange failed:", tokenRes.status);
          router.push("/login");
          return;
        }

        // 토큰이 httpOnly 쿠키에 저장되면 홈으로 이동
        router.push("/");
      } catch (err) {
        console.error("Error exchanging code:", err);
        router.push("/login");
      }
    };

    exchangeCodeForToken();
  }, [searchParams, router]);

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <p>ログイン中...</p>
    </div>
  );
}
