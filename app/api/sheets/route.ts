import { google } from "googleapis";
import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { GoogleAuth } from "google-auth-library";

// 環境変数
const SHEET_ID = process.env.SPREADSHEET_ID as string;

/**
 * ✅ GET: スプレッドシートからデータ読み取り
 */
export async function GET() {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A1:F10", // 必要に応じて調整
    });

    console.log("📄 Spreadsheet Data:", res.data.values);

    return NextResponse.json(res.data.values || []);
  } catch (err: any) {
    console.error("❌ Spreadsheet 読み取りエラー:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/**
 * ✅ POST: スプレッドシートにデータを書き込み
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sendTime, personal, group, message } = body;

    if (!sendTime && !personal && !group && !message) {
      return NextResponse.json(
        { error: "必要なデータが不足しています。" },
        { status: 400 }
      );
    }

    const auth = new GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      送信時間: sendTime || "",
      個人: personal || "",
      グループ: group || "",
      メッセージ内容: message || "",
      状態: "送信待機",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Google Sheets 書き込みエラー:", err);
    return NextResponse.json(
      { error: err.message || "Google Sheets書き込みエラー" },
      { status: 500 }
    );
  }
}
