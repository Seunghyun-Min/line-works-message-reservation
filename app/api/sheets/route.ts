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
      range: "A1:F150",
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

/**
 * ✅ PATCH: 予約情報の更新
 * Body: { id, sendTime, personal, personalIds, group, message, status }
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, sendTime, personal, personalIds, group, message, status } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "予約IDが指定されていません。" },
        { status: 400 }
      );
    }

    // Google 認証
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // 現在のスプレッドシートデータを読み込む
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "A1:G150", // G列まで読み取る（個人ID用）
    });

    const rows = res.data.values || [];
    //const header = rows[0];
    const dataRows = rows.slice(1);

    // 対象行を検索（A列 = 予約ID）
    const targetIndex = dataRows.findIndex((row) => row[0] === id);

    if (targetIndex === -1) {
      return NextResponse.json(
        { error: `ID「${id}」が見つかりません。` },
        { status: 404 }
      );
    }

    const rowNumber = targetIndex + 2; // ヘッダー行分を考慮して +2
    const oldRow = dataRows[targetIndex];

    const newPersonalIds =
      Array.isArray(personalIds) && personalIds.length > 0
        ? personalIds.join(",")
        : oldRow[6] || ""; // ← ここが重要

    // 更新するデータ
    const updatedRow = [
      id,
      sendTime,
      personal,
      group,
      message,
      status,
      newPersonalIds,
    ];

    // シートの該当行を更新
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `A${rowNumber}:G${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [updatedRow],
      },
    });

    return NextResponse.json({ success: true, updated: updatedRow });
  } catch (err: any) {
    console.error("❌ PATCH エラー:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
