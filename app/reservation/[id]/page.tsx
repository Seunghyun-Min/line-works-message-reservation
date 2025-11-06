"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Search } from "lucide-react";

export default function ReservationEditPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [formData, setFormData] = useState({
    id: "",
    sendTime: "",
    personal: "",
    personalIds: [] as string[],
    group: "",
    message: "",
    status: "",
  });

  const [sendTime, setSendTime] = useState<Date | null>(null);

  // 現在時間基準, 最小時間計算
  const getMinTime = (date: Date) => {
    const now = new Date();
    const minTime = new Date(date);

    if (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    ) {
      // 当日なら現在時間と9時で大きい方
      const nextHour = new Date();
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      minTime.setHours(Math.max(nextHour.getHours(), 9), 0, 0, 0);
    } else {
      // 今日じゃなかったら9時から
      minTime.setHours(9, 0, 0, 0);
    }
    return minTime;
  };

  const getMaxTime = (date: Date) => {
    const maxTime = new Date(date);
    maxTime.setHours(18, 0, 0, 0);
    return maxTime;
  };

  // ✅ 初期データ取得
  useEffect(() => {
    if (!id) return;

    async function fetchReservation() {
      try {
        const res = await fetch("/api/sheets");
        const all = await res.json();
        const target = all.find((item: any) => item.id === id);

        if (target) {
          setFormData({
            id: target.id || "",
            sendTime: target.time || "",
            personal: target.targetUser || "",
            personalIds: target.userIds || [],
            group: target.targetGroup || "",
            message: target.message || "",
            status: target.status || "",
          });

          if (target.time) {
            setSendTime(new Date(target.time));
          }
        } else {
          alert("対象の予約が見つかりません。");
          router.push("/reservation-list");
        }
      } catch (err) {
        console.error("❌ データ取得エラー:", err);
      }
    }

    fetchReservation();
  }, [id, router]);

  // ✅ 社員選択結果を受け取る
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (data.type === "SELECT_EMPLOYEE") {
        setFormData((prev) => ({
          ...prev,
          personal: data.names.join("、"),
          personalIds: data.ids,
        }));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // ✅ 修正送信
  // ✅ 修正版
  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/sheets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert("修正が完了しました！");
        router.push("/reservation-list");
      } else {
        // サーバー側の error メッセージを優先表示
        alert(result.error || "修正に失敗しました。");
      }
    } catch (err) {
      console.error("❌ 修正エラー:", err);
      alert("サーバー通信に失敗しました。");
    }
  };

  // ✅ 社員検索ウィンドウを開く
  const openChildWindow = () => {
    (window as any).__SELECTED_EMPLOYEES__ = formData.personalIds.map(
      (id, i) => ({
        userId: id,
        name: formData.personal.split("、")[i] || "",
      })
    );

    window.open(
      "/select",
      "childWindow",
      "width=600,height=800,resizable=no,scrollbars=yes"
    );
  };

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <main style={{ padding: "20px" }}>
        <table
          style={{
            width: "50%",
            borderCollapse: "collapse",
            margin: "0 auto",
            textAlign: "left",
          }}
        >
          <tbody>
            {/* 送信時間 */}
            <tr>
              <th style={tdStyle}>送信時間</th>
              <td style={tdStyle}>
                <DatePicker
                  selected={sendTime}
                  onChange={(date) => {
                    setSendTime(date);
                    setFormData({
                      ...formData,
                      sendTime: date
                        ? date.toLocaleString("ja-JP", { hour12: false })
                        : "",
                    });
                  }}
                  showTimeSelect
                  timeIntervals={60}
                  dateFormat="yyyy/MM/dd HH:mm"
                  minDate={new Date()}
                  minTime={
                    sendTime ? getMinTime(sendTime) : getMinTime(new Date())
                  }
                  maxTime={
                    sendTime ? getMaxTime(sendTime) : getMaxTime(new Date())
                  }
                  placeholderText="予約時間設定"
                  customInput={
                    <input
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "8px",
                        fontSize: "16px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  }
                />
              </td>
            </tr>

            {/* 個人 */}
            <tr>
              <th style={tdStyle}>個人</th>
              <td style={tdStyle}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    height: "60px",
                  }}
                >
                  <input
                    type="text"
                    value={formData.personal}
                    placeholder="社員を選択してください。"
                    style={inputStyle}
                    readOnly
                  />
                  <Search
                    size={20}
                    style={{ cursor: "pointer" }}
                    onClick={openChildWindow}
                  />
                </div>
              </td>
            </tr>

            {/* グループ */}
            <tr>
              <th style={tdStyle}>グループ</th>
              <td style={tdStyle}>
                <input
                  type="text"
                  value={formData.group}
                  onChange={(e) =>
                    setFormData({ ...formData, group: e.target.value })
                  }
                  placeholder="チャンネルIDを入力してください。"
                  style={inputStyle}
                />
              </td>
            </tr>

            {/* メッセージ内容 */}
            <tr>
              <th style={tdStyle}>メッセージ内容</th>
              <td style={tdStyle}>
                <textarea
                  value={formData.message}
                  onChange={(e) => {
                    if (e.target.value.length <= 2000) {
                      setFormData({ ...formData, message: e.target.value });
                    }
                  }}
                  placeholder="メッセージ内容を入力してください。(最大2000文字)"
                  style={{
                    width: "100%",
                    minHeight: "400px",
                    resize: "vertical",
                    overflowY: "auto",
                    padding: "8px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                  }}
                />
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    color: "#999",
                    marginTop: "4px",
                  }}
                >
                  {formData.message.length}/2000
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </main>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <button style={buttonStyleGreen} onClick={handleSubmit}>
          修正
        </button>
        <button
          style={buttonStyleBlue}
          onClick={() => router.push("/reservation-list")}
        >
          戻る
        </button>
      </div>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "10px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  width: "100%",
  height: "40px",
  padding: "8px",
  fontSize: "16px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  boxSizing: "border-box",
};

const buttonStyleGreen: React.CSSProperties = {
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  padding: "10px 25px",
  borderRadius: "8px",
  cursor: "pointer",
};

const buttonStyleBlue: React.CSSProperties = {
  backgroundColor: "rgb(52, 152, 219)",
  color: "white",
  border: "none",
  padding: "10px 25px",
  borderRadius: "8px",
  cursor: "pointer",
};
