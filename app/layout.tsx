// app/layout.tsx
export const metadata = {
  title: "UPLOAD@ 予約管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        {/* ===== 共通ヘッダ ===== */}
        <header
          style={{
            backgroundColor: "rgb(7, 181, 59)",
            padding: "14px",
            color: "#fff",
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          UPLOAD@ メッセージ要約
        </header>

        {/* ===== 各ページがここに入る ===== */}
        <main style={{ padding: "20px" }}>{children}</main>
      </body>
    </html>
  );
}
