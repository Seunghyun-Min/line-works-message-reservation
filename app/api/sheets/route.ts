import { google } from "googleapis";
import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { GoogleAuth } from "google-auth-library";
import { randomUUID } from "crypto";

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
      range: "A1:F150", // 列が6個想定（予約ID,送信時間,個人,グループ,メッセージ内容,状態）
    });
    const visibleValues = res.data.values?.map((row) => row.slice(1)) || [];

    return NextResponse.json(visibleValues);

    //console.log("📄 Spreadsheet Data:", res.data.values);

    //return NextResponse.json(res.data.values || []);
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
    const { sendTime, personal, personalIds, group, message } = body;

    // --- 入力バリデーション ---
    if (!sendTime) {
      return NextResponse.json(
        { error: "送信時間を選択してください。" },
        { status: 400 }
      );
    } else if (!personal && !group) {
      return NextResponse.json(
        { error: "宛先を入力してください。" },
        { status: 400 }
      );
    } else if (personal && group) {
      return NextResponse.json(
        { error: "宛先は個人かグループのどちらかのみ選択してください。" },
        { status: 400 }
      );
    } else if (!message) {
      return NextResponse.json(
        { error: "メッセージ内容を入力してください。" },
        { status: 400 }
      );
    }

    // --- UUID生成 ---
    const reservationId = randomUUID();

    // --- Google Sheets 認証 ---
    const auth = new GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    // --- 新規行を追加 ---
    await sheet.addRow({
      予約ID: reservationId,
      送信時間: sendTime || "",
      個人: personal || "",
      グループ: group || "",
      メッセージ内容: message || "",
      状態: "送信待機",
      ユーザーID: Array.isArray(personalIds) ? personalIds.join(",") : "",
    });

    return NextResponse.json({ success: true, reservationId });
  } catch (err: any) {
    console.error("❌ Google Sheets 書き込みエラー:", err);
    return NextResponse.json(
      { error: err.message || "Google Sheets書き込みエラー" },
      { status: 500 }
    );
  }
}
