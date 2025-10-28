"use client";
import React, { useState } from "react";

const dummyData = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  time: "2025-01-01 10:00",
  user: "田中",
  group: "営業部",
  message:
    "お疲れ様です。本日の予定です。\n10:00 クライアントA訪問\n13:00 社内打ち合わせ\n15:00 書類提出\nよろしくお願いします！",
  status: "予約",
}));

export default function ReservationListPage() {
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  return (
    <div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
      >
        <thead>
          <tr>
            <th style={thStyle}>送信時間</th>
            <th style={thStyle}>個人</th>
            <th style={thStyle}>グループ</th>
            <th style={thStyle}>メッセージ内容</th>
            <th style={thStyle}>状態</th>
            <th style={thStyle}>修正</th>
            <th style={thStyle}>削除</th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((row) => (
            <tr key={row.id}>
              <td style={tdStyle}>{row.time}</td>
              <td style={tdStyle}>{row.user}</td>
              <td style={tdStyle}>{row.group}</td>
              <td
                style={{ ...tdStyle, cursor: "pointer" }}
                onClick={() => setSelectedMessage(row.message)}
              >
                {row.message.length > 30
                  ? row.message.slice(0, 30) + "..."
                  : row.message}
              </td>
              <td style={tdStyle}>{row.status}</td>
              <td style={tdStyle}>
                <button style={editBtn}>修正</button>
              </td>
              <td style={tdStyle}>
                <button style={deleteBtn}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ==== モーダル ==== */}
      {selectedMessage && (
        <div style={modalOverlay} onClick={() => setSelectedMessage(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            {/* 💚 ヘッダー追加部分 */}
            <div style={modalHeader}>
              <h3 style={modalTitle}>メッセージ全文</h3>
            </div>

            {/* 本文部分 */}
            <div style={modalContent}>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                {selectedMessage}
              </pre>
            </div>

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button
                style={modalCloseBtn}
                onClick={() => setSelectedMessage(null)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
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
  background: "rgb(17,141,255)",
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

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalBox: React.CSSProperties = {
  background: "#fff",
  borderRadius: "8px",
  maxWidth: "500px",
  width: "90%",
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  overflow: "hidden",
  paddingBottom: "15px",
};

const modalHeader: React.CSSProperties = {
  backgroundColor: "rgb(7, 181, 59)",
  color: "#fff",
  padding: "10px 0",
  textAlign: "center",
};

const modalTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "16px",
  fontWeight: "bold",
};

const modalContent: React.CSSProperties = {
  padding: "15px 20px",
  maxHeight: "300px",
  overflowY: "auto",
  fontSize: "15px",
  lineHeight: "1.8",
};

const modalCloseBtn: React.CSSProperties = {
  background: "rgb(17,141,255)",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  marginRight: "40px",
};
