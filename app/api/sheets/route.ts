import { google } from "googleapis";
import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { GoogleAuth } from "google-auth-library";
import { randomUUID } from "crypto";

const SHEET_ID = process.env.SPREADSHEET_ID as string;

// --- スプレッドシート行の型 ---
type SheetRow = {
  予約ID: string;
  送信時間: string;
  個人: string;
  グループ: string;
  メッセージ内容: string;
  状態: string;
  ユーザーID: string;
};

/**
 * ✅ GET: スプレッドシートからデータ読み取り
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A1:G150",
    });

    const rows = res.data.values || [];

    // A列（予約ID）を含めてオブジェクト化
    const data = rows.slice(1).map((row) => ({
      id: row[0], // A列 = 予約ID
      time: row[1], // B列 = 送信時間
      targetUser: row[2], // C列 = 個人
      targetGroup: row[3], // D列 = グループ
      message: row[4], // E列 = メッセージ内容
      status: row[5], // F列 = 状態
      userIds: row[6]?.split(",") || [],
    }));

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("❌ Spreadsheet 読み取りエラー:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/* --- 以下 POST / PATCH は maekawa のコードをそのまま残す --- */
