"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "rgb(7, 181, 59)",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
    padding: "20px 40px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    width: "220px",
    transition: "0.2s",
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    gap: "40px",
    backgroundColor: "#f7f7f7",
  };

  return (
    <div style={containerStyle}>
      <button
        style={buttonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        onClick={() => router.push("/reservation")}
      >
        予約ページへ
      </button>

      <button
        style={buttonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        onClick={() => router.push("/reservation-list")}
      >
        予約一覧へ
      </button>
    </div>
  );
}
