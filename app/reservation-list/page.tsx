"use client";
import React from "react";

const dummyData = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  time: "2025-01-01 10:00",
  user: "田中",
  group: "営業部",
  message: "お疲れ様です。本日の予定です。",
  status: "予約",
}));

export default function ReservationListPage() {
  return (
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
            <td style={tdStyle}>{row.message}</td>
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
