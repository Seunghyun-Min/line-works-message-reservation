"use client";
import React from "react";

import { Search } from "lucide-react";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

export default function ReservationListPage() {
  const [formData, setFormData] = useState({
    sendTime: "",
    personal: "",
    group: "",
    message: "",
  });

  const openChildWindow = () => {
    window.open(
      "/child", // (추후 연결 예정)
      "childWindow",
      "width=600,height=400,scrollbars=yes"
    );
  };

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
      // 今日じゃなかったら9時
      minTime.setHours(9, 0, 0, 0);
    }

    return minTime;
  };

  const getMaxTime = (date: Date) => {
    const maxTime = new Date(date);
    maxTime.setHours(18, 0, 0, 0);
    return maxTime;
  };

  const handleSubmit = async () => {
    try {
      console.log("payload:", formData);

      const res = await fetch("/api/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("登録完了！");
        setFormData({ personal: "", group: "", message: "", sendTime: "" });
      } else {
        alert("エラーが発生しました: " + (data.error || "原因不明"));
        console.error("API Error:", data.error);
      }
    } catch (err) {
      alert("通信エラーが発生しました");
      console.error(err);
    }
  };

  const router = useRouter();

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* ==== 本文 ==== */}
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
                    onChange={(e) =>
                      setFormData({ ...formData, personal: e.target.value })
                    }
                    style={{
                      flex: 1,
                      width: "100%",
                      height: "40px",
                      padding: "8px",
                      fontSize: "16px",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      boxSizing: "border-box",
                    }}
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
              </td>
            </tr>

            {/* メッセージ内容 */}
            <tr>
              <th style={tdStyle}>メッセージ内容</th>
              <td style={tdStyle}>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
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
        <button
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            padding: "10px 25px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#2d8d4aff")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "rgb(7, 181, 59)")
          }
          onClick={handleSubmit}
        >
          登録
        </button>

        <button
          style={{
            backgroundColor: "rgb(52, 152, 219)",
            color: "white",
            border: "none",
            padding: "10px 25px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#3284bbff")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#3498db")
          }
          onClick={() => router.push("/reservation-list")}
        >
          予約確認
        </button>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  borderBottom: "2px solid #ccc",
  padding: "10px",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "10px",
};

const editBtn: React.CSSProperties = {
  background: "#3498db",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
  background: "#e74c3c",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  cursor: "pointer",
};
const cardStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "15px",
  backgroundColor: "#f9f9f9",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "bold",
};
