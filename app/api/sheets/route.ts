import { google } from "googleapis";

export async function GET() {
  try {
    // ✅ JWT 認証設定（オブジェクト構文で）
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // ✅ Spreadsheet からデータ取得
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "A1:F10", // 読みたい範囲
    });

    console.log("📄 Spreadsheet Data:", res.data.values);

    return new Response(JSON.stringify(res.data.values || []), { status: 200 });
  } catch (err) {
    console.error("❌ Spreadsheet 読み取りエラー:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
}
