"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const [userList, setUserList] = useState<any[]>([]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    console.log("code:", code);

    const fetchTokenAndUsers = async () => {
      // 1️⃣ トークン交換
      const tokenRes = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;
      console.log("accessToken:", accessToken);

      // 2️⃣ 社員リスト
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
      <h1>社員リスト</h1>
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
