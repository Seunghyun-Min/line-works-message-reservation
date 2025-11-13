// app/callback/page.client.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    console.log("[Callback] code:", code, "state:", state);

    // 코드나 state가 올바르지 않으면 홈으로 이동
    if (!code || state !== "lineworks_oauth") {
      router.push("/");
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        // 서버 API 호출로 액세스 토큰 발급
        const res = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        console.log("[Callback] /api/token response status:", res.status);

        const data = await res.json();
        console.log("[Callback] /api/token response data:", data);

        if (!res.ok) {
          console.error("Token exchange failed:", res.status);
          router.push("/");
          return;
        }

        // 토큰 발급 성공하면 메인 페이지로 이동
        router.push("/main");
      } catch (err) {
        console.error("[Callback] Error exchanging code:", err);
        router.push("/");
      }
    };

    exchangeCodeForToken();
  }, [searchParams, router]);

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>ログイン中…</h1>
      <p>しばらくお待ちください。</p>
    </div>
  );
}
