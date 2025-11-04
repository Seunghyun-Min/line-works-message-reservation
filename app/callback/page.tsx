"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const [userList, setUserList] = useState<any[]>([]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    const fetchTokenAndUsers = async () => {
      // 1️⃣ 토큰 교환
      const tokenRes = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2️⃣ 사원 리스트 조회
      const userRes = await fetch("https://www.worksapis.com/v1.0/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const userData = await userRes.json();
      setUserList(userData.userList || []);
    };

    fetchTokenAndUsers();
  }, [searchParams]);

  return (
    <div>
      <h1>사원 리스트</h1>
      <ul>
        {userList.map((u: any) => (
          <li key={u.userId}>
            {u.userName.lastName} {u.userName.firstName} ({u.userId})
          </li>
        ))}
      </ul>
    </div>
  );
}
