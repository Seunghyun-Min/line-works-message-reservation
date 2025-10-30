import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { GoogleAuth } from "google-auth-library";

// Google Sheets ID
const SHEET_ID = process.env.SPREADSHEET_ID as string;

// POST 요청 처리
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

    // Google 인증 객체 생성
    const auth = new GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // 시트 접근
    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();

    // 첫 번째 시트를 가져옴
    const sheet = doc.sheetsByIndex[0];

    // 새 행 추가
    await sheet.addRow({
      送信時間: sendTime || "",
      個人: personal || "",
      グループ: group || "",
      メッセージ内容: message || "",
      登録日時: new Date().toLocaleString("ja-JP"),
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
