import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { GoogleAuth } from "google-auth-library";

// Google Sheets ID
const SHEET_ID = process.env.SPREADSHEET_ID as string;

// POST Request 処理
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sendTime, personal, group, message } = body;

    if (!sendTime && !personal && !group && !message) {
      return NextResponse.json(
        { error: "項目を入力してください。" },
        { status: 400 }
      );
    }
    // else if (!personal && !group) {
    //   return NextResponse.json(
    //     { error: "宛先を入力してください。" },
    //     { status: 400 }
    //   );
    // } else if (!message) {
    //   return NextResponse.json(
    //     { error: "内容を入力してください。" },
    //     { status: 400 }
    //   );
    // }
    // Google認証Object生成
    const auth = new GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // シート接続
    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();

    // 最初にシート取得
    const sheet = doc.sheetsByIndex[0];

    // 新しい追加加
    await sheet.addRow({
      送信時間: sendTime || "",
      個人: personal || "",
      グループ: group || "",
      メッセージ内容: message || "",
      状態: "送信待機",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Google Sheets Error:", err);
    return NextResponse.json(
      { error: err.message || "Google Sheets書き込みエラー" },
      { status: 500 }
    );
  }
}
