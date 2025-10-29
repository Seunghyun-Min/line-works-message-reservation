"use client";

import { useState } from "react";

export default function ReservationFormPage() {
  const [formData, setFormData] = useState({
    personal: "",
    group: "",
    message: "",
  });
  const [sendTime, setSendTime] = useState<Date | null>(null);

  const handleRegister = async () => {
    const payload = {
      sendTime: sendTime ? sendTime.toISOString() : "",
      personal: formData.personal,
      group: formData.group,
      message: formData.message,
    };

    const res = await fetch("/api/sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("スプレッドシートに登録しました！");
    } else {
      alert("登録に失敗しました");
    }
  };

  return (
    <div>
      {/* 入力フォーム */}
      <input
        placeholder="宛先"
        value={formData.personal}
        onChange={(e) => setFormData({ ...formData, personal: e.target.value })}
      />
      <textarea
        placeholder="メッセージ"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />

      <button onClick={handleRegister}>登録</button>
    </div>
  );
}
