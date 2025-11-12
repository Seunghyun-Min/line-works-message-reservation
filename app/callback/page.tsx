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
        const res = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          console.error("Token exchange failed:", res.status);
          router.push("/login");
          return;
        }

        router.push("/");
      } catch (error) {
        console.error("Error exchanging code:", error);
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
